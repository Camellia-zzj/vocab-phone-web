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

function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function getDefaultSpeechSettings() {
  return {
    voiceURI: "",
    rate: 0.95,
    pitch: 1.0,
    lang: "en-US"
  };
}

function getAvailableVoices() {
  if (!("speechSynthesis" in window)) return [];
  return window.speechSynthesis.getVoices();
}

function chooseDefaultVoice(voices) {
  if (!voices || !voices.length) return null;

  const preferred = voices.find(v => /en[-_](US|GB)/i.test(v.lang) && /Google|Samantha|Microsoft|English/i.test(v.name));
  if (preferred) return preferred;

  const english = voices.find(v => /^en/i.test(v.lang));
  if (english) return english;

  return voices[0] || null;
}

function getSpeechSettings() {
  const saved = state?.speechSettings || getDefaultSpeechSettings();
  return {
    voiceURI: saved.voiceURI || "",
    rate: Number(saved.rate || 0.95),
    pitch: Number(saved.pitch || 1.0),
    lang: saved.lang || "en-US"
  };
}

function getPreferredVoice() {
  const voices = getAvailableVoices();
  if (!voices.length) return null;

  const settings = getSpeechSettings();
  if (settings.voiceURI) {
    const exact = voices.find(v => v.voiceURI === settings.voiceURI);
    if (exact) return exact;
  }

  return chooseDefaultVoice(voices);
}

function speakWord(text) {
  if (!text || !("speechSynthesis" in window)) {
    alert("当前浏览器不支持网页发音。建议用 Chrome 打开，或者安装到桌面后再试。");
    return;
  }

  const voices = getAvailableVoices();
  if (!voices.length) {
    // 有些浏览器第一次会晚一点加载 voice 列表
    window.speechSynthesis.cancel();
  }

  const utter = new SpeechSynthesisUtterance(text);
  const settings = getSpeechSettings();
  const voice = getPreferredVoice();

  utter.lang = voice?.lang || settings.lang || "en-US";
  utter.rate = settings.rate;
  utter.pitch = settings.pitch;
  if (voice) utter.voice = voice;

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
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
      currentBookId: defaultBookId,
      speechSettings: getDefaultSpeechSettings()
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
        currentBookId: defaultBookId,
        speechSettings: getDefaultSpeechSettings()
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

    if (!data.speechSettings) {
      data.speechSettings = getDefaultSpeechSettings();
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
      currentBookId: defaultBookId,
      speechSettings: getDefaultSpeechSettings()
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
      currentBookId: state.currentBookId,
      speechSettings: state.speechSettings
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

  state.words.push({
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