document.addEventListener("DOMContentLoaded", function(event) {
    // Initialize network object
    viz = phase.Network("#viz-container");
    // Attach some initial data
    viz.data(lesMiserablesData);

    console.log("Visualization Loaded");
});

function toggleZoom() {
    if (viz.settings()._ZOOM) {
        viz.settings({_ZOOM: false});
    }
    else {
        viz.settings({_ZOOM: true});
    }
}
