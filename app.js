window.state = {
  books: [],
  lists: [],
  words: [],
  currentBookId: null,

  currentPage: "home",
  showAnswer: false,

  editingWordId: null,
  pendingDelete: null,

  libraryView: "books",
  libraryBookId: null,
  libraryListId: null,

  reviewStage: "books",
  reviewBookId: null,
  reviewListId: null,
  currentReviewWordId: null,
  reviewInitialWordTotal: 0,
  currentReviewHadForget: false,
  reviewQueue: [],

  affixEditingId: null,
  affixPreviewId: null,
  wordPreviewId: null,
  libraryLastAutoOpenedKeyword: "",
  affixLastAutoOpenedKeyword: "",
};

const AFFIX_STORAGE_KEY = "vocab_affixes_mobile_v1";
const VOICE_PREFS_KEY = "vocab_voice_prefs_mobile_v1";

const DEFAULT_AFFIXES = [
  { id: "affix_1", type: "prefix", affix: "un-", meaning: "不；相反", note: "否定前缀", examples: ["unhappy", "unsafe", "unknown"] },
  { id: "affix_2", type: "prefix", affix: "in-", meaning: "不；向内", note: "常见否定前缀，也可表示进入", examples: ["incorrect", "inactive", "input"] },
  { id: "affix_3", type: "prefix", affix: "im-", meaning: "不", note: "in- 在 b/m/p 前的变体", examples: ["impossible", "impolite", "immature"] },
  { id: "affix_4", type: "prefix", affix: "il-", meaning: "不", note: "in- 在 l 前的变体", examples: ["illegal", "illogical"] },
  { id: "affix_5", type: "prefix", affix: "ir-", meaning: "不", note: "in- 在 r 前的变体", examples: ["irregular", "irresponsible"] },
  { id: "affix_6", type: "prefix", affix: "dis-", meaning: "否定；分开；去掉", note: "常表示否定或相反", examples: ["dislike", "disagree", "disconnect"] },
  { id: "affix_7", type: "prefix", affix: "non-", meaning: "非；不", note: "表示不是某类", examples: ["nonstop", "nonfiction"] },
  { id: "affix_8", type: "prefix", affix: "pre-", meaning: "在前；预先", note: "时间或顺序在前", examples: ["preview", "predict", "prepare"] },
  { id: "affix_9", type: "prefix", affix: "re-", meaning: "再；重新；向后", note: "高频前缀", examples: ["rewrite", "return", "review"] },
  { id: "affix_10", type: "prefix", affix: "over-", meaning: "过度；在上方", note: "常表示过多", examples: ["overwork", "overeat", "overlook"] },
  { id: "affix_11", type: "prefix", affix: "under-", meaning: "在下；不足", note: "常表示不够", examples: ["underground", "underpaid"] },
  { id: "affix_12", type: "prefix", affix: "sub-", meaning: "在下；次级", note: "在下方、次一级", examples: ["subway", "submarine", "substandard"] },
  { id: "affix_13", type: "prefix", affix: "inter-", meaning: "在……之间", note: "强调相互、之间", examples: ["international", "interaction", "internet"] },
  { id: "affix_14", type: "prefix", affix: "trans-", meaning: "穿过；转移", note: "跨越、转换", examples: ["transport", "translate", "transform"] },
  { id: "affix_15", type: "prefix", affix: "mis-", meaning: "错误；坏", note: "表示错、误", examples: ["mistake", "misunderstand", "mislead"] },
  { id: "affix_16", type: "prefix", affix: "anti-", meaning: "反对；抗", note: "反、抗", examples: ["antisocial", "antibiotic"] },
  { id: "affix_17", type: "prefix", affix: "co-", meaning: "共同", note: "一起、联合", examples: ["cooperate", "coexist"] },
  { id: "affix_18", type: "prefix", affix: "auto-", meaning: "自己；自动", note: "自我", examples: ["autobiography", "automatic"] },
  { id: "affix_19", type: "prefix", affix: "bi-", meaning: "二；双", note: "两个", examples: ["bicycle", "bilingual"] },
  { id: "affix_20", type: "prefix", affix: "tri-", meaning: "三", note: "三个", examples: ["triangle", "triple"] },
  { id: "affix_21", type: "prefix", affix: "multi-", meaning: "多", note: "多个", examples: ["multimedia", "multinational"] },
  { id: "affix_22", type: "prefix", affix: "semi-", meaning: "半", note: "一半", examples: ["semicircle", "semi-final"] },
  { id: "affix_23", type: "prefix", affix: "micro-", meaning: "小；微", note: "微小", examples: ["microscope", "microphone"] },
  { id: "affix_24", type: "prefix", affix: "tele-", meaning: "远", note: "远距离", examples: ["telephone", "television"] },

  { id: "affix_25", type: "root", affix: "dict", meaning: "说", note: "和说话、命令有关", examples: ["dictate", "predict", "dictionary"] },
  { id: "affix_26", type: "root", affix: "vis / vid", meaning: "看", note: "和看见有关", examples: ["vision", "video", "visible"] },
  { id: "affix_27", type: "root", affix: "spect", meaning: "看", note: "仔细看", examples: ["inspect", "respect", "spectator"] },
  { id: "affix_28", type: "root", affix: "port", meaning: "拿；运", note: "携带、运输", examples: ["transport", "import", "portable"] },
  { id: "affix_29", type: "root", affix: "tract", meaning: "拉；拖", note: "引、拉", examples: ["attract", "contract", "extract"] },
  { id: "affix_30", type: "root", affix: "rupt", meaning: "破", note: "破裂、打断", examples: ["interrupt", "rupture", "bankrupt"] },
  { id: "affix_31", type: "root", affix: "ject", meaning: "扔；投", note: "向外扔、投", examples: ["reject", "inject", "project"] },
  { id: "affix_32", type: "root", affix: "press", meaning: "压", note: "按压、挤压", examples: ["pressure", "express", "depress"] },
  { id: "affix_33", type: "root", affix: "scrib / script", meaning: "写", note: "书写", examples: ["describe", "script", "subscribe"] },
  { id: "affix_34", type: "root", affix: "graph", meaning: "写；画", note: "图写记录", examples: ["autograph", "biography", "graphic"] },
  { id: "affix_35", type: "root", affix: "phon", meaning: "声音", note: "发音、声音", examples: ["phone", "microphone", "phonetic"] },
  { id: "affix_36", type: "root", affix: "aud", meaning: "听", note: "听觉", examples: ["audio", "audience", "audible"] },
  { id: "affix_37", type: "root", affix: "voc / voke", meaning: "叫；声音", note: "呼叫", examples: ["voice", "vocal", "invoke"] },
  { id: "affix_38", type: "root", affix: "ceed / ced / cess", meaning: "走", note: "前进、离开", examples: ["proceed", "recede", "access"] },
  { id: "affix_39", type: "root", affix: "gress", meaning: "走；步", note: "前进", examples: ["progress", "digress", "congress"] },
  { id: "affix_40", type: "root", affix: "form", meaning: "形状", note: "形成", examples: ["inform", "transform", "uniform"] },
  { id: "affix_41", type: "root", affix: "struct", meaning: "建；构造", note: "搭建", examples: ["construct", "structure", "instruct"] },
  { id: "affix_42", type: "root", affix: "pos / pon", meaning: "放", note: "放置", examples: ["position", "compose", "postpone"] },
  { id: "affix_43", type: "root", affix: "duc / duct", meaning: "引导", note: "带领", examples: ["educate", "conduct", "product"] },
  { id: "affix_44", type: "root", affix: "manu", meaning: "手", note: "和手有关", examples: ["manual", "manufacture", "manuscript"] },
  { id: "affix_45", type: "root", affix: "ped", meaning: "脚", note: "足", examples: ["pedal", "pedestrian"] },
  { id: "affix_46", type: "root", affix: "cap / cept / cip", meaning: "拿；抓", note: "接受、获取", examples: ["accept", "receive", "capture"] },
  { id: "affix_47", type: "root", affix: "tain / ten / tent", meaning: "拿住；保持", note: "保持、握住", examples: ["contain", "maintain", "attention"] },
  { id: "affix_48", type: "root", affix: "fac / fact / fic / fect", meaning: "做", note: "制造、使成", examples: ["factory", "effect", "satisfy"] },
  { id: "affix_49", type: "root", affix: "cur / curs / cour", meaning: "跑", note: "流动、发生", examples: ["current", "occur", "course"] },
  { id: "affix_50", type: "root", affix: "liter / letter", meaning: "字母；文字", note: "和文字有关", examples: ["literal", "literature", "letter"] },
  { id: "affix_51", type: "root", affix: "log", meaning: "说；学科", note: "logic 也来自这里", examples: ["dialogue", "logic", "biology"] },
  { id: "affix_52", type: "root", affix: "bio", meaning: "生命", note: "生物", examples: ["biology", "biography", "biodegradable"] },
  { id: "affix_53", type: "root", affix: "geo", meaning: "地", note: "地球、土地", examples: ["geography", "geology"] },
  { id: "affix_54", type: "root", affix: "therm", meaning: "热", note: "温度", examples: ["thermometer", "thermal"] },
  { id: "affix_55", type: "root", affix: "chron", meaning: "时间", note: "时间顺序", examples: ["chronology", "chronic"] },
  { id: "affix_56", type: "root", affix: "meter / metr", meaning: "测量", note: "计量", examples: ["meter", "thermometer", "geometry"] },

  { id: "affix_57", type: "suffix", affix: "-er / -or", meaning: "人；物", note: "做某事的人/工具", examples: ["teacher", "actor", "visitor"] },
  { id: "affix_58", type: "suffix", affix: "-ist", meaning: "人；主义者", note: "从事某类工作或信奉某类主张的人", examples: ["artist", "scientist", "tourist"] },
  { id: "affix_59", type: "suffix", affix: "-ian", meaning: "人；……的", note: "职业、国籍常见", examples: ["musician", "historian"] },
  { id: "affix_60", type: "suffix", affix: "-tion / -sion", meaning: "行为；状态；名词后缀", note: "非常高频", examples: ["action", "decision", "discussion"] },
  { id: "affix_61", type: "suffix", affix: "-ment", meaning: "结果；行为", note: "名词后缀", examples: ["development", "movement", "agreement"] },
  { id: "affix_62", type: "suffix", affix: "-ness", meaning: "性质；状态", note: "把形容词变名词", examples: ["kindness", "happiness"] },
  { id: "affix_63", type: "suffix", affix: "-ity", meaning: "性质；状态", note: "名词后缀", examples: ["ability", "activity", "possibility"] },
  { id: "affix_64", type: "suffix", affix: "-ship", meaning: "身份；关系；状态", note: "名词后缀", examples: ["friendship", "leadership"] },
  { id: "affix_65", type: "suffix", affix: "-age", meaning: "集合；状态；费用", note: "名词后缀", examples: ["package", "marriage", "postage"] },
  { id: "affix_66", type: "suffix", affix: "-ful", meaning: "充满……的", note: "形容词后缀", examples: ["helpful", "useful", "careful"] },
  { id: "affix_67", type: "suffix", affix: "-less", meaning: "没有……的", note: "和 -ful 相对", examples: ["hopeless", "careless", "useless"] },
  { id: "affix_68", type: "suffix", affix: "-able / -ible", meaning: "能够……的", note: "可……的", examples: ["readable", "possible", "visible"] },
  { id: "affix_69", type: "suffix", affix: "-al", meaning: "……的", note: "形容词后缀", examples: ["natural", "personal", "global"] },
  { id: "affix_70", type: "suffix", affix: "-ous", meaning: "充满……的", note: "形容词后缀", examples: ["dangerous", "famous", "curious"] },
  { id: "affix_71", type: "suffix", affix: "-ive", meaning: "有……倾向的", note: "形容词后缀", examples: ["active", "creative", "effective"] },
  { id: "affix_72", type: "suffix", affix: "-y", meaning: "有……的", note: "形容词后缀", examples: ["sunny", "rainy", "salty"] },
  { id: "affix_73", type: "suffix", affix: "-ly", meaning: "……地；具有……性质", note: "副词/形容词后缀", examples: ["quickly", "friendly"] },
  { id: "affix_74", type: "suffix", affix: "-en", meaning: "使成为；由……制成", note: "动词/形容词后缀", examples: ["widen", "golden"] },
  { id: "affix_75", type: "suffix", affix: "-ize / -ise", meaning: "使……化", note: "动词后缀", examples: ["realize", "modernize"] },
  { id: "affix_76", type: "suffix", affix: "-ward / -wards", meaning: "向……", note: "方向", examples: ["forward", "backward", "towards"] },
];

let affixItems = [];

const STORAGE_KEY = "vocab_book_list_word_app_v14";
const WRONG_BOOK_NAME = "错词本";
const REVIEW_STEPS_DAYS = [1, 2, 4, 7, 15];

function uid(prefix = "id") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function nowISO() {
  return new Date().toISOString();
}

function todayDateString() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function addDaysISO(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizeExamplesInput(text) {
  return String(text || "")
    .split(/\n|,|，|;/)
    .map((x) => x.trim())
    .filter(Boolean);
}

function stringifyExamples(examples) {
  return Array.isArray(examples) ? examples.join(", ") : "";
}

function loadVoicePrefs() {
  try {
    const raw = localStorage.getItem(VOICE_PREFS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveVoicePrefs(data) {
  localStorage.setItem(VOICE_PREFS_KEY, JSON.stringify(data || {}));
}

function loadAffixes() {
  try {
    const raw = localStorage.getItem(AFFIX_STORAGE_KEY);
    if (!raw) return [...DEFAULT_AFFIXES];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : [...DEFAULT_AFFIXES];
  } catch {
    return [...DEFAULT_AFFIXES];
  }
}

function saveAffixes() {
  localStorage.setItem(AFFIX_STORAGE_KEY, JSON.stringify(affixItems));
}

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { books: [], lists: [], words: [], currentBookId: null };
    const data = JSON.parse(raw);
    return {
      books: Array.isArray(data.books) ? data.books : [],
      lists: Array.isArray(data.lists) ? data.lists : [],
      words: Array.isArray(data.words) ? data.words : [],
      currentBookId: data.currentBookId || null,
    };
  } catch {
    return { books: [], lists: [], words: [], currentBookId: null };
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
    })
  );
}

function getBookById(id) {
  return state.books.find((b) => b.id === id) || null;
}

function getListById(id) {
  return state.lists.find((l) => l.id === id) || null;
}

function getWordsByListId(listId) {
  return state.words.filter((w) => w.listId === listId);
}

function getListsByBookId(bookId) {
  return state.lists.filter((l) => l.bookId === bookId);
}

function getWordsByBookId(bookId) {
  const listIds = getListsByBookId(bookId).map((l) => l.id);
  return state.words.filter((w) => listIds.includes(w.listId));
}

function ensureWrongBook() {
  let wrongBook = state.books.find((b) => b.name === WRONG_BOOK_NAME);
  if (!wrongBook) {
    wrongBook = { id: uid("book"), name: WRONG_BOOK_NAME, createdAt: nowISO() };
    state.books.unshift(wrongBook);
  }

  const hasList = state.lists.some((l) => l.bookId === wrongBook.id);
  if (!hasList) {
    state.lists.push({
      id: uid("list"),
      bookId: wrongBook.id,
      name: "全部错词",
      dateKey: "wrong-all",
      createdAt: nowISO(),
      reviewStage: 0,
      nextReviewAt: nowISO(),
      lastReviewedAt: null,
    });
  }
}

function ensureTodayList(bookId) {
  const today = todayDateString();
  let list = state.lists.find((l) => l.bookId === bookId && l.dateKey === today);
  if (!list) {
    list = {
      id: uid("list"),
      bookId,
      name: `list ${today}`,
      dateKey: today,
      createdAt: nowISO(),
      reviewStage: 0,
      nextReviewAt: nowISO(),
      lastReviewedAt: null,
    };
    state.lists.unshift(list);
  }
  return list;
}

function setCurrentBook(bookId) {
  state.currentBookId = bookId;
  saveData();
  renderApp();
}

function getCurrentBook() {
  return getBookById(state.currentBookId);
}

function countNeedReviewLists() {
  const now = Date.now();
  return state.lists.filter((l) => new Date(l.nextReviewAt).getTime() <= now).length;
}

function countTodayWords() {
  const today = todayDateString();
  return state.words.filter((w) => {
    const list = getListById(w.listId);
    return list && list.dateKey === today;
  }).length;
}

function openVoiceSettings() {
  const modal = document.getElementById("voiceSettingsModal");
  if (modal) modal.classList.remove("hidden");
  populateVoiceSelects();
}

function closeVoiceSettings() {
  const modal = document.getElementById("voiceSettingsModal");
  if (modal) modal.classList.add("hidden");
}

function getAvailableEnglishVoices() {
  const synth = window.speechSynthesis;
  if (!synth) return [];
  return synth.getVoices().filter((voice) => {
    const lang = String(voice.lang || "").toLowerCase();
    const name = String(voice.name || "").toLowerCase();
    return lang.startsWith("en") || name.includes("english") || name.includes("uk") || name.includes("us");
  });
}

function populateVoiceSelects() {
  const voiceList = getAvailableEnglishVoices();
  const prefs = loadVoicePrefs();

  const femaleSelect = document.getElementById("femaleVoiceSelect");
  const maleSelect = document.getElementById("maleVoiceSelect");
  if (!femaleSelect || !maleSelect) return;

  const buildOptions = (selectedName, preferMale) => {
    const filtered = [...voiceList].sort((a, b) => {
      const aName = String(a.name || "").toLowerCase();
      const bName = String(b.name || "").toLowerCase();
      const maleHints = ["male", "david", "mark", "guy", "tom", "daniel"];
      const femaleHints = ["female", "zira", "susan", "aria", "eva", "emma", "samantha", "jenny"];
      const aHit = (preferMale ? maleHints : femaleHints).some((h) => aName.includes(h)) ? 1 : 0;
      const bHit = (preferMale ? maleHints : femaleHints).some((h) => bName.includes(h)) ? 1 : 0;
      return bHit - aHit;
    });

    return ['<option value="">系统默认</option>']
      .concat(
        filtered.map((voice) => {
          const selected = selectedName === voice.name ? "selected" : "";
          return `<option value="${escapeHtml(voice.name)}" ${selected}>${escapeHtml(voice.name)} (${escapeHtml(voice.lang)})</option>`;
        })
      )
      .join("");
  };

  femaleSelect.innerHTML = buildOptions(prefs.femaleVoiceName || "", false);
  maleSelect.innerHTML = buildOptions(prefs.maleVoiceName || "", true);
}

function saveVoiceSettings() {
  const femaleVoiceName = document.getElementById("femaleVoiceSelect")?.value || "";
  const maleVoiceName = document.getElementById("maleVoiceSelect")?.value || "";
  saveVoicePrefs({ femaleVoiceName, maleVoiceName });
  alert("发音设置已保存");
  closeVoiceSettings();
}

function pickVoiceByStyle(style) {
  const voices = getAvailableEnglishVoices();
  const prefs = loadVoicePrefs();
  const wantedName = style === "male" ? prefs.maleVoiceName : prefs.femaleVoiceName;

  if (wantedName) {
    const matched = voices.find((v) => v.name === wantedName);
    if (matched) return matched;
  }

  const hints = style === "male"
    ? ["male", "david", "mark", "guy", "tom", "daniel"]
    : ["female", "zira", "susan", "aria", "eva", "emma", "samantha", "jenny"];

  const preferred = voices.find((voice) => {
    const name = String(voice.name || "").toLowerCase();
    return hints.some((h) => name.includes(h));
  });

  return preferred || voices[0] || null;
}

function speakWord(text, style = null) {
  if (!text) return;

  if (!("speechSynthesis" in window)) {
    alert("当前浏览器不支持发音");
    return;
  }

  const synth = window.speechSynthesis;
  synth.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 0.95;
  utterance.pitch = style === "male" ? 0.9 : 1.05;

  const voice = pickVoiceByStyle(style || "female");
  if (voice) utterance.voice = voice;

  synth.speak(utterance);
}

function bindVoiceControls() {
  if (window.__voiceControlsBound) return;
  window.__voiceControlsBound = true;

  if (window.speechSynthesis) {
    window.speechSynthesis.onvoiceschanged = () => {
      populateVoiceSelects();
    };
  }
}

/* =========================
   首页统计 / 当前词书 / 加词
========================= */

function renderHomeStats() {
  const totalBooksEl = document.getElementById("totalBooks");
  const totalWordsEl = document.getElementById("totalWords");
  const needReviewEl = document.getElementById("needReviewCount");
  const todayCountEl = document.getElementById("todayCount");

  if (totalBooksEl) totalBooksEl.textContent = state.books.length;
  if (totalWordsEl) totalWordsEl.textContent = state.words.length;
  if (needReviewEl) needReviewEl.textContent = countNeedReviewLists();
  if (todayCountEl) todayCountEl.textContent = countTodayWords();
}

function renderCurrentBookPanel() {
  const currentBookInfo = document.getElementById("currentBookInfo");
  const currentBookTitle = document.getElementById("currentBookTitle");
  const currentBookMeta = document.getElementById("currentBookMeta");

  const book = getCurrentBook();
  if (!currentBookInfo || !currentBookTitle || !currentBookMeta) return;

  if (!book) {
    currentBookInfo.innerHTML = `<div class="muted">还没有词书，请先创建词书</div>`;
    currentBookTitle.textContent = "当前词书";
    currentBookMeta.textContent = "请选择或创建词书后再添加单词";
    return;
  }

  const bookWords = getWordsByBookId(book.id);
  const bookLists = getListsByBookId(book.id);

  currentBookTitle.textContent = book.name;
  currentBookMeta.textContent = `共 ${bookLists.length} 个 list，${bookWords.length} 个单词`;

  currentBookInfo.innerHTML = `
    <div class="word-item">
      <div style="display:flex; justify-content:space-between; align-items:center; gap:12px;">
        <div>
          <div><strong>${escapeHtml(book.name)}</strong></div>
          <div class="small muted" style="margin-top:6px;">当前添加的单词都会进入这个词书今天的 list</div>
        </div>
        <div class="list-actions">
          <button class="secondary" onclick="goToPage('library')">去全部单词</button>
        </div>
      </div>
    </div>
  `;
}

function addBook() {
  const input = document.getElementById("newBookInput");
  const name = input.value.trim();

  if (!name) {
    alert("请输入词书名称");
    return;
  }

  const exists = state.books.some((b) => b.name === name);
  if (exists) {
    alert("这个词书已经存在");
    return;
  }

  const book = { id: uid("book"), name, createdAt: nowISO() };
  state.books.unshift(book);
  state.currentBookId = book.id;
  input.value = "";
  saveData();
  renderApp();
}

function addWord() {
  const currentBook = getCurrentBook();
  if (!currentBook) {
    alert("请先创建或选择一个词书");
    return;
  }

  const wordInput = document.getElementById("wordInput");
  const meaningInput = document.getElementById("meaningInput");
  const exampleInput = document.getElementById("exampleInput");
  const noteInput = document.getElementById("noteInput");

  const word = wordInput.value.trim();
  const meaning = meaningInput.value.trim();
  const example = exampleInput.value.trim();
  const note = noteInput.value.trim();

  if (!word || !meaning) {
    alert("单词和释义必须填写");
    return;
  }

  const targetList = ensureTodayList(currentBook.id);
  const now = nowISO();

  state.words.unshift({
    id: uid("word"),
    listId: targetList.id,
    word,
    meaning,
    example,
    note,
    reviewCount: 0,
    lapseCount: 0,
    createdAt: now,
    updatedAt: now,
  });

  saveData();
  renderApp();

  wordInput.value = "";
  meaningInput.value = "";
  exampleInput.value = "";
  noteInput.value = "";
  wordInput.focus();
}

function handleAddWordKey(e) {
  if (e.key === "Enter") addWord();
}

function scrollToAddWordSection() {
  const addSection = document.getElementById("add-word-section");
  const wordInput = document.getElementById("wordInput");
  const pageHome = document.getElementById("page-home");

  setTimeout(() => {
    try {
      if (addSection) {
        const rect = addSection.getBoundingClientRect();
        const absoluteTop = window.pageYOffset + rect.top;
        const topGap = 6;

        window.scrollTo({
          top: Math.max(0, absoluteTop - topGap),
          behavior: "auto"
        });
      } else if (pageHome) {
        const rect = pageHome.getBoundingClientRect();
        const absoluteTop = window.pageYOffset + rect.top;
        window.scrollTo({
          top: Math.max(0, absoluteTop),
          behavior: "auto"
        });
      }
    } catch {}
  }, 50);

  setTimeout(() => {
    try {
      wordInput.focus({ preventScroll: true });
    } catch {
      wordInput.focus();
    }

    try {
      wordInput.setSelectionRange(0, 0);
    } catch {}
  }, 180);
}

/* =========================
   词根词缀页
========================= */

function getAffixTypeText(type) {
  if (type === "prefix") return "前缀";
  if (type === "root") return "词根";
  if (type === "suffix") return "后缀";
  return type;
}

function resetAffixForm() {
  state.affixEditingId = null;
  const title = document.getElementById("affixFormTitle");
  const saveBtn = document.getElementById("affixSaveBtn");

  if (title) title.textContent = "添加词根词缀";
  if (saveBtn) saveBtn.textContent = "保存词根词缀";

  document.getElementById("affixTypeInput").value = "prefix";
  document.getElementById("affixTextInput").value = "";
  document.getElementById("affixMeaningInput").value = "";
  document.getElementById("affixNoteInput").value = "";
  document.getElementById("affixExamplesInput").value = "";
}

function editAffixItem(id) {
  const item = affixItems.find((x) => x.id === id);
  if (!item) return;

  state.affixEditingId = id;
  document.getElementById("affixFormTitle").textContent = "编辑词根词缀";
  document.getElementById("affixSaveBtn").textContent = "保存修改";
  document.getElementById("affixTypeInput").value = item.type || "root";
  document.getElementById("affixTextInput").value = item.affix || "";
  document.getElementById("affixMeaningInput").value = item.meaning || "";
  document.getElementById("affixNoteInput").value = item.note || "";
  document.getElementById("affixExamplesInput").value = stringifyExamples(item.examples);

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function deleteAffixItem(id) {
  const item = affixItems.find((x) => x.id === id);
  if (!item) return;

  if (!confirm(`确定删除「${item.affix}」吗？`)) return;

  affixItems = affixItems.filter((x) => x.id !== id);
  saveAffixes();

  if (state.affixEditingId === id) {
    resetAffixForm();
  }

  renderAffixes();
}

function saveAffixItem() {
  const type = document.getElementById("affixTypeInput").value;
  const affix = document.getElementById("affixTextInput").value.trim();
  const meaning = document.getElementById("affixMeaningInput").value.trim();
  const note = document.getElementById("affixNoteInput").value.trim();
  const examples = normalizeExamplesInput(document.getElementById("affixExamplesInput").value);

  if (!affix || !meaning) {
    alert("词根词缀本身和意思必须填写");
    return;
  }

  if (state.affixEditingId) {
    affixItems = affixItems.map((item) =>
      item.id === state.affixEditingId
        ? { ...item, type, affix, meaning, note, examples }
        : item
    );
  } else {
    affixItems.unshift({
      id: uid("affix"),
      type,
      affix,
      meaning,
      note,
      examples
    });
  }

  saveAffixes();
  resetAffixForm();
  renderAffixes();
  alert("已保存词根词缀");
}

function getAffixSearchKeyword() {
  const searchInput = document.getElementById("affixSearchInput");
  return (searchInput ? searchInput.value : "").trim().toLowerCase();
}

function getFilteredAffixItems(keyword = "") {
  const k = String(keyword || "").trim().toLowerCase();
  const filtered = affixItems.filter((item) => {
    const text = [
      item.type,
      item.affix,
      item.meaning,
      item.note,
      ...(item.examples || [])
    ].join(" ").toLowerCase();

    return !k || text.includes(k);
  });

  filtered.sort((a, b) => {
    const typeOrder = { prefix: 1, root: 2, suffix: 3 };
    const typeDiff = (typeOrder[a.type] || 99) - (typeOrder[b.type] || 99);
    if (typeDiff !== 0) return typeDiff;
    return String(a.affix).localeCompare(String(b.affix), "zh-CN");
  });

  return filtered;
}

function scoreAffixMatch(item, keyword) {
  const k = String(keyword || "").trim().toLowerCase();
  if (!k) return -1;

  const affix = String(item.affix || "").toLowerCase();
  const meaning = String(item.meaning || "").toLowerCase();
  const note = String(item.note || "").toLowerCase();
  const examples = (item.examples || []).join(" ").toLowerCase();

  if (affix === k) return 100;
  if (affix.replace(/[-\s/]/g, "") === k.replace(/[-\s/]/g, "")) return 95;
  if (affix.startsWith(k)) return 88;
  if (affix.includes(k)) return 80;
  if (meaning.includes(k)) return 70;
  if (note.includes(k)) return 60;
  if (examples.includes(k)) return 50;
  return -1;
}

function findBestAffixMatch(keyword) {
  const filtered = getFilteredAffixItems(keyword);
  if (!filtered.length) return null;

  const ranked = filtered
    .map((item) => ({ item, score: scoreAffixMatch(item, keyword) }))
    .filter((x) => x.score >= 0)
    .sort((a, b) => b.score - a.score);

  return ranked.length ? ranked[0].item : filtered[0];
}

function buildAffixPreviewHtml(item) {
  return `
    <div class="affix-preview-type">${escapeHtml(getAffixTypeText(item.type))}</div>
    <div class="affix-preview-word">${escapeHtml(item.affix)}</div>
    <div class="affix-preview-section"><strong>意思：</strong>${escapeHtml(item.meaning || "")}</div>
    ${item.note ? `<div class="affix-preview-section"><strong>记忆提示：</strong>${escapeHtml(item.note)}</div>` : ""}
    ${(item.examples || []).length ? `<div class="affix-preview-section"><strong>例词：</strong>${escapeHtml(item.examples.join(" / "))}</div>` : ""}
    <div class="affix-preview-actions">
      <button class="secondary" type="button" onclick="closeAffixPreview()">返回上一级</button>
    </div>
  `;
}

function openAffixPreviewById(id) {
  const item = affixItems.find((x) => x.id === id);
  if (!item) return;

  const modal = document.getElementById("affixPreviewModal");
  const content = document.getElementById("affixPreviewContent");
  if (!modal || !content) return;

  state.affixPreviewId = id;
  content.innerHTML = buildAffixPreviewHtml(item);
  modal.classList.remove("hidden");
}

function closeAffixPreview() {
  const modal = document.getElementById("affixPreviewModal");
  if (modal) modal.classList.add("hidden");
  state.affixPreviewId = null;
}

function openAffixSearchPreview() {
  const keyword = getAffixSearchKeyword();
  if (!keyword) {
    alert("请先输入要搜索的词根词缀");
    return;
  }

  const bestMatch = findBestAffixMatch(keyword);
  if (!bestMatch) {
    alert("没有搜到对应的词根词缀");
    return;
  }

  state.affixLastAutoOpenedKeyword = keyword;
  openAffixPreviewById(bestMatch.id);
}

function handleAffixSearchInput() {
  renderAffixes();

  const keyword = getAffixSearchKeyword();
  if (!keyword || keyword.length < 2) return;
  if (state.affixLastAutoOpenedKeyword === keyword) return;

  const bestMatch = findBestAffixMatch(keyword);
  if (!bestMatch) return;

  const bestScore = scoreAffixMatch(bestMatch, keyword);
  if (bestScore >= 80) {
    state.affixLastAutoOpenedKeyword = keyword;
    openAffixPreviewById(bestMatch.id);
  }
}

function handleAffixSearchKeydown(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    openAffixSearchPreview();
  }
}

function renderAffixes() {
  const container = document.getElementById("affixContent");
  const countText = document.getElementById("affixCountText");

  if (!container) return;

  const keyword = getAffixSearchKeyword();
  const filtered = getFilteredAffixItems(keyword);

  if (countText) {
    countText.textContent = `${filtered.length} 条`;
  }

  if (!filtered.length) {
    container.innerHTML = `<div class="muted small">没有搜到对应内容，可以试试输入：dict / 否定 / pre / tion</div>`;
    return;
  }

  container.innerHTML = `
    <div class="affix-scroll-box">
      ${filtered
        .map((item) => `
          <div class="word-item">
            <div style="display:flex; justify-content:space-between; gap:12px; align-items:flex-start;">
              <div style="flex:1; min-width:0;">
                <div><strong>${escapeHtml(item.affix)}</strong></div>
                <div class="small muted" style="margin-top:6px;">${escapeHtml(getAffixTypeText(item.type))}</div>
              </div>
              <div class="list-actions">
                <button class="blue" onclick="openAffixPreviewById('${item.id}')">查看</button>
                <button class="secondary" onclick="editAffixItem('${item.id}')">编辑</button>
                <button class="danger" onclick="deleteAffixItem('${item.id}')">删除</button>
              </div>
            </div>

            <div class="muted" style="margin-top:10px;">意思：${escapeHtml(item.meaning)}</div>
            ${item.note ? `<div class="small muted" style="margin-top:6px;">记忆提示：${escapeHtml(item.note)}</div>` : ""}
            ${(item.examples || []).length ? `<div class="small muted" style="margin-top:6px;">例词：${escapeHtml(item.examples.join(" / "))}</div>` : ""}
          </div>
        `)
        .join("")}
    </div>
  `;
}

/* =========================
   页面切换
========================= */

function goToPage(page) {
  state.currentPage = page;

  document.querySelectorAll(".page").forEach((el) => el.classList.remove("active"));
  const pageEl = document.getElementById(`page-${page}`);
  if (pageEl) pageEl.classList.add("active");

  if (page === "review") {
    document.body.classList.add("review-mode");
    state.reviewStage = "books";
    state.reviewBookId = null;
    state.reviewListId = null;
    state.currentReviewWordId = null;
    state.reviewInitialWordTotal = 0;
    state.currentReviewHadForget = false;
    state.reviewQueue = [];
    renderReviewPage();
  } else {
    document.body.classList.remove("review-mode");
  }

  if (page === "affixes") {
    renderAffixes();
    resetAffixForm();
    setTimeout(() => {
      const input = document.getElementById("affixSearchInput");
      if (input) input.focus();
    }, 0);
  }

  if (page === "home") {
    scrollToAddWordSection();
  }
}

/* =========================
   全部单词 / 搜索 / 预览
========================= */

function switchLibraryView(view) {
  state.libraryView = view;
  if (view === "books") {
    state.libraryBookId = null;
    state.libraryListId = null;
  }
  renderLibrary();
}

function enterBook(bookId) {
  state.libraryView = "lists";
  state.libraryBookId = bookId;
  state.libraryListId = null;
  renderLibrary();
}

function enterList(listId) {
  state.libraryView = "words";
  state.libraryListId = listId;
  renderLibrary();
}

function backLibrary() {
  if (state.libraryView === "words") {
    state.libraryView = "lists";
    state.libraryListId = null;
  } else if (state.libraryView === "lists") {
    state.libraryView = "books";
    state.libraryBookId = null;
  }
  renderLibrary();
}

function getSearchKeyword() {
  const input = document.getElementById("searchInput");
  return (input ? input.value : "").trim().toLowerCase();
}

function scoreWordMatch(word, keyword) {
  const k = String(keyword || "").trim().toLowerCase();
  if (!k) return -1;

  const wordText = String(word.word || "").toLowerCase();
  const meaning = String(word.meaning || "").toLowerCase();
  const example = String(word.example || "").toLowerCase();
  const note = String(word.note || "").toLowerCase();

  if (wordText === k) return 100;
  if (wordText.startsWith(k)) return 90;
  if (wordText.includes(k)) return 80;
  if (meaning.includes(k)) return 70;
  if (note.includes(k)) return 60;
  if (example.includes(k)) return 50;
  return -1;
}

function getAllSearchableWords(keyword = "") {
  const k = String(keyword || "").trim().toLowerCase();
  return [...state.words]
    .filter((word) => {
      const text = [word.word, word.meaning, word.example, word.note].join(" ").toLowerCase();
      return !k || text.includes(k);
    })
    .sort((a, b) => {
      const scoreDiff = scoreWordMatch(b, k) - scoreWordMatch(a, k);
      if (scoreDiff !== 0) return scoreDiff;
      return String(a.word || "").localeCompare(String(b.word || ""), "en");
    });
}

function findBestLibraryWordMatch(keyword) {
  const filtered = getAllSearchableWords(keyword);
  if (!filtered.length) return null;
  const ranked = filtered
    .map((item) => ({ item, score: scoreWordMatch(item, keyword) }))
    .filter((x) => x.score >= 0)
    .sort((a, b) => b.score - a.score);
  return ranked.length ? ranked[0].item : filtered[0];
}

function buildWordPreviewHtml(word) {
  const list = getListById(word.listId);
  const book = list ? getBookById(list.bookId) : null;

  return `
    <div class="affix-preview-type">单词详情</div>
    <div class="affix-preview-word">${escapeHtml(word.word)}</div>
    <div class="affix-preview-section"><strong>释义：</strong>${escapeHtml(word.meaning || "")}</div>
    ${word.example ? `<div class="affix-preview-section"><strong>例句：</strong>${escapeHtml(word.example)}</div>` : ""}
    ${word.note ? `<div class="affix-preview-section"><strong>备注：</strong>${escapeHtml(word.note)}</div>` : ""}
    ${book ? `<div class="affix-preview-section"><strong>所属词书：</strong>${escapeHtml(book.name)}</div>` : ""}
    ${list ? `<div class="affix-preview-section"><strong>所属 list：</strong>${escapeHtml(list.name)}</div>` : ""}
    <div class="affix-preview-actions" style="display:flex; gap:10px; flex-wrap:wrap;">
      <button class="secondary" type="button" onclick="speakWord('${escapeHtml(word.word).replace(/&#39;/g, "\\'")}')">发音</button>
      <button class="secondary" type="button" onclick="closeWordPreview()">返回上一级</button>
    </div>
  `;
}

function openWordPreviewById(wordId) {
  const word = state.words.find((x) => x.id === wordId);
  if (!word) return;

  const modal = document.getElementById("wordPreviewModal");
  const content = document.getElementById("wordPreviewContent");
  if (!modal || !content) return;

  state.wordPreviewId = wordId;
  content.innerHTML = buildWordPreviewHtml(word);
  modal.classList.remove("hidden");
}

function closeWordPreview() {
  const modal = document.getElementById("wordPreviewModal");
  if (modal) modal.classList.add("hidden");
  state.wordPreviewId = null;
}

function openLibrarySearchPreview() {
  const keyword = getSearchKeyword();
  if (!keyword) {
    alert("请先输入要搜索的单词");
    return;
  }

  const bestMatch = findBestLibraryWordMatch(keyword);
  if (!bestMatch) {
    alert("没有搜到对应的单词");
    return;
  }

  state.libraryLastAutoOpenedKeyword = keyword;
  openWordPreviewById(bestMatch.id);
}

function handleLibrarySearchInput() {
  renderLibrary();

  const keyword = getSearchKeyword();
  if (!keyword || keyword.length < 2) return;
  if (state.libraryLastAutoOpenedKeyword === keyword) return;

  const bestMatch = findBestLibraryWordMatch(keyword);
  if (!bestMatch) return;

  const bestScore = scoreWordMatch(bestMatch, keyword);
  if (bestScore >= 80) {
    state.libraryLastAutoOpenedKeyword = keyword;
    openWordPreviewById(bestMatch.id);
  }
}

function handleLibrarySearchKeydown(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    openLibrarySearchPreview();
  }
}

function renderLibrary() {
  const content = document.getElementById("libraryContent");
  const searchKeyword = getSearchKeyword();
  if (!content) return;

  if (state.libraryView === "books") {
    const books = state.books
      .filter((book) => {
        if (!searchKeyword) return true;
        const words = getWordsByBookId(book.id);
        const matchBookName = String(book.name || "").toLowerCase().includes(searchKeyword);
        const matchWords = words.some((w) =>
          [w.word, w.meaning, w.example, w.note].join(" ").toLowerCase().includes(searchKeyword)
        );
        return matchBookName || matchWords;
      });

    if (!books.length) {
      content.innerHTML = `<div class="muted">没有找到词书</div>`;
      return;
    }

    content.innerHTML = books.map((book) => {
      const bookWords = getWordsByBookId(book.id);
      const bookLists = getListsByBookId(book.id);
      return `
        <div class="word-item">
          <div style="display:flex; justify-content:space-between; gap:12px; align-items:center;">
            <div style="flex:1; min-width:0;">
              <div><strong>${escapeHtml(book.name)}</strong></div>
              <div class="small muted" style="margin-top:6px;">${bookLists.length} 个 list，${bookWords.length} 个单词</div>
            </div>
            <div class="list-actions">
              <button class="blue" onclick="enterBook('${book.id}')">进入</button>
              <button class="secondary" onclick="setCurrentBook('${book.id}')">设为当前</button>
              ${book.name === WRONG_BOOK_NAME ? "" : `<button class="danger" onclick="deleteBook('${book.id}')">删除</button>`}
            </div>
          </div>
        </div>
      `;
    }).join("");

    return;
  }

  if (state.libraryView === "lists") {
    const book = getBookById(state.libraryBookId);
    if (!book) {
      content.innerHTML = `<div class="muted">词书不存在</div>`;
      return;
    }

    const lists = getListsByBookId(book.id)
      .filter((list) => {
        if (!searchKeyword) return true;
        const words = getWordsByListId(list.id);
        return (
          String(list.name || "").toLowerCase().includes(searchKeyword) ||
          words.some((w) => [w.word, w.meaning, w.example, w.note].join(" ").toLowerCase().includes(searchKeyword))
        );
      })
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));

    content.innerHTML = `
      <div style="margin-bottom:12px;">
        <button class="secondary" onclick="backLibrary()">← 返回词书</button>
      </div>
      ${lists.length ? lists.map((list) => {
        const words = getWordsByListId(list.id);
        return `
          <div class="word-item">
            <div style="display:flex; justify-content:space-between; gap:12px; align-items:center;">
              <div style="flex:1; min-width:0;">
                <div><strong>${escapeHtml(list.name)}</strong></div>
                <div class="small muted" style="margin-top:6px;">${words.length} 个单词</div>
              </div>
              <div class="list-actions">
                <button class="blue" onclick="enterList('${list.id}')">进入</button>
                <button class="secondary" onclick="resetListReview('${list.id}')">重置复习</button>
                <button class="danger" onclick="deleteList('${list.id}')">删除</button>
              </div>
            </div>
          </div>
        `;
      }).join("") : `<div class="muted">没有找到 list</div>`}
    `;

    return;
  }

  if (state.libraryView === "words") {
    const list = getListById(state.libraryListId);
    if (!list) {
      content.innerHTML = `<div class="muted">list 不存在</div>`;
      return;
    }

    const words = getWordsByListId(list.id)
      .filter((w) => {
        if (!searchKeyword) return true;
        return [w.word, w.meaning, w.example, w.note].join(" ").toLowerCase().includes(searchKeyword);
      })
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));

    content.innerHTML = `
      <div style="margin-bottom:12px; display:flex; gap:10px; flex-wrap:wrap;">
        <button class="secondary" onclick="backLibrary()">← 返回 lists</button>
        <button class="secondary" onclick="resetListReview('${list.id}')">重置本 list 复习</button>
      </div>
      ${words.length ? words.map((w) => `
        <div class="word-item">
          <div style="display:flex; justify-content:space-between; gap:12px; align-items:flex-start;">
            <div style="flex:1; min-width:0;">
              <div style="font-weight:700; font-size:18px;">${escapeHtml(w.word)}</div>
              <div class="muted" style="margin-top:8px;">${escapeHtml(w.meaning)}</div>
              ${w.example ? `<div class="small muted" style="margin-top:6px;">例句：${escapeHtml(w.example)}</div>` : ""}
              ${w.note ? `<div class="small muted" style="margin-top:6px;">备注：${escapeHtml(w.note)}</div>` : ""}
            </div>
            <div class="list-actions">
              <button class="blue" onclick="openWordPreviewById('${w.id}')">查看</button>
              <button class="secondary" onclick="speakWord('${escapeHtml(w.word).replace(/&#39;/g, "\\'")}')">发音</button>
              <button class="secondary" onclick="editWord('${w.id}')">编辑</button>
              <button class="danger" onclick="deleteWord('${w.id}')">删除</button>
            </div>
          </div>
        </div>
      `).join("") : `<div class="muted">没有找到单词</div>`}
    `;
  }
}

/* =========================
   复习流程
========================= */

function renderReviewPage() {
  const container = document.getElementById("reviewContent");
  if (!container) return;

  if (state.reviewStage === "books") {
    renderReviewBooks(container);
    return;
  }

  if (state.reviewStage === "lists") {
    renderReviewLists(container);
    return;
  }

  if (state.reviewStage === "reviewing") {
    renderReviewing(container);
  }
}

function enterReviewBook(bookId) {
  state.reviewStage = "lists";
  state.reviewBookId = bookId;
  state.reviewListId = null;
  renderReviewPage();
}

function backReviewLevel() {
  if (state.reviewStage === "lists") {
    state.reviewStage = "books";
    state.reviewBookId = null;
  } else if (state.reviewStage === "reviewing") {
    state.reviewStage = "lists";
    state.reviewListId = null;
    state.currentReviewWordId = null;
    state.reviewQueue = [];
  }
  renderReviewPage();
}

function renderReviewBooks(container) {
  const books = state.books.map((book) => {
    const lists = getListsByBookId(book.id);
    const now = Date.now();
    const dueCount = lists.filter((l) => new Date(l.nextReviewAt).getTime() <= now).length;
    return { book, dueCount, totalLists: lists.length };
  });

  container.innerHTML = `
    <div class="page-title">选择要复习的词书</div>
    ${books.map(({ book, dueCount, totalLists }) => `
      <div class="word-item">
        <div style="display:flex; justify-content:space-between; gap:12px; align-items:center;">
          <div>
            <div><strong>${escapeHtml(book.name)}</strong></div>
            <div class="small muted" style="margin-top:6px;">共 ${totalLists} 个 list，待复习 ${dueCount} 个</div>
          </div>
          <div class="list-actions">
            <button class="blue" onclick="enterReviewBook('${book.id}')">进入</button>
          </div>
        </div>
      </div>
    `).join("")}
  `;
}

function renderReviewLists(container) {
  const book = getBookById(state.reviewBookId);
  if (!book) {
    container.innerHTML = `<div class="muted">词书不存在</div>`;
    return;
  }

  const now = Date.now();
  const lists = getListsByBookId(book.id)
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
    .map((list) => ({
      list,
      due: new Date(list.nextReviewAt).getTime() <= now,
      wordCount: getWordsByListId(list.id).length,
    }));

  container.innerHTML = `
    <div style="margin-bottom:12px;"><button class="secondary" onclick="backReviewLevel()">← 返回词书</button></div>
    <div class="page-title">${escapeHtml(book.name)}：选择要复习的词表</div>
    ${lists.map(({ list, due, wordCount }) => `
      <div class="word-item">
        <div style="display:flex; justify-content:space-between; gap:12px; align-items:center;">
          <div>
            <div><strong>${escapeHtml(list.name)}</strong></div>
            <div class="small muted" style="margin-top:6px;">${wordCount} 个单词｜${due ? "现在可复习" : `下次复习：${new Date(list.nextReviewAt).toLocaleString()}`}</div>
          </div>
          <div class="list-actions">
            <button class="blue" onclick="startReviewList('${list.id}')">开始</button>
          </div>
        </div>
      </div>
    `).join("")}
  `;
}

function startReviewList(listId) {
  const list = getListById(listId);
  if (!list) return;

  const words = getWordsByListId(listId);
  if (!words.length) {
    alert("这个 list 里还没有单词");
    return;
  }

  state.reviewStage = "reviewing";
  state.reviewListId = listId;
  state.reviewQueue = [...words].sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)));
  state.currentReviewWordId = state.reviewQueue[0].id;
  state.showAnswer = false;
  state.reviewInitialWordTotal = words.length;
  state.currentReviewHadForget = false;
  renderReviewPage();
}

function getCurrentReviewWord() {
  return state.words.find((w) => w.id === state.currentReviewWordId) || null;
}

function showCurrentAnswer() {
  state.showAnswer = true;
  renderReviewPage();
}

function handleReviewAction(forgot) {
  const current = getCurrentReviewWord();
  if (!current) return;

  state.words = state.words.map((w) =>
    w.id === current.id
      ? {
          ...w,
          reviewCount: forgot ? w.reviewCount : (w.reviewCount || 0) + 1,
          lapseCount: forgot ? (w.lapseCount || 0) + 1 : (w.lapseCount || 0),
          updatedAt: nowISO(),
        }
      : w
  );

  if (forgot) {
    addToWrongBook(current);
    state.currentReviewHadForget = true;
  }

  state.reviewQueue = state.reviewQueue.filter((w) => w.id !== current.id);

  if (!state.reviewQueue.length) {
    finishReviewList();
    return;
  }

  state.currentReviewWordId = state.reviewQueue[0].id;
  state.showAnswer = false;
  renderReviewPage();
}

function finishReviewList() {
  const list = getListById(state.reviewListId);
  if (!list) return;

  const nextStage = Math.min((list.reviewStage || 0) + 1, REVIEW_STEPS_DAYS.length - 1);
  const days = REVIEW_STEPS_DAYS[nextStage] || REVIEW_STEPS_DAYS[REVIEW_STEPS_DAYS.length - 1];

  state.lists = state.lists.map((l) =>
    l.id === list.id
      ? {
          ...l,
          reviewStage: nextStage,
          lastReviewedAt: nowISO(),
          nextReviewAt: addDaysISO(days),
        }
      : l
  );

  saveData();

  const hadForget = state.currentReviewHadForget;
  state.reviewQueue = [];
  state.currentReviewWordId = null;
  state.reviewStage = "lists";
  state.currentReviewHadForget = false;
  renderReviewPage();

  alert(hadForget ? "本轮复习完成，遗忘的单词已加入错词本" : "本轮复习完成");
}

function renderReviewing(container) {
  const word = getCurrentReviewWord();
  const list = getListById(state.reviewListId);

  if (!word || !list) {
    container.innerHTML = `<div class="muted">复习数据不存在</div>`;
    return;
  }

  const progressDone = state.reviewInitialWordTotal - state.reviewQueue.length + 1;

  container.innerHTML = `
    <div style="margin-bottom:12px; display:flex; justify-content:space-between; gap:12px; align-items:center;">
      <button class="secondary" onclick="backReviewLevel()">← 返回</button>
      <div class="small muted">${escapeHtml(list.name)}｜进度 ${progressDone}/${state.reviewInitialWordTotal}</div>
    </div>

    <div class="review-card">
      <div class="review-word">${escapeHtml(word.word)}</div>
      <div class="review-answer ${state.showAnswer ? "" : "hidden"}">
        <div><strong>释义：</strong>${escapeHtml(word.meaning || "")}</div>
        ${word.example ? `<div style="margin-top:10px;"><strong>例句：</strong>${escapeHtml(word.example)}</div>` : ""}
        ${word.note ? `<div style="margin-top:10px;"><strong>备注：</strong>${escapeHtml(word.note)}</div>` : ""}
      </div>

      <div class="review-actions">
        <button class="secondary" onclick="speakWord('${escapeHtml(word.word).replace(/&#39;/g, "\\'")}')">发音</button>
        ${state.showAnswer
          ? `
            <button class="danger" onclick="handleReviewAction(true)">忘记了（2）</button>
            <button class="blue" onclick="handleReviewAction(false)">记住了（1）</button>
          `
          : `<button class="blue" onclick="showCurrentAnswer()">显示答案（空格）</button>`}
      </div>
    </div>
  `;
}

function addToWrongBook(word) {
  const wrongBook = state.books.find((b) => b.name === WRONG_BOOK_NAME);
  if (!wrongBook) return;

  let wrongList = state.lists.find((l) => l.bookId === wrongBook.id);
  if (!wrongList) {
    wrongList = {
      id: uid("list"),
      bookId: wrongBook.id,
      name: "全部错词",
      dateKey: "wrong-all",
      createdAt: nowISO(),
      reviewStage: 0,
      nextReviewAt: nowISO(),
      lastReviewedAt: null,
    };
    state.lists.push(wrongList);
  }

  const exists = state.words.some(
    (w) =>
      w.listId === wrongList.id &&
      String(w.word || "").toLowerCase() === String(word.word || "").toLowerCase() &&
      String(w.meaning || "") === String(word.meaning || "")
  );
  if (exists) return;

  state.words.unshift({
    id: uid("word"),
    listId: wrongList.id,
    word: word.word,
    meaning: word.meaning,
    example: word.example || "",
    note: word.note || "",
    reviewCount: 0,
    lapseCount: 0,
    createdAt: nowISO(),
    updatedAt: nowISO(),
  });
}

/* =========================
   批量导入 / 导出
========================= */

function importBatchWords() {
  const currentBook = getCurrentBook();
  if (!currentBook) {
    alert("请先创建或选择词书");
    return;
  }

  const text = document.getElementById("batchInput").value.trim();

  if (!text) {
    alert("请先粘贴要导入的内容");
    return;
  }

  const targetList = ensureTodayList(currentBook.id);
  const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);

  let successCount = 0;
  const now = nowISO();

  for (const line of lines) {
    const parts = line.split("|").map((part) => part.trim());
    const word = parts[0] || "";
    const meaning = parts[1] || "";
    const example = parts[2] || "";
    const note = parts[3] || "";

    if (!word || !meaning) continue;

    state.words.push({
      id: uid("word"),
      listId: targetList.id,
      word,
      meaning,
      example,
      note,
      reviewCount: 0,
      lapseCount: 0,
      createdAt: now,
      updatedAt: now,
    });

    successCount++;
  }

  if (successCount === 0) {
    alert("没有成功导入任何单词，请检查格式");
    return;
  }

  document.getElementById("batchInput").value = "";
  saveData();
  renderApp();
  alert(`成功导入 ${successCount} 个单词到 ${targetList.name}`);
}

function clearBatchInput() {
  document.getElementById("batchInput").value = "";
}

function triggerImport() {
  document.getElementById("importFile").click();
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function () {
    try {
      const data = JSON.parse(reader.result);

      if (!Array.isArray(data.books) || !Array.isArray(data.lists) || !Array.isArray(data.words)) {
        alert("备份文件格式不对");
        return;
      }

      state.books = data.books;
      state.lists = data.lists;
      state.words = data.words;
      state.currentBookId = data.currentBookId || (state.books[0] ? state.books[0].id : null);

      if (Array.isArray(data.affixes)) {
        affixItems = data.affixes.map((item) => ({
          id: item.id || uid("affix"),
          type: item.type || "root",
          affix: item.affix || "",
          meaning: item.meaning || "",
          note: item.note || "",
          examples: Array.isArray(item.examples) ? item.examples : normalizeExamplesInput(item.examples || "")
        }));
        saveAffixes();
      }

      saveData();
      renderApp();
      alert("导入成功");
    } catch {
      alert("导入失败，JSON 文件有问题");
    }
  };
  reader.readAsText(file, "utf-8");
}

function exportData() {
  const blob = new Blob(
    [JSON.stringify({
      books: state.books,
      lists: state.lists,
      words: state.words,
      currentBookId: state.currentBookId,
      affixes: affixItems
    }, null, 2)],
    { type: "application/json" }
  );
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "vocab-book-list-word-backup.json";
  a.click();
  URL.revokeObjectURL(url);
}

/* =========================
   编辑单词 / 删除
========================= */

function speakEditWord() {
  speakWord(document.getElementById("editWordInput").value.trim());
}

function editWord(wordId) {
  const target = state.words.find((w) => w.id === wordId);
  if (!target) return;

  state.editingWordId = wordId;
  document.getElementById("editWordInput").value = target.word || "";
  document.getElementById("editMeaningInput").value = target.meaning || "";
  document.getElementById("editExampleInput").value = target.example || "";
  document.getElementById("editNoteInput").value = target.note || "";
  document.getElementById("editWordModal").classList.remove("hidden");
  document.getElementById("editWordInput").focus();
}

function closeEditModal() {
  document.getElementById("editWordModal").classList.add("hidden");
  state.editingWordId = null;
}

function saveEditedWord() {
  if (!state.editingWordId) return;

  const newWord = document.getElementById("editWordInput").value.trim();
  const newMeaning = document.getElementById("editMeaningInput").value.trim();
  const newExample = document.getElementById("editExampleInput").value.trim();
  const newNote = document.getElementById("editNoteInput").value.trim();

  if (!newWord || !newMeaning) {
    alert("单词和释义不能为空");
    return;
  }

  const now = nowISO();

  state.words = state.words.map((w) =>
    w.id === state.editingWordId
      ? {
          ...w,
          word: newWord,
          meaning: newMeaning,
          example: newExample,
          note: newNote,
          updatedAt: now,
        }
      : w
  );

  saveData();
  closeEditModal();
  renderApp();
}

function requestDelete(type, id, text) {
  state.pendingDelete = { type, id };
  document.getElementById("deleteConfirmText").textContent = text;
  document.getElementById("deleteConfirmModal").classList.remove("hidden");
}

function closeDeleteModal() {
  document.getElementById("deleteConfirmModal").classList.add("hidden");
  state.pendingDelete = null;
}

function confirmDeleteEntity() {
  if (!state.pendingDelete) return;

  const { type, id } = state.pendingDelete;

  if (type === "word") {
    state.words = state.words.filter((w) => w.id !== id);
  }

  if (type === "list") {
    state.words = state.words.filter((w) => w.listId !== id);
    state.lists = state.lists.filter((l) => l.id !== id);
    if (state.libraryListId === id) state.libraryListId = null;
    if (state.reviewListId === id) state.reviewListId = null;
  }

  if (type === "book") {
    const targetLists = state.lists.filter((l) => l.bookId === id).map((l) => l.id);
    state.words = state.words.filter((w) => !targetLists.includes(w.listId));
    state.lists = state.lists.filter((l) => l.bookId !== id);
    state.books = state.books.filter((b) => b.id !== id);

    if (state.currentBookId === id) {
      state.currentBookId = state.books[0] ? state.books[0].id : null;
    }

    if (state.libraryBookId === id) state.libraryBookId = null;
    if (state.reviewBookId === id) state.reviewBookId = null;
  }

  saveData();
  closeDeleteModal();
  renderApp();
}

function deleteWord(wordId) {
  requestDelete("word", wordId, "确定要删除这个单词吗？删除后将无法恢复。");
}

function deleteList(listId) {
  const list = getListById(listId);
  if (!list) return;
  requestDelete(
    "list",
    listId,
    `确定要删除 list「${list.name}」吗？这个 list 里的单词也会一起删除。`
  );
}

function deleteBook(bookId) {
  const book = getBookById(bookId);
  if (!book) return;

  if (book.name === WRONG_BOOK_NAME) {
    alert("错词本是系统词书，不能直接删除。你可以进入错词本删除里面误加的单词。");
    return;
  }

  requestDelete(
    "book",
    bookId,
    `确定要删除词书「${book.name}」吗？里面的所有 list 和单词都会一起删除。`
  );
}

function resetListReview(listId) {
  state.lists = state.lists.map((l) =>
    l.id === listId
      ? {
          ...l,
          reviewStage: 0,
          nextReviewAt: nowISO(),
          lastReviewedAt: null,
        }
      : l
  );
  saveData();
  renderApp();
}

function clearAllReviewRecords() {
  if (!confirm("确定要清除所有 list 的复习进度吗？")) return;

  state.lists = state.lists.map((l) => ({
    ...l,
    reviewStage: 0,
    nextReviewAt: nowISO(),
    lastReviewedAt: null,
  }));

  state.words = state.words.map((w) => ({
    ...w,
    reviewCount: 0,
    lapseCount: 0,
  }));

  saveData();
  renderApp();
}


function bindLibrarySearchEvents() {
  const input = document.getElementById("searchInput");
  if (!input || input.dataset.popupBound === "1") return;

  input.addEventListener("input", handleLibrarySearchInput);
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      openLibrarySearchPreview();
    }
  });

  input.dataset.popupBound = "1";
}

function bindAffixSearchEvents() {
  const input = document.getElementById("affixSearchInput");
  if (!input || input.dataset.popupBound === "1") return;

  input.addEventListener("input", handleAffixSearchInput);
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      openAffixSearchPreview();
    }
  });

  input.dataset.popupBound = "1";
}

function renderApp() {
  bindLibrarySearchEvents();
  bindAffixSearchEvents();
  renderHomeStats();
  renderCurrentBookPanel();
  renderLibrary();

  if (state.currentPage === "review") {
    renderReviewPage();
  }

  if (state.currentPage === "affixes") {
    renderAffixes();
  }

  bindVoiceControls();
}

document.getElementById("importFile").addEventListener("change", importData);

document.addEventListener("keydown", (e) => {
  const editModal = document.getElementById("editWordModal");
  const deleteModal = document.getElementById("deleteConfirmModal");

  if (e.key === "Escape") {
    if (!editModal.classList.contains("hidden")) {
      closeEditModal();
      return;
    }
    if (!deleteModal.classList.contains("hidden")) {
      closeDeleteModal();
      return;
    }
    const affixPreviewModal = document.getElementById("affixPreviewModal");
    if (affixPreviewModal && !affixPreviewModal.classList.contains("hidden")) {
      closeAffixPreview();
      return;
    }
    const wordPreviewModal = document.getElementById("wordPreviewModal");
    if (wordPreviewModal && !wordPreviewModal.classList.contains("hidden")) {
      closeWordPreview();
      return;
    }
  }

  if (state.currentPage !== "review" || state.reviewStage !== "reviewing") return;

  const activeTag = document.activeElement ? document.activeElement.tagName : "";
  const isTyping = activeTag === "INPUT" || activeTag === "TEXTAREA" || activeTag === "SELECT";
  if (isTyping) return;

  if (e.key === "Escape") {
    goToPage("home");
  } else if (e.key === " " || e.code === "Space") {
    e.preventDefault();
    showCurrentAnswer();
  } else if (e.key === "1") {
    handleReviewAction(false);
  } else if (e.key === "2") {
    handleReviewAction(true);
  }
});

(function init() {
  const data = loadData();
  state.books = data.books || [];
  state.lists = data.lists || [];
  state.words = data.words || [];
  state.currentBookId = data.currentBookId || (state.books[0] ? state.books[0].id : null);

  affixItems = loadAffixes();

  ensureWrongBook();
  saveData();
  renderApp();
  resetAffixForm();
})();
