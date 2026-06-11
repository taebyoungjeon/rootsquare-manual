MANUALS.push({
  id: "weekly-schedule-sample",
  category: "schedule",
  type: "schedule",
  title: "근무 시간표 화면 예시",
  summary: "엑셀 업로드 후 오늘 근무자와 이번 주 시간표를 한 화면에서 확인하는 구성 예시입니다.",
  tags: ["근무표", "오늘근무", "파트타이머", "정규직", "예시"],
  updated: "2026-06-11",
  owner: "운영 담당자",
  steps: [
    "상단에서 오늘 근무 요약을 확인합니다.",
    "시간대별 카드에서 현재 근무자와 다음 출근자를 확인합니다.",
    "요일 탭으로 이번 주 전체 근무 흐름을 확인합니다.",
    "실제 반영 시 매주 엑셀 파일 기준으로 갱신합니다."
  ],
  checklist: [
    "오늘 근무자 확인",
    "현재 시간대 근무자 확인",
    "마감 담당자 확인",
    "파트타이머 출근 시간 확인",
    "원본 엑셀 기준일 확인"
  ],
  note: "화면 구성을 보기 위한 예시 데이터입니다. 실제 근무표가 아닙니다.",
  schedule: {
    weekLabel: "2026년 6월 3주 예시",
    sourceLabel: "엑셀 업로드 예시",
    todayLabel: "오늘 예시: 6/17 수",
    updatedAt: "2026-06-11",
    summaryCards: [
      {
        label: "지금 근무",
        value: "정규직 3명 · 파트타이머 2명",
        people: ["정규직 A", "정규직 B", "정규직 C", "파트타이머 A", "파트타이머 B"]
      },
      {
        label: "다음 출근",
        value: "14:00 파트타이머 C",
        people: ["파트타이머 C", "베이커리 보조"]
      },
      {
        label: "마감 예정",
        value: "정규직 B · 파트타이머 C",
        people: ["정규직 B", "파트타이머 C"]
      }
    ],
    timeBlocks: [
      {
        time: "08:00-10:00",
        status: "오픈 준비",
        teams: [
          { label: "정규직", people: ["정규직 A", "정규직 B"] },
          { label: "파트타이머", people: ["파트타이머 A"] },
          { label: "역할", people: ["베이커리", "카페 오픈"] }
        ]
      },
      {
        time: "10:00-14:00",
        status: "피크 전반",
        teams: [
          { label: "정규직", people: ["정규직 A", "정규직 C"] },
          { label: "파트타이머", people: ["파트타이머 A", "파트타이머 B"] },
          { label: "역할", people: ["카페", "홀 체크", "식사 교대"] }
        ]
      },
      {
        time: "14:00-18:00",
        status: "피크 후반",
        teams: [
          { label: "정규직", people: ["정규직 B", "정규직 C"] },
          { label: "파트타이머", people: ["파트타이머 B", "파트타이머 C"] },
          { label: "역할", people: ["재고 보충", "쇼케이스 정리"] }
        ]
      },
      {
        time: "18:00-21:00",
        status: "마감 준비",
        teams: [
          { label: "정규직", people: ["정규직 B"] },
          { label: "파트타이머", people: ["파트타이머 C"] },
          { label: "역할", people: ["마감", "소모품 보충"] }
        ]
      }
    ],
    weekDays: [
      { day: "월", date: "6/15", badge: "오픈 2 · 마감 2" },
      { day: "화", date: "6/16", badge: "오픈 2 · 마감 2" },
      { day: "수", date: "6/17", badge: "오늘 예시" },
      { day: "목", date: "6/18", badge: "휴무/대체 확인" },
      { day: "금", date: "6/19", badge: "피크 보강" },
      { day: "토", date: "6/20", badge: "파트타이머 4" },
      { day: "일", date: "6/21", badge: "마감 확인" }
    ]
  }
});
