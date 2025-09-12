/**
 * فحوصات الأمان للدوال والمتغيرات
 * يتأكد من وجود جميع التبعيات قبل استخدامها
 */

(function() {
    'use strict';

    /**
     * فحص وإنشاء الدوال المفقودة
     */
    function ensureFunctionsExist() {
        // فحص balanceCache
        if (typeof window.balanceCache === 'undefined') {
            console.warn('⚠️ balanceCache غير متاح، إنشاء نسخة احتياطية...');
            
            window.balanceCache = {
                calculateBalance: async function(storeId) {
                    // حساب الرصيد بالطريقة العادية
                    if (typeof calculateStoreBalance === 'function') {
                        const balance = calculateStoreBalance(storeId);
                        return {
                            balance: balance,
                            totalSales: 0,
                            totalPayments: 0
                        };
                    }
                    return { balance: 0, totalSales: 0, totalPayments: 0 };
                },
                invalidateStore: function(storeId) {
                    console.log(`تم تحديث كاش المحل: ${storeId}`);
                },
                clear: function() {
                    console.log('تم مسح كاش الأرصدة');
                },
                getStats: function() {
                    return { hits: 0, misses: 0, size: 0 };
                }
            };
        }

        // فحص reportCache
        if (typeof window.reportCache === 'undefined') {
            console.warn('⚠️ reportCache غير متاح، إنشاء نسخة احتياطية...');
            
            window.reportCache = {
                get: async function(key, computeFn) {
                    // تنفيذ الحساب مباشرة بدون cache
                    return await computeFn();
                },
                invalidateReports: function() {
                    console.log('تم تحديث كاش التقارير');
                },
                clear: function() {
                    console.log('تم مسح كاش التقارير');
                },
                getStats: function() {
                    return { hits: 0, misses: 0, size: 0 };
                }
            };
        }

        // فحص reportsCache (alias)
        if (typeof window.reportsCache === 'undefined') {
            window.reportsCache = window.reportCache;
        }

        // فحص searchManager
        if (typeof window.searchManager === 'undefined') {
            console.warn('⚠️ searchManager غير متاح، إنشاء نسخة احتياطية...');
            
            window.searchManager = {
                isInitialized: false,
                search: function(query, data) {
                    // بحث بسيط
                    return data.filter(item => 
                        JSON.stringify(item).toLowerCase().includes(query.toLowerCase())
                    );
                }
            };
        }

        // فحص calculateStoreBalance
        if (typeof window.calculateStoreBalance === 'undefined') {
            window.calculateStoreBalance = function(storeId) {
                if (!window.data) return 0;
                
                const sales = (window.data.sales || []).filter(s => s.storeId === storeId);
                const payments = (window.data.payments || []).filter(p => p.storeId === storeId);
                
                const totalSales = sales.reduce((sum, sale) => sum + (sale.total || 0), 0);
                const totalPayments = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
                
                return totalSales - totalPayments;
            };
        }

        // فحص searchStoresAdvanced
        if (typeof window.searchStoresAdvanced === 'undefined') {
            window.searchStoresAdvanced = function(query, options = {}) {
                if (!window.data || !window.data.stores) return [];
                
                const queryLower = query.toLowerCase();
                return window.data.stores.filter(store => 
                    store.name.toLowerCase().includes(queryLower) ||
                    (store.phone && store.phone.includes(query)) ||
                    (store.address && store.address.toLowerCase().includes(queryLower))
                ).slice(0, options.limit || 100);
            };
        }
    }

    /**
     * فحص وإصلاح المتغيرات العامة
     */
    function ensureGlobalVariables() {
        // فحص today
        if (typeof window.today === 'undefined') {
            window.today = new Date().toISOString().split('T')[0];
        }

        // فحص data
        if (typeof window.data === 'undefined') {
            window.data = {
                stores: [],
                packages: [],
                sales: [],
                payments: [],
                expenses: [],
                inventory: []
            };
        }

        // فحص currentStoreId
        if (typeof window.currentStoreId === 'undefined') {
            window.currentStoreId = null;
        }
    }

    /**
     * إعداد معالجات الأخطاء العامة
     */
    function setupErrorHandlers() {
        // معالج الأخطاء العام
        window.addEventListener('error', function(event) {
            console.error('خطأ JavaScript:', event.error);
            
            // إظهار رسالة مفيدة للمستخدم
            if (typeof window.showNotification === 'function') {
                window.showNotification('حدث خطأ في التطبيق. يرجى تحديث الصفحة', 'error');
            }
        });

        // معالج الأخطاء للـ Promises
        window.addEventListener('unhandledrejection', function(event) {
            console.error('خطأ Promise غير معالج:', event.reason);
            
            if (typeof window.showNotification === 'function') {
                window.showNotification('حدث خطأ في تحميل البيانات', 'warning');
            }
        });
    }

    /**
     * تهيئة فحوصات الأمان
     */
    function initSafetyChecks() {
        ensureGlobalVariables();
        ensureFunctionsExist();
        setupErrorHandlers();
        
        console.log('✅ تم تطبيق فحوصات الأمان');
    }

    // تشغيل الفحوصات فوراً
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSafetyChecks);
    } else {
        initSafetyChecks();
    }

    // تشغيل دوري للفحوصات
    setInterval(ensureFunctionsExist, 30000); // كل 30 ثانية

})();