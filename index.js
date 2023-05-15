const puppeteer = require("puppeteer");
const resemble = require("resemblejs");
const Jimp = require("jimp");
const fs = require("fs");

async function compareImages(userImageUrl, referenceImageUrl, diffOutputPath) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 5000 });

  // Capture screenshots of both images

  await page.goto(userImageUrl);

  const height = await page.evaluate(
    () => document.documentElement.scrollHeight
  );

  await page.evaluate(`window.scrollTo(0, ${height})`);
  await page.waitForTimeout(2500);

  const userImage = await new Promise((resolve, reject) => {
    try {
      let timer = false;
      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(async () => {
        let image = await page.screenshot();
        resolve(image);
        clearTimeout(timer);
      }, 1000);
    } catch (err) {
      reject(err);
    }
  });

  await page.goto(referenceImageUrl);

  const referenceImage = await new Promise((resolve, reject) => {
    try {
      let timer = false;
      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(async () => {
        let image = await page.screenshot();
        resolve(image);
        clearTimeout(timer);
      }, 1000);
    } catch (err) {
      reject(err);
    }
  });

  page.close();

  // Load the screenshots into Jimp and crop them to the same size
  const [img1, img2] = await Promise.all([
    Jimp.read(userImage).then((img) =>
      img.resize(600, 1562.5).getBufferAsync(Jimp.MIME_PNG)
    ),
    Jimp.read(referenceImage).then((img) =>
      img.resize(600, 1562.5).getBufferAsync(Jimp.MIME_PNG)
    ),
  ]);

  // Compare the images using resemble.js
  const comparison = await new Promise((resolve) => {
    resemble(img1)
      .compareTo(img2)
      .onComplete((comparison) => resolve(comparison));
  });

  // Generate a diff image with the differences marked
  const diffImage = comparison.getBuffer();
  const bitImage = await Jimp.read(diffImage);
  const bitWidth = bitImage.bitmap.width;
  const bitHeight = bitImage.bitmap.height;
  let whitePixelCount = 0;

  bitImage.scan(0, 0, bitWidth, bitHeight, function (x, y, idx) {
    const red = this.bitmap.data[idx + 0];
    const green = this.bitmap.data[idx + 1];
    const blue = this.bitmap.data[idx + 2];
    const alpha = this.bitmap.data[idx + 3];

    // Check if the pixel is white (or close to white)
    if (red >= 240 && green >= 240 && blue >= 240 && alpha >= 240) {
      whitePixelCount++;
    }
  });

  const whitePixels = (whitePixelCount / (bitWidth * bitHeight)) * 100;

  //  Exclude white pixel and get a accurate percentage
  let rgbColors = 100 - whitePixels;
  let diffPercentage = comparison.rawMisMatchPercentage * (100 / rgbColors);

  console.log(`Percentage of white pixels: ${whitePixels.toFixed(2)}%`);

  console.log(`Visual difference score: ${diffPercentage.toFixed(3)}%`);
  console.log(`Visual Commonality: ${(100 - diffPercentage).toFixed(3)}%`);

  // Save the diff image to a file
  fs.writeFileSync(diffOutputPath, diffImage);

  await browser.close();
}

(async function () {
  console.log(new Date());
  try {
    await compareImages(
      "https://facebook.com",
      "https://facebook.com",
      "diff.png"
    );
  } catch (err) {
    console.log("Something went Wrong : " + err.message);
  }
  // Example usage
  console.log(new Date());
})();
