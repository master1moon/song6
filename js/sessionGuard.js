/**
 * حارس الجلسة - حماية إضافية لمنع تجاوز قفل التطبيق
 * يراقب محاولات تجاوز القفل ويمنع الوصول للبيانات الحساسة
 */

class SessionGuard {
    constructor() {
        this.isGuardActive = false;
        this.protectedFunctions = [];
        this.originalFunctions = new Map();
        
        this.init();
    }

    /**
     * تهيئة حارس الجلسة
     */
    init() {
        this.setupProtection();
        this.interceptSensitiveFunctions();
        
        console.log('🛡️ تم تفعيل حارس الجلسة');
    }

    /**
     * إعداد الحماية
     */
    setupProtection() {
        // حماية من فتح Developer Tools
        document.addEventListener('keydown', (e) => {
            if (this.shouldBlockAccess()) {
                // منع F12, Ctrl+Shift+I, Ctrl+U, etc.
                if (e.key === 'F12' || 
                    (e.ctrlKey && e.shiftKey && e.key === 'I') ||
                    (e.ctrlKey && e.key === 'u')) {
                    e.preventDefault();
                    this.showAccessDenied('لا يمكن فتح أدوات المطور أثناء قفل التطبيق');
                    return false;
                }
            }
        });

        // حماية من النقر الأيمن
        document.addEventListener('contextmenu', (e) => {
            if (this.shouldBlockAccess()) {
                e.preventDefault();
                this.showAccessDenied('النقر الأيمن محظور أثناء قفل التطبيق');
                return false;
            }
        });

        // حماية من تحديد النص
        document.addEventListener('selectstart', (e) => {
            if (this.shouldBlockAccess()) {
                e.preventDefault();
                return false;
            }
        });
    }

    /**
     * اعتراض الدوال الحساسة
     */
    interceptSensitiveFunctions() {
        const sensitiveFunctions = [
            'renderStoresList',
            'showStoreDetails', 
            'addStore',
            'editStore',
            'deleteStore',
            'renderPackagesTable',
            'addPackage',
            'editPackage',
            'deletePackage',
            'addSale',
            'addPayment',
            'generateReport',
            'exportToExcel',
            'exportToPDF'
        ];

        sensitiveFunctions.forEach(funcName => {
            if (typeof window[funcName] === 'function') {
                this.protectFunction(funcName);
            }
        });
    }

    /**
     * حماية دالة معينة
     */
    protectFunction(functionName) {
        if (this.originalFunctions.has(functionName)) return;

        const originalFunction = window[functionName];
        this.originalFunctions.set(functionName, originalFunction);

        window[functionName] = (...args) => {
            if (this.shouldBlockAccess()) {
                this.showAccessDenied(`لا يمكن الوصول للدالة ${functionName} أثناء قفل التطبيق`);
                return;
            }
            
            return originalFunction.apply(window, args);
        };

        this.protectedFunctions.push(functionName);
    }

    /**
     * فحص ما إذا كان يجب منع الوصول
     */
    shouldBlockAccess() {
        return this.isGuardActive && 
               typeof window.screenLock !== 'undefined' && 
               window.screenLock.isScreenLocked();
    }

    /**
     * تفعيل الحماية
     */
    activate() {
        this.isGuardActive = true;
        
        // إخفاء البيانات الحساسة
        this.hideSensitiveData();
        
        console.log('🛡️ تم تفعيل حارس الجلسة');
    }

    /**
     * إلغاء تفعيل الحماية
     */
    deactivate() {
        this.isGuardActive = false;
        
        // إظهار البيانات
        this.showSensitiveData();
        
        console.log('🛡️ تم إلغاء تفعيل حارس الجلسة');
    }

    /**
     * إخفاء البيانات الحساسة
     */
    hideSensitiveData() {
        // طمس الأرصدة والمبالغ
        const sensitiveElements = document.querySelectorAll('.currency, .balance, .amount, .total');
        sensitiveElements.forEach(el => {
            if (!el.dataset.originalText) {
                el.dataset.originalText = el.textContent;
            }
            el.textContent = '***';
            el.style.filter = 'blur(5px)';
        });

        // إخفاء الجداول الحساسة
        const tables = document.querySelectorAll('#storesTable, #packagesTable, #salesTable, #paymentsTable');
        tables.forEach(table => {
            table.style.filter = 'blur(10px)';
            table.style.pointerEvents = 'none';
        });
    }

    /**
     * إظهار البيانات الحساسة
     */
    showSensitiveData() {
        // استعادة الأرصدة والمبالغ
        const sensitiveElements = document.querySelectorAll('.currency, .balance, .amount, .total');
        sensitiveElements.forEach(el => {
            if (el.dataset.originalText) {
                el.textContent = el.dataset.originalText;
                delete el.dataset.originalText;
            }
            el.style.filter = '';
        });

        // إظهار الجداول
        const tables = document.querySelectorAll('#storesTable, #packagesTable, #salesTable, #paymentsTable');
        tables.forEach(table => {
            table.style.filter = '';
            table.style.pointerEvents = '';
        });
    }

    /**
     * عرض رسالة منع الوصول
     */
    showAccessDenied(message) {
        if (typeof window.showNotification === 'function') {
            window.showNotification(message, 'error');
        } else {
            alert(message);
        }
    }

    /**
     * استعادة الدوال الأصلية
     */
    restoreOriginalFunctions() {
        this.protectedFunctions.forEach(funcName => {
            if (this.originalFunctions.has(funcName)) {
                window[funcName] = this.originalFunctions.get(funcName);
            }
        });
        
        this.protectedFunctions = [];
        this.originalFunctions.clear();
    }
}

// إنشاء مثيل عام
window.sessionGuard = new SessionGuard();

// ربط مع نظام القفل
if (typeof window.screenLock !== 'undefined') {
    // تفعيل الحماية عند القفل
    const originalLock = window.screenLock.lock;
    window.screenLock.lock = function() {
        window.sessionGuard.activate();
        return originalLock.call(this);
    };

    // إلغاء الحماية عند فتح القفل
    const originalPerformUnlock = window.screenLock.performUnlock;
    window.screenLock.performUnlock = function() {
        window.sessionGuard.deactivate();
        return originalPerformUnlock.call(this);
    };
}

// تصدير للاستخدام في وحدات أخرى
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SessionGuard;
}