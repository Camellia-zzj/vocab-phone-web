const STORAGE_KEY = "vocab_book_list_word_mobile_v1";
const REVIEW_STEPS = [0, 1, 2, 4, 7, 15, 30, 60];

function uid(prefix = "id") {
  return prefix + "_" + Date.now().toString() + Math.random().toString(36).slice(2, 8);
}

function nowISO() {
  return new Date().toISOString();
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function nextReviewTime(stage, from = new Date()) {
  const i = Math.max(0, Math.min(stage, REVIEW_STEPS.length - 1));
  return addDays(from, REVIEW_STEPS[i]).toISOString();
}

function fmt(dateStr) {
  return new Date(dateStr).toLocaleString("zh-CN");
}

function isDue(dateStr) {
  return new Date(dateStr).getTime() <= Date.now();
}

function speakWord(text) {
  if (!text || !("speechSynthesis" in window)) {
    alert("当前浏览器不支持发音功能");
    return;
  }
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "en-US";
  utter.rate = 0.95;
  window.speechSynthesis.speak(utter);
}

function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function loadData() {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    const defaultBookId = uid("book");
    return {
      books: [
        {
          id: defaultBookId,
          name: "默认词书",
          createdAt: nowISO(),
        }
      ],
      lists: [],
      words: [],
      currentBookId: defaultBookId
    };
  }

  try {
    const data = JSON.parse(raw);

    if (!Array.isArray(data.books)) {
      const defaultBookId = uid("book");
      const defaultListId = uid("list");
      const oldWords = Array.isArray(data.words) ? data.words : [];

      return {
        books: [
          {
            id: defaultBookId,
            name: "默认词书",
            createdAt: nowISO(),
          }
        ],
        lists: [
          {
            id: defaultListId,
            bookId: defaultBookId,
            name: "迁移词单",
            createdAt: nowISO(),
            reviewStage: 0,
            nextReviewAt: nowISO(),
            lastReviewedAt: null
          }
        ],
        words: oldWords.map((w) => ({
          id: w.id || uid("word"),
          listId: defaultListId,
          word: w.word || "",
          meaning: w.meaning || "",
          example: w.example || "",
          note: w.note || "",
          reviewCount: w.reviewCount || 0,
          lapseCount: w.lapseCount || 0,
          createdAt: w.createdAt || nowISO(),
          updatedAt: w.updatedAt || nowISO(),
        })),
        currentBookId: defaultBookId
      };
    }

    if (!Array.isArray(data.lists)) data.lists = [];
    if (!Array.isArray(data.words)) data.words = [];

    if (!data.books.length) {
      const defaultBookId = uid("book");
      data.books = [
        {
          id: defaultBookId,
          name: "默认词书",
          createdAt: nowISO(),
        }
      ];
      data.currentBookId = defaultBookId;
    }

    if (!data.currentBookId) {
      data.currentBookId = data.books[0].id;
    }

    return data;
  } catch {
    const defaultBookId = uid("book");
    return {
      books: [
        {
          id: defaultBookId,
          name: "默认词书",
          createdAt: nowISO(),
        }
      ],
      lists: [],
      words: [],
      currentBookId: defaultBookId
    };
  }
}

function saveData() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      books: state.books,
      lists: state.lists,
      words: state.words,
      currentBookId: state.currentBookId
    })
  );
}

function getBookById(id) {
  return state.books.find((b) => b.id === id) || null;
}

function getCurrentBook() {
  return getBookById(state.currentBookId) || state.books[0] || null;
}

function getListById(id) {
  return state.lists.find((l) => l.id === id) || null;
}

function getListsByBookId(bookId) {
  return state.lists
    .filter((l) => l.bookId === bookId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function getWordsByListId(listId) {
  return state.words.filter((w) => w.listId === listId);
}

function getTodayListName() {
  return new Date().toISOString().slice(0, 10);
}

function ensureDateList(bookId, dateName = getTodayListName()) {
  let found = state.lists.find((l) => l.bookId === bookId && l.name === dateName);
  if (found) return found;

  found = {
    id: uid("list"),
    bookId,
    name: dateName,
    createdAt: nowISO(),
    reviewStage: 0,
    nextReviewAt: nowISO(),
    lastReviewedAt: null
  };

  state.lists.unshift(found);
  saveData();
  return found;
}

function ensureTodayList(bookId) {
  return ensureDateList(bookId, getTodayListName());
}

function getDueLists() {
  return state.lists.filter((l) => isDue(l.nextReviewAt));
}

function ensureWrongBook() {
  let wrongBook = state.books.find((b) => b.name === "错词本");
  if (!wrongBook) {
    wrongBook = {
      id: uid("book"),
      name: "错词本",
      createdAt: nowISO(),
      isSystem: true
    };
    state.books.unshift(wrongBook);
    saveData();
  }
  return wrongBook;
}

function addWordToWrongBook(sourceWord) {
  if (!sourceWord) return;

  const wrongBook = ensureWrongBook();
  const targetList = ensureTodayList(wrongBook.id);

  const exists = state.words.find(
    (w) =>
      w.listId === targetList.id &&
      w.word.trim().toLowerCase() === String(sourceWord.word || "").trim().toLowerCase() &&
      w.meaning.trim() === String(sourceWord.meaning || "").trim()
  );

  if (exists) return;

  const now = nowISO();

  state.words.unshift({
    id: uid("word"),
    listId: targetList.id,
    word: sourceWord.word || "",
    meaning: sourceWord.meaning || "",
    example: sourceWord.example || "",
    note: sourceWord.note || "",
    reviewCount: 0,
    lapseCount: 0,
    createdAt: now,
    updatedAt: now,
  });

  saveData();
}