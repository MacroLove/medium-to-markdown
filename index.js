'use strict';

const { program } = require('commander');
const convertHtmlToMarkdown = require('./lib/convertHtmlToMarkdown');
const articleHtmlFromMedium = require('./lib/articleHtmlFromMedium');
const articleHtmlFromWebCache = require('./lib/articleHtmlFromWebCache');
const getLinks = require('./lib/getLinks');
const fs = require('fs');

/**
 * Converts a Medium article URL (or its webcache URL for paywall articles) to markdown markup.
 *
 * If the URL is a Google Webcache URL, the article HTML is extracted from the webcache.
 * Otherwise, the article HTML is fetched from the URL.
 *
 * The markdown is written to a file in the out folder. The file is put into subfolders that correspond with the article's URL
 *
 * For example, if the article URL is https://medium.com/username/article-title-123456789, the markdown file will be saved to out/medium.com/username/article-title-123456789.md
 *
 * Incompatibilities with the file system are handled accordingly.
 *
 * @param {string} inputUrl - The URL to convert content from. Can be the regular URL of a free Medium/Towards Data Science etc. article or a Google Webcache URL (if it is hidden behind a paywall).
 * @returns {Promise<void>} - A promise that resolves when the conversion is complete and the markdown has been printed.
 */
async function main(inputUrl) {
  const html = await getHtml(inputUrl);
  const url = isWebCacheUrl ? extractOriginalURl(inputUrl) : inputUrl;
  const markdown = convertHtmlToMarkdown(url);
  const links = getLinks(url, html);

  const folderPath = `out/${urlToLocalPath(url)}`;
  fs.mkdirSync(folderPath, { recursive: true });

  fs.writeFileSync(`${folderPath}/article.md`, markdown);
  fs.writeFileSync(`${folderPath}/links.json`, JSON.stringify(links));
}

const webcacheUrlPrefix =
  'https://webcache.googleusercontent.com/search?q=cache:';

function isWebCacheUrl(url) {
  return url.startsWith(webcacheUrlPrefix);
}

function extractOriginalURl(webcacheUrl) {
  return webcacheUrl.replace(webcacheUrlPrefix, '');
}

/**
 * Converts a URL to a valid file path.
 *
 * @param {string} url - The URL to convert.
 *
 * @returns {string} - The converted file path.
 */
function urlToLocalPath(url) {
  const webcacheUrlPrefix =
    'https://webcache.googleusercontent.com/search?q=cache:';
  if (url.startsWith(webcacheUrlPrefix)) {
    url = url.replace(webcacheUrlPrefix, '');
  }

  const urlWithoutProtocol = url.replace(/^(https?|file):\/\//, '');
  const urlWithoutQueryString = urlWithoutProtocol.replace(/\?.*/, '');

  // this should hopefully produce valid file paths (for Unix at least, I really don't want to bother with Windows lol)
  const filePath = decodeURIComponent(urlWithoutQueryString);

  return filePath;
}

async function getHtml(url) {
  if (isWebCacheUrl(url)) {
    console.log('Extracting article HTML from Google Webcache...');
    return articleHtmlFromWebCache(url);
  } else {
    console.log('Fetching article HTML from Medium...');
    return articleHtmlFromMedium(url);
  }
}

program.name('medium-to-md').option('<url>').option('[target-path]');
program.parse();
const url = program.args[0];
main(url);
