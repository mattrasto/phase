document.addEventListener("DOMContentLoaded", function(event) {
    // Initialize network object
    viz = phase.Network("#viz-container");
    // Attach some initial data
    viz.data(lesMiserablesData);

    viz.settings({"linkWidth": 4})

    changeGroups();

    console.log("Visualization Loaded");
});

// Group styling function
// NOTE: It takes no parameters, since it only operates on entire groups
function randomColor() {
    let colors = ["#63D467", "#63B2D4", "#AE63D4", "#D46363", "#ED9A55", "#E5EB7A"];
    return colors[Math.floor(Math.random() * 6)];
}

function changeGroups() {

    // Unstyle all links
    viz.getLinkGroup("all").unstyle();

    // Create groups of nodes based on data groups they belong to
    var randNum = Math.floor(Math.random() * 8);
    viz.linkGroup("rand_group_1", function(d) { return d.value == randNum; });
    d3.select("#data-collection-1").text(randNum);

    randNum = Math.floor(Math.random() * 8);
    viz.linkGroup("rand_group_2", function(d) { return d.value == randNum; });
    d3.select("#data-collection-2").text(randNum);

    randNum = Math.floor(Math.random() * 8);
    viz.linkGroup("rand_group_3", function(d) { return d.value == randNum; });
    d3.select("#data-collection-3").text(randNum);

    // Display all link groups
    console.log(viz.getAllLinkGroups());
}

// Style a group with a specific value
function styleGroup(groupNum) {
    viz.getLinkGroup("rand_group_" + groupNum).style({"stroke": randomColor()});
}
