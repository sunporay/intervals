# 統計區間報告：公開線上簡報

以 `/data2/408_Ray/統計區間報告.pdf` 為內容來源，完整呈現原始 11 頁簡報。`dist/report.pdf` 保留原始 PDF 檔案。

網頁提供按鈕、方向鍵與手機滑動翻頁、頁碼跳轉、縮圖總覽、全螢幕、複製目前頁面網址，以及 PDF 檢視與下載。

`dist/` 為靜態網站，不依賴外部 JavaScript、字型與分析服務。網站由 GitHub Pages 託管，不需要這台伺服器開機或對外開埠。

## 網址

- 線上簡報：https://sunporay.github.io/intervals/
- 原始 PDF：https://sunporay.github.io/intervals/report.pdf

GitHub Pages 提供 HTTPS，可直接分享 `https://` 網址。

## 部署方式

GitHub repo：`sunporay/intervals`（public，GitHub Pages 免費方案的必要條件）。

`.github/workflows/pages.yml` 會在推送到 `main` 時把 `dist/` 整個資料夾發佈到 Pages。更新流程：

```bash
git add dist
git commit -m "Update slides"
git push
```

推送後 Actions 會自動重新部署，約一分鐘生效。查看部署狀態：

```bash
gh run list --workflow pages.yml
gh run watch
```

也可以不改內容、手動重新部署：

```bash
gh workflow run pages.yml
```

## 本機預覽（選用）

`serve.py` 只公開 `dist/` 中的靜態檔案，不提供資料夾列表或上層檔案。現在僅用於本機預覽，不再需要對外服務：

```bash
/usr/bin/python3 serve.py --bind 127.0.0.1 --port 8765
```

原先的使用者服務 `statistical-intervals-report.service` 已停止並取消開機啟動，改由 GitHub Pages 託管。範本仍保存在本資料夾，如需恢復自架：

```bash
systemctl --user enable --now statistical-intervals-report.service
```

## 舊雲端網站

原 Sites 網站已取消公開，未永久刪除。`.openai/hosting.json` 僅保留舊雲端網站的身分供後續管理，已排除在 git 之外、不會上傳到公開 repo。
永久刪除請在 ChatGPT Sites 找到本網站，選擇 Delete site，輸入 `ray` 後確認。
