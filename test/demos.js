import { Selector } from 'testcafe';


const pathToFile = file => `localhost:8000/demos/${file}.html`;

fixture('Array Grouping')
    .page(pathToFile('array_grouping'));

test('Test node style morphs', async t => {
        //Wait for network to render
        await Selector('#phase-network', {visibilityCheck: true});
        // Apply morphs
        await t.click('#sidebar input');

        // Check that "Myriel" node has proper styles
        const myrielNode = await Selector('#phase-network > g > g.nodes > g:nth-child(1) > circle');
        await t.expect(myrielNode.getStyleProperty('fill')).eql('rgb(125, 171, 255)', 'Node does not have proper fill');
        await t.expect(myrielNode.getStyleProperty('stroke')).eql('rgb(174, 99, 212)', 'Node does not have proper stroke');
    });

test('Test link style morphs', async t => {
        //Wait for network to render
        await Selector('#phase-network', {visibilityCheck: true});
        // Apply morphs
        await t.click('#sidebar input');

        // Check that link has proper styles
        const link = await Selector('#phase-network > g > g.links > g:nth-child(18) > line');
        await t.expect(link.getStyleProperty('stroke')).eql('rgb(212, 99, 99)', 'Link does not have proper stroke');
        await t.expect(link.getStyleProperty('stroke-width')).eql('3px', 'Link does not have proper stroke-width');
    });
