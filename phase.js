window.phase = (function () {
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

            this._network = this;

            // Internal store of graph structure as adjacency list
            this._adjList = {};

            // Settings (user-accessible)
            this.initSettings(settings);

            // Viz state
            this._state = {};

            console.log("Network constructed");

            this._render();
        }

        // Binds data to the viz
        data(data) {
            if (this._data != null) {
                this._bindData(data);
                this._dataLoaded = true;
                this._dataBound = true;
            }
            else {
                this._data = data;
                this._dataLoaded = true;
            }

            // Update "all" groups
            this.nodeGroup("all", "");
            this.linkGroup("all", "");

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
            for (const key in updatedSettings) {
                this._settings[key] = updatedSettings[key];
            }
            // TODO: If entire viz doesn't need to be rerendered, don't call this
            this.reset();
        }

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
                // Node coloring scheme
                colorMode: "",
                // Default node color palette
                colorKey: ["#63D467", "#63B2D4", "#AE63D4", "#D46363", "#ED9A55", "#E5EB7A"],
                // Determines the style of links based on their "type" attribute
                // Values should be an even-length array for alternating black / white segments in px
                linkStyle: {"derivative": "", "related": "10,8"},
                // Node size
                nodeSize: 10,
                // Node fill color
                nodeColor: "#333",
                // Node border color
                nodeBorderColor: "#F7F6F2",
                // Node border width
                nodeBorderWidth: ".8px",
                // Link type (solid, dash array, etc.)
                linkStroke: "",
                // Link color
                linkColor: "#666",
                // Link width
                linkWidth: "1.5px",
                // Whether the user can zoom
                zoom: true,
            };
            this.settings(settings);
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
                .on("contextmenu", this._containerContextmenu)
                .call(d3.zoom()
                    .scaleExtent(this._settings.zoom ? [.1, 10] : [1, 1])
                    .on("zoom", this._containerZoom.bind(this))
                )
                .on("dblclick.zoom", null);  // Don't zoom on double left click

            // TODO
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
                .on("tick", () => this._ticked(this._nodeContainers, this._linkContainers))
                .force("link")
                    .links(this._data.links);

            console.log("Rendering on " + this._container.id)
        }

        // Recalculates node and link positions every simulation tick
        _ticked(nodeContainer, linkContainer) {

            nodeContainer
                .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

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
            // Bidirectional
            links.forEach(link => {
                if (this._dataBound) {
                    this._adjList[link.source.id].push(link.target.id);
                    this._adjList[link.target.id].push(link.source.id);
                }
                else {
                    this._adjList[link.source].push(link.target);
                    this._adjList[link.target].push(link.source);
                }
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
            const group = new NodeGroup(this._network, label, filterer, val)
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
            const group = new LinkGroup(this._network, label, filterer, val)
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
            const morph = new Morph(this._network, label, type, change);
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

        destroyPhase(label){
            if(label in this._phases){
                this.getPhase(label).destroy();
            }
        }

        getAllPhases() {
            return this._phases;
        }



        // DATA BINDING



        // Binds new data to the network
        _bindData(data) {
            this._graph = this._generateAdjacencyList(data)

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
            this._nodeContainers = this._nodeContainers.data(this._data.nodes);

            // Remove old nodes
            this._nodeContainers.exit().remove();

            // Add new node containers to node g container
            let newNodes = this._nodeContainers
              .enter().append("g");

            // Add new node containers
            newNodes
                .attr("class", "node")
                .on("mouseover", this._nodeMouseover)
                .on("mouseout", this._nodeMouseout)
                .on("mousedown", this._nodeMousedown)
                .on("click", this._nodeClick)
                .on("dblclick", this._nodeDblclick)
                .on("contextmenu", this._nodeContextmenu)
                .call(d3.drag()
                    .on("start", this._nodeDragStart.bind(this))
                    .on("drag", this._nodeDrag.bind(this))
                    .on("end", this._nodeDragEnd.bind(this))
                );

            // Add new circles
            newNodes
                .append("circle")
                    .style("r", this._settings.nodeSize)
                    .style("fill", this._settings.nodeColor)
                    .style("stroke", this._settings.nodeBorderColor)
                    .style("stroke-width", this._settings.nodeBorderWidth);

            // Add new labels
            newNodes
                .append("text")
                    .attr("dx", 12)
                    .attr("dy", ".35em")
                    .style("fill", "#333")
                    .style("stroke", "#333")
                    .text(function(d) { return d.id; });

            this._nodeContainers = newNodes.merge(this._nodeContainers);

            // Update circles
            this._nodeContainers
                .select("circle")
                .style("r", this._settings.nodeSize)
                .style("fill", this._settings.nodeColor)
                .style("stroke", this._settings.nodeBorderColor)
                .style("stroke-width", this._settings.nodeBorderWidth);

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
            this._linkContainers = this._linkContainers.data(this._data.links);

            // Remove old links
            this._linkContainers.exit().remove();

            // Add new links to link g container
            let newLinks = this._linkContainers
                .enter().append("g");

            // Add new link containers
            newLinks
                .attr("class", "link")

            // Add new lines
            newLinks
                .append("line")
                    .style("stroke", this._settings.linkColor)
                    .style("stroke-width", this._settings.linkWidth)
                    .style("stroke-dasharray", this._settings.linkStroke)

            // Add new labels
            newLinks
                .append("text")
                    .attr("dx", 5)
                    .attr("dy", 0)
                    .style("fill", "#333")
                    .style("stroke", "#333")
                    .style("stroke-width", 0)
                    .style("font-size", "12px")
                    .text(function(d) { return d.value; });

            this._linkContainers = newLinks.merge(this._linkContainers);

            // Update lines
            this._linkContainers
                .select("line")
                .style("stroke", this._settings.linkColor)
                .style("stroke-width", this._settings.linkWidth)
                .style("stroke-dasharray", this._settings.linkStroke)

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



        // EVENT HANDLERS



        // Node mouseover handler
        _nodeMouseover(d) {
            // Default: add blue border
            d3.select(this.childNodes[0]).style("stroke", "#7DABFF").style("stroke-width", "3px");
        }

        // Node mouseout handler
        _nodeMouseout(d) {
            // Default: remove blue border
            d3.select(this.childNodes[0]).style("stroke", "").style("stroke-width", "0");
        }

        // Node mousedown handler
        _nodeMousedown(d) {
            // Unpin node if middle click
            if (d3.event.which == 2) {
                d3.select(this).classed("fixed", d.fixed = false);
                d.fx = null;
                d.fy = null;
            }
        }

        // Node left click handler
        _nodeClick(d) {
            const currentColor = d3.select(this.childNodes[0]).style("fill");
            const defaultColor = 'rgb(51, 51, 51)';
            const newColor = currentColor === defaultColor ? "#63B2D4" : defaultColor;
            d3.select(this.childNodes[0]).style("fill", newColor);
        }

        // Node double left click handler
        _nodeDblclick(d) {
            console.log("Double click");
        }

        // Node right click handler
        _nodeContextmenu(d) {
            console.log("Right click");
        }

        // Container drag start handler
        _nodeDragStart(d) {
            if (!d3.event.active) this._simulation.alphaTarget(.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        // Container drag handler
        _nodeDrag(d) {
            d.fx = d3.event.x;
            d.fy = d3.event.y;
        }

        // Container dragend handler
        _nodeDragEnd(d) {
            if (!d3.event.active) this._simulation.alphaTarget(0);
        }

        // Container right click handler (outside nodes)
        _containerContextmenu(d) {
            d3.event.preventDefault(); // Prevent context menu from appearing
        }

        // Container zoom handler
        _containerZoom() {
            this._g.node().setAttribute("transform", d3.event.transform);
        }
    }

    class Group {
        constructor(network, label, filterer, val) {

            this._network = network;
            this.label = label;
            this._filterer = filterer;
            this._val = val;

            // Phase the group is associated with
            this.phase;

            this._selection = this._filter(filterer, val)

            return this;
        }

        _filter(filterer, val) {
            const isNodeGroup = this instanceof NodeGroup;
            const containers = isNodeGroup ? this._network._nodeContainers : this._network._linkContainers;

            if (typeof filterer === "string") {
                return val === undefined ? containers : containers.filter(d => d[filterer] == val);
            }
            else if (typeof filterer === "function") {
                return containers.filter(d => filterer(d));
            }
            else if (Array.isArray(filterer) || filterer instanceof Set) {
                const set = new Set(filterer)
                if (isNodeGroup) {
                    return containers.filter(d => set.has(d.id))
                } else {
                    return containers.filter(d => set.has(d.source.id) || set.has(d.target.id))
                }
            }
            else {
                throw new InvalidFilterException("Invalid filterer type");
            }
        }

        addStyle(styleMap, selector) {
            for (const attr in styleMap) {
                this._selection.select(selector).style(attr, styleMap[attr]);
            }
        }

        labels(labeler) {
            this._selection.select("text").text(labeler);
        }

        morph(label) {
            const morph = this.phase ? this._network.getPhase(this.phase).getMorph(label) : this._network.getMorph(label);
            if (morph._type == "style") {
                this.addStyle(morph._change);
            }
            if (morph._type == "data") {
                let newData = this._selection.data();
                for (const datum in newData) {
                    for (const update in morph._change) {
                        newData[datum][update] = morph._change[update];
                    }
                }
                this._selection.data(newData);
            }
        }
    }

    class NodeGroup extends Group {
        // Creates a node group based on attributes or a passed in selection
        constructor(network, label, filterer, val) {
            super(network, label, filterer, val)
        }

        // Applies a style map to a node group
        addStyle(styleMap) {
            super.addStyle(styleMap, "circle")
        }

        // Removes all styles from a group
        unstyle() {
            const styleMap = {
                "fill": this._network._settings.nodeColor,
                "r": this._network._settings.nodeSize,
                "stroke": this._network._settings.nodeBorderColor,
                "stroke-width": this._network._settings.nodeBorderWidth
            }
            this.addStyle(styleMap);
        }
    }

    class LinkGroup extends Group {
        // Creates a link group based on attributes or a passed in selection
        constructor(network, label, filterer, val) {
            super(network, label, filterer, val)
        }

        // Applies a style map to a link group
        addStyle(styleMap) {
            super.addStyle(styleMap, "line")
        }

        // Removes all styles from a group
        unstyle() {
            const styleMap = {
                "stroke-dasharray": this._network._settings.linkStroke,
                "fill": this._network._settings.linkColor,
                "stroke": this._network._settings.linkColor,
                "stroke-width": this._network._settings.linkWidth
            }
            this.addStyle(styleMap);
        }
    }

    class Morph {
        // Creates a morph
        constructor(network, label, type, change) {
            this._network = network;
            this.label = label;
            this._type = type;
            this._change = change;

            // Phase the morph is associated with
            this.phase;

            return this;
        }
    }

    class Phase {
        // Creates a phase
        constructor(network, label) {
            this._network = network;
            this.label = label;

            this._root = null;

            // Settings
            // TODO: Consider moving into state or exposing
            this._timeStep = 500; // Time between execution tree layer applications

            // Internal state
            // TODO: Consider moving into state or exposing
            this._curLayer = 0; // Current layer of the phase's execution
            this._interval = null; // Interval ID for the phase
            this._layerNodes = []; // Array of MorphNodes present in each layer of the execution tree

            // External state
            this._state = {}; // State variables belonging to state

            // Morphs and groups associated with the phase
            this._morphs = {};
            this._nodeGroups = {};
            this._linkGroups = {};

            // Function called on when phase is initialized
            this._initial;
            // Function called on each timestep to compute phase's next state
            this._transition;
            // Function called to determine whether the phase is finished
            this._terminal;

            return this;
        }

        // Updates or returns the current state
        state(updatedState) {
            if (updatedState == undefined) return this._state;
            for (const key in updatedState) {
                this._state[key] = updatedState[key];
            }
        }

        initial(initial) {
            this._initial = initial;
        }

        next(transition) {
            this._transition = transition;
        }

        end(terminal) {
            this._terminal = terminal;
        }

        _calculateNextState() {
            this._transition(this.state(), this._network.state())
        }

        _evaluateTermination() {
            if(this._terminal(this.state(), this._network.state())){
                return true;
            }
            return false;
        }

        // Stop the phase's application but don't clear settings/state
        stop() {
            clearInterval(this._interval);
        }

        // Reset the phase to its initial settings/state
        reset() {
            // TODO: Move settings to own object (state?) and reset
            this._state = {};
        }

        // Teardown the phase along with its associated groups/morphs and remove from viz
        destroy() {
            this._morphs = {};
            this._nodeGroups = {};
            this._linkGroups = {};

            delete this._network._phases[this.label];
        }

        // Begins the simulation
        start() {

            // TODO: Only initialize if the simulation has not been started yet or has been reset
            this._initial(this.state(), this._network.state());

            if (this._transition) {
                function step() {
                    this._calculateNextState();
                    if (this._evaluateTermination()) this.stop();
                }
                this._interval = setInterval(step.bind(this), this._timeStep);
                return;
            }
        }

        // Morphs and Groups instantiated and stored within a phase

        // Creates a new node group
        nodeGroup(label, filterer, val) {
            let nodeGroup = this._network.nodeGroup.call(this, label, filterer, val);
            nodeGroup.phase = this.label;
            return nodeGroup;
        }

        getNodeGroup(label) {
            return this._nodeGroups[label];
        }

        getAllNodeGroups() {
            return this._nodeGroups;
        }

        // Creates a new node group
        linkGroup(label, filterer, val) {
            let linkGroup = this._network.linkGroup.call(this, label, filterer, val);
            linkGroup.phase = this.label;
            return linkGroup;
        }

        getLinkGroup(label) {
            return this._linkGroups[label];
        }

        getAllLinkGroups() {
            return this._linkGroups;
        }

        morph(label, type, change) {
            let morph = this._network.morph.call(this, label, type, change);
            morph.phase = this.label;
            return morph;
        }

        getMorph(label) {
            return this._morphs[label];
        }

        getAllMorphs() {
            return this._morphs;
        }
    }

    const phase = {
        Network: function(query) {
            return new Network(query);
        }
    };

    return phase;
}());
