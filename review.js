function renderReviewBookPicker() {
  const box = document.getElementById("reviewSelectBooks");
  const dueByBook = state.books.map((book) => {
    const dueLists = getListsByBookId(book.id).filter((l) => isDue(l.nextReviewAt));
    return { book, dueLists };
  });

  box.innerHTML = `
    <div style="grid-column:1/-1;">
      <div class="section-title" style="color:#f8fafc; margin-bottom:6px;">选择要复习的词书</div>
      <div class="muted small">点击对应词书，再进入该词书下需要复习的 list。</div>
    </div>
    ${dueByBook
      .map(({ book, dueLists }) => `
        <div class="picker-item dark">
          <div><strong>${book.name}</strong></div>
          <div class="small muted" style="margin-top:6px;">待复习 list：${dueLists.length}</div>
          <div class="small muted" style="margin-top:4px;">总 list：${getListsByBookId(book.id).length}</div>
          <div class="space"></div>
          <button class="blue" ${dueLists.length ? "" : "disabled"} onclick="openReviewLists('${book.id}')">
            ${dueLists.length ? "进入词书" : "暂无待复习"}
          </button>
        </div>
      `)
      .join("")}
  `;
}

function openReviewLists(bookId) {
  state.reviewBookId = bookId;
  state.reviewStage = "lists";
  renderReviewPage();
}

function backToReviewBooks() {
  state.reviewStage = "books";
  state.reviewBookId = null;
  state.reviewListId = null;
  state.currentReviewWordId = null;
  state.reviewInitialWordTotal = 0;
  state.currentReviewHadForget = false;
  state.reviewQueue = [];
  state.showAnswer = false;

  document.getElementById("reviewProgressText").textContent = "00/00";
  document.getElementById("reviewRemainingText").textContent = "00/00";
  document.getElementById("reviewProgressFill").style.width = "0%";

  renderReviewPage();
}

function renderReviewListPicker() {
  const box = document.getElementById("reviewSelectLists");
  const book = getBookById(state.reviewBookId);
  if (!book) {
    state.reviewStage = "books";
    renderReviewPage();
    return;
  }

  const dueLists = getListsByBookId(book.id).filter((l) => isDue(l.nextReviewAt));

  box.innerHTML = `
    <div style="grid-column:1/-1;">
      <div class="section-title" style="color:#f8fafc; margin-bottom:6px;">选择要复习的 list</div>
      <div class="muted small">当前词书：${book.name}</div>
      <div class="space"></div>
      <button class="secondary small-btn" onclick="backToReviewBooks()">返回选择词书</button>
    </div>
    ${
      dueLists.length
        ? dueLists
            .map((list) => `
              <div class="picker-item dark">
                <div><strong>${list.name}</strong></div>
                <div class="small muted" style="margin-top:6px;">单词数：${getWordsByListId(list.id).length}</div>
                <div class="small muted" style="margin-top:4px;">下次复习：${fmt(list.nextReviewAt)}</div>
                <div class="small muted" style="margin-top:4px;">复习阶段：${list.reviewStage + 1}</div>
                <div class="space"></div>
                <button class="blue" onclick="startReviewList('${list.id}')">开始复习</button>
              </div>
            `)
            .join("")
        : `<div class="muted">这个词书当前没有到期的 list。</div>`
    }
  `;
}

function buildReviewQueue(listId) {
  const currentList = getListById(listId);
  if (!currentList) return [];

  let listWords = getWordsByListId(listId);

  if (!currentList.lastReviewedAt) {
    listWords = [...listWords].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  } else {
    listWords = shuffleArray(listWords);
  }

  return listWords.map((w) => w.id);
}

function startReviewList(listId) {
  state.reviewListId = listId;
  state.reviewStage = "reviewing";
  state.reviewQueue = buildReviewQueue(listId);
  state.reviewInitialWordTotal = state.reviewQueue.length;
  state.currentReviewWordId = state.reviewQueue[0] || null;
  state.currentReviewHadForget = false;
  state.showAnswer = false;
  renderReviewPage();
}

function getCurrentReviewWord() {
  if (!state.reviewListId) return null;
  if (!state.reviewQueue || !state.reviewQueue.length) return null;

  if (state.currentReviewWordId) {
    const found = state.words.find((w) => w.id === state.currentReviewWordId);
    if (found) return found;
  }

  const firstId = state.reviewQueue[0];
  state.currentReviewWordId = firstId || null;
  return state.words.find((w) => w.id === firstId) || null;
}

function showCurrentAnswer() {
  const current = getCurrentReviewWord();
  if (!current) return;
  state.showAnswer = true;
  renderReviewPage();
}

function handleReviewAction(remembered) {
  const current = getCurrentReviewWord();
  if (!current || !state.showAnswer) return;

  if (!remembered) {
    state.currentReviewHadForget = true;
    addWordToWrongBook(current);
  }

  state.words = state.words.map((w) =>
    w.id === current.id
      ? {
          ...w,
          reviewCount: (w.reviewCount || 0) + 1,
          lapseCount: remembered ? (w.lapseCount || 0) : (w.lapseCount || 0) + 1,
          updatedAt: nowISO(),
        }
      : w
  );

  const currentIndex = state.reviewQueue.findIndex((id) => id === current.id);

  if (currentIndex >= state.reviewQueue.length - 1) {
    finishReviewList();
    return;
  }

  state.currentReviewWordId = state.reviewQueue[currentIndex + 1];
  state.showAnswer = false;
  saveData();
  renderReviewPage();
  renderLibrary();
}

function finishReviewList() {
  const currentList = getListById(state.reviewListId);
  if (!currentList) return;

  let nextStage = currentList.reviewStage;
  if (state.currentReviewHadForget) {
    nextStage = 1;
  } else {
    nextStage = Math.min(currentList.reviewStage + 1, REVIEW_STEPS.length - 1);
  }

  state.lists = state.lists.map((l) =>
    l.id === state.reviewListId
      ? {
          ...l,
          reviewStage: nextStage,
          lastReviewedAt: nowISO(),
          nextReviewAt: nextReviewTime(nextStage, new Date()),
        }
      : l
  );

  saveData();

  state.reviewStage = "lists";
  state.reviewListId = null;
  state.currentReviewWordId = null;
  state.currentReviewHadForget = false;
  state.reviewQueue = [];
  state.showAnswer = false;
  renderApp();
}

function renderReviewPage() {
  const booksBox = document.getElementById("reviewSelectBooks");
  const listsBox = document.getElementById("reviewSelectLists");
  const emptyState = document.getElementById("reviewEmptyState");
  const card = document.getElementById("reviewCard");
  const topTitle = document.getElementById("reviewTopTitle");

  booksBox.classList.add("hidden");
  listsBox.classList.add("hidden");
  emptyState.classList.add("hidden");
  card.classList.add("hidden");

  if (state.reviewStage === "books") {
    topTitle.textContent = "选择要复习的词书";
    booksBox.classList.remove("hidden");
    renderReviewBookPicker();
    document.getElementById("reviewProgressText").textContent = "00/00";
    document.getElementById("reviewRemainingText").textContent = "00/00";
    document.getElementById("reviewProgressFill").style.width = "0%";
    return;
  }

  if (state.reviewStage === "lists") {
    const book = getBookById(state.reviewBookId);
    topTitle.textContent = book ? `选择 list：${book.name}` : "选择 list";
    listsBox.classList.remove("hidden");
    renderReviewListPicker();
    document.getElementById("reviewProgressText").textContent = "00/00";
    document.getElementById("reviewRemainingText").textContent = "00/00";
    document.getElementById("reviewProgressFill").style.width = "0%";
    return;
  }

  const current = getCurrentReviewWord();
  const currentList = getListById(state.reviewListId);
  const currentBook = currentList ? getBookById(currentList.bookId) : null;

  if (!current || !currentList) {
    emptyState.classList.remove("hidden");
    topTitle.textContent = "当前 list 已复习完成";
    document.getElementById("reviewProgressText").textContent =
      `${pad2(state.reviewInitialWordTotal)}/${pad2(state.reviewInitialWordTotal)}`;
    document.getElementById("reviewRemainingText").textContent =
      `00/${pad2(state.reviewInitialWordTotal)}`;
    document.getElementById("reviewProgressFill").style.width = "100%";
    return;
  }

  topTitle.textContent = `${currentBook ? currentBook.name : "词书"} / ${currentList.name}`;
  card.classList.remove("hidden");

  const levelText = document.getElementById("reviewLevelText");
  const wordText = document.getElementById("reviewWordText");
  const answerBox = document.getElementById("reviewAnswerBox");
  const hintBox = document.getElementById("reviewHintBox");

  const meaningText = document.getElementById("reviewMeaningText");
  const exampleWrap = document.getElementById("reviewExampleWrap");
  const exampleText = document.getElementById("reviewExampleText");
  const noteWrap = document.getElementById("reviewNoteWrap");
  const noteText = document.getElementById("reviewNoteText");

  const showBtn = document.getElementById("showAnswerBtn");
  const rememberBtn = document.getElementById("rememberBtn");
  const forgetBtn = document.getElementById("forgetBtn");
  const speakBtn = document.getElementById("reviewSpeakBtn");

  levelText.textContent = `list 阶段 ${currentList.reviewStage + 1}`;
  wordText.textContent = current.word;
  meaningText.textContent = current.meaning;
  speakBtn.onclick = () => speakWord(current.word);

  if (current.example) {
    exampleWrap.style.display = "block";
    exampleText.textContent = current.example;
  } else {
    exampleWrap.style.display = "none";
  }

  if (current.note) {
    noteWrap.style.display = "block";
    noteText.textContent = current.note;
  } else {
    noteWrap.style.display = "none";
  }

  if (state.showAnswer) {
    answerBox.classList.remove("hidden");
    hintBox.classList.add("hidden");
    showBtn.disabled = true;
    rememberBtn.disabled = false;
    forgetBtn.disabled = false;
  } else {
    answerBox.classList.add("hidden");
    hintBox.classList.remove("hidden");
    showBtn.disabled = false;
    rememberBtn.disabled = true;
    forgetBtn.disabled = true;
  }

  const currentIndex = state.reviewQueue.findIndex((id) => id === current.id);
  const done = Math.max(currentIndex, 0);
  const total = state.reviewInitialWordTotal || state.reviewQueue.length;
  const remaining = Math.max(total - done, 0);
  const percent = total > 0 ? (done / total) * 100 : 0;

  document.getElementById("reviewProgressText").textContent = `${pad2(done)}/${pad2(total)}`;
  document.getElementById("reviewRemainingText").textContent = `${pad2(remaining)}/${pad2(total)}`;
  document.getElementById("reviewProgressFill").style.width = `${percent}%`;
}