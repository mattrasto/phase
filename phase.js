window.phase = (function () {
    class Network {
        constructor(query) {

            this._container = (typeof query === "string") ? document.querySelectorAll(query)[0] : query;

            this._data = {"nodes": [], "links": []};

            // Elements
            this._svg = null;
            this._g = null;
            this._simulation = null;
            this._node = null;
            this._link = null;

            // Visualization properties
            this._containerWidth = 0;
            this._containerHeight = 0;

            this._nodeGroups = {};
            this._linkGroups = {};



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

            this._container.appendChild(this._svg.node());

            // Creates actual force graph container (this is what actually gets resized as needed)
            this._g = this._svg.append("g");

            this._simulation = d3.forceSimulation()
                .force("link", d3.forceLink().id(function(d) { return d.id; }).distance(this._LINK_DISTANCE).strength(this._LINK_STRENGTH))
                .force("charge", d3.forceManyBody().strength(this._CHARGE))
                .force("center", d3.forceCenter(this._containerWidth / 2, this._containerHeight / 2));

            // Creates g container for links
            this._linkG = this._g.append("g")
                .attr("class", "links");

            // Appends links to link g container
            this._links = this._linkG
                .selectAll("line");

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
                .on("tick", () => this._ticked(this._nodeContainers, this._links))
                .force("link")
                    .links(this._data.links);

            console.log("Rendering on " + this._container.id)
        }

        // Recalculates node and link positions every simulation tick
        _ticked(nodeContainer, link) {

            nodeContainer
                .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

            link
                .attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });
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



        // DATA BINDING



        // Binds new data to network
        _bindData(data) {

            // Assign new data
            this._data = data;

            // Rejoin link data
            this._links = this._links.data(this._data.links);

            // Remove old links
            this._links.exit().remove();

            // Add new links to link g container
            this._links = this._links
                .enter().append("line")
                    .attr("class", "link")
                    .attr("stroke-width", 1.5)
                    .attr("stroke-dasharray", this._defaultLinkStyle.bind(this))
                    .merge(this._links);


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
                    .attr("r", this._defaultNodeSize)
                    .attr("fill", this._defaultNodeColor)
                    .attr("stroke", this._defaultNodeBorderColor)
                    .attr("stroke-width", this._defaultNodeBorderWidth);

            // Add new labels
            newNodes
                .append("text")
                    .attr("dx", 12)
                    .attr("dy", ".35em")
                    .style("color", "#333")
                    .text(function(d) { return d.id });

            this._nodeContainers = newNodes.merge(this._nodeContainers);

            // Update circles
            this._nodeContainers
                .select("circle")
                    .attr("r", this._defaultNodeSize.bind(this))
                    .attr("fill", this._defaultNodeColor)
                    .attr("stroke", this._defaultNodeBorderColor)
                    .attr("stroke-width", this._defaultNodeBorderWidth);

            // Update labels
            this._nodeContainers
                .select("text")
                    .attr("dx", 12)
                    .attr("dy", ".35em")
                    .style("color", "#333")
                    .text(function(d) { return d.id });

            // Rebind data and restart simulation
            this._simulation
                .nodes(this._data.nodes)
                .force("link").links(this._data.links);
            this._simulation.alpha(1).restart();
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
            if (!d3.event.active) this._simulation.alphaTarget(0.3).restart();
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
        unstyle(group) {
            var styleMap = {
                "fill": this._defaultNodeColor,
                "r": this._defaultNodeSize,
                "stroke": this._defaultNodeBorderColor,
                "stroke-width": this._defaultNodeBorderWidth
            }
            this.addStyle(styleMap);
        }
    }

    class LinkGroup {
        // Creates a link group based on attributes or a passed in selection
        constructor(network, label, filterer, val) {

            this.network = network;

            if (typeof filterer === "string") {
                if (val == undefined) {
                    filtered = this.network._links;
                }
                var filtered = this.network._links.filter(d => d[filterer] == val);
            }
            else if (typeof filterer === "function") {
                var filtered = this.network._links.filter(d => filterer(d));
            }

            this._selection = filtered;

            return this;
        }

        // Applies a style map to a node group
        // TODO
        addStyle(styleMap) {
            for (var attr in styleMap) {
                this._selection.select("circle").style(attr, styleMap[attr]);
            }
        }

        // Removes all styles from a group
        // TODO
        unstyle(group) {
            var styleMap = {
                "fill": this._defaultNodeColor,
                "r": this._defaultNodeSize,
                "stroke": this._defaultNodeBorderColor,
                "stroke-width": this._defaultNodeBorderWidth
            }
            this.addStyle(styleMap);
        }
    }

    var phase = {
        Network: function(query) {
            return new Network(query);
        }
    };

    return phase;
}());
