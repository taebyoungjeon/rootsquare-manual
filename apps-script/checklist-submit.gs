const ADMIN_EMAILS = [
  "hslee@mannacea.com",
  "ceo@mannacea.com"
];
const SHEET_NAME = "체크리스트 제출 기록";
const CONFIG_SHEET_NAME = "체크리스트 항목 관리";
const CONFIG_SHEET_ID = 1897809790;
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

function doGet(e) {
  const action = e && e.parameter ? e.parameter.action : "";
  const callback = e && e.parameter ? e.parameter.callback : "";

  if (action === "config") {
    const data = {
      ok: true,
      checklists: getChecklistConfig()
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
  let sheet = spreadsheet.getSheets().find((item) => item.getSheetId() === CONFIG_SHEET_ID)
    || spreadsheet.getSheetByName(CONFIG_SHEET_NAME);
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

  rows.forEach((row) => {
    const typeText = getConfigCell(row, headerMap, ["구분", "타입", "종류"], 0);
    const group = getConfigCell(row, headerMap, ["분류", "구역", "상황"], "");
    const order = Number(getConfigCell(row, headerMap, ["순서", "번호"], 1)) || 999;
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

function findConfigHeaderRowIndex(values) {
  const headerIndex = values.findIndex((row) => {
    const keys = row.map((cell) => String(cell || "").trim().replace(/\s+/g, ""));
    return keys.includes("구분") && keys.some((key) => ["항목", "체크항목", "내용"].includes(key));
  });
  return headerIndex >= 0 ? headerIndex : 0;
}

function getConfigCell(row, headerMap, names, fallbackIndex) {
  const matchedName = names.find((name) => headerMap[name] !== undefined);
  const index = matchedName ? headerMap[matchedName] : fallbackIndex;
  return String(row[index] || "").trim();
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
