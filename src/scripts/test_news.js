const puppeteer = require('puppeteer');

async function scrapePage(url) {
  // Launch a new browser instance
  const browser = await puppeteer.launch();
  // Open a new page
  const page = await browser.newPage();
  // Navigate to the URL
  await page.goto(url, {waitUntil: 'networkidle2'});
  // Wait for the content to load and scrape data
  // Example: Scrape the page title
  const pageTitle = await page.evaluate(() => document.title);
  console.log("pageTitle: ", pageTitle);


  // Fetch the full HTML content of the page
  const htmlContent = await page.content();
  // console.log("htmlContent: ", htmlContent);


  // Fetch links and filter out any with no link text
  const links = await page.$$eval('article a', allLinks =>
    allLinks
      .slice(0, 40)
      .map(a => ({link: a.href, text: a.textContent.trim()}))
      .filter(a => a.text) // Filter out links with no text
  );
  console.log(links);

  // Try and grab src here:
  // const divContents = await page.$$eval('article', articles =>
  //   articles.map(article => {
  //       const div = article.querySelector('div[data-n-tid="9"]');
  //       return div ? div.innerText : 'No matching div found';
  //   })
  // );
  // console.log("divContents: ", divContents);

  const articlesData = await page.$$eval('article', articles =>
    articles.map(article => {
      const divText = article.querySelector('div[data-n-tid="9"]') ? article.querySelector('div[data-n-tid="9"]').innerText : 'No matching div found';
      const timeTag = article.querySelector('time');
      const datetime = timeTag ? timeTag.getAttribute('datetime') : 'No datetime found';

      // Find the first <a> tag that has both href and text content
      const linkElement = Array.from(article.querySelectorAll('a')).find(a => a.href.trim() && a.textContent.trim());
      const linkURL = linkElement ? linkElement.href : 'No link URL found';
      const linkText = linkElement ? linkElement.textContent.trim() : 'No link text found';

      return {divText, datetime, linkURL, linkText};
    })
  );
  console.log("articlesData: ", articlesData);


  // WORKS: Use a regular expression to find the pattern and extract the total number of search results
  const regex = /"Search results",\[(\d+),\[\d+/;
  const match = regex.exec(htmlContent);
  const totalResults = match ? parseInt(match[1], 10) : 0;
  console.log("Total Results: ", totalResults);


  // Close the browser
  await browser.close();
  // Return the scraped data
  return pageTitle;
}

// Example usage
let search;
search = "pete davidson";
search = "tesla stock";
let search2 = search + ' when:1d'; // limit to last 24 hrs.
search2 = search2.replaceAll(" ", "+");
const url = `https://news.google.com/search?q=${search2}&hl=en-US&gl=US&ceid=US:en`
console.log("scraping url: ", url);
scrapePage(url).then(console.log).catch(console.error);

/*
NOTES:
at the bottom is this
"pete davidson girlfriend","Search results",[70,[70,
But, topics dont give search results count, cuz its too high likely, hmmm
might max load at 70 also

and a huge list array of urls, we could use that instead maybe?


<time class="hvbAAd" datetime="2024-07-22T21:15:00Z">15 hours ago</time>
All urls are forwarded, fun, cant tell actual site?
some have icon, but looks like no info on icons maybe?



 */


