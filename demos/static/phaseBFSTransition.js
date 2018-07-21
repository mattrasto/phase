document.addEventListener("DOMContentLoaded", function(event) {
    // Initialize network object
    viz = phase.Network("#viz-container");
    // Attach some initial data
    viz.data(lesMiserablesData);

    console.log("Visualization Loaded");
});

// Constructs phase for BFS
function bfsPhase(startNode) {
    viz.resetGraph()
    // Initialize phase with root node
    let searchPhase = viz.phase("bfs");

    // Keeps track of node depth
    let depth = 0;

    let morph = createMorph(depth++);
    let ng = viz.nodeGroup(startNode, "id", startNode)
    let root = searchPhase.root(ng.label, morph);

    // Adjacency list for quick access to neighbors
    const childDict = viz.getGraph();

    searchPhase.state({
        'visited': new Set([startNode]), // Nodes we've visited
        'validNeighbor': new Set([startNode]), // Neighbors that haven't been visited
    });

    searchPhase.next(function() {
        let state = searchPhase.state();
        let newValidNeighbor = new Set();

        state.validNeighbor.forEach(node => {
            childDict[node].forEach(child => {
                if(!state.visited.has(child)) {
                    newValidNeighbor.add(child);
                    state.visited.add(child);
                }
            });
        });

        searchPhase.state({'validNeighbor': newValidNeighbor});

        // Add a node group and branch
        const ng = viz.nodeGroup("depth_" + depth, newValidNeighbor);
        morph = createMorph(depth++);
        console.log(morph);
        ng.morph(morph.label);
    });

    searchPhase.stop(function() {
        return searchPhase.state().validNeighbor.size <= 0;
    });

    return searchPhase;
}

function createPhase() {
    const startNode = document.getElementById("startNode").value;
    bfsPhase(startNode);
}

// Creates the morph that changes the color of the node
function createMorph(depth) {
    const colors = ["#63D467", "#63B2D4", "#AE63D4", "#D46363", "#ED9A55", "#E5EB7A"];
    return viz.morph("style_nodes_" + depth, "style", {"fill": colors[depth % colors.length]});
}

// Starts the phase
function startPhase() {
    console.log(viz.getPhase("bfs")._transitions);
    viz.getPhase("bfs").start();
}
