document.addEventListener("DOMContentLoaded", function(event) {
    // Initialize network object
    viz = phase.Network("#viz-container");
    // Attach some initial data
    viz.data(lesMiserablesData);

    console.log("Visualization Loaded");

    console.log(viz._eventHandlers["nodeMouseover"]);
});

function changeMouseover() {
    viz._addEventHandler("nodeMouseover", function(d) {
        d3.select(this.childNodes[0]).style("stroke", "red").style("stroke-width", "3px");
    });
    console.log(viz._eventHandlers["nodeMouseover"]);
}
