# vocab phone 多文件版说明

这是手机版的多文件结构版本，核心数据模型是：

- 词书 `book`
- list
- 单词 `word`

关系是：

`book -> list -> word`

---

## 文件说明

### 1. `index-phone.html`
页面结构文件。

负责放所有页面骨架和弹窗骨架，包括：

- 首页
- 词书页
- 复习页
- 编辑单词弹窗
- 删除确认弹窗

这个文件只负责 HTML 结构，不负责业务逻辑。

---

### 2. `style-phone.css`
样式文件。

负责所有页面的样式，包括：

- 首页卡片
- 词书 / list / 单词列表
- 复习页沉浸式深色界面
- 编辑弹窗
- 删除弹窗

以后想改 UI，优先改这个文件。

---

### 3. `storage-phone.js`
数据层和基础工具层。

负责：

- `localStorage` 读写
- 数据兼容迁移
- 生成 id
- 日期和复习时间计算
- 获取 book / list / word 的辅助函数
- 发音功能

这是“底层工具文件”。

---

### 4. `library-phone.js`
词书页逻辑。

负责：

- 渲染词书列表
- 渲染某个词书下的 list
- 渲染某个 list 下的单词
- 词书页返回上一级逻辑
- 词书页筛选与切换逻辑

这是“浏览和管理数据”的页面逻辑文件。

---

### 5. `review-phone.js`
复习页逻辑。

负责：

- 选择词书
- 选择 list
- 开始复习某个 list
- 显示答案
- 记得 / 忘记
- 完成整个 list 的复习
- 更新 list 的下一次复习时间

这是“复习流程”的逻辑文件。

---

### 6. `app-phone.js`
总控文件。

负责：

- 全局状态 `state`
- 页面切换
- 首页统计
- 当前词书切换
- 添加单词
- 批量导入
- 编辑单词
- 删除 book / list / word
- 导入 / 导出备份
- 初始化整个应用
- 键盘快捷键

这是“总入口文件”。

---

## 脚本加载顺序

在 `index-phone.html` 中，脚本顺序必须保持：

1. `storage-phone.js`
2. `library-phone.js`
3. `review-phone.js`
4. `app-phone.js`

因为：

- `storage-phone.js` 提供底层函数
- `library-phone.js` 和 `review-phone.js` 会依赖这些底层函数
- `app-phone.js` 最后初始化整个应用

不要随便改顺序。

---

## 本地存储

当前使用的存储 key：

```js
vocab_book_list_word_mobile_v1