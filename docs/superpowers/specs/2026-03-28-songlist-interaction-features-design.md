# 歌單互動功能設計文件

**日期：** 2026-03-28
**範圍：** 5 個新互動功能，整合進 Alpine.js 重構後的 `index.html`
**前置條件：** `feat/alpine-refactor` 重構完成並驗證通過後才開始實作
**部署：** GitHub Pages（靜態，無 build step）

---

## 執行流程

1. 驗證現有 Alpine 重構正常運作，提交重構 commit
2. 五個新功能依序開發，每個功能：
   - 實作
   - 寫測試 + 人工視覺驗證
   - 使用者確認後提交一個 commit

---

## 功能 1：一鍵複製歌名（One-Click Copy）

### 行為
- 每張歌曲卡片底部有一個隱藏橫條，hover 時浮現
- 點擊後將歌名寫入剪貼簿
- 回饋：按鈕文字從「複製歌名」變為「✓ 已複製！」（綠色），0.8 秒後自動恢復

### 實作
- Alpine `songApp` 新增 `copyTitle(song)` method：
  ```js
  async copyTitle(song) {
    await navigator.clipboard.writeText(song.title);
    song._copied = true;
    setTimeout(() => { song._copied = false; }, 800);
  }
  ```
- HTML：每張卡片底部新增 `.copy-bar`
- CSS：
  ```css
  .copy-bar { opacity: 0; transition: opacity 0.2s; ... }
  .card:hover .copy-bar { opacity: 1; }
  .copy-bar.copied { background: rgba(30,95,50,0.9); color: #8fc96e; }
  ```

### 測試驗證
- 點擊複製後，瀏覽器剪貼簿內容 === 歌名
- 按鈕 0.8 秒後恢復原始文字與顏色
- 不 hover 時橫條不可見

---

## 功能 2：隨機選歌（Lucky Pick）

### 行為
- Header 導覽列末端顯示金色「🎲 隨機」按鈕
- 點擊後從當前 Tab 的 `filtered` 陣列隨機抽一首
- 頁面捲動至該卡片（`scrollIntoView({ behavior: 'smooth' }`）
- 卡片邊框短暫閃爍金色（CSS animation，約 1.5 秒後結束）
- `filtered` 為空時不執行

### 抽取範圍（依 Tab 決定）
- 「所有歌曲」→ 所有歌曲
- 其他 Tab → 該 Tab 篩選後的結果

### 實作
- Alpine `songApp` 新增：
  - `pickedSong: null`
  - `luckyPick()` method：隨機取 `filtered` 中一項，設為 `pickedSong`，捲動 + 1.5s 後清除
- 卡片 `:class="song === pickedSong ? 'card-picked' : ''"`
- Header nav 加入按鈕：`<button class="tab-lucky" @click="luckyPick()">🎲 隨機</button>`
- CSS：`.card-picked` 加金色邊框 keyframe 動畫

### 測試驗證
- 抽到的卡片在當前 Tab 的 filtered 範圍內
- 頁面有捲動行為
- 金色動畫結束後卡片恢復正常
- 空清單時點擊無反應

---

## 功能 3：空狀態處理（Empty State）

### 行為
- 搜尋或篩選後 `filtered.length === 0` 時顯示友善提示
- 文字：「目前找不到這首歌喔！可以試試其他關鍵字，或是向拉米敲碗～」

### 實作
- 取代現有通用空狀態文字
- Grid 版型（`isGridTab`）與雙窗格右側窗格分別套用
- 條件：`x-show="!loading && !error && filtered.length === 0"`

### 測試驗證
- 搜尋不存在的關鍵字 → 顯示友善文字
- 清除搜尋後 → 文字消失，歌曲重新出現
- 雙窗格右側也正常顯示

---

## 功能 4：Hover 微動畫（Micro-animations）

### 行為
- 卡片 hover：輕微向上位移 + 陰影加深
- 搜尋/篩選切換時，卡片淡入

### 實作
- 純 CSS，不改 Alpine JS：
  ```css
  .card {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  .card:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.4);
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(4px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .card {
    animation: fadeIn 0.25s ease;
  }
  ```
- 注意：`.card-picked` 動畫與 hover `transform` 不互相覆蓋（各自用不同 CSS 屬性）

### 測試驗證
- 滑鼠移至卡片有明顯上移 + 陰影效果
- 切換 Tab 或搜尋後，卡片有淡入效果
- 隨機選歌高亮動畫與 hover 同時存在時不衝突

---

## 功能 5：置頂與推薦標籤（isTop / HOT Tag）

### 行為
- `isTop === 'TRUE'` 的歌曲排在各分頁最前面
- 卡片顯示金色「⭐ 推薦」badge

### Google Sheet 變更
- 新增欄位：`isTop`（第 9 欄，index 8），值為 `TRUE` / `FALSE` / 空白

### 本地測試
- 建立 `test/songs.csv`，包含 `isTop = TRUE` 與 `FALSE` 的測試資料
- 測試時用靜態 JSON 替換 JSONP 抓取（dev-only mock）

### 實作
- `_doFetch()` mapping 加入 `isTop: r[8]`
- `applyFilters()` 最後排序：
  ```js
  this.filtered = pool.sort((a, b) =>
    (b.isTop === 'TRUE' ? 1 : 0) - (a.isTop === 'TRUE' ? 1 : 0)
  );
  ```
  （「所有歌曲」Tab：isTop 歌曲固定置頂，shuffle 只作用於非 isTop 的歌曲）
- Badge CSS 新增 `.badge-gold`：
  ```css
  .badge-gold { background: #3a2d0a; color: #f0c060; border: 1px solid #7a6030; }
  ```
- 卡片 badge 區塊加入：
  ```html
  <span class="badge badge-gold" x-show="song.isTop === 'TRUE'">⭐ 推薦</span>
  ```

### 測試驗證
- `isTop = TRUE` 的歌曲出現在各 Tab 最前面
- 金色 ⭐ 推薦 badge 正確顯示
- `isTop = FALSE` 或空白的歌曲不顯示 badge
- 本地 CSV 測試可在無網路時驗證

---

## 不在範圍內

- GAS 端修改（只加前端 mapping，GAS 欄位由使用者自行在 Google Sheet 新增）
- 管理介面
- 功能開關（全部預設啟用）

---

## 成功標準

- 重構所有現有功能行為不變（已在重構 spec 定義）
- 5 個新功能各自通過測試驗證後，由使用者確認再 commit
- 每個功能一個 commit，共 5 個 commit
