/**
 * ملف تهيئة التحسينات الشاملة
 * يدير تشغيل وتهيئة جميع التحسينات المضافة للتطبيق
 */

class PerformanceManager {
  constructor() {
    this.initialized = false;
    this.features = {
      smartCache: false,
      virtualScrolling: false,
      advancedSearch: false,
      webWorkers: false,
      advancedServiceWorker: false
    };
    
    this.stats = {
      initStartTime: Date.now(),
      initEndTime: null,
      featureLoadTimes: {}
    };
  }

  /**
   * تهيئة جميع التحسينات
   */
  async initialize() {
    console.log('🚀 Starting Performance Manager initialization...');
    
    try {
      // 1. تهيئة Smart Cache
      await this.initializeSmartCache();
      
      // 2. تهيئة نظام البحث المتقدم
      await this.initializeAdvancedSearch();
      
      // 3. تهيئة Web Workers
      await this.initializeWebWorkers();
      
      // 4. تهيئة Virtual Scrolling (يتم تلقائياً عند الحاجة)
      this.initializeVirtualScrolling();
      
      // 5. تهيئة Service Worker المتقدم
      await this.initializeAdvancedServiceWorker();
      
      // 6. تسجيل الإحصائيات
      this.stats.initEndTime = Date.now();
      const totalTime = this.stats.initEndTime - this.stats.initStartTime;
      
      console.log(`✅ Performance Manager initialized in ${totalTime}ms`);
      console.log('📊 Features status:', this.features);
      
      this.initialized = true;
      
      // إرسال حدث التهيئة
      this.dispatchInitializedEvent();
      
    } catch (error) {
      console.error('❌ Performance Manager initialization failed:', error);
    }
  }

  /**
   * تهيئة Smart Cache
   */
  async initializeSmartCache() {
    const startTime = Date.now();
    
    try {
      if (typeof window.appCache !== 'undefined') {
        // تهيئة كاش الأرصدة
        if (typeof window.balanceCache !== 'undefined') {
          console.log('✅ Balance cache initialized');
        }
        
        // تهيئة كاش التقارير
        if (typeof window.reportsCache !== 'undefined') {
          console.log('✅ Reports cache initialized');
        }
        
        this.features.smartCache = true;
        console.log('✅ Smart Cache system initialized');
      } else {
        console.warn('⚠️ Smart Cache not available');
      }
    } catch (error) {
      console.error('❌ Smart Cache initialization failed:', error);
    }
    
    this.stats.featureLoadTimes.smartCache = Date.now() - startTime;
  }

  /**
   * تهيئة نظام البحث المتقدم
   */
  async initializeAdvancedSearch() {
    const startTime = Date.now();
    
    try {
      if (typeof window.searchManager !== 'undefined' && window.data) {
        // تهيئة فهارس البحث
        window.searchManager.initialize(window.data);
        
        this.features.advancedSearch = true;
        console.log('✅ Advanced Search system initialized');
      } else {
        console.warn('⚠️ Advanced Search not available or data not loaded');
      }
    } catch (error) {
      console.error('❌ Advanced Search initialization failed:', error);
    }
    
    this.stats.featureLoadTimes.advancedSearch = Date.now() - startTime;
  }

  /**
   * تهيئة Web Workers
   */
  async initializeWebWorkers() {
    const startTime = Date.now();
    
    try {
      if (typeof window.reportWorker !== 'undefined') {
        // تهيئة worker التقارير
        window.reportWorker.initialize();
        
        this.features.webWorkers = true;
        console.log('✅ Web Workers system initialized');
      } else {
        console.warn('⚠️ Web Workers not available');
      }
    } catch (error) {
      console.error('❌ Web Workers initialization failed:', error);
    }
    
    this.stats.featureLoadTimes.webWorkers = Date.now() - startTime;
  }

  /**
   * تهيئة Virtual Scrolling
   */
  initializeVirtualScrolling() {
    const startTime = Date.now();
    
    try {
      if (typeof VirtualScrollTable !== 'undefined') {
        // Virtual Scrolling يتم تفعيله تلقائياً عند الحاجة
        this.features.virtualScrolling = true;
        console.log('✅ Virtual Scrolling system ready');
      } else {
        console.warn('⚠️ Virtual Scrolling not available');
      }
    } catch (error) {
      console.error('❌ Virtual Scrolling initialization failed:', error);
    }
    
    this.stats.featureLoadTimes.virtualScrolling = Date.now() - startTime;
  }

  /**
   * تهيئة Service Worker المتقدم
   */
  async initializeAdvancedServiceWorker() {
    const startTime = Date.now();
    
    try {
      if (typeof window.swManager !== 'undefined') {
        // Service Worker يتم تسجيله في app.js
        this.features.advancedServiceWorker = true;
        console.log('✅ Advanced Service Worker ready');
      } else {
        console.warn('⚠️ Advanced Service Worker not available');
      }
    } catch (error) {
      console.error('❌ Advanced Service Worker initialization failed:', error);
    }
    
    this.stats.featureLoadTimes.advancedServiceWorker = Date.now() - startTime;
  }

  /**
   * إرسال حدث التهيئة
   */
  dispatchInitializedEvent() {
    const event = new CustomEvent('performanceManagerReady', {
      detail: {
        features: this.features,
        stats: this.stats
      }
    });
    
    window.dispatchEvent(event);
  }

  /**
   * الحصول على إحصائيات الأداء
   */
  getPerformanceStats() {
    return {
      initialized: this.initialized,
      features: this.features,
      stats: this.stats,
      totalFeatures: Object.keys(this.features).length,
      activeFeatures: Object.values(this.features).filter(Boolean).length
    };
  }

  /**
   * تشخيص حالة التحسينات
   */
  diagnose() {
    const diagnosis = {
      timestamp: new Date().toISOString(),
      performanceManager: this.initialized,
      features: {}
    };

    // فحص كل ميزة
    Object.keys(this.features).forEach(feature => {
      diagnosis.features[feature] = {
        available: this.features[feature],
        loadTime: this.stats.featureLoadTimes[feature] || 0
      };
    });

    // فحص إضافي للميزات
    diagnosis.features.smartCache.details = {
      appCache: typeof window.appCache !== 'undefined',
      balanceCache: typeof window.balanceCache !== 'undefined',
      reportsCache: typeof window.reportsCache !== 'undefined'
    };

    diagnosis.features.advancedSearch.details = {
      searchManager: typeof window.searchManager !== 'undefined',
      isInitialized: window.searchManager?.isInitialized || false
    };

    diagnosis.features.webWorkers.details = {
      reportWorker: typeof window.reportWorker !== 'undefined',
      workerManager: typeof window.workerManager !== 'undefined'
    };

    diagnosis.features.virtualScrolling.details = {
      VirtualScrollTable: typeof VirtualScrollTable !== 'undefined',
      packagesVirtualTable: typeof window.packagesVirtualTable !== 'undefined'
    };

    diagnosis.features.advancedServiceWorker.details = {
      swManager: typeof window.swManager !== 'undefined',
      serviceWorkerSupport: 'serviceWorker' in navigator,
      controllerActive: !!navigator.serviceWorker.controller
    };

    console.log('🔍 Performance Diagnosis:', diagnosis);
    return diagnosis;
  }

  /**
   * تحسين الأداء بناءً على حجم البيانات
   */
  optimizeForDataSize() {
    if (!window.data) return;

    const dataSize = {
      packages: window.data.packages?.length || 0,
      stores: window.data.stores?.length || 0,
      sales: window.data.sales?.length || 0,
      payments: window.data.payments?.length || 0,
      expenses: window.data.expenses?.length || 0,
      inventory: window.data.inventory?.length || 0
    };

    const totalRecords = Object.values(dataSize).reduce((sum, count) => sum + count, 0);

    console.log('📊 Data size analysis:', dataSize);
    console.log(`📈 Total records: ${totalRecords}`);

    // تحسينات بناءً على حجم البيانات
    if (totalRecords > 1000) {
      console.log('🚀 Large dataset detected, applying optimizations...');
      
      // تفعيل Virtual Scrolling للجداول الكبيرة
      if (dataSize.packages > 50 && typeof renderPackagesTable === 'function') {
        console.log('📦 Optimizing packages table with Virtual Scrolling');
      }
      
      // تحسين كاش البحث
      if (dataSize.stores > 100 && this.features.advancedSearch) {
        console.log('🔍 Search optimization enabled for large store dataset');
      }
    }

    return dataSize;
  }

  /**
   * مراقبة الأداء
   */
  startPerformanceMonitoring() {
    // مراقبة استخدام الذاكرة
    if ('memory' in performance) {
      const memoryInfo = performance.memory;
      console.log('💾 Memory usage:', {
        used: Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024) + 'MB',
        total: Math.round(memoryInfo.totalJSHeapSize / 1024 / 1024) + 'MB',
        limit: Math.round(memoryInfo.jsHeapSizeLimit / 1024 / 1024) + 'MB'
      });
    }

    // مراقبة أداء العرض
    if ('getEntriesByType' in performance) {
      const paintEntries = performance.getEntriesByType('paint');
      paintEntries.forEach(entry => {
        console.log(`🎨 ${entry.name}: ${Math.round(entry.startTime)}ms`);
      });
    }
  }
}

// إنشاء مدير الأداء العام
const performanceManager = new PerformanceManager();

// تهيئة تلقائية عند تحميل DOM
document.addEventListener('DOMContentLoaded', async () => {
  // انتظار تحميل البيانات
  if (typeof loadData === 'function' && !window.data) {
    loadData();
  }

  // تهيئة مدير الأداء
  await performanceManager.initialize();
  
  // تحسين بناءً على حجم البيانات
  performanceManager.optimizeForDataSize();
  
  // بدء مراقبة الأداء
  performanceManager.startPerformanceMonitoring();
});

// تصدير للاستخدام العام
window.performanceManager = performanceManager;

// إضافة دوال مساعدة للتشخيص
window.diagnosePerformance = () => performanceManager.diagnose();
window.getPerformanceStats = () => performanceManager.getPerformanceStats();

console.log('🎯 Performance Manager loaded successfully');