import Phase from './phase';
import Morph from './morph';
import { NodeGroup, LinkGroup } from './group';

// Recalculates node and link positions every simulation tick
function ticked(nodeContainer, linkContainer) {
  nodeContainer
    .attr('transform', d => `translate(${d.x},${d.y})`)
    .attr('x', d => d.x)
    .attr('y', d => d.y);

  linkContainer.select('line')
    .attr('x1', d => d.source.x)
    .attr('y1', d => d.source.y)
    .attr('x2', d => d.target.x)
    .attr('y2', d => d.target.y);

  linkContainer.select('text').attr('transform', (d, i) => `translate(${(d.source.x + d.target.x) / 2},${(d.source.y + d.target.y) / 2})`);
}

class Network {
  constructor(query, settings) {
    /* global document */
    this.container = (typeof query === 'string') ? document.querySelectorAll(query)[0] : query;

    this.data = { nodes: [], links: [] };
    this.dataLoaded = false; // Whether the data has been loaded into this.data
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
    this.settings = {};
    // Default styles for each element
    this.defaultNodeStyles = {};
    this.defaultLinkStyles = {};
    // Default elements' event handlers
    this.defaultVizEventHandlers = {};
    this.defaultNodeEventHandlers = {};
    this.defaultNodeEventHandlers = {};

    this.initSettings(settings);
    this.initStyles();
    this.initEventHandlers();

    // Settings that force a re-rendering of the entire simulation
    this.forceRerender = new Set(['zoom', 'gravity', 'charge', 'linkStrength', 'linkDistance', 'static']);

    // Debug flag
    this.debug = true;

    // Viz state
    this.state = {};

    this.log('Network Constructed');

    this.render();
  }

  // Binds data to the viz
  // TODO: Fix this? (see issue #19)
  data(data) {
    this.bindData(data);
    if (this.data != null && !this.dataBound) {
      this.dataLoaded = true;
    }
    this.dataBound = true;

    this.generateAdjacencyList(data);

    if (this.settings.static) {
      for (let i = 0, n = Math.ceil(Math.log(this.simulation.alphaMin())
        / Math.log(1 - this.simulation.alphaDecay())); i < n; i += 1) {
        ticked(this.nodeContainers, this.linkContainers);
      }
    }

    // Update "all" groups
    // QUESTION: Should duplicate constructor calls cause group reevaluation?
    this.nodeGroup('all', '');
    this.linkGroup('all', '');

    // Update default styles for all elements
    this.initStyles();

    this.log('Bound data to viz');
  }

  // Updates or returns the current viz state
  state(updatedState) {
    if (updatedState === undefined) return this.state;
    updatedState.keys().forEach((key) => {
      this.state[key] = updatedState[key];
    });
    return null;
  }

  // Updates or returns the current viz settings
  settings(updatedSettings) {
    if (updatedSettings === undefined) return this.settings;

    const changedSettings = new Set();
    updatedSettings.keys().forEach((key) => {
      // Check for update in settings dict
      if (key in this.settings && this.settings[key] !== updatedSettings[key]) {
        this.settings[key] = updatedSettings[key];
        changedSettings.add(key);
      }
    });

    // If any changed settings require a rerender, call reset()
    if ([...changedSettings].filter(x => this.forceRerender.has(x)).length > 0) {
      this.reset();
    } else {
      this.bindData(this.data);
    }
    return null;
  }

  // Create settings, styles, and event handler dictionaries
  initSettings(settings) {
    // Default settings
    this.settings = {
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

    settings.keys().forEach((attr) => {
      this.settings[attr] = settings[attr];
    });
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
    /* global d3 d */
    this.defaultVizEventHandlers = {
      // Container right click handler (outside nodes)
      // TODO: Remove d?
      containerContextmenu(d) {
        d3.event.preventDefault(); // Prevent context menu from appearing
      },
      // Container zoom handler
      containerZoom() {
        this.g.node().setAttribute('transform', d3.event.transform);
      },
    };

    // Default node element event handlers
    this.defaultNodeEventHandlers = {
      // Node mouseover handler
      nodeMouseover(d) {
        // Default: add blue border
        d3.select(this.childNodes[0]).style('stroke', '#7DABFF').style('stroke-width', '3px');
      },
      // Node mouseout handler
      nodeMouseout(d) {
        // Default: remove blue border
        d3.select(this.childNodes[0]).style('stroke', '#F7F6F2').style('stroke-width', '.8');
      },
      // Node mousedown handler
      nodeMousedown(d) {
        // Unpin node if middle click
        if (d3.event.which === 2) {
          d3.select(this).classed('fixed', d.fixed = false);
          d.fx = null;
          d.fy = null;
        }
      },
      // Node left click handler
      nodeClick(d) {
        const currentColor = d3.select(this.childNodes[0]).style('fill');
        const defaultColor = 'rgb(51, 51, 51)';
        const newColor = currentColor === defaultColor ? '#63B2D4' : defaultColor;
        d3.select(this.childNodes[0]).style('fill', newColor);
      },
      // Node double left click handler
      nodeDblclick(d) {
        this.log('Double click');
      },
      // Node right click handler
      nodeContextmenu(d) {
        this.log('Right click');
      },
      // Container drag start handler
      nodeDragStart(d) {
        this.log('Drag start');
        if (!d3.event.active) this.simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      },
      // Container drag handler
      nodeDrag(d) {
        this.log('Drag step');
        if (!this.settings.static) {
          d.fx = d3.event.x;
          d.fy = d3.event.y;
        } else {
          // TODO: This is abominable (yet performant enough)
          // The root of the problem is that d3.select(d).node() returns a
          // selection of the data, not the elements
          // This means the only way to obtain the element associated with the
          // data is to manually search for it
          // Is this due to how data is bound to elements in this.nodeContainers?
          // NOTE: Another stopgap solution is assigning ids to each element
          // corresponding with data ids
          // let newX;
          // let newY;
          // for (const nodeContainer of this.nodeContainers.groups[0]) {
          //     if (d3.select(nodeContainer).data()[0].id == d.id) {
          //         newX = d3.event.x - d.x;
          //         newY = d3.event.y - d.y;
          //         d3.select(nodeContainer)
          //             .attr("transform", function(d) { return "translate(" +
          // newX + "," + newY + ")"; });
          //         nodeContainer.x = newX;
          //         nodeContainer.y = newY;
          //         return;
          //     }
          // }
          // for (const linkContainer of this.linkContainers.groups[0]) {
          //     if (d3.select(linkContainer).data()[0].source.id == d.id ||
          //         d3.select(linkContainer).data()[0].target.id == d.id) {
          //         d3.select(linkContainer.childNodes[0])
          //             .attr("x1", function(d) { return 0; })
          //             .attr("y1", function(d) { return 0; })
          //             .attr("x2", function(d) { return 100; })
          //             .attr("y2", function(d) { return 100; });
          //         d3.select(linkContainer.childNodes[1]).attr('transform', function(d, i) {
          //             return "translate(" + ((d.source.x + d.target.x) / 2) +
          // "," + ((d.source.y + d.target.y) / 2) + ")"
          //         });
          //     }
          // }
        }
      },
      // Container drag end handler
      nodeDragEnd(d) {
        if (!d3.event.active) this.simulation.alphaTarget(0);
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
      console.log(message);
    }
  }

  warn(message) {
    if (this.debug) {
      console.warn(message);
    }
  }

  // Renders viz element in container
  render() {
    this.containerWidth = this.container.getBoundingClientRect().width;
    this.containerHeight = this.container.getBoundingClientRect().height;

    // Adds svg box and allows it to resize / zoom as needed
    this.svg = d3.select(this.container).append('svg')
      .attr('id', 'phase-network')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${Math.min(this.containerWidth, this.containerHeight)} ${Math.min(this.containerWidth, this.containerHeight)}`)
      .attr('preserveAspectRatio', 'xMinYMin')
      .on('contextmenu', this.defaultVizEventHandlers.containerContextmenu)
      .call(d3.zoom()
        .scaleExtent(this.settings.zoom ? [0.1, 10] : [1, 1])
        .on('zoom', this.defaultVizEventHandlers.containerZoom.bind(this)))
      .on('dblclick.zoom', null); // Don't zoom on double left click

    // TODO: What is this TODO for?
    this.container.appendChild(this.svg.node());

    // Creates actual force graph container (this is what actually gets resized as needed)
    this.g = this.svg.append('g');

    this.simulation = d3.forceSimulation()
      .force('link', d3.forceLink().id(d => d.id).distance(this.settings.linkDistance).strength(this.settings.linkStrength))
      .force('charge', d3.forceManyBody().strength(this.settings.charge))
      .force('centerX', d3.forceX(this.containerWidth / 2).strength(this.settings.gravity))
      .force('centerY', d3.forceY(this.containerHeight / 2).strength(this.settings.gravity));

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

    this.bindData(this.data);

    // Initializes simulation
    this.simulation
      .nodes(this.data.nodes)
      .force('link')
      .links(this.data.links);

    // If the visualization is static, stop the simulation
    if (this.settings.static) {
      this.simulation.stop();
    } else {
      this.simulation.on('tick', () => ticked(this.nodeContainers, this.linkContainers));
    }

    // Rebind all previous groups to new svg and save style
    this.nodeGroups.keys().forEach((key) => {
      const ng = this.nodeGroups[key];
      const newGroup = this.nodeGroup(ng.label, ng.filterer);
      newGroup.setStyle(ng.getStyle());
    });
    this.linkGroups.keys().forEach((key) => {
      const lg = this.linkGroups[key];
      const newGroup = this.linkGroup(lg.label, lg.filterer);
      newGroup.setStyle(lg.getStyle());
    });

    this.log(`Rendered on ${this.container.id}`);
  }

  // GRAPH STORE


  // Creates a dict containing children of each node
  generateAdjacencyList(data) {
    const { links } = data;
    const { nodes } = data;

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


  // Binds new data to the network
  bindData(data) {
    // Assign new data
    this.data = data;

    this.bindNodes();
    this.bindLinks();

    // Rebind data and restart simulation
    this.simulation
      .nodes(this.data.nodes)
      .force('link').links(this.data.links);
    this.simulation.alpha(1).restart();
  }

  // Binds new data to the nodes
  bindNodes() {
    // Rejoin node data
    this.nodeContainers = this.nodeContainers.data(this.data.nodes, d => d.id);

    // Remove old nodes
    if (this.nodeContainers.exit().groups[0].length > 0) {
      this.bindNodesRemove();
    }

    // Add new nodes
    let newNodes = this.nodeContainers;
    if (this.nodeContainers.enter().groups[0].length > 0) {
      newNodes = this.bindNodesAdd();
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
      .attr('class', 'node')
      .on('mouseover', this.defaultNodeEventHandlers.nodeMouseover)
      .on('mouseout', this.defaultNodeEventHandlers.nodeMouseout)
      .on('mousedown', this.defaultNodeEventHandlers.nodeMousedown)
      .on('click', this.defaultNodeEventHandlers.nodeClick)
      .on('dblclick', this.defaultNodeEventHandlers.nodeDblclick.bind(this))
      .on('contextmenu', this.defaultNodeEventHandlers.nodeContextmenu.bind(this))
      .call(d3.drag()
        .on('start', this.defaultNodeEventHandlers.nodeDragStart.bind(this))
        .on('drag', this.defaultNodeEventHandlers.nodeDrag.bind(this))
        .on('end', this.defaultNodeEventHandlers.nodeDragEnd.bind(this)));

    // Update circles
    this.nodeContainers
      .select('circle')
      .style('r', this.defaultNodeStyles.r)
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
    this.linkContainers = this.linkContainers.data(this.data.links, d => d.source.id + d.target.id);

    // Remove old links
    if (this.linkContainers.exit().groups[0].length > 0) {
      this.bindLinksRemove();
    }

    // Add new links
    let newLinks = this.linkContainers;
    if (this.linkContainers.enter().groups[0].length > 0) {
      newLinks = this.bindLinksAdd();
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

    // Add new link containers
    newLinks
      .attr('class', 'link');

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
} // End Network Class

/* global window */
window.phase = {
  Network(query, settings) {
    return new Network(query, settings);
  },
};
