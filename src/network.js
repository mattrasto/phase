import {
  event,
  select,
  zoom,
  forceSimulation,
  forceLink,
  forceManyBody,
  forceX,
  forceY,
  drag,
} from 'd3';
import Phase from './phase';
import Morph from './morph';
import { InvalidFormatError } from './error';
import { NodeGroup, LinkGroup } from './group';

class Network {
  constructor(query, settings) {
    /* global document */
    this.container = (typeof query === 'string') ? document.querySelectorAll(query)[0] : query;

    this.networkData = { nodes: [], links: [] };
    this.dataLoaded = false; // Whether the data has been loaded into this.networkData
    this.dataBound = false; // Whether the data has been bound to objects (this
    // changes the structure of link references)

    // Elements
    this.svg = null;
    this.g = null;
    this.simulation = null;

    // Visualization properties
    this.containerWidth = 0;
    this.containerHeight = 0;

    this.nodeGroups = {};
    this.linkGroups = {};

    this.morphs = {};
    this.phases = {};

    // Internal store of graph structure as adjacency list
    this.adjList = {};

    // Settings (user-accessible)
    this.networkSettings = {};
    // Default styles for each element
    this.defaultNodeStyles = {};
    this.defaultLinkStyles = {};
    // Default elements' event handlers
    this.defaultVizEventHandlers = {};
    this.defaultNodeEventHandlers = {};
    this.defaultLinkEventHandlers = {};

    this.initSettings(settings);
    this.initStyles();
    this.initEventHandlers();

    // Settings that force a re-rendering of the entire simulation
    this.forceRerender = new Set(['zoom', 'gravity', 'charge', 'linkStrength', 'linkDistance', 'static']);

    // Debug flag
    this.debug = true;

    // Viz state
    this.networkState = {};

    this.log('Network Constructed');

    this.render();
  }

  // Updates or returns the current viz state
  state(updatedState) {
    if (updatedState === undefined) return this.networkState;
    Object.keys(updatedState).forEach((key) => {
      this.networkState[key] = updatedState[key];
    });
    return null;
  }

  // Updates or returns the current viz settings
  settings(updatedSettings) {
    if (updatedSettings === undefined) return this.networkSettings;

    const changedSettings = new Set();
    Object.keys(updatedSettings).forEach((key) => {
      // Check for update in settings dict
      if (key in this.networkSettings && this.networkSettings[key] !== updatedSettings[key]) {
        this.networkSettings[key] = updatedSettings[key];
        changedSettings.add(key);
      }
    });

    // If any changed settings require a rerender, call reset()
    if ([...changedSettings].filter(x => this.forceRerender.has(x)).length > 0) {
      this.reset();
    } else {
      this.bindData(this.networkData);
    }
    return null;
  }

  // Create settings, styles, and event handler dictionaries
  initSettings(settings) {
    // Default settings
    this.networkSettings = {
      // Strength of links (how easily they can be compressed) between nodes [0, INF]
      linkStrength: 1,
      // Distance between nodes [0, INF]
      linkDistance: 60,
      // Charge between nodes [-INF, INF]
      charge: -800,
      // How easily particles are dragged across the screen [0, 1]
      friction: 0.8,
      // Gravity force strength [0, 1]
      gravity: 0.25,
      // Whether the user can zoom
      zoom: true,
      // Whether the network repositions elements every viz tick
      // This mode provides a significant performance boost for large networks
      static: false,
    };

    if (settings) {
      Object.keys(settings).forEach((attr) => {
        this.networkSettings[attr] = settings[attr];
      });
    }
  }

  initStyles() {
    // Default element styles
    this.defaultNodeStyles = {
      // Node size
      r: 10,
      // Node fill color
      fill: '#333',
      // Node border color
      stroke: '#F7F6F2',
      // Node border width
      'stroke-width': 0.8,
    };

    this.defaultLinkStyles = {
      // Link type (solid, dash array, etc.)
      'stroke-dasharray': '',
      // Link color
      stroke: '#666',
      // Link width
      'stroke-width': 1.5,
    };
  }

  initEventHandlers() {
    this.defaultVizEventHandlers = {
      // Container right click handler (outside nodes)
      containerContextmenu() {
        event.preventDefault(); // Prevent context menu from appearing
      },
      // Container zoom handler
      containerZoom() {
        this.g.node().setAttribute('transform', event.transform);
      },
    };

    // Default node element event handlers
    this.defaultNodeEventHandlers = {
      // Node mouseover handler
      nodeMouseover() {
        // Default: add blue border
        select(this.childNodes[0]).style('stroke', '#7DABFF').style('stroke-width', '3px');
      },
      // Node mouseout handler
      nodeMouseout() {
        // Default: remove blue border
        select(this.childNodes[0]).style('stroke', '#F7F6F2').style('stroke-width', '.8');
      },
      // Node mousedown handler
      nodeMousedown(d) {
        // Unpin node if middle click
        if (event.which === 2) {
          select(this).classed('fixed', d.fixed = false); // eslint-disable-line
          d.fx = null; // eslint-disable-line no-param-reassign
          d.fy = null; // eslint-disable-line no-param-reassign
        }
      },
      // Node left click handler
      nodeClick() {
        const currentColor = select(this.childNodes[0]).style('fill');
        const defaultColor = 'rgb(51, 51, 51)';
        const newColor = currentColor === defaultColor ? '#63B2D4' : defaultColor;
        select(this.childNodes[0]).style('fill', newColor);
      },
      // Node double left click handler
      nodeDblclick() {
        this.log('Double click');
      },
      // Node right click handler
      nodeContextmenu() {
        this.log('Right click');
      },
      // Container drag start handler
      nodeDragStart(d) {
        this.log('Drag start');
        if (!this.networkSettings.static) {
          if (!event.active) this.simulation.alphaTarget(0.3).restart();
          d.fx = d.x; // eslint-disable-line no-param-reassign
          d.fy = d.y; // eslint-disable-line no-param-reassign
        }
      },
      // Container drag handler
      nodeDrag(d) {
        this.log('Drag step');
        if (!this.networkSettings.static) {
          d.fx = event.x; // eslint-disable-line no-param-reassign
          d.fy = event.y; // eslint-disable-line no-param-reassign
        } else {
          d.x = event.x; // eslint-disable-line no-param-reassign
          d.y = event.y; // eslint-disable-line no-param-reassign
          d.fx = event.x; // eslint-disable-line no-param-reassign
          d.fy = event.y; // eslint-disable-line no-param-reassign

          // Move node
          const nodeIdSelector = `#phase-node-${d.id}`.replace(/(:|\.|\[|\]|,|=|@)/g, '\\$1');
          const node = select(nodeIdSelector);
          if (node._groups[0][0] === null) { // eslint-disable-line no-underscore-dangle
            this.warn(`Node not found: ${nodeIdSelector}`);
          }
          node
            .attr('x', d.fx)
            .attr('y', d.fy)
            .attr('transform', `translate(${d.fx},${d.fy})`);

          // Move link endpoints
          const neighbors = this.adjList[d.id];
          neighbors.forEach((neighbor) => {
            const sourceLinkIdSelector = `phase-link-${d.id}->${neighbor}`.replace(/(:|\.|\[|\]|,|=|@)/g, '\\$1');
            // If this node is the source, move x1 and y1
            let link = select(`[id="${sourceLinkIdSelector}"]`);
            if (link._groups[0][0] !== null) { // eslint-disable-line no-underscore-dangle
              link.select('line')
                .attr('x1', event.x)
                .attr('y1', event.y);
            } else { // If this node is the target, move x2 and x2
              const targetLinkIdSelector = `phase-link-${neighbor}->${d.id}`.replace(/(:|\.|\[|\]|,|=|@)/g, '\\$1');
              link = select(`[id="${targetLinkIdSelector}"]`);
              if (!this.debug) {
                // If link is not found, fail gracefully
                if (link._groups[0][0] === null) { // eslint-disable-line no-underscore-dangle
                  this.warn(`Link not found: #${sourceLinkIdSelector} or #${targetLinkIdSelector}`);
                  return;
                }
              }
              link.select('line')
                .attr('x2', event.x)
                .attr('y2', event.y);
            }
          });
        }
      },
      // Container drag end handler
      nodeDragEnd() {
        if (!event.active) this.simulation.alphaTarget(0);
      },
    };

    this.defaultLinkEventHandlers = {};
  }

  // Resets the network to initial rendered state
  // TODO
  reset() {
    this.svg.node().outerHTML = '';
    this.render();
  }

  // Reset graph to default styles
  unstyleGraph() {
    this.getNodeGroup('all').unstyle();
    this.getLinkGroup('all').unstyle();
  }

  log(message) {
    if (this.debug) {
      console.log(message); // eslint-disable-line no-console
    }
  }

  warn(message) {
    if (this.debug) {
      console.warn(message); // eslint-disable-line no-console
    }
  }

  // Renders viz element in container
  render() {
    this.containerWidth = this.container.getBoundingClientRect().width;
    this.containerHeight = this.container.getBoundingClientRect().height;

    // Adds svg box and allows it to resize / zoom as needed
    this.svg = select(this.container).append('svg')
      .attr('id', 'phase-network')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${Math.min(this.containerWidth, this.containerHeight)} ${Math.min(this.containerWidth, this.containerHeight)}`)
      .attr('preserveAspectRatio', 'xMinYMin')
      .on('contextmenu', this.defaultVizEventHandlers.containerContextmenu)
      .call(zoom()
        .scaleExtent(this.networkSettings.zoom ? [0.1, 10] : [1, 1])
        .on('zoom', this.defaultVizEventHandlers.containerZoom.bind(this)))
      .on('dblclick.zoom', null); // Don't zoom on double left click

    // TODO: What is this TODO for?
    this.container.appendChild(this.svg.node());

    // Creates actual force graph container (this is what actually gets resized as needed)
    this.g = this.svg.append('g');

    this.simulation = forceSimulation()
      .force('link', forceLink().id(d => d.id).distance(this.networkSettings.linkDistance).strength(this.networkSettings.linkStrength))
      .force('charge', forceManyBody().strength(this.networkSettings.charge))
      .force('centerX', forceX(this.containerWidth / 2).strength(this.networkSettings.gravity))
      .force('centerY', forceY(this.containerHeight / 2).strength(this.networkSettings.gravity));

    // Creates g container for link containers
    this.linkContainerG = this.g.append('g')
      .attr('class', 'links');

    // Appends links to link g container
    this.linkContainers = this.linkContainerG
      .selectAll('g');

    // Creates g container for node containers
    this.nodeContainerG = this.g.append('g')
      .attr('class', 'nodes');

    // Adds node containers to node g container
    this.nodeContainers = this.nodeContainerG
      .selectAll('g');

    this.bindData(this.networkData);

    // Initializes simulation
    this.simulation
      .nodes(this.networkData.nodes)
      .force('link')
      .links(this.networkData.links);

    // If the visualization is static, stop the simulation
    if (this.networkSettings.static) {
      this.simulation.stop();
    } else {
      this.simulation.on('tick', () => this.ticked(this.nodeContainers, this.linkContainers));
    }

    // Rebind all previous groups to new svg and save style
    Object.keys(this.nodeGroups).forEach((key) => {
      const ng = this.nodeGroups[key];
      const newGroup = this.nodeGroup(ng.label, ng.filterer);
      newGroup.setStyle(ng.getStyle());
    });
    Object.keys(this.linkGroups).forEach((key) => {
      const lg = this.linkGroups[key];
      const newGroup = this.linkGroup(lg.label, lg.filterer);
      newGroup.setStyle(lg.getStyle());
    });

    this.log(`Rendered on ${this.container.id}`);
  }

  // Recalculates node and link positions every simulation tick
  ticked(nodeContainer, linkContainer) { // eslint-disable-line class-methods-use-this
    nodeContainer
      .attr('transform', d => `translate(${d.x},${d.y})`)
      .attr('x', d => d.x)
      .attr('y', d => d.y);

    linkContainer.select('line')
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y);

    linkContainer.select('text').attr('transform', d => `translate(${(d.source.x + d.target.x) / 2},${(d.source.y + d.target.y) / 2})`);
  }


  // GROUPING


  // Creates a new node group
  nodeGroup(label, filterer, val) {
    if (label in this.nodeGroups) {
      this.warn(`Node group ${label} is being overwritten`, this.nodeGroups[label]);
    }
    const group = new NodeGroup(this, label, filterer, val);
    this.nodeGroups[label] = group;
    return group;
  }

  getNodeGroup(label) {
    return this.nodeGroups[label];
  }

  getAllNodeGroups() {
    return this.nodeGroups;
  }

  // Creates a new link group
  linkGroup(label, filterer, val) {
    if (label in this.linkGroups) {
      this.warn(`Link group ${label} is being overwritten`, this.linkGroups[label]);
    }
    const group = new LinkGroup(this, label, filterer, val);
    this.linkGroups[label] = group;
    return group;
  }

  getLinkGroup(label) {
    return this.linkGroups[label];
  }

  getAllLinkGroups() {
    return this.linkGroups;
  }


  // PHASES AND MORPHS


  morph(label, type, change) {
    if (label in this.morphs) {
      this.warn(`Morph ${label} is being overwritten`, this.morphs[label]);
    }
    const morph = new Morph(this, label, type, change);
    this.morphs[label] = morph;
    return morph;
  }

  getMorph(label) {
    return this.morphs[label];
  }

  getAllMorphs() {
    return this.morphs;
  }

  phase(label) {
    if (label in this.phases) {
      this.warn(`Phase ${label} is being overwritten`, this.phases[label]);
    }
    const phase = new Phase(this, label);
    this.phases[label] = phase;
    return phase;
  }

  getPhase(label) {
    return this.phases[label];
  }

  getAllPhases() {
    return this.phases;
  }


  // DATA BINDING

  static validateData(data) {
    const validFormat = Array.isArray(data.nodes) && Array.isArray(data.links);

    const seen = new Set();

    if (validFormat) {
      data.nodes.forEach((node) => {
        if (!node.id || seen.has(node.id)) {
          throw new InvalidFormatError('Node has a duplicate or undefined id');
        }
        seen.add(node.id);
      });
      data.links.forEach((link) => {
        if (link.id !== undefined) return; // Seen this link already
        const source = this.dataBound ? link.source.id : link.source;
        const target = this.dataBound ? link.target.id : link.target;
        const validLink = source && target;
        if (!validLink || seen.has(`${source}-${target}`)) {
          throw new InvalidFormatError('Link has an undefined or duplicate source/target combo');
        }
        seen.add(`${source}-${target}`);
        seen.add(`${target}-${source}`);
      });
    } else {
      throw new InvalidFormatError("Data must be an object with arrays 'nodes' and 'links'");
    }
  }

  // Binds data to the viz
  data(rawData) {
    // Check for data integrity
    Network.validateData(rawData);

    // Auto-generate link ids
    const data = this.generateLinkIds(rawData);

    this.bindData(data);
    if (this.networkData != null && !this.dataBound) {
      this.dataLoaded = true;
    }
    this.dataBound = true;

    this.generateAdjacencyList(data);

    if (this.networkSettings.static) {
      for (let i = 0, n = Math.ceil(Math.log(this.simulation.alphaMin())
        / Math.log(1 - this.simulation.alphaDecay())); i < n; i += 1) {
        // Update element positions internally (modifies element data)
        this.simulation.tick();
      }
      // Update elements' html positions based on data positions
      this.ticked(this.nodeContainers, this.linkContainers);

      // View network rendered step-by-step
      // const intervalID = window.setInterval(() => {
      //   this.simulation.tick();
      //   console.log(this.simulation.alpha());
      //   this.ticked(this.nodeContainers, this.linkContainers);
      //   if (this.simulation.alpha() < 0.01) {
      //     clearInterval(intervalID);
      //   }
      // }, 100);
    }

    // Update "all" groups
    // QUESTION: Should duplicate constructor calls cause group reevaluation?
    this.nodeGroup('all', '');
    this.linkGroup('all', '');

    // Update default styles for all elements
    this.initStyles();

    this.log('Bound data to viz');
  }

  // Binds new data to the network
  bindData(data) {
    // Assign new data
    this.networkData = data;

    this.bindNodes();
    this.bindLinks();

    // Rebind data and restart simulation
    this.simulation
      .nodes(this.networkData.nodes)
      .force('link').links(this.networkData.links);
    this.simulation.alpha(0.5).restart();
  }

  // Binds new data to the nodes
  bindNodes() {
    // Rejoin node data
    this.nodeContainers = this.nodeContainers.data(this.networkData.nodes, d => d.id);

    // Remove old nodes
    // eslint-disable-next-line no-underscore-dangle
    if (this.nodeContainers._exit[0].length > 0) {
      this.bindNodesRemove();
      // eslint-disable-next-line no-underscore-dangle
      this.log(`Removed ${this.nodeContainers._exit[0].length} nodes`);
    }

    // Add new nodes
    let newNodes = this.nodeContainers;
    // eslint-disable-next-line no-underscore-dangle
    if (this.nodeContainers._enter[0].length > 0) {
      newNodes = this.bindNodesAdd();
      // eslint-disable-next-line no-underscore-dangle
      this.log(`Added ${this.nodeContainers._enter[0].length} nodes`);
    }

    // Merge enter and update selections
    this.nodeContainers = newNodes.merge(this.nodeContainers);

    // Update existing nodes
    this.bindNodesUpdate();
  }

  bindNodesRemove() {
    // Remove old nodes
    this.nodeContainers.exit().remove();
  }

  bindNodesAdd() {
    // Add new node containers to node g container
    const newNodes = this.nodeContainers
      .enter().append('g');

    // Assign class to node containers and randomize initial position near center
    newNodes
      .attr('class', 'node')
      .attr('id', d => (`phase-node-${d.id}`))
      .attr('x', (d) => {
        // eslint-disable-next-line no-param-reassign
        d.x = this.containerWidth / 2 + (Math.random() - 0.5) * 300;
        d.vx = 0; // eslint-disable-line no-param-reassign
        return d.x;
      })
      .attr('y', (d) => {
        // eslint-disable-next-line no-param-reassign
        d.y = this.containerHeight / 2 + (Math.random() - 0.5) * 300;
        d.vy = 0; // eslint-disable-line no-param-reassign
        return d.y;
      });

    // Add new circles
    newNodes
      .append('circle');

    // Add new labels
    newNodes
      .append('text');

    return newNodes;
  }

  bindNodesUpdate() {
    // Update containers
    this.nodeContainers
      .attr('x', (d) => {
        // eslint-disable-next-line no-param-reassign
        d.x = this.containerWidth / 2 + (Math.random() - 0.5) * 300;
        d.vx = 0; // eslint-disable-line
        return d.x;
      })
      .attr('y', (d) => {
        // eslint-disable-next-line no-param-reassign
        d.y = this.containerHeight / 2 + (Math.random() - 0.5) * 300;
        d.vy = 0; // eslint-disable-line
        return d.y;
      })
      .on('mouseover', this.defaultNodeEventHandlers.nodeMouseover)
      .on('mouseout', this.defaultNodeEventHandlers.nodeMouseout)
      .on('mousedown', this.defaultNodeEventHandlers.nodeMousedown)
      .on('click', this.defaultNodeEventHandlers.nodeClick)
      .on('dblclick', this.defaultNodeEventHandlers.nodeDblclick.bind(this))
      .on('contextmenu', this.defaultNodeEventHandlers.nodeContextmenu.bind(this))
      .call(drag()
        .on('start', this.defaultNodeEventHandlers.nodeDragStart.bind(this))
        .on('drag', this.defaultNodeEventHandlers.nodeDrag.bind(this))
        .on('end', this.defaultNodeEventHandlers.nodeDragEnd.bind(this)));

    // Update circles
    this.nodeContainers
      .select('circle')
      .attr('r', this.defaultNodeStyles.r)
      .style('fill', this.defaultNodeStyles.fill)
      .style('stroke', this.defaultNodeStyles.stroke)
      .style('stroke-width', this.defaultNodeStyles['stroke-width']);

    // Update labels
    this.nodeContainers
      .select('text')
      .attr('dx', 12)
      .attr('dy', '.35em')
      .style('fill', '#333')
      .style('stroke', '#333')
      .text(d => d.id);
  }

  // Binds new data to the links
  bindLinks() {
    // Rejoin link data
    this.linkContainers = (
      this.linkContainers.data(this.networkData.links, d => d.source.id + d.target.id)
    );

    // Remove old links
    // eslint-disable-next-line no-underscore-dangle
    if (this.linkContainers._exit[0].length > 0) {
      this.bindLinksRemove();
      // eslint-disable-next-line no-underscore-dangle
      this.log(`Removed ${this.linkContainers._exit[0].length} links`);
    }

    // Add new links
    let newLinks = this.linkContainers;
    // eslint-disable-next-line no-underscore-dangle
    if (this.linkContainers._enter[0].length > 0) {
      newLinks = this.bindLinksAdd();
      // eslint-disable-next-line no-underscore-dangle
      this.log(`Added ${this.linkContainers._enter[0].length} links`);
    }

    // Merge enter and update selections
    this.linkContainers = newLinks.merge(this.linkContainers);

    // Update existing links
    this.bindLinksUpdate();
  }

  bindLinksRemove() {
    // Remove old links
    this.linkContainers.exit().remove();
  }

  bindLinksAdd() {
    // Add new links to link g container
    const newLinks = this.linkContainers
      .enter().append('g');

    // Add class to link containers
    newLinks
      .attr('class', 'link')
      .attr('id', d => (`phase-link-${d.id}`));

    // Add new lines
    newLinks
      .append('line');

    // Add new labels
    newLinks
      .append('text');

    return newLinks;
  }

  bindLinksUpdate() {
    // Update lines
    this.linkContainers
      .select('line')
      .style('stroke', this.defaultLinkStyles.stroke)
      .style('stroke-width', this.defaultLinkStyles['stroke-width'])
      .style('stroke-dasharray', this.defaultLinkStyles['stroke-dasharray']);

    // Update labels
    this.linkContainers
      .select('text')
      .attr('dx', 5)
      .attr('dy', 0)
      .style('fill', '#333')
      .style('stroke', '#333')
      .style('stroke-width', 0)
      .style('font-size', '12px')
      .text(d => d.value);
  }


  // DATA OPERATIONS


  // Generate link ids where not specified in the data as 'source->target'
  generateLinkIds(rawData) { // eslint-disable-line class-methods-use-this
    rawData.links.forEach((link) => {
      if (link.id === undefined) {
        link.id = `${link.source}->${link.target}`; // eslint-disable-line no-param-reassign
      }
    });
    return rawData;
  }

  // Creates a dict containing children of each node
  generateAdjacencyList(data) {
    const { nodes, links } = data;

    this.adjList = {};
    nodes.forEach((node) => {
      this.adjList[node.id] = [];
    });
    links.forEach((link) => {
      const source = this.dataBound ? link.source.id : link.source;
      const target = this.dataBound ? link.target.id : link.target;
      this.adjList[source].push(target);
      this.adjList[target].push(source);
    });
  }

  getAdjacencyList() {
    return this.adjList;
  }
} // End Network Class

/* global window */
window.phase = {
  Network(query, settings) {
    return new Network(query, settings);
  },
};
