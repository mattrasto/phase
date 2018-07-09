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



        // GROUPING



        // Creates a new node group
        nodeGroup(label, filterer, val) {
            var group = new NodeGroup(this, label, filterer, val)
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
            var group = new LinkGroup(this, label, filterer, val)
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
            var morph = new Morph(this, label, type, change);
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
            var phase = new Phase(this, label);
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
            this._nodeContainers = this._nodeContainers.data(this._data.nodes);

            // Remove old nodes
            this._nodeContainers.exit().remove();

            // Add new node containers to node g container
            var newNodes = this._nodeContainers
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
                    .style("r", this._defaultNodeSize)
                    .style("fill", this._defaultNodeColor)
                    .style("stroke", this._defaultNodeBorderColor)
                    .style("stroke-width", this._defaultNodeBorderWidth);

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
                    .style("fill", this._defaultNodeColor)
                    .style("stroke", this._defaultNodeBorderColor)
                    .style("stroke-width", this._defaultNodeBorderWidth);

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
            var newLinks = this._linkContainers
                .enter().append("g");

            // Add new link containers
            newLinks
                .attr("class", "link")

            // Add new lines
            newLinks
                .append("line")
                    .style("stroke-width", 1.5)
                    .style("stroke-dasharray", this._defaultLinkStyle.bind(this));

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
                    .style("stroke-width", 1.5)
                    .style("stroke-dasharray", this._defaultLinkStyle.bind(this));

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
        _defaultLinkStyle(d) {
            // Default: solid
            return "";
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
            if (d3.event.defaultPrevented) return;
            d3.event.preventDefault();
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

    class NodeGroup {
        // Creates a node group based on attributes or a passed in selection
        constructor(network, label, filterer, val) {

            this.network = network;
            this.label = label;
            this.filterer = filterer;
            this.val = val;

            if (typeof filterer === "string") {
                if (val == undefined) {
                    filtered = this.network._nodeContainers;
                }
                var filtered = this.network._nodeContainers.filter(d => d[filterer] == val);
            }
            else if (typeof filterer === "function") {
                var filtered = this.network._nodeContainers.filter(d => filterer(d));
            }

            this._selection = filtered;

            return this;
        }

        // Applies a style map to a node group
        addStyle(styleMap) {
            for (var attr in styleMap) {
                this._selection.select("circle").style(attr, styleMap[attr]);
            }
        }

        // Removes all styles from a group
        unstyle() {
            var styleMap = {
                "fill": this._defaultNodeColor,
                "r": this._defaultNodeSize,
                "stroke": this._defaultNodeBorderColor,
                "stroke-width": this._defaultNodeBorderWidth
            }
            this.addStyle(styleMap);
        }

        labels(labeler) {
            this._selection.select("text").text(labeler);
        }

        morph(label) {
            var morph = this.network.getMorph(label);
            if (morph.type == "style") {
                this.addStyle(morph.change);
            }
            if (morph.type == "data") {
                var newData = this._selection.data();
                for (var datum in newData) {
                    for (var update in morph.change) {
                        newData[datum][update] = morph.change[update];
                    }
                }
                this._selection.data(newData);
            }
        }
    }

    class LinkGroup {
        // Creates a link group based on attributes or a passed in selection
        constructor(network, label, filterer, val) {

            this.network = network;
            this.label = label;
            this.filterer = filterer;
            this.val = val;

            if (typeof filterer === "string") {
                if (val == undefined) {
                    filtered = this.network._linkContainers;
                }
                var filtered = this.network._linkContainers.filter(d => d[filterer] == val);
            }
            else if (typeof filterer === "function") {
                var filtered = this.network._linkContainers.filter(d => filterer(d));
            }

            this._selection = filtered;

            return this;
        }

        // Applies a style map to a node group
        addStyle(styleMap) {
            for (var attr in styleMap) {
                this._selection.select("line").style(attr, styleMap[attr]);
            }
        }

        // Removes all styles from a group
        unstyle() {
            var styleMap = {
                "fill": this._defaultNodeColor,
                "r": this._defaultNodeSize,
                "stroke": this._defaultNodeBorderColor,
                "stroke-width": this._defaultNodeBorderWidth
            }
            this.addStyle(styleMap);
        }

        labels(labeler) {
            this._selection.select("text").text(labeler);
        }

        morph(label) {
            var morph = this.network.getMorph(label);
            if (morph.type == "style") {
                this.addStyle(morph.change);
            }
            if (morph.type == "data") {
                var newData = this._selection.data();
                for (var datum in newData) {
                    for (var update in morph.change) {
                        newData[datum][update] = morph.change[update];
                    }
                }
                this._selection.data(newData);
            }
        }
    }

    class Morph {
        // Creates a morph
        constructor(network, label, type, change) {
            this.network = network;
            this.label = label;
            this.type = type;
            this.change = change;

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
            this._curLayer = 0;
            this._interval = null;

            return this;
        }

        root(element, morph) {
            if (element == undefined) {
                return this._root;
            }
            this._root = new MorphNode(element, morph.label);
            return this._root;
        }

        start() {

            function step() {
                var curLayer = 0;
                var curLayerNodes = [this._root];
                var nextLayerNodes = [];
                while (curLayer < this._curLayer) {
                    if (curLayerNodes.length == 0) {
                        clearInterval(this._interval);
                        return;
                    }
                    for (var i = 0; i < curLayerNodes.length; i++) {
                        nextLayerNodes.push(...curLayerNodes[i].children);
                    }
                    curLayerNodes = nextLayerNodes;
                    nextLayerNodes = [];
                    curLayer++;
                }
                for (var i = 0; i < curLayerNodes.length; i++) {
                    curLayerNodes[i].element.morph(curLayerNodes[i].morphLabel);
                }
                this._curLayer++;
            }

            this._interval = setInterval(step.bind(this), this._timeStep);
        }
    }

    class MorphNode {
        // Creates a node in the morph execution tree
        constructor(element, morphLabel) {
            this.element = element;
            this.morphLabel = morphLabel; // TODO: get morph
            this.children = [];

            return this;
        }

        branch(element, morphLabel) {
            var childMorph = new MorphNode(element, morphLabel);
            this.children.push(childMorph);
            return childMorph;
        }
    }

    var phase = {
        Network: function(query) {
            return new Network(query);
        }
    };

    return phase;
}());
