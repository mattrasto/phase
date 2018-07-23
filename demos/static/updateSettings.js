document.addEventListener("DOMContentLoaded", function(event) {
    // Initialize network object
    viz = phase.Network("#viz-container");
    // Attach some initial data
    viz.data(lesMiserablesData);

    console.log("Visualization Loaded");
});

function toggleZoom() {
    if (viz.settings().zoom) {
        viz.settings({zoom: false});
    }
    else {
        viz.settings({zoom: true});
    }
}
