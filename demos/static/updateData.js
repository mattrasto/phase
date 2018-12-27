document.addEventListener("DOMContentLoaded", function(event) {
    // Initialize network object
    viz = phase.Network("#viz-container");
    // Attach some initial data
    viz.data(lesMiserablesData);

    CUR_DATA = 0;

    console.log("Visualization Loaded");
});

function updateData() {
    CUR_DATA = ((CUR_DATA + 1) % 4);

    if (CUR_DATA == 0) {
        viz.data(lesMiserablesData);
    }
    else if (CUR_DATA == 1) {
        viz.data(lesMiserablesMostData);
    }
    else if (CUR_DATA == 2) {
        viz.data(lesMiserablesSmallData);
    }
    else {
        viz.data(emptyData);
    }
}
