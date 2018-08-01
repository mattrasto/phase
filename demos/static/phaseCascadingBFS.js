document.addEventListener("DOMContentLoaded", function(event) {
    // Initialize network object
    viz = phase.Network("#viz-container");
    // Attach some initial data
    viz.data(lesMiserablesData);

    console.log("Visualization Loaded");
});

// Constructs phase for BFS
function bfsPhase(startNodes) {

    // Reset
    viz.unstyleGraph();
    viz.destroyPhase("bfs");

    // Initialize phase
    const searchPhase = viz.phase("bfs");

    // Set the phase's initial state
    searchPhase.initial(function(vizState) {
        searchPhase.state({
            'visited': new Set(startNodes), // Nodes we've visited
            'validNeighbors': new Set(startNodes), // Neighbors that haven't been visited
            'depth': 0, // Distance from start node
        });
    });

    // Adjacency list for quick access to neighbors
    const childDict = viz.getAdjacencyList();

    searchPhase.next(function(phaseState, vizState) {
        let newValidNeighbors = new Set();
        viz.unstyleGraph();

        // Morph the next layer in the BFS
        const ng = searchPhase.nodeGroup("depth_" + phaseState.depth, phaseState.validNeighbors);
        const morph = createMorph(searchPhase, phaseState.depth++);
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
        const done = phaseState.validNeighbors.size <= 0;
        if(done){ //Unstyle last layer and return
            setTimeout(() => viz.unstyleGraph(), 500);
            return true;
        }
        return false;
    });

    return searchPhase;
}

function createPhase() {
    const startNode = document.getElementById("startNode").value;
    bfsPhase([startNode]);
}

// Changes the color of the node based on its distance from the start
function createMorph(searchPhase, depth) {
    const color = "#63B2D4";
    return searchPhase.morph("style_nodes_" + depth, "style", {"fill": color});
}

// Starts the phase
function startPhase() {
    viz.getPhase("bfs").start();
}
