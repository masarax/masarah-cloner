const { scrapePage } = require('./scraper');
const { generateServerJs } = require('./server-template');

module.exports = {
  scrapePage,
  generateServerJs
};
