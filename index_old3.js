// const puppeteer = require("puppeteer");
// const { PNG } = require("pngjs");
// const pixelmatch = require("pixelmatch");
// const fs = require("fs");
// const axios = require("axios");
// const Jimp = require("jimp");

// async function compareWebpages(url1, url2) {
//   // Launch a headless Chrome browser
//   const browser = await puppeteer.launch();

//   try {
//     // Open new tabs for each webpage
//     const [page1, page2] = await Promise.all([
//       browser.newPage(),
//       browser.newPage(),
//     ]);

//     // Navigate to the URLs of the webpages
//     await Promise.all([page1.goto(url1), page2.goto(url2)]);

//     // Take screenshots of the webpages
//     const [screenshot1, screenshot2] = await Promise.all([
//       page1.screenshot(),
//       page2.screenshot(),
//     ]);

//     // Get the dimensions of the screenshots
//     const [width1, height1] = await new Promise((resolve) => {
//       new PNG().parse(screenshot1, (error, data) => {
//         resolve([data.width, data.height]);
//       });
//     });
//     const [width2, height2] = await new Promise((resolve) => {
//       new PNG().parse(screenshot2, (error, data) => {
//         resolve([data.width, data.height]);
//       });
//     });

//     // Crop the screenshots to the same size
//     const [cropped1, cropped2] = await Promise.all([
//       Jimp.read(screenshot1).then((img) =>
//         img
//           .crop(0, 0, Math.min(width1, width2), Math.min(height1, height2))
//           .getBufferAsync(Jimp.MIME_PNG)
//       ),
//       Jimp.read(screenshot2).then((img) =>
//         img
//           .crop(0, 0, Math.min(width1, width2), Math.min(height1, height2))
//           .getBufferAsync(Jimp.MIME_PNG)
//       ),
//     ]);

//     // Resize the screenshots to the same dimensions
//     const width = 800;
//     const height = 600;
//     const [resized1, resized2] = await Promise.all([
//       Jimp.read(cropped1).then((img) =>
//         img.resize(width, height).getBufferAsync(Jimp.MIME_PNG)
//       ),
//       Jimp.read(cropped2).then((img) =>
//         img.resize(width, height).getBufferAsync(Jimp.MIME_PNG)
//       ),
//     ]);

//     // Compare the screenshots using pixelmatch
//     const img1 = PNG.sync.read(resized1);
//     const img2 = PNG.sync.read(resized2);
//     const { width: imgWidth, height: imgHeight } = img1;
//     const diff = new PNG({ width: imgWidth, height: imgHeight });
//     const numDiffPixels = pixelmatch(
//       img1.data,
//       img2.data,
//       diff.data,
//       imgWidth,
//       imgHeight,
//       { threshold: 0.1 }
//     );

//     // Calculate the percentage similarity
//     const numPixels = imgWidth * imgHeight;
//     const similarity = ((numPixels - numDiffPixels) / numPixels) * 100;

//     return similarity;
//   } finally {
//     // Close the browser
//     await browser.close();
//   }
// }

// // Example usage:
// compareWebpages("https://facebook.com/", "https://facebook.com/")
//   .then((similarity) => {
//     console.log(`Similarity: ${similarity}%`);
//   })
//   .catch((error) => {
//     console.error(error);
//   });

/**
 *
 * Second Versions
 *
 */
// const pixelmatch = require("pixelmatch");
// const PNG = require("pngjs").PNG;
// const puppeteer = require("puppeteer");
// const Jimp = require("jimp");

// async function compareWebpages(
//   url1,
//   url2,
//   excludeColor = { r: 255, g: 255, b: 255 }
// ) {
//   const browser = await puppeteer.launch();
//   try {
//     const [page1, page2] = await Promise.all([
//       browser.newPage(),
//       browser.newPage(),
//     ]);

//     await Promise.all([
//       page1.setViewport({ width: 1920, height: 5000 }),
//       page2.setViewport({ width: 1920, height: 5000 }),
//     ]);

//     await Promise.all([page1.goto(url1), page2.goto(url2)]);

//     // Take screenshots of the pages
//     const [screenshot1, screenshot2] = await Promise.all([
//       page1.screenshot({ fullPage: true }),
//       page2.screenshot({ fullPage: true }),
//     ]);

//     // Load the screenshots into Jimp and crop them to the same size
//     // const [img1, img2] = await Promise.all([
//     //   Jimp.read(screenshot1).then((img) =>
//     //     img.autocrop().getBufferAsync(Jimp.MIME_PNG)
//     //   ),
//     //   Jimp.read(screenshot2).then((img) =>
//     //     img.autocrop().getBufferAsync(Jimp.MIME_PNG)
//     //   ),
//     // ]);
//     const [img1, img2] = await Promise.all([
//       Jimp.read(screenshot1).then((img) =>
//         img.resize(1920, 5000).getBufferAsync(Jimp.MIME_PNG)
//       ),
//       Jimp.read(screenshot2).then((img) =>
//         img.resize(1920, 5000).getBufferAsync(Jimp.MIME_PNG)
//       ),
//     ]);

//     // Compare the screenshots using pixelmatch
//     const png1 = PNG.sync.read(img1);
//     const png2 = PNG.sync.read(img2);
//     if (png1.width !== png2.width || png1.height !== png2.height) {
//       throw new Error("Image size mismatch");
//     }
//     const { width, height } = png1;
//     const diff = new PNG({ width, height });
//     const numDiffPixels = pixelmatch(
//       png1.data,
//       png2.data,
//       diff.data,
//       width,
//       height,
//       { threshold: 0.1, includeAA: true, ignoreColor: excludeColor }
//     );

//     // Calculate the percentage similarity
//     const numPixels = width * height;
//     const similarity = ((numPixels - numDiffPixels) / numPixels) * 100;

//     return similarity;
//   } finally {
//     // Close the browser
//     await browser.close();
//   }
// }

// // Example usage:
// compareWebpages("https://www.sorobindu.com", "https://www.facebook.com", {
//   r: 255,
//   g: 255,
//   b: 255,
// })
//   .then((similarity) => {
//     console.log(`Similarity: ${similarity}%`);
//   })
//   .catch((error) => {
//     console.error(error);
//   });

/**
 *
 * Third version
 *
 */

const pixelmatch = require("pixelmatch");
const PNG = require("pngjs").PNG;
const puppeteer = require("puppeteer");
const Jimp = require("jimp");

async function compareWebpages(url1, url2, tolerance = 30) {
  const browser = await puppeteer.launch();
  try {
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
      page1.screenshot({ fullPage: true }),
      page2.screenshot({ fullPage: true }),
    ]);

    // Load the screenshots into Jimp and crop them to the same size
    const [img1, img2] = await Promise.all([
      Jimp.read(screenshot1).then((img) =>
        img.resize(1920, 5000).getBufferAsync(Jimp.MIME_PNG)
      ),
      Jimp.read(screenshot2).then((img) =>
        img.resize(1920, 5000).getBufferAsync(Jimp.MIME_PNG)
      ),
    ]);

    // Compare the screenshots using pixelmatch
    const png1 = PNG.sync.read(img1);
    const png2 = PNG.sync.read(img2);
    if (png1.width !== png2.width || png1.height !== png2.height) {
      throw new Error("Image size mismatch");
    }
    const { width, height } = png1;
    const diff = new PNG({ width, height });
    const numDiffPixels = pixelmatch(
      png1.data,
      png2.data,
      diff.data,
      width,
      height,
      {
        threshold: 0.1,
        includeAA: true,
        ignoreColor: ({ r, g, b }) => {
          const distance = Math.sqrt(
            Math.pow(r - 255, 2) + Math.pow(g - 255, 2) + Math.pow(b - 255, 2)
          );
          return distance <= tolerance;
        },
      }
    );

    // Calculate the percentage similarity
    const numPixels = width * height;
    const similarity = ((numPixels - numDiffPixels) / numPixels) * 100;

    return similarity;
  } finally {
    // Close the browser
    await browser.close();
  }
}

// Example usage:
compareWebpages("https://www.youtube.com", "https://www.youtube.com", 50)
  .then((similarity) => {
    // console.log(`Similarity: ${Math.ceil((similarity - 90) * 10)}%`);
    console.log(`Similarity: ${similarity}%`);
  })
  .catch((error) => {
    console.error(error);
  });
