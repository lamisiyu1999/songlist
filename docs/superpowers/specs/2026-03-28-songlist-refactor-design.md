# 歌單重構設計文件

**日期：** 2026-03-28
**範圍：** `index.html` 重構與優化（程式碼品質 + UX + 效能）
**框架：** Alpine.js（CDN，無 build step）
**部署：** GitHub Pages（靜態檔案，不變）

---

## 目標

在不改變任何現有功能的前提下，對 `index.html` 進行：

1. **程式碼品質（A）** — 拆分職責、消除重複邏輯、讓狀態管理集中
2. **使用者體驗（B）** — 加入 loading 狀態、清理 inline style
3. **效能（C）** — sessionStorage 快取、O(n) 歌手計數

---

## 架構

```
songlist/
├── index.html      # 主歌單頁（Alpine.js 重寫）
└── lamilan.png     # 背景圖（不動）
```

資料流不變：
```
GitHub Pages (靜態) ←→ Google Apps Script (doGet JSONP) ←→ Google Sheet
```

---

## 主頁面重構設計

### 狀態管理

取代現有散落的全域變數，集中在單一 Alpine component：

```js
x-data="{
  rows: [],
  filtered: [],
  loading: true,
  activeTab: '所有歌曲',
  selectedArtist: null,
  search: '',
  lenFilter: '',
  multOnly: 'x2'
}"
```

### 過濾邏輯拆分

現有 `applyFilters()` 混合了過濾邏輯與 UI 副作用，拆分為：

- `getFiltered()` — 純函式，輸入 state 回傳過濾後的陣列（無副作用）
- Alpine `x-effect` 或 watch — 監聽 state 變化，觸發重新計算並更新 `filtered`

### 消除重複渲染邏輯

現有 `renderList` 中「所有歌曲」、「加倍歌單」、「其他...」三段程式碼做同樣的 grid 渲染。
改用 Alpine `x-show` 切換版型（grid 雙欄 vs 歌手+歌曲雙窗格），用 `x-for` 統一渲染卡片。

### 歌手計數優化

現有實作對每位歌手都呼叫 `filtered.filter(...)` — O(n²)。
改用 `Map` 預先計算所有歌手的計數 — O(n)。

```js
const countMap = new Map();
filtered.forEach(r => {
  const name = r.artist || '（未填歌手）';
  countMap.set(name, (countMap.get(name) || 0) + 1);
});
```

### Loading 狀態

- 初始載入時顯示 spinner（`x-show="loading"`）
- 資料就緒後隱藏（`loading = false`）
- 載入失敗時顯示錯誤訊息（現有邏輯保留）

### sessionStorage 快取

```
fetchSheet() 流程：
1. 讀 sessionStorage['songlist_cache']
2. 有快取 → 立即渲染，背景重新 fetch 並更新快取
3. 無快取 → 顯示 loading → fetch → 渲染 → 寫入快取
```

快取 key：`songlist_cache`，格式：JSON 字串。
Session 結束（關閉分頁）後自動失效，不需手動清除。

### CSS 清理

把 JS 裡的 inline style 移到 CSS class：

```js
// 現有（要移除）
style="margin-top:8px;display:flex;justify-content:space-between;align-items:center"

// 改為 CSS class
.card-footer { margin-top: 8px; display: flex; justify-content: space-between; align-items: center; }
```

---

## 不在範圍內

- admin 頁面（已移除）
- GAS 擴充（不需要）
- 資料格式變更
- note 欄位顯示（目前資料無此欄位）
- 功能新增

---

## 成功標準

- 所有現有功能行為不變（Tab 切換、搜尋、篩選、雙窗格、shuffle、badge）
- 程式碼可在無 build 環境下直接在瀏覽器執行
- 初次載入有 loading 指示
- 二次載入（同 session）資料立即顯示
