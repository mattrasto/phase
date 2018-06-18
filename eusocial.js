window.eusocial = (function () {
    class Network {
        constructor() {

            this._data = null

            // Elements
            this._container = null;
            this._svg = null;
            this._g = null;
            this._simulation = null;
            this._node = null;
            this._link = null;

            // Visualization properties
            this._container_width = 0;
            this._container_height = 0;



            // SETTINGS (user-accessible)

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
            this._LINK_STYLE = {"derivative": "", "related": "10,8"}
            // Base node size
            this._SIZE_BASE = 10;

            console.log("Network constructed");
        }

        // Binds data to the viz
        data(data) {
            if (this._data != null) {
                this._bind_data(data);
            }
            else {
                this._data = data;
            }
            console.log("Bound data to viz");
        }

        // Renders viz element in container
        render(query) {
            if (typeof selector === "string") {
                this._container = document.querySelectorAll(query);
            }
            else {
                this._container = query;
            }

            this._container_width = this._container.getBoundingClientRect().width;
            this._container_height = this._container.getBoundingClientRect().height;

            // Adds svg box and allows it to resize / zoom as needed
            this._svg = d3.select(this._container).append("svg")
                .attr("id", "eusocial-network")
                .attr("width", "100%")
                .attr("height", "100%")
                .attr("viewBox","0 0 " + Math.min(this._container_width, this._container_height) + " " + Math.min(this._container_width, this._container_height))
                .attr("preserveAspectRatio", "xMinYMin")
                .on("contextmenu", this._container_contextmenu)
                .call(d3.zoom()
                    .scaleExtent([.1, 10])
                    .on("zoom", this._container_zoom.bind(this))
                )
                .on("dblclick.zoom", null);  // Don't zoom on double left click

            this._container.appendChild(this._svg.node());

            // Creates actual force graph container (this is what actually gets resized as needed)
            this._g = this._svg.append("g");

            this._simulation = d3.forceSimulation()
                .force("link", d3.forceLink().id(function(d) { return d.id; }).distance(this._LINK_DISTANCE).strength(this._LINK_STRENGTH))
                .force("charge", d3.forceManyBody().strength(this._CHARGE))
                .force("center", d3.forceCenter(this._container_width / 2, this._container_height / 2));

            // Creates g container for links
            this._link_g = this._g.append("g")
                .attr("class", "links");

            // Appends links to link g container
            this._links = this._link_g
                .selectAll("line");

            // Creates g container for node containers
            this._node_container_g = this._g.append("g")
                .attr("class", "nodes");

            // Adds node containers to node g container
            this._node_containers = this._node_container_g
                .selectAll("g");

            this._bind_data(this._data);

            // Initializes simulation
            this._simulation
                .nodes(this._data.nodes)
                .on("tick", () => this._ticked(this._node_containers, this._links))
                .force("link")
                    .links(this._data.links);

            console.log("Rendering on " + this._container.id)
        }

        // Recalculates node and link positions every simulation tick
        _ticked(node_container, link) {

            node_container
                .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

            link
                .attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });
        }



        // DATA BINDING



        // Binds new data to network
        _bind_data(data) {

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
                    .attr("stroke-dasharray", this._link_style.bind(this))
                    .merge(this._links);


            // Rejoin node data
            this._node_containers = this._node_containers.data(this._data.nodes);

            // Remove old nodes
            this._node_containers.exit().remove();

            // Add new node containers to node g container
            var new_nodes = this._node_containers
              .enter().append("g");

            // Add new node containers
            new_nodes
                .attr("class", "node")
                .on("mouseover", this._node_mouseover)
                .on("mouseout", this._node_mouseout)
                .on("mousedown", this._node_mousedown)
                .on("click", this.node_click)
                .on("dblclick", this._node_dblclick)
                .on("contextmenu", this._node_contextmenu)
                .call(d3.drag()
                    .on("start", this._node_drag_start.bind(this))
                    .on("drag", this._node_drag.bind(this))
                    .on("end", this._node_drag_end.bind(this))
                );

            // Add new circles
            new_nodes
                .append("circle")
                    .attr("r", this._node_size)
                    .attr("fill", this._node_color)
                    .attr("stroke", this._node_border_color)
                    .attr("stroke-width", this._node_border_width);

            // Add new labels
            new_nodes
                .append("text")
                    .attr("dx", 12)
                    .attr("dy", ".35em")
                    .style("color", "#333")
                    .text(function(d) { return d.id });

            this._node_containers = new_nodes.merge(this._node_containers);

            // Update circles
            this._node_containers
                .select("circle")
                    .attr("r", this._node_size.bind(this))
                    .attr("fill", this._node_color)
                    .attr("stroke", this._node_border_color)
                    .attr("stroke-width", this._node_border_width);

            // Update labels
            this._node_containers
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
        _node_size(d) {
            // Default: _SIZE_BASE
            return this._SIZE_BASE;
        }

        // Colors nodes depending on COLOR_MODE
        _node_color(d) {
            // Default: dark grey
            return "#333";
        }

        // Colors node borders depending on if they are leaf nodes or not
        _node_border_color(d) {
            // Default: white
            return "#F7F6F2";
        }

        // Draws node borders depending on if they are leaf nodes or not
        _node_border_width(d) {
            // Default: .8px
            return ".8px";
        }

        // Draws links as dash arrays based on their type
        _link_style(d) {
            // Default: solid
            return "";
        }



        // EVENT HANDLERS



        // Node mouseover handler
        _node_mouseover(d) {
            // Default: add blue border
            d3.select(this.childNodes[0]).attr("stroke", "#7DABFF").attr("stroke-width", "3px");
        }

        // Node mouseout handler
        _node_mouseout(d) {
            // Default: remove blue border
            d3.select(this.childNodes[0]).attr("stroke", "").attr("stroke-width", "0");
        }

        // Node mousedown handler
        _node_mousedown(d) {
            console.log("Mousedown");
            // Unpin node if middle click
            if (d3.event.which == 2) {
                d3.select(this).classed("fixed", d.fixed = false);
                d.fx = null;
                d.fy = null;
            }
        }

        // Node left click handler
        _node_click(d) {
            if (d3.event.defaultPrevented) return;
            d3.event.preventDefault();
        }

        // Node double left click handler
        _node_dblclick(d) {
            console.log("Double click");
        }

        // Node right click handler
        _node_contextmenu(d) {
            console.log("Right click");
        }

        // Container drag start handler
        _node_drag_start(d) {
            if (!d3.event.active) this._simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        // Container drag handler
        _node_drag(d) {
            d.fx = d3.event.x;
            d.fy = d3.event.y;
        }

        // Container dragend handler
        _node_drag_end(d) {
            if (!d3.event.active) this._simulation.alphaTarget(0);
        }

        // Container right click handler (outside nodes)
        _container_contextmenu(d) {
            d3.event.preventDefault(); // Prevent context menu from appearing
        }

        // Container zoom handler
        _container_zoom() {
            this._g.node().setAttribute("transform", d3.event.transform);
        }
    }

    var eusocial = {
        Network: function() {
            return new Network();
        }
    };

    return eusocial;
}());
