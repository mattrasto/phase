document.addEventListener("DOMContentLoaded", function(event) {
    // Initialize network object
    viz = phase.Network("#viz-container")
    // Attach some initial data
    viz.data(les_miserables_data)

    console.log("Visualization Loaded");
});
