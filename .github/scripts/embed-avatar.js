const fs = require("fs");
const path = require("path");
const https = require("https");

const AVATAR_URL =
  "https://avatars.githubusercontent.com/u/88150316?v=4&s=400";
const SVG_TEMPLATE = path.join(__dirname, "..", "assets", "avatar-electric.svg");
const DIST_DIR = path.join(__dirname, "..", "dist");

function download(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { "User-Agent": "RXDCODX-Bot" } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return download(res.headers.location).then(resolve, reject);
        }
        const chunks = [];
        res.on("data", (d) => chunks.push(d));
        res.on("end", () => resolve(Buffer.concat(chunks)));
        res.on("error", reject);
      })
      .on("error", reject);
  });
}

async function main() {
  console.log("Downloading avatar...");
  const buf = await download(AVATAR_URL);
  const b64 = buf.toString("base64");
  const mime = "image/png";
  const dataUri = `data:${mime};base64,${b64}`;
  console.log("Avatar downloaded, " + buf.length + " bytes");

  let svg = fs.readFileSync(SVG_TEMPLATE, "utf-8");

  // Replace external URL with base64 data URI
  svg = svg.replace(
    /href="[^"]*"/,
    `href="${dataUri}"`
  );

  // Remove RXDCODX text at bottom
  svg = svg.replace(/<text x="210" y="405"[^>]*>.*?<\/text>\n?/, "");

  if (!fs.existsSync(DIST_DIR)) fs.mkdirSync(DIST_DIR, { recursive: true });
  const outPath = path.join(DIST_DIR, "avatar-electric.svg");
  fs.writeFileSync(outPath, svg);
  console.log("Written to " + outPath);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
