document.addEventListener("DOMContentLoaded", function(event) {
    // Initialize network object
    viz = phase.Network("#viz-container");
    // Attach some initial data
    viz.data(lesMiserablesData);

    const childDict = createChildDict();
    const startNode = "Brujon";
    const bfs = createPhase(createMorph(), childDict, startNode);

    console.log("Visualization Loaded");
});

// Create a dict containing the children of each node
function createChildDict(){
    const links = lesMiserablesData.links;
    const nodes = lesMiserablesData.nodes;
    let childDict = {}
    nodes.forEach(node => {
        childDict[node.id] = []
    });
    // Bidirectional
    links.forEach(link => {
        childDict[link.source.id].push(link.target.id);
        childDict[link.target.id].push(link.source.id);
    });
    return childDict;
}

// Constructs phase for BFS
function createPhase(morph, childDict, startNode) {
    // Initialize phase with root node
    let phase = viz.phase("bfs");
    let root = phase.root(viz.nodeGroup(startNode, "id", startNode), morph);

    // Contains visited nodes
    let visited = new Set();
    // Contains children in a given layer that haven't been visited
    let validChildren = new Set([startNode]);
    // Contains children in the next layer
    let newValidChildren;

    while (validChildren.size > 0) {
        // Get all children in the next layer that haven't been visited
        let newValidChildren = new Set();
        validChildren.forEach(node => {
            childDict[node].forEach(child => {
                if(!visited.has(child)) {
                    newValidChildren.add(child);
                    visited.add(child);
                }
            });
        });

        validChildren = newValidChildren;

        // Add a node group and branch
        function filter(elem) {
            return validChildren.has(elem.id);
        }
        // It doesn't matter what we call this group
        let ng = viz.nodeGroup("_", filter);
        root = root.branch(ng, morph._label);
    }

    return phase;
}

// Creates the morph that changes the color of the node
function createMorph() {
    return viz.morph("style_nodes", "style", {"fill": "#7DABFF"});
}

// Starts the phase
function startPhase() {
    viz.getPhase("bfs").start();
}
