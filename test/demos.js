import { Selector } from 'testcafe';

const pathToFile = file => `localhost:8000/demos/${file}.html`;

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

  await t.expect(numNodes).eql(77).expect(numLinks).eql(254);
});

/* eslint-disable no-undef */
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
