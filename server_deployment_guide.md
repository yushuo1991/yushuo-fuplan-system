# 服务器部署指南

## 服务器信息
- 服务器地址: 107.173.154.147
- 域名: yushuo.click
- 建议子域名: fupan.yushuo.click

## 部署步骤

### 1. 服务器环境准备

首先确保服务器已安装：
- Node.js (推荐版本 18+)
- Nginx
- Git
- PM2 (用于进程管理)

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装Nginx
sudo apt install nginx -y

# 安装Git
sudo apt install git -y

# 安装PM2
sudo npm install -g pm2

# 创建项目目录
sudo mkdir -p /var/www/fupan
sudo chown -R $USER:$USER /var/www/fupan
```

### 2. 配置域名DNS

在域名管理面板中添加A记录：
```
主机记录: fupan
记录类型: A
记录值: 107.173.154.147
TTL: 默认
```

### 3. 部署项目文件

#### 方式一：使用本地自动化脚本（推荐）

在Windows本地项目根目录运行：
```batch
deploy_to_server.bat
```

#### 方式二：手动部署

```bash
# 在服务器上执行
cd /var/www/fupan

# 如果是首次部署
git clone https://github.com/yourusername/your-repo.git .

# 如果已有项目，更新代码
git pull origin main

# 安装依赖
npm install

# 复制环境变量文件
cp .env.local.example .env.local
# 编辑.env.local文件，填入正确的Supabase配置

# 构建项目
npm run build
```

### 4. 配置Nginx

创建Nginx配置文件：

```bash
sudo nano /etc/nginx/sites-available/fupan.yushuo.click
```

添加以下内容：

```nginx
server {
    listen 80;
    server_name fupan.yushuo.click;
    
    # 重定向到HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name fupan.yushuo.click;
    
    # SSL配置（需要先获取SSL证书）
    ssl_certificate /etc/letsencrypt/live/fupan.yushuo.click/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/fupan.yushuo.click/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    root /var/www/fupan/dist;
    index index.html;
    
    # 处理React Router
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # 静态文件缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Gzip压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;
}
```

启用站点：
```bash
sudo ln -s /etc/nginx/sites-available/fupan.yushuo.click /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 5. 获取SSL证书

使用Let's Encrypt免费SSL证书：

```bash
# 安装certbot
sudo apt install certbot python3-certbot-nginx -y

# 获取SSL证书
sudo certbot --nginx -d fupan.yushuo.click

# 设置自动续期
sudo crontab -e
# 添加以下行：
# 0 12 * * * /usr/bin/certbot renew --quiet
```

### 6. 防火墙配置

```bash
# 允许HTTP和HTTPS流量
sudo ufw allow 'Nginx Full'
sudo ufw allow ssh
sudo ufw enable
```

### 7. 监控和日志

查看Nginx日志：
```bash
# 访问日志
sudo tail -f /var/log/nginx/access.log

# 错误日志
sudo tail -f /var/log/nginx/error.log
```

检查Nginx状态：
```bash
sudo systemctl status nginx
```

### 8. 更新部署

每次更新代码时：
```bash
cd /var/www/fupan
git pull origin main
npm install
npm run build
sudo systemctl reload nginx
```

## 访问地址

部署完成后，朋友们可以通过以下地址访问：
- https://fupan.yushuo.click

## 备注

1. 确保服务器防火墙允许80和443端口
2. 定期备份数据库数据
3. 监控服务器资源使用情况
4. 及时更新SSL证书
5. 定期更新系统和依赖包安全补丁

## 故障排除

如果访问出现问题，检查：
1. DNS解析是否正确：`nslookup fupan.yushuo.click`
2. Nginx配置是否有语法错误：`sudo nginx -t`
3. SSL证书是否有效：`sudo certbot certificates`
4. 防火墙设置是否正确：`sudo ufw status`