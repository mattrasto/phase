document.addEventListener("DOMContentLoaded", function(event) {
    // Initialize network object
    viz = phase.Network("#viz-container");
    // Attach some initial data
    viz.data(lesMiserablesData);

    console.log("Visualization Loaded");
});

// Constructs phase for DFS
function dfsPhase(startNode, timeStep) {
    const oldPhase = viz.getPhase("dfs");
    if (oldPhase) oldPhase.destroy();

    // Initialize phase and stack
    let searchPhase = viz.phase("dfs");

    if(typeof timeStep === "number"){
        searchPhase.updateTimestep(timeStep);
    }

    // Adjacency list for quick access to neighbors
    const childDict = viz.getAdjacencyList();

    function backtrack(phaseState, stack){
        phaseState.depth--;
        phaseState.stack.pop();
        phaseState.currNode = phaseState.stack[phaseState.stack.length - 1];
    }

    // Set the phase's initial state
    searchPhase.initial(function(vizState) {
        searchPhase.state({
            'visited': new Set(), // Nodes we've visited
            'currNode': startNode,
            'depth': 0, // Distance from start node
            'stack': [startNode],
        });
    })

    searchPhase.next(function(phaseState, vizState) {
        let currNode = phaseState.currNode;

        if (!phaseState.visited.has(currNode)) {
            // Mark visited
            phaseState.visited.add(currNode);
            // Apply morph
            const ng = searchPhase.nodeGroup(currNode, [currNode]);
            const morph = createMorph(searchPhase, currNode, phaseState.depth);
            ng.morph(morph.label);
        }

        // Iterate through remaining children
        let visitedChild = false;

        while (!visitedChild && phaseState.stack.length) {
            const adjacent = childDict[currNode];
            for(const node of adjacent){
                if(!phaseState.visited.has(node)){
                    // Add to stack and update current node
                    phaseState.stack.push(node);
                    phaseState.depth++;
                    phaseState.currNode = node;
                    visitedChild = true;
                    break;
                }
            }
            if (!visitedChild) { // Keep backtracking until a node has valid children
                backtrack(phaseState);
                currNode = phaseState.currNode;
            }
        }
    });

    // Tell the phase when to stop
    searchPhase.end(function(phaseState, vizState) {
        return phaseState.stack.length === 0;
    });

    return searchPhase;
}

function createPhase() {
    const startNode = document.getElementById("startNode").value;
    const timeStep = document.getElementById("timeStep").value;
    dfsPhase(startNode, Number(timeStep));
}

// Changes the color of the node based on its distance from the start
function createMorph(searchPhase, currNode, depth) {
    const colors = ["#AE63D4", "#63B2D4", "#63D467", "#E5EB7A", "#ED9A55", "#D46363"];
    return searchPhase.morph("style_nodes_" + currNode, "style", {"fill": colors[depth % colors.length]});
}

// Starts the phase
function startPhase() {
    viz.getPhase("dfs").start();
}

function resetStyles() {
    // Reset
    viz.unstyleGraph();
    viz.getPhase("dfs").reset();
}
