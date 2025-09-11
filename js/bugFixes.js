/**
 * إصلاحات الأخطاء الحرجة المحددة في التطبيق
 * يحل المشاكل الأساسية التي تؤثر على الوظائف الأساسية
 */

/**
 * 1. إصلاح المتغيرات غير المعرفة
 */

// إصلاح متغير today المفقود
if (typeof today === 'undefined') {
  var today = new Date().toISOString().split('T')[0];
}

// إصلاح window.$dom و window.$safe المفقودين
if (typeof window.$dom === 'undefined') {
  window.$dom = {
    table: function(data, options) {
      console.warn('$dom.table fallback used - consider implementing virtual scrolling');
      // Fallback بسيط
      const container = document.getElementById(options.containerId);
      if (container) {
        container.innerHTML = `<p>عرض ${data.length} عنصر (استخدام fallback)</p>`;
      }
    }
  };
}

if (typeof window.$safe === 'undefined') {
  window.$safe = {
    clear: function(element) {
      if (element) {
        element.innerHTML = '';
      }
    },
    row: function(data, buttons) {
      const row = document.createElement('tr');
      
      // إضافة الخلايا
      data.forEach(cellData => {
        const cell = document.createElement('td');
        if (typeof cellData === 'object' && cellData.text) {
          cell.textContent = cellData.text;
          if (cellData.className) {
            cell.className = cellData.className;
          }
        } else {
          cell.textContent = cellData;
        }
        row.appendChild(cell);
      });
      
      // إضافة أزرار العمليات
      if (buttons && buttons.length > 0) {
        const actionsCell = document.createElement('td');
        actionsCell.className = 'action-buttons';
        
        buttons.forEach(btn => {
          const button = document.createElement('button');
          button.className = btn.className || 'btn btn-sm btn-secondary';
          button.innerHTML = btn.icon ? `<i class="${btn.icon}"></i>` : btn.text || 'عملية';
          
          if (btn.dataId) {
            button.setAttribute('data-id', btn.dataId);
          }
          
          if (btn.onClick) {
            button.addEventListener('click', btn.onClick);
          }
          
          actionsCell.appendChild(button);
        });
        
        row.appendChild(actionsCell);
      }
      
      return row;
    }
  };
}

/**
 * 2. إصلاح دالة cleanupModalBackdrops المفقودة
 */
if (typeof cleanupModalBackdrops === 'undefined') {
  window.cleanupModalBackdrops = function() {
    // إزالة خلفيات النوافذ المنبثقة العالقة
    const backdrops = document.querySelectorAll('.modal-backdrop');
    backdrops.forEach(backdrop => {
      backdrop.remove();
    });
    
    // إزالة فئة modal-open من body
    document.body.classList.remove('modal-open');
    
    // إعادة تعيين padding-right
    document.body.style.paddingRight = '';
    
    console.log('تم تنظيف خلفيات النوافذ المنبثقة');
  };
}

/**
 * 3. إصلاح دوال التاريخ المفقودة
 */
if (typeof getTodayDate === 'undefined') {
  window.getTodayDate = function() {
    return new Date().toISOString().split('T')[0];
  };
}

if (typeof formatDateEn === 'undefined') {
  window.formatDateEn = function(dateString) {
    if (!dateString) return getTodayDate();
    
    // إذا كان التاريخ بصيغة YYYY-MM-DD، إرجاعه كما هو
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    
    // محاولة تحويل تاريخ آخر
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
    
    // إرجاع تاريخ اليوم كـ fallback
    return getTodayDate();
  };
}

/**
 * 4. إصلاح دوال التنسيق المفقودة
 */
if (typeof formatNumber === 'undefined') {
  window.formatNumber = function(number) {
    if (isNaN(number) || number === null || number === undefined) {
      return '0';
    }
    
    return new Intl.NumberFormat('ar-SA', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(number);
  };
}

if (typeof parseFormattedNumber === 'undefined') {
  window.parseFormattedNumber = function(formattedString) {
    if (!formattedString) return 0;
    
    // إزالة الفواصل والمسافات
    const cleaned = formattedString.toString()
      .replace(/[,\s]/g, '')
      .replace(/[^\d.-]/g, '');
    
    const number = parseFloat(cleaned);
    return isNaN(number) ? 0 : number;
  };
}

/**
 * 5. إصلاح دوال الإشعارات
 */
if (typeof showNotification === 'undefined') {
  window.showNotification = function(message, type = 'info', duration = 5000) {
    // إنشاء عنصر الإشعار
    const notification = document.createElement('div');
    notification.className = `alert alert-${getBootstrapAlertType(type)} alert-dismissible fade show notification-toast`;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      min-width: 300px;
      max-width: 500px;
      animation: slideInRight 0.3s ease-out;
    `;
    
    notification.innerHTML = `
      <strong>${getNotificationIcon(type)}</strong> ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // إضافة للصفحة
    document.body.appendChild(notification);
    
    // إزالة تلقائية
    setTimeout(() => {
      if (notification.parentNode) {
        notification.classList.remove('show');
        setTimeout(() => {
          if (notification.parentNode) {
            notification.remove();
          }
        }, 300);
      }
    }, duration);
    
    console.log(`إشعار: ${message}`);
  };
  
  function getBootstrapAlertType(type) {
    const types = {
      'success': 'success',
      'error': 'danger',
      'warning': 'warning',
      'info': 'info'
    };
    return types[type] || 'info';
  }
  
  function getNotificationIcon(type) {
    const icons = {
      'success': '✅',
      'error': '❌',
      'warning': '⚠️',
      'info': 'ℹ️'
    };
    return icons[type] || 'ℹ️';
  }
}

/**
 * 6. إصلاح دوال التحديث المفقودة
 */
if (typeof refreshCurrentView === 'undefined') {
  window.refreshCurrentView = function() {
    // تحديث العروض الأساسية
    if (typeof renderStoresList === 'function') {
      renderStoresList();
    }
    
    if (typeof updateDashboard === 'function') {
      updateDashboard();
    }
    
    // تحديث Virtual Tables إذا كانت متاحة
    if (window.packagesVirtualTable && data.packages) {
      window.packagesVirtualTable.updateData(data.packages);
    } else if (typeof renderPackagesTable === 'function') {
      renderPackagesTable();
    }
    
    if (window.inventoryVirtualTable && data.inventory) {
      window.inventoryVirtualTable.updateData(data.inventory);
    } else if (typeof renderInventoryTable === 'function') {
      renderInventoryTable();
    }
    
    if (window.expensesVirtualTable && data.expenses) {
      window.expensesVirtualTable.updateData(data.expenses);
    } else if (typeof renderExpensesTable === 'function') {
      renderExpensesTable();
    }
    
    console.log('تم تحديث العروض الحالية (مع Virtual Scrolling)');
  };
}

/**
 * 7. إصلاح دوال المخزون المفقودة
 */
if (typeof checkLowStockForPackage === 'undefined') {
  window.checkLowStockForPackage = function(packageId) {
    if (typeof getTotalInventoryForPackage === 'function') {
      const totalStock = getTotalInventoryForPackage(packageId);
      const lowStockThreshold = 200; // العتبة الافتراضية
      
      if (totalStock <= lowStockThreshold) {
        const pkg = data.packages?.find(p => p.id === packageId);
        const packageName = pkg ? pkg.name : 'غير معروف';
        
        showNotification(
          `تحذير: مخزون الباقة "${packageName}" منخفض (${formatNumber(totalStock)} كرت متبقي)`,
          'warning',
          8000
        );
      }
    }
  };
}

if (typeof getTotalInventoryForPackage === 'undefined') {
  window.getTotalInventoryForPackage = function(packageId) {
    if (!data.inventory) return 0;
    
    return data.inventory
      .filter(item => item.packageId === packageId)
      .reduce((sum, item) => sum + (item.quantity || 0), 0);
  };
}

if (typeof deductFromInventory === 'undefined') {
  window.deductFromInventory = function(packageId, quantity) {
    if (!data.inventory) return false;
    
    const totalAvailable = getTotalInventoryForPackage(packageId);
    if (totalAvailable < quantity) return false;
    
    let remaining = quantity;
    for (const item of data.inventory) {
      if (item.packageId !== packageId) continue;
      const available = item.quantity || 0;
      if (available <= 0) continue;
      
      const toDeduct = Math.min(available, remaining);
      item.quantity = available - toDeduct;
      remaining -= toDeduct;
      
      if (remaining === 0) break;
    }
    
    return true;
  };
}

if (typeof addToInventory === 'undefined') {
  window.addToInventory = function(packageId, quantity) {
    if (!data.inventory) data.inventory = [];
    
    const existing = data.inventory.find(i => i.packageId === packageId);
    if (existing) {
      existing.quantity = (existing.quantity || 0) + quantity;
    } else {
      data.inventory.push({
        id: 'inv_' + Date.now(),
        packageId,
        quantity,
        createdAt: getTodayDate()
      });
    }
  };
}

/**
 * 8. إصلاح دوال التقارير المفقودة
 */
if (typeof updateDashboard === 'undefined') {
  window.updateDashboard = function() {
    // تحديث الإحصائيات الأساسية
    try {
      const packagesCount = data.packages ? data.packages.length : 0;
      const storesCount = data.stores ? data.stores.length : 0;
      const totalCards = data.inventory ? 
        data.inventory.reduce((sum, item) => sum + (item.quantity || 0), 0) : 0;
      
      // تحديث العناصر إذا كانت موجودة
      const packagesEl = document.getElementById('packagesCount');
      if (packagesEl) packagesEl.textContent = packagesCount;
      
      const storesEl = document.getElementById('storesCount');
      if (storesEl) storesEl.textContent = storesCount;
      
      const cardsEl = document.getElementById('totalCards');
      if (cardsEl) cardsEl.textContent = formatNumber(totalCards);
      
      console.log('تم تحديث لوحة التحكم');
    } catch (error) {
      console.error('خطأ في تحديث لوحة التحكم:', error);
    }
  };
}

/**
 * 9. إصلاح دوال البيانات الأساسية
 */
if (typeof saveData === 'undefined') {
  window.saveData = function() {
    try {
      localStorage.setItem('networkCardsData', JSON.stringify(data));
      console.log('تم حفظ البيانات');
    } catch (error) {
      console.error('خطأ في حفظ البيانات:', error);
      showNotification('فشل في حفظ البيانات', 'error');
    }
  };
}

if (typeof loadData === 'undefined') {
  window.loadData = function() {
    try {
      const saved = localStorage.getItem('networkCardsData');
      if (saved) {
        const parsed = JSON.parse(saved);
        window.data = Object.assign({
          packages: [],
          stores: [],
          sales: [],
          payments: [],
          expenses: [],
          inventory: []
        }, parsed);
        
        console.log('تم تحميل البيانات');
        return true;
      }
    } catch (error) {
      console.error('خطأ في تحميل البيانات:', error);
    }
    
    // إنشاء بيانات افتراضية
    window.data = {
      packages: [],
      stores: [],
      sales: [],
      payments: [],
      expenses: [],
      inventory: []
    };
    
    return false;
  };
}

/**
 * 10. إصلاح دوال العرض المفقودة
 */
if (typeof showStoreDetails === 'undefined') {
  window.showStoreDetails = function(storeId) {
    console.log(`عرض تفاصيل المحل: ${storeId}`);
    // يمكن إضافة منطق عرض التفاصيل هنا
  };
}

/**
 * 11. إضافة أنماط CSS للإشعارات
 */
const bugFixStyles = document.createElement('style');
bugFixStyles.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  .notification-toast {
    font-family: 'Tajawal', sans-serif;
    direction: rtl;
    text-align: right;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }
  
  .notification-toast .btn-close {
    margin-left: 0;
    margin-right: auto;
  }
`;

// إضافة الأنماط إلى الصفحة
if (!document.getElementById('bugFixStyles')) {
  bugFixStyles.id = 'bugFixStyles';
  document.head.appendChild(bugFixStyles);
}

/**
 * 12. تهيئة البيانات عند التحميل
 */
document.addEventListener('DOMContentLoaded', function() {
  // تحميل البيانات إذا لم تكن محملة
  if (typeof window.data === 'undefined') {
    loadData();
  }
  
  // تهيئة نظام الكاش إذا كان متاحاً
  if (typeof window.balanceCache !== 'undefined' && window.data) {
    console.log('تهيئة نظام الكاش...');
  }
  
  console.log('✅ تم تطبيق جميع إصلاحات الأخطاء الحرجة');
});

/**
 * 13. معالجة الأخطاء العامة
 */
window.addEventListener('error', function(event) {
  console.error('خطأ JavaScript:', event.error);
  
  // عرض إشعار للمستخدم في الأخطاء الحرجة
  if (event.error && event.error.stack) {
    showNotification('حدث خطأ في التطبيق. يرجى إعادة تحميل الصفحة.', 'error');
  }
});

/**
 * 14. معالجة الوعود المرفوضة
 */
window.addEventListener('unhandledrejection', function(event) {
  console.error('Promise rejected:', event.reason);
  event.preventDefault(); // منع عرض الخطأ في وحدة التحكم
});

console.log('🔧 Bug Fixes Module loaded successfully');