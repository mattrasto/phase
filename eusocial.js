window.eusocial = (function () {
    class Network {
        constructor() {
            console.log("Network constructed");
        }

        // Bind data to the viz
        data(data) {
            console.log("Binding data to viz")
        }

        render(selector) {
            console.log("Rendering on " + selector)
        }
    }

    var eusocial = {
        Network: function() {
            return new Network();
        },

        select: function(selector) {
            var el;
            if (typeof selector === "string") {
                el = document.querySelectorAll(selector);
            } else if (selector.length) {
                el = selector;
            } else {
                el = [selector];
            }
            return new EusocialGraph(el);
        },
    };

    return eusocial;
}());
