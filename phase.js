window.phase = (function () {
    class Network {
        constructor(query) {

            this._container = (typeof query === "string") ? document.querySelectorAll(query)[0] : query;

            this._data = {"nodes": [], "links": []};

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
            this._graph = {}

            // Settings (user-accessible)

            // Strength of links (how easily they can be compressed) between nodes [0, INF]
            this._LINK_STRENGTH = 1;
            // Distance between nodes [0, INF]
            this._LINK_DISTANCE = 60;
            // Charge between nodes [-INF, INF]
            this._CHARGE = -800;
            // How easily particles are dragged across the screen [0, 1]
            this._FRICTION = .8;
            // Node coloring scheme
            this._COLOR_MODE = "";
            // Default node color palette
            this._COLOR_KEY = ["#63D467", "#63B2D4", "#AE63D4", "#D46363", "#ED9A55", "#E5EB7A"];
            // Determines the style of links based on their "type" attribute
            // Values should be an even-length array for alternating black / white segments in px
            this._LINK_STYLE = {"derivative": "", "related": "10,8"};
            // Base node size
            this._SIZE_BASE = 10;

            console.log("Network constructed");

            this._render();
        }

        // Binds data to the viz
        data(data) {
            if (this._data != null) {
                this._bindData(data);
            }
            else {
                this._data = data;
            }

            // Update "all" groups
            this.nodeGroup("all", "");
            this.linkGroup("all", "");

            console.log("Bound data to viz");
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
                    .scaleExtent([.1, 10])
                    .on("zoom", this._containerZoom.bind(this))
                )
                .on("dblclick.zoom", null);  // Don't zoom on double left click

            // TODO
            this._container.appendChild(this._svg.node());

            // Creates actual force graph container (this is what actually gets resized as needed)
            this._g = this._svg.append("g");

            this._simulation = d3.forceSimulation()
                .force("link", d3.forceLink().id(function(d) { return d.id; }).distance(this._LINK_DISTANCE).strength(this._LINK_STRENGTH))
                .force("charge", d3.forceManyBody().strength(this._CHARGE))
                .force("center", d3.forceCenter(this._containerWidth / 2, this._containerHeight / 2));

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
        _generateGraph(data){
            const links = data.links;
            const nodes = data.nodes;
            let graph = {}
            nodes.forEach(node => {
                graph[node.id] = []
            });
            // Bidirectional
            links.forEach(link => {
                graph[link.source].push(link.target);
                graph[link.target].push(link.source);
            });
            return graph;
        }

        getGraph(){
            return this._graph;
        }


        // GROUPING


        // Creates a new node group
        nodeGroup(label, filterer, val) {
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
            this._graph = this._generateGraph(data)

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
                    .style("r", this._defaultNodeSize.bind(this))
                    .style("fill", this._defaultNodeColor.bind(this))
                    .style("stroke", this._defaultNodeBorderColor.bind(this))
                    .style("stroke-width", this._defaultNodeBorderWidth.bind(this));

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
                    .style("r", this._defaultNodeSize.bind(this))
                    .style("fill", this._defaultNodeColor.bind(this))
                    .style("stroke", this._defaultNodeBorderColor.bind(this))
                    .style("stroke-width", this._defaultNodeBorderWidth.bind(this));

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
                    .style("stroke", this._defaultLinkColor.bind(this))
                    .style("stroke-width", this._defaultLinkWidth.bind(this))
                    .style("stroke-dasharray", this._defaultLinkType.bind(this))

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
                .style("stroke", this._defaultLinkColor.bind(this))
                .style("stroke-width", this._defaultLinkWidth.bind(this))
                .style("stroke-dasharray", this._defaultLinkType.bind(this))

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



        // STYLES

        // Reset graph to default colors
        resetGraph(){
            const nodeGroups = this.getAllNodeGroups()
            const linkGroups = this.getAllLinkGroups()
            for(const node in nodeGroups){
                nodeGroups[node].unstyle()
            }
            for(const link in linkGroups){
                linkGroups[link].unstyle()
            }
        }

        // Sizes nodes
        _defaultNodeSize(d) {
            // Default: _SIZE_BASE
            return this._SIZE_BASE;
        }

        // Colors nodes depending on COLOR_MODE
        _defaultNodeColor(d) {
            // Default: dark grey
            return "#333";
        }

        // Colors node borders depending on if they are leaf nodes or not
        _defaultNodeBorderColor(d) {
            // Default: white
            return "#F7F6F2";
        }

        // Draws node borders depending on if they are leaf nodes or not
        _defaultNodeBorderWidth(d) {
            // Default: .8px
            return ".8px";
        }

        // Draws links as dash arrays based on their type
        _defaultLinkType(d) {
            // Default: solid
            return "";
        }

        // Draws links as dash arrays based on their type
        _defaultLinkColor(d) {
            // Default: medium grey
            return "#666";
        }

        // Draws links as dash arrays based on their type
        _defaultLinkWidth(d) {
            // Default: 1.5px
            return "1.5px";
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
            console.log("Mousedown");
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
            this.filterer = filterer;
            this.val = val;

            const containers = this instanceof NodeGroup ? this._network._nodeContainers : this._network._linkContainers;

            let filtered;
            if (typeof filterer === "string") {
                filtered = val === undefined ? containers : containers.filter(d => d[filterer] == val);
            }
            else if (typeof filterer === "function") {
                filtered = containers.filter(d => filterer(d));
            }

            this._selection = filtered;

            return this;
        }

        addStyle(styleMap, selector){
            for (const attr in styleMap) {
                this._selection.select(selector).style(attr, styleMap[attr]);
            }
        }

        labels(labeler) {
            this._selection.select("text").text(labeler);
        }

        morph(label) {
            const morph = this._network.getMorph(label);
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
                "fill": this._network._defaultNodeColor.bind(this._network),
                "r": this._network._defaultNodeSize.bind(this._network),
                "stroke": this._network._defaultNodeBorderColor.bind(this._network),
                "stroke-width": this._network._defaultNodeBorderWidth.bind(this._network)
            }
            this.addStyle(styleMap);
        }
    }

    class LinkGroup extends Group {
        // Creates a link group based on attributes or a passed in selection
        constructor(network, label, filterer, val) {
            super(network, label, filterer, val)
        }

        // Applies a style map to a node group
        addStyle(styleMap) {
            super.addStyle(styleMap, "line")
        }

        // Removes all styles from a group
        unstyle() {
            const styleMap = {
                "stroke-dasharray": this._network._defaultLinkType.bind(this._network),
                "fill": this._network._defaultLinkColor.bind(this._network),
                "stroke": this._network._defaultLinkColor.bind(this._network),
                "stroke-width": this._network._defaultLinkWidth.bind(this._network)
            }
            this.addStyle(styleMap);
        }
    }

    class Morph {
        // Creates a morph
        constructor(network, label, type, change) {
            this._network = network;
            this._label = label;
            this._type = type;
            this._change = change;

            return this;
        }
    }

    class Phase {
        // Creates a phase
        constructor(network, label) {
            this.network = network;
            this.label = label;

            this._root = null;

            // SETTINGS
            this._timeStep = 500; // Time between execution tree layer applications

            // STATE
            this._curLayer = 0; // Current layer of the phase's execution
            this._interval = null; // Interval ID for the phase
            this._layerNodes = []; // Array of MorphNodes present in each layer of the execution tree

            return this;
        }

        root(element, morph) {
            if (element == undefined) {
                return this._root;
            }
            this._root = new MorphNode(this, element, morph._label);
            return this._root;
        }

        start() {

            function step() {
                let curLayerNodes = this._layerNodes[this._curLayer];
                if (curLayerNodes == undefined) {
                    clearInterval(this._interval);
                    return;
                }
                for (let i = 0; i < curLayerNodes.length; i++) {
                    curLayerNodes[i]._element.morph(curLayerNodes[i]._morphLabel);
                }
                this._curLayer++;
            }

            this._interval = setInterval(step.bind(this), this._timeStep);
        }
    }

    class MorphNode {
        // Creates a node in the morph execution tree
        constructor(phase, element, morphLabel) {
            this._phase = phase;
            this._element = element;
            this._morphLabel = morphLabel; // TODO: get morph
            this._children = [];

            this._layer = 0;

            this._phase._layerNodes[0] = [this];

            return this;
        }

        // Creates a node in the next layer from the current node in the morph execution tree
        branch(element, morphLabel) {
            const childMorph = new MorphNode(this._phase, element, morphLabel);
            childMorph._layer = this._layer + 1;

            this._children.push(childMorph);
            if (this._phase._layerNodes.length <= childMorph._layer) {
                this._phase._layerNodes.push([]);
            }
            this._phase._layerNodes[childMorph._layer].push(this);

            return childMorph;
        }
    }

    const phase = {
        Network: function(query) {
            return new Network(query);
        }
    };

    return phase;
}());
