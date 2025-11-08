#!/bin/bash

# 服务器环境初始化脚本
# 适用于 Ubuntu/Debian 系统
# 服务器: 107.173.154.147
# 域名: fupan.yushuo.click

set -e  # 遇到错误立即退出

echo "======================================"
echo "开始初始化服务器环境..."
echo "服务器: 107.173.154.147"
echo "域名: fupan.yushuo.click"
echo "======================================"

# 检查是否为root用户
if [ "$EUID" -ne 0 ]; then 
    echo "请使用root权限运行此脚本"
    echo "使用命令: sudo ./server_setup_commands.sh"
    exit 1
fi

# 更新系统
echo "[1/8] 更新系统包..."
apt update && apt upgrade -y

# 安装基础工具
echo "[2/8] 安装基础工具..."
apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release ufw

# 安装Node.js 18
echo "[3/8] 安装Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# 验证Node.js安装
echo "Node.js版本: $(node --version)"
echo "npm版本: $(npm --version)"

# 安装PM2
echo "[4/8] 安装PM2进程管理器..."
npm install -g pm2

# 安装Nginx
echo "[5/8] 安装Nginx..."
apt install -y nginx

# 启动并启用Nginx
systemctl start nginx
systemctl enable nginx

# 安装Certbot (Let's Encrypt)
echo "[6/8] 安装SSL证书工具..."
apt install -y certbot python3-certbot-nginx

# 配置防火墙
echo "[7/8] 配置防火墙..."
ufw --force enable
ufw allow ssh
ufw allow 'Nginx Full'

# 创建项目目录
echo "[8/8] 创建项目目录..."
mkdir -p /var/www/fupan
chown -R www-data:www-data /var/www/fupan
chmod -R 755 /var/www/fupan

# 创建Nginx配置文件
echo "创建Nginx配置文件..."
cat > /etc/nginx/sites-available/fupan.yushuo.click << 'EOF'
# 临时HTTP配置，用于获取SSL证书
server {
    listen 80;
    server_name fupan.yushuo.click;
    
    root /var/www/fupan/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF

# 启用站点
ln -sf /etc/nginx/sites-available/fupan.yushuo.click /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# 测试Nginx配置
echo "测试Nginx配置..."
nginx -t

if [ $? -eq 0 ]; then
    systemctl reload nginx
    echo "✅ Nginx配置成功"
else
    echo "❌ Nginx配置错误，请检查"
    exit 1
fi

# 创建临时index页面
mkdir -p /var/www/fupan/dist
cat > /var/www/fupan/dist/index.html << 'EOF'
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>宇硕复盘图鉴 - 部署中</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; margin-top: 100px; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .status { color: #2563eb; font-size: 24px; margin-bottom: 20px; }
        .info { color: #666; line-height: 1.6; }
    </style>
</head>
<body>
    <div class="container">
        <h1 class="status">🚀 服务器环境初始化完成</h1>
        <div class="info">
            <p>宇硕复盘图鉴服务器环境已准备就绪</p>
            <p>请按照部署指南完成项目部署</p>
            <p>域名: fupan.yushuo.click</p>
            <p>时间: $(date)</p>
        </div>
    </div>
</body>
</html>
EOF

chown -R www-data:www-data /var/www/fupan/dist

echo ""
echo "======================================"
echo "✅ 服务器环境初始化完成！"
echo "======================================"
echo ""
echo "已完成的配置："
echo "✅ 系统更新"
echo "✅ Node.js $(node --version) 安装"
echo "✅ PM2 进程管理器安装"
echo "✅ Nginx Web服务器安装并配置"
echo "✅ SSL证书工具(Certbot)安装"
echo "✅ 防火墙配置(允许SSH、HTTP、HTTPS)"
echo "✅ 项目目录创建(/var/www/fupan)"
echo "✅ Nginx站点配置"
echo ""
echo "下一步操作："
echo "1. 配置DNS解析: fupan.yushuo.click -> 107.173.154.147"
echo "2. 获取SSL证书: sudo certbot --nginx -d fupan.yushuo.click"
echo "3. 部署项目文件: 运行 deploy_to_server.bat"
echo ""
echo "临时访问地址: http://fupan.yushuo.click"
echo ""

# 显示系统信息
echo "系统信息："
echo "- 操作系统: $(lsb_release -d | cut -f2)"
echo "- 内核版本: $(uname -r)"
echo "- 磁盘使用: $(df -h / | awk 'NR==2{print $5}')"
echo "- 内存使用: $(free -h | awk 'NR==2{printf "%.1f/%.1fGB (%.0f%%)\n", $3/1024/1024, $2/1024/1024, $3*100/$2}')"
echo ""
echo "服务状态："
echo "- Nginx: $(systemctl is-active nginx)"
echo "- UFW防火墙: $(systemctl is-active ufw)"
echo ""
echo "端口监听："
netstat -tlnp | grep -E ':80|:443' || echo "HTTP/HTTPS端口监听正常"

echo ""
echo "🎉 环境初始化完成！可以开始部署项目了。"