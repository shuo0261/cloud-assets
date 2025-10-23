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
    //countdownEl.textContent = `刷新倒计时 ${mins}:${secs}`;
    countdownEl.textContent = `${mins}:${secs}`;
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

(() => {
    'use strict';

    // =============================================================
    // 1. 顶部工具栏（时间 + 刷新按钮）
    // =============================================================
    const toolbar = document.createElement('div');
    toolbar.id = 'top-toolbar';
    toolbar.style.cssText = `
        position:fixed;top:0;left:0;right:0;height:50px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color:#fff;z-index:1000;
        display:flex;align-items:center;justify-content:space-between;
        padding:0 16px;font-size:0.85rem;
        box-shadow:0 4px 12px rgba(102, 126, 234, 0.3);
        backdrop-filter:blur(8px);
        flex-wrap:wrap; 
    `;
    document.body.appendChild(toolbar);
    document.body.appendChild(toolbar);

    // 时间显示（左）
    const timeEl = document.createElement('div');
    timeEl.id = 'current-time';
    timeEl.style.cssText = 'white-space:nowrap;';
    toolbar.appendChild(timeEl);

    function updateTime() {
        const now = new Date();
        timeEl.textContent = `${now.toLocaleString('zh-CN', {
            year:'numeric',month:'2-digit',day:'2-digit',
            hour:'2-digit',minute:'2-digit',second:'2-digit'
        })}`;
    }
    updateTime();
    setInterval(updateTime, 1000);

    // 手动刷新按钮（右）
    const manualBtn = document.createElement('button');
    manualBtn.textContent = '刷新';
    manualBtn.style.cssText = `
        background:#6366f1;color:#fff;border:none;border-radius:6px;
        padding:6px 12px;font-size:0.8rem;cursor:pointer;
        box-shadow:0 1px 3px rgba(99,102,241,0.3);
    `;
    manualBtn.onclick = () => { renderAll(); timeLeft = REFRESH_INTERVAL/1000; updateCountdown(); };
    toolbar.appendChild(manualBtn);

    // =============================================================
    // 2. 搜索框
    // =============================================================
    const searchBox = document.createElement('input');
    searchBox.type = 'text';
    searchBox.placeholder = 'Search: 搜索名称 / 提供商 / 备注...';
    searchBox.style.cssText = `
        width:100%;max-width:400px;padding:10px 14px;margin:15px 0;
        border:1px solid #ddd;border-radius:8px;font-size:1rem;outline:none;
        transition:border 0.2s;
    `;
    searchBox.addEventListener('input', renderAll);

    // 延迟插入，确保 .container 已存在
    setTimeout(() => {
        const container = document.querySelector('.container');
        if (container) {
            container.style.paddingTop = '70px';  // 避免遮挡标题
            container.insertBefore(searchBox, document.querySelector('.stats-cards'));
        }
    }, 100);

    // =============================================================
    // 3. 排序状态
    // ===================================================
    const sortState = { price: 0, exp: 0, next: 0, remain: 0 };

    // =============================================================
    // 4. 续费价格解析（年化 + 货币换算）
    // =============================================================
    function parsePrice(str) {
        if (!str || str.toLowerCase() === 'free' || /一次性/.test(str)) {
            return { value: 0, isFree: true, original: str };
        }
        const m = str.match(/([¥$])?([\d.]+)\/?(.+)?/i);
        if (!m) return { value: Infinity, isFree: false, original: str };

        const currency = m[1] || '¥';
        const num = parseFloat(m[2]);
        const unit = (m[3] || '').toLowerCase();

        const monthMul = { '月': 1, '季': 3, '年': 12 }[unit] || 1;
        const rmb = currency === '$' ? num * 7.2 : num;
        const yearly = rmb * (12 / monthMul);

        return { value: yearly, isFree: false, original: str };
    }

    // =============================================================
    // 5. 获取排序后的数据
    // =============================================================
    function getSortedData(base = assets) {
        const q = searchBox.value.toLowerCase();
        let list = base.filter(a =>
            a.name.toLowerCase().includes(q) ||
            a.provider.toLowerCase().includes(q) ||
            (a.notes && a.notes.toLowerCase().includes(q))
        );

        // 默认：剩余天数越大越前
        if (sortState.price === 0 && sortState.exp === 0 && sortState.next === 0 && sortState.remain === 0) {
            list.sort((a, b) => {
                const da = calculateRemainingDays(a.expirationDate);
                const db = calculateRemainingDays(b.expirationDate);
                return db - da;
            });
        }
        else if (sortState.price !== 0) {
            list.sort((a, b) => {
                const pa = parsePrice(a.renewalPrice), pb = parsePrice(b.renewalPrice);
                if (pa.isFree && pb.isFree) return 0;
                if (pa.isFree) return sortState.price === 1 ? -1 : 1;
                if (pb.isFree) return sortState.price === 1 ? 1 : -1;
                return sortState.price === 1 ? pa.value - pb.value : pb.value - pa.value;
            });
        }
        else if (sortState.exp !== 0) {
            list.sort((a, b) => {
                const da = new Date(a.expirationDate), db = new Date(b.expirationDate);
                return sortState.exp === 1 ? da - db : db - da;
            });
        }
        else if (sortState.next !== 0) {
            list.sort((a, b) => {
                const da = new Date(a.nextRenewalDate), db = new Date(b.nextRenewalDate);
                return sortState.next === 1 ? da - db : db - da;
            });
        }
        else if (sortState.remain !== 0) {
            list.sort((a, b) => {
                const da = calculateRemainingDays(a.expirationDate);
                const db = calculateRemainingDays(b.expirationDate);
                return sortState.remain === 1 ? da - db : db - da;
            });
        }

        return list;
    }

    // =============================================================
    // 6. 表头排序
    // =============================================================
    function makeSortable(th, type) {
        th.style.cursor = 'pointer';
        th.title = '点击切换排序方式';
        th.innerHTML += ' <span class="sort-arrow"></span>';

        th.addEventListener('click', () => {
            Object.keys(sortState).forEach(k => { if (k !== type) sortState[k] = 0; });
            sortState[type] = (sortState[type] + 1) % 3;
            updateSortArrows();
            renderAll();
        });
    }

    function updateSortArrows() {
        document.querySelectorAll('th .sort-arrow').forEach(el => el.textContent = '');
        const arrows = { 1: '▲', 2: '▼' };
        if (sortState.price)  document.querySelector('th[data-sort="price"] .sort-arrow').textContent = arrows[sortState.price];
        if (sortState.exp)    document.querySelector('th[data-sort="exp"] .sort-arrow').textContent   = arrows[sortState.exp];
        if (sortState.next)   document.querySelector('th[data-sort="next"] .sort-arrow').textContent  = arrows[sortState.next];
        if (sortState.remain) document.querySelector('th[data-sort="remain"] .sort-arrow').textContent = arrows[sortState.remain];
    }

    // =============================================================
    // 7. 表格渲染
    // =============================================================
    const originalRenderTable = window.renderTable || (() => {});
    window.renderTable = function (data = assets) {
        originalRenderTable(data);
        const tbody = document.querySelector('#assetsTable tbody');
        tbody.innerHTML = '';
        data.forEach(asset => {
            const days = calculateRemainingDays(asset.expirationDate);
            const status = getStatus(days);
            const rowClass = days < 0 ? 'row-expired' :
                            days < 7 ? 'row-danger' :
                            days <= 30 ? 'row-warning' : 'row-normal';
            const tr = document.createElement('tr');
            tr.className = rowClass;
            tr.innerHTML = `
                <td>${asset.name}</td>
                <td>${asset.provider}</td>
                <td>${asset.renewalPrice}</td>
                <td>${asset.expirationDate}</td>
                <td>${asset.nextRenewalDate}</td>
                <td>${days} 天</td>
                <td><span class="status-badge ${status.class}">${status.text}</span></td>
                <td>${asset.notes || ''}</td>
                <td><a href="${asset.link}" target="_blank" class="action-btn">前往续费</a></td>
            `;
            tbody.appendChild(tr);
        });

        setTimeout(() => {
            const ths = document.querySelectorAll('#assetsTable thead th');
            if (!ths[2].hasAttribute('data-sort')) {
                ths[2].setAttribute('data-sort', 'price');
                ths[3].setAttribute('data-sort', 'exp');
                ths[4].setAttribute('data-sort', 'next');
                ths[5].setAttribute('data-sort', 'remain');
                ths.forEach(th => {
                    const t = th.getAttribute('data-sort');
                    if (t) makeSortable(th, t);
                });
            }
            updateSortArrows();
        }, 0);
    };

    // =============================================================
    // 8. 统计卡片
    // =============================================================
    window.renderStats = function (data = assets) {
        const total = data.length;
        const expired = data.filter(a => calculateRemainingDays(a.expirationDate) < 0).length;
        const urgent  = data.filter(a => { const d=calculateRemainingDays(a.expirationDate); return d>=0 && d<7; }).length;
        const warning = data.filter(a => { const d=calculateRemainingDays(a.expirationDate); return d>=7 && d<=30; }).length;
        const normal  = total - expired - urgent - warning;

        document.getElementById('statsCards').innerHTML = `
            <div class="stat-card"><div class="number">${total}</div><div class="label">总资产</div></div>
            <div class="stat-card"><div class="number">${normal}</div><div class="label">正常</div></div>
            <div class="stat-card"><div class="number">${warning}</div><div class="label">即将到期</div></div>
            <div class="stat-card"><div class="number">${urgent}</div><div class="label">急需续费</div></div>
            <div class="stat-card"><div class="number">${expired}</div><div class="label">已过期</div></div>
        `;
    };

    // =============================================================
    // 9. 饼图
    // =============================================================
    const chartScript = document.createElement('script');
    chartScript.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    document.head.appendChild(chartScript);

    const chartContainer = document.createElement('div');
    chartContainer.style.cssText = 'margin:30px 0;height:300px;';
    setTimeout(() => {
        document.querySelector('.container').insertBefore(chartContainer, document.querySelector('.table-container'));
    }, 100);

    let chartInstance = null;
    function renderPieChart(data) {
        if (!window.Chart) return setTimeout(() => renderPieChart(data), 100);
        const cnt = { normal:0, warning:0, danger:0, expired:0 };
        data.forEach(a => {
            const d = calculateRemainingDays(a.expirationDate);
            if (d>30) cnt.normal++;
            else if (d>=7) cnt.warning++;
            else if (d>=0) cnt.danger++;
            else cnt.expired++;
        });
        const ctx = document.createElement('canvas');
        chartContainer.innerHTML = ''; chartContainer.appendChild(ctx);
        if (chartInstance) chartInstance.destroy();
        chartInstance = new Chart(ctx, {
            type:'doughnut',
            data:{
                labels:['正常','即将到期','急需续费','已过期'],
                datasets:[{
                    data:[cnt.normal,cnt.warning,cnt.danger,cnt.expired],
                    backgroundColor:['#10b981','#f59e0b','#ef4444','#6b7280'],
                    borderWidth:2, borderColor:'#fff'
                }]
            },
            options:{
                responsive:true, maintainAspectRatio:false,
                plugins:{legend:{position:'bottom',labels:{padding:20,font:{size:14}}},
                         tooltip:{callbacks:{label:c=>`${c.label}: ${c.raw} 个`}}}
            }
        });
    }

    // =============================================================
    // 10. 导出 CSV
    // =============================================================
    function exportToCSV() {
        const headers = ['名称','提供商','续费价格','到期时间','下次续费时间','剩余天数','状态','备注','续费链接'];
        const rows = assets.map(a => {
            const d = calculateRemainingDays(a.expirationDate);
            const s = d<0?'已过期':d<7?'急需续费':d<=30?'即将到期':'正常';
            return [a.name,a.provider,a.renewalPrice,a.expirationDate,
                    a.nextRenewalDate,d,s,a.notes||'',a.link];
        });
        const csv = [headers,...rows].map(r=>r.map(c=>`"${c}"`).join(',')).join('\n');
        const blob = new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8;'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href=url; a.download=`云资产_${new Date().toISOString().slice(0,10)}.csv`;
        a.click(); URL.revokeObjectURL(url);
    }
    const exportBtn = document.createElement('button');
    exportBtn.textContent='📤 导出 CSV';
    exportBtn.style.cssText='margin-left:10px;padding:8px 14px;background:#10b981;color:#fff;border:none;border-radius:6px;font-size:0.9rem;cursor:pointer;';
    exportBtn.onclick=exportToCSV;

    // =============================================================
    // 11. 本地保存 / 加载
    // =============================================================
    // 保存按钮（增强：添加提示 + 错误处理）
    const saveBtn = document.createElement('button');
    saveBtn.textContent = '💾 保存到本地';
    saveBtn.style.cssText = 'margin-left:10px;padding:8px 14px;background:#f59e0b;color:#fff;border:none;border-radius:6px;font-size:0.9rem;cursor:pointer;';
    saveBtn.onclick = () => {
        try {
            if (typeof assets === 'undefined') {
                alert('错误：数据未加载！请刷新页面。');
                console.error('assets 未定义');
                return;
            }
            localStorage.setItem('cloudAssets', JSON.stringify(assets));
            alert('✅ 保存成功！数据已存入 localStorage。');
            console.log('保存成功:', localStorage.getItem('cloudAssets'));
        } catch (e) {
            alert('❌ 保存失败：' + e.message + '\n\n可能原因：浏览器不支持 localStorage（隐私模式？）');
            console.error('保存错误:', e);
        }
    };

    // 加载按钮
    const loadBtn = document.createElement('button');
    loadBtn.textContent = '📂 加载本地数据';
    loadBtn.style.cssText = 'margin-left:10px;padding:8px 14px;background:#8b5cf6;color:#fff;border:none;border-radius:6px;font-size:0.9rem;cursor:pointer;';
    loadBtn.onclick = () => {
    try {
        const saved = localStorage.getItem('cloudAssets');
        if (!saved) {
            alert('没有找到本地数据！');
            return;
        }

        if (!confirm('加载本地数据将覆盖当前数据。继续吗?')) {
            return;
        }

        const newData = JSON.parse(saved);

        // 关键修复：不直接赋值，而是清空 + 推入
        assets.length = 0;
        assets.push(...newData);

        renderAll();
        alert('数据加载成功！');
    } catch (e) {
        alert('加载失败: ' + e.message);
        console.error('加载错误:', e);
    }
};

    // 延迟插入所有元素
    setTimeout(() => {
        const container = document.querySelector('.container');
        if (container) {
            container.style.paddingTop = '70px';
            container.insertBefore(searchBox, document.querySelector('.stats-cards'));
            const parent = searchBox.parentNode;
            parent.insertBefore(exportBtn, searchBox.nextSibling);
            parent.insertBefore(saveBtn, exportBtn.nextSibling);
            parent.insertBefore(loadBtn, saveBtn.nextSibling);
            console.log('✅ 按钮组插入成功');
        } else {
            console.error('❌ .container 未找到');
        }
    }, 200);

    // =============================================================
    // 12. 自动刷新倒计时
    // =============================================================
    const REFRESH_INTERVAL = 60*60*1000;
    let timeLeft = REFRESH_INTERVAL/1000;
    const countdownEl = document.createElement('div');
    countdownEl.id='auto-refresh-countdown';
    countdownEl.style.cssText=`
        position:fixed;bottom:20px;right:20px;background:rgba(0,0,0,0.75);color:#fff;
        padding:8px 14px;border-radius:8px;font-size:0.85rem;z-index:1000;
        backdrop-filter:blur(4px);box-shadow:0 2px 8px rgba(0,0,0,0.2);
    `;
    document.body.appendChild(countdownEl);
    function updateCountdown(){ 
        const m=Math.floor(timeLeft/60).toString().padStart(2,'0'); 
        const s=(timeLeft%60).toString().padStart(2,'0'); 
        //countdownEl.textContent=`刷新倒计时 ${m}:${s}`; 
        countdownEl.textContent=`${m}:${s}`; 
        timeLeft--; 
    }
    updateCountdown(); 
    setInterval(updateCountdown,1000);

    function scheduleRefresh(){
        setTimeout(()=>{ renderAll(); timeLeft=REFRESH_INTERVAL/1000; updateCountdown(); scheduleRefresh(); }, REFRESH_INTERVAL);
    }
    scheduleRefresh();

    // =============================================================
    // 13. 统一渲染
    // =============================================================
    function renderAll(){
        const data = getSortedData(assets);
        window.renderTable(data);
        window.renderStats(data);
        renderPieChart(data);
    }

    // 启动
    chartScript.onload = () => setTimeout(renderAll,100);
    setTimeout(renderAll,300);
})();