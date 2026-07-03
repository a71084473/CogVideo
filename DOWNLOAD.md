# Story Frame Lab 檔案下載方式

你可以依照用途選擇下載整個專案，或只下載可快速展示的單一檔案。

---

## 方式一：下載整個專案資料夾

如果你在伺服器或本機已經有這個 repo，可以在 repo 上層目錄打包：

```bash
cd /workspace
zip -r CogVideo-story-frame-lab.zip CogVideo
```

打包完成後會得到：

```text
/workspace/CogVideo-story-frame-lab.zip
```

你可以再用 `scp` 從伺服器下載到自己的電腦：

```bash
scp user@your-server:/workspace/CogVideo-story-frame-lab.zip ./
```

---

## 方式二：只下載可展示的單一檔案 demo.html

如果你只想要能直接展示的原型檔案，下載或複製：

```text
demo.html
```

這個檔案可以直接上傳到伺服器，或改名成：

```text
index.html
```

例如從伺服器下載：

```bash
scp user@your-server:/workspace/CogVideo/demo.html ./demo.html
```

---

## 方式三：下載正式 Vite 原始碼

正式 React/Vite 版本需要以下檔案與資料夾：

```text
index.html
package.json
vite.config.js
tailwind.config.js
postcss.config.js
src/
```

可以直接打包這些檔案：

```bash
cd /workspace/CogVideo
tar -czf story-frame-lab-source.tar.gz index.html package.json vite.config.js tailwind.config.js postcss.config.js src
```

然後下載：

```bash
scp user@your-server:/workspace/CogVideo/story-frame-lab-source.tar.gz ./
```

---

## 方式四：如果你在 GitHub 或 Git 平台上

如果這個 repo 已經推到 GitHub、GitLab 或其他 Git 平台，可以直接用：

```bash
git clone <your-repository-url>
```

或在平台網頁上點選：

```text
Code → Download ZIP
```

---

## 下載後如何測試

如果你下載的是整包專案，進入資料夾後可以執行：

```bash
npm run demo
```

然後開啟：

```text
http://localhost:5173/demo.html
```

如果你只下載 `demo.html`，可以直接用瀏覽器打開，或用任何靜態網站伺服器提供它。
