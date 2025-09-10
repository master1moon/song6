(function(){
  'use strict';

  function computeMetrics(d){
    const dataRef = d || (typeof getDataRef === 'function' ? getDataRef() : (window.data||{}));
    const sales = dataRef.sales||[]; const payments = dataRef.payments||[]; const expenses = dataRef.expenses||[];
    const stores = dataRef.stores||[]; const inventory = dataRef.inventory||[]; const packages = dataRef.packages||[];
    const totals = {
      sales: sales.reduce((s,x)=> s + (Number(x.total)||0), 0),
      payments: payments.reduce((s,x)=> s + (Number(x.amount)||0), 0),
      expenses: expenses.reduce((s,x)=> s + (Number(x.amount)||0), 0),
      inventoryValue: inventory.reduce((s,x)=> s + (Number(x.quantity)||0) * (Number((packages.find(p=>p.id===x.packageId)||{}).price)||0), 0),
      storesBalance: 0,
      counts: {
        stores: stores.length,
        packages: packages.length,
        inventoryItems: inventory.length,
        sales: sales.length,
        payments: payments.length,
        expenses: expenses.length
      },
      perStore: {}
    };
    totals.storesBalance = stores.reduce((acc, store) => {
      const sSales = sales.filter(s=> s.storeId===store.id).reduce((s,x)=> s + (Number(x.total)||0),0);
      const sPays = payments.filter(p=> p.storeId===store.id).reduce((s,x)=> s + (Number(x.amount)||0),0);
      totals.perStore[store.id] = {
        name: store.name,
        sales: sSales,
        payments: sPays,
        balance: sSales - sPays
      };
      return acc + (sSales - sPays);
    }, 0);
    totals.netProfit = totals.sales - totals.expenses;
    return totals;
  }

  function renderParityPage(){
    const section = document.getElementById('parityCheck');
    if (!section) return;
    const base = (typeof localStorage!=='undefined') ? (localStorage.getItem('baseline_metrics') || '') : '';
    const baseline = base ? ((typeof safeJsonParse==='function' && FeatureFlags && FeatureFlags.isEnabled('safeJsonParse'))? safeJsonParse(base, null) : JSON.parse(base)) : null;
    const current = computeMetrics();
    const fmt = (typeof formatNumber==='function') ? n=> formatNumber(n) : n=> String(n);
    const card = (label, cur, baseVal)=>{
      const same = (baseline && typeof baseVal==='number') ? Math.abs(cur - baseVal) < 0.0001 : true;
      const diff = baseline ? (cur - (baseVal||0)) : 0;
      return `
        <div class="col-md-4">
          <div class="card ${same?'border-success':'border-danger'}">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <div class="fw-bold mb-1">${label}</div>
                  <div class="small text-muted">${baseline? 'الأساس: '+fmt(baseVal||0) : 'لا يوجد أساس محفوظ'}</div>
                </div>
                <div class="text-end">
                  <div class="h5 mb-0">${fmt(cur)}</div>
                  ${baseline? `<div class="small ${diff===0?'text-success':(diff>0?'text-warning':'text-danger')}">فرق: ${fmt(diff)}</div>`:''}
                </div>
              </div>
            </div>
          </div>
        </div>`;
    };
    const countsHtml = (baseline? `
      <div class="card mt-3">
        <div class="card-header bg-light">فروقات العدّادات</div>
        <div class="card-body">
          <div class="row g-3">
            ${['stores','packages','inventoryItems','sales','payments','expenses'].map(key=>{
              const cur = current.counts[key]; const baseVal = (baseline.counts||{})[key]||0; const diff = cur - baseVal; const ok = diff===0;
              return `
                <div class="col-md-4">
                  <div class="d-flex justify-content-between border rounded p-2 ${ok?'border-success':'border-danger'}">
                    <div class="fw-semibold">${key}</div>
                    <div>${cur} ${ok? '<span class="text-success">(مطابق)</span>' : `<span class="text-danger">(فرق: ${diff>0?'+':''}${diff})</span>`}</div>
                  </div>
                </div>`;
            }).join('')}
          </div>
        </div>
      </div>`: '');

    const perStoreHtml = (baseline? (()=>{
      const ids = Object.keys(current.perStore||{});
      if (!ids.length) return '';
      const rows = ids.map(id=>{
        const c = current.perStore[id]; const b = (baseline.perStore||{})[id] || { balance: 0, sales: 0, payments: 0, name: c.name };
        const db = c.balance - (b.balance||0); const ds = c.sales - (b.sales||0); const dp = c.payments - (b.payments||0);
        const ok = (db===0 && ds===0 && dp===0);
        return `<tr class="${ok?'':'table-danger'}"><td>${c.name||id}</td><td class="currency">${fmt(c.sales)}</td><td class="currency">${fmt(c.payments)}</td><td class="currency">${fmt(c.balance)}</td><td class="currency">${fmt(b.balance||0)}</td><td class="currency">${fmt(db)}</td></tr>`;
      }).join('');
      return `
        <div class="card mt-3">
          <div class="card-header bg-light">مطابقة أرصدة المحلات</div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-sm mb-0">
                <thead><tr><th>المحل</th><th>مبيعات الآن</th><th>تسديدات الآن</th><th>الرصيد الآن</th><th>الرصيد الأساس</th><th>فرق الرصيد</th></tr></thead>
                <tbody>${rows || `<tr><td colspan="6" class="text-center text-muted">لا توجد محلات</td></tr>`}</tbody>
              </table>
            </div>
          </div>
        </div>`;
    })() : '');

    const html = `
      <div class="header-bar">
        <h3 class="page-title"><i class="fas fa-balance-scale"></i> فحص التطابق (Parity Check)</h3>
        <div class="d-flex gap-2">
          <button class="btn btn-sm btn-primary" id="saveBaselineBtn"><i class="fas fa-save"></i> حفظ الأساس الحالي</button>
          <button class="btn btn-sm btn-secondary" id="recomputeBtn"><i class="fas fa-sync"></i> إعادة الحساب</button>
          <button class="btn btn-sm btn-outline-success" id="exportParityBtn"><i class="fas fa-file-export"></i> تصدير النتائج</button>
        </div>
      </div>
      <div class="row g-3 mt-1">
        ${card('إجمالي المبيعات', current.sales, baseline && baseline.sales)}
        ${card('إجمالي التسديدات', current.payments, baseline && baseline.payments)}
        ${card('إجمالي المصروفات', current.expenses, baseline && baseline.expenses)}
        ${card('صافي الربح', current.netProfit, baseline && baseline.netProfit)}
        ${card('إجمالي أرصدة المحلات', current.storesBalance, baseline && baseline.storesBalance)}
        ${card('قيمة المخزون التقديرية', current.inventoryValue, baseline && baseline.inventoryValue)}
      </div>
      ${countsHtml}
      ${perStoreHtml}
      <div class="alert alert-info mt-3">
        هذه الصفحة للعرض فقط ولا تغيّر أي بيانات حسابية. الهدف هو التأكد من التطابق صفر بالمئة بعد أي تحسينات.
      </div>
    `;
    if (typeof FeatureFlags !== 'undefined' && FeatureFlags.isEnabled('safeDomRendering') && typeof setHTML === 'function') { setHTML(section, html); } else { section.innerHTML = html; }
    const saveBtn = document.getElementById('saveBaselineBtn');
    if (saveBtn) saveBtn.onclick = function(){ try{ localStorage.setItem('baseline_metrics', JSON.stringify(current)); showNotification('تم حفظ الأساس الحالي', 'success'); }catch(_){} };
    const recomputeBtn = document.getElementById('recomputeBtn');
    if (recomputeBtn) recomputeBtn.onclick = renderParityPage;
    const exportBtn = document.getElementById('exportParityBtn');
    if (exportBtn) exportBtn.onclick = function(){
      try {
        const payload = { generatedAt: new Date().toISOString(), current, baseline: baseline||null };
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `parity_${Date.now()}.json`; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
      } catch(_) {}
    };
  }

  function showParitySection(){
    document.querySelectorAll('.sidebar .nav-link').forEach(l => l.classList.remove('active'));
    const link = document.querySelector('[data-section="parityCheck"]');
    if (link) link.classList.add('active');
    document.querySelectorAll('.section').forEach(s => s.style.display = 'none');
    const sec = document.getElementById('parityCheck');
    if (sec) { sec.style.display = 'block'; renderParityPage(); }
    const title = document.querySelector('.page-title'); if (title) title.textContent = 'فحص التطابق (Parity Check)';
  }

  window.ParityCheck = { computeMetrics, render: renderParityPage, show: showParitySection };

})();

