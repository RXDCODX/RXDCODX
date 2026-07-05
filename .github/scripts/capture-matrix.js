const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

const MATRIX_URL =
  "https://rezmason.github.io/matrix/?palette=0.8,0.05,0.05,0,1,0.1,0.1,0,0.5,0,0,0&version=classic&numColumns=60&fps=30";

const DURATION_SEC = 60;
const FPS = 8;
const WIDTH = 1200;
const HEIGHT = 320;

async function main() {
  const framesDir = path.join(__dirname, "..", "frames");
  if (!fs.existsSync(framesDir)) {
    fs.mkdirSync(framesDir, { recursive: true });
  }

  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--use-gl=angle",
      "--use-angle=swiftshader",
      "--enable-webgl",
      "--disable-gpu-sandbox",
      "--window-size=" + WIDTH + "," + HEIGHT,
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: WIDTH, height: HEIGHT });

  console.log("Navigating to Matrix...");
  await page.goto(MATRIX_URL, { waitUntil: "networkidle0", timeout: 30000 });

  // Wait for canvas to appear and render
  await page.waitForSelector("canvas", { timeout: 15000 });
  await new Promise((r) => setTimeout(r, 3000));

  const totalFrames = DURATION_SEC * FPS;
  const interval = 1000 / FPS;

  console.log("Capturing " + totalFrames + " frames...");
  for (let i = 0; i < totalFrames; i++) {
    const frameNum = String(i).padStart(4, "0");
    await page.screenshot({
      path: path.join(framesDir, "frame-" + frameNum + ".png"),
      clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT },
    });
    if (i % 50 === 0) {
      console.log("Frame " + i + "/" + totalFrames);
    }
    await new Promise((r) => setTimeout(r, interval));
  }

  await browser.close();
  console.log("Done capturing " + totalFrames + " frames");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
