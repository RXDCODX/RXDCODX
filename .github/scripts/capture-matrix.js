const { createCanvas } = require("canvas");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const WIDTH = 1200;
const HEIGHT = 320;
const COL_W = 18;
const ROW_H = 20;
const FPS = 8;
const DURATION_SEC = 60;
const COLS = Math.ceil(WIDTH / COL_W);
const ROWS = Math.ceil(HEIGHT / ROW_H) + 5;

const CHARS =
  "RXDCODX01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン";

const BG = { r: 13, g: 17, b: 23 };

function randChar() {
  return CHARS[Math.floor(Math.random() * CHARS.length)];
}

// Each column: head row, speed, char list
const columns = [];
for (let c = 0; c < COLS; c++) {
  const chars = [];
  for (let r = 0; r < ROWS; r++) chars.push(randChar());
  columns.push({
    head: Math.floor(Math.random() * ROWS) - ROWS,
    speed: 0.5 + Math.random() * 1.5,
    offset: 0,
    chars,
  });
}

const canvas = createCanvas(WIDTH, HEIGHT);
const ctx = canvas.getContext("2d");

// Pre-calculate
const totalFrames = DURATION_SEC * FPS;
const distDir = path.join(__dirname, "..", "..", "dist");
if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });

console.log("Rendering " + totalFrames + " frames...");

const ffmpeg = spawn("ffmpeg", [
  "-y",
  "-f",
  "rawvideo",
  "-pix_fmt",
  "rgb24",
  "-s",
  WIDTH + "x" + HEIGHT,
  "-r",
  String(FPS),
  "-i",
  "pipe:0",
  "-vf",
  "split[s0][s1];[s0]palettegen=max_colors=96:stats_mode=diff[p];[s1][p]paletteuse=dither=bayer:bayer_scale=2",
  "-loop",
  "0",
  path.join(distDir, "matrix-rain.gif"),
]);

ffmpeg.stdin.on("error", () => {});
ffmpeg.stderr.on("data", (d) => {
  const s = d.toString();
  if (s.includes("Error") || s.includes("error")) console.error(s.trim());
});

function renderFrame() {
  // Background
  ctx.fillStyle =
    "rgb(" + BG.r + "," + BG.g + "," + BG.b + ")";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.font = "bold 16px 'Courier New', monospace";
  ctx.textBaseline = "top";

  for (let c = 0; c < COLS; c++) {
    const col = columns[c];
    col.offset += col.speed;

    while (col.offset >= 1) {
      col.offset -= 1;
      col.head++;
      // Shift chars
      col.chars.shift();
      col.chars.push(randChar());
    }

    const headRow = col.head;

    for (let r = 0; r < ROWS; r++) {
      const drawRow = r - 3; // offset so head isn't at very top
      const y = drawRow * ROW_H;
      if (y < -ROW_H || y > HEIGHT) continue;

      const distFromHead = headRow - r;
      if (distFromHead < 0) continue;

      let red, green, blue, alpha;

      if (distFromHead === 0) {
        // Head: white/red glow
        red = 255;
        green = 240;
        blue = 240;
        alpha = 1.0;
      } else if (distFromHead === 1) {
        red = 255;
        green = 100;
        blue = 100;
        alpha = 0.95;
      } else if (distFromHead < 5) {
        const t = (distFromHead - 1) / 4;
        red = Math.floor(255 - t * 100);
        green = Math.floor(80 - t * 60);
        blue = Math.floor(80 - t * 60);
        alpha = 0.9 - t * 0.2;
      } else if (distFromHead < 15) {
        const t = (distFromHead - 5) / 10;
        red = Math.floor(155 - t * 100);
        green = Math.floor(20 - t * 15);
        blue = Math.floor(20 - t * 15);
        alpha = 0.7 - t * 0.4;
      } else {
        const t = Math.min((distFromHead - 15) / 10, 1);
        red = Math.floor(55 - t * 42);
        green = Math.floor(5 - t * 5);
        blue = Math.floor(5 - t * 5);
        alpha = 0.3 - t * 0.25;
      }

      if (alpha <= 0) continue;

      ctx.globalAlpha = alpha;
      ctx.fillStyle =
        "rgb(" + red + "," + green + "," + blue + ")";
      ctx.fillText(col.chars[r], c * COL_W, y);
    }
  }

  ctx.globalAlpha = 1.0;
}

for (let f = 0; f < totalFrames; f++) {
  renderFrame();
  const buf = canvas.toBuffer("raw");
  ffmpeg.stdin.write(buf);

  if (f % 50 === 0) console.log("Frame " + f + "/" + totalFrames);
}

ffmpeg.stdin.end();

ffmpeg.on("close", (code) => {
  if (code !== 0) {
    console.error("ffmpeg exited with code " + code);
    process.exit(1);
  }
  const gifPath = path.join(distDir, "matrix-rain.gif");
  const stat = fs.statSync(gifPath);
  console.log(
    "Done! GIF size: " + (stat.size / 1024 / 1024).toFixed(2) + " MB"
  );
});
