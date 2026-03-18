
function getLibrarySearchKeyword() {
  const input = document.getElementById("searchInput");
  return (input ? input.value : "").trim().toLowerCase();
}

function getAllMatchedWordsForLibrary(keyword = "") {
  const q = String(keyword || "").trim().toLowerCase();
  const results = [];

  state.words.forEach((w) => {
    if (!q || matchesWordQuery(w, q)) {
      const list = getListById(w.listId);
      const book = list ? getBookById(list.bookId) : null;
      results.push({
        ...w,
        __listName: list ? list.name : "",
        __bookName: book ? book.name : ""
      });
    }
  });

  return results;
}

function scoreLibraryWordMatch(word, keyword) {
  const k = String(keyword || "").trim().toLowerCase();
  if (!k) return -1;

  const wordText = String(word.word || "").toLowerCase();
  const meaning = String(word.meaning || "").toLowerCase();
  const example = String(word.example || "").toLowerCase();
  const note = String(word.note || "").toLowerCase();
  const listName = String(word.__listName || "").toLowerCase();
  const bookName = String(word.__bookName || "").toLowerCase();

  if (wordText === k) return 100;
  if (wordText.startsWith(k)) return 90;
  if (wordText.includes(k)) return 82;
  if (meaning.includes(k)) return 72;
  if (example.includes(k)) return 62;
  if (note.includes(k)) return 56;
  if (listName.includes(k)) return 45;
  if (bookName.includes(k)) return 40;
  return -1;
}

function findBestLibraryWordMatch(keyword) {
  const matched = getAllMatchedWordsForLibrary(keyword);
  if (!matched.length) return null;

  const ranked = matched
    .map((item) => ({ item, score: scoreLibraryWordMatch(item, keyword) }))
    .filter((x) => x.score >= 0)
    .sort((a, b) => b.score - a.score);

  return ranked.length ? ranked[0].item : matched[0];
}

function buildWordPreviewHtml(w) {
  const safeWord = String(w.word || "").replace(/'/g, "\\'");
  return `
    <div class="affix-preview-type">${escapeHtml(w.__bookName || "未分组词书")}${w.__listName ? `｜${escapeHtml(w.__listName)}` : ""}</div>
    <div class="affix-preview-word">${escapeHtml(w.word || "")}</div>
    <div class="affix-preview-section"><strong>释义：</strong>${escapeHtml(w.meaning || "")}</div>
    ${w.example ? `<div class="affix-preview-section"><strong>例句：</strong>${escapeHtml(w.example)}</div>` : ""}
    ${w.note ? `<div class="affix-preview-section"><strong>备注：</strong>${escapeHtml(w.note)}</div>` : ""}
    <div class="affix-preview-section"><strong>复习次数：</strong>${Number(w.reviewCount || 0)} 次</div>
    <div class="affix-preview-section"><strong>忘记次数：</strong>${Number(w.lapseCount || 0)} 次</div>
    <div class="affix-preview-actions word-preview-actions">
      <button class="secondary" type="button" onclick="speakWord('${safeWord}')">发音</button>
      <button class="secondary" type="button" onclick="closeWordPreview()">返回上一级</button>
    </div>
  `;
}

function openWordPreviewById(wordId) {
  const word = state.words.find((w) => w.id === wordId);
  if (!word) return;

  const list = getListById(word.listId);
  const book = list ? getBookById(list.bookId) : null;
  const modal = document.getElementById("wordPreviewModal");
  const content = document.getElementById("wordPreviewContent");
  if (!modal || !content) return;

  state.wordPreviewId = wordId;
  content.innerHTML = buildWordPreviewHtml({
    ...word,
    __listName: list ? list.name : "",
    __bookName: book ? book.name : ""
  });
  modal.classList.remove("hidden");
}

function closeWordPreview() {
  const modal = document.getElementById("wordPreviewModal");
  if (modal) modal.classList.add("hidden");
  state.wordPreviewId = null;
}

function openLibrarySearchPreview() {
  const keyword = getLibrarySearchKeyword();
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

  const keyword = getLibrarySearchKeyword();
  if (!keyword || keyword.length < 2) return;
  if (state.libraryLastAutoOpenedKeyword === keyword) return;

  const bestMatch = findBestLibraryWordMatch(keyword);
  if (!bestMatch) return;

  const bestScore = scoreLibraryWordMatch(bestMatch, keyword);
  if (bestScore >= 82) {
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

function matchesWordQuery(word, q) {
  if (!q) return true;
  return (
    String(word.word || "").toLowerCase().includes(q) ||
    String(word.meaning || "").toLowerCase().includes(q) ||
    String(word.example || "").toLowerCase().includes(q) ||
    String(word.note || "").toLowerCase().includes(q)
  );
}

function buildWordItemHtml(w, listName = "") {
  const safeWord = String(w.word || "").replace(/'/g, "\\'");

  return `
    <div class="word-item">
      <div><strong>${escapeHtml(w.word)}</strong></div>
      <div class="muted" style="margin-top:6px;">${escapeHtml(w.meaning)}</div>
      ${listName ? `<div class="small muted" style="margin-top:6px;">来自 list：${escapeHtml(listName)}</div>` : ""}
      ${w.example ? `<div class="small muted" style="margin-top:6px;">例句：${escapeHtml(w.example)}</div>` : ""}
      ${w.note ? `<div class="small muted" style="margin-top:4px;">备注：${escapeHtml(w.note)}</div>` : ""}
      <div class="small muted" style="margin-top:8px;">本词复习次数：${w.reviewCount} 次</div>
      <div class="small muted" style="margin-top:4px;">本词忘记次数：${w.lapseCount} 次</div>
      <div class="list-actions" style="margin-top:12px;">
        <button class="blue" onclick="openWordPreviewById('${w.id}')">查看</button>
        <button class="secondary" onclick="speakWord('${safeWord}')">发音</button>
        <button class="secondary" onclick="editWord('${w.id}')">编辑</button>
        <button class="danger" onclick="deleteWord('${w.id}')">删除</button>
      </div>
    </div>
  `;
}

function renderLibrary() {
  const box = document.getElementById("libraryContent");
  const breadcrumb = document.getElementById("libraryBreadcrumb");
  const backBtn = document.getElementById("libraryBackBtn");
  const q = document.getElementById("searchInput").value.trim().toLowerCase();

  if (!box || !breadcrumb || !backBtn) return;

  breadcrumb.innerHTML = "";
  backBtn.style.visibility = state.libraryView === "books" ? "hidden" : "visible";

  if (state.libraryView === "books") {
    breadcrumb.innerHTML = `<span class="chip">词书</span>`;

    let bookList = [...state.books];

    if (q) {
      bookList = bookList.filter((book) => {
        const childLists = getListsByBookId(book.id);
        const listMatched = childLists.some((list) => String(list.name || "").toLowerCase().includes(q));
        const wordMatched = childLists.some((list) =>
          getWordsByListId(list.id).some((word) => matchesWordQuery(word, q))
        );

        return String(book.name || "").toLowerCase().includes(q) || listMatched || wordMatched;
      });
    }

    const wrongBook = bookList.find((book) => book.name === "错词本");
    const normalBooks = bookList.filter((book) => book.name !== "错词本");

    let html = "";

    html += `
      <div class="library-block">
        <div class="section-title">普通词书</div>
        ${
          normalBooks.length
            ? normalBooks
                .map((book) => {
                  const childLists = getListsByBookId(book.id);
                  const wordCount = childLists.reduce((sum, l) => sum + getWordsByListId(l.id).length, 0);
                  const matchedWordCount = q
                    ? childLists.reduce(
                        (sum, list) => sum + getWordsByListId(list.id).filter((w) => matchesWordQuery(w, q)).length,
                        0
                      )
                    : 0;

                  return `
                    <div class="book-item">
                      <div><strong>${escapeHtml(book.name)}</strong></div>
                      <div class="small muted" style="margin-top:6px;">list 数：${childLists.length} ｜ 单词数：${wordCount}</div>
                      ${
                        q && matchedWordCount
                          ? `<div class="small muted" style="margin-top:4px;">当前搜索命中的单词：${matchedWordCount}</div>`
                          : ""
                      }
                      <div class="list-actions" style="margin-top:12px;">
                        <button class="blue" onclick="openBookInLibrary('${book.id}')">进入词书</button>
                        <button class="secondary" onclick="changeCurrentBook('${book.id}'); goToPage('home')">设为当前词书</button>
                        <button class="danger" onclick="deleteBook('${book.id}')">删除词书</button>
                      </div>
                    </div>
                  `;
                })
                .join("")
            : `<div class="muted">没有找到普通词书。</div>`
        }
      </div>
    `;

    html += `<div class="space"></div>`;

    html += `
      <div class="library-block wrong-book-panel">
        <div class="section-title">错词本</div>
        <div class="wrong-book-desc">
          自动收集你在复习时点“× 我忘记”的单词。你可以进入错词本删除误加的单词。
        </div>
        ${
          wrongBook
            ? (() => {
                const childLists = getListsByBookId(wrongBook.id);
                const wordCount = childLists.reduce((sum, l) => sum + getWordsByListId(l.id).length, 0);
                const matchedWordCount = q
                  ? childLists.reduce(
                      (sum, list) => sum + getWordsByListId(list.id).filter((w) => matchesWordQuery(w, q)).length,
                      0
                    )
                  : 0;

                return `
                  <div class="book-item wrong-book-card">
                    <div><strong>${escapeHtml(wrongBook.name)}</strong><span class="book-badge-wrong">系统词书</span></div>
                    <div class="small muted" style="margin-top:6px;">list 数：${childLists.length} ｜ 单词数：${wordCount}</div>
                    ${
                      q && matchedWordCount
                        ? `<div class="small muted" style="margin-top:4px;">当前搜索命中的单词：${matchedWordCount}</div>`
                        : ""
                    }
                    <div class="list-actions" style="margin-top:12px;">
                      <button class="blue" onclick="openBookInLibrary('${wrongBook.id}')">进入错词本</button>
                      <button class="secondary" onclick="changeCurrentBook('${wrongBook.id}'); goToPage('home')">设为当前词书</button>
                    </div>
                  </div>
                `;
              })()
            : `<div class="muted">当前还没有错词本内容。</div>`
        }
      </div>
    `;

    box.innerHTML = html;
    return;
  }

  if (state.libraryView === "lists") {
    const book = getBookById(state.libraryBookId);
    if (!book) {
      state.libraryView = "books";
      renderLibrary();
      return;
    }

    breadcrumb.innerHTML = `<span class="chip">词书</span><span>›</span><span class="chip">${escapeHtml(book.name)}</span>`;

    const allLists = getListsByBookId(book.id);
    let targetLists = allLists;
    if (q) {
      targetLists = targetLists.filter((list) => String(list.name || "").toLowerCase().includes(q));
    }

    const matchedWordsAcrossBook = q
      ? allLists.flatMap((list) =>
          getWordsByListId(list.id)
            .filter((w) => matchesWordQuery(w, q))
            .map((w) => ({ ...w, __listName: list.name }))
        )
      : [];

    let html = "";

    if (q) {
      html += `
        <div class="library-block">
          <div class="section-title">整本词书匹配到的单词</div>
          ${
            matchedWordsAcrossBook.length
              ? matchedWordsAcrossBook.map((w) => buildWordItemHtml(w, w.__listName)).join("")
              : `<div class="muted">当前这个词书里没有匹配到单词。</div>`
          }
        </div>
      `;

      html += `<div class="space"></div>`;
    }

    html += `
      <div class="library-block">
        <div class="section-title">这个词书里的 list</div>
        ${
          targetLists.length
            ? targetLists
                .map((list) => {
                  const count = getWordsByListId(list.id).length;
                  return `
                    <div class="list-item">
                      <div><strong>${escapeHtml(list.name)}</strong></div>
                      <div class="small muted" style="margin-top:6px;">单词数：${count}</div>
                      <div class="small muted" style="margin-top:4px;">下次复习：${fmt(list.nextReviewAt)}</div>
                      <div class="small muted" style="margin-top:4px;">复习阶段：${list.reviewStage + 1}</div>
                      <div class="list-actions" style="margin-top:12px;">
                        <button class="blue" onclick="openListInLibrary('${list.id}')">查看单词</button>
                        <button class="amber" onclick="resetListReview('${list.id}')">重置复习</button>
                        <button class="danger" onclick="deleteList('${list.id}')">删除 list</button>
                      </div>
                    </div>
                  `;
                })
                .join("")
            : `<div class="muted">这个词书里没有匹配到 list。</div>`
        }
      </div>
    `;

    box.innerHTML = html;
    return;
  }

  if (state.libraryView === "words") {
    const list = getListById(state.libraryListId);
    if (!list) {
      state.libraryView = "lists";
      renderLibrary();
      return;
    }
    const book = getBookById(list.bookId);

    breadcrumb.innerHTML = `
      <span class="chip">词书</span><span>›</span>
      <span class="chip">${escapeHtml(book ? book.name : "未知词书")}</span><span>›</span>
      <span class="chip">${escapeHtml(list.name)}</span>
    `;

    let targetWords = getWordsByListId(list.id);
    if (q) {
      targetWords = targetWords.filter((w) => matchesWordQuery(w, q));
    }

    if (!targetWords.length) {
      box.innerHTML = '<div class="muted">这个 list 里没有找到单词。</div>';
      return;
    }

    box.innerHTML = targetWords.map((w) => buildWordItemHtml(w)).join("");
  }
}

function openBookInLibrary(bookId) {
  state.libraryBookId = bookId;
  state.libraryView = "lists";
  renderLibrary();
}

function openListInLibrary(listId) {
  state.libraryListId = listId;
  state.libraryView = "words";
  renderLibrary();
}

function libraryGoBack() {
  if (state.libraryView === "words") {
    state.libraryView = "lists";
    state.libraryListId = null;
  } else if (state.libraryView === "lists") {
    state.libraryView = "books";
    state.libraryBookId = null;
  }
  renderLibrary();
}