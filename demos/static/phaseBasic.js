document.addEventListener("DOMContentLoaded", function(event) {
    // Initialize network object
    viz = phase.Network("#viz-container");
    // Attach some initial data
    viz.data(lesMiserablesData);

    var _phase = createPhase();

    console.log("Visualization Loaded");
});

// Creates the phase
function createPhase() {
    const basicPhase = viz.phase("random_order_coloring");

    const morph = viz.morph("style_nodes", "style", {"fill": "#7DABFF"});

    basicPhase.initial(function(vizState) {
        basicPhase.state({"val": 0});
    });

    basicPhase.next(function(phaseState, vizState) {
        viz.nodeGroup("group_" + phaseState.val, "group", phaseState.val).morph(morph.label);
        phaseState.val++;
    });

    basicPhase.end(function(phaseState) {
        return phaseState.val >= 11;
    });

    return phase;
}

// Starts the phase
function startPhase() {
    viz.getPhase("random_order_coloring").start();
}
