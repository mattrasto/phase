import { Selector } from 'testcafe';

const pathToFile = file => `localhost:8000/demos/${file}.html`;

// TODO: Initialize tests with random nodes to test for from sample data and pass to tests via context
fixture('Basic')
    .page(pathToFile('basic'))
    .before(async ctx => {
        ctx.startTime = (new Date).getTime();
        // Wait for network to render
        ctx.vizContainer = await Selector('#phase-network', {visibilityCheck: true});
    });

test('Network renders within 2 seconds', async t => {
        // Basic demo page should load within 2 seconds
        await t.setPageLoadTimeout(2000);

        // Check that test took less than 2 seconds
        const timeDiff = (new Date).getTime() - t.fixtureCtx.startTime;
        await t.expect(timeDiff).lte(2000, `Network rendering took too long: ${timeDiff}`);
});

test('Viz container exists', async t => {
        // Check that SVG element exists
        await t.expect(t.fixtureCtx.vizContainer.exists).ok('Network container SVG element does not exist');

        // Check that viz container has a child element
        await t.expect(t.fixtureCtx.vizContainer.hasChildNodes).ok('Viz container does not have any child elements');
});

test('Node and Link Containers are populated', async t => {
        const nodeContainer = await Selector('.nodes');
        const linkContainer = await Selector('.links');

        await t.expect(nodeContainer.exists).ok().expect(linkContainer.exists).ok();

        await t.expect(nodeContainer.hasChildNodes).ok('Node Container does not have any child elements');
        await t.expect(linkContainer.hasChildNodes).ok('Link Container does not have any child elements');
});

test('Correct number of nodes and links', async t => {
        const numNodes = await Selector('.node').count;
        const numLinks = await Selector('.link').count;

        await t.expect(numNodes).eql(77).expect(numLinks).eql(254);
});

fixture('Array Grouping')
    .page(pathToFile('array_grouping'))
    .beforeEach(async t => {
        // Wait for network to render
        await Selector('#phase-network', {visibilityCheck: true});
        // Apply morphs
        await t.click(Selector('#sidebar input', {timeout: 1000}));
    });

test('Morph applies correct changes to node', async t => {
        const myrielNode = await Selector('circle').nth(0);
        await t.expect(myrielNode.getStyleProperty('fill')).eql('rgb(125, 171, 255)', 'Node does not have proper fill');
        await t.expect(myrielNode.getStyleProperty('stroke')).eql('rgb(174, 99, 212)', 'Node does not have proper stroke');
});

test('Morph applies correct changes to link', async t => {
        const link = await Selector('line').nth(17);
        await t.expect(link.getStyleProperty('stroke')).eql('rgb(212, 99, 99)', 'Link does not have proper stroke');
        await t.expect(link.getStyleProperty('stroke-width')).eql('3px', 'Link does not have proper stroke-width');
});
