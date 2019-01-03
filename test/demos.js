import { Selector } from 'testcafe';

const pathToFile = file => `localhost:8000/demos/${file}.html`;

// TODO: Initialize tests with random nodes to test for from sample data and pass to tests via context
fixture('Basic')
    .page(pathToFile('basic'))
    .beforeEach(async t => {
        t.ctx.startTime = (new Date).getTime();
    });

test('Test network rendering timeout', async t => {
        // Basic demo page should load within 2 seconds
        await t.setPageLoadTimeout(2000);

        // Wait for network to render
        await Selector('#phase-network', {visibilityCheck: true});

        // Check that test took less than 2 seconds
        const timeDiff = (new Date).getTime() - t.ctx.startTime;
        await t.expect(timeDiff).lte(1000, `Network rendering took too long: ${timeDiff}`);
});

test('Test viz container exists', async t => {
        // Check that viz container has a child element
        const vizContainer = await Selector('#viz-container', {visibilityCheck: true});
        await t.expect(vizContainer.hasChildNodes).ok('Viz container does not have any child elements');

        // Check that SVG element is visible
        await t.expect(Selector('#phase-network').visible).ok('Network container SVG element is not visible');
});

test('Test container group classes', async t => {
        // Wait for network to render
        await Selector('#phase-network', {visibilityCheck: true});

        // Check that node container group has proper class
        const nodeContainerGroup = await Selector('#phase-network > g > g:nth-child(2)');
        await t.expect(nodeContainerGroup.classNames).contains('nodes', 'Node container group does not have "nodes" class');

        // Check that link container group has proper class
        const linkContainerGroup = await Selector('#phase-network > g > g:nth-child(1)');
        await t.expect(linkContainerGroup.classNames).contains('links', 'Link container group does not have "links" class');
});

test('Test container classes', async t => {
        // Wait for network to render
        await Selector('#phase-network', {visibilityCheck: true});

        // Check that node container has proper class
        const nodeContainer = await Selector('#phase-network > g > g.nodes > g:nth-child(1)');
        await t.expect(nodeContainer.classNames).contains('node', 'Node container does not have "node" class');

        // Check that link container has proper class
        const linkContainer = await Selector('#phase-network > g > g.links > g:nth-child(1)');
        await t.expect(linkContainer.classNames).contains('link', 'Link container does not have "link" class');
});

fixture('Array Grouping')
    .page(pathToFile('array_grouping'));

test('Test node style morphs', async t => {
        // Wait for network to render
        await Selector('#phase-network', {visibilityCheck: true});
        // Apply morphs
        await t.click(Selector('#sidebar input', {timeout: 1000}));

        // Check that "Myriel" node has proper styles
        const myrielNode = await Selector('#phase-network > g > g.nodes > g:nth-child(1) > circle');
        await t.expect(myrielNode.getStyleProperty('fill')).eql('rgb(125, 171, 255)', 'Node does not have proper fill');
        await t.expect(myrielNode.getStyleProperty('stroke')).eql('rgb(174, 99, 212)', 'Node does not have proper stroke');
});

test('Test link style morphs', async t => {
        // Wait for network to render
        await Selector('#phase-network', {visibilityCheck: true});
        // Apply morphs
        await t.click(Selector('#sidebar input', {timeout: 1000}));

        // Check that link has proper styles
        const link = await Selector('#phase-network > g > g.links > g:nth-child(18) > line');
        await t.expect(link.getStyleProperty('stroke')).eql('rgb(212, 99, 99)', 'Link does not have proper stroke');
        await t.expect(link.getStyleProperty('stroke-width')).eql('3px', 'Link does not have proper stroke-width');
});
