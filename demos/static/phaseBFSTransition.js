document.addEventListener("DOMContentLoaded", function(event) {
    // Initialize network object
    viz = phase.Network("#viz-container");
    // Attach some initial data
    viz.data(lesMiserablesData);

    console.log("Visualization Loaded");
});

// Constructs phase for BFS
function bfsPhase(startNode) {

    viz.resetGraph();

    // Initialize phase
    let searchPhase = viz.phase("bfs");

    // Set the phase's initial state
    searchPhase.initial(function(vizState) {
        searchPhase.state({
            'visited': new Set([startNode]), // Nodes we've visited
            'validNeighbors': new Set([startNode]), // Neighbors that haven't been visited
            'depth': 0, // Distance from start node
        });
    });

    searchPhase.next(function(phaseState, vizState) {
        let newValidNeighbors = new Set();

        // Adjacency list for quick access to neighbors
        const childDict = viz.getGraph();

        // Morph the next layer in the BFS
        const ng = viz.nodeGroup("depth_" + phaseState.depth, phaseState.validNeighbors);
        const morph = createMorph(phaseState.depth++);
        ng.morph(morph.label);

        // Classic BFS
        phaseState.validNeighbors.forEach(node => {
            childDict[node].forEach(child => {
                if(!phaseState.visited.has(child)) {
                    newValidNeighbors.add(child);
                    phaseState.visited.add(child);
                }
            });
        });

        // Update the valid neighbors in the phase's state
        phaseState.validNeighbors = newValidNeighbors;
    });

    // Tell the phase when to stop
    searchPhase.end(function(phaseState, vizState) {
        return phaseState.validNeighbors.size <= 0;
    });

    return searchPhase;
}

function createPhase() {
    const startNode = document.getElementById("startNode").value;
    bfsPhase(startNode);
}

// Changes the color of the node based on its distance from the start
function createMorph(depth) {
    const colors = ["#AE63D4", "#63B2D4", "#63D467", "#E5EB7A", "#ED9A55", "#D46363"];
    return viz.morph("style_nodes_" + depth, "style", {"fill": colors[depth % colors.length]});
}

// Starts the phase
function startPhase() {
    viz.getPhase("bfs").start();
}
