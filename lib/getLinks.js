const cheerio = require('cheerio');

/**
 * Gets all links from a string of HTML.
 * @param {string} urlString - The URL of the webpage (used to identify internal links)
 * @param {string} content - The webpage HTML to get links from.
 * @returns {Array<string>} - An array of links.
 */
function getLinks(urlString, content) {
  const $ = cheerio.load(content);

  const links = [];

  $('*').each((index, element) => {
    const href = $(element).attr('href');
    const src = $(element).attr('src');

    if (href) {
      links.push(href);
    }

    if (src) {
      links.push(src);
    }
  });

  const url = new URL(urlString);
  const { protocol, hostname } = url;

  // an object storing tree of internal links (key: subpath, value: object with subpaths as keys)
  const internalLinkTree = {};
  // full URLs built for every internal link
  const internalLinkUrls = [];

  // an object storing external links (key: protocol + '//' + hostname, value: array of (full) links)
  const externalLinksObj = {};

  // TODO: the output of this is a bit wrong
  function addInternalLink(link) {
    if (!link.startsWith('/')) {
      throw new Error('Internal links have to start with /');
    }
    const components = link.split('/');
    let subPath = '';
    let subTree = internalLinkTree;
    while (components.length > 0) {
      if (subPath === '') {
        subPath = '/';
      }
      if (!subTree[subPath]) {
        subTree[subPath] = {};
      }
      subTree = subTree[subPath];
      const component = components.shift();
      subPath = component;
    }
    const protocolHostNameSep = link.startsWith('/') ? '/' : '//';
    internalLinkUrls.push(protocol + protocolHostNameSep + hostname + link);
  }

  /**
   * Adds an external link to the external links object.
   * @param {URL} url - The URL object of the link.
   * @returns {void}
   */
  function addExternalLink(url) {
    const { protocol, hostname } = url;
    const key = protocol + '//' + hostname;
    if (!externalLinksObj[key]) {
      externalLinksObj[key] = [];
    }
    externalLinksObj[key].push(url.toString());
  }

  for (const link of links) {
    try {
      // links can be relative or absolute
      // if this succeeds, it's an absolute link
      // however, an absolute link can still be an internal link (if it points to the same hostname)
      const url = new URL(link);
      if (url.hostname === hostname) {
        // console.log(`link matches hostname '${hostname}' - treating as internal link`);
        addInternalLink(url.pathname);
      } else {
        addExternalLink(url);
      }
    } catch (error) {
      if (error.name === 'TypeError') {
        // if creating an URL fails, we get back a TypeError and assume it's a relative/internal link
        addInternalLink(link);
        continue;
      }
      console.error(error.name);
    }
  }

  return {
    internal: {
      tree: internalLinkTree,
      urls: internalLinkUrls,
    },
    external: externalLinksObj,
  };
}

module.exports = getLinks;
