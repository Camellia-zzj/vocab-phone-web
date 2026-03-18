const STORAGE_KEY = "vocab_book_list_word_mobile_v1";
const REVIEW_STEPS = [0, 1, 2, 4, 7, 15, 30, 60];
const VOICE_STORAGE_KEY = "vocab_book_voice_settings_v1";

const voiceState = {
  voices: [],
  selectedVoiceURI: "",
  rate: 0.95,
  pitch: 1,
};

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

function startOfLocalDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function nextReviewTime(stage, from = new Date()) {
  const i = Math.max(0, Math.min(stage, REVIEW_STEPS.length - 1));
  return startOfLocalDay(addDays(from, REVIEW_STEPS[i])).toISOString();
}

function fmt(dateStr) {
  return new Date(dateStr).toLocaleDateString("zh-CN");
}

function isDue(dateStr) {
  return startOfLocalDay(dateStr).getTime() <= startOfLocalDay(new Date()).getTime();
}

function loadVoiceSettings() {
  try {
    const raw = localStorage.getItem(VOICE_STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (typeof data.selectedVoiceURI === "string") {
      voiceState.selectedVoiceURI = data.selectedVoiceURI;
    }
    if (typeof data.rate === "number" && Number.isFinite(data.rate)) {
      voiceState.rate = Math.max(0.6, Math.min(1.2, data.rate));
    }
    if (typeof data.pitch === "number" && Number.isFinite(data.pitch)) {
      voiceState.pitch = Math.max(0.8, Math.min(1.2, data.pitch));
    }
  } catch {}
}

function saveVoiceSettings() {
  localStorage.setItem(
    VOICE_STORAGE_KEY,
    JSON.stringify({
      selectedVoiceURI: voiceState.selectedVoiceURI,
      rate: voiceState.rate,
      pitch: voiceState.pitch,
    })
  );
}

function getPreferredVoice() {
  if (!voiceState.voices.length) return null;

  const selected = voiceState.voices.find((v) => v.voiceURI === voiceState.selectedVoiceURI);
  if (selected) return selected;

  return (
    voiceState.voices.find((v) => /en-(US|GB)/i.test(v.lang) && /natural|siri|google|microsoft|sam|ava|aria|jenny|guy|libby/i.test(v.name)) ||
    voiceState.voices.find((v) => /en-(US|GB)/i.test(v.lang) && v.default) ||
    voiceState.voices.find((v) => /en-(US|GB)/i.test(v.lang)) ||
    voiceState.voices.find((v) => /^en/i.test(v.lang)) ||
    voiceState.voices[0] ||
    null
  );
}

function populateVoiceOptions() {
  const select = document.getElementById("voiceSelect");
  const rateInput = document.getElementById("voiceRateRange");
  const rateValue = document.getElementById("voiceRateValue");
  const pitchInput = document.getElementById("voicePitchRange");
  const pitchValue = document.getElementById("voicePitchValue");
  const tip = document.getElementById("voiceTip");

  if (!select) return;

  const voices = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
  voiceState.voices = [...voices].sort((a, b) => {
    const aScore = /^en-(US|GB)/i.test(a.lang) ? 1 : 0;
    const bScore = /^en-(US|GB)/i.test(b.lang) ? 1 : 0;
    return bScore - aScore || a.name.localeCompare(b.name);
  });

  if (!voiceState.voices.length) {
    select.innerHTML = '<option value="">当前设备暂时没有可用英语语音</option>';
    select.disabled = true;
    if (tip) tip.textContent = "没有读到可用语音。某些浏览器要在页面点一次按钮后才会加载语音列表。";
    return;
  }

  select.disabled = false;
  const preferred = getPreferredVoice();
  if (preferred && !voiceState.selectedVoiceURI) {
    voiceState.selectedVoiceURI = preferred.voiceURI;
    saveVoiceSettings();
  }

  select.innerHTML = voiceState.voices
    .map((voice) => {
      const selected = voice.voiceURI === voiceState.selectedVoiceURI ? "selected" : "";
      const tag = voice.default ? " · 默认" : "";
      return `<option value="${voice.voiceURI}" ${selected}>${voice.name} (${voice.lang})${tag}</option>`;
    })
    .join("");

  if (rateInput) rateInput.value = String(voiceState.rate);
  if (rateValue) rateValue.textContent = Number(voiceState.rate).toFixed(2);
  if (pitchInput) pitchInput.value = String(voiceState.pitch);
  if (pitchValue) pitchValue.textContent = Number(voiceState.pitch).toFixed(2);
  if (tip && preferred) {
    tip.textContent = `当前推荐声音：${preferred.name}（${preferred.lang}）`;
  }
}

function bindVoiceControls() {
  const select = document.getElementById("voiceSelect");
  const rateInput = document.getElementById("voiceRateRange");
  const rateValue = document.getElementById("voiceRateValue");
  const pitchInput = document.getElementById("voicePitchRange");
  const pitchValue = document.getElementById("voicePitchValue");
  const previewBtn = document.getElementById("voicePreviewBtn");

  if (select && !select.dataset.bound) {
    select.dataset.bound = "1";
    select.addEventListener("change", (e) => {
      voiceState.selectedVoiceURI = e.target.value;
      saveVoiceSettings();
      populateVoiceOptions();
    });
  }

  if (rateInput && !rateInput.dataset.bound) {
    rateInput.dataset.bound = "1";
    rateInput.addEventListener("input", (e) => {
      voiceState.rate = Number(e.target.value);
      if (rateValue) rateValue.textContent = voiceState.rate.toFixed(2);
      saveVoiceSettings();
    });
  }

  if (pitchInput && !pitchInput.dataset.bound) {
    pitchInput.dataset.bound = "1";
    pitchInput.addEventListener("input", (e) => {
      voiceState.pitch = Number(e.target.value);
      if (pitchValue) pitchValue.textContent = voiceState.pitch.toFixed(2);
      saveVoiceSettings();
    });
  }

  if (previewBtn && !previewBtn.dataset.bound) {
    previewBtn.dataset.bound = "1";
    previewBtn.addEventListener("click", () => {
      speakWord("example");
    });
  }
}

function initVoiceSystem() {
  loadVoiceSettings();
  bindVoiceControls();
  populateVoiceOptions();

  if ("speechSynthesis" in window && typeof window.speechSynthesis.addEventListener === "function") {
    window.speechSynthesis.addEventListener("voiceschanged", populateVoiceOptions);
  }
}

function speakWord(text) {
  if (!text || !("speechSynthesis" in window)) {
    alert("当前浏览器不支持发音功能");
    return;
  }

  if (!voiceState.voices.length) {
    voiceState.voices = window.speechSynthesis.getVoices();
  }

  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  const preferred = getPreferredVoice();

  if (preferred) {
    utter.voice = preferred;
    utter.lang = preferred.lang || "en-US";
  } else {
    utter.lang = "en-US";
  }

  utter.rate = voiceState.rate;
  utter.pitch = voiceState.pitch;
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
window.addEventListener("DOMContentLoaded", () => {
  initVoiceSystem();
});
