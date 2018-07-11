document.addEventListener("DOMContentLoaded", function(event) {
    // Initialize network object
    viz = phase.Network("#viz-container");
    // Attach some initial data
    viz.data(lesMiserablesData);

    createGroups()

    console.log("Visualization Loaded");
});

// Create Groups of Nodes and Links using both a set and an array
function createGroups() {
    viz.nodeGroup("node_group", new Set(["Pontmercy", "Magnon", "Fantine", "Myriel", "Scaufflaire"]));
    viz.linkGroup("link_group", ["Perpetue", "Gribier", "Labarre", "Gervais", "Thenardier"]);
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
    viz.getNodeGroup("node_group").morph("style_nodes");
    viz.getNodeGroup("node_group").morph("update_nodes");
    viz.getLinkGroup("link_group").morph("style_links");
    viz.getLinkGroup("link_group").morph("update_links");
}
