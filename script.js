function calculateRemainingDays(expirationDate) {
    const now = new Date();
    const expDate = new Date(expirationDate);
    const diffTime = expDate - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function getStatus(daysRemaining) {
    if (daysRemaining > 30) {
        return { text: "✅ 正常", class: "status-normal", rowClass: "row-normal" };
    } else if (daysRemaining >= 7 && daysRemaining <= 30) {
        return { text: "⚠️ 即将到期", class: "status-warning", rowClass: "row-warning" };
    } else if (daysRemaining >= 1 && daysRemaining < 7) {
        return { text: "❌ 急需续费", class: "status-danger", rowClass: "row-danger" };
    } else {
        return { text: "🕑 已过期", class: "status-expired", rowClass: "row-expired" };
    }
}

function renderStats() {
    const statsContainer = document.getElementById('statsCards');
    const total = assets.length;
    const expired = assets.filter(a => calculateRemainingDays(a.expirationDate) < 0).length;
    const urgent = assets.filter(a => {
        const d = calculateRemainingDays(a.expirationDate);
        return d >= 0 && d < 7;
    }).length;
    const warning = assets.filter(a => {
        const d = calculateRemainingDays(a.expirationDate);
        return d >= 7 && d <= 30;
    }).length;
    const normal = total - expired - urgent - warning;

    statsContainer.innerHTML = `
        <div class="stat-card"><div class="number">${total}</div><div class="label">总资产数</div></div>
        <div class="stat-card"><div class="number">${normal}</div><div class="label">✅ 正常</div></div>
        <div class="stat-card"><div class="number">${warning}</div><div class="label">⚠️ 即将到期</div></div>
        <div class="stat-card"><div class="number">${urgent}</div><div class="label">❌ 急需续费</div></div>
        <div class="stat-card"><div class="number">${expired}</div><div class="label">🕑 已过期</div></div>
    `;
}

function renderTable() {
    const tbody = document.querySelector('#assetsTable tbody');
    tbody.innerHTML = '';

    assets.forEach(asset => {
        const remainingDays = calculateRemainingDays(asset.expirationDate);
        const status = getStatus(remainingDays);

        let rowClass = '';
        if (remainingDays < 0) rowClass = 'row-expired';
        else if (remainingDays < 7) rowClass = 'row-danger';
        else if (remainingDays <= 30) rowClass = 'row-warning';
        else rowClass = 'row-normal';

        const row = document.createElement('tr');
        row.className = rowClass;
        row.innerHTML = `
            <td>${asset.name}</td>
            <td>${asset.provider}</td>
            <td>${asset.renewalPrice}</td>
            <td>${asset.expirationDate}</td>
            <td>${asset.nextRenewalDate}</td>
            <td>${remainingDays} 天</td>
            <td><span class="status-badge ${status.class}">${status.text}</span></td>
            <td>${asset.notes}</td>
            <td><a href="${asset.link}" target="_blank" class="action-btn">🔗 前往续费</a></td>
        `;
        tbody.appendChild(row);
    });
}

// 初始化渲染
renderTable();
renderStats();

// =============================================================
// 自动刷新倒计时（每 1 小时 = 3600000ms）
// =============================================================
const REFRESH_INTERVAL = 60 * 60 * 1000; // 1 小时
// const REFRESH_INTERVAL = 24 * 60 * 60 * 1000; // 改成每天
let timeLeft = REFRESH_INTERVAL / 1000; // 秒

// 创建倒计时显示元素
const countdownEl = document.createElement('div');
countdownEl.id = 'auto-refresh-countdown';
countdownEl.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: rgba(0,0,0,0.75);
    color: #fff;
    padding: 8px 14px;
    border-radius: 8px;
    font-size: 0.85rem;
    font-family: inherit;
    z-index: 1000;
    backdrop-filter: blur(4px);
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    transition: opacity 0.3s;
`;
document.body.appendChild(countdownEl);

function updateCountdown() {
    const mins = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const secs = (timeLeft % 60).toString().padStart(2, '0');
    countdownEl.textContent = `刷新倒计时 ${mins}:${secs}`;
    timeLeft--;
}

function scheduleRefresh() {
    setTimeout(() => {
        // 重新渲染
        renderTable();
        renderStats();
        // 重置倒计时
        timeLeft = REFRESH_INTERVAL / 1000;
        updateCountdown();
        // 继续循环
        scheduleRefresh();
    }, REFRESH_INTERVAL);
}

// 启动倒计时显示（每秒更新）
updateCountdown();
const countdownInterval = setInterval(updateCountdown, 1000);

// 启动首次自动刷新
scheduleRefresh();

// 可选：手动刷新按钮（放右上角）
const refreshBtn = document.createElement('button');
refreshBtn.textContent = '手动刷新';
refreshBtn.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #6366f1;
    color...
    padding: 6px 12px;
    border: none;
    border-radius: 6px;
    font-size: 0.8rem;
    cursor: pointer;
    z-index: 1000;
    box-shadow: 0 2px 6px rgba(99,102,241,0.3);
`;
refreshBtn.onclick = () => {
    renderTable();
    renderStats();
    timeLeft = REFRESH_INTERVAL / 1000;
    updateCountdown();
};
document.body.appendChild(refreshBtn);


// =============================================================
// 【一键增强包】：搜索 + 排序 + 时间 + 饼图 + 导出 + 本地保存
// 完全不改你原有代码，自动挂载
// =============================================================

(() => {
    'use strict';

    // ================== 1. 当前时间显示 ==================
    const timeEl = document.createElement('div');
    timeEl.id = 'current-time';
    timeEl.style.cssText = `
        position: fixed; top: 20px; left: 20px; color: #fff; 
        font-size: 0.9rem; background: rgba(0,0,0,0.6); 
        padding: 6px 12px; border-radius: 6px; z-index: 1000;
        backdrop-filter: blur(4px);
    `;
    document.body.appendChild(timeEl);

    function updateTime() {
        const now = new Date();
        timeEl.textContent = `🕒 ${now.toLocaleString('zh-CN', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        })}`;
    }
    updateTime();
    setInterval(updateTime, 1000);

    // ================== 2. 搜索框 + 筛选 ==================
    const searchBox = document.createElement('input');
    searchBox.type = 'text';
    searchBox.placeholder = '🔍 搜索名称 / 提供商 / 备注...';
    searchBox.style.cssText = `
        width: 100%; max-width: 400px; padding: 10px 14px;
        margin: 15px 0; border: 1px solid #ddd; border-radius: 8px;
        font-size: 1rem; outline: none; transition: border 0.2s;
    `;
    searchBox.addEventListener('input', () => filterAndSort());
    document.querySelector('.container').insertBefore(searchBox, document.querySelector('.stats-cards'));

    // ================== 3. 到期排序按钮 ==================
    const sortBtn = document.createElement('button');
    sortBtn.textContent = '📅 按到期时间排序';
    sortBtn.style.cssText = `
        margin-left: 10px; padding: 8px 14px; background: #6366f1; color: #fff;
        border: none; border-radius: 6px; font-size: 0.9rem; cursor: pointer;
    `;
    sortBtn.onclick = () => {
        sortAscending = !sortAscending;
        sortBtn.textContent = sortAscending ? '📅 按到期升序' : '📅 按到期降序';
        filterAndSort();
    };
    let sortAscending = true;
    searchBox.parentNode.insertBefore(sortBtn, searchBox.nextSibling);

    // ================== 4. 状态饼图 (Chart.js CDN) ==================
    const chartScript = document.createElement('script');
    chartScript.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    document.head.appendChild(chartScript);

    const chartContainer = document.createElement('div');
    chartContainer.style.cssText = `margin: 30px 0; height: 300px;`;
    document.querySelector('.container').insertBefore(chartContainer, document.querySelector('.table-container'));

    let chartInstance = null;

    // ================== 5. 导出 CSV 按钮 ==================
    const exportBtn = document.createElement('button');
    exportBtn.textContent = '📤 导出 CSV';
    exportBtn.style.cssText = `
        margin-left: 10px; padding: 8px 14px; background: #10b981; color: #fff;
        border: none; border-radius: 6px; font-size: 0.9rem; cursor: pointer;
    `;
    exportBtn.onclick = exportToCSV;
    sortBtn.parentNode.insertBefore(exportBtn, sortBtn.nextSibling);

    // ================== 6. 本地保存按钮 ==================
    const saveBtn = document.createElement('button');
    saveBtn.textContent = '💾 保存到本地';
    saveBtn.style.cssText = `
        margin-left: 10px; padding: 8px 14px; background: #f59e0b; color: #fff;
        border: none; border-radius: 6px; font-size: 0.9rem; cursor: pointer;
    `;
    saveBtn.onclick = () => localStorage.setItem('cloudAssets', JSON.stringify(assets));
    exportBtn.parentNode.insertBefore(saveBtn, exportBtn.nextSibling);

    const loadBtn = document.createElement('button');
    loadBtn.textContent = '📂 加载本地数据';
    loadBtn.style.cssText = `
        margin-left: 10px; padding: 8px 14px; background: #8b5cf6; color: #fff;
        border: none; border-radius: 6px; font-size: 0.9rem; cursor: pointer;
    `;
    loadBtn.onclick = () => {
        const saved = localStorage.getItem('cloudAssets');
        if (saved && confirm('加载本地数据将覆盖当前数据，确定吗？')) {
            Object.assign(assets, JSON.parse(saved));
            renderAll();
        }
    };
    saveBtn.parentNode.insertBefore(loadBtn, saveBtn.nextSibling);

    // =============================================================
    // 核心渲染函数（搜索 + 排序 + 饼图 + 统计）
    // =============================================================
    function filterAndSort() {
        const query = searchBox.value.toLowerCase();
        let filtered = assets.filter(a => 
            a.name.toLowerCase().includes(query) ||
            a.provider.toLowerCase().includes(query) ||
            (a.notes && a.notes.toLowerCase().includes(query))
        );

        filtered.sort((a, b) => {
            const da = new Date(a.expirationDate);
            const db = new Date(b.expirationDate);
            return sortAscending ? da - db : db - da;
        });

        renderTable(filtered);
        renderStats(filtered);
        renderPieChart(filtered);
    }

    function renderAll() {
        filterAndSort();
    }

    // 重写 renderTable 支持传入数据
    window.renderTable = function (data = assets) {
        const tbody = document.querySelector('#assetsTable tbody');
        tbody.innerHTML = '';
        data.forEach(asset => {
            const remainingDays = calculateRemainingDays(asset.expirationDate);
            const status = getStatus(remainingDays);
            const rowClass = remainingDays < 0 ? 'row-expired' :
                            remainingDays < 7 ? 'row-danger' :
                            remainingDays <= 30 ? 'row-warning' : 'row-normal';

            const row = document.createElement('tr');
            row.className = rowClass;
            row.innerHTML = `
                <td>${asset.name}</td>
                <td>${asset.provider}</td>
                <td>${asset.renewalPrice}</td>
                <td>${asset.expirationDate}</td>
                <td>${asset.nextRenewalDate}</td>
                <td>${remainingDays} 天</td>
                <td><span class="status-badge ${status.class}">${status.text}</span></td>
                <td>${asset.notes || ''}</td>
                <td><a href="${asset.link}" target="_blank" class="action-btn">前往续费</a></td>
            `;
            tbody.appendChild(row);
        });
    };

    // 重写 renderStats 支持传入数据
    window.renderStats = function (data = assets) {
        const total = data.length;
        const expired = data.filter(a => calculateRemainingDays(a.expirationDate) < 0).length;
        const urgent = data.filter(a => {
            const d = calculateRemainingDays(a.expirationDate);
            return d >= 0 && d < 7;
        }).length;
        const warning = data.filter(a => {
            const d = calculateRemainingDays(a.expirationDate);
            return d >= 7 && d <= 30;
        }).length;
        const normal = total - expired - urgent - warning;

        document.getElementById('statsCards').innerHTML = `
            <div class="stat-card"><div class="number">${total}</div><div class="label">总资产数</div></div>
            <div class="stat-card"><div class="number">${normal}</div><div class="label">正常</div></div>
            <div class="stat-card"><div class="number">${warning}</div><div class="label">即将到期</div></div>
            <div class="stat-card"><div class="number">${urgent}</div><div class="label">急需续费</div></div>
            <div class="stat-card"><div class="number">${expired}</div><div class="label">已过期</div></div>
        `;
    };

    // 饼图渲染
    function renderPieChart(data) {
        if (!window.Chart) return setTimeout(() => renderPieChart(data), 100);

        const counts = {
            normal: 0, warning: 0, danger: 0, expired: 0
        };
        data.forEach(a => {
            const d = calculateRemainingDays(a.expirationDate);
            if (d > 30) counts.normal++;
            else if (d >= 7) counts.warning++;
            else if (d >= 0) counts.danger++;
            else counts.expired++;
        });

        const ctx = document.createElement('canvas');
        chartContainer.innerHTML = '';
        chartContainer.appendChild(ctx);

        if (chartInstance) chartInstance.destroy();
        chartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['正常', '即将到期', '急需续费', '已过期'],
                datasets: [{
                    data: [counts.normal, counts.warning, counts.danger, counts.expired],
                    backgroundColor: ['#10b981', '#f59e0b', '#ef4444', '#6b7280'],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { padding: 20, font: { size: 14 } } },
                    tooltip: { callbacks: { label: ctx => `${ctx.label}: ${ctx.raw} 个` } }
                }
            }
        });
    }

    // 导出 CSV
    function exportToCSV() {
        const headers = ['名称', '提供商', '续费价格', '到期时间', '下次续费时间', '剩余天数', '状态', '备注', '续费链接'];
        const rows = assets.map(a => {
            const days = calculateRemainingDays(a.expirationDate);
            const status = days < 0 ? '已过期' :
                          days < 7 ? '急需续费' :
                          days <= 30 ? '即将到期' : '正常';
            return [
                a.name, a.provider, a.renewalPrice, a.expirationDate,
                a.nextRenewalDate, days, status, a.notes || '', a.link
            ];
        });

        const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `云资产清单_${new Date().toISOString().slice(0,10)}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    }

    // 启动
    chartScript.onload = () => renderAll();
    setTimeout(renderAll, 100); // 兼容
})();