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