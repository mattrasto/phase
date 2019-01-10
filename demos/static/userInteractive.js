/* eslint-env browser */
/* global viz:true phase animalsData */
document.addEventListener('DOMContentLoaded', () => {
  // Initialize network object
  viz = phase.Network('user_interactive', '#viz-container');
  // Attach some initial data
  viz.data(animalsData);

  console.log('Visualization Loaded');
});
