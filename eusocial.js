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


            // SETTINGS

            // Strength of links (how easily they can be compressed) between nodes [0, INF]
        	this._LINK_STRENGTH = 1;
        	// Distance between nodes [0, INF]
        	this._LINK_DISTANCE = 60;
        	// Charge between nodes [-INF, INF]
        	this._CHARGE = -800;
        	// How easily particles are dragged across the screen [0, 1]
        	this._FRICTION = .8;

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
        		// .on("contextmenu", container_contextmenu)
        		.call(d3.zoom()
        			.scaleExtent([.1, 10])
        			.on("zoom", this.container_zoom.bind(this))
                )
        		.on("dblclick.zoom", null); // Don't zoom on double left click

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

    		// Appends nodes to container
    		this._node = this._g.append("g")
                .attr("class", "node")
                .selectAll("circle")
    			// Filters out hidden nodes and nodes without a description
    			.data(this._data.nodes)
                .enter().append("circle")
                  .attr("r", 4)
                  .attr("cx", function(d) { return d.x; })
                  .attr("cy", function(d) { return d.y; })
    			.on("mouseover", this.node_mouseover.bind(this))
    			.on("mouseout", this.node_mouseout)
    			.on("mousedown", this.node_mousedown)
    			.on("click", this.node_click)
    			.on("dblclick", this.node_dblclick)
    			.on("contextmenu", this.node_contextmenu)
    			.call(d3.drag()
    				.on("start", this.container_drag_start.bind(this))
    				.on("drag", this.container_drag.bind(this))
    				.on("end", this.container_drag_end.bind(this)));

            // Initializes simulation
    		this._simulation
    			.nodes(this._data.nodes)
    			.on("tick", () => this.ticked(this._node, this._link))
    			.force("link")
    				.links(this._data.links);

            console.log("Rendering on " + this._container.id)
        }

        // Recalculates node and link positions every simulation tick
        ticked(node, link) {
            link
                .attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });

            node
                .attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; });
        }

        // Node mouseover handler
    	node_mouseover(d) {
    		console.log("Mouseover");
            // console.log(this);
            // console.log(d);
    	}

    	// Node mouseout handler
    	node_mouseout(d) {
    		console.log("Mouseout");
    	}

    	// Node mousedown handler
    	node_mousedown(d) {
    		console.log("Mousedown");
            // console.log(this);
            // console.log(d);
    	}

    	// Node left click handler
    	node_click(d) {
    		if (d3.event.defaultPrevented) return;
    		d3.event.preventDefault();
    	}

    	// Node double left click handler
    	node_dblclick(d) {
    		console.log("Double click");
    	}

        // Node right click handler
    	node_contextmenu(d) {
    		// Unpin node
    		d3.select(this).classed("fixed", d.fixed = false);
    		// HACK: Why doesn't just adding d.fixed = false work?
    		d.fx = null;
    		d.fy = null;
    		simulation.alpha(.3).restart();
    	}

        // Container drag start handler
    	container_drag_start(d) {
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
    	container_drag(d) {
    		d.fx = d3.event.x;
    		d.fy = d3.event.y;
    	}

    	// Container dragend handler
    	container_drag_end(d) {
    		if (!d3.event.active) this._simulation.alphaTarget(0);
    	}

    	// Container right click handler (outside nodes)
    	container_contextmenu(d) {
    		d3.event.preventDefault(); // Prevent context menu from appearing
    	}

    	// Container zoom handler
    	container_zoom() {
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
