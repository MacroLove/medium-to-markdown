const request = require('request');
const cheerio = require('cheerio');

/**
 * Converts content from a specified URL to Markdown.
 * @param {string} url - The URL to convert content from.
 * @returns {Promise<string>} - A promise that resolves with the HTML markup.
 * @throws {Error} If there's an error during the conversion process.
 */
function getHtmlFromUrl(url) {
  return new Promise(function (resolve, reject) {
    request(
      {
        uri: url,
        method: 'GET',
      },
      function (err, httpResponse, body) {
        if (err) {
          console.error(err);
          return reject(err);
        }

        let $ = cheerio.load(body);
        let html = $('article').html() || '';
        if (!html) {
          return reject(new Error('No article found in HTML'));
        }
        return resolve(html);
      }
    );
  });
}

module.exports = getHtmlFromUrl;
