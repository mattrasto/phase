window.eusocial = (function () {
    class Network {
        constructor() {
            this._data = {}
            this._container = null;
            console.log("Network constructed");
        }

        // Bind data to the viz
        data(data) {
            this._data = data;
            console.log("Binding data to viz")
        }

        render(query) {
            let c;
            if (typeof selector === "string") {
                c = document.querySelectorAll(query);
            }
            else {
                c = query;
            }
            this._container = c;

            let viz_el = document.createElement('div')
            viz_el.classList.add("eusocial-network");

            c.appendChild(viz_el);

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
