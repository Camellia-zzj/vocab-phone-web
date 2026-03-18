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
};


/* =========================
   发音：词典音频优先，系统发音兜底
========================= */

const WORD_AUDIO_CACHE = new Map();
let currentAudio = null;

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
  utter.lang = "en-US";
  utter.rate = 0.95;
  utter.pitch = 1;
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
   手机连续录词优化：保存后回到输入区并重新弹出键盘
========================= */

function focusWordInputAfterSave() {
  const wordInput = document.getElementById("wordInput");
  if (!wordInput) return;

  setTimeout(() => {
    try {
      wordInput.scrollIntoView({
        behavior: "auto",
        block: "center"
      });
    } catch {}
  }, 60);

  setTimeout(() => {
    try {
      wordInput.focus({ preventScroll: true });
    } catch {
      wordInput.focus();
    }

    try {
      const len = wordInput.value.length;
      wordInput.setSelectionRange(len, len);
    } catch {}
  }, 180);
}

function goToPage(page) {
  state.currentPage = page;

  document.querySelectorAll(".page").forEach((el) => el.classList.remove("active"));
  document.getElementById(`page-${page}`).classList.add("active");

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
  }

  renderApp();
  window.scrollTo(0, 0);
}

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
      return `<option value="${book.id}" ${book.id === state.currentBookId ? "selected" : ""}>${book.name}${suffix}</option>`;
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
      currentBookId: state.currentBookId
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

  ensureWrongBook();
  saveData();
  renderApp();
})();