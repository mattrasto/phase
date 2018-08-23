document.addEventListener("DOMContentLoaded", function(event) {
    // Initialize network object
    viz = phase.Network("#viz-container");
    // Attach some initial data
    viz.data(lesMiserablesData);

    viz.getLinkGroup("all").addStyle({"stroke-width": "5px"});

    console.log("Visualization Loaded");
});

function changeMouseover() {
    viz.getNodeGroup("all").event("mouseover", function(d, node, label) {
        node.style("stroke", "red").style("stroke-width", "3px");
    });

    viz.getNodeGroup("all").event("mouseover", function(d, node, label) {
        node.style("stroke", "green").style("stroke-width", "3px");
    });

    viz.getLinkGroup("all").event("mouseover", function(d, link, label) {
        link.style("stroke", "red").style("stroke-width", "10px");
    });

    viz.getLinkGroup("all").event("mouseout", function(d, link, label) {
        link.style("stroke", "#333");
    });
}
