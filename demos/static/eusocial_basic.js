document.addEventListener("DOMContentLoaded", function(event) {
    // Initialize network object
    viz = eusocial.Network()
    // Attach some initial data
    viz.data(les_miserables_data)
    // Render the network visualization
    viz.render(document.getElementById('viz-container'));

    console.log("Visualization Loaded");
});
