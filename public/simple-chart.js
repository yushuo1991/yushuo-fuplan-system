// 简单图表库 - Chart.js的轻量级替代方案
class SimpleChart {
    constructor(canvas, config) {
        // 确保canvas是DOM元素
        if (typeof canvas === 'string') {
            this.canvas = document.getElementById(canvas);
        } else {
            this.canvas = canvas;
        }
        
        if (!this.canvas || typeof this.canvas.getContext !== 'function') {
            throw new Error('Canvas element not found or invalid');
        }
        
        this.ctx = this.canvas.getContext('2d');
        this.config = config;
        this.destroyed = false;
        
        // 设置canvas尺寸
        this.canvas.width = this.canvas.offsetWidth || 400;
        this.canvas.height = this.canvas.offsetHeight || 400;
        
        this.render();
    }
    
    render() {
        if (this.destroyed) return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.config.type === 'doughnut') {
            this.renderDoughnut();
        }
    }
    
    renderDoughnut() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 40;
        const innerRadius = radius * 0.6;
        
        const data = this.config.data.datasets[0].data;
        const labels = this.config.data.labels;
        const colors = this.config.data.datasets[0].backgroundColor;
        const total = data.reduce((sum, value) => sum + value, 0);
        
        let currentAngle = -Math.PI / 2; // 从顶部开始
        
        // 绘制扇形
        data.forEach((value, index) => {
            const sliceAngle = (value / total) * 2 * Math.PI;
            
            // 绘制外圈
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            this.ctx.arc(centerX, centerY, innerRadius, currentAngle + sliceAngle, currentAngle, true);
            this.ctx.closePath();
            this.ctx.fillStyle = colors[index] || this.getDefaultColor(index);
            this.ctx.fill();
            
            // 绘制边框
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            
            currentAngle += sliceAngle;
        });
        
        // 绘制图例
        this.renderLegend(labels, colors, data, total);
        
        // 绘制标题
        if (this.config.options?.plugins?.title?.display) {
            this.renderTitle();
        }
    }
    
    renderLegend(labels, colors, data, total) {
        const legendY = this.canvas.height - 120;
        const itemWidth = 120;
        const itemHeight = 20;
        const startX = 20;
        
        this.ctx.font = '12px Arial';
        
        labels.forEach((label, index) => {
            const x = startX + (index % 3) * itemWidth;
            const y = legendY + Math.floor(index / 3) * itemHeight;
            
            // 绘制色块
            this.ctx.fillStyle = colors[index] || this.getDefaultColor(index);
            this.ctx.fillRect(x, y - 8, 12, 12);
            
            // 绘制文本
            this.ctx.fillStyle = '#333';
            const percentage = ((data[index] / total) * 100).toFixed(1);
            this.ctx.fillText(`${label}: ${data[index]}只 (${percentage}%)`, x + 18, y + 2);
        });
    }
    
    renderTitle() {
        const title = this.config.options.plugins.title.text;
        this.ctx.font = 'bold 16px Arial';
        this.ctx.fillStyle = '#333';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(title, this.canvas.width / 2, 25);
        this.ctx.textAlign = 'start';
    }
    
    getDefaultColor(index) {
        const colors = [
            '#2563eb', '#10b981', '#f59e0b', '#ef4444', '#06b6d4',
            '#8b5cf6', '#f97316', '#84cc16', '#ec4899', '#6b7280'
        ];
        return colors[index % colors.length];
    }
    
    destroy() {
        this.destroyed = true;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    // 静态方法，模拟Chart.js的API
    static register() {
        // 空方法，保持兼容性
    }
}

// 全局暴露，替代Chart.js
window.Chart = SimpleChart;
window.Chart.version = '1.0.0-simple';

// 添加一些Chart.js常用的静态属性
window.Chart.defaults = {
    responsive: true,
    maintainAspectRatio: false
};

console.log('SimpleChart 已加载，替代 Chart.js');