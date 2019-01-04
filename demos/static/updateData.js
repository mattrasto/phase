/* eslint-env browser */
/* global viz:true phase lesMiserablesData lesMiserablesMostData
 lesMiserablesSmallData emptyData CUR_DATA:true */
document.addEventListener('DOMContentLoaded', () => {
  // Initialize network object
  viz = phase.Network('#viz-container');
  // Attach some initial data
  viz.data(lesMiserablesData);

  CUR_DATA = 0;

  console.log('Visualization Loaded');
});

/* eslint-disable */
function updateData() {
  CUR_DATA = ((CUR_DATA + 1) % 4);

  if (CUR_DATA === 0) {
    viz.data(lesMiserablesData);
  } else if (CUR_DATA === 1) {
    viz.data(lesMiserablesMostData);
  } else if (CUR_DATA === 2) {
    viz.data(lesMiserablesSmallData);
  } else {
    viz.data(emptyData);
  }
}
/* eslint-enable */
