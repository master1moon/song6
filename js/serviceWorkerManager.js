/**
 * مدير Service Worker المتقدم
 * يدير تسجيل وتحديث والتفاعل مع Service Worker
 */

class ServiceWorkerManager {
  constructor() {
    this.registration = null;
    this.isSupported = 'serviceWorker' in navigator;
    this.isOnline = navigator.onLine;
    this.updateAvailable = false;
    this.listeners = new Map();
    
    // مراقبة حالة الاتصال
    this.setupOnlineOfflineListeners();
  }

  /**
   * تسجيل Service Worker
   */
  async register(scriptPath = './advanced-serviceworker.js') {
    if (!this.isSupported) {
      console.warn('❌ Service Worker not supported');
      return false;
    }

    try {
      console.log('🔄 Registering Service Worker...');
      
      this.registration = await navigator.serviceWorker.register(scriptPath, {
        scope: './'
      });

      console.log('✅ Service Worker registered successfully');
      
      // إعداد معالجات الأحداث
      this.setupEventListeners();
      
      // التحقق من التحديثات
      this.checkForUpdates();
      
      return true;
      
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
      return false;
    }
  }

  /**
   * إعداد معالجات الأحداث
   */
  setupEventListeners() {
    if (!this.registration) return;

    // Service Worker جديد في انتظار التفعيل
    this.registration.addEventListener('updatefound', () => {
      const newWorker = this.registration.installing;
      
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed') {
          if (navigator.serviceWorker.controller) {
            // يوجد تحديث جديد
            this.updateAvailable = true;
            this.emit('updateAvailable', newWorker);
            this.showUpdateNotification();
          } else {
            // أول تثبيت
            this.emit('installed');
            this.showInstallNotification();
          }
        }
      });
    });

    // استقبال رسائل من Service Worker
    navigator.serviceWorker.addEventListener('message', event => {
      this.handleServiceWorkerMessage(event.data);
    });

    // عندما يصبح Service Worker نشطاً
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('🔄 Service Worker controller changed');
      this.emit('controllerchange');
    });
  }

  /**
   * معالجة رسائل Service Worker
   */
  handleServiceWorkerMessage(message) {
    const { type, version, data } = message;
    
    switch (type) {
      case 'SW_UPDATED':
        console.log(`🆕 Service Worker updated to version: ${version}`);
        this.emit('updated', { version });
        break;
        
      case 'CACHE_STATS':
        console.log('📊 Cache Statistics:', data);
        this.emit('cacheStats', data);
        break;
        
      case 'CACHE_CLEARED':
        console.log('🗑️ Cache cleared successfully');
        this.emit('cacheCleared');
        break;
        
      default:
        console.log('📨 Unknown message from Service Worker:', message);
    }
  }

  /**
   * تطبيق التحديث الجديد
   */
  async applyUpdate() {
    if (!this.updateAvailable || !this.registration) {
      return false;
    }

    try {
      const newWorker = this.registration.waiting;
      
      if (newWorker) {
        // إرسال رسالة لتخطي الانتظار
        newWorker.postMessage({ type: 'SKIP_WAITING' });
        
        // إعادة تحميل الصفحة عند تفعيل الـ Worker الجديد
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          window.location.reload();
        });
        
        return true;
      }
      
    } catch (error) {
      console.error('❌ Failed to apply update:', error);
      return false;
    }
  }

  /**
   * التحقق من التحديثات يدوياً
   */
  async checkForUpdates() {
    if (!this.registration) return;

    try {
      await this.registration.update();
      console.log('🔍 Checked for Service Worker updates');
      
    } catch (error) {
      console.error('❌ Failed to check for updates:', error);
    }
  }

  /**
   * الحصول على إحصائيات الكاش
   */
  async getCacheStats() {
    return new Promise((resolve, reject) => {
      if (!navigator.serviceWorker.controller) {
        reject(new Error('No active Service Worker'));
        return;
      }

      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = event => {
        if (event.data.type === 'CACHE_STATS') {
          resolve(event.data.data);
        }
      };

      navigator.serviceWorker.controller.postMessage(
        { type: 'GET_CACHE_STATS' },
        [messageChannel.port2]
      );
    });
  }

  /**
   * مسح جميع الكاش
   */
  async clearCache() {
    return new Promise((resolve, reject) => {
      if (!navigator.serviceWorker.controller) {
        reject(new Error('No active Service Worker'));
        return;
      }

      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = event => {
        if (event.data.type === 'CACHE_CLEARED') {
          resolve();
        }
      };

      navigator.serviceWorker.controller.postMessage(
        { type: 'CLEAR_CACHE' },
        [messageChannel.port2]
      );
    });
  }

  /**
   * تحميل مسبق لموارد معينة
   */
  prefetchResources(urls) {
    if (!navigator.serviceWorker.controller) return;

    navigator.serviceWorker.controller.postMessage({
      type: 'PREFETCH_RESOURCES',
      data: { urls }
    });

    console.log(`📥 Prefetching ${urls.length} resources`);
  }

  /**
   * إعداد مراقبة الاتصال
   */
  setupOnlineOfflineListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('🌐 Back online');
      this.emit('online');
      this.showOnlineNotification();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('🔌 Gone offline');
      this.emit('offline');
      this.showOfflineNotification();
    });
  }

  /**
   * عرض إشعار التحديث
   */
  showUpdateNotification() {
    const notification = this.createNotification(
      '🆕 تحديث جديد متاح',
      'يمكنك تطبيق التحديث لتحسين الأداء والحصول على ميزات جديدة.',
      [
        {
          text: 'تطبيق التحديث',
          action: () => this.applyUpdate(),
          primary: true
        },
        {
          text: 'لاحقاً',
          action: () => notification.remove()
        }
      ]
    );
  }

  /**
   * عرض إشعار التثبيت
   */
  showInstallNotification() {
    if (typeof showNotification === 'function') {
      showNotification('✅ التطبيق جاهز للعمل بدون إنترنت!', 'success');
    }
  }

  /**
   * عرض إشعار العمل بدون إنترنت
   */
  showOfflineNotification() {
    const notification = this.createNotification(
      '🔌 لا يوجد اتصال إنترنت',
      'التطبيق يعمل الآن في وضع عدم الاتصال. بعض الميزات قد تكون محدودة.',
      [
        {
          text: 'حسناً',
          action: () => notification.remove()
        }
      ],
      'warning'
    );
  }

  /**
   * عرض إشعار العودة للإنترنت
   */
  showOnlineNotification() {
    if (typeof showNotification === 'function') {
      showNotification('🌐 تم استعادة الاتصال بالإنترنت', 'success');
    }
  }

  /**
   * إنشاء إشعار مخصص
   */
  createNotification(title, message, buttons = [], type = 'info') {
    const notification = document.createElement('div');
    notification.className = `sw-notification sw-notification-${type}`;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: white;
      border-radius: 10px;
      padding: 20px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      max-width: 400px;
      z-index: 10000;
      border-left: 4px solid ${this.getNotificationColor(type)};
      animation: slideIn 0.3s ease-out;
    `;

    notification.innerHTML = `
      <div class="sw-notification-header">
        <h6 style="margin: 0 0 10px 0; color: #333;">${title}</h6>
        <button class="sw-notification-close" style="position: absolute; top: 10px; left: 10px; background: none; border: none; font-size: 18px; cursor: pointer;">&times;</button>
      </div>
      <div class="sw-notification-body">
        <p style="margin: 0 0 15px 0; color: #666; line-height: 1.4;">${message}</p>
        <div class="sw-notification-buttons">
          ${buttons.map(btn => `
            <button class="btn ${btn.primary ? 'btn-primary' : 'btn-secondary'} btn-sm" data-action="${buttons.indexOf(btn)}" style="margin-left: 10px;">
              ${btn.text}
            </button>
          `).join('')}
        </div>
      </div>
    `;

    // إضافة معالجات الأحداث
    notification.querySelector('.sw-notification-close').addEventListener('click', () => {
      notification.remove();
    });

    buttons.forEach((btn, index) => {
      const buttonEl = notification.querySelector(`[data-action="${index}"]`);
      if (buttonEl) {
        buttonEl.addEventListener('click', btn.action);
      }
    });

    // إضافة الإشعار للصفحة
    document.body.appendChild(notification);

    // إزالة تلقائية بعد 10 ثوانٍ (إلا إذا كان تحديث)
    if (type !== 'update') {
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 10000);
    }

    return notification;
  }

  /**
   * الحصول على لون الإشعار
   */
  getNotificationColor(type) {
    const colors = {
      info: '#007bff',
      success: '#28a745',
      warning: '#ffc107',
      error: '#dc3545',
      update: '#17a2b8'
    };
    return colors[type] || colors.info;
  }

  /**
   * نظام الأحداث البسيط
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * الحصول على حالة Service Worker
   */
  getStatus() {
    return {
      isSupported: this.isSupported,
      isRegistered: !!this.registration,
      isOnline: this.isOnline,
      updateAvailable: this.updateAvailable,
      controller: !!navigator.serviceWorker.controller
    };
  }

  /**
   * تشخيص مشاكل Service Worker
   */
  async diagnose() {
    const diagnosis = {
      timestamp: new Date().toISOString(),
      browser: navigator.userAgent,
      support: this.isSupported,
      registration: !!this.registration,
      controller: !!navigator.serviceWorker.controller,
      online: this.isOnline,
      caches: {}
    };

    if (this.isSupported) {
      try {
        // فحص الكاش
        const cacheNames = await caches.keys();
        for (const cacheName of cacheNames) {
          const cache = await caches.open(cacheName);
          const keys = await cache.keys();
          diagnosis.caches[cacheName] = keys.length;
        }
      } catch (error) {
        diagnosis.cacheError = error.message;
      }
    }

    console.log('🔍 Service Worker Diagnosis:', diagnosis);
    return diagnosis;
  }
}

// إنشاء مدير عام
const swManager = new ServiceWorkerManager();

/**
 * دوال مساعدة للاستخدام في التطبيق
 */

// تسجيل Service Worker عند تحميل الصفحة
async function initializeServiceWorker() {
  if (swManager.isSupported) {
    const success = await swManager.register();
    
    if (success) {
      console.log('✅ Service Worker initialized successfully');
      
      // إعداد معالجات الأحداث
      swManager.on('updateAvailable', () => {
        console.log('🆕 Service Worker update available');
      });
      
      swManager.on('offline', () => {
        console.log('🔌 App is now offline');
        // يمكن إضافة منطق خاص بالوضع غير المتصل
      });
      
      swManager.on('online', () => {
        console.log('🌐 App is back online');
        // يمكن إضافة منطق خاص بالعودة للاتصال
      });
      
    } else {
      console.warn('❌ Failed to initialize Service Worker');
    }
  }
}

// عرض إحصائيات الكاش
async function showCacheStats() {
  try {
    const stats = await swManager.getCacheStats();
    
    let totalEntries = 0;
    let report = '📊 إحصائيات التخزين المؤقت:\n\n';
    
    Object.entries(stats).forEach(([cacheName, cacheData]) => {
      totalEntries += cacheData.count;
      report += `${cacheName}: ${cacheData.count} عنصر\n`;
    });
    
    report += `\n📈 إجمالي العناصر المحفوظة: ${totalEntries}`;
    
    alert(report);
    console.log('📊 Cache Stats:', stats);
    
  } catch (error) {
    console.error('❌ Failed to get cache stats:', error);
    alert('فشل في الحصول على إحصائيات التخزين المؤقت');
  }
}

// مسح الكاش
async function clearAppCache() {
  if (confirm('هل أنت متأكد من مسح جميع البيانات المحفوظة؟ سيؤدي هذا إلى إبطاء التطبيق مؤقتاً.')) {
    try {
      await swManager.clearCache();
      
      if (typeof showNotification === 'function') {
        showNotification('🗑️ تم مسح التخزين المؤقت بنجاح', 'success');
      }
      
      console.log('🗑️ Cache cleared successfully');
      
    } catch (error) {
      console.error('❌ Failed to clear cache:', error);
      
      if (typeof showNotification === 'function') {
        showNotification('فشل في مسح التخزين المؤقت', 'error');
      }
    }
  }
}

// تحميل مسبق للموارد المهمة
function prefetchImportantResources() {
  const importantUrls = [
    './js/packages.js',
    './js/sales.js',
    './js/expenses.js',
    './js/inventory.js',
    './js/reports.js'
  ];
  
  swManager.prefetchResources(importantUrls);
  console.log('📥 Started prefetching important resources');
}

// فحص حالة الاتصال
function checkConnectionStatus() {
  const status = swManager.getStatus();
  
  const statusText = `
    🔍 حالة التطبيق:
    
    📱 دعم Service Worker: ${status.isSupported ? 'نعم' : 'لا'}
    📋 مسجل: ${status.isRegistered ? 'نعم' : 'لا'}
    🎮 نشط: ${status.controller ? 'نعم' : 'لا'}
    🌐 متصل: ${status.isOnline ? 'نعم' : 'لا'}
    🆕 تحديث متاح: ${status.updateAvailable ? 'نعم' : 'لا'}
  `;
  
  alert(statusText);
  console.log('🔍 Connection Status:', status);
}

// تشخيص شامل
async function runDiagnostics() {
  const diagnosis = await swManager.diagnose();
  
  console.log('🔍 Full Diagnostics:', diagnosis);
  
  // يمكن عرض التشخيص في واجهة المستخدم
  const report = `
    🔍 تقرير التشخيص:
    
    المتصفح: ${diagnosis.browser.split(' ')[0]}
    دعم Service Worker: ${diagnosis.support ? 'نعم' : 'لا'}
    مسجل: ${diagnosis.registration ? 'نعم' : 'لا'}
    نشط: ${diagnosis.controller ? 'نعم' : 'لا'}
    متصل: ${diagnosis.online ? 'نعم' : 'لا'}
    
    الكاش المحفوظ:
    ${Object.entries(diagnosis.caches).map(([name, count]) => 
      `${name}: ${count} عنصر`
    ).join('\n')}
  `;
  
  alert(report);
}

// تصدير للاستخدام العام
if (typeof window !== 'undefined') {
  window.swManager = swManager;
  window.initializeServiceWorker = initializeServiceWorker;
  window.showCacheStats = showCacheStats;
  window.clearAppCache = clearAppCache;
  window.checkConnectionStatus = checkConnectionStatus;
  window.runDiagnostics = runDiagnostics;
  
  // تهيئة تلقائية
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeServiceWorker);
  } else {
    initializeServiceWorker();
  }
}

// إضافة أنماط CSS للإشعارات
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  .sw-notification {
    font-family: 'Tajawal', sans-serif;
    direction: rtl;
    text-align: right;
  }
  
  .sw-notification-close {
    color: #999;
    transition: color 0.2s;
  }
  
  .sw-notification-close:hover {
    color: #333;
  }
`;
document.head.appendChild(style);