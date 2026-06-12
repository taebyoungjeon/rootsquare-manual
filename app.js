const categoryButtons = [...document.querySelectorAll(".category")];
const articlesEl = document.querySelector("#articles");
const detailEl = document.querySelector("#article-detail");
const searchEl = document.querySelector("#manual-search");
const resultCountEl = document.querySelector("#result-count");
const shortcutButtons = [...document.querySelectorAll("[data-shortcut]")];
const todayChecksEl = document.querySelector("#today-checks");
const noticeGroupsEl = document.querySelector("#notice-groups");

const categoryLabels = {
  drink: "음료 제조",
  drinkRecipe: "음료 레시피",
  baseRecipe: "베이스 제조",
  dessertRecipe: "디저트·베이커리",
  shift: "오픈·클로즈",
  service: "고객 응대",
  parttimer: "파트타이머",
  schedule: "근무 시간표",
  clean: "위생·청소",
  stock: "재고·발주",
  equipment: "장비 유지보수"
};

let activeCategory = "all";
let activeArticleId = MANUALS[0]?.id;
let selectedScheduleDateKey = null;

const koreanInitials = [
  "ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ",
  "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"
];

function normalize(text) {
  return text.toLowerCase().replace(/\s+/g, "");
}

function getKoreanInitials(text) {
  return [...text].map((char) => {
    const code = char.charCodeAt(0);
    if (code < 0xac00 || code > 0xd7a3) {
      return char;
    }
    return koreanInitials[Math.floor((code - 0xac00) / 588)];
  }).join("");
}

function createSearchText(parts) {
  const source = Array.isArray(parts) ? parts.join(" ") : parts;
  const normalized = normalize(source);
  return `${normalized} ${getKoreanInitials(normalized)}`;
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"' && inQuotes && nextChar === '"') {
      value += '"';
      i += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      row.push(value.trim());
      value = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") i += 1;
      row.push(value.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      value = "";
    } else {
      value += char;
    }
  }

  row.push(value.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

function getCell(row, names) {
  for (const name of names) {
    if (row[name]) return row[name].trim();
  }
  return "";
}

function splitPeople(value) {
  return value
    .split(/[,\n/·]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatLocalDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDayName(dateText) {
  const date = new Date(dateText);
  if (Number.isNaN(date.getTime())) return "";
  return ["일", "월", "화", "수", "목", "금", "토"][date.getDay()];
}

function toSheetRows(csvText) {
  const rows = parseCsv(csvText);
  const headers = rows.shift()?.map((header) => header.trim()) || [];

  return rows.map((cells) => headers.reduce((row, header, index) => {
    row[header] = cells[index] || "";
    return row;
  }, {}));
}

function buildScheduleFromSheetRows(sheetRows) {
  const rows = sheetRows
    .map((row) => ({
      date: getCell(row, ["날짜", "date", "Date"]),
      day: getCell(row, ["요일", "day", "Day"]),
      time: getCell(row, ["시간", "시간대", "time", "Time"]),
      status: getCell(row, ["상태", "업무", "status", "Status"]),
      regular: splitPeople(getCell(row, ["정규직", "직원", "regular", "Regular"])),
      parttimer: splitPeople(getCell(row, ["파트타이머", "알바", "parttimer", "Parttimer"])),
      roles: splitPeople(getCell(row, ["역할", "메모", "role", "Role"])),
      changedAt: getCell(row, ["변경일", "수정일", "changedAt", "ChangedAt"]),
      changeLabel: getCell(row, ["변경내용", "변경 내역", "change", "Change"])
    }))
    .filter((row) => row.date && row.time);

  if (!rows.length) return null;

  rows.sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));

  const todayText = formatLocalDate(new Date());
  const groupedByDate = rows.reduce((groups, row) => {
    groups[row.date] ||= [];
    groups[row.date].push(row);
    return groups;
  }, {});

  const availableDates = Object.keys(groupedByDate).sort();
  const selectedDate = groupedByDate[todayText]
    ? todayText
    : availableDates.find((date) => date >= todayText) || availableDates[0];
  const todayRows = groupedByDate[selectedDate] || [];
  const allTodayPeople = [...new Set(todayRows.flatMap((row) => [...row.regular, ...row.parttimer]))];
  const nextRow = todayRows[1] || todayRows[0];
  const closeRow = todayRows[todayRows.length - 1] || todayRows[0];
  const selectedDay = todayRows[0]?.day || getDayName(selectedDate);
  const weekLabel = `${selectedDate.slice(0, 4)}년 ${Number(selectedDate.slice(5, 7))}월 근무표`;

  const changes = rows
    .filter((row) => row.changedAt && row.changeLabel)
    .map((row) => ({ date: row.changedAt, label: row.changeLabel }));

  return {
    weekLabel,
    sourceLabel: "Google Sheet 연동",
    todayLabel: `표시일: ${Number(selectedDate.slice(5, 7))}/${Number(selectedDate.slice(8, 10))} ${selectedDay}`,
    updatedAt: changes[0]?.date || selectedDate,
    changes,
    summaryCards: [
      {
        label: "오늘 근무",
        value: allTodayPeople.length ? `총 ${allTodayPeople.length}명` : "등록된 근무자 없음",
        people: allTodayPeople
      },
      {
        label: "다음 출근",
        value: nextRow ? `${nextRow.time} ${nextRow.status || "근무"}` : "등록된 시간 없음",
        people: nextRow ? [...nextRow.regular, ...nextRow.parttimer, ...nextRow.roles] : []
      },
      {
        label: "마감 예정",
        value: closeRow ? `${closeRow.time} ${closeRow.status || "근무"}` : "등록된 시간 없음",
        people: closeRow ? [...closeRow.regular, ...closeRow.parttimer, ...closeRow.roles] : []
      }
    ],
    timeBlocks: todayRows.map((row) => ({
      time: row.time,
      status: row.status || "근무",
      teams: [
        { label: "정규직", people: row.regular.length ? row.regular : ["-"] },
        { label: "파트타이머", people: row.parttimer.length ? row.parttimer : ["-"] },
        { label: "역할", people: row.roles.length ? row.roles : ["-"] }
      ]
    })),
    weekDays: availableDates.map((date) => {
      const dateRows = groupedByDate[date];
      const day = dateRows[0]?.day || getDayName(date);
      const peopleCount = new Set(dateRows.flatMap((row) => [...row.regular, ...row.parttimer])).size;
      return {
        day,
        date: `${Number(date.slice(5, 7))}/${Number(date.slice(8, 10))}`,
        badge: date === todayText ? "오늘" : `${peopleCount}명 · ${dateRows.length}개 시간대`
      };
    })
  };
}

function parseScheduleDate(text) {
  const match = text.match(/(\d{1,2})\/(\d{1,2})\s*([월화수목금토일])?/);
  if (!match) return null;

  const year = new Date().getFullYear();
  const month = match[1].padStart(2, "0");
  const day = match[2].padStart(2, "0");
  return {
    key: `${year}-${month}-${day}`,
    label: `${Number(month)}/${Number(day)}`,
    day: match[3] || getDayName(`${year}-${month}-${day}`)
  };
}

function findRecentDateCell(row, columnIndex) {
  for (let index = columnIndex; index >= 0; index -= 1) {
    const parsed = parseScheduleDate(row[index] || "");
    if (parsed) return parsed;
  }
  return null;
}

function isTimeRange(value) {
  return /^\d{1,2}:\d{2}\s*[~-]\s*\d{1,2}:\d{2}/.test(value || "");
}

function isOffSchedule(value) {
  return /휴무|연차|불가/.test(value || "");
}

function formatAssignment(name, task) {
  return task && task !== name ? `${name}(${task})` : name;
}

function buildScheduleView(days, selectedDateKey) {
  const todayText = formatLocalDate(new Date());
  const selectedDay = days.find((day) => day.key === selectedDateKey)
    || days.find((day) => day.key === todayText)
    || days.find((day) => day.key >= todayText)
    || days[0];
  const activeBlocks = selectedDay.blocks.filter((block) => block.assignments.length);
  const allTodayPeople = [...new Set(activeBlocks.flatMap((block) => block.assignments.map((assignment) => assignment.name)))];
  const nextBlock = activeBlocks[0];
  const closeBlock = activeBlocks[activeBlocks.length - 1];

  return {
    weekLabel: selectedDay.sheetLabel,
    sourceLabel: "Google Sheet 연동",
    todayLabel: `표시일: ${selectedDay.label} ${selectedDay.day}`,
    selectedDateKey: selectedDay.key,
    updatedAt: todayText,
    changes: [],
    summaryCards: [
      {
        label: "선택일 근무",
        value: allTodayPeople.length ? `총 ${allTodayPeople.length}명` : "등록된 근무자 없음",
        people: allTodayPeople
      },
      {
        label: "첫 근무",
        value: nextBlock ? nextBlock.time : "등록된 시간 없음",
        people: nextBlock ? nextBlock.assignments.map((assignment) => formatAssignment(assignment.name, assignment.task)) : []
      },
      {
        label: "마감 근무",
        value: closeBlock ? closeBlock.time : "등록된 시간 없음",
        people: closeBlock ? closeBlock.assignments.map((assignment) => formatAssignment(assignment.name, assignment.task)) : []
      }
    ],
    timeBlocks: activeBlocks.map((block) => {
      const regular = block.assignments
        .filter((assignment) => !assignment.isParttimer)
        .map((assignment) => formatAssignment(assignment.name, assignment.task));
      const parttimers = block.assignments
        .filter((assignment) => assignment.isParttimer)
        .map((assignment) => formatAssignment(assignment.name, assignment.task));
      const roles = [...new Set(block.assignments.map((assignment) => assignment.task))];

      return {
        time: block.time,
        status: "근무",
        teams: [
          { label: "정규직", people: regular.length ? regular : ["-"] },
          { label: "파트타이머", people: parttimers.length ? parttimers : ["-"] },
          { label: "역할", people: roles.length ? roles : ["-"] }
        ]
      };
    }),
    weekDays: days.map((day) => {
      const peopleCount = new Set(day.blocks.flatMap((block) => block.assignments.map((assignment) => assignment.name))).size;
      return {
        key: day.key,
        day: day.day,
        date: day.label,
        badge: day.key === todayText ? "오늘" : `${peopleCount}명 · ${day.blocks.length}개 시간대`
      };
    })
  };
}

function buildScheduleFromWeeklySheets(sheets) {
  const days = [];

  sheets.forEach((sheet) => {
    const rows = parseCsv(sheet.csvText);
    const dateRowIndex = rows.findIndex((row) => row.some((cell) => parseScheduleDate(cell || "")));
    if (dateRowIndex < 0) return;

    const dateRow = rows[dateRowIndex];
    const nameRow = rows[dateRowIndex + 1] || [];
    const timeColumns = nameRow
      .map((cell, index) => (cell === "근무시간" ? index : -1))
      .filter((index) => index >= 0);

    timeColumns.forEach((timeColumn, timeColumnIndex) => {
      const date = findRecentDateCell(dateRow, timeColumn);
      if (!date) return;

      const nextTimeColumn = timeColumns[timeColumnIndex + 1] || nameRow.length;
      const names = [];
      for (let column = timeColumn + 1; column < nextTimeColumn; column += 1) {
        const name = (nameRow[column] || "").trim();
        if (name) names.push({ column, name });
      }

      const blockMap = new Map();
      rows.slice(dateRowIndex + 2).forEach((row) => {
        const time = (row[timeColumn] || "").trim();
        if (!isTimeRange(time)) return;

        const assignments = names
          .map(({ column, name }) => {
            const task = (row[column] || "").trim().replace(/\s+/g, " ");
            if (!task || isOffSchedule(task)) return null;
            return {
              name,
              task,
              isParttimer: /p$/i.test(name)
            };
          })
          .filter(Boolean);

        if (!assignments.length) return;
        if (!blockMap.has(time)) {
          blockMap.set(time, []);
        }
        blockMap.get(time).push(...assignments);
      });

      const day = days.find((item) => item.key === date.key) || {
        ...date,
        sheetLabel: sheet.label,
        blocks: []
      };

      blockMap.forEach((assignments, time) => {
        const existingBlock = day.blocks.find((block) => block.time === time);
        if (existingBlock) {
          existingBlock.assignments.push(...assignments);
        } else {
          day.blocks.push({ time, assignments });
        }
      });

      if (!days.includes(day)) days.push(day);
    });
  });

  if (!days.length) return null;

  days.sort((a, b) => a.key.localeCompare(b.key));
  days.forEach((day) => {
    day.blocks.sort((a, b) => a.time.localeCompare(b.time));
  });

  const schedule = buildScheduleView(days, selectedScheduleDateKey);
  schedule.days = days;
  return schedule;
}

function getFilteredManuals() {
  const terms = searchEl.value
    .trim()
    .split(/\s+/)
    .map(normalize)
    .filter(Boolean);

  return MANUALS.filter((manual) => {
    const inCategory = activeCategory === "all" || manual.category === activeCategory;
    const searchable = createSearchText([
      manual.title,
      manual.summary,
      categoryLabels[manual.category],
      ...manual.tags,
      ...manual.steps,
      ...manual.checklist
    ]);

    if (terms.length) {
      return terms.some((term) => searchable.includes(term));
    }

    return inCategory;
  });
}

function renderCounts() {
  document.querySelector("#count-all").textContent = MANUALS.length;

  Object.keys(categoryLabels).forEach((category) => {
    const countEl = document.querySelector(`#count-${category}`);
    const count = MANUALS.filter((manual) => manual.category === category).length;
    if (!countEl) return;
    countEl.textContent = count;
    countEl.closest(".category").hidden = count === 0;
  });
}

function renderNotices() {
  todayChecksEl.innerHTML = TODAY_CHECKS.map((item) => `
    <label>
      <input type="checkbox">
      <span>${item}</span>
    </label>
  `).join("");

  noticeGroupsEl.innerHTML = NOTICE_GROUPS.map((group) => `
    <section class="notice-card">
      <div class="notice-card-head">
        <span>${group.label}</span>
        <h3>${group.title}</h3>
      </div>
      <ul>
        ${group.items.map((item) => `<li>${item}</li>`).join("")}
      </ul>
    </section>
  `).join("");
}

function renderArticles() {
  const manuals = getFilteredManuals();
  resultCountEl.textContent = `${manuals.length}개`;

  articlesEl.innerHTML = manuals.map((manual) => `
    <button class="article-card ${manual.id === activeArticleId ? "is-active" : ""}" data-article-id="${manual.id}">
      <h3>${manual.title}</h3>
      <p>${manual.summary}</p>
      <div class="tag-row">
        <span class="tag">${categoryLabels[manual.category]}</span>
        ${manual.tags.slice(0, 2).map((tag) => `<span class="tag">${tag}</span>`).join("")}
      </div>
    </button>
  `).join("");

  document.querySelectorAll("[data-article-id]").forEach((button) => {
    button.addEventListener("click", () => {
      activeArticleId = button.dataset.articleId;
      renderArticles();
      renderDetail();
      scrollToDetail();
    });
  });

  if (!manuals.some((manual) => manual.id === activeArticleId)) {
    activeArticleId = manuals[0]?.id;
    renderDetail();
  }
}

function getStickyOffset() {
  if (window.innerWidth > 920) return 18;

  const sidebarHeight = sidebarEl?.offsetHeight || 0;
  const searchHeight = searchPanelEl?.offsetHeight || 0;
  return sidebarHeight + searchHeight + 18;
}

function scrollToDetail() {
  if (!detailEl) return;

  requestAnimationFrame(() => {
    const top = detailEl.getBoundingClientRect().top + window.scrollY - getStickyOffset();
    window.scrollTo({ top: Math.max(top, 0), behavior: "smooth" });
  });
}

function renderDetail() {
  const manual = MANUALS.find((item) => item.id === activeArticleId);

  if (!manual) {
    detailEl.classList.remove("is-schedule-detail");
    detailEl.innerHTML = `
      <div class="empty-state">
        <h2>검색 결과가 없습니다</h2>
        <p>다른 단어로 검색하거나 전체 카테고리를 선택해보세요.</p>
      </div>
    `;
    return;
  }

  detailEl.classList.toggle("is-schedule-detail", manual.type === "schedule");

  if (manual.type === "schedule") {
    renderScheduleDetail(manual);
    return;
  }

  const isRecipe = ["drinkRecipe", "baseRecipe", "dessertRecipe"].includes(manual.category);

  detailEl.innerHTML = `
    <h2>${manual.title}</h2>
    <p class="summary">${manual.summary}</p>
    <div class="meta-bar">
      <span>${categoryLabels[manual.category]}</span>
      <span>담당: ${manual.owner}</span>
      <span>수정일: ${manual.updated}</span>
    </div>

    <section class="manual-section">
      <h3>${isRecipe ? "레시피 내용" : "진행 순서"}</h3>
      <ol class="steps">
        ${manual.steps.map((step) => `<li>${step}</li>`).join("")}
      </ol>
    </section>

    <section class="manual-section">
      <h3>${isRecipe ? "핵심 확인" : "확인 체크리스트"}</h3>
      <div class="checklist">
        ${manual.checklist.map((item) => `
          <label>
            <input type="checkbox">
            <span>${item}</span>
          </label>
        `).join("")}
      </div>
    </section>

    <section class="manual-section">
      <h3>메모</h3>
      <p class="note">${manual.note}</p>
    </section>
  `;
}

function renderScheduleDetail(manual) {
  const schedule = manual.schedule.days
    ? buildScheduleView(manual.schedule.days, selectedScheduleDateKey || manual.schedule.selectedDateKey)
    : manual.schedule;
  if (manual.schedule.days) {
    manual.schedule = { ...schedule, days: manual.schedule.days };
  }

  detailEl.innerHTML = `
    <div class="schedule-hero">
      <div>
        <p class="schedule-label">${schedule.sourceLabel}</p>
        <h2>${manual.title}</h2>
        <p>${manual.summary}</p>
      </div>
      <div class="schedule-date">
        <span>${schedule.weekLabel}</span>
        <strong>${schedule.todayLabel}</strong>
      </div>
    </div>

    <section class="schedule-summary" aria-label="오늘 근무 요약">
      ${schedule.summaryCards.map((card) => `
        <article class="schedule-summary-card">
          <span>${card.label}</span>
          <strong>${card.value}</strong>
          <div>
            ${card.people.map((person) => `<em>${person}</em>`).join("")}
          </div>
        </article>
      `).join("")}
    </section>

    <section class="manual-section">
      <h3>시간대별 근무</h3>
      <div class="schedule-timeline">
        ${schedule.timeBlocks.map((block) => `
          <article class="schedule-block">
            <div class="schedule-time">
              <strong>${block.time}</strong>
              <span>${block.status}</span>
            </div>
            <div class="schedule-teams">
              ${block.teams.map((team) => `
                <div>
                  <b>${team.label}</b>
                  <p>${team.people.join(" · ")}</p>
                </div>
              `).join("")}
            </div>
          </article>
        `).join("")}
      </div>
    </section>

    <section class="manual-section">
      <h3>이번 주 보기</h3>
      <div class="week-strip">
        ${schedule.weekDays.map((day) => `
          <button type="button" class="${day.key === schedule.selectedDateKey ? "is-today" : ""}" data-schedule-date="${day.key || ""}">
            <span>${day.day}</span>
            <strong>${day.date}</strong>
            <em>${day.badge}</em>
          </button>
        `).join("")}
      </div>
    </section>

    <section class="manual-section">
      <h3>운영 메모</h3>
      <p class="note">${manual.note}</p>
    </section>
  `;

  detailEl.querySelectorAll("[data-schedule-date]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedScheduleDateKey = button.dataset.scheduleDate;
      renderScheduleDetail(manual);
      scrollToDetail();
    });
  });
}

function setCategory(category) {
  activeCategory = category;
  categoryButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.category === category);
  });
  renderArticles();
}

categoryButtons.forEach((button) => {
  button.addEventListener("click", () => {
    searchEl.value = "";
    setCategory(button.dataset.category);
  });
});

searchEl.addEventListener("input", renderArticles);

shortcutButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const shortcut = button.dataset.shortcut;
    const shortcutMap = {
      open: { category: "shift", query: "오픈" },
      schedule: { category: "schedule", query: "" },
      parttimer: { category: "parttimer", query: "" },
      drinkRecipe: { category: "drinkRecipe", query: "" },
      baseRecipe: { category: "baseRecipe", query: "" },
      dessertRecipe: { category: "dessertRecipe", query: "" },
      rush: { category: "drink", query: "스무디 따뜻한 음료" },
      claim: { category: "service", query: "품절 안내 응대" },
      close: { category: "shift", query: "마감 클로즈" }
    };
    const next = shortcutMap[shortcut];
    searchEl.value = next.query;
    setCategory(next.category);
  });
});

renderCounts();
renderNotices();
renderArticles();
renderDetail();

// ── Sticky offset: sidebar 높이를 CSS 변수로 전달 ──
const sidebarEl = document.querySelector(".sidebar");
const searchPanelEl = document.querySelector(".search-panel");
const fabScheduleEl = document.getElementById("fab-schedule");
const scheduleChangeBadgeEl = document.getElementById("schedule-change-badge");
const fabTopEl = document.getElementById("fab-top");
const fabItemsEl = document.getElementById("fab-items");

function getScheduleChangeCount(days = 3) {
  const scheduleManual = MANUALS.find((manual) => manual.type === "schedule");
  const changes = scheduleManual?.schedule?.changes || [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return changes.filter((change) => {
    const changedAt = new Date(change.date);
    if (Number.isNaN(changedAt.getTime())) return false;
    changedAt.setHours(0, 0, 0, 0);
    const diffDays = (today - changedAt) / 86400000;
    return diffDays >= 0 && diffDays < days;
  }).length;
}

function renderScheduleBadge() {
  const changeCount = getScheduleChangeCount();
  if (!scheduleChangeBadgeEl) return;

  scheduleChangeBadgeEl.hidden = changeCount === 0;
  scheduleChangeBadgeEl.textContent = changeCount > 9 ? "9+" : "N";
  fabScheduleEl.setAttribute(
    "aria-label",
    changeCount > 0 ? `오늘 근무표, 최근 변경 ${changeCount}건` : "오늘 근무표"
  );
  fabScheduleEl.title = changeCount > 0 ? `오늘 근무표 · 최근 변경 ${changeCount}건` : "오늘 근무표";
}

async function loadScheduleSheet() {
  const config = window.SCHEDULE_SHEET_CONFIG || {};
  const sources = Array.isArray(config.csvUrls)
    ? config.csvUrls
    : [{ label: "Google Sheet", url: config.csvUrl }];
  const validSources = sources.filter((source) => source.url?.trim());
  if (!validSources.length) return;

  try {
    const sheets = await Promise.all(validSources.map(async (source) => {
      const response = await fetch(source.url, { cache: "no-store" });
      if (!response.ok) throw new Error(`Google Sheet 응답 오류: ${response.status}`);
      return {
        label: source.label,
        csvText: await response.text()
      };
    }));
    const schedule = buildScheduleFromWeeklySheets(sheets) || buildScheduleFromSheetRows(toSheetRows(sheets[0].csvText));
    const scheduleManual = MANUALS.find((manual) => manual.type === "schedule");
    if (!schedule || !scheduleManual) return;

    scheduleManual.title = "근무 시간표";
    scheduleManual.summary = "Google Sheet에 등록된 근무 시간표를 기준으로 오늘 근무자와 이번 주 시간표를 확인합니다.";
    scheduleManual.updated = schedule.updatedAt;
    scheduleManual.tags = ["근무표", "오늘근무", "파트타이머", "정규직", "Google Sheet"];
    scheduleManual.note = "Google Sheet에서 불러온 근무표입니다. 수정은 담당자용 시트에서 진행합니다.";
    scheduleManual.schedule = schedule;
    selectedScheduleDateKey ||= schedule.selectedDateKey;

    renderCounts();
    renderArticles();
    renderDetail();
    renderScheduleBadge();
  } catch (error) {
    console.warn("근무표 Google Sheet를 불러오지 못했습니다.", error);
  }
}

function updateSidebarHeight() {
  if (window.innerWidth <= 920) {
    document.documentElement.style.setProperty("--sidebar-h", sidebarEl.offsetHeight + "px");
  } else {
    document.documentElement.style.removeProperty("--sidebar-h");
  }
}
updateSidebarHeight();
renderScheduleBadge();
loadScheduleSheet();
window.addEventListener("resize", updateSidebarHeight);

// ── FAB 버튼 ──
fabScheduleEl.addEventListener("click", () => {
  searchEl.value = "";
  activeArticleId = "weekly-schedule-sample";
  setCategory("schedule");
  scrollToDetail();
});

fabTopEl.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

fabItemsEl.addEventListener("click", () => {
  const target = document.getElementById("manual-content");
  if (!target) return;
  const top = target.getBoundingClientRect().top + window.scrollY - getStickyOffset();
  window.scrollTo({ top, behavior: "smooth" });
});
