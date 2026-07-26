const fs = require("fs");
const https = require("https");
const path = require("path");

const publishedSheetUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRwavZryZXcgw2zNyrl7X3rXQtkbpSpgDiDl4oUuuKTOqdxWDIWISCpOdSC2npPHZyGCUjPkpvYeOpJ";
const pubhtmlUrl = `${publishedSheetUrl}/pubhtml`;
const scheduleDataPath = path.join(__dirname, "..", "schedule-data.js");
const indexPath = path.join(__dirname, "..", "index.html");

function parseCliDate(argv = process.argv.slice(2)) {
  const rawDateArg = argv.find((arg) => arg.startsWith("--date="));
  if (!rawDateArg) return new Date();

  const value = rawDateArg.slice("--date=".length);
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    throw new Error(`Invalid --date value: ${value}. Expected YYYY-MM-DD.`);
  }

  const [, year, month, day] = match;
  return new Date(Number(year), Number(month) - 1, Number(day), 12);
}

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
        url: `${publishedSheetUrl}/pub?gid=${gid}&single=true&output=csv`,
        htmlUrl: `${publishedSheetUrl}/pubhtml/sheet?headers=false&gid=${gid}`
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
  const firstOfMonth = new Date(monday.getFullYear(), monday.getMonth(), 1);
  const firstDayOffset = (firstOfMonth.getDay() + 6) % 7;
  const week = Math.floor((firstDayOffset + monday.getDate() - 1) / 7) + 1;
  return `${yy}년${month}월${week}주`;
}

function parseWeekLabel(label) {
  const match = label.match(/^(\d{2})년(\d{1,2})월(\d{1,2})주$/);
  if (!match) return null;
  return {
    year: 2000 + Number(match[1]),
    month: Number(match[2]),
    week: Number(match[3])
  };
}

function compareWeekLabels(left, right) {
  const leftValue = parseWeekLabel(left);
  const rightValue = parseWeekLabel(right);
  if (!leftValue || !rightValue) return 0;
  if (leftValue.year !== rightValue.year) return leftValue.year - rightValue.year;
  if (leftValue.month !== rightValue.month) return leftValue.month - rightValue.month;
  return leftValue.week - rightValue.week;
}

function pickActiveTabs(tabs, date = new Date()) {
  const currentLabel = getWeekLabel(date);
  const currentIndex = tabs.findIndex((tab) => tab.label === currentLabel);

  if (currentIndex >= 0) {
    return tabs.slice(currentIndex, currentIndex + 2);
  }

  const nextPublishedIndex = tabs.findIndex((tab) => compareWeekLabels(tab.label, currentLabel) >= 0);
  if (nextPublishedIndex >= 0) {
    return tabs.slice(nextPublishedIndex, nextPublishedIndex + 2);
  }

  return tabs.slice(-2);
}

function decodeHtml(value = "") {
  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/\s+/g, " ")
    .trim();
}

function parseStyles(html) {
  const styles = {};
  const pattern = /\.ritz \.waffle \.([^{]+)\{([^}]+)\}/g;
  let match;

  while ((match = pattern.exec(html))) {
    const className = match[1];
    const body = match[2];
    const background = body.match(/background-color:(#[0-9a-fA-F]{6})/);
    if (background) styles[className] = background[1].toLowerCase();
  }

  return styles;
}

function parseHtmlTable(html) {
  const styles = parseStyles(html);
  const rows = [];
  const rowspans = new Map();
  const rowPattern = /<tr[^>]*>([\s\S]*?)<\/tr>/g;
  let rowMatch;

  while ((rowMatch = rowPattern.exec(html))) {
    const row = [];
    let column = 0;
    const cellPattern = /<(td|th)([^>]*)>([\s\S]*?)<\/\1>/g;
    let cellMatch;

    const fillRowspan = () => {
      while (rowspans.has(column)) {
        const span = rowspans.get(column);
        row[column] = { ...span.cell, text: "" };
        span.remaining -= 1;
        if (span.remaining <= 0) {
          rowspans.delete(column);
        }
        column += 1;
      }
    };

    while ((cellMatch = cellPattern.exec(rowMatch[1]))) {
      fillRowspan();

      const attrs = cellMatch[2];
      const className = attrs.match(/class="([^"]+)"/)?.[1] || "";
      const colspan = Number(attrs.match(/colspan="(\d+)"/)?.[1] || 1);
      const rowspan = Number(attrs.match(/rowspan="(\d+)"/)?.[1] || 1);
      const text = decodeHtml(cellMatch[3]);
      const background = className
        .split(/\s+/)
        .map((name) => styles[name])
        .find(Boolean) || "";

      for (let index = 0; index < colspan; index += 1) {
        const cell = {
          text: index === 0 ? text : "",
          background
        };
        row[column] = cell;
        if (rowspan > 1) {
          rowspans.set(column, {
            remaining: rowspan - 1,
            cell
          });
        }
        column += 1;
      }
    }

    fillRowspan();

    if (row.some((cell) => cell.text)) rows.push(row);
  }

  return rows;
}

function isTimeRange(value = "") {
  return /^\d{1,2}:\d{2}\s*[~-]\s*\d{1,2}:\d{2}$/.test(value.trim());
}

function isTimeMarker(value = "") {
  return /^~?\d{1,2}:\d{2}$/.test(value.trim());
}

function parseDateCell(value = "", year = new Date().getFullYear()) {
  const match = value.match(/(\d{1,2})\s*\/\s*(\d{1,2})\s*([월화수목금토일])?/);
  if (!match) return null;

  const month = Number(match[1]);
  const day = Number(match[2]);
  const date = new Date(year, month - 1, day);
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];

  return {
    date: `${month}/${day}`,
    label: match[3] || weekdays[date.getDay()],
    key: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
  };
}

function findRecentDateCell(row, column, year) {
  for (let index = column; index >= 0; index -= 1) {
    const parsed = parseDateCell(row[index]?.text || "", year);
    if (parsed) return parsed;
  }
  return null;
}

function isBreakOrOff(text = "") {
  return /식사|휴게|휴무|연차|불가/.test(text);
}

function isWorkBackground(background = "") {
  return Boolean(background)
    && !["#ffffff", "#d9d9d9", "#bfbfbf", "#cccccc"].includes(background);
}

function normalizeRole(text = "") {
  const value = text.trim();
  if (!value || isTimeMarker(value)) return "";
  return value.replace(/\s+/g, " ");
}

function roleFromCell(cell, previousRole = "") {
  const text = normalizeRole(cell.text);

  if (cell.background === "#c9daf8") {
    return text.includes("보조") ? "베이커리 보조" : "베이커리카페";
  }

  if (cell.background === "#ff9900") {
    if (text && !["카페"].includes(text)) return text;
    return previousRole || "카페";
  }

  if (cell.background === "#ffff00") {
    return text || previousRole || "오픈";
  }

  if (text) return text;
  return previousRole || "근무";
}

function mergeAssignment(blockMap, time, assignment) {
  if (!blockMap.has(time)) blockMap.set(time, []);
  const assignments = blockMap.get(time);
  const existing = assignments.find((item) => item.name === assignment.name && item.role === assignment.role);
  if (!existing) assignments.push(assignment);
}

function parseScheduleHtml(html, label) {
  const rows = parseHtmlTable(html);
  const nameRowIndex = rows.findIndex((row) => row.some((cell) => cell.text === "근무시간"));
  if (nameRowIndex < 1) return [];

  const nameRow = rows[nameRowIndex];
  const dateRow = rows[nameRowIndex - 1];
  const yearMatch = label.match(/^(\d{2})년/);
  const year = yearMatch ? 2000 + Number(yearMatch[1]) : new Date().getFullYear();
  const timeColumns = nameRow
    .map((cell, index) => (cell.text === "근무시간" ? index : -1))
    .filter((index) => index >= 0);
  const daysByKey = new Map();

  timeColumns.forEach((timeColumn, timeColumnIndex) => {
    const date = findRecentDateCell(dateRow, timeColumn, year);
    if (!date) return;

    const nextTimeColumn = timeColumns[timeColumnIndex + 1] || nameRow.length;
    const blockMap = new Map();

    for (let column = timeColumn + 1; column < nextTimeColumn; column += 1) {
      const name = nameRow[column]?.text?.trim();
      if (!name) continue;

      let previousRole = "";
      for (let rowIndex = nameRowIndex + 1; rowIndex < rows.length; rowIndex += 1) {
        const time = rows[rowIndex][timeColumn]?.text?.trim();
        if (!isTimeRange(time)) continue;

        const cell = rows[rowIndex][column] || { text: "", background: "" };
        if (isBreakOrOff(cell.text) || !isWorkBackground(cell.background)) {
          previousRole = "";
          continue;
        }

        const role = roleFromCell(cell, previousRole);
        previousRole = role;
        mergeAssignment(blockMap, time, {
          name,
          role,
          isParttimer: /p$/i.test(name)
        });
      }
    }

    if (!blockMap.size) return;

    const day = daysByKey.get(date.key) || {
      ...date,
      sheetLabel: label,
      blocks: []
    };

    blockMap.forEach((assignments, time) => {
      const existingBlock = day.blocks.find((block) => block.time === time);
      if (existingBlock) {
        assignments.forEach((assignment) => mergeAssignment(
          new Map([[time, existingBlock.assignments]]),
          time,
          assignment
        ));
      } else {
        day.blocks.push({ time, assignments });
      }
    });

    daysByKey.set(date.key, day);
  });

  return [...daysByKey.values()]
    .map((day) => ({
      ...day,
      blocks: day.blocks
        .filter((block) => block.assignments.length)
        .sort((a, b) => a.time.localeCompare(b.time))
    }))
    .filter((day) => day.blocks.length)
    .sort((a, b) => a.key.localeCompare(b.key));
}

function mergeDays(sources) {
  const merged = new Map();

  sources.flat().forEach((day) => {
    if (!merged.has(day.key)) {
      merged.set(day.key, day);
      return;
    }

    const existingDay = merged.get(day.key);
    day.blocks.forEach((block) => {
      const existingBlock = existingDay.blocks.find((item) => item.time === block.time);
      if (existingBlock) {
        block.assignments.forEach((assignment) => {
          if (!existingBlock.assignments.some((item) => item.name === assignment.name && item.role === assignment.role)) {
            existingBlock.assignments.push(assignment);
          }
        });
      } else {
        existingDay.blocks.push(block);
      }
    });
    existingDay.blocks.sort((a, b) => a.time.localeCompare(b.time));
  });

  return [...merged.values()].sort((a, b) => a.key.localeCompare(b.key));
}

function renderScheduleConfig(tabs, parsedDays) {
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

  lines.push("  ],");
  lines.push(`  parsedLabel: "${tabs.map((tab) => tab.label).join(", ")}",`);
  lines.push(`  parsedDays: ${JSON.stringify(parsedDays, null, 2).replace(/\n/g, "\n  ")}`);
  lines.push("};");
  return lines.join("\n");
}

function replaceScheduleConfig(source, nextConfig) {
  return source.replace(/window\.SCHEDULE_SHEET_CONFIG = \{[\s\S]*?\n\};/, nextConfig);
}

function updateIndexVersion(source) {
  const stamp = new Date().toISOString().slice(0, 13).replace(/[-T]/g, "");
  return source
    .replace(/schedule-data\.js\?v=[^"]+/, `schedule-data.js?v=${stamp}-auto-tabs`);
}

async function main() {
  const targetDate = parseCliDate();
  const html = await fetchText(pubhtmlUrl);
  const tabs = parsePublishedWeeklyTabs(html);
  if (!tabs.length) {
    throw new Error("No published weekly tabs were found.");
  }

  const activeTabs = pickActiveTabs(tabs, targetDate);
  const parsedDays = mergeDays(await Promise.all(activeTabs.map(async (tab) => {
    const sheetHtml = await fetchText(tab.htmlUrl);
    return parseScheduleHtml(sheetHtml, tab.label);
  })));
  const scheduleSource = fs.readFileSync(scheduleDataPath, "utf8");
  const nextScheduleSource = replaceScheduleConfig(scheduleSource, renderScheduleConfig(activeTabs, parsedDays));
  const scheduleChanged = scheduleSource !== nextScheduleSource;
  if (scheduleChanged) {
    fs.writeFileSync(scheduleDataPath, nextScheduleSource);

    const indexSource = fs.readFileSync(indexPath, "utf8");
    fs.writeFileSync(indexPath, updateIndexVersion(indexSource));
  }

  console.log(`Target date: ${targetDate.toISOString().slice(0, 10)}`);
  console.log(`Selected schedule tabs: ${activeTabs.map((tab) => tab.label).join(", ")}`);
  console.log(`Parsed schedule days: ${parsedDays.length}`);
  console.log(`Schedule config changed: ${scheduleChanged ? "yes" : "no"}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
