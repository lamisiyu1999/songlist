// 本地測試用 mock 資料（模擬 Google Sheet 含 isTop 欄位）
// 使用方式：在 browser console 注入後呼叫 app.rows = window.__MOCK_SONGS__; app.applyFilters(true)
window.__MOCK_SONGS__ = [
  { category: '女歌手', title: '愛你',      artist: '王心凌', note: '', url: '', updatedAt: '2024-01-01', familiarity: '熟',         multiplier: '',   isTop: 'TRUE'  },
  { category: '女歌手', title: '好想你',    artist: '四葉草', note: '', url: '', updatedAt: '2024-01-01', familiarity: '吉他可點|熟', multiplier: '',   isTop: 'TRUE'  },
  { category: '女歌手', title: '我最親愛的',artist: '張惠妹', note: '', url: '', updatedAt: '2024-01-01', familiarity: '不熟',        multiplier: '',   isTop: 'FALSE' },
  { category: '男歌手', title: '平凡之路',  artist: '朴樹',   note: '', url: '', updatedAt: '2024-01-01', familiarity: '熟',          multiplier: '',   isTop: 'TRUE'  },
  { category: '男歌手', title: '告白氣球',  artist: '周杰倫', note: '', url: '', updatedAt: '2024-01-01', familiarity: '熟',          multiplier: 'x2', isTop: 'FALSE' },
  { category: '男歌手', title: '說散就散',  artist: '周杰倫', note: '', url: '', updatedAt: '2024-01-01', familiarity: '不熟',        multiplier: 'x2', isTop: ''      },
  { category: '合唱',   title: '小幸運',    artist: '田馥甄', note: '', url: '', updatedAt: '2024-01-01', familiarity: '台語|熟',     multiplier: '',   isTop: ''      },
  { category: '加倍歌單',title: '一路向北', artist: '周杰倫', note: '', url: '', updatedAt: '2024-01-01', familiarity: '',            multiplier: 'x3', isTop: 'TRUE'  },
  { category: '其他...', title: '海闊天空', artist: 'Beyond', note: '', url: '', updatedAt: '2024-01-01', familiarity: '熟',          multiplier: '',   isTop: 'FALSE' },
];
