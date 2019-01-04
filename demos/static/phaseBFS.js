/* eslint-env browser */
/* global viz:true phase lesMiserablesData */
/* eslint no-param-reassign: ["error", { "props": false }] */
// Changes the color of the node based on its distance from the start
function createColorMorph(searchPhase, depth) {
  const colors = ['#AE63D4', '#63B2D4', '#63D467', '#E5EB7A', '#ED9A55'];
  return searchPhase.morph(`style_nodes_${depth}`, 'style', { fill: colors[depth % colors.length] });
}

document.addEventListener('DOMContentLoaded', () => {
  // Initialize network object
  viz = phase.Network('#viz-container');
  // Attach some initial data
  viz.data(lesMiserablesData);

  console.log('Visualization Loaded');
});

// Constructs phase for turning nodes into barriers (search cannot travel through them)
function createBarrierPhase(startNodes) {
  const oldPhase = viz.getPhase('barriers');
  if (oldPhase) oldPhase.destroy();

  // Initialize phase
  const barrierPhase = viz.phase('barriers');
  barrierPhase.updateTimestep(2000); // Change barriers every 2 seconds

  // Set the phase's initial state
  // TODO: Default should be no-op function
  barrierPhase.initial(() => {
    barrierPhase.state({
      // NOTE: The morphs are attached to the phase and are destructed with it
      // QUESTION: Should we build "type" parameter into "change" parameter object?
      enableStyleMorph: barrierPhase.morph('enable_barrier_style', 'style', { fill: '#D46363' }),
      enableDataMorph: barrierPhase.morph('enable_barrier_data', 'data', { barrier: true }),
      disableStyleMorph: barrierPhase.morph('disable_barrier_style', 'style', { fill: '#333' }),
      disableDataMorph: barrierPhase.morph('disable_barrier_data', 'data', { barrier: false }),
      prevBarriers: null,
    });
  });

  // TODO: Default should be no-op function
  barrierPhase.next((phaseState) => {
    // Remove old barriers
    if (phaseState.prevBarriers != null) {
      phaseState.prevBarriers.morph(phaseState.disableStyleMorph);
      phaseState.prevBarriers.morph(phaseState.disableDataMorph);
      phaseState.prevBarriers.destroy();
    }

    // Create a group with ~20% of nodes as new barriers
    // NOTE: The node group is attached to the phase and is destructed with it
    const randomNodes = barrierPhase.nodeGroup('random_nodes', d => Math.random() < 0.2 && !d.visited && !startNodes.includes(d.id));
    // Style new barriers
    randomNodes.morph(phaseState.enableStyleMorph);
    randomNodes.morph(phaseState.enableDataMorph);
    barrierPhase.state({
      prevBarriers: randomNodes,
    });
  });

  // TODO: Default should be always-falsy function
  barrierPhase.end(() => false);

  return barrierPhase;
}

// Constructs phase for BFS
function createSearchPhase(startNodes) {
  const oldPhase = viz.getPhase('bfs');
  if (oldPhase) oldPhase.destroy();

  // Initialize phase
  const searchPhase = viz.phase('bfs');

  // Set the phase's initial state
  searchPhase.initial(() => {
    viz.getPhase('barriers').stop(); // Stop the barriers from moving
    searchPhase.state({
      visited: new Set(startNodes), // Nodes we've visited
      validNeighbors: new Set(startNodes), // Neighbors that haven't been visited
      depth: 0, // Distance from start node
      visitedMorph: searchPhase.morph('visited', 'data', { visited: true }),
    });
  });

  searchPhase.next((phaseState) => {
    const newValidNeighbors = new Set();

    // Adjacency list for quick access to neighbors
    const childDict = viz.getAdjacencyList();

    // Morph the next layer in the BFS if node isn't a barrier
    // NOTE: The node group is attached to the phase and is destructed with it
    const neighbors = searchPhase.nodeGroup(`depth_${phaseState.depth}`, (d) => {
      if (d.barrier) return false;
      return phaseState.validNeighbors.has(d.id);
    });
    const colorNodes = createColorMorph(searchPhase, phaseState.depth += 1);
    neighbors.morph(colorNodes);
    neighbors.morph(phaseState.visitedMorph); // Mark as visited

    // Classic BFS
    phaseState.validNeighbors.forEach((node) => {
      childDict[node].forEach((child) => {
        if (!phaseState.visited.has(child)) {
          newValidNeighbors.add(child);
          phaseState.visited.add(child);
        }
      });
    });

    // Update the valid neighbors in the phase's state
    phaseState.validNeighbors = newValidNeighbors;
  });

  // Tell the phase when to stop
  searchPhase.end(phaseState => phaseState.validNeighbors.size <= 0);

  return searchPhase;
}

/* eslint-disable */
function createPhases() {
  const startNode1 = document.getElementById('startNode1').value;
  const startNode2 = document.getElementById('startNode2').value;
  // Optional second node
  const startNodes = startNode2 ? [startNode1, startNode2] : [startNode1];
  createSearchPhase(startNodes);

  createBarrierPhase(startNodes);
  viz.getPhase('barriers').start();
}

// Starts the phase
function startSearch() {
  viz.getPhase('bfs').start();
}

function resetStyles() {
  viz.unstyleGraph();
  viz.getPhase('bfs').reset();
  viz.getPhase('barriers').stop();
  viz.getPhase('barriers').reset();
}
/* eslint-enable */
