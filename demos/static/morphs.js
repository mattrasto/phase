document.addEventListener("DOMContentLoaded", function(event) {
    // Initialize network object
    viz = phase.Network("#viz-container");
    // Attach some initial data
    viz.data(lesMiserablesData);

    createRandGroup();

    console.log("Visualization Loaded");
});

// Create random group of nodes
function createRandGroup() {
    var randNum = Math.floor(Math.random() * 8);
    return viz.nodeGroup("rand_group_1", function(d) { return d.group == randNum; });
}

function createMorphs() {
    viz.morph("color_blue", "style", {"fill": "#7DABFF"});
    viz.morph("change_group", "data", {"group": "200"});
    console.log(viz.getNodeGroup("all")._selection.data());
}

function applyMorphs() {
    viz.getNodeGroup("rand_group_1").morph("color_blue");
    viz.getNodeGroup("rand_group_1").morph("change_group");
    console.log(viz.getNodeGroup("all")._selection.data());
}
