// Create Groups of Nodes and Links using both a set and an array
function createGroups() {
  viz.nodeGroup('node_group', new Set(['Pontmercy', 'Magnon', 'Fantine', 'Myriel', 'Scaufflaire']));
  viz.linkGroup('link_group', ['Perpetue', 'Gribier', 'Labarre', 'Gervais', 'Thenardier']);
}

function createMorphs() {
  // Node styling morph
  viz.morph('style_nodes', 'style', { fill: '#7DABFF', stroke: '#AE63D4', 'stroke-width': '3px' });
  // Node data morph
  viz.morph('update_nodes', 'data', { group: '200' });
  // Link styling morph
  viz.morph('style_links', 'style', { stroke: '#D46363', 'stroke-width': '3px' });
  // Link data morph
  viz.morph('update_links', 'data', { value: '200' });
}

/* eslint-disable */
function applyMorphs() {
  viz.getNodeGroup('node_group').morph('style_nodes');
  viz.getNodeGroup('node_group').morph('update_nodes');
  viz.getLinkGroup('link_group').morph('style_links');
  viz.getLinkGroup('link_group').morph('update_links');

  // Prevent hover from removing node styles
  viz.getNodeGroup('node_group').event('mouseover', null);
  viz.getNodeGroup('node_group').event('mouseout', null);
}

function resetStyles() {
  viz.unstyleGraph();
  // Restore hover events on node
  viz.getNodeGroup('node_group').event('mouseover', (d, node) => {
    node.style('stroke', '#7DABFF').style('stroke-width', '3px');
  });
  viz.getNodeGroup('node_group').event('mouseout', (d, node) => {
    node.style('stroke', '#F7F6F2').style('stroke-width', '.8');
  });
}
/* eslint-enable */

/* global document viz:true phase lesMiserablesData */
// TODO: Remove event parameter?
document.addEventListener('DOMContentLoaded', (event) => {
  // Initialize network object
  viz = phase.Network('#viz-container');
  // Attach some initial data
  viz.data(lesMiserablesData);

  createGroups();

  createMorphs();

  console.log('Visualization Loaded');
});