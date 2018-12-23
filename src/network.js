import Phase from './phase';
import Morph from './morph';
import {Group, NodeGroup, LinkGroup} from './group';

window.phase = {
    Network: function(query, settings) {
        return new Network(query, settings);
    }
};

class Network {
    constructor(query, settings) {

        this._container = (typeof query === "string") ? document.querySelectorAll(query)[0] : query;

        this._data = {"nodes": [], "links": []};
        this._dataLoaded = false; // Whether the data has been loaded into this._data
        this._dataBound = false; // Whether the data has been bound to objects (this changes the structure of link references)

        // Elements
        this._svg = null;
        this._g = null;
        this._simulation = null;

        // Visualization properties
        this._containerWidth = 0;
        this._containerHeight = 0;

        this._nodeGroups = {};
        this._linkGroups = {};

        this._morphs = {};
        this._phases = {};

        // Internal store of graph structure as adjacency list
        this._adjList = {};

        // Settings (user-accessible)
        this._settings = {};
        // Default styles for each element
        this._defaultNodeStyles = {};
        this._defaultLinkStyles = {};
        // Default elements' event handlers
        this._defaultVizEventHandlers = {};
        this._defaultNodeEventHandlers = {};
        this._defaultNodeEventHandlers = {};

        this.initSettings(settings);
        this.initStyles();
        this.initEventHandlers();

        // Settings that force a re-rendering of the entire simulation
        this._forceRerender = new Set(["zoom", "gravity", "charge", "linkStrength", "linkDistance", "static"]);

        // Viz state
        this._state = {};

        console.log("Network constructed");

        this._render();
    }

    // Binds data to the viz
    // TODO: Fix this? (see issue #19)
    data(data) {
        this._bindData(data);
        if (this._data != null && !this._dataBound) {
            this._dataLoaded = true;
        }
        this._dataBound = true;

        this._generateAdjacencyList(data);

        if (this._settings.static) {
            for (let i = 0, n = Math.ceil(Math.log(this._simulation.alphaMin()) / Math.log(1 - this._simulation.alphaDecay())); i < n; ++i) {
                this._ticked(this._nodeContainers, this._linkContainers);
            }
        }

        // Update "all" groups
        // QUESTION: Should duplicate constructor calls cause group reevaluation?
        this.nodeGroup("all", "");
        this.linkGroup("all", "");

        // Update default styles for all elements
        this.initStyles();

        console.log("Bound data to viz");
    }

    // Updates or returns the current viz state
    state(updatedState) {
        if (updatedState == undefined) return this._state;
        for (const key in updatedState) {
            this._state[key] = updatedState[key];
        }
    }

    // Updates or returns the current viz settings
    settings(updatedSettings) {
        if (updatedSettings == undefined) return this._settings;

        let changedSettings = new Set();
        for (const key in updatedSettings) {
            // Check for update in settings dict
            if (key in this._settings && this._settings[key] != updatedSettings[key]) {
                this._settings[key] = updatedSettings[key];
                changedSettings.add(key);
            }
        }

        // If any changed settings require a rerender, call reset()
        if ([...changedSettings].filter(x => this._forceRerender.has(x)).length > 0) {
            this.reset();
        }
        else {
            this._bindData(this._data);
        }
    }

    // Create settings, styles, and event handler dictionaries
    initSettings(settings) {
        // Default settings
        this._settings = {
            // Strength of links (how easily they can be compressed) between nodes [0, INF]
            linkStrength: 1,
            // Distance between nodes [0, INF]
            linkDistance: 60,
            // Charge between nodes [-INF, INF]
            charge: -800,
            // How easily particles are dragged across the screen [0, 1]
            friction: .8,
            // Gravity force strength [0, 1]
            gravity: .25,
            // Whether the user can zoom
            zoom: true,
            // Whether the network repositions elements every viz tick
            // This mode provides a significant performance boost for large networks
            static: false,
        }

        for (const attr in settings) {
            this._settings[attr] = settings[attr];
        }
    }

    initStyles() {
        // Default element styles
        this._defaultNodeStyles = {
            // Node size
            "r": 10,
            // Node fill color
            "fill": "#333",
            // Node border color
            "stroke": "#F7F6F2",
            // Node border width
            "stroke-width": .8,
        }

        this._defaultLinkStyles = {
            // Link type (solid, dash array, etc.)
            "stroke-dasharray": "",
            // Link color
            "stroke": "#666",
            // Link width
            "stroke-width": 1.5,
        }
    }

    initEventHandlers() {
        this._defaultVizEventHandlers = {
            // Container right click handler (outside nodes)
            containerContextmenu(d) {
                d3.event.preventDefault(); // Prevent context menu from appearing
            },
            // Container zoom handler
            containerZoom() {
                this._g.node().setAttribute("transform", d3.event.transform);
            },
        }

        // Default node element event handlers
        this._defaultNodeEventHandlers = {
            // Node mouseover handler
            nodeMouseover(d) {
                // Default: add blue border
                d3.select(this.childNodes[0]).style("stroke", "#7DABFF").style("stroke-width", "3px");
            },
            // Node mouseout handler
            nodeMouseout(d) {
                // Default: remove blue border
                d3.select(this.childNodes[0]).style("stroke", "#F7F6F2").style("stroke-width", ".8");
            },
            // Node mousedown handler
            nodeMousedown(d) {
                // Unpin node if middle click
                if (d3.event.which == 2) {
                    d3.select(this).classed("fixed", d.fixed = false);
                    d.fx = null;
                    d.fy = null;
                }
            },
            // Node left click handler
            nodeClick(d) {
                const currentColor = d3.select(this.childNodes[0]).style("fill");
                const defaultColor = 'rgb(51, 51, 51)';
                const newColor = currentColor === defaultColor ? "#63B2D4" : defaultColor;
                d3.select(this.childNodes[0]).style("fill", newColor);
            },
            // Node double left click handler
            nodeDblclick(d) {
                console.log("Double click");
            },
            // Node right click handler
            nodeContextmenu(d) {
                console.log("Right click");
            },
            // Container drag start handler
            nodeDragStart(d) {
                console.log("Drag start");
                if (!d3.event.active) this._simulation.alphaTarget(.3).restart();
                d.fx = d.x;
                d.fy = d.y;
            },
            // Container drag handler
            nodeDrag(d) {
                console.log("Drag step");
                if (!this._settings.static) {
                    d.fx = d3.event.x;
                    d.fy = d3.event.y;
                }
                else {
                    // TODO: This is abominable (yet performant enough)
                    // The root of the problem is that d3.select(d).node() returns a selection of the data, not the elements
                    // This means the only way to obtain the element associated with the data is to manually search for it
                    // Is this due to how data is bound to elements in this._nodeContainers?
                    // NOTE: Another stopgap solution is assigning ids to each element corresponding with data ids
                    // let newX;
                    // let newY;
                    // for (const nodeContainer of this._nodeContainers._groups[0]) {
                    //     if (d3.select(nodeContainer).data()[0].id == d.id) {
                    //         newX = d3.event.x - d.x;
                    //         newY = d3.event.y - d.y;
                    //         d3.select(nodeContainer)
                    //             .attr("transform", function(d) { return "translate(" + newX + "," + newY + ")"; });
                    //         nodeContainer.x = newX;
                    //         nodeContainer.y = newY;
                    //         return;
                    //     }
                    // }
                    // for (const linkContainer of this._linkContainers._groups[0]) {
                    //     if (d3.select(linkContainer).data()[0].source.id == d.id ||
                    //         d3.select(linkContainer).data()[0].target.id == d.id) {
                    //         d3.select(linkContainer.childNodes[0])
                    //             .attr("x1", function(d) { return 0; })
                    //             .attr("y1", function(d) { return 0; })
                    //             .attr("x2", function(d) { return 100; })
                    //             .attr("y2", function(d) { return 100; });
                    //         d3.select(linkContainer.childNodes[1]).attr('transform', function(d, i) {
                    //             return "translate(" + ((d.source.x + d.target.x) / 2) + "," + ((d.source.y + d.target.y) / 2) + ")"
                    //         });
                    //     }
                    // }
                }
            },
            // Container drag end handler
            nodeDragEnd(d) {
                if (!d3.event.active) this._simulation.alphaTarget(0);
            },
        }

        this._defaultLinkEventHandlers = {};
    }

    // Resets the network to initial rendered state
    // TODO
    reset() {
        this._svg.node().outerHTML = "";
        this._render();
    }

    // Reset graph to default styles
    unstyleGraph() {
        this.getNodeGroup("all").unstyle();
        this.getLinkGroup("all").unstyle();
    }

    // Renders viz element in container
    _render() {

        this._containerWidth = this._container.getBoundingClientRect().width;
        this._containerHeight = this._container.getBoundingClientRect().height;

        // Adds svg box and allows it to resize / zoom as needed
        this._svg = d3.select(this._container).append("svg")
            .attr("id", "phase-network")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("viewBox","0 0 " + Math.min(this._containerWidth, this._containerHeight) + " " + Math.min(this._containerWidth, this._containerHeight))
            .attr("preserveAspectRatio", "xMinYMin")
            .on("contextmenu", this._defaultVizEventHandlers.containerContextmenu)
            .call(d3.zoom()
                .scaleExtent(this._settings.zoom ? [.1, 10] : [1, 1])
                .on("zoom", this._defaultVizEventHandlers.containerZoom.bind(this))
            )
            .on("dblclick.zoom", null);  // Don't zoom on double left click

        // TODO: What is this TODO for?
        this._container.appendChild(this._svg.node());

        // Creates actual force graph container (this is what actually gets resized as needed)
        this._g = this._svg.append("g");

        this._simulation = d3.forceSimulation()
            .force("link", d3.forceLink().id(function(d) { return d.id; }).distance(this._settings.linkDistance).strength(this._settings.linkStrength))
            .force("charge", d3.forceManyBody().strength(this._settings.charge))
            .force('centerX', d3.forceX(this._containerWidth / 2).strength(this._settings.gravity))
            .force('centerY', d3.forceY(this._containerHeight / 2).strength(this._settings.gravity));

        // Creates g container for link containers
        this._linkContainerG = this._g.append("g")
            .attr("class", "links");

        // Appends links to link g container
        this._linkContainers = this._linkContainerG
            .selectAll("g");

        // Creates g container for node containers
        this._nodeContainerG = this._g.append("g")
            .attr("class", "nodes");

        // Adds node containers to node g container
        this._nodeContainers = this._nodeContainerG
            .selectAll("g");

        this._bindData(this._data);

        // Initializes simulation
        this._simulation
            .nodes(this._data.nodes)
            .force("link")
                .links(this._data.links);

        // If the visualization is static, stop the simulation
        if (this._settings.static) {
            this._simulation.stop();
        }
        else {
            this._simulation.on("tick", () => this._ticked(this._nodeContainers, this._linkContainers));
        }

        console.log("Rendered on " + this._container.id)
    }

    // Recalculates node and link positions every simulation tick
    _ticked(nodeContainer, linkContainer) {

        nodeContainer
            .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
            .attr("x", (d) => d.x)
            .attr("y", (d) => d.y);

        linkContainer.select("line")
            .attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });

        linkContainer.select("text").attr('transform', function(d, i) {
            return "translate(" + ((d.source.x + d.target.x) / 2) + "," + ((d.source.y + d.target.y) / 2) + ")"
        });
    }


    // GRAPH STORE


    // Creates a dict containing children of each node
    _generateAdjacencyList(data) {
        const links = data.links;
        const nodes = data.nodes;

        this._adjList = {};
        nodes.forEach(node => {
            this._adjList[node.id] = [];
        });
        links.forEach(link => {
            const source = this._dataBound ? link.source.id : link.source;
            const target = this._dataBound ? link.target.id : link.target;
            this._adjList[source].push(target);
            this._adjList[target].push(source);
        });
    }

    getAdjacencyList() {
        return this._adjList;
    }



    // GROUPING



    // Creates a new node group
    nodeGroup(label, filterer, val) {
        if (label in this._nodeGroups) {
            console.warn("Node group '" + label + "' already exists", this._nodeGroups[label]);
            return this._nodeGroups[label];
        }
        const group = new NodeGroup(this, label, filterer, val)
        this._nodeGroups[label] = group;
        return group;
    }

    getNodeGroup(label) {
        return this._nodeGroups[label];
    }

    getAllNodeGroups() {
        return this._nodeGroups;
    }

    // Creates a new node group
    linkGroup(label, filterer, val) {
        if (label in this._linkGroups) {
            console.warn("Link group '" + label + "' already exists", this._linkGroups[label]);
            return this._linkGroups[label];
        }
        const group = new LinkGroup(this, label, filterer, val)
        this._linkGroups[label] = group;
        return group;
    }

    getLinkGroup(label) {
        return this._linkGroups[label];
    }

    getAllLinkGroups() {
        return this._linkGroups;
    }



    // PHASES AND MORPHS

    morph(label, type, change) {
        if (label in this._morphs) {
            console.warn("Morph '" + label + "' already exists", this._morphs[label]);
            return this._morphs[label];
        }
        const morph = new Morph(this, label, type, change);
        this._morphs[label] = morph;
        return morph;
    }

    getMorph(label) {
        return this._morphs[label];
    }

    getAllMorphs() {
        return this._morphs;
    }

    phase(label) {
        if (label in this._phases) {
            console.warn("Phase '" + label + "' already exists", this._phases[label]);
            return this._phases[label];
        }
        const phase = new Phase(this, label);
        this._phases[label] = phase;
        return phase;
    }

    getPhase(label) {
        return this._phases[label];
    }

    getAllPhases() {
        return this._phases;
    }



    // DATA BINDING



    // Binds new data to the network
    _bindData(data) {
        // Assign new data
        this._data = data;

        this._bindNodes();
        this._bindLinks();

        // Rebind data and restart simulation
        this._simulation
            .nodes(this._data.nodes)
            .force("link").links(this._data.links);
        this._simulation.alpha(1).restart();
    }

    // Binds new data to the nodes
    _bindNodes() {
        // Rejoin node data
        this._nodeContainers = this._nodeContainers.data(this._data.nodes, function(d) {
            return d.id;
        });

        // Remove old nodes
        if (this._nodeContainers.exit()._groups[0].length > 0) {
            this._bindNodesRemove();
        }

        // Add new nodes
        let newNodes = this._nodeContainers;
        if (this._nodeContainers.enter()._groups[0].length > 0) {
            newNodes = this._bindNodesAdd();
        }

        // Merge enter and update selections
        this._nodeContainers = newNodes.merge(this._nodeContainers);

        // Update existing nodes
        this._bindNodesUpdate();
    }

    _bindNodesRemove() {
        // Remove old nodes
        this._nodeContainers.exit().remove();
    }

    _bindNodesAdd() {
        // Add new node containers to node g container
        let newNodes = this._nodeContainers
          .enter().append("g");

        // Add new circles
        newNodes
            .append("circle")

        // Add new labels
        newNodes
            .append("text")

        return newNodes;
    }

    _bindNodesUpdate() {
        // Update containers
        this._nodeContainers
            .attr("class", "node")
            .on("mouseover", this._defaultNodeEventHandlers.nodeMouseover)
            .on("mouseout", this._defaultNodeEventHandlers.nodeMouseout)
            .on("mousedown", this._defaultNodeEventHandlers.nodeMousedown)
            .on("click", this._defaultNodeEventHandlers.nodeClick)
            .on("dblclick", this._defaultNodeEventHandlers.nodeDblclick)
            .on("contextmenu", this._defaultNodeEventHandlers.nodeContextmenu)
            .call(d3.drag()
                .on("start", this._defaultNodeEventHandlers.nodeDragStart.bind(this))
                .on("drag", this._defaultNodeEventHandlers.nodeDrag.bind(this))
                .on("end", this._defaultNodeEventHandlers.nodeDragEnd.bind(this))
            );

        // Update circles
        this._nodeContainers
            .select("circle")
                .style("r", this._defaultNodeStyles["r"])
                .style("fill", this._defaultNodeStyles["fill"])
                .style("stroke", this._defaultNodeStyles["stroke"])
                .style("stroke-width", this._defaultNodeStyles["stroke-width"]);

        // Update labels
        this._nodeContainers
            .select("text")
                .attr("dx", 12)
                .attr("dy", ".35em")
                .style("fill", "#333")
                .style("stroke", "#333")
                .text(function(d) { return d.id; });
    }

    // Binds new data to the links
    _bindLinks() {
        // Rejoin link data
        this._linkContainers = this._linkContainers.data(this._data.links, function(d) {
            return d.source.id + d.target.id;
        });

        // Remove old links
        if (this._linkContainers.exit()._groups[0].length > 0) {
            this._bindLinksRemove();
        }

        // Add new links
        let newLinks = this._linkContainers;
        if (this._linkContainers.enter()._groups[0].length > 0) {
            newLinks = this._bindLinksAdd();
        }

        // Merge enter and update selections
        this._linkContainers = newLinks.merge(this._linkContainers);

        // Update existing links
        this._bindLinksUpdate();
    }

    _bindLinksRemove() {
        // Remove old links
        this._linkContainers.exit().remove();
    }

    _bindLinksAdd() {
        // Add new links to link g container
        let newLinks = this._linkContainers
            .enter().append("g");

        // Add new link containers
        newLinks
            .attr("class", "link")

        // Add new lines
        newLinks
            .append("line")

        // Add new labels
        newLinks
            .append("text")

        return newLinks;
    }

    _bindLinksUpdate() {
        // Update lines
        this._linkContainers
            .select("line")
            .style("stroke", this._defaultLinkStyles["stroke"])
            .style("stroke-width", this._defaultLinkStyles["stroke-width"])
            .style("stroke-dasharray", this._defaultLinkStyles["stroke-dasharray"])

        // Update labels
        this._linkContainers
            .select("text")
                .attr("dx", 5)
                .attr("dy", 0)
                .style("fill", "#333")
                .style("stroke", "#333")
                .style("stroke-width", 0)
                .style("font-size", "12px")
                .text(function(d) { return d.value; });
    }

} // End Network Class