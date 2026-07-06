const fs = require("fs");
const path = require("path");

const INPUT_DIR = path.join(__dirname, "..", "..", "profile-summary-card-output");
const OUTPUT_DIR = path.join(__dirname, "..", "..", "dist", "cards");
const THEME = "radical"; // base theme to recolor

const REPLACEMENTS = [
  // Backgrounds
  ["#282a36", "#0D1117"], // dracula bg
  ["#24292e", "#0D1117"], // github dark bg
  ["#0d1117", "#0D1117"], // github dark bg (lowercase)
  ["#1a1b27", "#0D1117"], // tokyonight bg
  ["#2d333b", "#0D1117"], // github_dark bg

  // Accent/title colors → our red
  ["#ff79c6", "#E53228"], // dracula pink
  ["#f97583", "#E53228"], // github accent
  ["#e53228", "#E53228"], // radical red (already correct)
  ["#ff6b6b", "#E53228"], // some theme red

  // Text colors
  ["#f8f8f2", "#C9D1D9"], // dracula text → github light
  ["#c9d1d9", "#C9D1D9"], // github text (already correct)

  // Secondary text / muted
  ["#6272a4", "#8B949E"], // dracula comment → github muted
  ["#8b949e", "#8B949E"], // github muted (already correct)

  // Borders
  ["#444c56", "#30363D"], // github border
  ["#30363d", "#30363D"], // github border (lowercase)

  // Icon fills
  ["#58a6ff", "#E53228"], // github blue link → red
  ["#79c0ff", "#fb7252"], // github light blue → light red

  // Stats numbers
  ["#f0883e", "#E53228"], // github orange → red
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
