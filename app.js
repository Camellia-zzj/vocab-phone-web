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

  speechSettings: getDefaultSpeechSettings(),
};

let deferredInstallPrompt = null;

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

  const word = document.getElementById("wordInput").value.trim();
  const meaning = document.getElementById("meaningInput").value.trim();
  const example = document.getElementById("exampleInput").value.trim();
  const note = document.getElementById("noteInput").value.trim();

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

  document.getElementById("wordInput").value = "";
  document.getElementById("meaningInput").value = "";
  document.getElementById("exampleInput").value = "";
  document.getElementById("noteInput").value = "";

  saveData();
  renderApp();
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
      state.speechSettings = data.speechSettings || getDefaultSpeechSettings();

      saveData();
      renderApp();
      renderSpeechSettings();
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
      speechSettings: state.speechSettings
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

function updateSpeechRangeLabels() {
  const rate = document.getElementById("rateRange");
  const pitch = document.getElementById("pitchRange");
  const rateValue = document.getElementById("rateValue");
  const pitchValue = document.getElementById("pitchValue");
  if (rate && rateValue) rateValue.textContent = Number(rate.value).toFixed(2);
  if (pitch && pitchValue) pitchValue.textContent = Number(pitch.value).toFixed(2);
}

function renderSpeechSettings() {
  const voiceSelect = document.getElementById("voiceSelect");
  const rateRange = document.getElementById("rateRange");
  const pitchRange = document.getElementById("pitchRange");
  if (!voiceSelect || !rateRange || !pitchRange) return;

  const voices = getAvailableVoices();
  const settings = getSpeechSettings();

  let options = `<option value="">自动选择更自然的英语音色</option>`;
  options += voices
    .map((voice) => {
      const selected = settings.voiceURI === voice.voiceURI ? "selected" : "";
      return `<option value="${voice.voiceURI}" ${selected}>${voice.name} ｜ ${voice.lang}</option>`;
    })
    .join("");

  voiceSelect.innerHTML = options;
  rateRange.value = settings.rate;
  pitchRange.value = settings.pitch;
  updateSpeechRangeLabels();
}

function saveSpeechSettingsFromUI() {
  const voiceSelect = document.getElementById("voiceSelect");
  const rateRange = document.getElementById("rateRange");
  const pitchRange = document.getElementById("pitchRange");
  if (!voiceSelect || !rateRange || !pitchRange) return;

  state.speechSettings = {
    voiceURI: voiceSelect.value || "",
    rate: Number(rateRange.value || 0.95),
    pitch: Number(pitchRange.value || 1.0),
    lang: "en-US"
  };

  saveData();
}

function previewCurrentVoice() {
  speakWord("abandon, precise, retain");
}

function setupSpeechVoices() {
  renderSpeechSettings();

  if ("speechSynthesis" in window) {
    window.speechSynthesis.onvoiceschanged = () => {
      const current = state.speechSettings?.voiceURI || "";
      const voices = getAvailableVoices();
      if (current && !voices.find(v => v.voiceURI === current)) {
        state.speechSettings.voiceURI = "";
        saveData();
      }
      renderSpeechSettings();
    };
  }
}

function renderInstallButton() {
  const btn = document.getElementById("installAppBtn");
  if (!btn) return;
  if (deferredInstallPrompt) {
    btn.classList.remove("hidden");
  } else {
    btn.classList.add("hidden");
  }
}

async function installPWA() {
  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    renderInstallButton();
    return;
  }

  alert("当前浏览器还没有给出安装入口。你也可以在 Chrome 菜单里找“安装应用”或“添加到主屏幕”。");
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {});
  });
}

function setupInstallPrompt() {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    renderInstallButton();
  });

  window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
    renderInstallButton();
  });
}

function renderApp() {
  renderHomeStats();
  renderCurrentBookPanel();
  renderLibrary();
  renderInstallButton();

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
  state.speechSettings = data.speechSettings || getDefaultSpeechSettings();

  ensureWrongBook();
  saveData();
  setupSpeechVoices();
  setupInstallPrompt();
  registerServiceWorker();
  renderApp();
})();