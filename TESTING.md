# Story Frame Lab 測試方式

如果本機可以正常安裝 npm 套件，請使用正式 Vite 版本：

```bash
npm install
npm run dev
```

接著開啟 Vite 顯示的網址。

如果 npm registry 或套件安裝受限，可以使用免安裝測試版：

```bash
npm run demo
```

接著開啟：

```text
http://localhost:5173/demo.html
```

`demo.html` 使用 React、ReactDOM、Babel 與 Tailwind CDN，目的是讓產品原型可以快速被測試與展示；正式可維護版本仍位於 `src/` 目錄。
