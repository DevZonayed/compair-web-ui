const puppeteer = require("puppeteer");
const resemble = require("resemblejs");

async function compareWebpages(url1, url2) {
  // Launch a headless browser
  const browser = await puppeteer.launch();

  // Open two tabs and navigate to the URLs
  const [page1, page2] = await Promise.all([
    browser.newPage(),
    browser.newPage(),
  ]);
  await Promise.all([
    page1.setViewport({ width: 1920, height: 5000 }),
    page2.setViewport({ width: 1920, height: 5000 }),
  ]);
  await Promise.all([page1.goto(url1), page2.goto(url2)]);

  // Take screenshots of the pages
  const [screenshot1, screenshot2] = await Promise.all([
    page1.screenshot(),
    page2.screenshot(),
  ]);

  // Compare the screenshots and generate a similarity score
  const result = await resemble(screenshot1).compareTo(screenshot2);

  result.onComplete((data) => {
    console.log(data);
  });
  // Close the browser
  await browser.close();

  // Convert the similarity score into a percentage
  const similarityPercentage = 100 - result.rawMisMatchPercentage;

  // Return the similarity percentage
  return similarityPercentage;
}

// Example usage
compareWebpages("https://sorobindu.com", "https://sorobindu.com")
  .then((similarityPercentage) =>
    console.log(`Similarity percentage: ${similarityPercentage}%`)
  )
  .catch((error) => console.error(error));
