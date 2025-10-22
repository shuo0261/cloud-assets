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

(() => {
    'use strict';

    // =============================================================
    // 1. 当前时间显示
    // =============================================================
    const timeEl = document.createElement('div');
    timeEl.id = 'current-time';
    timeEl.style.cssText = `
        position:fixed;top:20px;left:20px;color:#fff;font-size:0.9rem;
        background:rgba(0,0,0,0.6);padding:6px 12px;border-radius:6px;z-index:1000;
        backdrop-filter:blur(4px);
    `;
    document.body.appendChild(timeEl);
    function updateTime() {
        const now = new Date();
        timeEl.textContent = `Current Time: ${now.toLocaleString('zh-CN', {
            year:'numeric',month:'2-digit',day:'2-digit',
            hour:'2-digit',minute:'2-digit',second:'2-digit'
        })}`;
    }
    updateTime();
    setInterval(updateTime, 1000);

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
    document.querySelector('.container').insertBefore(searchBox, document.querySelector('.stats-cards'));

    // =============================================================
    // 3. 排序状态：0=默认, 1=升序, 2=降序
    // =============================================================
    const sortState = { price: 0, exp: 0, next: 0, remain: 0 }; // 新增 remain

    // =============================================================
    // 4. 续费价格解析
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

    // 时间换算系数（月）
    const monthMul = { '月': 1, '季': 3, '年': 12 }[unit] || 1;

    // 货币换算
    const rmb = currency === '$' ? num * 7.2 : num;

    // 年化价格（元/年）
    const yearly = rmb * (12 / monthMul);

    return {
        value: yearly,        // 用于排序
        isFree: false,
        original: str         // 用于显示
    };
}
    // =============================================================
    // 5. 获取排序后的数据（全部使用 calculateRemainingDays）
    // =============================================================
    function getSortedData(base = assets) {
        const q = searchBox.value.toLowerCase();
        let list = base.filter(a =>
            a.name.toLowerCase().includes(q) ||
            a.provider.toLowerCase().includes(q) ||
            (a.notes && a.notes.toLowerCase().includes(q))
        );

        // // 默认排序：剩余天数倒序（最紧急在前）
        // if (sortState.price === 0 && sortState.exp === 0 && sortState.next === 0 && sortState.remain === 0) {
        //     list.sort((a, b) => {
        //         const da = calculateRemainingDays(a.expirationDate);
        //         const db = calculateRemainingDays(b.expirationDate);
        //         return da - db; // 小 → 大：越紧急越前
        //     });
        // }
        // 默认排序：剩余天数越大越前（续费周期长 → 排前面）
        if (sortState.price === 0 && sortState.exp === 0 && sortState.next === 0 && sortState.remain === 0) {
            list.sort((a, b) => {
                const da = calculateRemainingDays(a.expirationDate);
                const db = calculateRemainingDays(b.expirationDate);
                return db - da;  // 改为 db - da
            });
        }
        // 续费价格排序
        else if (sortState.price !== 0) {
            list.sort((a, b) => {
                const pa = parsePrice(a.renewalPrice), pb = parsePrice(b.renewalPrice);
                if (pa.isFree && pb.isFree) return 0;
                if (pa.isFree) return sortState.price === 1 ? 1 : -1;
                if (pb.isFree) return sortState.price === 1 ? -1 : 1;
                return sortState.price === 1 ? pa.value - pb.value : pb.value - pa.value;
            });
        }
        // 到期时间排序（仍按日期）
        else if (sortState.exp !== 0) {
            list.sort((a, b) => {
                const da = new Date(a.expirationDate), db = new Date(b.expirationDate);
                return sortState.exp === 1 ? da - db : db - da;
            });
        }
        // 下次续费时间排序（仍按日期）
        else if (sortState.next !== 0) {
            list.sort((a, b) => {
                const da = new Date(a.nextRenewalDate), db = new Date(b.nextRenewalDate);
                return sortState.next === 1 ? da - db : db - da;
            });
        }
        // 剩余时间排序（新增）
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
    // 6. 表头点击排序 + 箭头
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
    // 7. 表格渲染（绑定剩余时间列）
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

        // 绑定表头排序（只绑定一次）
        setTimeout(() => {
            const ths = document.querySelectorAll('#assetsTable thead th');
            if (!ths[2].hasAttribute('data-sort')) {
                ths[2].setAttribute('data-sort', 'price');   // 续费价格
                ths[3].setAttribute('data-sort', 'exp');     // 到期时间
                ths[4].setAttribute('data-sort', 'next');    // 下次续费
                ths[5].setAttribute('data-sort', 'remain');  // 剩余时间（第6列）
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
    document.querySelector('.container').insertBefore(chartContainer, document.querySelector('.table-container'));

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
    searchBox.parentNode.insertBefore(exportBtn, searchBox.nextSibling);

    // =============================================================
    // 11. 本地保存 / 加载
    // =============================================================
    const saveBtn = document.createElement('button');
    saveBtn.textContent='💾 保存到本地';
    saveBtn.style.cssText='margin-left:10px;padding:8px 14px;background:#f59e0b;color:#fff;border:none;border-radius:6px;font-size:0.9rem;cursor:pointer;';
    saveBtn.onclick=()=>localStorage.setItem('cloudAssets',JSON.stringify(assets));
    exportBtn.parentNode.insertBefore(saveBtn, exportBtn.nextSibling);

    const loadBtn = document.createElement('button');
    loadBtn.textContent='📂 加载本地数据';
    loadBtn.style.cssText='margin-left:10px;padding:8px 14px;background:#8b5cf6;color:#fff;border:none;border-radius:6px;font-size:0.9rem;cursor:pointer;';
    loadBtn.onclick=()=>{
        const s=localStorage.getItem('cloudAssets');
        if(s && confirm('加载本地数据会覆盖当前数据，确认吗？')){
            Object.assign(assets, JSON.parse(s));
            renderAll();
        }
    };
    saveBtn.parentNode.insertBefore(loadBtn, saveBtn.nextSibling);

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
        countdownEl.textContent=`刷新倒计时 ${m}:${s}`; 
        timeLeft--; 
    }
    updateCountdown(); 
    const cdInt=setInterval(updateCountdown,1000);

    function scheduleRefresh(){
        setTimeout(()=>{ renderAll(); timeLeft=REFRESH_INTERVAL/1000; updateCountdown(); scheduleRefresh(); }, REFRESH_INTERVAL);
    }
    scheduleRefresh();

    const manualBtn = document.createElement('button');
    manualBtn.textContent='Manual Refresh';
    manualBtn.style.cssText='position:fixed;top:20px;right:20px;background:#6366f1;color:#fff;padding:6px 12px;border:none;border-radius:6px;font-size:0.8rem;cursor:pointer;z-index:1000;box-shadow:0 2px 6px rgba(99,102,241,0.3);';
    manualBtn.onclick=()=>{ renderAll(); timeLeft=REFRESH_INTERVAL/1000; updateCountdown(); };
    document.body.appendChild(manualBtn);

    // =============================================================
    // 13. 统一渲染入口
    // =============================================================
    function renderAll(){
        const data = getSortedData(assets);
        window.renderTable(data);
        window.renderStats(data);
        renderPieChart(data);
    }

    // 启动
    chartScript.onload = () => setTimeout(renderAll,100);
    setTimeout(renderAll,200);
})();