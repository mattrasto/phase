/* eslint-env browser */
/* global viz:true phase lesMiserablesData */
document.addEventListener('DOMContentLoaded', () => {
  // Initialize network object
  viz = phase.Network('#viz-container');
  // Attach some initial data
  viz.data(lesMiserablesData);

  console.log('Visualization Loaded');
});
