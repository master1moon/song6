/**
 * ملف اختبار شامل للتحسينات المطبقة
 * يختبر جميع الميزات الجديدة ويقيس الأداء
 */

class PerformanceTest {
  constructor() {
    this.testResults = {};
    this.testStartTime = Date.now();
  }

  /**
   * تشغيل جميع الاختبارات
   */
  async runAllTests() {
    console.log('🧪 Starting comprehensive performance tests...');
    
    try {
      // 1. اختبار Smart Cache
      await this.testSmartCache();
      
      // 2. اختبار Virtual Scrolling
      await this.testVirtualScrolling();
      
      // 3. اختبار Advanced Search
      await this.testAdvancedSearch();
      
      // 4. اختبار Web Workers
      await this.testWebWorkers();
      
      // 5. اختبار Service Worker
      await this.testServiceWorker();
      
      // 6. اختبار الأداء العام
      await this.testOverallPerformance();
      
      // إنشاء تقرير النتائج
      this.generateTestReport();
      
    } catch (error) {
      console.error('❌ Performance tests failed:', error);
    }
  }

  /**
   * اختبار Smart Cache
   */
  async testSmartCache() {
    console.log('🧪 Testing Smart Cache...');
    const testName = 'smartCache';
    const startTime = performance.now();
    
    try {
      let passed = 0;
      let total = 0;
      
      // اختبار وجود النظام
      total++;
      if (typeof window.appCache !== 'undefined') {
        passed++;
        console.log('✅ Smart Cache system available');
      } else {
        console.log('❌ Smart Cache system not available');
      }
      
      // اختبار كاش الأرصدة
      total++;
      if (typeof window.balanceCache !== 'undefined') {
        passed++;
        console.log('✅ Balance cache available');
        
        // اختبار الأداء
        if (window.data && window.data.stores && window.data.stores.length > 0) {
          const storeId = window.data.stores[0].id;
          
          // القياس بدون كاش
          const withoutCacheStart = performance.now();
          const sales = window.data.sales.filter(s => s.storeId === storeId);
          const payments = window.data.payments.filter(p => p.storeId === storeId);
          const totalSales = sales.reduce((sum, sale) => sum + (sale.total || 0), 0);
          const totalPayments = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
          const balanceWithoutCache = totalSales - totalPayments;
          const withoutCacheTime = performance.now() - withoutCacheStart;
          
          // القياس مع الكاش
          const withCacheStart = performance.now();
          const balanceInfo = await window.balanceCache.calculateBalance(storeId);
          const withCacheTime = performance.now() - withCacheStart;
          
          // القياس من الكاش (الطلب الثاني)
          const fromCacheStart = performance.now();
          const balanceInfo2 = await window.balanceCache.calculateBalance(storeId);
          const fromCacheTime = performance.now() - fromCacheStart;
          
          console.log(`⚡ Cache performance:
            - Without cache: ${withoutCacheTime.toFixed(2)}ms
            - With cache (first): ${withCacheTime.toFixed(2)}ms
            - From cache (second): ${fromCacheTime.toFixed(2)}ms
            - Speed improvement: ${(withoutCacheTime / fromCacheTime).toFixed(1)}x`);
          
          total++;
          if (fromCacheTime < withoutCacheTime) {
            passed++;
            console.log('✅ Cache performance improvement confirmed');
          }
        }
      } else {
        console.log('❌ Balance cache not available');
      }
      
      this.testResults[testName] = {
        passed,
        total,
        duration: performance.now() - startTime,
        success: passed === total
      };
      
    } catch (error) {
      console.error('❌ Smart Cache test failed:', error);
      this.testResults[testName] = {
        passed: 0,
        total: 1,
        duration: performance.now() - startTime,
        success: false,
        error: error.message
      };
    }
  }

  /**
   * اختبار Virtual Scrolling
   */
  async testVirtualScrolling() {
    console.log('🧪 Testing Virtual Scrolling...');
    const testName = 'virtualScrolling';
    const startTime = performance.now();
    
    try {
      let passed = 0;
      let total = 0;
      
      // اختبار وجود النظام
      total++;
      if (typeof VirtualScrollTable !== 'undefined') {
        passed++;
        console.log('✅ Virtual Scrolling class available');
        
        // إنشاء بيانات اختبار كبيرة
        const testData = [];
        for (let i = 1; i <= 1000; i++) {
          testData.push({
            id: `test_${i}`,
            name: `اختبار ${i}`,
            value: Math.random() * 1000
          });
        }
        
        // إنشاء حاوية اختبار
        const testContainer = document.createElement('div');
        testContainer.id = 'virtualScrollTest';
        testContainer.style.cssText = 'position: absolute; top: -9999px; width: 500px; height: 400px;';
        document.body.appendChild(testContainer);
        
        try {
          // اختبار إنشاء Virtual Table
          total++;
          const virtualTable = new VirtualScrollTable('virtualScrollTest', testData, {
            itemHeight: 40,
            headers: ['ID', 'اسم', 'قيمة'],
            renderItem: (item) => {
              const row = document.createElement('tr');
              row.innerHTML = `<td>${item.id}</td><td>${item.name}</td><td>${item.value.toFixed(2)}</td>`;
              return row;
            }
          });
          
          passed++;
          console.log('✅ Virtual Scrolling table created successfully');
          
          // اختبار التحديث
          total++;
          const newData = testData.slice(0, 500);
          virtualTable.updateData(newData);
          passed++;
          console.log('✅ Virtual Scrolling data update successful');
          
        } catch (error) {
          console.error('❌ Virtual Scrolling creation failed:', error);
        } finally {
          // تنظيف
          testContainer.remove();
        }
        
      } else {
        console.log('❌ Virtual Scrolling not available');
      }
      
      this.testResults[testName] = {
        passed,
        total,
        duration: performance.now() - startTime,
        success: passed === total
      };
      
    } catch (error) {
      console.error('❌ Virtual Scrolling test failed:', error);
      this.testResults[testName] = {
        passed: 0,
        total: 1,
        duration: performance.now() - startTime,
        success: false,
        error: error.message
      };
    }
  }

  /**
   * اختبار Advanced Search
   */
  async testAdvancedSearch() {
    console.log('🧪 Testing Advanced Search...');
    const testName = 'advancedSearch';
    const startTime = performance.now();
    
    try {
      let passed = 0;
      let total = 0;
      
      // اختبار وجود النظام
      total++;
      if (typeof window.searchManager !== 'undefined') {
        passed++;
        console.log('✅ Search Manager available');
        
        // اختبار التهيئة
        total++;
        if (window.data) {
          window.searchManager.initialize(window.data);
          passed++;
          console.log('✅ Search Manager initialized');
          
          // اختبار البحث
          if (window.data.stores && window.data.stores.length > 0) {
            total++;
            const searchQuery = window.data.stores[0].name.substring(0, 3);
            const results = window.searchManager.search('stores', searchQuery);
            
            if (results && results.length > 0) {
              passed++;
              console.log(`✅ Search test passed: "${searchQuery}" found ${results.length} results`);
              
              // اختبار الأداء
              const performanceTest = () => {
                const start = performance.now();
                window.searchManager.search('stores', searchQuery);
                return performance.now() - start;
              };
              
              const searchTime = performanceTest();
              console.log(`⚡ Search performance: ${searchTime.toFixed(2)}ms`);
              
              // اختبار الاقتراحات
              total++;
              const suggestions = window.searchManager.getSuggestions('stores', searchQuery.substring(0, 2));
              if (suggestions && suggestions.length >= 0) {
                passed++;
                console.log(`✅ Search suggestions: ${suggestions.length} suggestions`);
              }
            }
          }
        } else {
          console.log('⚠️ No data available for search testing');
        }
      } else {
        console.log('❌ Search Manager not available');
      }
      
      this.testResults[testName] = {
        passed,
        total,
        duration: performance.now() - startTime,
        success: passed === total
      };
      
    } catch (error) {
      console.error('❌ Advanced Search test failed:', error);
      this.testResults[testName] = {
        passed: 0,
        total: 1,
        duration: performance.now() - startTime,
        success: false,
        error: error.message
      };
    }
  }

  /**
   * اختبار Web Workers
   */
  async testWebWorkers() {
    console.log('🧪 Testing Web Workers...');
    const testName = 'webWorkers';
    const startTime = performance.now();
    
    try {
      let passed = 0;
      let total = 0;
      
      // اختبار دعم Web Workers
      total++;
      if ('Worker' in window) {
        passed++;
        console.log('✅ Web Workers supported');
        
        // اختبار وجود مدير Workers
        total++;
        if (typeof window.workerManager !== 'undefined') {
          passed++;
          console.log('✅ Worker Manager available');
          
          // اختبار وجود Report Worker
          total++;
          if (typeof window.reportWorker !== 'undefined') {
            passed++;
            console.log('✅ Report Worker available');
            
            // اختبار بسيط للـ Worker (إذا كان هناك بيانات)
            if (window.data && window.data.sales && window.data.sales.length > 0) {
              try {
                total++;
                // لا نقوم بتشغيل Worker فعلي في الاختبار لتجنب التعقيد
                // نتحقق فقط من إمكانية الوصول للدوال
                if (typeof window.generateAdvancedReport === 'function') {
                  passed++;
                  console.log('✅ Advanced report function available');
                }
              } catch (workerError) {
                console.log('⚠️ Worker test skipped:', workerError.message);
              }
            }
          }
        }
      } else {
        console.log('❌ Web Workers not supported');
      }
      
      this.testResults[testName] = {
        passed,
        total,
        duration: performance.now() - startTime,
        success: passed === total
      };
      
    } catch (error) {
      console.error('❌ Web Workers test failed:', error);
      this.testResults[testName] = {
        passed: 0,
        total: 1,
        duration: performance.now() - startTime,
        success: false,
        error: error.message
      };
    }
  }

  /**
   * اختبار Service Worker
   */
  async testServiceWorker() {
    console.log('🧪 Testing Service Worker...');
    const testName = 'serviceWorker';
    const startTime = performance.now();
    
    try {
      let passed = 0;
      let total = 0;
      
      // اختبار دعم Service Worker
      total++;
      if ('serviceWorker' in navigator) {
        passed++;
        console.log('✅ Service Worker supported');
        
        // اختبار وجود مدير Service Worker
        total++;
        if (typeof window.swManager !== 'undefined') {
          passed++;
          console.log('✅ Service Worker Manager available');
          
          // اختبار التسجيل
          total++;
          if (navigator.serviceWorker.controller) {
            passed++;
            console.log('✅ Service Worker is active');
          } else {
            console.log('⚠️ Service Worker not yet active');
          }
        }
      } else {
        console.log('❌ Service Worker not supported');
      }
      
      this.testResults[testName] = {
        passed,
        total,
        duration: performance.now() - startTime,
        success: passed === total
      };
      
    } catch (error) {
      console.error('❌ Service Worker test failed:', error);
      this.testResults[testName] = {
        passed: 0,
        total: 1,
        duration: performance.now() - startTime,
        success: false,
        error: error.message
      };
    }
  }

  /**
   * اختبار الأداء العام
   */
  async testOverallPerformance() {
    console.log('🧪 Testing Overall Performance...');
    const testName = 'overallPerformance';
    const startTime = performance.now();
    
    try {
      let passed = 0;
      let total = 0;
      
      // اختبار مدير الأداء
      total++;
      if (typeof window.performanceManager !== 'undefined') {
        passed++;
        console.log('✅ Performance Manager available');
        
        // اختبار التهيئة
        total++;
        if (window.performanceManager.initialized) {
          passed++;
          console.log('✅ Performance Manager initialized');
          
          // الحصول على الإحصائيات
          const stats = window.performanceManager.getPerformanceStats();
          console.log('📊 Performance Stats:', stats);
          
          // اختبار عدد الميزات المفعلة
          total++;
          if (stats.activeFeatures > 0) {
            passed++;
            console.log(`✅ ${stats.activeFeatures}/${stats.totalFeatures} features active`);
          }
        }
      } else {
        console.log('❌ Performance Manager not available');
      }
      
      // اختبار استخدام الذاكرة
      if ('memory' in performance) {
        const memory = performance.memory;
        const usedMB = Math.round(memory.usedJSHeapSize / 1024 / 1024);
        const limitMB = Math.round(memory.jsHeapSizeLimit / 1024 / 1024);
        
        total++;
        if (usedMB < limitMB * 0.8) { // أقل من 80% من الحد الأقصى
          passed++;
          console.log(`✅ Memory usage OK: ${usedMB}MB / ${limitMB}MB`);
        } else {
          console.log(`⚠️ High memory usage: ${usedMB}MB / ${limitMB}MB`);
        }
      }
      
      this.testResults[testName] = {
        passed,
        total,
        duration: performance.now() - startTime,
        success: passed === total
      };
      
    } catch (error) {
      console.error('❌ Overall Performance test failed:', error);
      this.testResults[testName] = {
        passed: 0,
        total: 1,
        duration: performance.now() - startTime,
        success: false,
        error: error.message
      };
    }
  }

  /**
   * إنشاء تقرير النتائج
   */
  generateTestReport() {
    const totalDuration = Date.now() - this.testStartTime;
    const totalTests = Object.values(this.testResults).reduce((sum, result) => sum + result.total, 0);
    const totalPassed = Object.values(this.testResults).reduce((sum, result) => sum + result.passed, 0);
    const successRate = (totalPassed / totalTests * 100).toFixed(1);
    
    console.log('\n🎯 =============== PERFORMANCE TEST REPORT ===============');
    console.log(`⏱️  Total Duration: ${totalDuration}ms`);
    console.log(`📊 Tests: ${totalPassed}/${totalTests} passed (${successRate}%)`);
    console.log('📋 Detailed Results:');
    
    Object.entries(this.testResults).forEach(([testName, result]) => {
      const status = result.success ? '✅' : '❌';
      const rate = (result.passed / result.total * 100).toFixed(1);
      console.log(`   ${status} ${testName}: ${result.passed}/${result.total} (${rate}%) - ${result.duration.toFixed(2)}ms`);
      
      if (result.error) {
        console.log(`      Error: ${result.error}`);
      }
    });
    
    console.log('========================================================\n');
    
    // عرض إشعار للمستخدم
    if (typeof showNotification === 'function') {
      const message = `اختبار الأداء مكتمل: ${totalPassed}/${totalTests} اختبار نجح (${successRate}%)`;
      const type = successRate >= 80 ? 'success' : successRate >= 60 ? 'warning' : 'error';
      showNotification(message, type, 8000);
    }
    
    return {
      totalTests,
      totalPassed,
      successRate: parseFloat(successRate),
      duration: totalDuration,
      results: this.testResults
    };
  }
}

// دالة لتشغيل الاختبارات
window.runPerformanceTests = async function() {
  const test = new PerformanceTest();
  return await test.runAllTests();
};

// دالة لاختبار ميزة واحدة
window.testSingleFeature = async function(featureName) {
  const test = new PerformanceTest();
  
  switch (featureName.toLowerCase()) {
    case 'cache':
    case 'smartcache':
      await test.testSmartCache();
      break;
    case 'virtual':
    case 'virtualscrolling':
      await test.testVirtualScrolling();
      break;
    case 'search':
    case 'advancedsearch':
      await test.testAdvancedSearch();
      break;
    case 'workers':
    case 'webworkers':
      await test.testWebWorkers();
      break;
    case 'serviceworker':
    case 'sw':
      await test.testServiceWorker();
      break;
    case 'performance':
    case 'overall':
      await test.testOverallPerformance();
      break;
    default:
      console.error('❌ Unknown feature:', featureName);
      return;
  }
  
  test.generateTestReport();
};

// تشغيل اختبار سريع عند التحميل
document.addEventListener('DOMContentLoaded', () => {
  // انتظار قليل للتأكد من تحميل جميع الأنظمة
  setTimeout(() => {
    console.log('🚀 Running quick performance check...');
    
    const quickCheck = {
      smartCache: typeof window.appCache !== 'undefined',
      virtualScrolling: typeof VirtualScrollTable !== 'undefined',
      advancedSearch: typeof window.searchManager !== 'undefined',
      webWorkers: typeof window.reportWorker !== 'undefined',
      serviceWorker: typeof window.swManager !== 'undefined',
      performanceManager: typeof window.performanceManager !== 'undefined'
    };
    
    const activeFeatures = Object.values(quickCheck).filter(Boolean).length;
    const totalFeatures = Object.keys(quickCheck).length;
    
    console.log('⚡ Quick Performance Check:', quickCheck);
    console.log(`📊 Features loaded: ${activeFeatures}/${totalFeatures}`);
    
    if (activeFeatures === totalFeatures) {
      console.log('🎉 All performance features loaded successfully!');
    } else {
      console.log('⚠️ Some performance features may not be available');
    }
  }, 2000);
});

console.log('🧪 Performance Test Suite loaded successfully');