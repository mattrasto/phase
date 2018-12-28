const {Builder} = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const assert = require('assert');

describe('Phase test suite', function() {

    const driver = new Builder().forBrowser('chrome').build();

    const pathToFile = file => `localhost:8000/demos/${file}.html`;

    it('should open up a webpage and check the title', async function() {
        await driver.get(pathToFile('basic'));
        const title = await driver.getTitle();
        assert.equal(title, 'Basic Demo - Phase');
    });
});
