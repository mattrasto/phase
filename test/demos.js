import { Selector } from 'testcafe';

const lesMiserablesData = require('./data/lesMiserables.json');
const lesMiserablesMostData = require('./data/lesMiserablesMost.json');
const lesMiserablesSmallData = require('./data/lesMiserablesSmall.json');

const pathToFile = file => `localhost:8000/demos/${file}.html`;

// Tests that 'nodes' and 'links' parameters (from viz) are in same set as dataset 'data'
const testSetIntersections = async (t, nodes, links, data) => {
  // Intersection between actual and expected node data yields set of same size
  const trueNodeIds = new Set(data.nodes.map(node => node.id));
  const nodeIntersection = [...nodes].filter(i => trueNodeIds.has(i.id));
  await t.expect(nodeIntersection.length).eql(trueNodeIds.size);

  // Intersection between actual and expected link data yields set of same size
  const trueLinkIds = new Set(data.links.map(link => `${link.source}->${link.target}`));
  const linkIntersection = [...links].filter(i => trueLinkIds.has(i.id));
  await t.expect(linkIntersection.length).eql(trueLinkIds.size);
};

/* eslint-disable no-undef */
fixture('Basic')
  .page(pathToFile('basic'))
  .before(async (ctx) => {
    ctx.startTime = (new Date()).getTime();
    // Wait for network to render
    ctx.vizContainer = await Selector('#phase-basic', { visibilityCheck: true });
  });

test('Network renders within 2 seconds', async (t) => {
  // Basic demo page should load within 2 seconds
  await t.setPageLoadTimeout(2000);

  // Check that test took less than 2 seconds
  const timeDiff = (new Date()).getTime() - t.fixtureCtx.startTime;
  await t.expect(timeDiff).lte(2000, `Network rendering took too long: ${timeDiff}`);
});

test('Viz container exists', async (t) => {
  // Check that SVG element exists
  await t.expect(t.fixtureCtx.vizContainer.exists).ok('Network container SVG element does not exist');

  // Check that viz container has a child element
  await t.expect(t.fixtureCtx.vizContainer.hasChildNodes).ok('Viz container does not have any child elements');
});

test('Node and Link Containers are populated', async (t) => {
  const nodeContainer = await Selector('.nodes');
  const linkContainer = await Selector('.links');

  await t.expect(nodeContainer.exists).ok().expect(linkContainer.exists).ok();

  await t.expect(nodeContainer.hasChildNodes).ok('Node Container does not have any child elements');
  await t.expect(linkContainer.hasChildNodes).ok('Link Container does not have any child elements');
});

test('Correct number of nodes and links', async (t) => {
  const numNodes = await Selector('.node').count;
  const numLinks = await Selector('.link').count;

  await t
    .expect(numNodes).eql(lesMiserablesData.nodes.length)
    .expect(numLinks).eql(lesMiserablesData.links.length);
});

test('Correct data attached to elements', async (t) => {
  const nodes = await t.eval(() => viz.getNodeGroup('all').selection.data());
  const links = await t.eval(() => viz.getLinkGroup('all').selection.data());

  await testSetIntersections(t, nodes, links, lesMiserablesData);
});


fixture('Morphs')
  .page(pathToFile('morphs'));

test('Apply morph and reset button modify style as expected', async (t) => {
  const buttons = await Selector('#sidebar input');
  const applyMorphs = buttons.nth(0);
  const reset = buttons.nth(1);

  const morphedNodes = await Selector('circle')
    .withAttribute('style', 'fill: rgb(125, 171, 255); stroke: rgb(174, 99, 212); stroke-width: 3px;');
  const morphedLinks = await Selector('line')
    .withAttribute('style', 'stroke: rgb(212, 99, 99); stroke-width: 3px;');

  // Correct amount of nodes and links are modified
  await t.click(applyMorphs, { timeout: 1000 })
    .expect(morphedNodes.count)
    .eql(await t.eval(
      () => viz.getNodeGroup('rand_node_group').selection.data().length,
    ))
    .expect(morphedLinks.count)
    .eql(await t.eval(
      () => viz.getLinkGroup('rand_link_group').selection.data().length,
    ));

  // None remain modified after reset
  await t.click(reset, { timeout: 1000 })
    .expect(morphedNodes.count)
    .eql(0)
    .expect(morphedLinks.count)
    .eql(0);
});

test('Data morphs modify group values for links and nodes', async (t) => {
  const applyMorphs = await Selector('#sidebar input').nth(0);

  const nodes = await t.eval(() => viz.getNodeGroup('rand_node_group').selection.data());
  const links = await t.eval(() => viz.getLinkGroup('rand_link_group').selection.data());

  // Groups do not equal 200 before click
  nodes.forEach(async (node) => {
    await t.expect(node.group).notEql(200);
  });
  links.forEach(async (link) => {
    await t.expect(link.group).notEql(200);
  });

  await t.click(applyMorphs);

  // Groups equal 200 after click
  nodes.forEach(async (node) => {
    await t.expect(node.group).eql(200);
  });
  links.forEach(async (link) => {
    await t.expect(link.group).eql(200);
  });
});


fixture('Data Update')
  .page(pathToFile('update_data'));

test('Les Miserables dataset is loaded first', async (t) => {
  const nodes = await t.eval(() => viz.getNodeGroup('all').selection.data());
  const links = await t.eval(() => viz.getLinkGroup('all').selection.data());

  await testSetIntersections(t, nodes, links, lesMiserablesData);
});

test('Les Miserables Most dataset is loaded after one button click', async (t) => {
  const updateData = await Selector('#sidebar input').nth(0);
  await t.click(updateData);

  const nodes = await t.eval(() => viz.getNodeGroup('all').selection.data());
  const links = await t.eval(() => viz.getLinkGroup('all').selection.data());

  await testSetIntersections(t, nodes, links, lesMiserablesMostData);
});

test('Les Miserables Small dataset is loaded after two button clicks', async (t) => {
  const updateData = await Selector('#sidebar input').nth(0);
  await t.click(updateData).click(updateData);

  const nodes = await t.eval(() => viz.getNodeGroup('all').selection.data());
  const links = await t.eval(() => viz.getLinkGroup('all').selection.data());

  await testSetIntersections(t, nodes, links, lesMiserablesSmallData);
});

test('Empty dataset is loaded after three button clicks', async (t) => {
  const updateData = await Selector('#sidebar input').nth(0);
  await t.click(updateData).click(updateData).click(updateData);

  const nodes = await t.eval(() => viz.getNodeGroup('all').selection.data());
  const links = await t.eval(() => viz.getLinkGroup('all').selection.data());

  // Nodes and links are empty
  await t.expect(nodes.length).eql(0);
  await t.expect(links.length).eql(0);
});

test('Les Miserables dataset is loaded after four button clicks', async (t) => {
  const updateData = await Selector('#sidebar input').nth(0);
  await t.click(updateData).click(updateData).click(updateData).click(updateData);

  const nodes = await t.eval(() => viz.getNodeGroup('all').selection.data());
  const links = await t.eval(() => viz.getLinkGroup('all').selection.data());

  await testSetIntersections(t, nodes, links, lesMiserablesData);
});


fixture('Settings Update')
  .page(pathToFile('update_settings'));

test('Settings are initialized to default values', async (t) => {
  const vizSettings = await t.eval(() => viz.settings());

  await t.expect(vizSettings.linkStrength).eql(1);
  await t.expect(vizSettings.linkDistance).eql(60);
  await t.expect(vizSettings.charge).eql(-800);
  await t.expect(vizSettings.friction).eql(0.8);
  await t.expect(vizSettings.gravity).eql(0.25);
  await t.expect(vizSettings.zoom).eql(true);
});

test('Force settings are properly updated via code changes', async (t) => {
  await t.eval(() => viz.settings({ linkStrength: 0.5, linkDistance: 40 }));
  await t.eval(() => viz.settings({ charge: -400 }));
  await t.eval(() => viz.settings({ friction: 0.6 }));
  await t.eval(() => viz.settings({ gravity: 0.5 }));

  const vizSettings = await t.eval(() => viz.settings());
  await t.expect(vizSettings.linkStrength).eql(0.5);
  await t.expect(vizSettings.linkDistance).eql(40);
  await t.expect(vizSettings.charge).eql(-400);
  await t.expect(vizSettings.friction).eql(0.6);
  await t.expect(vizSettings.gravity).eql(0.5);
});

test('Force settings are properly updated via slider changes', async (t) => {
  const gravityRange = await Selector('#sidebar .slider-container input[type="range"]').nth(0);
  const chargeRange = await Selector('#sidebar .slider-container input[type="range"]').nth(1);
  const linkStrengthRange = await Selector('#sidebar .slider-container input[type="range"]').nth(2);
  const linkDistanceRange = await Selector('#sidebar .slider-container input[type="range"]').nth(3);

  await t.typeText(gravityRange, '.1');
  await t.typeText(chargeRange, '-1000');
  await t.typeText(linkStrengthRange, '.2');
  await t.typeText(linkDistanceRange, '100');

  const vizSettings = await t.eval(() => viz.settings());
  await t.expect(vizSettings.linkStrength).eql('0.2');
  await t.expect(vizSettings.linkDistance).eql('100');
  await t.expect(vizSettings.charge).eql('-1000');
  await t.expect(vizSettings.friction).eql(0.8); // Stays the same
  await t.expect(vizSettings.gravity).eql('0.1');
});

test('Element styles are properly updated via slider changes', async (t) => {
  const nodeSizeRange = await Selector('#sidebar .slider-container input[type="range"]').nth(4);
  const nodeBorderWidthRange = await Selector('#sidebar .slider-container input[type="range"]').nth(5);
  const linkWidthRange = await Selector('#sidebar .slider-container input[type="range"]').nth(6);

  await t.typeText(nodeSizeRange, '20');
  await t.typeText(nodeBorderWidthRange, '2');

  // All nodes should have new styles
  const nodes = await Selector('circle')
    .withAttribute('r', '20')
    .withAttribute('style', 'fill: rgb(51, 51, 51); stroke: rgb(247, 246, 242); stroke-width: 2;');
  await t.expect(nodes.count).eql(await t.eval(
    () => viz.getNodeGroup('all').selection.data().length,
  ));

  await t.typeText(linkWidthRange, '3');

  // All links should have new styles
  const links = await Selector('line')
    .withAttribute('style', 'stroke: rgb(102, 102, 102); stroke-width: 3;');
  await t.expect(links.count).eql(await t.eval(
    () => viz.getLinkGroup('all').selection.data().length,
  ));
});

test('Element styles are properly updated via color button clicks', async (t) => {
  const nodeColorPurpleButton = await Selector('#sidebar .color-container').nth(0).find('.purple');
  const nodeBorderColorRedButton = await Selector('#sidebar .color-container').nth(1).find('.red');
  const linkColorYellowButton = await Selector('#sidebar .color-container').nth(2).find('.yellow');

  await t.click(nodeColorPurpleButton).click(nodeBorderColorRedButton);

  // All nodes should have new styles
  const nodes = await Selector('circle')
    .withAttribute('style', 'fill: rgb(174, 99, 212); stroke: rgb(212, 99, 99); stroke-width: 0.8;');
  await t.expect(nodes.count).eql(await t.eval(
    () => viz.getNodeGroup('all').selection.data().length,
  ));

  await t.click(linkColorYellowButton);

  // All links should have new styles
  const links = await Selector('line')
    .withAttribute('style', 'stroke: rgb(229, 235, 122); stroke-width: 1.5;');
  await t.expect(links.count).eql(await t.eval(
    () => viz.getLinkGroup('all').selection.data().length,
  ));
});

fixture('Event Handlers')
  .page(pathToFile('event_handlers'));

test('Initial hover works as expected', async (t) => {
  const node = await Selector('circle').nth(0);
  const link = await Selector('line').nth(0);
  await t.hover(node).expect(node.getAttribute('style'))
    .eql('fill: rgb(51, 51, 51); stroke: rgb(125, 171, 255); stroke-width: 3px;');

  await t.hover(link).expect(link.getAttribute('style'))
    .eql('stroke: rgb(102, 102, 102); stroke-width: 5px;');
});

test('Hover effect updates after button click', async (t) => {
  const node = await Selector('circle').nth(0);
  const link = await Selector('line').nth(0);
  const changeHover = await Selector('#sidebar input').nth(0);

  await t.click(changeHover);

  await t.hover(node).expect(node.getAttribute('style'))
    .eql('fill: rgb(51, 51, 51); stroke: green; stroke-width: 3px;');

  await t.hover(link).expect(link.getAttribute('style'))
    .eql('stroke: red; stroke-width: 10px;');
});

fixture('Subgroups').only
  .page(pathToFile('subgroups'));

test('Parent and child relations are properly constructed', async (t) => {
  const showMammalsButton = await Selector('#show-mammals');
  const showFriendlyMammalsButton = await Selector('#show-friendly-mammals');

  await t.click(showMammalsButton);

  // Parent group should have no parent and no children
  let mammalsHasParent = await t.eval(() => Boolean(viz.getNodeGroup('mammals').parent));
  let mammalsChildrenLength = await t.eval(() => viz.getNodeGroup('mammals').children.length);
  await t.expect(mammalsHasParent).eql(false);
  await t.expect(mammalsChildrenLength).eql(0);

  await t.click(showFriendlyMammalsButton);

  // Parent group should have no parent and 1 child
  mammalsHasParent = await t.eval(() => Boolean(viz.getNodeGroup('mammals').parent));
  mammalsChildrenLength = await t.eval(() => viz.getNodeGroup('mammals').children.length);
  await t.expect(mammalsHasParent).eql(false);
  await t.expect(mammalsChildrenLength).eql(1);

  // Child group should have a parent and no children
  const friendlyMammalsHasParent = await t.eval(() => Boolean(viz.getNodeGroup('friendly_mammals').parent));
  const friendlyMammalsChildrenLength = await t.eval(() => viz.getNodeGroup('friendly_mammals').children.length);
  await t.expect(friendlyMammalsHasParent).eql(true);
  await t.expect(friendlyMammalsChildrenLength).eql(0);
});

test('Parent group destruction properly removes reference in child', async (t) => {
  const showMammalsButton = await Selector('#show-mammals');
  const showFriendlyMammalsButton = await Selector('#show-friendly-mammals');
  const hideMammalsButton = await Selector('#hide-mammals');

  await t.click(showMammalsButton);
  await t.click(showFriendlyMammalsButton);
  await t.click(hideMammalsButton);

  // Child group should have no parent and no children
  const friendlyMammalsHasParent = await t.eval(() => Boolean(viz.getNodeGroup('friendly_mammals').parent));
  const friendlyMammalsChildrenLength = await t.eval(() => viz.getNodeGroup('friendly_mammals').children.length);
  await t.expect(friendlyMammalsHasParent).eql(false);
  await t.expect(friendlyMammalsChildrenLength).eql(0);
});

test('Child group destruction properly removes reference in parent', async (t) => {
  const showMammalsButton = await Selector('#show-mammals');
  const showFriendlyMammalsButton = await Selector('#show-friendly-mammals');
  const hideFriendlyMammalsButton = await Selector('#hide-friendly-mammals');

  await t.click(showMammalsButton);
  await t.click(showFriendlyMammalsButton);
  await t.click(hideFriendlyMammalsButton);

  // Parent group should have no parent and no children
  const mammalsHasParent = await t.eval(() => Boolean(viz.getNodeGroup('mammals').parent));
  const mammalsChildrenLength = await t.eval(() => viz.getNodeGroup('mammals').children.length);
  await t.expect(mammalsHasParent).eql(false);
  await t.expect(mammalsChildrenLength).eql(0);
});
