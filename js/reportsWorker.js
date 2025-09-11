// reportsWorker.js — Web Worker لحساب التقارير الثقيلة بدون حجب الواجهة
// المدخل: { type: 'debt', data }
// المخرج: { ok: true, rows, totals } أو { ok:false, error }

self.onmessage = function(e){
  try{
    const msg = e.data || {};
    if (msg.type === 'debt') {
      const d = msg.payload || {};
      const stores = Array.isArray(d.stores) ? d.stores : [];
      const sales = Array.isArray(d.sales) ? d.sales : [];
      const payments = Array.isArray(d.payments) ? d.payments : [];
      const fromDate = String(d.fromDate||'0000-01-01').slice(0,10);
      const toDate = String(d.toDate||'9999-12-31').slice(0,10);
      function inRange(s){ const dd=(s||'').slice(0,10); return dd>=fromDate && dd<=toDate; }
      const rows = [];
      let totalDebts = 0;
      for (const store of stores){
        const sSales = sales.filter(s => s.storeId===store.id && inRange(s.date));
        const sPays = payments.filter(p => p.storeId===store.id && inRange(p.date));
        const sumSales = sSales.reduce((sum,x)=> sum + (Number(x.total)||0), 0);
        const sumPays = sPays.reduce((sum,x)=> sum + (Number(x.amount)||0), 0);
        const remaining = sumSales - sumPays;
        totalDebts += remaining;
        const lastSale = sSales.length? sSales.reduce((m,x)=> x.date>m?x.date:m, ''):'';
        const lastPay = sPays.length? sPays.reduce((m,x)=> x.date>m?x.date:m, ''):'';
        const lastTx = (lastSale>lastPay? lastSale : lastPay) || '';
        rows.push({
          name: store.name,
          totalSales: sumSales,
          totalPayments: sumPays,
          remaining: remaining,
          priceType: store.priceType,
          lastTransaction: lastTx
        });
      }
      self.postMessage({ ok:true, rows, totals:{ totalDebts } });
      return;
    } else if (msg.type === 'profit') {
      const d = msg.payload || {};
      const fromDate = String(d.fromDate||'0000-01-01').slice(0,10);
      const toDate = String(d.toDate||'9999-12-31').slice(0,10);
      function inRange(s){ const dd=(s||'').slice(0,10); return dd>=fromDate && dd<=toDate; }
      const sales = Array.isArray(d.sales) ? d.sales.filter(x=>inRange(x.date)) : [];
      const payments = Array.isArray(d.payments) ? d.payments.filter(x=>inRange(x.date)) : [];
      const expenses = Array.isArray(d.expenses) ? d.expenses.filter(x=>inRange(x.date)) : [];
      const sum = (arr, k) => arr.reduce((s,x)=> s + (Number(x[k])||0), 0);
      const totalSales = sum(sales, 'total');
      const totalPayments = sum(payments, 'amount');
      const totalExpenses = sum(expenses, 'amount');
      const netProfit = totalPayments - totalExpenses;
      self.postMessage({ ok:true, profit:{ totalSales, totalPayments, totalExpenses, netProfit } });
      return;
    }
    self.postMessage({ ok:false, error:'unknown_type' });
  }catch(err){
    self.postMessage({ ok:false, error: String(err && err.message || err) });
  }
};

