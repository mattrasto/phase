/* eslint-env browser */
/* global viz:true phase lesMiserablesData */
/* eslint no-param-reassign: ["error", { "props": false }] */
document.addEventListener('DOMContentLoaded', () => {
  // Initialize network object
  viz = phase.Network('update_settings', '#viz-container');
  // Attach some initial data
  viz.data(lesMiserablesData);

  console.log('Visualization Loaded');

  document.querySelectorAll('input[type=range]').forEach((elem) => {
    elem.addEventListener('input', (e) => {
      elem.nextElementSibling.innerHTML = e.target.value;
    });
  });
});

/* eslint-disable */
function changeSettings(prop, val) {
  viz.settings({ [prop]: val });
  viz.getNodeGroup('all').restyle();
  viz.getLinkGroup('all').restyle();
}

function changeNodeStyles(prop, val) {
  viz.getNodeGroup('all').style({ [prop]: val });
}

function changeLinkStyles(prop, val) {
  viz.getLinkGroup('all').style({ [prop]: val });
}
/* eslint-enable */
