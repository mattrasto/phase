document.addEventListener("DOMContentLoaded", function(event) {
    // Initialize network object
    viz = phase.Network("#viz-container");
    // Attach some initial data
    viz.data(lesMiserablesData);

    var groups = nextGroup();
    var _phase = createPhase(createMorph(), groups);

    console.log("Visualization Loaded");
});

// Creates the morph that changes the color of the node
function createMorph() {
    return viz.morph("style_nodes", "style", {"fill": "#7DABFF"});
}

// Creates the phase
function createPhase(morph, groups) {
    var phase = viz.phase("random_order_coloring");
    var root = phase.root(groups[0], morph);
    for (var i = 1; i < groups.length; i++) {
        root = root.branch(groups[i], morph.label);
    }
    return phase;
}

// Starts the phase
function startPhase() {
    viz.getPhase("random_order_coloring").start();
}

// Retrieves the next
function nextGroup() {
    var groups = [];
    for (var i = 0; i < 11; i++) {
        groups.push(viz.nodeGroup("group_" + i, "group", i));
    }
    return groups;
}
