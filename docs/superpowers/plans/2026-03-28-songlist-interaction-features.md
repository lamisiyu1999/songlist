# Songlist 互動功能 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在已完成 Alpine.js 重構的 `index.html` 上，依序實作 5 個新互動功能，每個功能通過驗證後分別提交一個 commit。

**Architecture:** 所有變更集中在單一 `index.html`（CSS + Alpine component）。功能 5（isTop）另外建立 `test/mock-songs.js` 做本地測試。無 build step，無外部依賴。

**Tech Stack:** Alpine.js 3.x (CDN), vanilla CSS, `navigator.clipboard` API

---

## Pre-task：驗證 Alpine 重構並提交 commit

**Files:**
- Verify: `index.html`

- [ ] **Step 1：啟動本地伺服器**

```bash
npx serve . -p 3000
```

在瀏覽器開啟 `http://localhost:3000`

- [ ] **Step 2：逐項確認功能正常**

| 項目 | 預期結果 |
|---|---|
| 頁面初次載入 | 出現 spinner「載入歌單中」 |
| 資料載入後 | spinner 消失，歌曲卡片出現 |
| 10 個 Tab | 全部顯示，點擊可切換 |
| 「所有歌曲」 | 雙欄 grid，每次重整順序不同 |
| 「加倍歌單」 | 顯示雙倍/三倍篩選列 |
| 「女歌手」等分類 | 左歌手右歌曲雙窗格 |
| 搜尋框 | 即時過濾結果 |
| 字數篩選 | 下拉有效過濾 |
| Badge 顏色 | 熟/不熟/吉他/台語/x2/x3 各自正確 |
| 歌單連結 | 跳到 Google Sheet |
| 立刻重整 | 清除快取並重新抓取 |
| 我想點歌 | 跳到外部頁面 |
| 第二次載入 | 資料立即出現（sessionStorage 快取） |

- [ ] **Step 3：確認全部正常後提交 commit**

```bash
git add index.html
git commit -m "$(cat <<'EOF'
refactor: complete Alpine.js migration

Replace vanilla JS DOM manipulation with Alpine.js component.
Centralized state, O(n) artist count, sessionStorage cache, loading spinner.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Task 1：一鍵複製歌名

**Files:**
- Modify: `index.html`

### 1-1：新增 CSS

- [ ] **Step 1：在 `<style>` 區塊的 `@keyframes spin` 之後加入以下 CSS**

在 `index.html` 的第 104 行（`@keyframes spin{to{transform:rotate(360deg)}}`）後面插入：

```css
    /* 複製歌名橫條 */
    .copy-bar{position:absolute;bottom:0;left:0;right:0;background:rgba(30,58,95,0.85);color:#7eb3e0;border:none;border-radius:0 0 14px 14px;padding:6px 0;font-size:12px;cursor:pointer;opacity:0;transition:opacity .2s;letter-spacing:.5px}
    .card:hover .copy-bar{opacity:1}
    .copy-bar.copied{background:rgba(20,80,45,0.92);color:#8fc96e}
    .card{position:relative;overflow:hidden}
```

> 注意：`.card{position:relative;overflow:hidden}` 是疊加在現有 `.card` rule 上的，不需要刪除原本的 `.card` rule。

### 1-2：Alpine component 新增 state 與 method

- [ ] **Step 2：在 `Alpine.data('songApp', () => ({` 的 state 宣告區（約第 258–270 行），加入 `copiedSong: null,`**

找到這一段：
```js
      tabs: CONFIG.CATEGORY_TABS,
      sheetUrl: CONFIG.SHEET_VIEW_URL,
```

改為：
```js
      tabs: CONFIG.CATEGORY_TABS,
      sheetUrl: CONFIG.SHEET_VIEW_URL,
      copiedSong: null,
```

- [ ] **Step 3：在 `formatDate` method 之後、`}));` 之前，加入 `copyTitle` method**

找到：
```js
      formatDate(updatedAt) {
        return updatedAt ? '更新：' + new Date(updatedAt).toLocaleString() : '';
      },
    }));
```

改為：
```js
      formatDate(updatedAt) {
        return updatedAt ? '更新：' + new Date(updatedAt).toLocaleString() : '';
      },

      copyTitle(song) {
        navigator.clipboard.writeText(song.title).then(() => {
          this.copiedSong = song;
          setTimeout(() => { this.copiedSong = null; }, 800);
        });
      },
    }));
```

### 1-3：HTML — Grid 版型卡片加入 copy-bar

- [ ] **Step 4：找到 Grid 版型的 `.card`（約第 161–179 行），在 `</div>` 閉合 `.card` 前加入 copy-bar**

找到：
```html
            <div class="card-footer meta">
              <span x-text="formatDate(song.updatedAt)"></span>
              <a x-show="song.url" class="link" :href="song.url" target="_blank" rel="noopener">播放/連結</a>
            </div>
          </div>
        </template>
      </div>
    </div>
```

改為：
```html
            <div class="card-footer meta">
              <span x-text="formatDate(song.updatedAt)"></span>
              <a x-show="song.url" class="link" :href="song.url" target="_blank" rel="noopener">播放/連結</a>
            </div>
            <button
              class="copy-bar"
              :class="copiedSong === song ? 'copied' : ''"
              @click.stop="copyTitle(song)"
              x-text="copiedSong === song ? '✓ 已複製！' : '複製歌名'">
            </button>
          </div>
        </template>
      </div>
    </div>
```

### 1-4：HTML — 雙窗格版型卡片加入 copy-bar

- [ ] **Step 5：找到雙窗格版型的 `.card`（約第 197–215 行），同樣方式加入 copy-bar**

找到：
```html
            <div class="card-footer meta">
              <span x-text="formatDate(song.updatedAt)"></span>
              <a x-show="song.url" class="link" :href="song.url" target="_blank" rel="noopener">播放/連結</a>
            </div>
          </div>
        </template>
      </div>
    </div>
```

改為：
```html
            <div class="card-footer meta">
              <span x-text="formatDate(song.updatedAt)"></span>
              <a x-show="song.url" class="link" :href="song.url" target="_blank" rel="noopener">播放/連結</a>
            </div>
            <button
              class="copy-bar"
              :class="copiedSong === song ? 'copied' : ''"
              @click.stop="copyTitle(song)"
              x-text="copiedSong === song ? '✓ 已複製！' : '複製歌名'">
            </button>
          </div>
        </template>
      </div>
    </div>
```

### 1-5：測試驗證

- [ ] **Step 6：人工視覺確認**

1. 在瀏覽器開啟 `http://localhost:3000`，等歌曲載入
2. 將滑鼠移到任一歌曲卡片 → 底部應出現「複製歌名」橫條
3. 點擊 → 橫條變綠色，文字變「✓ 已複製！」
4. 0.8 秒後 → 恢復原始藍色「複製歌名」

- [ ] **Step 7：在瀏覽器 DevTools Console 執行以下測試**

```js
// 測試 1：clipboard 內容正確
// 先 hover 並點擊任一歌曲的複製按鈕，然後執行：
navigator.clipboard.readText().then(text => {
  console.assert(text.length > 0, '剪貼簿不應為空');
  console.log('✓ 剪貼簿內容：', text);
});
```

```js
// 測試 2：驗證 copiedSong 在 800ms 後自動清除
const app = document.querySelector('[x-data]')._x_dataStack[0];
const firstSong = app.filtered[0];
app.copyTitle(firstSong);
console.assert(app.copiedSong === firstSong, '✓ copiedSong 已設定');
setTimeout(() => {
  console.assert(app.copiedSong === null, '✓ copiedSong 在 800ms 後清除');
}, 900);
```

- [ ] **Step 8：確認測試全部通過，由使用者確認後提交 commit**

```bash
git add index.html
git commit -m "$(cat <<'EOF'
feat: add one-click copy for song titles

Hover card to reveal copy bar at bottom. Click copies title to clipboard.
Button turns green with checkmark for 800ms then resets.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Task 2：隨機選歌（Lucky Pick）

**Files:**
- Modify: `index.html`

### 2-1：新增 CSS

- [ ] **Step 1：在 Task 1 新增的 CSS 之後繼續加入**

```css
    /* 隨機選歌按鈕（nav 內） */
    nav .tab-lucky{background:#3a2d0a;border-color:#7a6030;color:#f0c060}
    nav .tab-lucky:hover{background:#4a3d1a}

    /* 被選中的卡片閃爍動畫 */
    .card-picked{animation:pickFlash 1.5s ease forwards}
    @keyframes pickFlash{
      0%  {border-color:#f0c060;box-shadow:0 0 0 2px rgba(240,192,96,.5)}
      50% {border-color:#f0c060;box-shadow:0 0 14px 4px rgba(240,192,96,.35)}
      100%{border-color:#1e293b;box-shadow:none}
    }
```

### 2-2：Alpine component 新增 state 與 method

- [ ] **Step 2：在 `copiedSong: null,` 之後加入 `pickedSong: null,`**

找到：
```js
      copiedSong: null,
```

改為：
```js
      copiedSong: null,
      pickedSong: null,
```

- [ ] **Step 3：在 `copyTitle` method 之後加入 `luckyPick` method**

找到：
```js
      copyTitle(song) {
        navigator.clipboard.writeText(song.title).then(() => {
          this.copiedSong = song;
          setTimeout(() => { this.copiedSong = null; }, 800);
        });
      },
    }));
```

改為：
```js
      copyTitle(song) {
        navigator.clipboard.writeText(song.title).then(() => {
          this.copiedSong = song;
          setTimeout(() => { this.copiedSong = null; }, 800);
        });
      },

      luckyPick() {
        if (!this.filtered.length) return;
        const idx = Math.floor(Math.random() * this.filtered.length);
        this.pickedSong = this.filtered[idx];
        this.$nextTick(() => {
          const el = document.querySelector('.card-picked');
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
        setTimeout(() => { this.pickedSong = null; }, 1500);
      },
    }));
```

### 2-3：HTML — nav 加入隨機按鈕

- [ ] **Step 4：找到 nav 的 `</nav>` 結束標籤，在 `x-for` template 之後加入 Lucky Pick 按鈕**

找到：
```html
      <nav>
        <template x-for="tab in tabs" :key="tab">
          <button :class="tab === activeTab ? 'active' : ''" @click="setTab(tab)" x-text="tab"></button>
        </template>
      </nav>
```

改為：
```html
      <nav>
        <template x-for="tab in tabs" :key="tab">
          <button :class="tab === activeTab ? 'active' : ''" @click="setTab(tab)" x-text="tab"></button>
        </template>
        <button class="tab-lucky" @click="luckyPick()" title="從目前歌單隨機抽一首">🎲 隨機</button>
      </nav>
```

### 2-4：HTML — 兩個卡片模板加入 card-picked class 綁定

- [ ] **Step 5：Grid 版型的 `.card` 加入 class 綁定**

找到（Grid 版型，約第 161 行）：
```html
          <div class="card">
```

改為：
```html
          <div class="card" :class="pickedSong === song ? 'card-picked' : ''">
```

- [ ] **Step 6：雙窗格版型的 `.card` 加入 class 綁定**

找到（雙窗格版型）：
```html
          <div class="card">
```

改為：
```html
          <div class="card" :class="pickedSong === song ? 'card-picked' : ''">
```

### 2-5：測試驗證

- [ ] **Step 7：人工視覺確認**

1. 在瀏覽器開啟 `http://localhost:3000`，等歌曲載入
2. Nav 最右側應出現金色「🎲 隨機」按鈕
3. 點擊 → 頁面捲動到某首歌，該卡片有金色邊框閃爍動畫
4. 1.5 秒後 → 動畫消失，卡片恢復正常
5. 切換到「女歌手」Tab → 點擊隨機 → 確認被選中的歌曲是女歌手分類
6. 搜尋讓結果為零後點擊隨機 → 無任何反應（不 crash）

- [ ] **Step 8：在 DevTools Console 執行以下測試**

```js
// 測試：pickedSong 在 filtered 範圍內
const app = document.querySelector('[x-data]')._x_dataStack[0];
app.luckyPick();
if (app.pickedSong) {
  const inFiltered = app.filtered.includes(app.pickedSong);
  console.assert(inFiltered, '✓ pickedSong 必須在 filtered 裡');
  console.log('✓ 選中：', app.pickedSong.title, '| 在 filtered 內：', inFiltered);
}
```

```js
// 測試：空 filtered 時不 crash
const app = document.querySelector('[x-data]')._x_dataStack[0];
const original = app.filtered;
app.filtered = [];
app.luckyPick();
console.assert(app.pickedSong === null, '✓ 空清單時 pickedSong 應保持 null');
app.filtered = original;
```

- [ ] **Step 9：確認測試通過，由使用者確認後提交 commit**

```bash
git add index.html
git commit -m "$(cat <<'EOF'
feat: add lucky pick random song selection

Gold button in nav randomly picks from current tab's filtered songs.
Scrolls to picked card with gold flash animation for 1.5s.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Task 3：空狀態處理

**Files:**
- Modify: `index.html`

### 3-1：更新 Grid 版型空狀態文字

- [ ] **Step 1：找到 Grid 版型的 empty 文字，替換為友善提示**

找到：
```html
      <div class="empty" x-show="filtered.length === 0">此分頁沒有資料或條件太嚴格 : )</div>
```

改為：
```html
      <div class="empty" x-show="filtered.length === 0">目前找不到這首歌喔！可以試試其他關鍵字，或是向拉米敲碗～</div>
```

### 3-2：更新雙窗格版型的空狀態

- [ ] **Step 2：找到雙窗格右側歌曲窗格的空狀態，替換文字**

找到：
```html
        <div class="empty" x-show="selectedArtist && songsForSelectedArtist.length === 0">沒有符合的歌曲</div>
```

改為：
```html
        <div class="empty" x-show="selectedArtist && songsForSelectedArtist.length === 0">目前找不到這首歌喔！可以試試其他關鍵字，或是向拉米敲碗～</div>
```

### 3-3：測試驗證

- [ ] **Step 3：人工視覺確認**

1. 在搜尋框輸入「zzzzzzzzz」（不存在的關鍵字）
2. 應顯示：「目前找不到這首歌喔！可以試試其他關鍵字，或是向拉米敲碗～」
3. 清除搜尋框 → 文字消失，歌曲重新出現
4. 切換到「女歌手」Tab，點選任一歌手後在搜尋框輸入「zzzzzzzzz」
5. 右側應顯示相同的友善提示

- [ ] **Step 4：在 DevTools Console 執行測試**

```js
// 測試：空狀態文字正確
const emptyEls = document.querySelectorAll('.empty');
const friendlyMsg = '目前找不到這首歌喔！可以試試其他關鍵字，或是向拉米敲碗～';
let found = false;
emptyEls.forEach(el => { if (el.textContent.includes('向拉米敲碗')) found = true; });
// 先觸發空狀態
const app = document.querySelector('[x-data]')._x_dataStack[0];
app.search = 'zzzzzzzzz';
setTimeout(() => {
  const visibleEmpty = [...document.querySelectorAll('.empty')].filter(el =>
    el.style.display !== 'none' && el.textContent.includes('向拉米敲碗')
  );
  console.assert(visibleEmpty.length > 0, '✓ 空狀態應顯示友善訊息');
  console.log('✓ 找到友善空狀態訊息，共', visibleEmpty.length, '個');
  app.search = ''; // 還原
}, 100);
```

- [ ] **Step 5：確認測試通過，由使用者確認後提交 commit**

```bash
git add index.html
git commit -m "$(cat <<'EOF'
feat: improve empty state messaging

Replace generic empty message with friendly prompt to try other keywords
or request songs from Lamilan.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Task 4：Hover 微動畫

**Files:**
- Modify: `index.html`（CSS only）

### 4-1：新增 CSS 動畫

- [ ] **Step 1：在 Task 2 新增的 CSS 之後加入以下樣式**

```css
    /* 卡片 hover 效果 */
    .card{transition:transform .2s ease,box-shadow .2s ease}
    .card:not(.card-picked):hover{transform:translateY(-3px);box-shadow:0 8px 24px rgba(0,0,0,.45)}

    /* 搜尋/篩選切換時卡片淡入 */
    @keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
    .card{animation:fadeIn .25s ease}
```

> 注意：`.card` 有多個 rule 是正常的，CSS 會合併生效。`.card:not(.card-picked):hover` 確保 hover 的 `transform` 不干擾 `card-picked` 動畫。

### 4-2：測試驗證

- [ ] **Step 2：人工視覺確認**

1. 滑鼠移到任一歌曲卡片 → 應有輕微向上位移 + 陰影加深效果
2. 移開滑鼠 → 恢復原位，過渡順暢
3. 在搜尋框輸入關鍵字 → 過濾後的卡片應有淡入效果
4. 清除搜尋 → 卡片重新淡入
5. 點擊「🎲 隨機」→ 被選中卡片的金色閃爍動畫不受 hover 干擾

- [ ] **Step 3：確認視覺正常，由使用者確認後提交 commit**

```bash
git add index.html
git commit -m "$(cat <<'EOF'
feat: add hover micro-animations to song cards

Cards lift 3px with deeper shadow on hover. Filtered cards fade in
on search/filter changes. Picked card animation isolated from hover.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Task 5：置頂與推薦標籤（isTop）

**Files:**
- Modify: `index.html`
- Create: `test/mock-songs.js`
- Create: `test/songs.csv`

### 5-1：建立測試資料

- [ ] **Step 1：建立 `test/mock-songs.js`**

```js
// 本地測試用 mock 資料（模擬 Google Sheet 含 isTop 欄位）
// 使用方式：在 browser console 中執行此檔案後，
// 重新呼叫 fetchSheet 或直接注入 rows
window.__MOCK_SONGS__ = [
  { category: '女歌手', title: '愛你',     artist: '王心凌', note: '', url: '', updatedAt: '2024-01-01', familiarity: '熟',          multiplier: '',   isTop: 'TRUE'  },
  { category: '女歌手', title: '好想你',   artist: '四葉草', note: '', url: '', updatedAt: '2024-01-01', familiarity: '吉他可點|熟',  multiplier: '',   isTop: 'TRUE'  },
  { category: '女歌手', title: '我最親愛的',artist: '張惠妹', note: '', url: '', updatedAt: '2024-01-01', familiarity: '不熟',         multiplier: '',   isTop: 'FALSE' },
  { category: '男歌手', title: '平凡之路', artist: '朴樹',   note: '', url: '', updatedAt: '2024-01-01', familiarity: '熟',           multiplier: '',   isTop: 'TRUE'  },
  { category: '男歌手', title: '告白氣球', artist: '周杰倫', note: '', url: '', updatedAt: '2024-01-01', familiarity: '熟',           multiplier: 'x2', isTop: 'FALSE' },
  { category: '男歌手', title: '說散就散', artist: '周杰倫', note: '', url: '', updatedAt: '2024-01-01', familiarity: '不熟',         multiplier: 'x2', isTop: ''      },
  { category: '合唱',   title: '小幸運',   artist: '田馥甄', note: '', url: '', updatedAt: '2024-01-01', familiarity: '台語|熟',      multiplier: '',   isTop: ''      },
  { category: '加倍歌單',title: '一路向北',artist: '周杰倫', note: '', url: '', updatedAt: '2024-01-01', familiarity: '',             multiplier: 'x3', isTop: 'TRUE'  },
  { category: '其他...', title: '海闊天空',artist: 'Beyond', note: '', url: '', updatedAt: '2024-01-01', familiarity: '熟',           multiplier: '',   isTop: 'FALSE' },
];
```

- [ ] **Step 2：建立 `test/songs.csv`（參考格式，對應 Google Sheet 欄位順序）**

```csv
category,title,artist,note,url,updatedAt,familiarity,multiplier,isTop
女歌手,愛你,王心凌,,,2024-01-01,熟,,TRUE
女歌手,好想你,四葉草,,,2024-01-01,吉他可點|熟,,TRUE
女歌手,我最親愛的,張惠妹,,,2024-01-01,不熟,,FALSE
男歌手,平凡之路,朴樹,,,2024-01-01,熟,,TRUE
男歌手,告白氣球,周杰倫,,,2024-01-01,熟,x2,FALSE
男歌手,說散就散,周杰倫,,,2024-01-01,不熟,x2,
合唱,小幸運,田馥甄,,,2024-01-01,台語|熟,,
加倍歌單,一路向北,周杰倫,,,2024-01-01,,x3,TRUE
其他...,海闊天空,Beyond,,,2024-01-01,熟,,FALSE
```

### 5-2：Alpine — `_doFetch` 加入 mock 支援與 isTop mapping

- [ ] **Step 3：修改 `_doFetch()` 方法，加入 mock 資料支援並新增 isTop 欄位**

找到：
```js
      async _doFetch() {
        const url = CONFIG.GAS_URL + (CONFIG.GAS_URL.includes('?') ? '&' : '?') + 'cb=' + Date.now();
        const data = await jsonp(url);
        const arr = Array.isArray(data) ? data : (Array.isArray(data.data) ? data.data : []);
        return arr.map(r => r.category !== undefined ? r : ({
          category: r[0], title: r[1], artist: r[2], note: r[3],
          url: r[4], updatedAt: r[5], familiarity: r[6], multiplier: r[7]
        })).filter(x => x && x.title);
      },
```

改為：
```js
      async _doFetch() {
        if (window.__MOCK_SONGS__) return window.__MOCK_SONGS__;
        const url = CONFIG.GAS_URL + (CONFIG.GAS_URL.includes('?') ? '&' : '?') + 'cb=' + Date.now();
        const data = await jsonp(url);
        const arr = Array.isArray(data) ? data : (Array.isArray(data.data) ? data.data : []);
        return arr.map(r => r.category !== undefined ? r : ({
          category: r[0], title: r[1], artist: r[2], note: r[3],
          url: r[4], updatedAt: r[5], familiarity: r[6], multiplier: r[7], isTop: r[8]
        })).filter(x => x && x.title);
      },
```

### 5-3：Alpine — `applyFilters` 加入 isTop 排序

- [ ] **Step 4：修改 `applyFilters()` 最後的排序邏輯**

找到：
```js
        this.filtered = (this.activeTab === '所有歌曲') ? shuffle(pool) : pool;
```

改為：
```js
        if (this.activeTab === '所有歌曲') {
          const top = pool.filter(r => r.isTop === 'TRUE');
          const rest = shuffle(pool.filter(r => r.isTop !== 'TRUE'));
          this.filtered = [...top, ...rest];
        } else {
          pool.sort((a, b) => (b.isTop === 'TRUE' ? 1 : 0) - (a.isTop === 'TRUE' ? 1 : 0));
          this.filtered = pool;
        }
```

### 5-4：CSS — 新增 badge-gold

- [ ] **Step 5：在 `.badge-tw` 之後加入 `.badge-gold`**

找到：
```css
    .badge-tw{background:#0b1b2b;border-color:#1f4a6a;color:#a0d8ff}      /* 台語 */
```

改為：
```css
    .badge-tw{background:#0b1b2b;border-color:#1f4a6a;color:#a0d8ff}      /* 台語 */
    .badge-gold{background:#3a2d0a;border-color:#7a6030;color:#f0c060}     /* 推薦 */
```

### 5-5：HTML — Grid 版型卡片加入推薦 badge

- [ ] **Step 6：找到 Grid 版型的 badge 區塊，加入 isTop badge**

找到（Grid 版型 meta 區塊）：
```html
            <div class="meta">
              <span class="tag" x-text="song.category || '未分類'"></span>
              <template x-for="tok in famTokens(song.familiarity)" :key="tok">
                <span class="badge" :class="badgeClass(tok)" x-text="tok"></span>
              </template>
              <span class="badge" x-show="multBadgeText(song.multiplier)"
                :class="multBadgeClass(song.multiplier)"
                x-text="multBadgeText(song.multiplier)"></span>
            </div>
```

改為：
```html
            <div class="meta">
              <span class="tag" x-text="song.category || '未分類'"></span>
              <span class="badge badge-gold" x-show="song.isTop === 'TRUE'">⭐ 推薦</span>
              <template x-for="tok in famTokens(song.familiarity)" :key="tok">
                <span class="badge" :class="badgeClass(tok)" x-text="tok"></span>
              </template>
              <span class="badge" x-show="multBadgeText(song.multiplier)"
                :class="multBadgeClass(song.multiplier)"
                x-text="multBadgeText(song.multiplier)"></span>
            </div>
```

### 5-6：HTML — 雙窗格版型卡片加入推薦 badge

- [ ] **Step 7：同樣方式更新雙窗格版型的 meta 區塊**

找到（雙窗格版型 meta 區塊）：
```html
            <div class="meta">
              <span class="tag" x-text="song.category || '未分類'"></span>
              <template x-for="tok in famTokens(song.familiarity)" :key="tok">
                <span class="badge" :class="badgeClass(tok)" x-text="tok"></span>
              </template>
              <span class="badge" x-show="multBadgeText(song.multiplier)"
                :class="multBadgeClass(song.multiplier)"
                x-text="multBadgeText(song.multiplier)"></span>
            </div>
```

改為：
```html
            <div class="meta">
              <span class="tag" x-text="song.category || '未分類'"></span>
              <span class="badge badge-gold" x-show="song.isTop === 'TRUE'">⭐ 推薦</span>
              <template x-for="tok in famTokens(song.familiarity)" :key="tok">
                <span class="badge" :class="badgeClass(tok)" x-text="tok"></span>
              </template>
              <span class="badge" x-show="multBadgeText(song.multiplier)"
                :class="multBadgeClass(song.multiplier)"
                x-text="multBadgeText(song.multiplier)"></span>
            </div>
```

### 5-7：測試驗證（使用 mock 資料）

- [ ] **Step 8：載入 mock 資料並在 DevTools Console 執行測試**

在瀏覽器 Console 執行以下程式（注意：需在本地伺服器下執行才能載入 JS 檔）：

```js
// 注入 mock 資料
fetch('/test/mock-songs.js')
  .then(r => r.text())
  .then(code => {
    eval(code); // 設定 window.__MOCK_SONGS__
    const app = document.querySelector('[x-data]')._x_dataStack[0];
    app.rows = window.__MOCK_SONGS__;
    app.applyFilters(true);
    console.log('✓ Mock 資料已載入，共', app.rows.length, '首歌');
  });
```

然後執行驗證：

```js
// 等待 applyFilters 執行後確認
setTimeout(() => {
  const app = document.querySelector('[x-data]')._x_dataStack[0];

  // 測試 1：所有歌曲 Tab 中，isTop=TRUE 的歌在最前面
  app.activeTab = '所有歌曲';
  app.applyFilters(true);
  setTimeout(() => {
    const topSongs = app.filtered.filter(s => s.isTop === 'TRUE');
    const firstNonTop = app.filtered.findIndex(s => s.isTop !== 'TRUE');
    const lastTop = app.filtered.map(s => s.isTop === 'TRUE').lastIndexOf(true);
    console.assert(
      firstNonTop === -1 || lastTop < firstNonTop,
      '✓ isTop 歌曲排在所有非 isTop 歌曲之前（shuffle 範圍外）'
    );
    console.log('isTop 歌曲：', topSongs.map(s => s.title));

    // 測試 2：女歌手 Tab 中，isTop 歌曲排前面
    app.activeTab = '女歌手';
    app.applyFilters(true);
    setTimeout(() => {
      if (app.filtered.length > 1) {
        console.assert(
          app.filtered[0].isTop === 'TRUE',
          '✓ 女歌手 Tab 第一首應為 isTop=TRUE'
        );
        console.log('女歌手 Tab 順序：', app.filtered.map(s => `${s.title}(isTop=${s.isTop})`));
      }

      // 測試 3：isTop=FALSE 或空白的歌曲沒有 badge-gold
      const goldBadges = document.querySelectorAll('.badge-gold');
      const visibleGold = [...goldBadges].filter(el => el.style.display !== 'none');
      console.log('✓ 顯示中的 ⭐ 推薦 badge 數量：', visibleGold.length);
    }, 100);
  }, 100);
}, 200);
```

- [ ] **Step 9：人工視覺確認**

1. 「所有歌曲」Tab：前幾首應為有 ⭐ 推薦 badge 的歌曲
2. 切換到「女歌手」Tab：愛你、好想你（isTop=TRUE）應排在最前面
3. 「加倍歌單」Tab：一路向北（isTop=TRUE）應排第一
4. ⭐ 推薦 badge 為金色背景，顯示「⭐ 推薦」
5. isTop=FALSE 或空白的歌曲沒有推薦 badge

- [ ] **Step 10：確認測試通過，清除 mock 資料，由使用者確認後提交 commit**

確認 `window.__MOCK_SONGS__` 只存在於 `test/mock-songs.js`，不影響正式環境（正式環境不會載入 mock-songs.js，所以 `window.__MOCK_SONGS__` 為 `undefined`，`_doFetch` 會走正常 JSONP 流程）。

```bash
git add index.html test/mock-songs.js test/songs.csv
git commit -m "$(cat <<'EOF'
feat: add isTop sticky/hot tag support

Songs with isTop=TRUE appear first in each tab. isTop songs in
所有歌曲 are fixed at top; shuffle only applies to non-isTop songs.
Gold ⭐ 推薦 badge shown on isTop cards. Adds test mock data.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Self-Review

### Spec coverage

| Spec 需求 | 計畫對應 |
|---|---|
| 複製按鈕：hover 浮現底部橫條 | Task 1 — `.copy-bar` CSS + `.card:hover .copy-bar` |
| 複製回饋：按鈕原地變色 0.8s | Task 1 — `copyTitle()` + `.copy-bar.copied` CSS |
| 隨機選歌：Header nav 金色按鈕 | Task 2 — `nav .tab-lucky` CSS + HTML button |
| 隨機選歌：依 Tab 範圍抽取 | Task 2 — `luckyPick()` 從 `this.filtered` 抽取（filtered 已依 Tab 過濾） |
| 隨機選歌：捲動 + 金色閃爍 | Task 2 — `scrollIntoView` + `.card-picked` animation |
| 空狀態：友善提示文字 | Task 3 — 兩處 `.empty` 文字更新 |
| hover 微動畫：上移 + 陰影 | Task 4 — `.card:not(.card-picked):hover` CSS |
| 淡入動畫：搜尋切換時 | Task 4 — `@keyframes fadeIn` + `.card{animation:fadeIn}` |
| isTop：置頂排序 | Task 5 — `applyFilters()` 修改，isTop=TRUE 排前 |
| isTop：「所有歌曲」shuffle 只作用非 isTop | Task 5 — top 固定 + `shuffle(rest)` |
| isTop：金色 ⭐ 推薦 badge | Task 5 — `.badge-gold` CSS + 兩個卡片模板 |
| isTop：本地 CSV 測試 | Task 5 — `test/mock-songs.js` + `test/songs.csv` |

### Placeholder 掃描

無 TBD、TODO 或未完成步驟。

### Type consistency

- `copiedSong`（Task 1）、`pickedSong`（Task 2）在 state 宣告與 template 中使用一致
- `song.isTop === 'TRUE'` 在 `applyFilters` 與 HTML badge 中使用一致的字串比較
- `_doFetch` 中的 mock check 使用 `window.__MOCK_SONGS__`，與 `test/mock-songs.js` 定義一致
