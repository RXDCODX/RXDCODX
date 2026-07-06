const fs = require("fs");
const path = require("path");

const COLOR = "#E53228";
const BG = "#0D1117";
const FONT = "'Courier New', monospace";

const headers = [
  { file: "h-whoami.svg", text: "> whoami", size: 24 },
  { file: "h-tech-stack.svg", text: "> tech stack", size: 24 },
  { file: "h-projects.svg", text: "> projects", size: 24 },
  { file: "h-github-stats.svg", text: "> github stats", size: 24 },
  { file: "h-snake.svg", text: "> contribution snake", size: 24 },
  { file: "h-backend.svg", text: "Backend", size: 18 },
  { file: "h-data.svg", text: "Data & Messaging", size: 18 },
  { file: "h-frontend.svg", text: "Frontend", size: 18 },
  { file: "h-observability.svg", text: "Observability & Monitoring", size: 18 },
  { file: "h-testing.svg", text: "Testing", size: 18 },
  { file: "h-devops.svg", text: "DevOps & Cloud", size: 18 },
  { file: "h-tools.svg", text: "Tools", size: 18 },
  { file: "h-integrations.svg", text: "Integrations", size: 18 },
  { file: "h-profile-summary.svg", text: "Profile Summary", size: 18 },
  { file: "h-metrics.svg", text: "Metrics", size: 18 },
];

const outDir = path.join(__dirname, "..", "..", "assets", "headers");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

for (const h of headers) {
  const charWidth = h.size * 0.62;
  const width = Math.ceil(h.text.length * charWidth) + 20;
  const height = h.size + 10;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <text x="0" y="${h.size}" font-family="${FONT}" font-weight="bold" font-size="${h.size}" fill="${COLOR}">${h.text}</text>
</svg>`;
  fs.writeFileSync(path.join(outDir, h.file), svg);
  console.log("Generated " + h.file);
}

console.log("Done! " + headers.length + " headers generated.");
