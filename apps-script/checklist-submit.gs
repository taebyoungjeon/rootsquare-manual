const ADMIN_EMAILS = [
  "hslee@mannacea.com",
  "ceo@mannacea.com"
];
const SHEET_NAME = "체크리스트 제출 기록";
const CONFIG_SHEET_NAME = "체크리스트 항목 관리";
const TODAY_NOTICE_SHEET_NAME = "오늘의 필수확인 관리";
const TIMEZONE = "Asia/Seoul";

const DEFAULT_CHECKLIST_ITEMS = [
  ["오픈", "출입문", 1, "북카페 옆문을 열었습니다.", "Y", "Y"],
  ["오픈", "출입문", 2, "작주온 문을 열었습니다.", "Y", "Y"],
  ["오픈", "냉난방", 3, "북카페 에어컨 번호를 확인했습니다.", "Y", "Y"],
  ["오픈", "음악", 4, "야외 음악은 11시 이후 재생 기준을 확인했습니다.", "Y", "Y"],
  ["오픈", "공간", 5, "스템가든/북카페 홀과 야외 테이블 상태를 확인했습니다.", "", "Y"],
  ["오픈", "안내근무", 6, "주말 손님이 적을 때 인포메이션 또는 스마트팜 앞 안내 근무 기준을 확인했습니다.", "", "Y"],
  ["마감", "출입문", 1, "스템가든 회전문 잠금 상태를 확인했습니다.", "Y", "Y"],
  ["마감", "출입문", 2, "북카페/외부 출입문 잠금 상태를 확인했습니다.", "Y", "Y"],
  ["마감", "전원", 3, "야외 음악, 조명, 냉난방 종료 상태를 확인했습니다.", "Y", "Y"],
  ["마감", "재고", 4, "우유 냉장고와 베이스 잔량을 확인했습니다.", "", "Y"],
  ["마감", "준비", 5, "다음 날 소모품과 오픈 준비 상태를 확인했습니다.", "", "Y"],
  ["마감", "인수인계", 6, "특이사항이 있으면 메모 또는 직원에게 공유했습니다.", "", "Y"]
];

const DEFAULT_TODAY_NOTICE_ITEMS = [
  ["체크", "필수", 1, "고객 응대", "고객이 매장에 있을 때 사적 잡담을 줄입니다.", "Y", "Y", ""],
  ["체크", "필수", 2, "휴대폰 사용", "제조 공간에서는 업무 외 휴대폰 사용을 자제합니다.", "Y", "Y", ""],
  ["체크", "위생", 3, "데코 재료", "데코 재료는 맨손 사용을 피하고 장갑 또는 집게를 사용합니다.", "Y", "Y", ""],
  ["체크", "제조", 4, "제조 순서", "스무디와 따뜻한 음료가 함께 들어오면 스무디를 먼저 진행합니다.", "Y", "Y", ""],
  ["체크", "재고", 5, "베이스 공유", "베이스통이 거의 비었거나 모두 사용된 경우 직원에게 공유합니다.", "", "Y", ""],
  ["카드", "필독", 6, "근무 중 기본 태도", "할 일이 없을 때는 주변 정리와 청소를 계속 신경씁니다.\n매장 전화는 놓치지 않도록 확인합니다.", "Y", "Y", ""],
  ["사진공지", "오픈", 7, "북카페 에어컨 번호 확인", "사진이 필요한 공지는 사진URL 칸에 Google Drive 링크를 넣으면 표시됩니다.", "", "N", ""]
];

function doGet(e) {
  const action = e && e.parameter ? e.parameter.action : "";
  const callback = e && e.parameter ? e.parameter.callback : "";

  if (action === "config") {
    const data = {
      ok: true,
      checklists: getChecklistConfig(),
      notices: getTodayNoticeConfig()
    };
    return callback ? jsonpResponse(callback, data) : jsonResponse(data);
  }

  return jsonResponse({
    ok: true,
    message: "Rootsquare checklist endpoint is ready."
  });
}

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents || "{}");
    const submittedAt = payload.submittedAt ? new Date(payload.submittedAt) : new Date();
    const dateText = Utilities.formatDate(submittedAt, TIMEZONE, "yyyy-MM-dd");
    const timeText = Utilities.formatDate(submittedAt, TIMEZONE, "HH:mm:ss");
    const typeLabel = payload.typeLabel || payload.type || "";
    const staffName = payload.staffName || "";
    const checkedItems = Array.isArray(payload.checkedItems) ? payload.checkedItems : [];
    const uncheckedItems = Array.isArray(payload.uncheckedItems) ? payload.uncheckedItems : [];
    const note = payload.note || "";

    if (!staffName) {
      return jsonResponse({ ok: false, error: "담당자 이름이 없습니다." });
    }

    const sheet = getOrCreateSheet();
    sheet.appendRow([
      dateText,
      timeText,
      typeLabel,
      staffName,
      checkedItems.join("\n"),
      uncheckedItems.join("\n"),
      note,
      payload.page || ""
    ]);

    sendChecklistEmail({
      dateText,
      timeText,
      typeLabel,
      staffName,
      checkedItems,
      uncheckedItems,
      note
    });

    return jsonResponse({ ok: true });
  } catch (error) {
    return jsonResponse({
      ok: false,
      error: error && error.message ? error.message : String(error)
    });
  }
}

function getOrCreateSheet() {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = spreadsheet.insertSheet(SHEET_NAME);
    }

    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "날짜",
        "시간",
        "구분",
        "담당자",
        "체크 완료",
        "미체크",
        "특이사항",
        "제출 페이지"
      ]);
      sheet.setFrozenRows(1);
    }

    return sheet;
  } finally {
    lock.releaseLock();
  }
}

function getOrCreateConfigSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(CONFIG_SHEET_NAME)
    || findSheetWithChecklistHeaders(spreadsheet);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(CONFIG_SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["구분", "분류", "순서", "항목", "중요", "사용"]);
    sheet.getRange(2, 1, DEFAULT_CHECKLIST_ITEMS.length, DEFAULT_CHECKLIST_ITEMS[0].length)
      .setValues(DEFAULT_CHECKLIST_ITEMS);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function getOrCreateTodayNoticeSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(TODAY_NOTICE_SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(TODAY_NOTICE_SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["구분", "분류", "순서", "제목", "내용", "중요", "사용", "사진URL"]);
    sheet.getRange(2, 1, DEFAULT_TODAY_NOTICE_ITEMS.length, DEFAULT_TODAY_NOTICE_ITEMS[0].length)
      .setValues(DEFAULT_TODAY_NOTICE_ITEMS);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function findSheetWithChecklistHeaders(spreadsheet) {
  return spreadsheet.getSheets().find((sheet) => {
    const values = sheet.getDataRange().getValues();
    return findConfigHeaderRowIndex(values) >= 0;
  });
}

function getChecklistConfig() {
  const sheet = getOrCreateConfigSheet();
  const values = sheet.getDataRange().getValues();
  const headerRowIndex = findConfigHeaderRowIndex(values);
  const headers = values[headerRowIndex] || [];
  const rows = values.slice(headerRowIndex + 1);
  const headerMap = headers.reduce((map, header, index) => {
    const key = String(header || "").trim().replace(/\s+/g, "");
    if (key) map[key] = index;
    return map;
  }, {});
  const checklists = {
    open: [],
    close: []
  };

  rows.forEach((row, rowIndex) => {
    const typeText = getConfigCell(row, headerMap, ["구분", "타입", "종류"], 0);
    const group = getConfigCell(row, headerMap, ["분류", "구역", "상황"], "");
    const order = parseOrder(getConfigCell(row, headerMap, ["순서", "번호"], 1), rowIndex);
    const text = getConfigCell(row, headerMap, ["항목", "체크항목", "내용"], 2);
    const important = toBoolean(getConfigCell(row, headerMap, ["중요", "주의", "필수"], 3));
    const activeValue = getConfigCell(row, headerMap, ["사용", "노출", "활성"], 4);
    const active = activeValue === "" ? true : toBoolean(activeValue);
    const type = typeText === "오픈" || typeText.toLowerCase() === "open"
      ? "open"
      : typeText === "마감" || typeText.toLowerCase() === "close"
        ? "close"
        : "";

    if (!type || !text || !active) return;
    checklists[type].push({ order, group, text, important });
  });

  Object.keys(checklists).forEach((type) => {
    checklists[type] = checklists[type]
      .sort((a, b) => a.order - b.order)
      .map(({ group, text, important }) => ({ group, text, important }));
  });

  return checklists;
}

function getTodayNoticeConfig() {
  const sheet = getOrCreateTodayNoticeSheet();
  const values = sheet.getDataRange().getValues();
  const headerRowIndex = findTodayNoticeHeaderRowIndex(values);
  const headers = values[headerRowIndex] || [];
  const rows = values.slice(headerRowIndex + 1);
  const headerMap = headers.reduce((map, header, index) => {
    const key = String(header || "").trim().replace(/\s+/g, "");
    if (key) map[key] = index;
    return map;
  }, {});
  const checks = [];
  const groups = [];

  rows.forEach((row, rowIndex) => {
    const typeText = getConfigCell(row, headerMap, ["구분", "타입", "종류"], 0);
    const label = getConfigCell(row, headerMap, ["분류", "라벨", "구역"], 1);
    const order = parseOrder(getConfigCell(row, headerMap, ["순서", "번호"], 2), rowIndex);
    const title = getConfigCell(row, headerMap, ["제목", "타이틀"], 3);
    const text = getConfigCell(row, headerMap, ["내용", "항목", "본문"], 4);
    const important = toBoolean(getConfigCell(row, headerMap, ["중요", "주의", "필수"], 5));
    const activeValue = getConfigCell(row, headerMap, ["사용", "노출", "활성"], 6);
    const imageUrl = getConfigCell(row, headerMap, ["사진URL", "이미지URL", "사진", "이미지"], 7);
    const active = activeValue === "" ? true : toBoolean(activeValue);
    const type = String(typeText || "").trim();

    if (!active || (!text && !title && !imageUrl)) return;

    if (type === "체크" || type.toLowerCase() === "check") {
      checks.push({
        order,
        label,
        title,
        text: text || title,
        important,
        imageUrl
      });
      return;
    }

    groups.push({
      order,
      label: label || (important ? "중요" : "공지"),
      title: title || label || "공지",
      items: text ? String(text).split(/\n+/).map((item) => item.trim()).filter(Boolean) : [],
      important,
      imageUrl
    });
  });

  return {
    checks: checks
      .sort((a, b) => a.order - b.order)
      .map(({ label, title, text, important, imageUrl }) => ({ label, title, text, important, imageUrl })),
    groups: groups
      .sort((a, b) => a.order - b.order)
      .map(({ label, title, items, important, imageUrl }) => ({ label, title, items, important, imageUrl }))
  };
}

function findConfigHeaderRowIndex(values) {
  const headerIndex = values.findIndex((row) => {
    const keys = row.map((cell) => String(cell || "").trim().replace(/\s+/g, ""));
    return keys.includes("구분") && keys.some((key) => ["항목", "체크항목"].includes(key));
  });
  return headerIndex;
}

function findTodayNoticeHeaderRowIndex(values) {
  const headerIndex = values.findIndex((row) => {
    const keys = row.map((cell) => String(cell || "").trim().replace(/\s+/g, ""));
    return keys.includes("구분") && keys.some((key) => ["내용", "항목", "제목"].includes(key));
  });
  return headerIndex >= 0 ? headerIndex : 0;
}

function getConfigCell(row, headerMap, names, fallbackIndex) {
  const matchedName = names.find((name) => headerMap[name] !== undefined);
  const index = matchedName ? headerMap[matchedName] : fallbackIndex;
  return String(row[index] || "").trim();
}

function parseOrder(value, rowIndex) {
  const order = Number(value);
  return Number.isFinite(order) && order > 0 ? order : 10000 + rowIndex;
}

function toBoolean(value) {
  const normalized = String(value || "").trim().toLowerCase();
  return ["y", "yes", "true", "1", "예", "사용", "중요", "주의"].includes(normalized);
}

function sendChecklistEmail(data) {
  if (!ADMIN_EMAILS.length || ADMIN_EMAILS[0] === "manager@example.com") return;

  const hasUnchecked = data.uncheckedItems.length > 0;
  const subjectPrefix = hasUnchecked ? "[주의]" : "[완료]";
  const subject = `${subjectPrefix} [뤁스퀘어] ${data.typeLabel} 체크리스트 제출 - ${data.staffName}`;
  const body = [
    `날짜: ${data.dateText}`,
    `시간: ${data.timeText}`,
    `구분: ${data.typeLabel}`,
    `담당자: ${data.staffName}`,
    "",
    "[체크 완료]",
    data.checkedItems.length ? data.checkedItems.map((item) => `- ${item}`).join("\n") : "- 없음",
    "",
    "[미체크]",
    data.uncheckedItems.length ? data.uncheckedItems.map((item) => `- ${item}`).join("\n") : "- 없음",
    "",
    "[특이사항]",
    data.note || "- 없음"
  ].join("\n");

  MailApp.sendEmail({
    to: ADMIN_EMAILS.join(","),
    subject,
    body
  });
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function jsonpResponse(callback, data) {
  const safeCallback = String(callback || "").replace(/[^\w.$]/g, "");
  return ContentService
    .createTextOutput(`${safeCallback}(${JSON.stringify(data)});`)
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}
