window.eusocial = (function () {
    class Network {
        constructor() {
            this._data = {}
            this._container = null;
            this._svg = null;
            console.log("Network constructed");
        }

        // Bind data to the viz
        data(data) {
            this._data = data;
            console.log("Binding data to viz")
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

            var width = this._container.getBoundingClientRect().width;
        	var height = this._container.getBoundingClientRect().height;

            // Adds svg box and allows it to resize / zoom as needed
        	let viz_svg = d3.select(this._container).append("svg")
                .attr("id", "eusocial-network")
        		.attr("width", "100%")
        		.attr("height", "100%")
        		.attr("viewBox","0 0 " + Math.min(width, height) + " " + Math.min(width, height))
        		.attr("preserveAspectRatio", "xMinYMin")
        		// .on("contextmenu", container_contextmenu)
        		.call(d3.zoom()
        			.scaleExtent([.1, 10])
        			// .on("zoom", container_zoom))
                )
        		.on("dblclick.zoom", null); // Don't zoom on double left click

            this._svg = viz_svg;

            c.appendChild(viz_svg.node());

            console.log("Rendering on " + c.id)
        }
    }

    var eusocial = {
        Network: function() {
            return new Network();
        }
    };

    return eusocial;
}());
