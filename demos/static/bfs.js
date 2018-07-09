document.addEventListener("DOMContentLoaded", function(event) {
    // Initialize network object
    viz = phase.Network("#viz-container");
    // Attach some initial data
    viz.data(lesMiserablesData);

    const children = createDict();
    const rootNode = "Brujon";
    const bfs = bfsPhase(createMorph(), children, rootNode);

    console.log("Visualization Loaded");
});

// Create a children containing the children of each node
function createDict(){
    const links = lesMiserablesData.links;
    const nodes = lesMiserablesData.nodes;
    let children = {}
    nodes.forEach(node => {
        children[node.id] = []
    });
    links.forEach(link => { //Bidirectional
        children[link.source.id].push(link.target.id);
        children[link.target.id].push(link.source.id);
    });
    return children
}

// Constructs phase for bfs
function bfsPhase(morph, children, rootNode){
    let visited = {};
    // Initialize phase with root node
    let phase = viz.phase("bfs");
    let root = phase.root(viz.nodeGroup(rootNode, "id", rootNode), morph);

    //Contains children in a given layer that have not been visited
    let validChildren = {};
    function filter(elem){
        return validChildren[elem.id] !== undefined;
    }

    validChildren[rootNode] = true;
    let dist = 1; // Distance away from root
    while(Object.keys(validChildren).length){
        // Populate the next layer
        Object.keys(validChildren).forEach(node => {
            delete validChildren[node];

            children[node].forEach(child => {
                if(visited[child] === undefined) {
                    validChildren[child] = true;
                    visited[child] = true;
                }
            });

        });
        //Add a node group and branch
        let ng = viz.nodeGroup("dist " + dist, filter, dist++);
        root = root.branch(ng, morph.label);
    }

    return phase
}

// Creates the morph that changes the color of the node
function createMorph() {
    return viz.morph("style_nodes", "style", {"fill": "#7DABFF"});
}

// Starts the phase
function startPhase() {
    viz.getPhase("bfs").start();
}
