document.addEventListener("DOMContentLoaded", function(event) {
    // Initialize network object
    viz = phase.Network("#viz-container");
    // Attach some initial data
    viz.data(lesMiserablesData);

    createRandGroups();

    console.log("Visualization Loaded");
});

// Create random groups of nodes and links
function createRandGroups() {
    const randNum = Math.floor(Math.random() * 6);
    viz.nodeGroup("rand_node_group", function(d) { return d.group == randNum; });
    viz.linkGroup("rand_link_group", function(d) { return d.value == randNum; });
}

function createMorphs() {
    viz.resetGraph()
    // Node styling morph
    viz.morph("style_nodes", "style", {"fill": "#7DABFF", "stroke": "#AE63D4", "stroke-width": "3px"});
    // Node data morph
    viz.morph("update_nodes", "data", {"group": "200"});
    // Link styling morph
    viz.morph("style_links", "style", {"stroke": "#D46363", "stroke-width": "3px"});
    // Link data morph
    viz.morph("update_links", "data", {"value": "200"});
}

function applyMorphs() {
    viz.getNodeGroup("rand_node_group").morph("style_nodes");
    viz.getNodeGroup("rand_node_group").morph("update_nodes");
    viz.getLinkGroup("rand_link_group").morph("style_links");
    viz.getLinkGroup("rand_link_group").morph("update_links");
}
