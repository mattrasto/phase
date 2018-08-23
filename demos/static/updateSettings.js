document.addEventListener("DOMContentLoaded", function(event) {
    // Initialize network object
    viz = phase.Network("#viz-container");
    // Attach some initial data
    viz.data(lesMiserablesData);

    console.log("Visualization Loaded");

    for (const elem of document.querySelectorAll("input[type=range]")) {
        elem.addEventListener("input", function(e) {
            elem.nextElementSibling.innerHTML = e.target.value;
        });
    }
});

function changeSettings(prop, val) {
    viz.settings({[prop]: val});
}