document.addEventListener("DOMContentLoaded", function(event) {
    // Initialize network object
    // viz = eusocial.Network(document.getElementById("viz-container"));
    viz = eusocial.Network("#viz-container");
    // Attach some initial data
    viz.data(les_miserables_data);

    console.log("Visualization Loaded");
});

function change_node_color() {
    // Create a group for the node with "id" of "Gribier"
    id_gribier = viz.create_node_group("id_Gribier", "id", "Gribier");
    // Create a group for the nodes with a "group" of 1
    group_1 = viz.create_node_group("group_1", "group", 1);
    // Create a group for the nodes with a "group" of 2 or 3
    group_2 = viz.create_node_group("group_2", function(d) {
        return d.group >= 2;
    });

    // Node styling function
    // NOTE: It takes one parameter, d, that can be used to apply the styling to each node in the group
    function random_node_color(d) {
        return d.group == 2 ? "#63D467" : "#63B2D4";
    }

    // Group styling function
    // NOTE: It takes no parameters, since it operates on entire groups
    function random_group_color() {
        let colors = ["#AE63D4", "#D46363", "#ED9A55", "#E5EB7A"];
        return colors[Math.floor(Math.random() * 4)];
    }

    // Style this group with a specific value
    viz.style_node_group(id_gribier, {"fill": "blue"});
    // Style this group with a random color for each node
    viz.style_node_group(group_1, {"fill": random_group_color});
    // Style this group with the same color by evaluating then applying the result
    viz.style_node_group(group_2, {"fill": random_node_color});

    console.log(viz.get_groups());
}
