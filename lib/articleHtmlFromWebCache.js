const puppeteer = require('puppeteer');

/**
 * Extracts the article HTML from a Medium article's Google Webcache URL.
 * @param {string} webcacheUrl - The URL of the article's Google Webcache.
 * @param {string} target - The path to save the markdown file to.
 * @returns {Promise<string>} - A promise that resolves with the article HTML.
 */
async function getMediumArticleHTMLFromGoogleWebCache(webcacheUrl) {
  // TODO: figure out why this breaks in headless mode
  const browser = await puppeteer.launch({ headless: false });
  const page = (await browser.pages())[0];

  // important not to await here!
  page.goto(webcacheUrl);
  // repeatedly try to fetch the content of the article element until it succeeds
  // this is needed because the article element is dynamically loaded
  let articleElement;
  while (!articleElement) {
    try {
      articleElement = await page.$('article');
    } catch (error) {
      console.error(error);
    }
  }
  // get parent element of article element
  const parentElement = await articleElement.$$('xpath/' + '..');
  // get html of parent element
  const html = await page.evaluate(
    element => element.innerHTML,
    parentElement[0]
  );

  await browser.close();
  return html;
}

module.exports = getMediumArticleHTMLFromGoogleWebCache;
