# Music Lab — 個人音樂製作知識庫

這是以 **HTML + CSS + Vanilla JavaScript** 建構的靜態網站，適合透過 GitHub Pages 免費發布，不需要 Node.js、React、資料庫或付費服務。

## 主要功能

- C 調式實驗室：七種調式、互動鍵盤、音階／和弦播放。
- Serum 1 → Vital 功能位置對照與 K-pop 音色配方。
- Funk、Acid Jazz、UK Garage、編曲及混音知識。
- **主題教材**：直接讀取 `content/articles.json`，可在 GitHub 上修改並發布。
- 個人知識筆記、練習日誌：存於目前瀏覽器的 `localStorage`，支援 JSON 匯出和匯入。

## GitHub Pages 部署（第一次）

1. 開啟 <https://github.com/new>，Owner 選你的個人帳號，Repository name 填 `music-lab`，Visibility 選 **Public**，建立新儲存庫。
2. 把此資料夾**內的檔案與資料夾**上傳到 Repository 根目錄，確保 `index.html` 在最上層。（建議使用 Git CLI 或 SourceTree；不要只上傳 ZIP。）
3. Repo → **Settings → Pages** → Build and deployment → **Deploy from a branch** → 選 `main` 及 `/(root)` → Save。
4. 部署後理論網址為 `https://tp6m4vu6.github.io/music-lab/`（實際以 GitHub Pages 設定頁顯示為準）。

官方部署說明：<https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site>

## 如何新增正式教材

在 GitHub 編輯 `content/articles.json`，新增如下項目（維持合法 JSON 語法，最後一個物件不能多一個逗號）：

```json
{
  "id": "my-vital-lead",
  "title": "Vital Lead 音色教學",
  "category": "合成器教學",
  "tags": ["Vital", "K-pop"],
  "summary": "一小段教學摘要",
  "body": "第一步：選擇波形。\n第二步：設定包絡。",
  "sourceUrl": "https://vital.audio/"
}
```

儲存並 commit 到 `main` 後，GitHub Pages 會自動發布。請保持每篇文章的 `id` 唯一；`sourceUrl` 可省略。用 Codex 修改教材通常最輕鬆，可以直接指定「請幫我在 `content/articles.json` 新增一篇關於 XXX 的文章，維持現有格式」。

想修改既有的內建表格／調式資料：`assets/content.js`。要修改互動功能：`assets/app.js`。調整畫面：`assets/styles.css`。

## 如何本機預覽

在專案根目錄執行：

```bash
python -m http.server 8000
```

開啟 <http://localhost:8000/>。**請不要只用雙擊 `index.html` 驗證主題教材**：瀏覽器的 `file://` 安全限制可能阻止讀取 JSON。

## 重要：個人筆記不是 GitHub 資料

- 正式教材 `content/articles.json` 由 GitHub 管理；公開儲存庫的內容任何人都能看到。
- 個人筆記和練習日誌使用瀏覽器 `localStorage`，**不會自動 push 到 GitHub，也不會跨電腦同步**。
- 在筆記頁使用「匯出 JSON 備份」，切換電腦或瀏覽器可使用「匯入備份」。
- 不要把私人筆記備份或 API Token 提交到公開 Repository。

## 專案結構

```text
music-lab/
├── index.html                 # 網站頁面
├── assets/
│   ├── styles.css             # 網站樣式
│   ├── content.js             # 內建調式／合成器／曲風／資源資料
│   └── app.js                 # 互動、搜尋、筆記及練習紀錄
├── content/
│   └── articles.json          # GitHub 可持續新增的正式教材
├── .nojekyll                 # 避免 Jekyll 進一步處理靜態站
└── README.md
```