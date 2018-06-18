document.addEventListener("DOMContentLoaded", function(event) {
    // Initialize network object
    // viz = eusocial.Network(document.getElementById("viz-container"));
    viz = eusocial.Network("#viz-container");
    // Attach some initial data
    viz.data(les_miserables_data);

    CUR_DATA = 0;

    console.log("Visualization Loaded");
});

function update_data() {
    CUR_DATA = ((CUR_DATA + 1) % 3);

    if (CUR_DATA == 0) {
        viz.data(les_miserables_data);
    }
    else if (CUR_DATA == 1) {
        viz.data(small_les_miserables_data);
    }
    else {
        viz.data(empty_data);
    }
}
