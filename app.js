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
  { id: "affix_72", type: "suffix", affix: "-y", meaning: "有……的", note: "形容词后缀", examples: ["rainy", "windy", "sunny"] },
  { id: "affix_73", type: "suffix", affix: "-ly", meaning: "……地", note: "副词后缀最常见", examples: ["quickly", "slowly", "carefully"] },
  { id: "affix_74", type: "suffix", affix: "-en", meaning: "使……；变得", note: "动词后缀", examples: ["widen", "strengthen"] },
  { id: "affix_75", type: "suffix", affix: "-ize / -ise", meaning: "使……化", note: "动词后缀", examples: ["realize", "organize", "modernize"] },
  { id: "affix_76", type: "suffix", affix: "-ify", meaning: "使……化", note: "动词后缀", examples: ["simplify", "beautify", "classify"] }
];

let affixItems = [];
const WORD_AUDIO_CACHE = new Map();
let currentAudio = null;
let availableVoices = [];

function escapeHtml(text) {
  return String(text == null ? "" : text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttr(text) {
  return escapeHtml(text).replace(/"/g, "&quot;");
}

function normalizeExamplesInput(text) {
  return String(text || "")
    .split("/")
    .map((item) => item.trim())
    .filter(Boolean);
}

function stringifyExamples(examples) {
  return Array.isArray(examples) ? examples.join(" / ") : "";
}

function loadAffixes() {
  const raw = localStorage.getItem(AFFIX_STORAGE_KEY);
  if (!raw) return DEFAULT_AFFIXES.map((item) => ({ ...item }));
  try {
    const data = JSON.parse(raw);
    if (!Array.isArray(data) || !data.length) {
      return DEFAULT_AFFIXES.map((item) => ({ ...item }));
    }
    return data.map((item) => ({
      id: item.id || uid("affix"),
      type: item.type || "root",
      affix: item.affix || "",
      meaning: item.meaning || "",
      note: item.note || "",
      examples: Array.isArray(item.examples) ? item.examples : normalizeExamplesInput(item.examples || "")
    }));
  } catch {
    return DEFAULT_AFFIXES.map((item) => ({ ...item }));
  }
}

function saveAffixes() {
  localStorage.setItem(AFFIX_STORAGE_KEY, JSON.stringify(affixItems));
}

function loadVoicePrefs() {
  try {
    return JSON.parse(localStorage.getItem(VOICE_PREFS_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveVoicePrefs() {
  const select = document.getElementById("voiceSelect");
  const rateRange = document.getElementById("voiceRateRange");
  const pitchRange = document.getElementById("voicePitchRange");

  const prefs = {
    voiceName: select ? select.value : "",
    rate: rateRange ? Number(rateRange.value) : 0.95,
    pitch: pitchRange ? Number(pitchRange.value) : 1
  };

  localStorage.setItem(VOICE_PREFS_KEY, JSON.stringify(prefs));
}

function applyVoicePrefsToUI() {
  const prefs = loadVoicePrefs();
  const rateRange = document.getElementById("voiceRateRange");
  const pitchRange = document.getElementById("voicePitchRange");
  const rateValue = document.getElementById("voiceRateValue");
  const pitchValue = document.getElementById("voicePitchValue");
  const select = document.getElementById("voiceSelect");

  if (rateRange) rateRange.value = prefs.rate || 0.95;
  if (pitchRange) pitchRange.value = prefs.pitch || 1;
  if (rateValue) rateValue.textContent = Number(rateRange ? rateRange.value : 0.95).toFixed(2);
  if (pitchValue) pitchValue.textContent = Number(pitchRange ? pitchRange.value : 1).toFixed(2);

  if (select && prefs.voiceName) {
    select.value = prefs.voiceName;
  }
}

function refreshVoiceOptions() {
  const select = document.getElementById("voiceSelect");
  const tip = document.getElementById("voiceTip");
  if (!select || !tip) return;

  availableVoices = speechSynthesis.getVoices() || [];

  const englishVoices = availableVoices.filter((voice) =>
    /^en/i.test(voice.lang || "") || /english/i.test(voice.name || "")
  );

  const list = englishVoices.length ? englishVoices : availableVoices;

  if (!list.length) {
    select.innerHTML = `<option value="">没有检测到可用语音</option>`;
    tip.textContent = "当前设备没有可用语音时，会优先走词典音频。";
    return;
  }

  const prefs = loadVoicePrefs();

  select.innerHTML = list
    .map((voice) => `<option value="${escapeAttr(voice.name)}">${escapeHtml(voice.name)} (${escapeHtml(voice.lang || "")})</option>`)
    .join("");

  if (prefs.voiceName && list.some((voice) => voice.name === prefs.voiceName)) {
    select.value = prefs.voiceName;
  }

  tip.textContent = "单词发音优先走词典音频；没有音频时，会使用这里选中的系统语音。";
  saveVoicePrefs();
}

function bindVoiceControls() {
  const select = document.getElementById("voiceSelect");
  const rateRange = document.getElementById("voiceRateRange");
  const pitchRange = document.getElementById("voicePitchRange");
  const rateValue = document.getElementById("voiceRateValue");
  const pitchValue = document.getElementById("voicePitchValue");
  const previewBtn = document.getElementById("voicePreviewBtn");

  if (!select || select.dataset.bound === "1") return;
  select.dataset.bound = "1";

  applyVoicePrefsToUI();
  refreshVoiceOptions();

  select.addEventListener("change", saveVoicePrefs);

  if (rateRange) {
    rateRange.addEventListener("input", () => {
      if (rateValue) rateValue.textContent = Number(rateRange.value).toFixed(2);
      saveVoicePrefs();
    });
  }

  if (pitchRange) {
    pitchRange.addEventListener("input", () => {
      if (pitchValue) pitchValue.textContent = Number(pitchRange.value).toFixed(2);
      saveVoicePrefs();
    });
  }

  if (previewBtn) {
    previewBtn.addEventListener("click", () => {
      speakBySystemVoice("example");
    });
  }

  if ("speechSynthesis" in window) {
    speechSynthesis.onvoiceschanged = refreshVoiceOptions;
    refreshVoiceOptions();
  }
}

function getSelectedVoice() {
  const select = document.getElementById("voiceSelect");
  const voiceName = select ? select.value : "";
  return availableVoices.find((voice) => voice.name === voiceName) || null;
}

/* =========================
   发音：词典音频优先，系统发音兜底
========================= */

function normalizeAudioUrl(url) {
  if (!url) return "";
  if (url.startsWith("//")) return "https:" + url;
  if (url.startsWith("http://")) return url.replace("http://", "https://");
  return url;
}

function stopCurrentAudio() {
  if (!currentAudio) return;
  try {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  } catch {}
  currentAudio = null;
}

function speakBySystemVoice(text) {
  if (!text || !("speechSynthesis" in window)) {
    alert("当前浏览器不支持发音功能");
    return;
  }

  try {
    window.speechSynthesis.cancel();
  } catch {}

  const utter = new SpeechSynthesisUtterance(text);
  const rateRange = document.getElementById("voiceRateRange");
  const pitchRange = document.getElementById("voicePitchRange");
  const selectedVoice = getSelectedVoice();

  utter.lang = selectedVoice ? selectedVoice.lang : "en-US";
  utter.voice = selectedVoice || null;
  utter.rate = rateRange ? Number(rateRange.value) : 0.95;
  utter.pitch = pitchRange ? Number(pitchRange.value) : 1;

  window.speechSynthesis.speak(utter);
}

async function getDictionaryAudioUrl(word) {
  const cleanWord = String(word || "").trim().toLowerCase();
  if (!cleanWord) return "";

  if (WORD_AUDIO_CACHE.has(cleanWord)) {
    return WORD_AUDIO_CACHE.get(cleanWord);
  }

  try {
    const res = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(cleanWord)}`
    );

    if (!res.ok) {
      WORD_AUDIO_CACHE.set(cleanWord, "");
      return "";
    }

    const data = await res.json();
    if (!Array.isArray(data) || !data.length) {
      WORD_AUDIO_CACHE.set(cleanWord, "");
      return "";
    }

    const candidates = [];

    for (const entry of data) {
      if (!entry || !Array.isArray(entry.phonetics)) continue;
      for (const p of entry.phonetics) {
        const audio = normalizeAudioUrl(p && p.audio ? p.audio : "");
        if (!audio) continue;
        candidates.push(audio);
      }
    }

    if (!candidates.length) {
      WORD_AUDIO_CACHE.set(cleanWord, "");
      return "";
    }

    const preferred =
      candidates.find((url) => /-us\.mp3|_us_|us\.mp3/i.test(url)) ||
      candidates.find((url) => /-uk\.mp3|_uk_|uk\.mp3/i.test(url)) ||
      candidates[0];

    WORD_AUDIO_CACHE.set(cleanWord, preferred || "");
    return preferred || "";
  } catch {
    WORD_AUDIO_CACHE.set(cleanWord, "");
    return "";
  }
}

async function playAudioUrl(url, fallbackText) {
  return new Promise((resolve) => {
    try {
      stopCurrentAudio();

      const audio = new Audio(url);
      currentAudio = audio;

      let settled = false;
      const finish = (ok) => {
        if (settled) return;
        settled = true;
        resolve(ok);
      };

      audio.onended = () => finish(true);
      audio.onerror = () => {
        stopCurrentAudio();
        if (fallbackText) speakBySystemVoice(fallbackText);
        finish(false);
      };

      const playPromise = audio.play();
      if (playPromise && typeof playPromise.then === "function") {
        playPromise
          .then(() => finish(true))
          .catch(() => {
            stopCurrentAudio();
            if (fallbackText) speakBySystemVoice(fallbackText);
            finish(false);
          });
      } else {
        finish(true);
      }
    } catch {
      stopCurrentAudio();
      if (fallbackText) speakBySystemVoice(fallbackText);
      resolve(false);
    }
  });
}

async function speakWord(text) {
  const word = String(text || "").trim();
  if (!word) return;

  try {
    window.speechSynthesis.cancel();
  } catch {}

  const audioUrl = await getDictionaryAudioUrl(word);
  if (audioUrl) {
    await playAudioUrl(audioUrl, word);
    return;
  }

  speakBySystemVoice(word);
}

/* =========================
   保存单词后把添加单词区域顶上来
========================= */

function focusWordInputAfterSave() {
  const wordInput = document.getElementById("wordInput");
  if (!wordInput) return;

  const addSection = wordInput.closest("section.card");
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

function renderAffixes() {
  const container = document.getElementById("affixContent");
  const searchInput = document.getElementById("affixSearchInput");
  const countText = document.getElementById("affixCountText");

  if (!container) return;

  const keyword = (searchInput ? searchInput.value : "").trim().toLowerCase();

  const filtered = affixItems.filter((item) => {
    const text = [
      item.type,
      item.affix,
      item.meaning,
      item.note,
      ...(item.examples || [])
    ].join(" ").toLowerCase();

    return !keyword || text.includes(keyword);
  });

  filtered.sort((a, b) => {
    const typeOrder = { prefix: 1, root: 2, suffix: 3 };
    const typeDiff = (typeOrder[a.type] || 99) - (typeOrder[b.type] || 99);
    if (typeDiff !== 0) return typeDiff;
    return String(a.affix).localeCompare(String(b.affix), "zh-CN");
  });

  if (countText) {
    countText.textContent = `${filtered.length} 条`;
  }

  if (!filtered.length) {
    container.innerHTML = `<div class="muted small">没有搜到对应内容，可以试试输入：dict / 否定 / pre / tion</div>`;
    return;
  }

  container.innerHTML = filtered
    .map((item) => `
      <div class="word-item">
        <div style="display:flex; justify-content:space-between; gap:12px; align-items:flex-start;">
          <div>
            <div><strong>${escapeHtml(item.affix)}</strong></div>
            <div class="small muted" style="margin-top:6px;">${escapeHtml(getAffixTypeText(item.type))}</div>
          </div>
          <div class="list-actions">
            <button class="secondary" onclick="editAffixItem('${item.id}')">编辑</button>
            <button class="danger" onclick="deleteAffixItem('${item.id}')">删除</button>
          </div>
        </div>

        <div class="muted" style="margin-top:10px;">意思：${escapeHtml(item.meaning)}</div>
        ${item.note ? `<div class="small muted" style="margin-top:6px;">记忆提示：${escapeHtml(item.note)}</div>` : ""}
        ${(item.examples || []).length ? `<div class="small muted" style="margin-top:6px;">例词：${escapeHtml(item.examples.join(" / "))}</div>` : ""}
      </div>
    `)
    .join("");
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
    state.showAnswer = false;
  } else {
    document.body.classList.remove("review-mode");
  }

  if (page === "library") {
    state.libraryView = "books";
    state.libraryBookId = null;
    state.libraryListId = null;
    const searchInput = document.getElementById("searchInput");
    if (searchInput) searchInput.value = "";
  }

  if (page === "affixes") {
    renderAffixes();
  }

  renderApp();
  window.scrollTo(0, 0);
}

/* =========================
   首页
========================= */

function renderHomeStats() {
  document.getElementById("bookCount").textContent = state.books.length;
  document.getElementById("listCount").textContent = state.lists.length;
  document.getElementById("wordCount").textContent = state.words.length;
  document.getElementById("dueListCount").textContent = getDueLists().length;
}

function renderCurrentBookPanel() {
  const select = document.getElementById("currentBookSelect");
  const summary = document.getElementById("currentBookSummary");
  if (!select) return;

  select.innerHTML = state.books
    .map((book) => {
      const suffix = book.name === "错词本" ? "（错词本）" : "";
      return `<option value="${book.id}" ${book.id === state.currentBookId ? "selected" : ""}>${escapeHtml(book.name)}${suffix}</option>`;
    })
    .join("");

  const currentBook = getCurrentBook();
  if (!currentBook) {
    summary.textContent = "当前没有词书";
    summary.className = "pill-note";
    return;
  }

  const bookLists = getListsByBookId(currentBook.id);
  const count = bookLists.reduce((sum, list) => sum + getWordsByListId(list.id).length, 0);

  summary.textContent = `当前词书：${currentBook.name} ｜ list 数：${bookLists.length} ｜ 单词数：${count}`;
  summary.className = currentBook.name === "错词本" ? "pill-note book-note-wrong" : "pill-note";
}

function createBook() {
  const input = document.getElementById("newBookNameInput");
  const name = input.value.trim();

  if (!name) {
    alert("请输入词书名称");
    return;
  }

  const newBook = {
    id: uid("book"),
    name,
    createdAt: nowISO(),
  };

  state.books.unshift(newBook);
  state.currentBookId = newBook.id;
  input.value = "";

  saveData();
  renderApp();
}

function changeCurrentBook(bookId) {
  state.currentBookId = bookId;
  saveData();
  renderApp();
}

function addWord() {
  const currentBook = getCurrentBook();
  if (!currentBook) {
    alert("请先创建词书");
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

  wordInput.value = "";
  meaningInput.value = "";
  exampleInput.value = "";
  noteInput.value = "";

  saveData();
  renderApp();
  focusWordInputAfterSave();
}

function batchAddWords() {
  const currentBook = getCurrentBook();
  if (!currentBook) {
    alert("请先创建词书");
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

  if (book.name === "错词本") {
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

function renderApp() {
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