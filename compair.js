const natural = require("natural");
const url = require("url");
const axios = require("axios");
const cheerio = require("cheerio");
const { JSDOM } = require("jsdom");

// Get the visible text content of a website
async function getWebsiteText(url) {
  const response = await axios.get(url);
  const html = response.data;

  const dom = new JSDOM(html);
  const body = dom.window.document.body;
  const elements = body.querySelectorAll("body :not(script)");
  let textContent = "";
  for (const element of elements) {
    textContent += element.textContent.trim() + " ";
  }
  return textContent.replace(/\s+/g, " ").trim();
  // return "Hello World";
}

// Compare the text content of two websites and return a percentage match
async function compareWebsites(url1, url2) {
  const text1 = await getWebsiteText(url1);
  const text2 = await getWebsiteText(url2);
  const distance = natural.LevenshteinDistance(text1, text2);
  const maxLength = Math.max(text1.length, text2.length);
  const matchPercentage = ((maxLength - distance) / maxLength) * 100;
  return matchPercentage.toFixed(2) + "%";
}

// Example usage
const website1 = "https://sorobindu.me/wpfclass25";
const website2 = "https://shekhrayhan.com/assignment6/";
compareWebsites(website1, website2).then((matchPercentage) => {
  console.log(`The two websites match ${matchPercentage}.`);
});
