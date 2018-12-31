const {Builder} = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const assert = require('assert');

describe('Phase Google Chrome test suite', function() {

    const driver = new Builder().forBrowser('chrome').build();
    driver.manage().setTimeouts({implicit: 5000, pageLoad: 5000, script: 5000})

    const pathToFile = file => `localhost:8000/demos/${file}.html`;

    it('should open up a webpage and check the title', async function() {
        // Basic demo should load within 3 seconds
        await driver.manage().setTimeouts({pageLoad: 3000});
        await driver.get(pathToFile('basic'));
        const title = await driver.getTitle();
        assert.equal(title, 'Basic Demo - Phase');
    });
});
