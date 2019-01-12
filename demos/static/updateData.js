/* eslint-env browser */
/* global viz:true phase lesMiserablesData lesMiserablesMostData
 lesMiserablesSmallData emptyData CUR_DATA:true */
document.addEventListener('DOMContentLoaded', () => {
  // Initialize network object
  viz = phase.Network('update_data', '#viz-container');

  /* eslint-disable no-undef */
  mjgGroup = viz.nodeGroup('mjg', ['Myriel', 'Jondrette', 'Gribier']);
  mjGroup = mjgGroup.subgroup('mj', ['Myriel', 'Jondrette']);
  mGroup = mjGroup.subgroup('m', ['Myriel']);
  /* eslint-enable no-undef */

  CUR_DATA = -1;
  updateData(); // eslint-disable-line no-use-before-define

  console.log('Visualization Loaded');
});

/* eslint-disable */
function updateData() {
  CUR_DATA = ((CUR_DATA + 1) % 4);

  if (CUR_DATA === 0) {
    viz.data(lesMiserablesData);
    viz.getLinkGroup('all').style({'stroke': 'green'});
    mjgGroup.style({'r': 20});
    mjGroup.style({'r': 30});
    mGroup.style({'r': 40});
  } else if (CUR_DATA === 1) {
    viz.data(lesMiserablesMostData);
  } else if (CUR_DATA === 2) {
    viz.data(lesMiserablesSmallData);
  } else {
    viz.data(emptyData);
  }
}
/* eslint-enable */
