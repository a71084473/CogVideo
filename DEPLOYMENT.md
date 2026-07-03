# Story Frame Lab 伺服器部署方式

這個原型有兩種部署方式：

1. **快速展示版**：只上傳 `demo.html`，適合立刻給客戶或團隊看互動原型。
2. **正式 Vite 版**：在本機或 CI build 出 `dist/`，再把 `dist/` 上傳到伺服器。

---

## 方式一：快速展示版，只上傳 demo.html

如果你只是要先放到伺服器上展示，可以直接把 `demo.html` 上傳到網站根目錄。

例如你的伺服器網站目錄是：

```text
/var/www/story-frame-lab
```

可以執行：

```bash
scp demo.html user@your-server:/var/www/story-frame-lab/index.html
```

然後開啟：

```text
https://your-domain.com/
```

> 注意：`demo.html` 使用 React、ReactDOM、Babel 與 Tailwind CDN，因此使用者瀏覽時需要能連到 CDN。

---

## 方式二：正式 Vite 版，build 後上傳 dist

如果你的本機或 CI 可以正常安裝 npm 套件，建議用正式 Vite build：

```bash
npm install
npm run build
```

build 完會產生：

```text
dist/
```

把 `dist/` 裡面的所有檔案上傳到伺服器網站根目錄即可。

例如：

```bash
rsync -avz --delete dist/ user@your-server:/var/www/story-frame-lab/
```

---

## Nginx 範例設定

如果你的伺服器使用 Nginx，可以參考：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /var/www/story-frame-lab;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

設定完成後重新載入 Nginx：

```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## Apache 範例設定

如果使用 Apache，網站根目錄同樣指向上傳後的目錄，例如：

```apache
<VirtualHost *:80>
    ServerName your-domain.com
    DocumentRoot /var/www/story-frame-lab

    <Directory /var/www/story-frame-lab>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

---

## 部署後測試

可以用 curl 確認首頁是否可連線：

```bash
curl -I https://your-domain.com/
```

如果看到 `200 OK`，代表伺服器已正確提供頁面。
