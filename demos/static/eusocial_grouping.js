document.addEventListener("DOMContentLoaded", function(event) {
    // Initialize network object
    // viz = eusocial.Network(document.getElementById("viz-container"));
    viz = eusocial.Network("#viz-container");
    // Attach some initial data
    viz.data(les_miserables_data);

    // Contains node groups
    GROUPS = []

    change_groups();

    console.log("Visualization Loaded");
});

// Group styling function
// NOTE: It takes no parameters, since it operates on entire groups
function random_color() {
    let colors = ["#63D467", "#63B2D4", "#AE63D4", "#D46363", "#ED9A55", "#E5EB7A"];
    return colors[Math.floor(Math.random() * 6)];
}

function change_groups() {

    if (GROUPS.length > 0) {
        // Unstyle all groups
        viz.unstyle_node_group(GROUPS[0]);
        viz.unstyle_node_group(GROUPS[1]);
        viz.unstyle_node_group(GROUPS[2]);
    }

    GROUPS = []

    // Create groups of nodes based on data groups they belong to
    var rand_num = Math.floor(Math.random() * 8);
    GROUPS.push(viz.create_node_group("rand_group_1", function(d) { return d.group == rand_num; }));
    d3.select("#data-collection-1").text(rand_num);

    rand_num = Math.floor(Math.random() * 8);
    GROUPS.push(viz.create_node_group("rand_group_2", function(d) { return d.group == rand_num; }));
    d3.select("#data-collection-2").text(rand_num);

    rand_num = Math.floor(Math.random() * 8);
    GROUPS.push(viz.create_node_group("rand_group_3", function(d) { return d.group == rand_num; }));
    d3.select("#data-collection-3").text(rand_num);
}

// Style a group with a specific value
function style_group(group_num) {
    viz.style_node_group(GROUPS[group_num - 1], {"fill": random_color()});
}
