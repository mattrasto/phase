const { Builder } = require('selenium-webdriver');
// const chrome = require('selenium-webdriver/chrome');
const assert = require('assert');

/* global describe it */
describe('Phase test suite', () => {
  const driver = new Builder().forBrowser('chrome').build();

  const pathToFile = file => `localhost:8000/demos/${file}.html`;

  it('should open up a webpage and check the title', async () => {
    await driver.get(pathToFile('basic'));
    const title = await driver.getTitle();
    assert.equal(title, 'Basic Demo - Phase');
  });
});
