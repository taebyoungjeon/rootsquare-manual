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
  clean: "위생·청소",
  stock: "재고·발주",
  equipment: "장비 유지보수"
};

let activeCategory = "all";
let activeArticleId = MANUALS[0]?.id;

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
    });
  });

  if (!manuals.some((manual) => manual.id === activeArticleId)) {
    activeArticleId = manuals[0]?.id;
    renderDetail();
  }
}

function renderDetail() {
  const manual = MANUALS.find((item) => item.id === activeArticleId);

  if (!manual) {
    detailEl.innerHTML = `
      <div class="empty-state">
        <h2>검색 결과가 없습니다</h2>
        <p>다른 단어로 검색하거나 전체 카테고리를 선택해보세요.</p>
      </div>
    `;
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

function setCategory(category) {
  activeCategory = category;
  categoryButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.category === category);
  });
  renderArticles();
}

categoryButtons.forEach((button) => {
  button.addEventListener("click", () => setCategory(button.dataset.category));
});

searchEl.addEventListener("input", renderArticles);

shortcutButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const shortcut = button.dataset.shortcut;
    const shortcutMap = {
      open: { category: "shift", query: "오픈" },
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
