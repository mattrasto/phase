/* eslint-env browser */
/* global viz:true phase lesMiserablesData */
document.addEventListener('DOMContentLoaded', () => {
  // Initialize network object with static layout
  viz = phase.Network('static_layout', '#viz-container', { static: true });
  // Attach some initial data
  viz.data(lesMiserablesData);

  console.log(viz.settings());

  console.log('Visualization Loaded');
});

/* eslint-disable */
function changeNodeColor() {
  // Create a group for the node with "id" of "Gribier"
  const idGribier = viz.nodeGroup('id_Gribier', 'id', 'Gribier');
  // Create a group for the nodes with a "group" of 1
  const group1 = viz.nodeGroup('group_1', 'group', 1);
  // Create a group for the nodes with a "group" of 2 or 3
  const group2 = viz.nodeGroup('group_2', d => d.group >= 2);

  // Node styling function
  // NOTE: It takes one parameter, d, that can be used to apply the styling to
  // each node in the group
  function randomNodeColor(d) {
    return d.group === 2 ? '#63D467' : '#63B2D4';
  }

  // Group styling function
  // NOTE: It takes no parameters, since it operates on entire groups
  function randomGroupColor() {
    const colors = ['#AE63D4', '#D46363', '#ED9A55', '#E5EB7A'];
    return colors[Math.floor(Math.random() * 4)];
  }

  // Style this group with a specific value
  idGribier.style({ fill: 'blue' });
  // Style this group with a random color for each node
  group1.style({ fill: randomGroupColor });
  // Style this group with the same color by evaluating then applying the result
  viz.getNodeGroup('group_2').style({ fill: randomGroupColor() });
}
/* eslint-enable */
