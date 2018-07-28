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

function toggleZoom() {
    if (viz.settings().zoom) {
        viz.settings({zoom: false});
    }
    else {
        viz.settings({zoom: true});
    }
}

function changeGravity(newVal) {
    viz.settings({gravity: newVal});
}

function changeCharge(newVal) {
    viz.settings({charge: newVal});
}

function changeLinkStrength(newVal) {
    viz.settings({linkStrength: newVal});
}

function changeLinkDistance(newVal) {
    viz.settings({linkDistance: newVal});
}

function changeNodeSize(newVal) {
    viz.settings({nodeSize: newVal});
}

function changeLinkWidth(newVal) {
    viz.settings({linkWidth: newVal});
}

function changeNodeColor(newVal) {
    viz.settings({nodeColor: newVal});
}

function changeNodeBorderColor(newVal) {
    viz.settings({nodeBorderColor: newVal});
}

function changeLinkColor(newVal) {
    viz.settings({linkColor: newVal});
}
