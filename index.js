'use strict';

const { program } = require('commander');
const { convertFromUrl, convertHtml } = require('./lib/convert');
const articleHtmlFromWebCache = require('./lib/articleHtmlFromWebCache');
const fs = require('fs');
const path = require('path');

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
 * @param {string} url - The URL to convert content from.
 * @returns {Promise<void>} - A promise that resolves when the conversion is complete and the markdown has been printed.
 */
async function main(url) {
  const markdown = await getMarkdown(url);
  const filePath = urlToFilePath(url);
  const targetPath = `out/${filePath}.md`;
  const targetDir = path.dirname(targetPath);
  fs.mkdirSync(targetDir, { recursive: true });
  fs.writeFileSync(targetPath, markdown);
}

/**
 * Converts a URL to a file path. Handles incompatibilities with the file system and converts google webcache URLs to the original URL beforehand.
 * @param {string} url - The URL to convert.
 *
 * @returns {string} - The converted file path.
 */
function urlToFilePath(url) {
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

/**
 * Gets the markdown for a Medium article URL.
 *
 * If the URL is a Google Webcache URL, the article HTML is extracted from the webcache.
 * Otherwise, the article HTML is fetched from the URL.
 *
 * @param {string} url - The URL to get the markdown for.
 * @returns {Promise<string>} - A promise that resolves with the markdown.
 */
async function getMarkdown(url) {
  if (url.includes('webcache.googleusercontent.com')) {
    console.log('Extracting article HTML from Google Webcache...');
    const html = await articleHtmlFromWebCache(url);
    console.log('Converting HTML to Markdown...');
    return convertHtml(html);
  }
  console.log('Assuming article is a non-paywall Medium article');
  console.log('Converting article to Markdown...');
  return convertFromUrl(url);
}

program.name('medium-to-md').option('<url>').option('[target-path]');
program.parse();
const url = program.args[0];
main(url);
