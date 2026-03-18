function renderLibrary() {
  const box = document.getElementById("libraryContent");
  const breadcrumb = document.getElementById("libraryBreadcrumb");
  const backBtn = document.getElementById("libraryBackBtn");
  const q = document.getElementById("searchInput").value.trim().toLowerCase();

  breadcrumb.innerHTML = "";
  backBtn.style.visibility = state.libraryView === "books" ? "hidden" : "visible";

  if (state.libraryView === "books") {
    breadcrumb.innerHTML = `<span class="chip">词书</span>`;

    let bookList = [...state.books];
    if (q) {
      bookList = bookList.filter((book) => book.name.toLowerCase().includes(q));
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
                  return `
                    <div class="book-item">
                      <div><strong>${book.name}</strong></div>
                      <div class="small muted" style="margin-top:6px;">list 数：${childLists.length} ｜ 单词数：${wordCount}</div>
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
                return `
                  <div class="book-item wrong-book-card">
                    <div><strong>${wrongBook.name}</strong><span class="book-badge-wrong">系统词书</span></div>
                    <div class="small muted" style="margin-top:6px;">list 数：${childLists.length} ｜ 单词数：${wordCount}</div>
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

    breadcrumb.innerHTML = `<span class="chip">词书</span><span>›</span><span class="chip">${book.name}</span>`;

    let targetLists = getListsByBookId(book.id);
    if (q) {
      targetLists = targetLists.filter((list) => list.name.toLowerCase().includes(q));
    }

    if (!targetLists.length) {
      box.innerHTML = '<div class="muted">这个词书里还没有 list。</div>';
      return;
    }

    box.innerHTML = targetLists
      .map((list) => {
        const count = getWordsByListId(list.id).length;
        return `
          <div class="list-item">
            <div><strong>${list.name}</strong></div>
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
      .join("");
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
      <span class="chip">${book ? book.name : "未知词书"}</span><span>›</span>
      <span class="chip">${list.name}</span>
    `;

    let targetWords = getWordsByListId(list.id);
    if (q) {
      targetWords = targetWords.filter(
        (w) =>
          w.word.toLowerCase().includes(q) ||
          w.meaning.toLowerCase().includes(q) ||
          (w.example || "").toLowerCase().includes(q) ||
          (w.note || "").toLowerCase().includes(q)
      );
    }

    if (!targetWords.length) {
      box.innerHTML = '<div class="muted">这个 list 里没有找到单词。</div>';
      return;
    }

    box.innerHTML = targetWords
      .map(
        (w) => `
          <div class="word-item">
            <div><strong>${w.word}</strong></div>
            <div class="muted" style="margin-top:6px;">${w.meaning}</div>
            ${w.example ? `<div class="small muted" style="margin-top:6px;">例句：${w.example}</div>` : ""}
            ${w.note ? `<div class="small muted" style="margin-top:4px;">备注：${w.note}</div>` : ""}
            <div class="small muted" style="margin-top:8px;">本词复习次数：${w.reviewCount} 次</div>
            <div class="small muted" style="margin-top:4px;">本词忘记次数：${w.lapseCount} 次</div>
            <div class="list-actions" style="margin-top:12px;">
              <button class="secondary" onclick="speakWord('${String(w.word).replace(/'/g, "\\'")}')">发音</button>
              <button class="secondary" onclick="editWord('${w.id}')">编辑</button>
              <button class="danger" onclick="deleteWord('${w.id}')">删除</button>
            </div>
          </div>
        `
      )
      .join("");
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