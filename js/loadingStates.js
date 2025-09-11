/**
 * مدير حالات التحميل المتقدم
 * يوفر مؤشرات تحميل جميلة ومتنوعة للعمليات المختلفة
 */

class LoadingStatesManager {
  constructor() {
    this.activeLoadings = new Map();
    this.loadingCounter = 0;
    this.globalLoading = false;
    
    this.loadingTypes = {
      spinner: 'دوار',
      dots: 'نقاط',
      bars: 'أشرطة',
      pulse: 'نبضة',
      skeleton: 'هيكل',
      progress: 'شريط تقدم'
    };
    
    this.init();
  }

  /**
   * تهيئة مدير حالات التحميل
   */
  init() {
    this.injectLoadingStyles();
    this.setupGlobalLoadingIndicator();
    
    console.log('⏳ Loading States Manager initialized');
  }

  /**
   * إضافة أنماط التحميل
   */
  injectLoadingStyles() {
    const style = document.createElement('style');
    style.id = 'loading-states-styles';
    style.textContent = `
      /* ===== مؤشرات التحميل الأساسية ===== */
      
      /* الدوار الكلاسيكي */
      .loading-spinner {
        width: 40px;
        height: 40px;
        border: 4px solid rgba(0, 0, 0, 0.1);
        border-top: 4px solid var(--md-primary, #007bff);
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
      
      .loading-spinner.size-sm {
        width: 20px;
        height: 20px;
        border-width: 2px;
      }
      
      .loading-spinner.size-lg {
        width: 60px;
        height: 60px;
        border-width: 6px;
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      /* النقاط المتحركة */
      .loading-dots {
        display: inline-flex;
        gap: 4px;
        align-items: center;
      }
      
      .loading-dots .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: var(--md-primary, #007bff);
        animation: bounce-dots 1.4s infinite ease-in-out both;
      }
      
      .loading-dots .dot:nth-child(1) { animation-delay: -0.32s; }
      .loading-dots .dot:nth-child(2) { animation-delay: -0.16s; }
      .loading-dots .dot:nth-child(3) { animation-delay: 0s; }
      
      @keyframes bounce-dots {
        0%, 80%, 100% {
          transform: scale(0);
          opacity: 0.5;
        }
        40% {
          transform: scale(1);
          opacity: 1;
        }
      }
      
      /* الأشرطة المتحركة */
      .loading-bars {
        display: inline-flex;
        gap: 2px;
        align-items: end;
        height: 20px;
      }
      
      .loading-bars .bar {
        width: 3px;
        background-color: var(--md-primary, #007bff);
        animation: stretch 1.2s infinite ease-in-out;
      }
      
      .loading-bars .bar:nth-child(1) { animation-delay: -1.2s; }
      .loading-bars .bar:nth-child(2) { animation-delay: -1.1s; }
      .loading-bars .bar:nth-child(3) { animation-delay: -1.0s; }
      .loading-bars .bar:nth-child(4) { animation-delay: -0.9s; }
      .loading-bars .bar:nth-child(5) { animation-delay: -0.8s; }
      
      @keyframes stretch {
        0%, 40%, 100% {
          height: 4px;
        }
        20% {
          height: 20px;
        }
      }
      
      /* النبضة */
      .loading-pulse {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background-color: var(--md-primary, #007bff);
        animation: pulse-scale 1.5s infinite;
      }
      
      @keyframes pulse-scale {
        0% {
          transform: scale(0);
          opacity: 1;
        }
        100% {
          transform: scale(1);
          opacity: 0;
        }
      }
      
      /* التحميل الهيكلي (Skeleton) */
      .loading-skeleton {
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: skeleton-loading 1.5s infinite;
        border-radius: 4px;
      }
      
      @keyframes skeleton-loading {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
      
      .skeleton-text {
        height: 16px;
        margin-bottom: 8px;
      }
      
      .skeleton-text.title {
        height: 24px;
        width: 60%;
      }
      
      .skeleton-text.subtitle {
        height: 16px;
        width: 80%;
      }
      
      .skeleton-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
      }
      
      .skeleton-button {
        height: 36px;
        width: 100px;
        border-radius: 4px;
      }
      
      /* ===== حاويات التحميل ===== */
      .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: var(--md-spacing-xl);
        text-align: center;
        background: var(--md-surface);
        border-radius: var(--md-shape-corner-sm);
        min-height: 200px;
      }
      
      .loading-message {
        margin-top: var(--md-spacing-md);
        color: var(--md-on-surface);
        font-size: var(--md-text-body2);
        opacity: 0.7;
      }
      
      .loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        backdrop-filter: blur(2px);
      }
      
      .loading-overlay .loading-content {
        background: var(--md-surface);
        padding: var(--md-spacing-xl);
        border-radius: var(--md-shape-corner-md);
        box-shadow: var(--md-elevation-5);
        text-align: center;
        min-width: 200px;
      }
      
      /* ===== شريط التقدم المتقدم ===== */
      .progress-advanced {
        background: rgba(0, 0, 0, 0.1);
        border-radius: 10px;
        height: 20px;
        overflow: hidden;
        position: relative;
        margin: var(--md-spacing-md) 0;
      }
      
      .progress-advanced .progress-bar {
        height: 100%;
        background: linear-gradient(45deg, var(--md-primary), var(--md-secondary));
        border-radius: 10px;
        transition: width 0.3s ease;
        position: relative;
        overflow: hidden;
      }
      
      .progress-advanced .progress-bar::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(45deg, transparent, rgba(255,255,255,0.2), transparent);
        animation: progress-shine 2s infinite;
      }
      
      @keyframes progress-shine {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
      
      .progress-text {
        text-align: center;
        margin-top: var(--md-spacing-sm);
        font-size: var(--md-text-caption);
        color: var(--md-on-surface);
        opacity: 0.7;
      }
      
      /* ===== حالات التحميل للأزرار ===== */
      .btn-loading {
        position: relative;
        pointer-events: none;
        opacity: 0.7;
      }
      
      .btn-loading::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 16px;
        height: 16px;
        margin: -8px 0 0 -8px;
        border: 2px solid transparent;
        border-top: 2px solid currentColor;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
      
      .btn-loading .btn-text {
        opacity: 0;
      }
      
      /* ===== تحسينات الوضع المظلم ===== */
      .dark-theme .loading-skeleton {
        background: linear-gradient(90deg, #2a2a2a 25%, #3a3a3a 50%, #2a2a2a 75%);
        background-size: 200% 100%;
      }
      
      .dark-theme .progress-advanced {
        background: rgba(255, 255, 255, 0.1);
      }
      
      .dark-theme .loading-overlay {
        background: rgba(0, 0, 0, 0.7);
      }
      
      /* ===== تحسينات إمكانية الوصول ===== */
      @media (prefers-reduced-motion: reduce) {
        .loading-spinner,
        .loading-dots .dot,
        .loading-bars .bar,
        .loading-pulse,
        .loading-skeleton,
        .progress-advanced .progress-bar::before {
          animation: none !important;
        }
        
        .loading-spinner::after {
          content: '⏳';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 20px;
        }
      }
      
      /* تحسينات للطباعة */
      @media print {
        .loading-container,
        .loading-overlay,
        .loading-spinner,
        .loading-dots,
        .loading-bars,
        .loading-pulse {
          display: none !important;
        }
      }
    `;
    
    document.head.appendChild(style);
  }

  /**
   * إعداد مؤشر التحميل العام
   */
  setupGlobalLoadingIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'globalLoadingIndicator';
    indicator.className = 'loading-overlay';
    indicator.style.display = 'none';
    
    indicator.innerHTML = `
      <div class="loading-content">
        <div class="loading-spinner size-lg"></div>
        <div class="loading-message">جاري التحميل...</div>
      </div>
    `;
    
    document.body.appendChild(indicator);
    this.globalIndicator = indicator;
  }

  /**
   * إظهار تحميل عام
   */
  showGlobalLoading(message = 'جاري التحميل...') {
    this.globalLoading = true;
    
    const messageEl = this.globalIndicator.querySelector('.loading-message');
    messageEl.textContent = message;
    
    this.globalIndicator.style.display = 'flex';
    
    if (typeof window.animate === 'function') {
      window.animate(this.globalIndicator, 'fade-in');
    }
    
    console.log('⏳ Global loading started:', message);
  }

  /**
   * إخفاء التحميل العام
   */
  hideGlobalLoading() {
    this.globalLoading = false;
    
    if (typeof window.animate === 'function') {
      window.animate(this.globalIndicator, 'fade-out').then(() => {
        this.globalIndicator.style.display = 'none';
      });
    } else {
      this.globalIndicator.style.display = 'none';
    }
    
    console.log('✅ Global loading ended');
  }

  /**
   * إظهار تحميل في حاوي محدد
   */
  showLoading(containerId, options = {}) {
    const {
      type = 'spinner',
      message = 'جاري التحميل...',
      size = 'md',
      overlay = false,
      progress = null
    } = options;
    
    const container = typeof containerId === 'string' ? 
      document.getElementById(containerId) : containerId;
    
    if (!container) {
      console.error('❌ Loading container not found:', containerId);
      return null;
    }
    
    const loadingId = ++this.loadingCounter;
    
    // إنشاء عنصر التحميل
    const loadingElement = this.createLoadingElement(type, message, size, progress);
    loadingElement.setAttribute('data-loading-id', loadingId);
    
    if (overlay) {
      // إنشاء overlay
      const overlayElement = document.createElement('div');
      overlayElement.className = 'loading-local-overlay';
      overlayElement.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(255, 255, 255, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 100;
        border-radius: inherit;
      `;
      
      overlayElement.appendChild(loadingElement);
      
      // التأكد من أن الحاوي له position relative
      const computedStyle = window.getComputedStyle(container);
      if (computedStyle.position === 'static') {
        container.style.position = 'relative';
      }
      
      container.appendChild(overlayElement);
      
      this.activeLoadings.set(loadingId, {
        container,
        element: overlayElement,
        type: 'overlay',
        startTime: Date.now()
      });
    } else {
      // استبدال المحتوى
      const originalContent = container.innerHTML;
      container.innerHTML = '';
      container.appendChild(loadingElement);
      
      this.activeLoadings.set(loadingId, {
        container,
        element: loadingElement,
        originalContent,
        type: 'replace',
        startTime: Date.now()
      });
    }
    
    // تأثير الظهور
    if (typeof window.animate === 'function') {
      window.animate(loadingElement, 'fade-in');
    }
    
    console.log(`⏳ Loading started: ${loadingId} (${type})`);
    return loadingId;
  }

  /**
   * إخفاء التحميل
   */
  hideLoading(loadingId) {
    if (!this.activeLoadings.has(loadingId)) {
      console.warn('⚠️ Loading not found:', loadingId);
      return;
    }
    
    const loadingInfo = this.activeLoadings.get(loadingId);
    const duration = Date.now() - loadingInfo.startTime;
    
    if (typeof window.animate === 'function') {
      window.animate(loadingInfo.element, 'fade-out').then(() => {
        this.removeLoadingElement(loadingId, loadingInfo);
      });
    } else {
      this.removeLoadingElement(loadingId, loadingInfo);
    }
    
    console.log(`✅ Loading ended: ${loadingId} (${duration}ms)`);
  }

  /**
   * إزالة عنصر التحميل
   */
  removeLoadingElement(loadingId, loadingInfo) {
    if (loadingInfo.type === 'overlay') {
      loadingInfo.element.remove();
    } else if (loadingInfo.type === 'replace' && loadingInfo.originalContent) {
      loadingInfo.container.innerHTML = loadingInfo.originalContent;
    }
    
    this.activeLoadings.delete(loadingId);
  }

  /**
   * إنشاء عنصر التحميل
   */
  createLoadingElement(type, message, size, progress) {
    const container = document.createElement('div');
    container.className = 'loading-container';
    
    let loadingHTML = '';
    
    switch (type) {
      case 'spinner':
        loadingHTML = `<div class="loading-spinner ${size !== 'md' ? 'size-' + size : ''}"></div>`;
        break;
        
      case 'dots':
        loadingHTML = `
          <div class="loading-dots">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
          </div>
        `;
        break;
        
      case 'bars':
        loadingHTML = `
          <div class="loading-bars">
            <div class="bar"></div>
            <div class="bar"></div>
            <div class="bar"></div>
            <div class="bar"></div>
            <div class="bar"></div>
          </div>
        `;
        break;
        
      case 'pulse':
        loadingHTML = `<div class="loading-pulse"></div>`;
        break;
        
      case 'skeleton':
        loadingHTML = this.createSkeletonHTML();
        break;
        
      case 'progress':
        loadingHTML = `
          <div class="progress-advanced" style="width: 300px;">
            <div class="progress-bar" style="width: ${progress || 0}%"></div>
          </div>
        `;
        break;
        
      default:
        loadingHTML = `<div class="loading-spinner"></div>`;
    }
    
    container.innerHTML = `
      ${loadingHTML}
      ${message ? `<div class="loading-message">${message}</div>` : ''}
    `;
    
    return container;
  }

  /**
   * إنشاء HTML للتحميل الهيكلي
   */
  createSkeletonHTML() {
    return `
      <div class="skeleton-content" style="width: 100%; max-width: 400px;">
        <div class="loading-skeleton skeleton-text title"></div>
        <div class="loading-skeleton skeleton-text subtitle"></div>
        <div class="loading-skeleton skeleton-text" style="width: 90%;"></div>
        <div class="loading-skeleton skeleton-text" style="width: 70%;"></div>
        <div style="display: flex; gap: 12px; margin-top: 16px;">
          <div class="loading-skeleton skeleton-avatar"></div>
          <div style="flex: 1;">
            <div class="loading-skeleton skeleton-text" style="width: 60%;"></div>
            <div class="loading-skeleton skeleton-text" style="width: 40%;"></div>
          </div>
        </div>
        <div style="display: flex; gap: 8px; margin-top: 16px;">
          <div class="loading-skeleton skeleton-button"></div>
          <div class="loading-skeleton skeleton-button"></div>
        </div>
      </div>
    `;
  }

  /**
   * تحديث شريط التقدم
   */
  updateProgress(loadingId, progress, message = null) {
    if (!this.activeLoadings.has(loadingId)) return;
    
    const loadingInfo = this.activeLoadings.get(loadingId);
    const progressBar = loadingInfo.element.querySelector('.progress-bar');
    const messageEl = loadingInfo.element.querySelector('.loading-message');
    
    if (progressBar) {
      progressBar.style.width = `${progress}%`;
    }
    
    if (message && messageEl) {
      messageEl.textContent = message;
    }
  }

  /**
   * إظهار تحميل للزر
   */
  showButtonLoading(button, loadingText = null) {
    if (button.classList.contains('btn-loading')) return;
    
    // حفظ النص الأصلي
    const originalText = button.innerHTML;
    button.setAttribute('data-original-text', originalText);
    
    // إضافة حالة التحميل
    button.classList.add('btn-loading');
    button.disabled = true;
    
    if (loadingText) {
      button.innerHTML = `
        <span class="btn-text" style="opacity: 0;">${originalText}</span>
        <span style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">${loadingText}</span>
      `;
    }
    
    console.log('⏳ Button loading started:', button);
  }

  /**
   * إخفاء تحميل الزر
   */
  hideButtonLoading(button) {
    if (!button.classList.contains('btn-loading')) return;
    
    const originalText = button.getAttribute('data-original-text');
    
    button.classList.remove('btn-loading');
    button.disabled = false;
    
    if (originalText) {
      button.innerHTML = originalText;
      button.removeAttribute('data-original-text');
    }
    
    console.log('✅ Button loading ended:', button);
  }

  /**
   * إنشاء تحميل للجدول
   */
  showTableLoading(table, rowCount = 5) {
    const tbody = table.querySelector('tbody');
    const thead = table.querySelector('thead');
    
    if (!tbody || !thead) return;
    
    const columnCount = thead.querySelectorAll('th').length;
    let skeletonRows = '';
    
    for (let i = 0; i < rowCount; i++) {
      skeletonRows += '<tr>';
      for (let j = 0; j < columnCount; j++) {
        skeletonRows += `<td><div class="loading-skeleton skeleton-text"></div></td>`;
      }
      skeletonRows += '</tr>';
    }
    
    tbody.innerHTML = skeletonRows;
    
    console.log(`⏳ Table skeleton loading for ${rowCount} rows`);
  }

  /**
   * إظهار تحميل للكرت
   */
  showCardLoading(card) {
    const cardBody = card.querySelector('.card-body, .card-material-content');
    
    if (cardBody) {
      cardBody.innerHTML = this.createSkeletonHTML();
      console.log('⏳ Card skeleton loading started');
    }
  }

  /**
   * تحميل مع مؤقت تلقائي
   */
  showTimedLoading(containerId, duration, options = {}) {
    const loadingId = this.showLoading(containerId, options);
    
    setTimeout(() => {
      this.hideLoading(loadingId);
    }, duration);
    
    return loadingId;
  }

  /**
   * تحميل مع وعد (Promise)
   */
  async showLoadingForPromise(containerId, promise, options = {}) {
    const loadingId = this.showLoading(containerId, options);
    
    try {
      const result = await promise;
      this.hideLoading(loadingId);
      return result;
    } catch (error) {
      this.hideLoading(loadingId);
      throw error;
    }
  }

  /**
   * الحصول على إحصائيات التحميل
   */
  getLoadingStats() {
    return {
      activeLoadings: this.activeLoadings.size,
      globalLoading: this.globalLoading,
      loadingTypes: Object.keys(this.loadingTypes),
      totalLoadingsCreated: this.loadingCounter
    };
  }

  /**
   * إخفاء جميع حالات التحميل
   */
  hideAllLoadings() {
    const activeIds = Array.from(this.activeLoadings.keys());
    activeIds.forEach(id => this.hideLoading(id));
    
    if (this.globalLoading) {
      this.hideGlobalLoading();
    }
    
    console.log(`🧹 All loadings cleared (${activeIds.length} items)`);
  }
}

// إنشاء مدير حالات التحميل العام
const loadingManager = new LoadingStatesManager();

// دوال مساعدة للاستخدام العام
window.showGlobalLoading = (message) => loadingManager.showGlobalLoading(message);
window.hideGlobalLoading = () => loadingManager.hideGlobalLoading();
window.showLoading = (containerId, options) => loadingManager.showLoading(containerId, options);
window.hideLoading = (loadingId) => loadingManager.hideLoading(loadingId);
window.updateProgress = (loadingId, progress, message) => loadingManager.updateProgress(loadingId, progress, message);
window.showButtonLoading = (button, text) => loadingManager.showButtonLoading(button, text);
window.hideButtonLoading = (button) => loadingManager.hideButtonLoading(button);
window.showTableLoading = (table, rowCount) => loadingManager.showTableLoading(table, rowCount);
window.showCardLoading = (card) => loadingManager.showCardLoading(card);
window.showTimedLoading = (containerId, duration, options) => loadingManager.showTimedLoading(containerId, duration, options);
window.showLoadingForPromise = (containerId, promise, options) => loadingManager.showLoadingForPromise(containerId, promise, options);

// تصدير للاستخدام العام
window.loadingManager = loadingManager;

/**
 * أمثلة على الاستخدام في التطبيق
 */

// تحديث دالة حفظ البيع لتتضمن مؤشر التحميل
const originalSaveSale = window.saveSale;
if (originalSaveSale) {
  window.saveSale = function() {
    const saveButton = document.querySelector('#saveSaleBtn');
    
    if (saveButton) {
      showButtonLoading(saveButton, 'جاري الحفظ...');
      
      // محاكاة تأخير للعرض
      setTimeout(() => {
        originalSaveSale();
        hideButtonLoading(saveButton);
      }, 500);
    } else {
      originalSaveSale();
    }
  };
}

// تحديث دالة تحميل البيانات من GitHub
const originalGithubDownloadData = window.githubDownloadData;
if (originalGithubDownloadData) {
  window.githubDownloadData = async function() {
    showGlobalLoading('جاري تحميل البيانات من GitHub...');
    
    try {
      await originalGithubDownloadData();
    } finally {
      hideGlobalLoading();
    }
  };
}

// تحديث دالة عرض الجداول لتتضمن تحميل هيكلي
const originalRenderPackagesTable = window.renderPackagesTable;
if (originalRenderPackagesTable) {
  window.renderPackagesTable = function() {
    const table = document.getElementById('packagesTable');
    
    if (table && data.packages && data.packages.length > 10) {
      // إظهار تحميل هيكلي أولاً
      showTableLoading(table, 5);
      
      // تأخير صغير للعرض
      setTimeout(() => {
        originalRenderPackagesTable();
      }, 300);
    } else {
      originalRenderPackagesTable();
    }
  };
}

// مثال على استخدام التحميل مع الوعود
window.loadDataWithLoading = async function() {
  const loadingId = showLoading('mainContent', {
    type: 'skeleton',
    message: 'جاري تحميل البيانات...',
    overlay: true
  });
  
  try {
    // محاكاة تحميل البيانات
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // تحميل البيانات الفعلي
    if (typeof loadData === 'function') {
      loadData();
    }
    
    hideLoading(loadingId);
    
    if (typeof showNotification === 'function') {
      showNotification('تم تحميل البيانات بنجاح!', 'success');
    }
    
  } catch (error) {
    hideLoading(loadingId);
    
    if (typeof showNotification === 'function') {
      showNotification('فشل في تحميل البيانات: ' + error.message, 'error');
    }
  }
};

// مثال على شريط التقدم
window.simulateProgressLoading = function() {
  const loadingId = showLoading('mainContent', {
    type: 'progress',
    message: 'جاري المعالجة...',
    progress: 0,
    overlay: true
  });
  
  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 15;
    
    if (progress >= 100) {
      progress = 100;
      updateProgress(loadingId, progress, 'اكتمل!');
      
      setTimeout(() => {
        hideLoading(loadingId);
        clearInterval(interval);
      }, 500);
    } else {
      const messages = [
        'معالجة البيانات...',
        'حساب الإحصائيات...',
        'تحديث التقارير...',
        'حفظ التغييرات...',
        'تحسين الأداء...'
      ];
      
      const message = messages[Math.floor(Math.random() * messages.length)];
      updateProgress(loadingId, progress, message);
    }
  }, 200);
};

console.log('⏳ Loading States Manager loaded successfully');