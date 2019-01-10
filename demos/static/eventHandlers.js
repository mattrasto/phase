/* eslint-env browser */
/* global viz:true phase lesMiserablesData */
document.addEventListener('DOMContentLoaded', () => {
  // Initialize network object
  viz = phase.Network('event_handlers', '#viz-container');
  // Attach some initial data
  viz.data(lesMiserablesData);

  viz.getLinkGroup('all').style({ 'stroke-width': '5px' });

  console.log('Visualization Loaded');
});

/* eslint-disable */
function changeMouseover() {
  viz.getNodeGroup('all').event('mouseover', (d, node, label) => {
    node.style('stroke', 'red').style('stroke-width', '3px');
  });

  viz.getNodeGroup('all').event('mouseover', (d, node, label) => {
    node.style('stroke', 'green').style('stroke-width', '3px');
  });

  viz.getLinkGroup('all').event('mouseover', (d, link, label) => {
    link.style('stroke', 'red').style('stroke-width', '10px');
  });

  viz.getLinkGroup('all').event('mouseout', (d, link, label) => {
    link.style('stroke', '#333');
  });
}
/* eslint-enable */
