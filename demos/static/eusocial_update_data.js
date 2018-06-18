document.addEventListener("DOMContentLoaded", function(event) {
    // Initialize network object
    viz = eusocial.Network()
    // Attach some initial data
    viz.data(les_miserables_data);
    // Render the network visualization
    viz.render(document.getElementById('viz-container'));

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
