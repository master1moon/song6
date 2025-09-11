/**
 * مدير التحسينات المرئية الشامل
 * يدير تكامل جميع التحسينات المرئية والتفاعلية
 */

class UIEnhancementsManager {
  constructor() {
    this.initialized = false;
    this.features = {
      darkLightMode: false,
      responsiveDesign: false,
      animations: false,
      materialDesign: false,
      loadingStates: false
    };
    
    this.settings = {
      animationsEnabled: true,
      darkModeEnabled: false,
      reducedMotion: false,
      autoTheme: true
    };
    
    this.init();
  }

  /**
   * تهيئة جميع التحسينات المرئية
   */
  async init() {
    console.log('🎨 Starting UI Enhancements initialization...');
    
    try {
      // تحميل الإعدادات المحفوظة
      this.loadSettings();
      
      // تهيئة كل نظام
      await this.initializeThemeSystem();
      await this.initializeResponsiveSystem();
      await this.initializeAnimationSystem();
      await this.initializeMaterialDesign();
      await this.initializeLoadingStates();
      
      // تطبيق التحسينات على العناصر الموجودة
      this.enhanceExistingElements();
      
      // إعداد معالجات الأحداث العامة
      this.setupGlobalEventHandlers();
      
      this.initialized = true;
      console.log('✅ UI Enhancements initialized successfully');
      
      // إرسال حدث التهيئة
      this.dispatchInitializedEvent();
      
    } catch (error) {
      console.error('❌ UI Enhancements initialization failed:', error);
    }
  }

  /**
   * تهيئة نظام الثيمات
   */
  async initializeThemeSystem() {
    if (typeof window.themeManager !== 'undefined') {
      this.features.darkLightMode = true;
      console.log('✅ Theme system ready');
      
      // تطبيق الثيم المحفوظ أو الافتراضي
      if (this.settings.autoTheme) {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const savedTheme = localStorage.getItem('app-theme');
        
        if (!savedTheme && prefersDark) {
          window.themeManager.applyTheme('dark');
        }
      }
    } else {
      console.warn('⚠️ Theme Manager not available');
    }
  }

  /**
   * تهيئة النظام المتجاوب
   */
  async initializeResponsiveSystem() {
    if (typeof window.responsiveManager !== 'undefined') {
      this.features.responsiveDesign = true;
      console.log('✅ Responsive system ready');
      
      // تطبيق التحسينات المتجاوبة
      this.applyResponsiveEnhancements();
    } else {
      console.warn('⚠️ Responsive Manager not available');
    }
  }

  /**
   * تهيئة نظام الرسوم المتحركة
   */
  async initializeAnimationSystem() {
    if (typeof window.animationManager !== 'undefined') {
      this.features.animations = true;
      console.log('✅ Animation system ready');
      
      // تطبيق الرسوم المتحركة إذا كانت مفعلة
      if (this.settings.animationsEnabled && !this.settings.reducedMotion) {
        setTimeout(() => {
          window.animationManager.addGlobalAnimations();
        }, 100);
      }
    } else {
      console.warn('⚠️ Animation Manager not available');
    }
  }

  /**
   * تهيئة Material Design
   */
  async initializeMaterialDesign() {
    if (typeof window.materialManager !== 'undefined') {
      this.features.materialDesign = true;
      console.log('✅ Material Design ready');
      
      // تطبيق Material Design على العناصر الموجودة
      setTimeout(() => {
        window.materialManager.convertExistingElements();
      }, 200);
    } else {
      console.warn('⚠️ Material Design Manager not available');
    }
  }

  /**
   * تهيئة حالات التحميل
   */
  async initializeLoadingStates() {
    if (typeof window.loadingManager !== 'undefined') {
      this.features.loadingStates = true;
      console.log('✅ Loading States ready');
    } else {
      console.warn('⚠️ Loading Manager not available');
    }
  }

  /**
   * تحسين العناصر الموجودة
   */
  enhanceExistingElements() {
    // تحسين الكروت الموجودة
    this.enhanceCards();
    
    // تحسين الأزرار
    this.enhanceButtons();
    
    // تحسين النماذج
    this.enhanceForms();
    
    // تحسين الجداول
    this.enhanceTables();
    
    // تحسين الإحصائيات
    this.enhanceStats();
  }

  /**
   * تحسين الكروت
   */
  enhanceCards() {
    const cards = document.querySelectorAll('.section-content, .card');
    
    cards.forEach((card, index) => {
      // إضافة تأثيرات Material Design
      if (!card.classList.contains('card-material')) {
        card.classList.add('card-material');
      }
      
      // إضافة تأثيرات الحركة
      card.setAttribute('data-animate-on-scroll', 'slide-in-up');
      
      // تحسين الارتفاع والظلال
      if (typeof window.materialManager !== 'undefined') {
        window.materialManager.addElevation(card, 1);
      }
    });
  }

  /**
   * تحسين الأزرار
   */
  enhanceButtons() {
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(btn => {
      // إضافة فئات Material Design
      if (!btn.classList.contains('btn-material')) {
        btn.classList.add('btn-material');
      }
      
      // إضافة تأثيرات التمرير
      btn.classList.add('hover-scale');
      
      // إضافة معالج التحميل للأزرار المهمة
      if (btn.id && (btn.id.includes('save') || btn.id.includes('submit'))) {
        const originalClick = btn.onclick;
        
        btn.onclick = function(e) {
          if (typeof window.showButtonLoading === 'function') {
            window.showButtonLoading(this, 'جاري المعالجة...');
            
            setTimeout(() => {
              if (originalClick) {
                originalClick.call(this, e);
              }
              
              setTimeout(() => {
                if (typeof window.hideButtonLoading === 'function') {
                  window.hideButtonLoading(this);
                }
              }, 500);
            }, 100);
          } else if (originalClick) {
            originalClick.call(this, e);
          }
        };
      }
    });
  }

  /**
   * تحسين النماذج
   */
  enhanceForms() {
    const forms = document.querySelectorAll('form, .modal-body');
    
    forms.forEach(form => {
      form.classList.add('form-material');
      
      // تحسين حقول الإدخال
      const formGroups = form.querySelectorAll('.form-group');
      formGroups.forEach(group => {
        if (typeof window.materialManager !== 'undefined') {
          window.materialManager.convertToMaterialInput(group);
        }
        
        // إضافة تأثيرات الحركة
        group.setAttribute('data-animate-on-scroll', 'slide-in-left');
      });
    });
  }

  /**
   * تحسين الجداول
   */
  enhanceTables() {
    const tables = document.querySelectorAll('.table, .data-table');
    
    tables.forEach(table => {
      // إضافة تأثيرات Material Design
      if (typeof window.materialManager !== 'undefined') {
        window.materialManager.materializeTable(table);
      }
      
      // إضافة wrapper للاستجابة
      if (!table.closest('.responsive-table-wrapper')) {
        const wrapper = document.createElement('div');
        wrapper.className = 'responsive-table-wrapper';
        table.parentNode.insertBefore(wrapper, table);
        wrapper.appendChild(table);
      }
      
      // إضافة تأثيرات التحميل
      table.setAttribute('data-loading-target', 'true');
    });
  }

  /**
   * تحسين الإحصائيات
   */
  enhanceStats() {
    const statBoxes = document.querySelectorAll('.stat-box');
    
    statBoxes.forEach((box, index) => {
      // إضافة تأثيرات الحركة
      box.classList.add('hover-lift');
      box.setAttribute('data-animate-on-scroll', 'scale-in');
      
      // تحسين العدادات
      const statValue = box.querySelector('.stat-value');
      if (statValue) {
        statValue.setAttribute('data-animate-counter', 'true');
      }
    });
  }

  /**
   * إعداد معالجات الأحداث العامة
   */
  setupGlobalEventHandlers() {
    // معالج تغيير القسم
    const navLinks = document.querySelectorAll('[data-section]');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        this.onSectionChange(e.target.getAttribute('data-section'));
      });
    });
    
    // معالج النماذج
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
      form.addEventListener('submit', (e) => {
        this.onFormSubmit(e, form);
      });
    });
    
    // معالج النوافذ المنبثقة
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
      modal.addEventListener('show.bs.modal', () => {
        this.onModalShow(modal);
      });
    });
  }

  /**
   * معالجة تغيير القسم
   */
  onSectionChange(sectionId) {
    console.log(`🔄 Section changed to: ${sectionId}`);
    
    // إضافة تأثيرات الانتقال
    const newSection = document.getElementById(sectionId);
    if (newSection && this.features.animations) {
      // إخفاء القسم الحالي
      const currentSection = document.querySelector('.section[style*="block"]');
      if (currentSection && currentSection !== newSection) {
        if (typeof window.animate === 'function') {
          window.animate(currentSection, 'fade-out').then(() => {
            currentSection.style.display = 'none';
            
            // إظهار القسم الجديد
            newSection.style.display = 'block';
            window.animate(newSection, 'slide-in-up');
          });
        }
      }
    }
    
    // تحديث عنوان الصفحة
    this.updatePageTitle(sectionId);
  }

  /**
   * تحديث عنوان الصفحة
   */
  updatePageTitle(sectionId) {
    const titles = {
      'dashboard': 'لوحة التحكم',
      'packages': 'الباقات والأسعار',
      'stores': 'البقالات والمحلات',
      'inventory': 'كمية الكروت',
      'expenses': 'المصروفات',
      'reports': 'التقارير المالية',
      'settings': 'الإعدادات'
    };
    
    const pageTitle = document.querySelector('.page-title');
    if (pageTitle && titles[sectionId]) {
      pageTitle.textContent = titles[sectionId];
      
      // تأثير تحريك النص
      if (this.features.animations && typeof window.animate === 'function') {
        window.animate(pageTitle, 'slide-in-down');
      }
    }
  }

  /**
   * معالجة إرسال النماذج
   */
  onFormSubmit(event, form) {
    if (!this.features.loadingStates) return;
    
    const submitButton = form.querySelector('[type="submit"], .btn-primary');
    if (submitButton && typeof window.showButtonLoading === 'function') {
      window.showButtonLoading(submitButton, 'جاري الحفظ...');
      
      // إخفاء التحميل بعد فترة (سيتم تخصيصه حسب العملية)
      setTimeout(() => {
        if (typeof window.hideButtonLoading === 'function') {
          window.hideButtonLoading(submitButton);
        }
      }, 1000);
    }
  }

  /**
   * معالجة إظهار النوافذ المنبثقة
   */
  onModalShow(modal) {
    if (!this.features.animations) return;
    
    // تحريك محتوى المودال
    const modalContent = modal.querySelector('.modal-content');
    if (modalContent && typeof window.animate === 'function') {
      modalContent.style.transform = 'scale(0.8)';
      modalContent.style.opacity = '0';
      
      setTimeout(() => {
        modalContent.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        modalContent.style.transform = 'scale(1)';
        modalContent.style.opacity = '1';
      }, 10);
    }
  }

  /**
   * تحميل الإعدادات المحفوظة
   */
  loadSettings() {
    try {
      const saved = localStorage.getItem('uiEnhancementsSettings');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.settings = { ...this.settings, ...parsed };
      }
      
      // تطبيق إعدادات الحركة المحدودة
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.settings.reducedMotion = reducedMotion;
      this.settings.animationsEnabled = this.settings.animationsEnabled && !reducedMotion;
      
    } catch (error) {
      console.warn('⚠️ Failed to load UI settings:', error);
    }
  }

  /**
   * حفظ الإعدادات
   */
  saveSettings() {
    try {
      localStorage.setItem('uiEnhancementsSettings', JSON.stringify(this.settings));
      console.log('💾 UI settings saved');
    } catch (error) {
      console.error('❌ Failed to save UI settings:', error);
    }
  }

  /**
   * تبديل الرسوم المتحركة
   */
  toggleAnimations() {
    this.settings.animationsEnabled = !this.settings.animationsEnabled;
    
    if (typeof window.animationManager !== 'undefined') {
      window.animationManager.toggleAnimations(this.settings.animationsEnabled);
    }
    
    document.body.classList.toggle('animations-disabled', !this.settings.animationsEnabled);
    
    this.saveSettings();
    
    if (typeof showNotification === 'function') {
      const message = this.settings.animationsEnabled ? 
        'تم تفعيل الرسوم المتحركة' : 'تم تعطيل الرسوم المتحركة';
      showNotification(message, 'info');
    }
  }

  /**
   * تطبيق ثيم محدد
   */
  applyTheme(themeName) {
    if (typeof window.themeManager !== 'undefined') {
      window.themeManager.applyTheme(themeName);
      window.themeManager.saveTheme(themeName);
      
      this.settings.darkModeEnabled = themeName === 'dark';
      this.saveSettings();
    }
  }

  /**
   * تطبيق التحسينات المتجاوبة
   */
  applyResponsiveEnhancements() {
    // إضافة فئات الاستجابة للعناصر المهمة
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      mainContent.classList.add('responsive-main');
    }
    
    // تحسين الإحصائيات
    const statsContainer = document.querySelector('.stats-container');
    if (statsContainer) {
      statsContainer.classList.add('stats-grid');
    }
    
    // تحسين النماذج
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
      form.classList.add('responsive-form');
    });
  }

  /**
   * إضافة أزرار التحكم في الواجهة
   */
  addUIControls() {
    const controlsContainer = document.createElement('div');
    controlsContainer.id = 'uiControls';
    controlsContainer.className = 'ui-controls';
    controlsContainer.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      z-index: 1000;
    `;
    
    // زر تبديل الرسوم المتحركة
    const animationsToggle = document.createElement('button');
    animationsToggle.className = 'btn btn-sm btn-outline-secondary';
    animationsToggle.innerHTML = '<i class="fas fa-magic"></i>';
    animationsToggle.title = 'تبديل الرسوم المتحركة';
    animationsToggle.onclick = () => this.toggleAnimations();
    
    // زر إعدادات سريعة
    const settingsButton = document.createElement('button');
    settingsButton.className = 'btn btn-sm btn-outline-info';
    settingsButton.innerHTML = '<i class="fas fa-palette"></i>';
    settingsButton.title = 'إعدادات الواجهة';
    settingsButton.onclick = () => this.showUISettingsModal();
    
    controlsContainer.appendChild(animationsToggle);
    controlsContainer.appendChild(settingsButton);
    
    document.body.appendChild(controlsContainer);
  }

  /**
   * إظهار نافذة إعدادات الواجهة
   */
  showUISettingsModal() {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'uiSettingsModal';
    
    modal.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">⚙️ إعدادات الواجهة</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="form-group mb-3">
              <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" id="animationsToggle" ${this.settings.animationsEnabled ? 'checked' : ''}>
                <label class="form-check-label" for="animationsToggle">
                  ✨ الرسوم المتحركة
                </label>
              </div>
            </div>
            
            <div class="form-group mb-3">
              <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" id="autoThemeToggle" ${this.settings.autoTheme ? 'checked' : ''}>
                <label class="form-check-label" for="autoThemeToggle">
                  🌓 ثيم تلقائي حسب النظام
                </label>
              </div>
            </div>
            
            <div class="form-group mb-3">
              <label class="form-label">🎨 اختيار الثيم</label>
              <div class="btn-group w-100" role="group">
                <input type="radio" class="btn-check" name="themeOptions" id="lightTheme" value="light" ${!this.settings.darkModeEnabled ? 'checked' : ''}>
                <label class="btn btn-outline-primary" for="lightTheme">☀️ فاتح</label>
                
                <input type="radio" class="btn-check" name="themeOptions" id="darkTheme" value="dark" ${this.settings.darkModeEnabled ? 'checked' : ''}>
                <label class="btn btn-outline-primary" for="darkTheme">🌙 مظلم</label>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إلغاء</button>
            <button type="button" class="btn btn-primary" onclick="uiManager.applyModalSettings()">تطبيق</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();
    
    // حذف المودال عند الإغلاق
    modal.addEventListener('hidden.bs.modal', () => {
      modal.remove();
    });
  }

  /**
   * تطبيق إعدادات المودال
   */
  applyModalSettings() {
    const modal = document.getElementById('uiSettingsModal');
    
    // الرسوم المتحركة
    const animationsToggle = modal.querySelector('#animationsToggle');
    if (animationsToggle) {
      this.settings.animationsEnabled = animationsToggle.checked;
    }
    
    // الثيم التلقائي
    const autoThemeToggle = modal.querySelector('#autoThemeToggle');
    if (autoThemeToggle) {
      this.settings.autoTheme = autoThemeToggle.checked;
    }
    
    // الثيم المختار
    const selectedTheme = modal.querySelector('input[name="themeOptions"]:checked');
    if (selectedTheme) {
      this.applyTheme(selectedTheme.value);
    }
    
    // تطبيق الرسوم المتحركة
    if (typeof window.animationManager !== 'undefined') {
      window.animationManager.toggleAnimations(this.settings.animationsEnabled);
    }
    
    this.saveSettings();
    
    // إغلاق المودال
    const bootstrapModal = bootstrap.Modal.getInstance(modal);
    bootstrapModal.hide();
    
    if (typeof showNotification === 'function') {
      showNotification('✅ تم تطبيق إعدادات الواجهة', 'success');
    }
  }

  /**
   * إرسال حدث التهيئة
   */
  dispatchInitializedEvent() {
    const event = new CustomEvent('uiEnhancementsReady', {
      detail: {
        features: this.features,
        settings: this.settings
      }
    });
    
    window.dispatchEvent(event);
  }

  /**
   * الحصول على إحصائيات الواجهة
   */
  getUIStats() {
    return {
      initialized: this.initialized,
      features: this.features,
      settings: this.settings,
      activeFeatures: Object.values(this.features).filter(Boolean).length,
      totalFeatures: Object.keys(this.features).length
    };
  }

  /**
   * تشخيص حالة الواجهة
   */
  diagnose() {
    const diagnosis = {
      timestamp: new Date().toISOString(),
      uiEnhancements: this.initialized,
      features: {},
      settings: this.settings,
      browser: {
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        support: {
          cssGrid: CSS.supports('display', 'grid'),
          cssCustomProperties: CSS.supports('--test', 'value'),
          animations: CSS.supports('animation', 'test'),
          transforms: CSS.supports('transform', 'translate(0)')
        }
      }
    };

    // فحص كل ميزة
    Object.keys(this.features).forEach(feature => {
      diagnosis.features[feature] = {
        available: this.features[feature],
        manager: this.getManagerStatus(feature)
      };
    });

    console.log('🔍 UI Enhancements Diagnosis:', diagnosis);
    return diagnosis;
  }

  /**
   * الحصول على حالة مدير محدد
   */
  getManagerStatus(feature) {
    const managers = {
      darkLightMode: 'window.themeManager',
      responsiveDesign: 'window.responsiveManager',
      animations: 'window.animationManager',
      materialDesign: 'window.materialManager',
      loadingStates: 'window.loadingManager'
    };
    
    const managerPath = managers[feature];
    if (managerPath) {
      const manager = managerPath.split('.').reduce((obj, prop) => obj && obj[prop], window);
      return !!manager;
    }
    
    return false;
  }
}

// إنشاء مدير التحسينات المرئية العام
const uiManager = new UIEnhancementsManager();

// دوال مساعدة للاستخدام العام
window.toggleAnimations = () => uiManager.toggleAnimations();
window.applyTheme = (themeName) => uiManager.applyTheme(themeName);
window.getUIStats = () => uiManager.getUIStats();
window.diagnoseUI = () => uiManager.diagnose();

// تصدير للاستخدام العام
window.uiManager = uiManager;

// إضافة أزرار التحكم عند التحميل
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    uiManager.addUIControls();
  }, 1000);
});

// مستمع لحدث تهيئة الواجهة
window.addEventListener('uiEnhancementsReady', (event) => {
  console.log('🎉 UI Enhancements ready:', event.detail);
  
  if (typeof showNotification === 'function') {
    const activeFeatures = event.detail.features;
    const count = Object.values(activeFeatures).filter(Boolean).length;
    showNotification(`🎨 تم تفعيل ${count} من التحسينات المرئية`, 'success', 3000);
  }
});

console.log('🎨 UI Enhancements Manager loaded successfully');