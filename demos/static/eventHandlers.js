document.addEventListener("DOMContentLoaded", function(event) {
    // Initialize network object
    viz = phase.Network("#viz-container");
    // Attach some initial data
    viz.data(lesMiserablesData);

    console.log("Visualization Loaded");

    console.log(viz._styles);
});

function changeMouseover() {
    viz.getNodeGroup("all").event("mouseover", function(d) {
        d3.select(this.childNodes[0]).style("stroke", "red").style("stroke-width", "3px");
    });

    viz.getNodeGroup("all").event("mouseover", function(d) {
        d3.select(this.childNodes[0]).style("stroke", "green").style("stroke-width", "3px");
    });

    viz.getLinkGroup("all").event("mouseover", function(d) {
        d3.select(this.childNodes[0]).style("stroke", "red");
    });

    viz.getLinkGroup("all").event("mouseout", function(d) {
        d3.select(this.childNodes[0]).style("stroke", "#333");
    });
}
