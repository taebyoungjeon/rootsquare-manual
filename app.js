const categoryButtons = [...document.querySelectorAll(".category")];
const articlesEl = document.querySelector("#articles");
const detailEl = document.querySelector("#article-detail");
const searchEl = document.querySelector("#manual-search");
const resultCountEl = document.querySelector("#result-count");
const shortcutButtons = [...document.querySelectorAll("[data-shortcut]")];
const todayChecksEl = document.querySelector("#today-checks");
const noticeGroupsEl = document.querySelector("#notice-groups");
const noticeExpandToggleEl = document.querySelector("#notice-expand-toggle");
const dailyCheckFormEl = document.querySelector("#daily-check-form");
const dailyCheckItemsEl = document.querySelector("#daily-check-items");
const dailyCheckNameEl = document.querySelector("#daily-check-name");
const dailyCheckNoteEl = document.querySelector("#daily-check-note");
const dailyCheckStatusEl = document.querySelector("#daily-check-status");
const dailyCheckTypeButtons = [...document.querySelectorAll("[data-daily-check-type]")];
const dailyManageLinkEl = document.querySelector("#daily-manage-link");
const noticeManageLinkEl = document.querySelector("#notice-manage-link");
const inventoryCheckFormEl = document.querySelector("#inventory-check-form");
const inventoryCheckItemsEl = document.querySelector("#inventory-check-items");
const inventoryCheckNameEl = document.querySelector("#inventory-check-name");
const inventoryCheckNoteEl = document.querySelector("#inventory-check-note");
const inventoryCheckStatusEl = document.querySelector("#inventory-check-status");
const inventoryManageLinkEl = document.querySelector("#inventory-manage-link");
const inventoryCollapseToggleEl = document.querySelector("#inventory-collapse-toggle");
let noticePhotoDialogEl = null;

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
  equipment: "장비 유지보수",
  stayHistory: "스테이 운영 히스토리"
};

let activeCategory = "all";
let activeArticleId = MANUALS[0]?.id;
let selectedScheduleDateKey = null;
let activeDailyCheckType = "open";
let todayNoticeConfig = null;
let inventoryItems = [];
let isNoticeExpanded = false;
let isInventoryExpanded = false;
const STAY_HISTORY_MANUAL_PREFIX = "stay-history-";

const DAILY_CHECKLISTS = {
  open: {
    label: "오픈",
    items: [
      { text: "북카페 옆문을 열었습니다.", important: true },
      { text: "작주온 문을 열었습니다.", important: true },
      { text: "북카페 에어컨 번호를 확인했습니다.", important: true },
      { text: "야외 음악은 11시 이후 재생 기준을 확인했습니다.", important: true },
      { text: "스템가든/북카페 홀과 야외 테이블 상태를 확인했습니다.", important: false },
      { text: "주말 손님이 적을 때 인포메이션 또는 스마트팜 앞 안내 근무 기준을 확인했습니다.", important: false }
    ]
  },
  close: {
    label: "마감",
    items: [
      { text: "스템가든 회전문 잠금 상태를 확인했습니다.", important: true },
      { text: "북카페/외부 출입문 잠금 상태를 확인했습니다.", important: true },
      { text: "야외 음악, 조명, 냉난방 종료 상태를 확인했습니다.", important: true },
      { text: "우유 냉장고와 베이스 잔량을 확인했습니다.", important: false },
      { text: "다음 날 소모품과 오픈 준비 상태를 확인했습니다.", important: false },
      { text: "특이사항이 있으면 메모 또는 직원에게 공유했습니다.", important: false }
    ]
  }
};

const DEFAULT_INVENTORY_ITEMS = [
  { name: "아이스크림", category: "유제품", unit: "팩", min: 6, weekendMin: 15, note: "새 제품 재고수량 기준. 기계 안 수량은 제외" },
  { name: "눈꽃 베이스", category: "베이스", unit: "피처", min: 1, weekendMin: 3 },
  { name: "쌀크림 베이스", category: "베이스", unit: "피처", min: 1, weekendMin: 4 },
  { name: "딸기 베이스", category: "베이스", unit: "피처", min: 1, weekendMin: 4 },
  { name: "말차 베이스", category: "베이스", unit: "피처", min: 1, weekendMin: 1 },
  { name: "토마토 과일", category: "과일", unit: "컵", min: 15, weekendMin: 30 },
  { name: "케일키위바나나 과일", category: "과일", unit: "통", min: 4, weekendMin: 8, note: "케일 0통, 키위 0통, 바나나 0통" },
  { name: "복숭아 베이스 (농축액)", category: "베이스", unit: "통", min: 2, weekendMin: 4 },
  { name: "복숭아 과일 (냉동)", category: "과일", unit: "팩", min: 4, weekendMin: 6 },
  { name: "블루베리 베이스 (리플잼)", category: "베이스", unit: "팩", min: 2, weekendMin: 4 },
  { name: "요거트 파우더", category: "파우더", unit: "팩", min: 2, weekendMin: 4 },
  { name: "청포도 베이스", category: "베이스", unit: "피처", min: 1, weekendMin: 2 },
  { name: "초콜렛밀크 베이스", category: "베이스", unit: "피처", min: 1, weekendMin: 1 },
  { name: "감귤생강 베이스", category: "베이스", unit: "피처", min: 1, weekendMin: 2 },
  { name: "허니자몽 베이스", category: "베이스", unit: "피처", min: 1, weekendMin: 2 },
  { name: "애플레몬 베이스", category: "베이스", unit: "피처", min: 1, weekendMin: 2 },
  { name: "패션후르츠 베이스", category: "베이스", unit: "피처", min: 1, weekendMin: 2 }
];

inventoryItems = DEFAULT_INVENTORY_ITEMS;

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

function splitLines(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean);
  }

  return String(value || "")
    .split(/\n+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function sanitizePlainText(value) {
  return escapeHtml(String(value || "").trim());
}

function createStayHistoryManual(item, index) {
  const rawId = item.id || item.fileId || `${item.eventDate || "event"}-${index}`;
  const id = `${STAY_HISTORY_MANUAL_PREFIX}${String(rawId).replace(/[^\w-]+/g, "-")}`;
  const title = sanitizePlainText(item.title || item.fileName || "스테이 운영 이슈");
  const category = sanitizePlainText(item.category || "운영 이슈");
  const summary = sanitizePlainText(item.summary || "Drive 캡처에서 자동 정리된 운영 히스토리입니다.");
  const facts = splitLines(item.facts).map(sanitizePlainText);
  const issues = splitLines(item.issues).map(sanitizePlainText);
  const suggestions = splitLines(item.manualSuggestions || item.suggestions).map(sanitizePlainText);
  const steps = [
    ...(item.eventDate ? [`발생/기준일: ${sanitizePlainText(item.eventDate)}`] : []),
    ...(facts.length ? facts.map((text) => `사실: ${text}`) : []),
    ...(issues.length ? issues.map((text) => `이슈: ${text}`) : []),
    ...(suggestions.length ? suggestions.map((text) => `제안: ${text}`) : [])
  ];
  const checklist = [
    item.manualNeeded === "Y" || item.manualNeeded === true
      ? "매뉴얼 반영 필요 여부를 관리자가 확인합니다."
      : "운영 히스토리로 보관하고 반복 여부를 확인합니다.",
    "유사 이슈가 반복되면 체크리스트나 오늘의 필수확인 항목으로 승격합니다."
  ];

  return {
    id,
    category: "stayHistory",
    title,
    summary,
    owner: "운영 관리자",
    updated: sanitizePlainText(item.processedAt || item.eventDate || ""),
    tags: [
      "스테이",
      "운영 히스토리",
      category,
      item.manualNeeded === "Y" || item.manualNeeded === true ? "매뉴얼 검토" : "기록"
    ].filter(Boolean),
    steps: steps.length ? steps : ["Drive 캡처가 등록되었고 세부 분석을 기다리고 있습니다."],
    checklist,
    links: item.fileUrl ? [{ label: "원본 캡처 열기", url: item.fileUrl }] : [],
    note: sanitizePlainText(item.status || "검토대기"),
    isStayHistory: true
  };
}

function syncStayHistoryManuals(items) {
  for (let index = MANUALS.length - 1; index >= 0; index -= 1) {
    if (MANUALS[index]?.isStayHistory) {
      MANUALS.splice(index, 1);
    }
  }

  if (!Array.isArray(items) || !items.length) return;

  items
    .filter((item) => item && (item.title || item.summary || item.fileName))
    .map(createStayHistoryManual)
    .forEach((manual) => MANUALS.push(manual));
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function toDisplayImageUrl(url) {
  const value = String(url || "").trim();
  if (!value) return "";

  const fileMatch = value.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (fileMatch) {
    return `https://drive.google.com/thumbnail?id=${fileMatch[1]}&sz=w1000`;
  }

  const idMatch = value.match(/[?&]id=([^&]+)/);
  if (value.includes("drive.google.com") && idMatch) {
    return `https://drive.google.com/thumbnail?id=${idMatch[1]}&sz=w1000`;
  }

  return value;
}

function shouldShowNoticeImage(group) {
  const title = String(group?.title || "").trim();
  const label = String(group?.label || "").trim();
  const blockedTitles = new Set(["인포 근무 지원"]);

  if (blockedTitles.has(title) || blockedTitles.has(label)) return false;
  return Boolean(String(group?.imageUrl || "").trim());
}

function openNoticePhotoDialog(imageUrl, title, originalUrl = "") {
  if (!noticePhotoDialogEl) {
    noticePhotoDialogEl = document.createElement("dialog");
    noticePhotoDialogEl.className = "notice-photo-dialog";
    document.body.appendChild(noticePhotoDialogEl);

    noticePhotoDialogEl.addEventListener("click", (event) => {
      if (event.target === noticePhotoDialogEl) {
        noticePhotoDialogEl.close();
      }
    });
  }

  noticePhotoDialogEl.innerHTML = `
    <div class="notice-photo-dialog-card">
      <div class="notice-photo-dialog-head">
        <strong>${escapeHtml(title || "공지 사진")}</strong>
        <button type="button" data-close-notice-photo aria-label="사진 닫기">×</button>
      </div>
      <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(title || "공지 사진")}">
      ${originalUrl ? `<a href="${escapeHtml(originalUrl)}" target="_blank" rel="noopener">원본 열기</a>` : ""}
    </div>
  `;

  noticePhotoDialogEl.querySelector("[data-close-notice-photo]")?.addEventListener("click", () => {
    noticePhotoDialogEl.close();
  });

  noticePhotoDialogEl.showModal();
}

function bindPhotoDialogTriggers(root = document) {
  root.querySelectorAll("[data-notice-photo]").forEach((button) => {
    if (button.dataset.photoDialogBound === "true") return;
    button.dataset.photoDialogBound = "true";
    button.addEventListener("click", () => {
      openNoticePhotoDialog(
        button.dataset.noticePhoto,
        button.dataset.noticePhotoTitle,
        button.dataset.noticePhotoOriginal
      );
    });
  });
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

function assignmentTask(assignment) {
  return assignment.task || assignment.role || "";
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
    todayLabel: `표시일: ${selectedDay.date || selectedDay.label} ${selectedDay.day || selectedDay.label}`,
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
        people: nextBlock ? nextBlock.assignments.map((assignment) => formatAssignment(assignment.name, assignmentTask(assignment))) : []
      },
      {
        label: "마감 근무",
        value: closeBlock ? closeBlock.time : "등록된 시간 없음",
        people: closeBlock ? closeBlock.assignments.map((assignment) => formatAssignment(assignment.name, assignmentTask(assignment))) : []
      }
    ],
    timeBlocks: activeBlocks.map((block) => {
      const regular = block.assignments
        .filter((assignment) => !assignment.isParttimer)
        .map((assignment) => formatAssignment(assignment.name, assignmentTask(assignment)));
      const parttimers = block.assignments
        .filter((assignment) => assignment.isParttimer)
        .map((assignment) => formatAssignment(assignment.name, assignmentTask(assignment)));
      const roles = [...new Set(block.assignments.map(assignmentTask).filter(Boolean))];

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
        day: day.day || day.label,
        date: day.date || day.label,
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

function buildScheduleFromParsedDays(days, sourceLabel = "Google Sheet") {
  if (!Array.isArray(days) || !days.length) return null;

  const sortedDays = [...days].sort((a, b) => (a.key || "").localeCompare(b.key || ""));
  const schedule = buildScheduleView(sortedDays, selectedScheduleDateKey);
  schedule.days = sortedDays;
  schedule.weekLabel = `${sourceLabel} 기준`;
  schedule.sourceLabel = "Google Sheet 색상 기준";
  schedule.updatedAt = new Date().toISOString().slice(0, 10);
  schedule.changes = [];
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
  const checks = todayNoticeConfig?.checks?.length
    ? todayNoticeConfig.checks
    : TODAY_CHECKS.map((text) => ({ text }));
  const groups = todayNoticeConfig?.groups?.length
    ? todayNoticeConfig.groups
    : NOTICE_GROUPS;
  const visibleCheckLimit = 4;
  const visibleChecks = isNoticeExpanded ? checks : checks.slice(0, visibleCheckLimit);
  const hiddenCheckCount = Math.max(0, checks.length - visibleCheckLimit);

  todayChecksEl.innerHTML = visibleChecks.map((item) => `
    <label>
      <input type="checkbox">
      <span>${escapeHtml(item.text || item)}</span>
    </label>
  `).join("");

  noticeGroupsEl.hidden = !isNoticeExpanded;
  noticeGroupsEl.innerHTML = isNoticeExpanded ? groups.map((group) => {
    const imageUrl = shouldShowNoticeImage(group) ? toDisplayImageUrl(group.imageUrl) : "";
    const title = escapeHtml(group.title || group.label || "공지");
    const label = escapeHtml(group.label || (group.important ? "중요" : "공지"));
    const items = Array.isArray(group.items) ? group.items : [group.text || group.content || ""].filter(Boolean);

    return `
    <section class="notice-card ${imageUrl ? "notice-photo-card" : ""}">
      <div class="notice-card-head">
        <span>${label}</span>
        <h3>${title}</h3>
      </div>
      ${imageUrl ? `
        <button class="notice-photo-link" type="button" data-notice-photo="${escapeHtml(imageUrl)}" data-notice-photo-original="${escapeHtml(group.imageUrl)}" data-notice-photo-title="${title}">
          <img src="${escapeHtml(imageUrl)}" alt="${title}">
          <span>사진 크게 보기</span>
        </button>
      ` : ""}
      ${items.length ? `
        <ul>
          ${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
        </ul>
      ` : ""}
    </section>
  `;
  }).join("") : "";

  if (noticeExpandToggleEl) {
    const hasExtra = hiddenCheckCount > 0 || groups.length > 0;
    noticeExpandToggleEl.hidden = !hasExtra;
    noticeExpandToggleEl.setAttribute("aria-expanded", String(isNoticeExpanded));
    noticeExpandToggleEl.textContent = isNoticeExpanded
      ? "접기"
      : `나머지 ${hiddenCheckCount + groups.length}개 보기`;
  }

  bindPhotoDialogTriggers(noticeGroupsEl);
}

function dailyCheckStorageKey(type = activeDailyCheckType) {
  return `rootsquare-daily-check:${formatLocalDate(new Date())}:${type}`;
}

function inventoryStorageKey() {
  return `rootsquare-inventory-check:${formatLocalDate(new Date())}`;
}

function setDailyCheckStatus(message, tone = "") {
  if (!dailyCheckStatusEl) return;
  dailyCheckStatusEl.textContent = message;
  dailyCheckStatusEl.dataset.tone = tone;
}

function readDailyCheckState(type = activeDailyCheckType) {
  try {
    return JSON.parse(localStorage.getItem(dailyCheckStorageKey(type)) || "{}");
  } catch {
    return {};
  }
}

function writeDailyCheckState(type = activeDailyCheckType) {
  if (!dailyCheckItemsEl) return;

  const checked = [...dailyCheckItemsEl.querySelectorAll("input[type='checkbox']")]
    .filter((input) => input.checked)
    .map((input) => Number(input.value));
  const state = {
    staffName: dailyCheckNameEl?.value.trim() || "",
    note: dailyCheckNoteEl?.value.trim() || "",
    checked,
    savedAt: new Date().toISOString()
  };
  localStorage.setItem(dailyCheckStorageKey(type), JSON.stringify(state));
}

function setInventoryCheckStatus(message, tone = "") {
  if (!inventoryCheckStatusEl) return;
  inventoryCheckStatusEl.textContent = message;
  inventoryCheckStatusEl.dataset.tone = tone;
}

function readInventoryState() {
  try {
    return JSON.parse(localStorage.getItem(inventoryStorageKey()) || "{}");
  } catch {
    return {};
  }
}

function parseInventoryQuantity(value) {
  const text = String(value ?? "").trim();
  if (!text) return NaN;

  const fractionMatch = text.match(/^(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/);
  if (fractionMatch) {
    const numerator = Number(fractionMatch[1]);
    const denominator = Number(fractionMatch[2]);
    return denominator ? numerator / denominator : NaN;
  }

  const numberMatch = text.match(/\d+(?:\.\d+)?/);
  return numberMatch ? Number(numberMatch[0]) : NaN;
}

function getInventoryStatus(item, value) {
  if (value === "" || value === null || value === undefined) return { key: "empty", label: "미입력" };
  const quantity = parseInventoryQuantity(value);
  if (!Number.isFinite(quantity)) return { key: "empty", label: "미입력" };
  if (Number.isFinite(item.min) && quantity < item.min) return { key: "low", label: "부족" };
  if (Number.isFinite(item.weekendMin) && quantity < item.weekendMin) return { key: "watch", label: "주의" };
  return { key: "ok", label: "충분" };
}

function collectInventoryEntries() {
  if (!inventoryCheckItemsEl) return [];

  return [...inventoryCheckItemsEl.querySelectorAll("[data-inventory-index]")].map((row) => {
    const index = Number(row.dataset.inventoryIndex);
    const item = inventoryItems[index];
    const input = row.querySelector("[data-inventory-quantity]");
    const memo = row.querySelector("[data-inventory-memo]");
    const rawQuantity = input?.value ?? "";
    const status = getInventoryStatus(item, rawQuantity);
    return {
      name: item.name,
      category: item.category || "",
      unit: item.unit || "",
      min: item.min ?? "",
      weekendMin: item.weekendMin ?? "",
      quantity: rawQuantity.trim(),
      status: status.key,
      statusLabel: status.label,
      memo: memo?.value.trim() || ""
    };
  });
}

function writeInventoryState() {
  if (!inventoryCheckItemsEl) return;

  const entries = collectInventoryEntries();
  const state = {
    staffName: inventoryCheckNameEl?.value.trim() || "",
    note: inventoryCheckNoteEl?.value.trim() || "",
    values: entries.reduce((map, entry) => {
      map[entry.name] = {
        quantity: entry.quantity,
        memo: entry.memo
      };
      return map;
    }, {}),
    savedAt: new Date().toISOString()
  };
  localStorage.setItem(inventoryStorageKey(), JSON.stringify(state));
}

function updateInventoryBadges() {
  if (!inventoryCheckItemsEl) return;

  let lowCount = 0;
  let watchCount = 0;
  let missingCount = 0;
  inventoryCheckItemsEl.querySelectorAll("[data-inventory-index]").forEach((row) => {
    const index = Number(row.dataset.inventoryIndex);
    const item = inventoryItems[index];
    const input = row.querySelector("[data-inventory-quantity]");
    const badge = row.querySelector("[data-inventory-status]");
    const status = getInventoryStatus(item, input?.value ?? "");
    row.dataset.status = status.key;
    if (badge) badge.textContent = status.label;
    if (status.key === "low") lowCount += 1;
    if (status.key === "watch") watchCount += 1;
    if (status.key === "empty") missingCount += 1;
  });

  if (lowCount > 0 || missingCount > 0) {
    setInventoryCheckStatus(`부족 ${lowCount}개, 미입력 ${missingCount}개, 주의 ${watchCount}개 품목이 있습니다. 제출하면 관리자 이메일에 표시됩니다.`, "error");
  } else if (watchCount > 0) {
    setInventoryCheckStatus(`주의 ${watchCount}개 품목이 있습니다. 주말 전 보충 여부를 확인해주세요.`, "warning");
  } else {
    setInventoryCheckStatus("기준 이하 품목은 제출 시 관리자 이메일에 표시됩니다.", "");
  }
}

function renderInventoryChecklist() {
  if (!inventoryCheckItemsEl) return;

  const state = readInventoryState();
  const submitButton = inventoryCheckFormEl?.querySelector("button[type='submit']");
  const isConnected = Boolean((window.CHECKLIST_SUBMIT_URL || "").trim());

  if (submitButton) {
    submitButton.disabled = !isConnected;
    submitButton.textContent = isConnected ? "재고 제출" : "연결 대기";
  }

  if (inventoryCheckNameEl) inventoryCheckNameEl.value = state.staffName || "";
  if (inventoryCheckNoteEl) inventoryCheckNoteEl.value = state.note || "";

  inventoryCheckItemsEl.innerHTML = inventoryItems.map((item, index) => {
    const saved = state.values?.[item.name] || {};
    const quantity = saved.quantity ?? "";
    const memo = saved.memo || "";
    const status = getInventoryStatus(item, quantity);
    return `
      <article class="inventory-item" data-inventory-index="${index}" data-status="${status.key}">
        <div class="inventory-item-head">
          <div>
            <strong>${escapeHtml(item.name)}</strong>
            <span>${escapeHtml(item.category || "재고")} · 기준 ${escapeHtml(item.min)}${escapeHtml(item.unit)} / 주말 ${escapeHtml(item.weekendMin)}${escapeHtml(item.unit)}</span>
          </div>
          <em data-inventory-status>${status.label}</em>
        </div>
        <label>
          <span>현재 재고</span>
          <input data-inventory-quantity type="text" inputmode="decimal" value="${escapeHtml(quantity)}" placeholder="0 또는 1/2">
          <small>${escapeHtml(item.unit || "단위")}</small>
        </label>
        <input data-inventory-memo type="text" value="${escapeHtml(memo)}" placeholder="${escapeHtml(item.note || "메모 선택 입력")}">
      </article>
    `;
  }).join("");

  const submittedAt = state.submittedAt
    ? new Date(state.submittedAt).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })
    : "";
  if (submittedAt && isConnected) {
    setInventoryCheckStatus(`오늘 재고 체크를 ${submittedAt}에 제출했습니다.`, "success");
  } else {
    updateInventoryBadges();
  }

  renderInventoryCollapseState();
}

function renderInventoryCollapseState() {
  if (!inventoryCheckFormEl || !inventoryCollapseToggleEl) return;

  inventoryCheckFormEl.hidden = !isInventoryExpanded;
  inventoryCollapseToggleEl.setAttribute("aria-expanded", String(isInventoryExpanded));
  inventoryCollapseToggleEl.textContent = isInventoryExpanded ? "재고 체크 접기" : "재고 체크 열기";
}

function renderDailyChecklist() {
  if (!dailyCheckItemsEl) return;

  const checklist = DAILY_CHECKLISTS[activeDailyCheckType];
  const state = readDailyCheckState(activeDailyCheckType);
  const submitButton = dailyCheckFormEl?.querySelector("button[type='submit']");
  const isConnected = Boolean((window.CHECKLIST_SUBMIT_URL || "").trim());

  dailyCheckTypeButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.dailyCheckType === activeDailyCheckType);
  });

  if (submitButton) {
    submitButton.disabled = !isConnected;
    submitButton.textContent = isConnected ? "제출하기" : "연결 대기";
  }

  if (dailyCheckNameEl) dailyCheckNameEl.value = state.staffName || "";
  if (dailyCheckNoteEl) dailyCheckNoteEl.value = state.note || "";

  dailyCheckItemsEl.innerHTML = checklist.items.map((item, index) => `
    <label class="${item.important ? "is-important" : ""}">
      <input type="checkbox" value="${index}" ${state.checked?.includes(index) ? "checked" : ""}>
      <span>
        ${item.important ? "<em>주의</em>" : ""}
        ${item.group ? `<b>${item.group}</b>` : ""}
        ${item.text}
      </span>
    </label>
  `).join("");

  const submittedAt = state.submittedAt
    ? new Date(state.submittedAt).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })
    : "";
  setDailyCheckStatus(
    !isConnected
      ? "Google Apps Script 웹앱 URL을 연결하면 제출과 이메일 발송이 활성화됩니다."
      : submittedAt
      ? `오늘 ${checklist.label} 체크를 ${submittedAt}에 제출했습니다.`
      : "체크 후 제출하면 Google Sheet 기록과 관리자 이메일이 함께 남습니다.",
    submittedAt && isConnected ? "success" : ""
  );
}

function loadJsonp(url) {
  return new Promise((resolve, reject) => {
    const callbackName = `rootsquareChecklistCallback_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const script = document.createElement("script");
    const separator = url.includes("?") ? "&" : "?";
    const timeoutId = window.setTimeout(() => {
      delete window[callbackName];
      script.remove();
      reject(new Error("체크리스트 관리 데이터 응답 시간이 초과되었습니다."));
    }, 5000);

    window[callbackName] = (data) => {
      window.clearTimeout(timeoutId);
      delete window[callbackName];
      script.remove();
      resolve(data);
    };

    script.onerror = () => {
      window.clearTimeout(timeoutId);
      delete window[callbackName];
      script.remove();
      reject(new Error("체크리스트 관리 데이터를 불러오지 못했습니다."));
    };

    script.src = `${url}${separator}action=config&callback=${encodeURIComponent(callbackName)}&v=${Date.now()}`;
    document.head.appendChild(script);
  });
}

function applyChecklistConfig(config) {
  let changed = false;

  if (config?.checklists) {
    ["open", "close"].forEach((type) => {
      const items = config.checklists[type];
      if (!Array.isArray(items) || !items.length) return;
      DAILY_CHECKLISTS[type].items = items
        .filter((item) => item?.text)
        .map((item) => ({
          group: item.group || "",
          text: item.text,
          important: Boolean(item.important)
        }));
      changed = true;
    });
  }

  if (config?.notices) {
    todayNoticeConfig = config.notices;
    changed = true;
  }

  if (Array.isArray(config?.inventory) && config.inventory.length) {
    inventoryItems = config.inventory
      .filter((item) => item?.name)
      .map((item) => ({
        name: item.name,
        category: item.category || "재고",
        unit: item.unit || "개",
        min: Number(item.min),
        weekendMin: Number(item.weekendMin),
        note: item.note || ""
      }));
    changed = true;
  }

  if (Array.isArray(config?.stayHistory)) {
    syncStayHistoryManuals(config.stayHistory);
    changed = true;
  }

  return changed;
}

async function loadDailyChecklistConfig() {
  const submitUrl = (window.CHECKLIST_SUBMIT_URL || "").trim();
  if (!submitUrl) return;

  try {
    const config = await loadJsonp(submitUrl);
    if (config?.ok && applyChecklistConfig(config)) {
      renderNotices();
      renderDailyChecklist();
      renderInventoryChecklist();
      renderCounts();
      renderArticles();
      renderDetail();
    }
  } catch (error) {
    console.warn("체크리스트 관리 데이터를 불러오지 못했습니다.", error);
  }
}

async function submitDailyChecklist(event) {
  event.preventDefault();

  const submitUrl = (window.CHECKLIST_SUBMIT_URL || "").trim();
  const checklist = DAILY_CHECKLISTS[activeDailyCheckType];
  const staffName = dailyCheckNameEl.value.trim();
  const note = dailyCheckNoteEl.value.trim();
  const checkedIndexes = [...dailyCheckItemsEl.querySelectorAll("input[type='checkbox']")]
    .filter((input) => input.checked)
    .map((input) => Number(input.value));
  const checkedItems = checklist.items
    .filter((_, index) => checkedIndexes.includes(index))
    .map((item) => item.text);
  const uncheckedItems = checklist.items
    .filter((_, index) => !checkedIndexes.includes(index))
    .map((item) => item.text);

  if (!staffName) {
    dailyCheckNameEl.focus();
    setDailyCheckStatus("담당자 이름을 입력해주세요.", "error");
    return;
  }

  if (!submitUrl) {
    setDailyCheckStatus("Google Apps Script 웹앱 URL 연결 후 제출할 수 있습니다.", "error");
    return;
  }

  const payload = {
    submittedAt: new Date().toISOString(),
    localDate: formatLocalDate(new Date()),
    type: activeDailyCheckType,
    typeLabel: checklist.label,
    staffName,
    checkedItems,
    uncheckedItems,
    note,
    page: location.href
  };

  setDailyCheckStatus("제출 중입니다...", "");

  try {
    await fetch(submitUrl, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(payload)
    });

    writeDailyCheckState(activeDailyCheckType);
    const state = readDailyCheckState(activeDailyCheckType);
    state.submittedAt = payload.submittedAt;
    localStorage.setItem(dailyCheckStorageKey(activeDailyCheckType), JSON.stringify(state));
    setDailyCheckStatus("제출했습니다. Google Sheet 기록과 관리자 이메일 발송 요청이 전송되었습니다.", "success");
  } catch (error) {
    console.warn("데일리 체크 제출 실패", error);
    setDailyCheckStatus("제출에 실패했습니다. 네트워크 상태를 확인한 뒤 다시 시도해주세요.", "error");
  }
}

async function submitInventoryChecklist(event) {
  event.preventDefault();

  const submitUrl = (window.CHECKLIST_SUBMIT_URL || "").trim();
  const staffName = inventoryCheckNameEl.value.trim();
  const note = inventoryCheckNoteEl.value.trim();
  const entries = collectInventoryEntries();
  const lowItems = entries.filter((entry) => entry.status === "low");
  const watchItems = entries.filter((entry) => entry.status === "watch");
  const missingItems = entries.filter((entry) => entry.status === "empty");
  const normalItems = entries.filter((entry) => entry.status === "ok");

  if (!staffName) {
    inventoryCheckNameEl.focus();
    setInventoryCheckStatus("담당자 이름을 입력해주세요.", "error");
    return;
  }

  if (!submitUrl) {
    setInventoryCheckStatus("Google Apps Script 웹앱 URL 연결 후 제출할 수 있습니다.", "error");
    return;
  }

  const formatEntry = (entry) => {
    const quantity = entry.quantity === "" ? "미입력" : `${entry.quantity}${entry.unit}`;
    const memo = entry.memo ? ` / ${entry.memo}` : "";
    return `${entry.name}: ${quantity} (${entry.statusLabel}, 기준 ${entry.min}${entry.unit}, 주말 ${entry.weekendMin}${entry.unit})${memo}`;
  };

  const payload = {
    kind: "inventory",
    submittedAt: new Date().toISOString(),
    localDate: formatLocalDate(new Date()),
    type: "inventory",
    typeLabel: "마감 재고 체크",
    staffName,
    inventoryItems: entries,
    lowItems,
    watchItems,
    missingItems,
    normalItems,
    checkedItems: [...normalItems, ...watchItems].map(formatEntry),
    uncheckedItems: [...lowItems, ...missingItems].map(formatEntry),
    note,
    page: location.href
  };

  setInventoryCheckStatus("재고 체크를 제출 중입니다...", "");

  try {
    await fetch(submitUrl, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(payload)
    });

    writeInventoryState();
    const state = readInventoryState();
    state.submittedAt = payload.submittedAt;
    localStorage.setItem(inventoryStorageKey(), JSON.stringify(state));
    setInventoryCheckStatus(
      lowItems.length
        ? `제출했습니다. 부족 ${lowItems.length}개 품목이 관리자 이메일에 표시됩니다.`
        : "제출했습니다. 재고 기록과 관리자 이메일 발송 요청이 전송되었습니다.",
      lowItems.length ? "error" : "success"
    );
  } catch (error) {
    console.warn("재고 체크 제출 실패", error);
    setInventoryCheckStatus("제출에 실패했습니다. 네트워크 상태를 확인한 뒤 다시 시도해주세요.", "error");
  }
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

    ${Array.isArray(manual.photos) && manual.photos.length ? `
      <section class="manual-section">
        <h3>사진 자료</h3>
        <div class="manual-photo-grid">
          ${manual.photos.map((photo) => {
            const imageUrl = toDisplayImageUrl(photo.src);
            const title = escapeHtml(photo.title || "사진 자료");
            const caption = photo.caption ? `<span>${escapeHtml(photo.caption)}</span>` : "";
            return `
              <button class="manual-photo-card" type="button" data-notice-photo="${escapeHtml(imageUrl)}" data-notice-photo-original="${escapeHtml(photo.src)}" data-notice-photo-title="${title}">
                <img src="${escapeHtml(imageUrl)}" alt="${title}">
                <strong>${title}</strong>
                ${caption}
              </button>
            `;
          }).join("")}
        </div>
      </section>
    ` : ""}

    ${Array.isArray(manual.links) && manual.links.length ? `
      <section class="manual-section">
        <h3>관련 링크</h3>
        <div class="manual-links">
          ${manual.links.map((link) => `
            <a href="${escapeHtml(link.url)}" target="_blank" rel="noopener">${escapeHtml(link.label || "링크 열기")}</a>
          `).join("")}
        </div>
      </section>
    ` : ""}

    <section class="manual-section">
      <h3>메모</h3>
      <p class="note">${manual.note}</p>
    </section>
  `;

  bindPhotoDialogTriggers(detailEl);
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

dailyCheckTypeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    writeDailyCheckState(activeDailyCheckType);
    activeDailyCheckType = button.dataset.dailyCheckType;
    renderDailyChecklist();
  });
});

noticeExpandToggleEl?.addEventListener("click", () => {
  isNoticeExpanded = !isNoticeExpanded;
  renderNotices();
});

inventoryCollapseToggleEl?.addEventListener("click", () => {
  isInventoryExpanded = !isInventoryExpanded;
  renderInventoryCollapseState();
});

dailyCheckItemsEl?.addEventListener("change", () => writeDailyCheckState());
dailyCheckNameEl?.addEventListener("input", () => writeDailyCheckState());
dailyCheckNoteEl?.addEventListener("input", () => writeDailyCheckState());
dailyCheckFormEl?.addEventListener("submit", submitDailyChecklist);
inventoryCheckItemsEl?.addEventListener("input", () => {
  updateInventoryBadges();
  writeInventoryState();
});
inventoryCheckNameEl?.addEventListener("input", () => writeInventoryState());
inventoryCheckNoteEl?.addEventListener("input", () => writeInventoryState());
inventoryCheckFormEl?.addEventListener("submit", submitInventoryChecklist);

renderCounts();
renderNotices();
renderDailyChecklist();
renderInventoryChecklist();
renderArticles();
renderDetail();

if (dailyManageLinkEl && window.CHECKLIST_MANAGE_URL) {
  dailyManageLinkEl.href = window.CHECKLIST_MANAGE_URL;
}

if (noticeManageLinkEl && window.TODAY_NOTICE_MANAGE_URL) {
  noticeManageLinkEl.href = window.TODAY_NOTICE_MANAGE_URL;
}

if (inventoryManageLinkEl && window.INVENTORY_MANAGE_URL) {
  inventoryManageLinkEl.href = window.INVENTORY_MANAGE_URL;
}

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
  const scheduleManual = MANUALS.find((manual) => manual.type === "schedule");
  const parsedSchedule = buildScheduleFromParsedDays(config.parsedDays, config.parsedLabel);

  if (parsedSchedule && scheduleManual) {
    scheduleManual.title = "근무 시간표";
    scheduleManual.summary = "Google Sheet에 등록된 근무 시간표를 기준으로 오늘 근무자와 이번 주 시간표를 확인합니다.";
    scheduleManual.updated = parsedSchedule.updatedAt;
    scheduleManual.tags = ["근무표", "오늘근무", "파트타이머", "정규직", "Google Sheet"];
    scheduleManual.note = "Google Sheet에서 불러온 근무표입니다. 수정은 담당자용 시트에서 진행합니다.";
    scheduleManual.schedule = parsedSchedule;
    selectedScheduleDateKey ||= parsedSchedule.selectedDateKey;

    renderCounts();
    renderArticles();
    renderDetail();
    renderScheduleBadge();
    return;
  }

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
loadDailyChecklistConfig();
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
