const axios = require("axios");
const cheerio = require("cheerio");
const diff = require("diff");

async function compareWebpages(url1, url2) {
  // Fetch the HTML source code for each webpage
  const [sourceCode1, sourceCode2] = await Promise.all([
    axios.get(url1).then((response) => response.data),
    axios.get(url2).then((response) => response.data),
  ]);

  // Parse the source code to extract the CSS and JavaScript code
  const [css1, js1] = parseSourceCode(sourceCode1);
  const [css2, js2] = parseSourceCode(sourceCode2);

  // Compare the CSS and JavaScript code using a diff library
  const cssDiff = diff.diffLines(css1, css2);
  const jsDiff = diff.diffLines(js1, js2);

  // Calculate the similarity score based on the number of lines that are the same or similar
  const similarityPercentage = calculateSimilarityPercentage(
    cssDiff.concat(jsDiff)
  );

  // Return the similarity percentage
  return similarityPercentage;
}

function parseSourceCode(sourceCode) {
  const $ = cheerio.load(sourceCode);

  // Extract the CSS code
  const css = $("style")
    .map((i, elem) => $(elem).text())
    .get()
    .join("\n");

  // Extract the JavaScript code
  const js = $("script")
    .map((i, elem) =>
      $(elem).attr("src")
        ? axios.get($(elem).attr("src")).then((response) => response.data)
        : $(elem).text()
    )
    .get()
    .join("\n");

  return [css, js];
}

function calculateSimilarityPercentage(diffs) {
  const totalLines = diffs.length;
  const sameLines = diffs.filter((diff) => !diff.added && !diff.removed).length;

  return Math.round((sameLines / totalLines) * 100);
}

// Example usage
compareWebpages(
  "https://sorobindu.me/wpfclass25/",
  "https://shekhrayhan.com/assignment6/"
)
  .then((similarityPercentage) =>
    console.log(`Similarity percentage: ${similarityPercentage}%`)
  )
  .catch((error) => console.error(error));
