const fs = require("fs");
const path = require("path");

const INPUT_DIR = path.join(__dirname, "..", "..", "profile-summary-card-output");
const OUTPUT_DIR = path.join(__dirname, "..", "..", "dist", "cards");

const REPLACEMENTS = [
  // Backgrounds → transparent
  ["#3f3f3f", "none"],
  ["#282a36", "none"],
  ["#24292e", "none"],
  ["#0d1117", "none"],
  ["#1a1b27", "none"],
  ["#2d333b", "none"],
  ["#161b22", "none"],
  ["#22272e", "none"],

  // Title/accent → red
  ["#f0dfaf", "#E53228"],
  ["#ff79c6", "#E53228"],
  ["#f97583", "#E53228"],
  ["#ff6b6b", "#E53228"],
  ["#58a6ff", "#E53228"],
  ["#79c0ff", "#fb7252"],

  // Icons → red
  ["#8cd0d3", "#E53228"],
  ["#6272a4", "#8B949E"],
  ["#7f9f7f", "#E53228"],

  // Text → GitHub light
  ["#dcdccc", "#C9D1D9"],
  ["#f8f8f2", "#C9D1D9"],
  ["#abb2bf", "#C9D1D9"],
  ["#bfc5d3", "#C9D1D9"],

  // Stats
  ["#f0883e", "#E53228"],

  // Borders
  ["#444c56", "#30363D"],
  ["#30363d", "#30363D"],
];

function recolorSvg(svg) {
  let result = svg;
  for (const [from, to] of REPLACEMENTS) {
    result = result.split(from).join(to);
  }
  return result;
}

function main() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const themes = fs.readdirSync(INPUT_DIR);
  let count = 0;

  for (const theme of themes) {
    const themeDir = path.join(INPUT_DIR, theme);
    if (!fs.statSync(themeDir).isDirectory()) continue;

    const files = fs.readdirSync(themeDir).filter((f) => f.endsWith(".svg"));
    for (const file of files) {
      const inputPath = path.join(themeDir, file);
      const svg = fs.readFileSync(inputPath, "utf-8");
      const recolored = recolorSvg(svg);

      const outPath = path.join(OUTPUT_DIR, file);
      fs.writeFileSync(outPath, recolored);
      count++;
    }
  }

  console.log("Recolored " + count + " SVG cards");
}

main();
