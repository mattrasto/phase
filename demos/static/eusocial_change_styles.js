document.addEventListener("DOMContentLoaded", function(event) {
    // Initialize network object
    // viz = eusocial.Network(document.getElementById("viz-container"));
    viz = eusocial.Network("#viz-container");
    // Attach some initial data
    viz.data(les_miserables_data);

    NODE_COLOR_SETTING = 0;

    console.log("Visualization Loaded");
});

function change_node_color() {
    NODE_COLOR_SETTING = (NODE_COLOR_SETTING + 1) % 4;

    if (NODE_COLOR_SETTING == 0) {
        viz.node("Labarre").attr("fill", "#7DABFF");
    }
    else if (NODE_COLOR_SETTING == 1) {
        viz.nodeStyle("color", "#7DABFF");
    }
    else if (NODE_COLOR_SETTING == 2) {
        viz.nodeStyle({"color": "#7DABFF"});
    }
    else if (NODE_COLOR_SETTING == 3) {
        viz.nodeStyle("color", function(d) {
            return "#7DABFF";
        });
    }
}
