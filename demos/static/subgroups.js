/* eslint-env browser */
/* global viz:true phase animalsData */
document.addEventListener('DOMContentLoaded', () => {
  // Initialize network object
  viz = phase.Network('user_interactive', '#viz-container');
  // Attach some initial data
  viz.data(animalsData);

  console.log('Visualization Loaded');
});

/* eslint-disable */
function showMammals() {
  const mammals = viz.nodeGroup('mammals', 'class', 'mammal');
  mammals.style({'fill': '#ED9A55'});
  // If friendlyMammals exists, restyle
  let friendlyMammals = viz.getNodeGroup('friendly_mammals');
  if (friendlyMammals) friendlyMammals.style({'fill': '#63B2D4'});
};

function showFriendlyMammals() {
  // If 'mammals' group exists, make a subgroup
  const mammals = viz.getNodeGroup('mammals');
  let friendlyMammals = null;
  if (mammals) friendlyMammals = mammals.subgroup('friendly_mammals', 'likesHumans', 'true');
  else {
    friendlyMammals = viz.nodeGroup('friendly_mammals', (d) => {
      return d.class === 'mammal' && d.likesHumans === 'true';
    });
  }
  friendlyMammals.style({'fill': '#63B2D4'});
}

function hideMammals() {
  // Destroy mammals (parent) group
  let mammals = viz.getNodeGroup('mammals');
  if (mammals) mammals.unstyle().destroy();
  // Restyle friendly mammals group
  let friendlyMammals = viz.getNodeGroup('friendly_mammals');
  if (friendlyMammals) friendlyMammals.style({'fill': '#63B2D4'});
}

function hideFriendlyMammals() {
  // Destroy friendlyMammals (child) group
  let friendlyMammals = viz.getNodeGroup('friendly_mammals');
  if (friendlyMammals) friendlyMammals.unstyle().destroy();
  // Restyle mammals group
  let mammals = viz.getNodeGroup('mammals');
  if (mammals) mammals.style({'fill': '#ED9A55'});
}
