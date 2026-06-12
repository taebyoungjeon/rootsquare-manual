const fs = require("fs");
const https = require("https");
const path = require("path");

const publishedSheetUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRwavZryZXcgw2zNyrl7X3rXQtkbpSpgDiDl4oUuuKTOqdxWDIWISCpOdSC2npPHZyGCUjPkpvYeOpJ";
const pubhtmlUrl = `${publishedSheetUrl}/pubhtml`;
const scheduleDataPath = path.join(__dirname, "..", "schedule-data.js");
const indexPath = path.join(__dirname, "..", "index.html");

function fetchText(url, redirectCount = 0) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if ([301, 302, 303, 307, 308].includes(response.statusCode) && response.headers.location) {
        if (redirectCount > 5) {
          reject(new Error("Too many redirects"));
          return;
        }
        resolve(fetchText(response.headers.location, redirectCount + 1));
        return;
      }

      let body = "";
      response.setEncoding("utf8");
      response.on("data", (chunk) => {
        body += chunk;
      });
      response.on("end", () => {
        if (response.statusCode < 200 || response.statusCode >= 300) {
          reject(new Error(`HTTP ${response.statusCode}: ${url}`));
          return;
        }
        resolve(body);
      });
    }).on("error", reject);
  });
}

function parsePublishedWeeklyTabs(html) {
  const tabs = [];
  const pattern = /items\.push\(\{name: "([^"]+)".*?gid: "(-?\d+)"/g;
  let match;

  while ((match = pattern.exec(html))) {
    const label = match[1];
    const gid = match[2];
    if (/^26년\d{1,2}월\d{1,2}주$/.test(label)) {
      tabs.push({
        label,
        url: `${publishedSheetUrl}/pub?gid=${gid}&single=true&output=csv`
      });
    }
  }

  return tabs;
}

function getMonday(date) {
  const monday = new Date(date);
  const day = monday.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  monday.setDate(monday.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function getWeekLabel(date) {
  const monday = getMonday(date);
  const yy = String(monday.getFullYear()).slice(2);
  const month = monday.getMonth() + 1;
  const week = Math.floor((monday.getDate() - 1) / 7) + 1;
  return `${yy}년${month}월${week}주`;
}

function pickActiveTabs(tabs, date = new Date()) {
  const currentLabel = getWeekLabel(date);
  const currentIndex = tabs.findIndex((tab) => tab.label === currentLabel);

  if (currentIndex >= 0) {
    return tabs.slice(currentIndex, currentIndex + 2);
  }

  return tabs.slice(-2);
}

function renderScheduleConfig(tabs) {
  const lines = [
    "window.SCHEDULE_SHEET_CONFIG = {",
    "  csvUrls: ["
  ];

  tabs.forEach((tab, index) => {
    lines.push("    {");
    lines.push(`      label: "${tab.label}",`);
    lines.push(`      url: "${tab.url}"`);
    lines.push(`    }${index === tabs.length - 1 ? "" : ","}`);
  });

  lines.push("  ]");
  lines.push("};");
  return lines.join("\n");
}

function replaceScheduleConfig(source, nextConfig) {
  return source.replace(/window\.SCHEDULE_SHEET_CONFIG = \{[\s\S]*?\n\};/, nextConfig);
}

function updateIndexVersion(source) {
  const stamp = new Date().toISOString().slice(0, 13).replace(/[-T]/g, "");
  return source
    .replace(/schedule-data\.js\?v=[^"]+/, `schedule-data.js?v=${stamp}-auto-tabs`)
    .replace(/app\.js\?v=[^"]+/, `app.js?v=${stamp}-auto-tabs`);
}

async function main() {
  const html = await fetchText(pubhtmlUrl);
  const tabs = parsePublishedWeeklyTabs(html);
  if (!tabs.length) {
    throw new Error("No published weekly tabs were found.");
  }

  const activeTabs = pickActiveTabs(tabs);
  const scheduleSource = fs.readFileSync(scheduleDataPath, "utf8");
  const nextScheduleSource = replaceScheduleConfig(scheduleSource, renderScheduleConfig(activeTabs));
  fs.writeFileSync(scheduleDataPath, nextScheduleSource);

  const indexSource = fs.readFileSync(indexPath, "utf8");
  fs.writeFileSync(indexPath, updateIndexVersion(indexSource));

  console.log(`Selected schedule tabs: ${activeTabs.map((tab) => tab.label).join(", ")}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
