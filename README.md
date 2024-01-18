# Convert any Medium article to Markdown
This is a fork of [dtesler/medium-to-markdown](https://github.com/dtesler/medium-to-markdown) that describes a workflow to convert _any_ Medium article (even those hidden behind a paywall) to Markdown. There's potentially a better, fully autmated way to get this done, but this is the best I could come up with without wasting loads of times on this.

## Basic converter script installation for non-paywall articles (identical to original repo)
If you only need this part of the functionality, you could just as well use the original repo. The following steps are identical to the original repo:

1. Install npm if not already installed
2. Clone the repo
3. run `npm install` inside the repo

At this point, you can run the 'raw converter script' like described in the original repo. E.g. to convert a Medium article that is NOT hidden behind a paywall (in this example https://medium.com/@almenon214/keeping-yourself-motivated-as-a-coder-a16a6fcf49c7) to a file (in this case `exampleOutput.md`), you could just run

```bash
npm run convert https://medium.com/@almenon214/keeping-yourself-motivated-as-a-coder-a16a6fcf49c7 > exampleOutput.md`
```

You can also check out the [README of the original repo](https://github.com/dtesler/medium-to-markdown/blob/master/README.md) for details.

## Workflow for paywall articles
You will need some way to get the raw HTML page of the full article. There's probably multiple ways to do this, but I managed to get things working with this specific approach.

For this, you will need some way to access the raw HTML of **full** articles. The easiest solution I could find is to use the [Bypass Paywalls Clean Chrome](https://gitlab.com/magnolia1234/bypass-paywalls-chrome-clean) extension. (It should be free of malware, but use it at your own risk - for alternatives see also [this Reddit thread](https://www.reddit.com/r/firefox/comments/12iarpr/bypass_paywalls_clean_firefoxchrome/).)

Once installed, it should show you a link to a cached version of the full Medium article whenever you visit a paywalled article. You can then use the following workflow to convert the article to Markdown.

TODO describe what to do afterwards
