$(document).ready(function() {

	$("#sidebar").resizable({
			handles: "w",
			minWidth: 200,
			maxWidth: 1000,
			resize: function(event, ui) {
				$("#viz-container").width($(window).width() - $("#sidebar").width() - 102);
				// Prevents sidebar from sliding left / right
				$("#sidebar").css("right", 0);
				$("#sidebar").css("left", 0);
				// console.log("window: " + $(window).width());
				// console.log("sidebar: " + $("#sidebar").width());
				// console.log("window - sidebar: " + ($(window).width() - $("#sidebar").width()));
				// console.log("viz-container: " + $("#viz-container").width());
			},
			stop: function(event, ui) {}
	});

	init_viz();

	console.log("Visualization Loaded");
});

// Toggles the settings menu
function toggle_settings() {
	$("#settings-menu").toggle(300, function() {
		if ($("#settings-menu").is(":visible")) {
			$("#toggle-settings").css("background-color", "#666");
			$("#toggle-settings").css("border-top-right-radius", "0px");
			$("#toggle-settings").css("border-bottom-right-radius", "0px");
		}
		else {
			$("#toggle-settings").css("background-color", "");
			$("#toggle-settings").css("border-top-right-radius", "5px");
			$("#toggle-settings").css("border-bottom-right-radius", "5px");
		}
	});
}

// Gets JSON data and initializes D3 force graph
function init_viz() {

	// ID of root node
	ROOT_ID = "machine_learning";
	// Should the root node be centered?
	CENTER_ROOT = true;
	// Strength of links (how easily they can be compressed) between nodes [0, INF]
	LINK_STRENGTH = 1;
	// Distance between nodes [0, INF]
	LINK_DISTANCE = 60;
	// Charge between nodes [-INF, INF]
	CHARGE = -800;
	// How easily particles are dragged across the screen [0, 1]
	FRICTION = .8;
	// Node coloring scheme. Possible values:
	// "DISTANCE": Color nodes ordinally based on their "distance" attribute using the COLOR_KEY_DISTANCE map
	COLOR_MODE = "DISTANCE";
	// Colors assigned to each distance when COLOR_MODE = "DISTANCE"
	COLOR_KEY_DISTANCE = ["#63D467", "#63B2D4", "#AE63D4", "#D46363", "#ED9A55", "#E5EB7A"];
	// Determines the style of links based on their "type" attribute
	// Values should be an even-length array for alternating black / white segments in px
	LINK_STYLE = {"derivative": "", "related": "10,8"}
	// Method by which the distance from root is calculated. Possible values:
	// "SOURCE": Calculate by traversing source relationships
	// "SHORTEST": Calculate by using Dijkstra's algorithm to find graph-wide shortest distance
	DISTANCE_MODE = "SOURCE";
	// Base node size
	SIZE_BASE = 10;
	// Factor by which to multiply the inverse distance from root in calculating node size
	SIZE_DISTANCE_MULTIPLIER = 25;
	// Factor by which to multiply number of connections in calculating node size
	SIZE_CONNECTIONS_MULTIPLIER = 1.5;
	// Opacity that a node fades to on node hover
	NODE_FADE_OPACITY = .4;
	// Opacity that a link fades to on node hover
	LINK_FADE_OPACITY = .1;
	// Whether to hide nodes with no description
	HIDE_EMPTY_NODES = false;
	// If true, nodes will be collapsed when they are hidden (via the collapsing of a parent node)
	COLLAPSE_HIDDEN = false;

	var graph; // Working copy of graph used in functions
	var original_graph; // Original copy of graph used for restoring nodes
	var link_map; // Maps a node to an array of its links



	// Gets container size
	var outer_container = $("#viz-container");
	var width = outer_container.width();
	var height = outer_container.height();

	// Adds svg box and allows it to resize / zoom as needed
	var svg = d3.select("#viz-container").append("svg")
		.attr("width", "100%")
		.attr("height", "100%")
		.attr("viewBox","0 0 " + Math.min(width, height) + " " + Math.min(width, height))
		.attr("preserveAspectRatio", "xMinYMin")
		.on("contextmenu", container_contextmenu)
		.call(d3.zoom()
			.scaleExtent([.1, 10])
			.on("zoom", container_zoom))
		.on("dblclick.zoom", null); // Don't zoom on double left click

	// Creates actual force graph container (this is what actually gets resized as needed)
	var container = svg.append("g")

	// Initializes force graph simulation
	// NOTE: simulation is global so it can be accessed by outside functions
	// TODO: Create api for upating simulation so we can make this private
	simulation = d3.forceSimulation()
		.force("link", d3.forceLink().id(function(d) { return d.id; }).distance(LINK_DISTANCE).strength(LINK_STRENGTH))
		.force("charge", d3.forceManyBody().strength(CHARGE))
		.force("center", d3.forceCenter(width / 2, height / 2))

	// d3.json("/workshop/json/ai_concept_map_all.json", function(error, _graph) {
	// 	if (error) throw error;

		// Transfer scope
		original_graph = _graph;

		// QUESTION: Are all of these necessary? Probably not
		original_id_map = generate_id_map(original_graph);
		original_link_map = generate_link_map(original_graph, original_id_map);
		original_graph = calculate_node_distances(original_graph, original_link_map);

		update();
	// });

	// Updates the simulation
	function update() {

		// Recalculate from original to pick up unhidden nodes and in case HIDE_EMPTY_NODES changed
		graph = filter_nodes(original_graph, original_id_map);

		// HACK: Removes old nodes and links
		d3.selectAll(".nodes").remove();
		d3.selectAll(".links").remove();

		// Appends links to container
		var link = container.append("g")
			.attr("class", "links")
			.selectAll("line")
			// Filters out links with a hidden source or target node
			.data(graph.links)
			.enter().append("line")
				.attr("class", "link")
				.attr("stroke-width", 1.5)
				.attr("stroke-dasharray", link_style);

		// Appends nodes to container
		var node_container = container.append("g")
			.attr("class", "nodes")
			.selectAll("g")
			// Filters out hidden nodes and nodes without a description
			.data(graph.nodes)
			.enter().append("g")
			.attr("class", "node")
			.on("mouseover", node_mouseover)
			.on("mouseout", node_mouseout)
			.on("mousedown", node_mousedown)
			.on("click", node_click)
			.on("dblclick", node_dblclick)
			.on("contextmenu", node_contextmenu)
			.call(d3.drag()
				.on("start", container_drag_start)
				.on("drag", container_drag)
				.on("end", container_drag_end));

		// Add node circles
		node_container
			.append("circle")
				.attr("r", node_size)
				.attr("fill", node_color)
				.attr("stroke", node_border_color)
				.attr("stroke-width", node_border_width);

		// Add node labels
		node_container
			.append("text")
				.attr("dx", 12)
				.attr("dy", ".35em")
				.style("color", "#333")
				.text(function(d) { return d.name });

		// Initializes simulation
		simulation
			.nodes(graph.nodes)
			.on("tick", ticked)
			.force("link")
				.links(graph.links);

		// Calculates new node and link positions every tick
		function ticked() {

			if (CENTER_ROOT) {
				node_container
					.attr("transform", function(d) {
						if (d.id == ROOT_ID) {
							d.x = width / 2;
							d.y = height / 2;
							d.fx = width / 2;
							d.fy = height / 2;
						}
						return "translate(" + d.x + "," + d.y + ")";
					});
			}
			else {
				node_container
					.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
			}

			link
				.attr("x1", function(d) { return d.source.x; })
				.attr("y1", function(d) { return d.source.y; })
				.attr("x2", function(d) { return d.target.x; })
				.attr("y2", function(d) { return d.target.y; });
		}
	}



	// STYLES



	// Sizes nodes
	function node_size(d) {
		return (1 / (d.distance + 1)) * SIZE_DISTANCE_MULTIPLIER + (original_link_map[d.id].length - 1) * SIZE_CONNECTIONS_MULTIPLIER + SIZE_BASE;
	}

	// Color nodes depending on COLOR_MODE
	function node_color(d) {
		if (COLOR_MODE == "DISTANCE") {
			if (d.distance == undefined) return "#333";
			return COLOR_KEY_DISTANCE[d.distance % COLOR_KEY_DISTANCE.length];
		}
		// Default scheme: all dark grey
		return "#333";
	}

	// Colors node borders depending on if they are leaf nodes or not
	function node_border_color(d) {
		// Only one link means it is the target
		if (original_link_map[d.id].filter(function(link) { return link.type == "derivative"; }).length == 1 && d.id != ROOT_ID) return "#333";
		return "#F7F6F2";
	}

	// Draws node borders depending on if they are leaf nodes or not
	function node_border_width(d) {
		// Only one link means it is the target
		if (original_link_map[d.id].length == 1 && d.id != ROOT_ID) return "1.6px";
		return ".8px";
	}

	// Draws links as dash arrays based on their type
	function link_style(d) {
		return LINK_STYLE[d.type];
	}



	// EVENT LISTENERS



	// Node mouseover handler
	function node_mouseover(d) {
		// Create array of linked node ids
		linked_nodes = [];
		for (var i = 0; i < original_link_map[d.id].length; i++) {
			if (linked_nodes.indexOf(original_link_map[d.id][i]["source"].id) == -1) linked_nodes.push(original_link_map[d.id][i]["source"].id);
			if (linked_nodes.indexOf(original_link_map[d.id][i]["target"].id) == -1) linked_nodes.push(original_link_map[d.id][i]["target"].id);
		}
		// Add nodes on path to root (by traversing up "derivative" links) to array
		var cur_id = d.id;
		while (cur_id != ROOT_ID) {
			for (var i = 0; i < original_link_map[d.id].length; i++) {
				if (original_link_map[cur_id][i]["target"].id == cur_id && original_link_map[cur_id][i]["type"] == "derivative") {
					cur_id = original_link_map[cur_id][i]["source"].id;
					linked_nodes.push(cur_id);
					break;
				}
			}
		}
		// Update opacity of all nodes except immediately linked nodes
		d3.selectAll(".node").transition().attr("opacity", function(x) {
			if (linked_nodes.indexOf(x.id) == -1) {
				return NODE_FADE_OPACITY;
			}
			return "1";
		});
		// Update opacity of all links except immediate links
		d3.selectAll(".link").transition().attr("opacity", function(x) {
			if (linked_nodes.indexOf(x.source.id) >= 0 && linked_nodes.indexOf(x.target.id) >= 0) {
				return 1;
			}
			return LINK_FADE_OPACITY;
		});
	}

	// Node mouseout handler
	function node_mouseout(d) {
		d3.selectAll(".node").transition().attr("opacity", "1");
		d3.selectAll(".link").transition().attr("opacity", "1");
	}

	// Node mousedown handler
	function node_mousedown(d) {
		// console.log("click");
		// console.log(d.fixed);
		if (d3.event.defaultPrevented) return;
		d3.event.preventDefault(); // Prevent middle click scrolling
		// Unpin node if middle click
		if (d3.event.which == 2) {
			d3.select(this).classed("fixed", d.fixed = false);
			d.fx = null;
			d.fy = null;
		}
		simulation.alpha(.3).restart();
	}

	// Node left click handler
	function node_click(d) {
		if (d3.event.defaultPrevented) return;
		d3.event.preventDefault();
		// Left click: update sidebar
		if (d3.event.which == 1) {
			update_sidebar(d);
		}
	}

	// Node double left click handler
	function node_dblclick(d) {
		// console.log("dblclick");
		// console.log(d.fixed);
		toggle_node(d, true);
		update();
		// Don't pin node if it wasn't before (dblclick triggers click listener, pinning node)
		// TODO: Fix this
		if (!d.fixed) {
			d3.select(this).classed("fixed", d.fixed = false);
			d.fx = null;
			d.fy = null;
		}
	}

	// Node right click handler
	function node_contextmenu(d) {
		// Unpin node
		d3.select(this).classed("fixed", d.fixed = false);
		// HACK: Why doesn't just adding d.fixed = false work?
		d.fx = null;
		d.fy = null;
		simulation.alpha(.3).restart();
	}

	// Container drag start handler
	function container_drag_start(d) {
		// TODO: Why doesn't this prevent the simulation from being restarted when user tries to drag a centered root?
		// NOTE: Maybe it's part of .call(d3.drag()...)?
		if (CENTER_ROOT && d.id == ROOT_ID) return;
		if (!d3.event.active) simulation.alphaTarget(0.3).restart();
		d.fx = d.x;
		d.fy = d.y;
		// Fixes node in place
		d3.select(this).classed("fixed", d.fixed = true);
	}

	// Container drag handler
	function container_drag(d) {
		d.fx = d3.event.x;
		d.fy = d3.event.y;
	}

	// Container dragend handler
	function container_drag_end(d) {
		if (!d3.event.active) simulation.alphaTarget(0);
	}

	// Container right click handler (outside nodes)
	function container_contextmenu(d) {
		d3.event.preventDefault(); // Prevent context menu from appearing
	}

	// Container zoom handler
	function container_zoom() {
		container.attr("transform", d3.event.transform);
	}
}



// UTILITY FUNCTIONS



// Creates dictionary for identifying node objects by their id
// {
// 	"id_1": <Node>,
// 	...
// }
function generate_id_map(graph) {
	var id_map = {}
	for (var i = 0; i < graph.nodes.length; i++) {
		id_map[graph.nodes[i].id] = graph.nodes[i];
	}
	return id_map;
}

// Creates dictionary for identifying all links of a certain node
// {
// 	"node_1": [
// 		{"source": <Node>, "target": <Node>, "type": "..."},
// 		...
// 	],
// 	...}
function generate_link_map(graph, id_map) {
	var link_map = {}
	for (var i = 0; i < graph.nodes.length; i++) {
		link_map[graph.nodes[i].id] = []
		for (var j = 0; j < graph.links.length; j++) {
			if (graph.nodes[i].id == graph.links[j].source || graph.nodes[i].id == graph.links[j].target) {
				// DEPRECATED: This version yields objects of format: {"source": "source_id", "target": "target_id", "type": "..."}
				// link_map[graph.nodes[i].id].push({"source": graph.links[j].source, "target": graph.links[j].target, "type": graph.links[j].type});
				link_map[graph.nodes[i].id].push({"source": id_map[graph.links[j].source], "target": id_map[graph.links[j].target], "type": graph.links[j].type});
			}
		}
	}
	return link_map;
}

// Creates dictionary for identifying shortest distance from the current node to the root node
// {
// 	"node_1": 3,
// 	...
// }
function calculate_node_distances(graph, link_map) {
	var distance_map = {}; // Used for memoization
	var distance;
	for (var i = 0; i < graph.nodes.length; i++) {
		if (DISTANCE_MODE == "SOURCE") {
			distance = distance_to_root_source(distance_map, link_map, graph.nodes[i].id);
			graph.nodes[i].distance = distance;
			distance_map[graph.nodes[i].id] = distance;
		}
		else if (DISTANCE_MODE == "SHORTEST") {
			distance = distance_to_root_shortest(graph, graph.nodes[i].id);
			distance_map[graph.nodes[i].id] = distance;
		}
		// console.log(graph.nodes[i].id + ": " + graph.nodes[i].distance);
	}
	return graph;
}

// Calculates the distance from the specified node to the root node by traversing source relations
// NOTE: This only works if the graph has a derivative structure (every node has a path from root)
function distance_to_root_source(distance_map, link_map, id) {
	var cur_id = id;
	var distance = 0;
	var max_distance = 100; // Prevents runaway distances on non-derivative graph structures
	while (cur_id != ROOT_ID) {
		if (distance == max_distance) return max_distance;
		if (distance_map[cur_id] != undefined) return distance_map[cur_id] + distance;
		for (var i = 0; i < link_map[cur_id].length; i++) {
			if (link_map[cur_id][i]["target"].id == cur_id) {
				cur_id = link_map[cur_id][i]["source"].id;
				break;
			}
		}
		distance++;
	}
	return distance;
}

// Calculates the shortest distance from the specified node to the root node using Dijkstra's algorithm
// https://gist.github.com/k-ori/11033337
// TODO: Adapt to graph structure OR scrap and use some memoized version of link_map?
//		*Use distance_map generated from distance_to_root_source()
function distance_to_root_shortest(graph, id) {
	var distance = {},
		prev = {},
		vertices = {},
		u;

	// Setup distance sentinel
	graph.vertex.forEach(function(v_i) {
		distance[v_i] = Infinity;
		prev[v_i] = null;
		vertices[v_i] = true;
	});

	distance[start] = 0;

	while (Object.keys(vertices).length > 0) {
		// Obtain a vertex whose distaance is minimum.
		u = Object.keys(vertices).reduce(function(prev, v_i) {
			return distance[prev] > distance[v_i] ? +v_i : prev;
		}, Object.keys(vertices)[0]);

		graph.edge.filter(function(edge) {
			var from = edge[0],
				to 	 = edge[1];
			return from===u || to===u;
		})
		.forEach(function(edge) {
			var to = edge[1]===u ? edge[0] : edge[1],
				dist = distance[u] + edge[2];

			if (distance[to] > dist) {
				distance[to] = dist;
				prev[to] = u;
			}
		});
		// Mark visited
		delete vertices[u];
	}
	return distance;
}

function center_root() {
	CENTER_ROOT = !CENTER_ROOT;
	if (CENTER_ROOT) simulation.alpha(.3).restart();
	// simulation.restart();
}

// Filters out empty (if applicable) and hidden nodes and returns the new graph
function filter_nodes(graph, id_map) {
	var filtered_graph = {};
	filtered_graph.links = graph.links.filter(function(link) {
		var link_source = (typeof link.source === "string") ? id_map[link.source] : link.source;
		var link_target = (typeof link.target === "string") ? id_map[link.target] : link.target;
		var empty = HIDE_EMPTY_NODES && (link_source.description == "" || link_target.description == "");
		// Default visibility state of nodes is "shown"
		if (link_source.hidden == undefined) link_source.hidden = "shown";
		if (link_target.hidden == undefined) link_target.hidden = "shown";
		return !empty && (!(link_source.hidden.indexOf("hidden") != -1) && !(link_target.hidden.indexOf("hidden") != -1));
	});
	filtered_graph.nodes = graph.nodes.filter(function(node) {
		var empty = HIDE_EMPTY_NODES && node.description == "";
		return !empty && !(node.hidden.indexOf("hidden") != -1);
	});
	return filtered_graph;
}

// Toggles all of a node's descendants
function toggle_node(d, top, direction) {
	for (var i = 0; i < original_link_map[d.id].length; i++) {
		// Only hide derivative nodes
		if (original_link_map[d.id][i].type == "derivative" && original_link_map[d.id][i].target.id != d.id) {
			if (COLLAPSE_HIDDEN) {
				if (top) original_link_map[d.id][i].target.hidden = (original_link_map[d.id][i].target.hidden == "hidden") ? "shown" : "hidden";
				else original_link_map[d.id][i].target.hidden = "hidden";
			}
			else {
				var cur_state = original_link_map[d.id][i].target.hidden;
				var new_state;
				if (top) {
					// Direction is gained from any one of the linked nodes
					direction = (cur_state.indexOf("hidden") == -1) ? "hide" : "show";
					new_state = (cur_state.indexOf("hidden") == -1) ? "hidden_shown" : "shown";
				}
				else {
					if (cur_state == "shown" && direction == "hide") new_state = "hidden_shown";
					else if (cur_state == "hidden_shown" && direction == "hide") new_state = "hidden_hidden";
					else if (cur_state == "hidden_shown" && direction == "show") new_state = "shown"
					else if (cur_state == "hidden_hidden" && direction == "hide") new_state = "hidden_hidden"
					else if (cur_state == "hidden_hidden" && direction == "show") new_state = "hidden_shown"
				}
				original_link_map[d.id][i].target.hidden = new_state;
			}
			// console.log(original_link_map[d.id][i].target.id + ": " + original_link_map[d.id][i].target.hidden);
			toggle_node(original_link_map[d.id][i].target, false, direction);
		}
	}
}

function api_center_root() {
	// console.log("Centering root");
	if ($("#center-root-input").css("background-color") != "rgb(209, 225, 255)") {
		$("#center-root-input").css("background-color", "#D1E1FF");
	}
	else {
		$("#center-root-input").css("background-color", "#777");
	}
	center_root();
}



function update_sidebar(d) {

	$(".warning").addClass("hidden");

	if ($("#concept-name").text() == d.name) return;

	$("#concept-name").text(d.name);

	// "description" section
	var description_elem = $("#concept-description");
	if (d.description != "") {
		if (description_elem.hasClass("hidden")) {
			description_elem.fadeIn(200, function() {
				description_elem.removeClass("hidden");
			});
		}
		description_elem.text(d.description);
	}
	else {
		description_elem.fadeOut(200, function() {
			description_elem.addClass("hidden");
		});
	}

	// "when to use" section
	var when_div = $("#concept-when");
	if (d.when.cases.length != 0 || d.when.description != "") {
		if (when_div.hasClass("hidden")) {
			when_div.fadeIn(200, function() {
				when_div.removeClass("hidden");
			});
		}
		$("#concept-when-description").text(d.when.description);
		var when_list = $("#concept-when-list");
		when_list.empty();
		for (var i = 0; i < d.when.cases.length; i++) {
			when_list.append("<li>" + d.when.cases[i] + "</li>");
		}
	}
	else {
		when_div.fadeOut(200, function() {
			when_div.addClass("hidden");
		});
	}

	// "how to use" section
	var how_div = $("#concept-how");
	if (d.how.steps.length != 0 || d.how.description != "") {
		if (how_div.hasClass("hidden")) {
			how_div.fadeIn(200, function() {
				how_div.removeClass("hidden");
			});
		}
		$("#concept-how-description").text(d.how.description);
		var how_list = $("#concept-how-list");
		how_list.empty();
		for (var i = 0; i < d.how.steps.length; i++) {
			how_list.append("<li>" + d.how.steps[i] + "</li>");
		}
	}
	else {
		how_div.fadeOut(200, function() {
			how_div.addClass("hidden");
		});
	}

	// "tools" section
	var tools_div = $("#concept-tools");
	if (d.tools.links.length != 0 || d.tools.description != "") {
		if (tools_div.hasClass("hidden")) {
			tools_div.fadeIn(200, function() {
				tools_div.removeClass("hidden");
			});
		}
		$("#concept-tools-description").text(d.tools.description);
		var tools_list = $("#concept-tools-list");
		tools_list.empty();
		for (var i = 0; i < d.tools.links.length; i++) {
			tools_list.append("<dt><a href='" + d.tools.links[i].link + "'>" + d.tools.links[i].name + "</a></dt>");
			tools_list.append("<dd>" + d.tools.links[i].description + "</dt>");
		}
	}
	else {
		tools_div.fadeOut(200, function() {
			tools_div.addClass("hidden");
		});
	}

	// "links" section
	var links_div = $("#concept-links");
	if (d.links.links.length != 0 || d.links.description != "") {
		if (links_div.hasClass("hidden")) {
			links_div.fadeIn(200, function() {
				links_div.removeClass("hidden");
			});
		}
		$("#concept-links-description").text(d.links.description);
		var links_list = $("#concept-links-list");
		links_list.empty();
		for (var i = 0; i < d.links.links.length; i++) {
			links_list.append("<dt><a href='" + d.links.links[i].link + "'>" + d.links.links[i].name + "</a></dt>");
			links_list.append("<dd>" + d.links.links[i].description + "</dt>");
		}
	}
	else {
		links_div.fadeOut(200, function() {
			links_div.addClass("hidden");
		});
	}
}





_graph = {
	"links": [
		{"source": "machine_learning", "target": "supervised_learning", "type": "derivative"},
		{"source": "machine_learning", "target": "reinforcement_learning", "type": "derivative"},
		{"source": "machine_learning", "target": "structured_prediction", "type": "derivative"},
		{"source": "machine_learning", "target": "anomaly_detection", "type": "derivative"},
		{"source": "machine_learning", "target": "dimen_reduction", "type": "derivative"},
		{"source": "machine_learning", "target": "unsupervised_learning", "type": "derivative"},
		{"source": "machine_learning", "target": "semi_supervised_learning", "type": "derivative"},
		{"source": "supervised_learning", "target": "svm", "type": "derivative"},
		{"source": "supervised_learning", "target": "neural_nets", "type": "derivative"},
		{"source": "supervised_learning", "target": "markov_chains", "type": "derivative"},
		{"source": "supervised_learning", "target": "regressions", "type": "derivative"},
		{"source": "supervised_learning", "target": "naive_bayes", "type": "derivative"},
		{"source": "svm", "target": "nonlinear_svm", "type": "derivative"},
		{"source": "svm", "target": "linear_svm", "type": "derivative"},
		{"source": "neural_nets", "target": "convo_neural_nets", "type": "derivative"},
		{"source": "neural_nets", "target": "lstm", "type": "derivative"},
		{"source": "neural_nets", "target": "autoencoder", "type": "derivative"},
		{"source": "neural_nets", "target": "rec_neural_nets", "type": "derivative"},
		{"source": "neural_nets", "target": "gan", "type": "derivative"},
		{"source": "neural_nets", "target": "perceptron", "type": "derivative"},
		{"source": "markov_chains", "target": "markov_model", "type": "derivative"},
		{"source": "markov_chains", "target": "hidden_markov_model", "type": "derivative"},
		{"source": "regressions", "target": "log_regression", "type": "derivative"},
		{"source": "log_regression", "target": "simp_linear_regression", "type": "derivative"},
		{"source": "regressions", "target": "linear_regression", "type": "derivative"},
		{"source": "linear_regression", "target": "multi_linear_regression", "type": "derivative"},
		{"source": "regressions", "target": "poly_regression", "type": "derivative"},
		{"source": "regressions", "target": "curvilinear_regression", "type": "derivative"},
		{"source": "structured_prediction", "target": "decision_trees_cart", "type": "derivative"},
		{"source": "structured_prediction", "target": "boost_algos", "type": "derivative"},
		{"source": "decision_trees_cart", "target": "classification_trees", "type": "derivative"},
		{"source": "decision_trees_cart", "target": "regression_trees", "type": "derivative"},
		{"source": "decision_trees_cart", "target": "ensemble_methods", "type": "derivative"},
		{"source": "ensemble_methods", "target": "boosted_trees", "type": "derivative"},
		{"source": "boosted_trees", "target": "boost_algos", "type": "derivative"},
		{"source": "ensemble_methods", "target": "rotation_forest", "type": "derivative"},
		{"source": "ensemble_methods", "target": "boot_aggregated", "type": "derivative"},
		{"source": "boot_aggregated", "target": "rand_forest", "type": "derivative"},
		{"source": "boost_algos", "target": "grad_boost", "type": "derivative"},
		{"source": "boost_algos", "target": "adaboost", "type": "derivative"},
		{"source": "anomaly_detection", "target": "ensemble_methods", "type": "derivative"},
		{"source": "anomaly_detection", "target": "static_rules", "type": "derivative"},
		{"source": "anomaly_detection", "target": "fuzzy_outlier_detection", "type": "derivative"},
		{"source": "anomaly_detection", "target": "cluster_analysis_outlier_detection", "type": "derivative"},
		{"source": "anomaly_detection", "target": "replicator_nn", "type": "derivative"},
		{"source": "anomaly_detection", "target": "single_svm", "type": "derivative"},
		{"source": "anomaly_detection", "target": "subspace_correlation", "type": "derivative"},
		{"source": "anomaly_detection", "target": "density_techniques", "type": "derivative"},
		{"source": "density_techniques", "target": "local_outlier", "type": "derivative"},
		{"source": "density_techniques", "target": "knn", "type": "related"},
		{"source": "anomaly_detection", "target": "ensemble_methods", "type": "derivative"},
		{"source": "ensemble_methods", "target": "feature_bagging", "type": "derivative"},
		{"source": "ensemble_methods", "target": "score_norma", "type": "derivative"},
		{"source": "dimen_reduction", "target": "bayesian_models", "type": "derivative"},
		{"source": "dimen_reduction", "target": "missing_values", "type": "derivative"},
		{"source": "dimen_reduction", "target": "low_var_filter", "type": "derivative"},
		{"source": "dimen_reduction", "target": "multidimen_scaling", "type": "derivative"},
		{"source": "dimen_reduction", "target": "chisquare", "type": "derivative"},
		{"source": "dimen_reduction", "target": "stacked_autoencoders", "type": "derivative"},
		{"source": "dimen_reduction", "target": "decision_trees_ensembles", "type": "derivative"},
		{"source": "dimen_reduction", "target": "tsne", "type": "derivative"},
		{"source": "dimen_reduction", "target": "clustering", "type": "derivative"},
		{"source": "dimen_reduction", "target": "corr_analysis", "type": "derivative"},
		{"source": "dimen_reduction", "target": "rand_projections", "type": "derivative"},
		{"source": "dimen_reduction", "target": "pca", "type": "derivative"},
		{"source": "pca", "target": "kernel_pca", "type": "derivative"},
		{"source": "pca", "target": "graph_kernel_pca", "type": "derivative"},
		{"source": "pca", "target": "blind_signal", "type": "derivative"},
		{"source": "dimen_reduction", "target": "nmf", "type": "derivative"},
		{"source": "dimen_reduction", "target": "forward_feat_selection", "type": "derivative"},
		{"source": "dimen_reduction", "target": "backward_feature", "type": "derivative"},
		{"source": "dimen_reduction", "target": "high_correlation", "type": "derivative"},
		{"source": "dimen_reduction", "target": "factor_analysis", "type": "derivative"},
		{"source": "factor_analysis", "target": "efa", "type": "derivative"},
		{"source": "factor_analysis", "target": "cfa", "type": "derivative"},
		{"source": "unsupervised_learning", "target": "knn", "type": "derivative"},
		{"source": "unsupervised_learning", "target": "clustering", "type": "derivative"},
		{"source": "clustering", "target": "hierarch_clustering", "type": "derivative"},
		{"source": "hierarch_clustering", "target": "aglomerative", "type": "derivative"},
		{"source": "hierarch_clustering", "target": "divisive", "type": "derivative"},
		{"source": "clustering", "target": "centroid_clustering", "type": "derivative"},
		{"source": "centroid_clustering", "target": "kmeans_clustering", "type": "derivative"},
		{"source": "centroid_clustering", "target": "kmedians_clustering", "type": "derivative"},
		{"source": "centroid_clustering", "target": "kmeans++_clustering", "type": "derivative"},
		{"source": "centroid_clustering", "target": "fuzzy_cmeans_clustering", "type": "derivative"},
		{"source": "clustering", "target": "distri_clustering", "type": "derivative"},
		{"source": "distri_clustering", "target": "gauss_mixture", "type": "derivative"},
		{"source": "clustering", "target": "density_clustering", "type": "derivative"},
		{"source": "density_clustering", "target": "dbscan", "type": "derivative"},
		{"source": "density_clustering", "target": "optics", "type": "derivative"},
		{"source": "clustering", "target": "preclustering", "type": "derivative"},
		{"source": "preclustering", "target": "canopy_clustering", "type": "derivative"},
		{"source": "clustering", "target": "corr_clustering", "type": "derivative"},
		{"source": "corr_clustering", "target": "ccpivot", "type": "derivative"},
		{"source": "clustering", "target": "subspace_clustering", "type": "derivative"},
		{"source": "subspace_clustering", "target": "clique", "type": "derivative"},
		{"source": "subspace_clustering", "target": "subclu", "type": "derivative"},
		{"source": "unsupervised_learning", "target": "neural_nets", "type": "derivative"},
		{"source": "neural_nets", "target": "self_organ_maps", "type": "derivative"},
		{"source": "neural_nets", "target": "adapt_reson_theory", "type": "derivative"},
		{"source": "latent_var_models", "target": "exp_max_algo", "type": "derivative"},
		{"source": "latent_var_models", "target": "meth_moments", "type": "derivative"},
		{"source": "blind_signal", "target": "latent_var_models", "type": "derivative"},
		{"source": "blind_signal", "target": "csp", "type": "derivative"},
		{"source": "blind_signal", "target": "ssa", "type": "derivative"},
		{"source": "blind_signal", "target": "lccad", "type": "derivative"},
		{"source": "blind_signal", "target": "nnmf", "type": "derivative"},
		{"source": "blind_signal", "target": "dca", "type": "derivative"},
		{"source": "blind_signal", "target": "ica", "type": "derivative"},
		{"source": "blind_signal", "target": "svd", "type": "derivative"},
		{"source": "semi_supervised_learning", "target": "graph_methods", "type": "derivative"},
		{"source": "semi_supervised_learning", "target": "generative_models", "type": "derivative"},
		{"source": "semi_supervised_learning", "target": "low_density_separation", "type": "derivative"},
		{"source": "low_density_separation", "target": "transductive_svm", "type": "derivative"},
		{"source": "reinforcement_learning", "target": "evo_strategies", "type": "derivative"},
		{"source": "reinforcement_learning", "target": "markov_chains", "type": "derivative"},
		{"source": "markov_chains", "target": "markov_decision_processes", "type": "derivative"},
		{"source": "rec_neural_nets", "target": "clock_rnn", "type": "derivative"},
		{"source": "rec_neural_nets", "target": "gru", "type": "derivative"},
		{"source": "rec_neural_nets", "target": "neural_programmer", "type": "derivative"},
		{"source": "rec_neural_nets", "target": "diff_neural_comps", "type": "derivative"},
		{"source": "rec_neural_nets", "target": "neural_turing", "type": "derivative"},
		{"source": "rec_neural_nets", "target": "act_rnn", "type": "derivative"}
	],
	"nodes": [
		{
			"id": "machine_learning",
			"name": "Machine Learning",
			"description": "Machine learning is the process of utilizing statistical models to learn from past data in order to provide clarity for new data. When doing machine learning, you need data. And often, you need a lot of data. Machine learning is deeply coupled with statistics, so to understand ML you need to understand what a statistical model does. Essentially, it takes past data and, based on the structure of that data, makes assumptions on similar data. For example, in predicting stock prices, the model may take in information such as the past prices, volumes, and other technical indicators. It uses this information to make guesses about the data. Depending on what you're trying to achieve, you can have the mode try to guess the future price, try to figure out whether some event caused a market panic, or find what kinds of data are related to each other. However, you have to be careful. As with anything in statistics, you have to be thorough in your methods. Results are not always as they seem!",
			"when": {
					"description": "These are general guidelines, but if you find any of these apply to your problem, machine learning may be helpful in finding a solution.",
					"cases": ["You have complex data", "You want to find patterns in your data", "You want to predict events", "You have lots of existing data", "You want to evolve your product to become better over time", "You've already sold your soul to statistics"]
				},
			"how": {
				"description": "Machine learning is done by optimizing a function that you specify to \"fit\" past data well, usually an error function. For example, you could say \"I want to predict house prices\" and train a model with historical data to try to make the predicted price as close as possible to the historical data's actual price. It does the hard work of finding the parameters that optimize the function for you! But be careful. Problems arise when the wrong model is chosen, bad data is used, the results are interpreted incorrectly, or the function is not fully optimized (this happens more often than you might think!).",
				"steps": ["Define your problem. Think of a very specific question you want to answer.", "Get the data relevant to finding that answer. Tons of it.", "Get more data.", "Clean your data. Figure out what parts are important. Umbrellas sold in NYC don't predict Moscow's daily temperature. (TODO: verify this)", "Decide which model / algorithm to use. Hint: this map will help!", "Pick your framework of choice.", "Build and train your model. If you do it right, you should have to wait a while for the training to finish.", "Test the results. Does it predict well? Is your data still nonsense? If not, use your knowledge gained and go back to step 1. Either way, you've now done machine learning!"]
			},
			"tools": {
				"description": "These are some of the most popular general machine learning tools.",
				"links": [
					{
						"name": "Scikit-Learn",
						"link": "http://scikit-learn.org/stable/",
						"description": "A popular open source Python ML library"
					},
					{
						"name": "mlpack",
						"link": "http://www.mlpack.org/",
						"description": "A C++ ML library focused on performance"
					},
					{
						"name": "Apache Spark MLLib",
						"link": "https://spark.apache.org/mllib/",
						"description": "Apache's ML library for Spark"
					},
					{
						"name": "Google Cloud ML",
						"link": "https://cloud.google.com/products/machine-learning/",
						"description": "Google's ML platform"
					},
					{
						"name": "Azure ML Studio",
						"link": "https://studio.azureml.net/",
						"description": "Microsoft's ML platform"
					},
					{
						"name": "Amazon ML",
						"link": "https://aws.amazon.com/machine-learning/",
						"description": "Amazon's ML platform"
					}
				]
			},
			"links": {
				"description": "Here are some of the best general machine learning tutorials I've come across.",
				"links": [
					{
						"name": "Coursera: Stanford Machine Learning",
						"link": "https://www.coursera.org/learn/machine-learning",
						"description": "This course by Andrew Ng is perfect for machine learning beginners. It covers the topics, math, and motivations for machine learning."
					},
					{
						"name": "TopTal Machine Learning Primer",
						"link": "https://www.toptal.com/machine-learning/machine-learning-theory-an-introductory-primer",
						"description": "This is a great introductory tutorial with an excellent example."
					},
					{
						"name": "Machine Learning Mastery",
						"link": "http://machinelearningmastery.com/start-here/#getstarted",
						"description": "This is one of my favorite blogs. This post is geared towards those just getting started."
					}
				]
			},
			"keywords": ["machine learning", "ai", "general", "predict", "classify", "reinforce", "improve", "data"]
		},
		{
			"id": "supervised_learning",
			"name": "Supervised Learning",
			"description": "Supervised learning is achieved by building a learning model and training the algorithm on labeled data points. Supervised learning can be broken down into two classes: prediction and classification. Both of these require that the algorithm knows something about what patterns the data holds so that it can predict or classify new examples properly. Therefore, we need what is called \"labeled\" data. This means that along with past examples' features, we also have what we as humans would consider the correct answer. Then, we feed these example + answer pairs into our algorithm to try to learn some way to represent this data in a way that it can then predict or classify new examples using this representation. This is called \"training\" the model. Supervised learning then, is any machine learning algorithm that uses labeled data to make guesses about new examples!",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "neural_nets",
			"name": "Neural Networks",
			"description": "Artificial neural networks are systems modeled after how our brain works; data is sent between neurons to come to a single conclusion. Neural networks are great for highly complex problems, such as image processing. They can also be leveraged to process traditionally difficult data, such as sequential data. It's important to note that \"neural network\" is an umbrella term, and that there are many different types of NNs with infinite ways to arrange them. Each neural network architecture, or topology, is engineered to work well for a specific type of data. For example, RNNs have a unique architecture that makes them very efficient at modeling sequential data.",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "convo_neural_nets",
			"name": "CNN",
			"description": "A Convolutional Neural Network (CNN) is the favored type of model for image recognition. It essentially has two sections of layers: the first section contains convolutional and pooling layers that try to \"encode\" the input, and the second section that uses fully connected layers to try to learn a good representation of the encoded input. If this sounds convoluted, that's because it is.",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "rec_neural_nets",
			"name": "RNN",
			"description": "Recurrent Neural Networks are designed to be useful for sequential data, making them very popular in natural language tasks, like NLP or handwriting / speech recognition. The way this is achieved is by adding feedback loops to all of the neurons in the hidden layers. This means the output of a neuron can feed back into itself. So how does this help us represent abritrary length sequences? Well, the feedback loop can be thought of as a way for the neuron to \"remember\" the data it processed in the past. If the neuron is trained to remember multiple states back, then a potentially infinite long sequence can be modeled! But this is hard. How does the neuron get trained in this way? We run into a problem where the neuron may forget past data, because it gets muddled with all of the previous data. After all, when it's training, it doesn't know whether the most important stage is 5 or 5,000 examples in the past. This is called the \"vanishing gradient\" problem. Despite this, RNNs are great for learning sequential data if they are engineered correctly. One thing to note is that the order in which the training data is fed into the model matters. Because RNNs look for sequential data, it wouldn't make sense to jumble up the sequences during training. For example, think about handwriting recognition; if you fed in the training data backwards (the reverse of your handwriting), it wouldn't be able to predict how you your normal writing!",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "lstm",
			"name": "LSTM",
			"description": "A long short-term memory network is an improved type of RNN that uses a \"memory cell\" in each neuron in its hidden layers to keep track of past information. Recall that RNNs are used primarily to model sequential data. One of the biggest problems with traditional RNNs is that long-term sequences are difficult to model. This is called the vanishing gradient problem, so named because the reason long sequences cannot be effectively modeled is that as we get further along in a sequence in the input data, weights will tend towards 0 and never cause the neuron's state to change. LSTMs solve this issue with allowing the cells to decide what information it holds onto over time. Each neuron's memory cell (usually) has three gates: input, forget, and output. The input gate allows new information to update the cell's memory, the forget gate determines which information the cell should throw away, and the output gate decides what information gets sent out from the current node. The neat thing about LSTMs is that these gates also learn what information to keep and let go over time! Not only does the LSTM configure its network weights dynamically, but it tries to remember the right information. This is extremely useful, and allows these types of networks to reach much better results for long-term sequential data.",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": [
					{
						"name": "Understanding LSTM Networks",
						"link": "https://colah.github.io/posts/2015-08-Understanding-LSTMs/",
						"description": "Chris Olah provides a great explanation of LSTMs on his blog."
					}
				]
			},
			"keywords": []
		},
		{
			"id": "gru",
			"name": "GRU",
			"description": "A Gated Recurrent Unit is a derivative of the LSTM network model with performance improvements. While it uses the same idea of using a memory cell with gates to manage the flow of information in and out of each hidden layer neuron, except it only has two gates: reset and update. The reset gate determines how much information is allowed into the memory cell, and the update gate chooses how much memory needs to be retained.",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "neural_turing",
			"name": "Neural Turing Machine",
			"description": "Neural Turing Machines are a type of RNN that allows every hidden layer neuron to access information from the same memory bank. The model is named for Alan Turing's computational model, which is to this day a critical piece of work in the computer science field.",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "diff_neural_comps",
			"name": "Differentiable Neural Computers",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": [
					{
						"name": "DeepMind: Differentiable neural computers",
						"link": "https://deepmind.com/blog/differentiable-neural-computers/",
						"description": "DeepMind's blog covers their experience with DNCs."
					}
				]
			},
			"keywords": []
		},
		{
			"id": "clock_rnn",
			"name": "Clockwork RNN",
			"description": "The Clockwork RNN is an adaptation of basic RNN models that focuses on reducing model complexity and improving memory. The LSTM model was developed to improve memory in traditional RNNs for long sequences in data, but LSTM is computationally expensive. The clockwork RNN improves upon LSTM models by simplifying the memory architecture without affecting performance. In fact, as posited by the initial paper, clockwork RNNs score much better on time series prediction tasks than LSTMs. The clockwork RNN groups hidden layer neurons into \"modules\" that work at different \"speeds,\" which affect how fast the computations are performed and changes to the neuron state is propagated.",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": [
					{
						"name": "Koutník et al.",
						"link": "https://arxiv.org/pdf/1402.3511v1.pdf",
						"description": "This paper from the folks at the Swiss AI lab IDSIA describes the method in full."
					}
				]
			},
			"keywords": []
		},
		{
			"id": "act_rnn",
			"name": "Adaptive Computation Time RNN",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "neural_programmer",
			"name": "Neural Programmer",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "gan",
			"name": "GAN",
			"description": "A Generative Adversarial Network (GAN) is a type of semi-supervised neural network that, in a very general way, attempts to perform a variation of the Turing Test to optimize itself. It does this by training two networks at the same time: a generator, and a discriminator.",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "perceptron",
			"name": "FFNN / Perceptron",
			"description": "Perceptrons are an essential concept for neural networks. The earliest artificial neural networks were simply multi-layer perceptrons. While the more recently invented network topologies are used more commonly these days, there are still uses for simple feed-forward networks.",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "autoencoder",
			"name": "Autoencoder",
			"description": "Autoencoders are a type of unsupervised neural network built for the purpose of simplifying an input into a more meaningful representation. The input layer is essentially \"compressed\" in the middle layers by forming a \"funnel\" with the network model; the hidden layers have fewer neurons than the input and output layers. The model is different than most neural networks, since its unsupervised. The goal of the network is to find a good representation of the input for other supervised methods, not do any predictions itself, so the output layer is actually the same size as the input layer. The network attempts to reconstruct the input layer in the output layer, but since the hidden layers have fewer neurons, some information is lost. This forces the model to only store the most essential attributes for representing the input in the hidden layers, and this more compact representation can be fed into other supervised algorithms to (hopefully) boost efficiency. The concept is similar to dimensionality reduction, where the input is reduced to ignore features that have offer little to the predictive power of the model. In the case of autoencoders, however, important aspects of a dimension may be kept, while part of the dimension may be discarded.",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "svm",
			"name": "Support Vector Machines",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "nonlinear_svm",
			"name": "Non-Linear SVM",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "linear_svm",
			"name": "Linear SVM",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "naive_bayes",
			"name": "Naive Bayes",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "regressions",
			"name": "Regressions",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "log_regression",
			"name": "Logistic Regression",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "simp_linear_regression",
			"name": "Simple Linear Regression",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "multi_linear_regression",
			"name": "Multiple Linear Regression",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "linear_regression",
			"name": "Linear Regression",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "curvilinear_regression",
			"name": "Curvilinear Regression",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "poly_regression",
			"name": "Polynomial Regression",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "markov_chains",
			"name": "Markov Chains",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "markov_model",
			"name": "Markov Model",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "hidden_markov_model",
			"name": "Hidden Markov Model",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "unsupervised_learning",
			"name": "Unsupervised Learning",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "semi_supervised_learning",
			"name": "Semi-Supervised Learning",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "reinforcement_learning",
			"name": "Reinforcement Learning",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "anomaly_detection",
			"name": "Anomaly Detection",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "dimen_reduction",
			"name": "Dimensionality Reduction",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "structured_prediction",
			"name": "Structured Prediction",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "decision_trees_cart",
			"name": "Decision Trees (CART)",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "classification_trees",
			"name": "Classification Trees",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "regression_trees",
			"name": "Regression Trees",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "ensemble_methods",
			"name": "Ensemble Methods",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "boosted_trees",
			"name": "Boosted Trees",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "rotation_forest",
			"name": "Rotation Forest",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "boot_aggregated",
			"name": "Bootstrap Aggregated",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "rand_forest",
			"name": "Random Forest",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "boost_algos",
			"name": "Boosting Algorithms",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "grad_boost",
			"name": "Gradient Boosting",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "adaboost",
			"name": "AdaBoost",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "feature_bagging",
			"name": "Feature Bagging",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "score_norma",
			"name": "Score Normalization",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "static_rules",
			"name": "Static Rules",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "fuzzy_outlier_detection",
			"name": "Fuzzy-Logic-Based Outlier Detection",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "cluster_analysis_outlier_detection",
			"name": "Cluster-Analysis-Based Outlier Detection",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "replicator_nn",
			"name": "Replicator NN",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "single_svm",
			"name": "Single Class SVM",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "subspace_correlation",
			"name": "Subspace-Based / Correlation-Based",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "density_techniques",
			"name": "Density-Based Techniques",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "knn",
			"name": "K-Nearest Neighbor",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "local_outlier",
			"name": "Local Outlier Factor",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "high_correlation",
			"name": "High Correlation",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "backward_feature",
			"name": "Backward Feature Elimination",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "forward_feat_selection",
			"name": "Forward Feature Selection / Construction",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "nmf",
			"name": "NMF",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "pca",
			"name": "PCA",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "graph_kernel_pca",
			"name": "Graph-Based Kernel PCA",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "kernel_pca",
			"name": "Kernel PCA",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "rand_projections",
			"name": "Random Projections",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "corr_analysis",
			"name": "Correspondence Analysis",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "clustering",
			"name": "Clustering",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "tsne",
			"name": "t-SNE",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "decision_trees_ensembles",
			"name": "Decision Tree Ensembles",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "stacked_autoencoders",
			"name": "Stacked Autoencoders",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "chisquare",
			"name": "Chi-square / Information Gain",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "multidimen_scaling",
			"name": "Multidimensional Scaling",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "low_var_filter",
			"name": "Low Variance Filter",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "missing_values",
			"name": "Missing Values Ratio",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "bayesian_models",
			"name": "Bayesian Models",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "factor_analysis",
			"name": "Factor Analysis",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "efa",
			"name": "EFA",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "cfa",
			"name": "CFA",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "latent_var_models",
			"name": "Latent Variable Models",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "blind_signal",
			"name": "Blind Signal Separation",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "svd",
			"name": "SVD",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "ica",
			"name": "ICA",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "dca",
			"name": "DCA",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "nnmf",
			"name": "NNMF",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "lccad",
			"name": "LCCAD",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "ssa",
			"name": "SSA",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "csp",
			"name": "CSP",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "meth_moments",
			"name": "Method of Moments",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "exp_max_algo",
			"name": "Expectation-Maximization Algorithm",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "self_organ_maps",
			"name": "Self-Organizing Maps",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "adapt_reson_theory",
			"name": "Adaptive Resonance Theory",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "hierarch_clustering",
			"name": "Hierarchical Clustering",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "aglomerative",
			"name": "Aglomerative",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "divisive",
			"name": "Divisive",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "centroid_clustering",
			"name": "Centroid-Based Clustering",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "kmeans_clustering",
			"name": "k-means Clustering",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "kmedians_clustering",
			"name": "k-medians Clustering",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "kmeans++_clustering",
			"name": "k-means++ Clustering",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "fuzzy_cmeans_clustering",
			"name": "Fuzzy c-means Clustering",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "distri_clustering",
			"name": "Distribution-Based Clustering",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "gauss_mixture",
			"name": "Gaussian Mixture Models",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "density_clustering",
			"name": "Density-Based Clustering",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "dbscan",
			"name": "DBSCAN",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "optics",
			"name": "OPTICS",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "preclustering",
			"name": "Pre-Clustering",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "canopy_clustering",
			"name": "Canopy Clustering",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "corr_clustering",
			"name": "Correlation Clustering",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "ccpivot",
			"name": "CC-Pivot",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "subspace_clustering",
			"name": "Subspace Clustering",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "clique",
			"name": "CLIQUE",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "subclu",
			"name": "SUBCLU",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "graph_methods",
			"name": "Graph-Based Methods",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "generative_models",
			"name": "Generative Models",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "low_density_separation",
			"name": "Low-Density Separation",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "transductive_svm",
			"name": "Transductive SVM",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "evo_strategies",
			"name": "Evolution Strategies",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		},
		{
			"id": "markov_decision_processes",
			"name": "Markov Decision Processes",
			"description": "",
			"when": {
					"description": "",
					"cases": []
			},
			"how": {
				"description": "",
				"steps": []
			},
			"tools": {
				"description": "",
				"links": []
			},
			"links": {
				"description": "",
				"links": []
			},
			"keywords": []
		}
	]
}
