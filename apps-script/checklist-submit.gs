const ADMIN_EMAILS = [
  "hslee@mannacea.com",
  "ceo@mannacea.com"
];
const SHEET_NAME = "체크리스트 제출 기록";
const CONFIG_SHEET_NAME = "체크리스트 항목 관리";
const TODAY_NOTICE_SHEET_NAME = "오늘의 필수확인 관리";
const INVENTORY_LOG_SHEET_NAME = "재고 체크 기록";
const INVENTORY_CONFIG_SHEET_NAME = "재고 기준 관리";
const STAY_HISTORY_SHEET_NAME = "스테이 운영 히스토리";
const STAY_HISTORY_FILES_SHEET_NAME = "스테이 운영 파일 처리";
const STAY_HISTORY_FOLDER_ID = "1UmB77py6fV54HMioIIezNiCDx8A_vSBV";
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

const DEFAULT_INVENTORY_ITEMS = [
  ["유제품", 1, "아이스크림", "팩", 6, 15, "Y", "새 제품 재고수량 기준. 기계 안 수량은 제외"],
  ["베이스", 2, "눈꽃 베이스", "피처", 1, 3, "Y", ""],
  ["베이스", 3, "쌀크림 베이스", "피처", 1, 4, "Y", ""],
  ["베이스", 4, "딸기 베이스", "피처", 1, 4, "Y", ""],
  ["베이스", 5, "말차 베이스", "피처", 1, 1, "Y", ""],
  ["과일", 6, "토마토 과일", "컵", 15, 30, "Y", ""],
  ["과일", 7, "케일키위바나나 과일", "통", 4, 8, "Y", "케일 0통, 키위 0통, 바나나 0통"],
  ["베이스", 8, "복숭아 베이스 (농축액)", "통", 2, 4, "Y", ""],
  ["과일", 9, "복숭아 과일 (냉동)", "팩", 4, 6, "Y", ""],
  ["베이스", 10, "블루베리 베이스 (리플잼)", "팩", 2, 4, "Y", ""],
  ["파우더", 11, "요거트 파우더", "팩", 2, 4, "Y", ""],
  ["베이스", 12, "청포도 베이스", "피처", 1, 2, "Y", ""],
  ["베이스", 13, "초콜렛밀크 베이스", "피처", 1, 1, "Y", ""],
  ["베이스", 14, "감귤생강 베이스", "피처", 1, 2, "Y", ""],
  ["베이스", 15, "허니자몽 베이스", "피처", 1, 2, "Y", ""],
  ["베이스", 16, "애플레몬 베이스", "피처", 1, 2, "Y", ""],
  ["베이스", 17, "패션후르츠 베이스", "피처", 1, 2, "Y", ""]
];

function doGet(e) {
  const action = e && e.parameter ? e.parameter.action : "";
  const callback = e && e.parameter ? e.parameter.callback : "";

  if (action === "config") {
    const data = {
      ok: true,
      checklists: getChecklistConfig(),
      notices: getTodayNoticeConfig(),
      inventory: getInventoryConfig(),
      stayHistory: getStayHistoryConfig()
    };
    return callback ? jsonpResponse(callback, data) : jsonResponse(data);
  }

  if (action === "stayHistoryStatus") {
    return jsonResponse(getStayHistoryStatus());
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

    if (payload.kind === "inventory" || payload.type === "inventory") {
      saveInventorySubmission({
        dateText,
        timeText,
        typeLabel,
        staffName,
        inventoryItems: Array.isArray(payload.inventoryItems) ? payload.inventoryItems : [],
        lowItems: Array.isArray(payload.lowItems) ? payload.lowItems : [],
        watchItems: Array.isArray(payload.watchItems) ? payload.watchItems : [],
        missingItems: Array.isArray(payload.missingItems) ? payload.missingItems : [],
        note,
        page: payload.page || ""
      });
      return jsonResponse({ ok: true });
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

function getOrCreateInventoryConfigSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(INVENTORY_CONFIG_SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(INVENTORY_CONFIG_SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["분류", "순서", "품목", "단위", "최소보유량", "주말안전재고", "사용", "메모"]);
    sheet.getRange(2, 1, DEFAULT_INVENTORY_ITEMS.length, DEFAULT_INVENTORY_ITEMS[0].length)
      .setValues(DEFAULT_INVENTORY_ITEMS);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function getOrCreateInventoryLogSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(INVENTORY_LOG_SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(INVENTORY_LOG_SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "날짜",
      "시간",
      "담당자",
      "품목",
      "분류",
      "현재재고",
      "단위",
      "최소보유량",
      "주말안전재고",
      "상태",
      "품목메모",
      "전체메모",
      "제출 페이지"
    ]);
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

function getInventoryConfig() {
  const sheet = getOrCreateInventoryConfigSheet();
  const values = sheet.getDataRange().getValues();
  const headers = values[0] || [];
  const rows = values.slice(1);
  const headerMap = headers.reduce((map, header, index) => {
    const key = String(header || "").trim().replace(/\s+/g, "");
    if (key) map[key] = index;
    return map;
  }, {});
  const items = [];

  rows.forEach((row, rowIndex) => {
    const category = getConfigCell(row, headerMap, ["분류", "카테고리", "구분"], 0);
    const order = parseOrder(getConfigCell(row, headerMap, ["순서", "번호"], 1), rowIndex);
    const name = getConfigCell(row, headerMap, ["품목", "품목명", "이름"], 2);
    const unit = getConfigCell(row, headerMap, ["단위"], 3) || "개";
    const min = parseInventoryNumber(getConfigCell(row, headerMap, ["최소보유량", "최소", "기준"], 4));
    const weekendMin = parseInventoryNumber(getConfigCell(row, headerMap, ["주말안전재고", "주말", "안전재고"], 5));
    const activeValue = getConfigCell(row, headerMap, ["사용", "노출", "활성"], 6);
    const note = getConfigCell(row, headerMap, ["메모", "비고"], 7);
    const active = activeValue === "" ? true : toBoolean(activeValue);

    if (!active || !name) return;
    items.push({
      order,
      category,
      name,
      unit,
      min,
      weekendMin: Number.isFinite(weekendMin) ? weekendMin : min,
      note
    });
  });

  return items
    .sort((a, b) => a.order - b.order)
    .map(({ category, name, unit, min, weekendMin, note }) => ({ category, name, unit, min, weekendMin, note }));
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

function parseInventoryNumber(value) {
  const normalized = String(value || "").replace(/[^0-9.]/g, "");
  const number = Number(normalized);
  return Number.isFinite(number) ? number : 0;
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

function saveInventorySubmission(data) {
  const sheet = getOrCreateInventoryLogSheet();
  const rows = data.inventoryItems.length
    ? data.inventoryItems
    : [...data.lowItems, ...data.watchItems, ...data.missingItems];

  if (!rows.length) {
    sheet.appendRow([
      data.dateText,
      data.timeText,
      data.staffName,
      "입력 품목 없음",
      "",
      "",
      "",
      "",
      "",
      "미입력",
      "",
      data.note,
      data.page
    ]);
  } else {
    rows.forEach((item) => {
      sheet.appendRow([
        data.dateText,
        data.timeText,
        data.staffName,
        item.name || "",
        item.category || "",
        item.quantity === "" || item.quantity === undefined ? "" : item.quantity,
        item.unit || "",
        item.min === undefined ? "" : item.min,
        item.weekendMin === undefined ? "" : item.weekendMin,
        item.statusLabel || item.status || "",
        item.memo || "",
        data.note,
        data.page
      ]);
    });
  }

  sendInventoryEmail(data);
}

function formatInventoryItem(item) {
  const quantity = item.quantity === "" || item.quantity === undefined
    ? "미입력"
    : `${item.quantity}${item.unit || ""}`;
  const min = item.min === undefined ? "-" : `${item.min}${item.unit || ""}`;
  const weekendMin = item.weekendMin === undefined ? "-" : `${item.weekendMin}${item.unit || ""}`;
  const memo = item.memo ? ` / ${item.memo}` : "";
  return `- ${item.name || "품목명 없음"}: ${quantity} (${item.statusLabel || item.status || "-"}, 기준 ${min}, 주말 ${weekendMin})${memo}`;
}

function sendInventoryEmail(data) {
  if (!ADMIN_EMAILS.length || ADMIN_EMAILS[0] === "manager@example.com") return;

  const lowCount = data.lowItems.length;
  const watchCount = data.watchItems.length;
  const missingCount = data.missingItems.length;
  const subjectPrefix = lowCount || missingCount ? "[재고부족]" : watchCount ? "[재고주의]" : "[재고확인]";
  const subject = `${subjectPrefix} [뤁스퀘어] 마감 재고 체크 - ${data.staffName}`;
  const body = [
    `날짜: ${data.dateText}`,
    `시간: ${data.timeText}`,
    `담당자: ${data.staffName}`,
    "",
    "[부족]",
    lowCount ? data.lowItems.map(formatInventoryItem).join("\n") : "- 없음",
    "",
    "[주의]",
    watchCount ? data.watchItems.map(formatInventoryItem).join("\n") : "- 없음",
    "",
    "[미입력]",
    missingCount ? data.missingItems.map(formatInventoryItem).join("\n") : "- 없음",
    "",
    "[전체 입력]",
    data.inventoryItems.length ? data.inventoryItems.map(formatInventoryItem).join("\n") : "- 없음",
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

function getOrCreateStayHistorySheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(STAY_HISTORY_SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(STAY_HISTORY_SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "처리일시",
      "이벤트일자",
      "파일ID",
      "파일명",
      "파일URL",
      "분류",
      "제목",
      "요약",
      "사실기록",
      "운영이슈",
      "매뉴얼반영필요",
      "매뉴얼제안",
      "상태",
      "처리메모"
    ]);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function getOrCreateStayHistoryFilesSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(STAY_HISTORY_FILES_SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(STAY_HISTORY_FILES_SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "파일ID",
      "파일명",
      "파일URL",
      "처리일시",
      "상태",
      "메시지"
    ]);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function getStayHistoryConfig() {
  const sheet = getOrCreateStayHistorySheet();
  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];

  const headers = values[0] || [];
  const headerMap = headers.reduce((map, header, index) => {
    const key = String(header || "").trim().replace(/\s+/g, "");
    if (key) map[key] = index;
    return map;
  }, {});

  return values
    .slice(1)
    .map((row, rowIndex) => {
      const status = getConfigCell(row, headerMap, ["상태"], 12);
      const normalizedStatus = String(status || "").trim();
      if (normalizedStatus === "숨김" || normalizedStatus === "분석오류" || normalizedStatus === "분석대기") return null;

      return {
        id: getConfigCell(row, headerMap, ["파일ID"], 2) || `row-${rowIndex + 2}`,
        processedAt: getConfigCell(row, headerMap, ["처리일시"], 0),
        eventDate: getConfigCell(row, headerMap, ["이벤트일자"], 1),
        fileId: getConfigCell(row, headerMap, ["파일ID"], 2),
        fileName: getConfigCell(row, headerMap, ["파일명"], 3),
        fileUrl: getConfigCell(row, headerMap, ["파일URL"], 4),
        category: getConfigCell(row, headerMap, ["분류"], 5),
        title: getConfigCell(row, headerMap, ["제목"], 6),
        summary: getConfigCell(row, headerMap, ["요약"], 7),
        facts: getConfigCell(row, headerMap, ["사실기록"], 8),
        issues: getConfigCell(row, headerMap, ["운영이슈"], 9),
        manualNeeded: getConfigCell(row, headerMap, ["매뉴얼반영필요"], 10),
        manualSuggestions: getConfigCell(row, headerMap, ["매뉴얼제안"], 11),
        status: normalizedStatus,
        memo: getConfigCell(row, headerMap, ["처리메모"], 13)
      };
    })
    .filter((item) => item && (item.title || item.summary || item.fileName))
    .reverse()
    .slice(0, 80);
}

function setupDailyStayHistoryTrigger() {
  ScriptApp.getProjectTriggers().forEach((trigger) => {
    if (trigger.getHandlerFunction() === "runDailyStayHistoryImport") {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  ScriptApp.newTrigger("runDailyStayHistoryImport")
    .timeBased()
    .everyDays(1)
    .atHour(7)
    .create();
}

function authorizeStayHistoryExternalRequest() {
  const response = UrlFetchApp.fetch("https://generativelanguage.googleapis.com", {
    method: "get",
    muteHttpExceptions: true
  });
  return response.getResponseCode();
}

function runDailyStayHistoryImport() {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const apiKey = PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY");
    if (!apiKey) {
      return {
        ok: false,
        imported: 0,
        skipped: 0,
        messages: ["GEMINI_API_KEY가 없어 새 파일을 처리하지 않았습니다."]
      };
    }

    const folder = DriveApp.getFolderById(STAY_HISTORY_FOLDER_ID);
    const processedIds = getProcessedStayHistoryFileIds();
    const files = folder.getFiles();
    const imported = [];
    const skipped = [];
    const maxImportsPerRun = 30;

    while (files.hasNext() && imported.length + skipped.length < maxImportsPerRun) {
      const file = files.next();
      const fileId = file.getId();

      if (processedIds.has(fileId)) {
        continue;
      }

      const result = importStayHistoryFile(file);
      if (result.ok) {
        imported.push(result.event);
      } else {
        skipped.push(result.message);
        if (result.retryable) break;
      }
    }

    if (imported.length) {
      sendStayHistoryDigestEmail(imported);
    }

    return {
      ok: true,
      imported: imported.length,
      skipped: skipped.length,
      messages: skipped
    };
  } finally {
    lock.releaseLock();
  }
}

function getProcessedStayHistoryFileIds() {
  const sheet = getOrCreateStayHistoryFilesSheet();
  const values = sheet.getDataRange().getValues();
  const successfulHistoryIds = getSuccessfulStayHistoryFileIds();
  return new Set(values.slice(1)
    .filter((row) => {
      const fileId = String(row[0] || "").trim();
      const status = String(row[4] || "").trim();
      return status === "건너뜀" || (status === "완료" && successfulHistoryIds.has(fileId));
    })
    .map((row) => String(row[0] || "").trim())
    .filter(Boolean));
}

function getSuccessfulStayHistoryFileIds() {
  const sheet = getOrCreateStayHistorySheet();
  const values = sheet.getDataRange().getValues();
  return new Set(values.slice(1)
    .filter((row) => {
      const fileId = String(row[2] || "").trim();
      const status = String(row[12] || "").trim();
      return fileId && status !== "숨김" && status !== "분석오류" && status !== "분석대기";
    })
    .map((row) => String(row[2] || "").trim()));
}

function importStayHistoryFile(file) {
  const fileId = file.getId();
  const fileName = file.getName();
  const fileUrl = file.getUrl();
  const processedAt = Utilities.formatDate(new Date(), TIMEZONE, "yyyy-MM-dd HH:mm:ss");

  try {
    const mimeType = file.getMimeType();
    if (!String(mimeType || "").startsWith("image/")) {
      const message = `지원하지 않는 파일 형식: ${mimeType || "알 수 없음"}`;
      markStayHistoryFileProcessed(file, processedAt, "건너뜀", message);
      return { ok: false, message };
    }

    const analysis = analyzeStayHistoryImage(file);
    const event = appendStayHistoryEvent({
      processedAt,
      eventDate: analysis.eventDate || Utilities.formatDate(file.getDateCreated(), TIMEZONE, "yyyy-MM-dd"),
      fileId,
      fileName,
      fileUrl,
      category: analysis.category || "운영 이슈",
      title: analysis.title || fileName,
      summary: analysis.summary || "Drive 캡처에서 자동 수집된 운영 히스토리입니다.",
      facts: toMultilineText(analysis.facts),
      issues: toMultilineText(analysis.issues),
      manualNeeded: normalizeYesNo(analysis.manualNeeded),
      manualSuggestions: toMultilineText(analysis.manualSuggestions || analysis.suggestions),
      status: analysis.status || "검토대기",
      memo: analysis.memo || ""
    });

    if (analysis.retryable) {
      markStayHistoryFileProcessed(file, processedAt, "재시도대기", event.memo || event.summary);
      return {
        ok: false,
        retryable: true,
        message: event.memo || event.summary || "일시적인 API 오류로 다음 실행 때 재시도합니다."
      };
    }

    markStayHistoryFileProcessed(file, processedAt, "완료", event.title);
    return { ok: true, event };
  } catch (error) {
    const message = error && error.message ? error.message : String(error);
    appendStayHistoryEvent({
      processedAt,
      eventDate: Utilities.formatDate(file.getDateCreated(), TIMEZONE, "yyyy-MM-dd"),
      fileId,
      fileName,
      fileUrl,
      category: "분석 오류",
      title: fileName,
      summary: "자동 분석 중 오류가 발생해 원본 캡처 확인이 필요합니다.",
      facts: "파일이 Drive 폴더에 새로 추가되었습니다.",
      issues: "",
      manualNeeded: "N",
      manualSuggestions: "Apps Script 실행 로그와 Gemini API 키/응답 상태를 확인합니다.",
      status: "분석오류",
      memo: message.slice(0, 500)
    });
    markStayHistoryFileProcessed(file, processedAt, "오류", message);
    return { ok: false, message };
  }
}

function getStayHistoryStatus() {
  const props = PropertiesService.getScriptProperties();
  const apiKey = props.getProperty("GEMINI_API_KEY") || "";
  const model = props.getProperty("GEMINI_MODEL") || "gemini-2.0-flash";
  const historySheet = getOrCreateStayHistorySheet();
  const filesSheet = getOrCreateStayHistoryFilesSheet();
  const historyRows = historySheet.getDataRange().getValues();
  const fileRows = filesSheet.getDataRange().getValues();
  const counts = fileRows.slice(1).reduce((map, row) => {
    const status = String(row[4] || "미상").trim() || "미상";
    map[status] = (map[status] || 0) + 1;
    return map;
  }, {});

  return {
    ok: true,
    hasGeminiKey: Boolean(apiKey),
    geminiKeyLooksLikeAiStudio: /^AIza/.test(apiKey),
    model,
    historyCount: Math.max(0, historyRows.length - 1),
    processedFileCount: Math.max(0, fileRows.length - 1),
    processedStatusCounts: counts,
    recentHistory: historyRows.slice(Math.max(1, historyRows.length - 6)).map((row) => ({
      processedAt: row[0],
      eventDate: row[1],
      fileName: row[3],
      category: row[5],
      title: row[6],
      status: row[12],
      memo: row[13]
    })),
    recentFiles: fileRows.slice(Math.max(1, fileRows.length - 10)).map((row) => ({
      fileName: row[1],
      processedAt: row[3],
      status: row[4],
      message: row[5]
    }))
  };
}

function markStayHistoryFileProcessed(file, processedAt, status, message) {
  const sheet = getOrCreateStayHistoryFilesSheet();
  sheet.appendRow([
    file.getId(),
    file.getName(),
    file.getUrl(),
    processedAt,
    status,
    message || ""
  ]);
}

function analyzeStayHistoryImage(file) {
  const apiKey = PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY");
  if (!apiKey) {
    return {
      category: "분석 대기",
      title: file.getName(),
      summary: "GEMINI_API_KEY Script Property를 설정하면 캡처 내용을 자동 분석합니다.",
      facts: ["파일이 Drive 폴더에 새로 추가되었습니다."],
      issues: [],
      manualNeeded: "N",
      manualSuggestions: [],
      status: "분석대기",
      memo: "Apps Script 프로젝트 설정 > 스크립트 속성에 GEMINI_API_KEY를 추가해주세요."
    };
  }

  const blob = file.getBlob();
  const model = PropertiesService.getScriptProperties().getProperty("GEMINI_MODEL") || "gemini-2.0-flash";
  const prompt = [
    "너는 루트스퀘어/만나씨이에이의 운영 매뉴얼 관리자다.",
    "첨부된 카카오톡/메신저/현장 캡처를 읽고, 운영 히스토리로 남길 사건만 정리한다.",
    "확인되지 않은 내용은 추측하지 말고, '확인 필요'라고 쓴다.",
    "직원 개인 비난 표현은 줄이고, 운영 개선 관점으로 정리한다.",
    "반드시 아래 JSON 형식 하나만 반환한다.",
    "{",
    '  "eventDate": "YYYY-MM-DD 또는 확인 필요",',
    '  "category": "스테이 정비|스테이 고객응대|장비 유지보수|청소/위생|근무관리|기타 중 하나",',
    '  "title": "짧은 제목",',
    '  "summary": "2문장 이내 요약",',
    '  "facts": ["캡처에서 확인되는 사실"],',
    '  "issues": ["운영상 문제가 된 점"],',
    '  "manualNeeded": "Y 또는 N",',
    '  "manualSuggestions": ["매뉴얼 또는 체크리스트에 반영할 제안"],',
    '  "status": "검토대기",',
    '  "memo": "확인 필요 사항"',
    "}"
  ].join("\n");
  const payload = {
    contents: [{
      role: "user",
      parts: [
        { text: prompt },
        {
          inlineData: {
            mimeType: blob.getContentType(),
            data: Utilities.base64Encode(blob.getBytes())
          }
        }
      ]
    }],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: "application/json"
    }
  };
  const response = UrlFetchApp.fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    }
  );
  const statusCode = response.getResponseCode();
  const responseText = response.getContentText();

  if (statusCode < 200 || statusCode >= 300) {
    const retryable = statusCode === 429 || statusCode === 503;
    return {
      category: retryable ? "분석 대기" : "분석 오류",
      title: file.getName(),
      summary: `Gemini API 오류 ${statusCode}로 자동 분석하지 못했습니다.`,
      facts: ["파일이 Drive 폴더에 새로 추가되었습니다."],
      issues: [],
      manualNeeded: "N",
      manualSuggestions: retryable
        ? ["Gemini API 쿼터 또는 일시 장애가 해소된 뒤 다시 자동 분석합니다."]
        : ["Apps Script 실행 로그에서 Gemini API 응답을 확인합니다."],
      status: retryable ? "분석대기" : "분석오류",
      retryable,
      memo: responseText.slice(0, 500)
    };
  }

  const parsed = JSON.parse(responseText);
  const text = parsed.candidates && parsed.candidates[0] && parsed.candidates[0].content
    ? parsed.candidates[0].content.parts.map((part) => part.text || "").join("\n")
    : "";
  return parseJsonObjectText(text);
}

function parseJsonObjectText(text) {
  const cleaned = String(text || "")
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch (error) {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]);
    }
    throw error;
  }
}

function appendStayHistoryEvent(event) {
  const sheet = getOrCreateStayHistorySheet();
  sheet.appendRow([
    event.processedAt,
    event.eventDate,
    event.fileId,
    event.fileName,
    event.fileUrl,
    event.category,
    event.title,
    event.summary,
    event.facts,
    event.issues,
    event.manualNeeded,
    event.manualSuggestions,
    event.status,
    event.memo
  ]);
  return event;
}

function sendStayHistoryDigestEmail(events) {
  if (!ADMIN_EMAILS.length || ADMIN_EMAILS[0] === "manager@example.com") return;

  const subject = `[뤁스퀘어] 스테이 운영 히스토리 ${events.length}건 자동 기록`;
  const body = [
    `처리일시: ${Utilities.formatDate(new Date(), TIMEZONE, "yyyy-MM-dd HH:mm:ss")}`,
    "",
    events.map((event, index) => [
      `${index + 1}. ${event.title}`,
      `- 분류: ${event.category}`,
      `- 기준일: ${event.eventDate}`,
      `- 요약: ${event.summary}`,
      `- 매뉴얼 반영 필요: ${event.manualNeeded}`,
      event.manualSuggestions ? `- 제안:\n${prefixLines(event.manualSuggestions, "  · ")}` : "",
      `- 원본: ${event.fileUrl}`
    ].filter(Boolean).join("\n")).join("\n\n")
  ].join("\n");

  MailApp.sendEmail({
    to: ADMIN_EMAILS.join(","),
    subject,
    body
  });
}

function toMultilineText(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean).join("\n");
  }
  return String(value || "").trim();
}

function normalizeYesNo(value) {
  const normalized = String(value || "").trim().toLowerCase();
  return ["y", "yes", "true", "1", "필요"].includes(normalized) ? "Y" : "N";
}

function prefixLines(value, prefix) {
  return String(value || "")
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `${prefix}${line}`)
    .join("\n");
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
