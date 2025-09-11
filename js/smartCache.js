/**
 * نظام التخزين المؤقت الذكي (Smart Caching System)
 * يحفظ النتائج المحسوبة ويعيد استخدامها لتسريع الأداء
 */

class SmartCache {
  constructor(options = {}) {
    this.cache = new Map();
    this.dependencies = new Map(); // تتبع التبعيات
    this.maxSize = options.maxSize || 1000;
    this.ttl = options.ttl || 300000; // 5 دقائق افتراضياً
    this.stats = {
      hits: 0,
      misses: 0,
      invalidations: 0
    };
  }

  /**
   * الحصول على قيمة من الكاش أو حسابها
   */
  async get(key, computeFn, dependencies = []) {
    // التحقق من وجود القيمة في الكاش
    if (this.cache.has(key)) {
      const cached = this.cache.get(key);
      
      // التحقق من انتهاء الصلاحية
      if (Date.now() - cached.timestamp < this.ttl) {
        this.stats.hits++;
        console.log(`✅ Cache Hit: ${key}`);
        return cached.value;
      } else {
        // انتهت الصلاحية
        this.cache.delete(key);
        this.dependencies.delete(key);
      }
    }

    // حساب القيمة الجديدة
    this.stats.misses++;
    console.log(`❌ Cache Miss: ${key} - Computing...`);
    
    const startTime = performance.now();
    const value = await computeFn();
    const endTime = performance.now();
    
    console.log(`⏱️ Computed ${key} in ${endTime - startTime}ms`);

    // حفظ في الكاش
    this.set(key, value, dependencies);
    
    return value;
  }

  /**
   * حفظ قيمة في الكاش
   */
  set(key, value, dependencies = []) {
    // تنظيف الكاش إذا امتلأ
    if (this.cache.size >= this.maxSize) {
      this.cleanup();
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      dependencies: dependencies
    });

    // تسجيل التبعيات
    dependencies.forEach(dep => {
      if (!this.dependencies.has(dep)) {
        this.dependencies.set(dep, new Set());
      }
      this.dependencies.get(dep).add(key);
    });
  }

  /**
   * إلغاء الكاش لمفاتيح محددة أو تبعيات
   */
  invalidate(keyOrDependency) {
    this.stats.invalidations++;
    
    // إذا كان مفتاح مباشر
    if (this.cache.has(keyOrDependency)) {
      this.cache.delete(keyOrDependency);
      console.log(`🗑️ Invalidated cache: ${keyOrDependency}`);
    }

    // إذا كان تبعية - إلغاء جميع المفاتيح التابعة
    if (this.dependencies.has(keyOrDependency)) {
      const dependentKeys = this.dependencies.get(keyOrDependency);
      dependentKeys.forEach(key => {
        this.cache.delete(key);
        console.log(`🗑️ Invalidated dependent cache: ${key}`);
      });
      this.dependencies.delete(keyOrDependency);
    }
  }

  /**
   * تنظيف الكاش من القيم القديمة
   */
  cleanup() {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, cached] of this.cache.entries()) {
      if (now - cached.timestamp > this.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }
    
    console.log(`🧹 Cleaned ${cleaned} expired cache entries`);
    
    // إذا لا يزال ممتلئاً، احذف الأقدم
    if (this.cache.size >= this.maxSize) {
      const entries = Array.from(this.cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const toDelete = entries.slice(0, Math.floor(this.maxSize * 0.2));
      toDelete.forEach(([key]) => this.cache.delete(key));
      
      console.log(`🧹 Removed ${toDelete.length} oldest cache entries`);
    }
  }

  /**
   * الحصول على إحصائيات الكاش
   */
  getStats() {
    const hitRate = this.stats.hits / (this.stats.hits + this.stats.misses) * 100;
    return {
      ...this.stats,
      hitRate: hitRate.toFixed(2) + '%',
      cacheSize: this.cache.size,
      dependenciesCount: this.dependencies.size
    };
  }

  /**
   * مسح الكاش بالكامل
   */
  clear() {
    this.cache.clear();
    this.dependencies.clear();
    console.log('🗑️ Cache cleared completely');
  }
}

// إنشاء كاش عام للتطبيق
const appCache = new SmartCache({
  maxSize: 500,
  ttl: 300000 // 5 دقائق
});

/**
 * كاش خاص بحساب أرصدة المحلات
 */
class StoreBalanceCache {
  constructor() {
    this.cache = appCache;
  }

  /**
   * حساب رصيد محل مع الكاش
   */
  async calculateBalance(storeId) {
    const cacheKey = `store_balance_${storeId}`;
    
    return await this.cache.get(
      cacheKey,
      () => this.computeStoreBalance(storeId),
      ['sales', 'payments', `store_${storeId}`] // التبعيات
    );
  }

  /**
   * حساب الرصيد الفعلي (بدون كاش)
   */
  computeStoreBalance(storeId) {
    const sales = data.sales.filter(s => s.storeId === storeId);
    const payments = data.payments.filter(p => p.storeId === storeId);
    
    const totalSales = sales.reduce((sum, sale) => sum + (sale.total || 0), 0);
    const totalPayments = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    
    return {
      storeId,
      totalSales,
      totalPayments,
      balance: totalSales - totalPayments,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * إلغاء كاش محل معين
   */
  invalidateStore(storeId) {
    this.cache.invalidate(`store_${storeId}`);
  }

  /**
   * إلغاء كاش جميع المحلات عند تغيير المبيعات/المدفوعات
   */
  invalidateAll() {
    this.cache.invalidate('sales');
    this.cache.invalidate('payments');
  }
}

// إنشاء كاش الأرصدة
const balanceCache = new StoreBalanceCache();

/**
 * كاش التقارير
 */
class ReportsCache {
  constructor() {
    this.cache = appCache;
  }

  /**
   * كاش تقرير الأرباح
   */
  async getProfitReport(fromDate, toDate) {
    const cacheKey = `profit_report_${fromDate}_${toDate}`;
    
    return await this.cache.get(
      cacheKey,
      () => this.computeProfitReport(fromDate, toDate),
      ['sales', 'payments', 'expenses']
    );
  }

  computeProfitReport(fromDate, toDate) {
    console.log('🧮 Computing profit report...');
    
    const filteredSales = data.sales.filter(s => 
      s.date >= fromDate && s.date <= toDate
    );
    const filteredPayments = data.payments.filter(p => 
      p.date >= fromDate && p.date <= toDate
    );
    const filteredExpenses = data.expenses.filter(e => 
      e.date >= fromDate && e.date <= toDate
    );

    const totalSales = filteredSales.reduce((sum, sale) => sum + (sale.total || 0), 0);
    const totalPayments = filteredPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

    return {
      period: { fromDate, toDate },
      totalSales,
      totalPayments,
      totalExpenses,
      netProfit: totalPayments - totalExpenses,
      salesCount: filteredSales.length,
      paymentsCount: filteredPayments.length,
      expensesCount: filteredExpenses.length,
      generatedAt: new Date().toISOString()
    };
  }

  invalidateReports() {
    this.cache.invalidate('sales');
    this.cache.invalidate('payments');
    this.cache.invalidate('expenses');
  }
}

const reportsCache = new ReportsCache();

/**
 * مثال على الاستخدام في التطبيق
 */

// تحديث دالة عرض المحلات لاستخدام الكاش
async function renderStoresListWithCache() {
  console.log('🏪 Rendering stores list with cache...');
  
  const list = document.getElementById('storesList');
  if (!list) return;

  const startTime = performance.now();

  // استخدام الكاش لحساب الأرصدة
  const storesWithBalances = await Promise.all(
    data.stores.map(async store => {
      const balanceInfo = await balanceCache.calculateBalance(store.id);
      return {
        ...store,
        ...balanceInfo
      };
    })
  );

  const endTime = performance.now();
  console.log(`⚡ Rendered ${storesWithBalances.length} stores in ${endTime - startTime}ms`);

  // عرض النتائج
  list.innerHTML = storesWithBalances.map(store => `
    <div class="store-item" onclick="showStoreDetails('${store.id}')">
      <div class="store-name">${store.name}</div>
      <div class="store-balance currency ${store.balance >= 0 ? 'positive' : 'negative'}">
        ${formatNumber(store.balance)}
      </div>
      <div class="store-type">${getPriceTypeName(store.priceType)}</div>
    </div>
  `).join('');

  // عرض إحصائيات الكاش
  console.log('📊 Cache Stats:', appCache.getStats());
}

// ربط إلغاء الكاش بالعمليات
function saveSale() {
  // ... كود حفظ البيع الحالي ...
  
  // إلغاء الكاش المتعلق
  balanceCache.invalidateAll();
  reportsCache.invalidateReports();
  
  console.log('💾 Sale saved and cache invalidated');
}

function savePayment() {
  // ... كود حفظ الدفعة الحالي ...
  
  // إلغاء الكاش المتعلق
  balanceCache.invalidateAll();
  reportsCache.invalidateReports();
  
  console.log('💾 Payment saved and cache invalidated');
}

// تصدير للاستخدام العام
if (typeof window !== 'undefined') {
  window.appCache = appCache;
  window.balanceCache = balanceCache;
  window.reportsCache = reportsCache;
}

/**
 * مثال على تحسين الأداء
 */
async function demonstrateCachePerformance() {
  console.log('🚀 Cache Performance Demo');
  
  // محاكاة بيانات كبيرة
  const largeSalesData = [];
  for (let i = 0; i < 10000; i++) {
    largeSalesData.push({
      id: `sale_${i}`,
      storeId: `store_${Math.floor(Math.random() * 100)}`,
      total: Math.floor(Math.random() * 1000),
      date: '2024-01-01'
    });
  }
  
  // تعيين البيانات
  data.sales = largeSalesData;
  
  // الاختبار الأول - بدون كاش
  console.log('❌ Without Cache:');
  const start1 = performance.now();
  const balance1 = balanceCache.computeStoreBalance('store_1');
  const end1 = performance.now();
  console.log(`Time: ${end1 - start1}ms`);
  
  // الاختبار الثاني - مع الكاش (أول مرة)
  console.log('🔄 With Cache (first time):');
  const start2 = performance.now();
  const balance2 = await balanceCache.calculateBalance('store_1');
  const end2 = performance.now();
  console.log(`Time: ${end2 - start2}ms`);
  
  // الاختبار الثالث - مع الكاش (من الذاكرة)
  console.log('⚡ With Cache (from memory):');
  const start3 = performance.now();
  const balance3 = await balanceCache.calculateBalance('store_1');
  const end3 = performance.now();
  console.log(`Time: ${end3 - start3}ms`);
  
  console.log('📊 Final Stats:', appCache.getStats());
}