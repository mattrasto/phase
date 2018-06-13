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
                console.log("Updating data");
            }
            console.log("Bound data to viz")
        }

        // Render viz element in container
        render(query) {
            let c;
            if (typeof selector === "string") {
                c = document.querySelectorAll(query);
            }
            else {
                c = query;
            }
            this._container = c;

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
        			// .on("zoom", container_zoom))
                )
        		.on("dblclick.zoom", null); // Don't zoom on double left click

            c.appendChild(this._svg.node());

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
    			// .on("mouseover", node_mouseover)
    			// .on("mouseout", node_mouseout)
    			// .on("mousedown", node_mousedown)
    			// .on("click", node_click)
    			// .on("dblclick", node_dblclick)
    			// .on("contextmenu", node_contextmenu)
    			// .call(d3.drag()
    			// 	.on("start", container_drag_start)
    			// 	.on("drag", container_drag)
    			// 	.on("end", container_drag_end));

            // Initializes simulation
    		this._simulation
    			.nodes(this._data.nodes)
    			.on("tick", () => this.ticked(this._node, this._link))
    			.force("link")
    				.links(this._data.links);

            console.log("Rendering on " + c.id)
        }

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
    }

    var eusocial = {
        Network: function() {
            return new Network();
        }
    };

    return eusocial;
}());
