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
            // Node coloring scheme. Possible values:
        	// "DISTANCE": Color nodes ordinally based on their "distance" attribute using the COLOR_KEY_DISTANCE map
        	this._COLOR_MODE = "DISTANCE";
        	// Colors assigned to each distance when COLOR_MODE = "DISTANCE"
        	this._COLOR_KEY_DISTANCE = ["#63D467", "#63B2D4", "#AE63D4", "#D46363", "#ED9A55", "#E5EB7A"];
        	// Determines the style of links based on their "type" attribute
        	// Values should be an even-length array for alternating black / white segments in px
        	this._LINK_STYLE = {"derivative": "", "related": "10,8"}
        	// Method by which the distance from root is calculated. Possible values:
        	// "SOURCE": Calculate by traversing source relationships
        	// "SHORTEST": Calculate by using Dijkstra's algorithm to find graph-wide shortest distance
        	this._DISTANCE_MODE = "SOURCE";
        	// Base node size
        	this._SIZE_BASE = 10;
        	// Factor by which to multiply the inverse distance from root in calculating node size
        	this._SIZE_DISTANCE_MULTIPLIER = 25;
        	// Factor by which to multiply number of connections in calculating node size
        	this._SIZE_CONNECTIONS_MULTIPLIER = 1.5;
        	// Opacity that a node fades to on node hover
        	this._NODE_FADE_OPACITY = .4;
        	// Opacity that a link fades to on node hover
        	this._LINK_FADE_OPACITY = .1;
        	// Whether to hide nodes with no description
        	this._HIDE_EMPTY_NODES = false;
        	// If true, nodes will be collapsed when they are hidden (via the collapsing of a parent node)
        	this._COLLAPSE_HIDDEN = false;

            console.log("Network constructed");
        }

        // Bind data to the viz
        data(data) {
            // Initial data
            if (this._data === null) {
                this._data = data;
            }
            // Performing update
            else {
                console.warn("NOT IMPLEMENTED: Updating data");
            }
            console.log("Bound data to viz")
        }

        // Render viz element in container
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



            // Appends links to container
    		this._link = this._g.append("g")
    			.attr("class", "links")
    			.selectAll("line")
    			// Filters out links with a hidden source or target node
    			.data(this._data.links)
    			.enter().append("line")
    				.attr("class", "link")
    				.attr("stroke-width", 1.5)
    				// .attr("stroke-dasharray", link_style);

            // Appends node containers to container
    		this._node_container = this._g.append("g")
    			.attr("class", "nodes")
    			.selectAll("g")
    			// Filters out hidden nodes and nodes without a description
    			.data(this._data.nodes)
    			  .enter().append("g")
    			    .attr("class", "node")
                	.on("mouseover", this._node_mouseover.bind(this))
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

    		// Add circles to node containers
    		this._node_container
    			.append("circle")
    				.attr("r", this._node_size)
    				.attr("fill", this._node_color)
    				.attr("stroke", this._node_border_color)
    				.attr("stroke-width", this._node_border_width);

            // Add node labels
    		this._node_container
    			.append("text")
    				.attr("dx", 12)
    				.attr("dy", ".35em")
    				.style("color", "#333")
    				.text(function(d) { return d.id });

            // Initializes simulation
    		this._simulation
    			.nodes(this._data.nodes)
    			.on("tick", () => this._ticked(this._node_container, this._link))
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

            // node
            //     .attr("cx", function(d) { return d.x; })
            //     .attr("cy", function(d) { return d.y; });
        }



        // STYLES



    	// Sizes nodes
    	_node_size(d) {
            return 10;
    		// return (1 / (d.distance + 1)) * this._SIZE_DISTANCE_MULTIPLIER + (original_link_map[d.id].length - 1) * SIZE_CONNECTIONS_MULTIPLIER + SIZE_BASE;
    	}

    	// Color nodes depending on COLOR_MODE
    	_node_color(d) {
    		if (this._COLOR_MODE == "DISTANCE") {
    			if (d.distance == undefined) return "#333";
    			return this._COLOR_KEY_DISTANCE[d.distance % this._COLOR_KEY_DISTANCE.length];
    		}
    		// Default scheme: all dark grey
    		return "#333";
    	}

    	// Colors node borders depending on if they are leaf nodes or not
        _node_border_color(d) {
    		// Only one link means it is the target
    		// if (original_link_map[d.id].filter(function(link) { return link.type == "derivative"; }).length == 1 && d.id != ROOT_ID) return "#333";
    		return "#F7F6F2";
    	}

    	// Draws node borders depending on if they are leaf nodes or not
    	_node_border_width(d) {
    		// Only one link means it is the target
    		// if (original_link_map[d.id].length == 1 && d.id != this._ROOT_ID) return "1.6px";
    		return ".8px";
    	}

    	// Draws links as dash arrays based on their type
    	_link_style(d) {
    		return this._LINK_STYLE[d.type];
    	}



        // EVENT HANDLERS



        // Node mouseover handler
    	_node_mouseover(d) {
    		console.log("Mouseover");
            // console.log(this);
            // console.log(d);
    	}

    	// Node mouseout handler
    	_node_mouseout(d) {
    		console.log("Mouseout");
    	}

    	// Node mousedown handler
    	_node_mousedown(d) {
    		console.log("Mousedown");
            // console.log(this);
            // console.log(d);
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
    		// Unpin node
    		d3.select(this).classed("fixed", d.fixed = false);
    		// HACK: Why doesn't just adding d.fixed = false work?
    		d.fx = null;
    		d.fy = null;
            // TODO: Bind "this"
    		this._simulation.alpha(.3).restart();
    	}

        // Container drag start handler
    	_node_drag_start(d) {
    		if (!d3.event.active) this._simulation.alphaTarget(0.3).restart();
    		d.fx = d.x;
    		d.fy = d.y;
    		// Fixes node in place
            // console.log(d);
            // console.log(d3.select(d));
            // NOTE: This probably works, but d3.select(d) needs to represent a <g> element, not data (container?)
    		// d3.select(d).classed("fixed", d.fixed = true);
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
