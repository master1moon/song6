/**
 * مدير التصميم المتجاوب المحسن
 * يدير سلوك التطبيق عبر أحجام الشاشات المختلفة
 */

class ResponsiveManager {
  constructor() {
    this.breakpoints = {
      xs: 0,
      sm: 576,
      md: 768,
      lg: 992,
      xl: 1200,
      xxl: 1400
    };
    
    this.currentBreakpoint = 'lg';
    this.isTouch = 'ontouchstart' in window;
    this.isMobile = this.detectMobile();
    this.orientation = this.getOrientation();
    
    this.sidebarCollapsed = false;
    this.mobileMenuOpen = false;
    
    this.init();
  }

  /**
   * تهيئة مدير الاستجابة
   */
  init() {
    this.detectBreakpoint();
    this.setupEventListeners();
    this.applySidebarBehavior();
    this.setupTouchOptimizations();
    
    console.log('📱 Responsive Manager initialized');
    console.log(`📊 Current: ${this.currentBreakpoint}, Mobile: ${this.isMobile}, Touch: ${this.isTouch}`);
  }

  /**
   * اكتشاف نوع الجهاز
   */
  detectMobile() {
    const userAgent = navigator.userAgent.toLowerCase();
    const mobileKeywords = ['mobile', 'iphone', 'ipad', 'android', 'blackberry', 'nokia', 'opera mini'];
    
    return mobileKeywords.some(keyword => userAgent.includes(keyword)) || 
           window.innerWidth <= 768 ||
           ('ontouchstart' in window && window.innerWidth <= 1024);
  }

  /**
   * الحصول على اتجاه الشاشة
   */
  getOrientation() {
    if (window.screen && window.screen.orientation) {
      return window.screen.orientation.angle === 0 || window.screen.orientation.angle === 180 ? 'portrait' : 'landscape';
    }
    return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
  }

  /**
   * اكتشاف نقطة التكسر الحالية
   */
  detectBreakpoint() {
    const width = window.innerWidth;
    let newBreakpoint = 'xs';
    
    Object.entries(this.breakpoints).reverse().forEach(([name, minWidth]) => {
      if (width >= minWidth) {
        newBreakpoint = name;
        return;
      }
    });
    
    if (newBreakpoint !== this.currentBreakpoint) {
      const oldBreakpoint = this.currentBreakpoint;
      this.currentBreakpoint = newBreakpoint;
      this.onBreakpointChange(oldBreakpoint, newBreakpoint);
    }
  }

  /**
   * معالجة تغيير نقطة التكسر
   */
  onBreakpointChange(oldBreakpoint, newBreakpoint) {
    console.log(`📱 Breakpoint changed: ${oldBreakpoint} → ${newBreakpoint}`);
    
    // تحديث فئات CSS
    document.body.classList.remove(`breakpoint-${oldBreakpoint}`);
    document.body.classList.add(`breakpoint-${newBreakpoint}`);
    
    // تطبيق سلوك الشريط الجانبي
    this.applySidebarBehavior();
    
    // تحديث الجداول
    this.updateTablesResponsiveness();
    
    // تحديث النماذج
    this.updateFormsLayout();
    
    // إرسال حدث التغيير
    this.dispatchBreakpointChangeEvent(oldBreakpoint, newBreakpoint);
  }

  /**
   * إعداد مستمعي الأحداث
   */
  setupEventListeners() {
    // مستمع تغيير حجم النافذة
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        this.detectBreakpoint();
        this.orientation = this.getOrientation();
        this.updateViewportHeight();
      }, 100);
    });
    
    // مستمع تغيير الاتجاه
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.orientation = this.getOrientation();
        this.detectBreakpoint();
        this.updateViewportHeight();
      }, 100);
    });
    
    // إعداد زر طي الشريط الجانبي
    this.setupSidebarToggle();
  }

  /**
   * إعداد زر طي الشريط الجانبي
   */
  setupSidebarToggle() {
    // إنشاء زر الطي إذا لم يكن موجوداً
    let toggleButton = document.querySelector('.sidebar-toggle');
    
    if (!toggleButton) {
      toggleButton = document.createElement('button');
      toggleButton.className = 'sidebar-toggle';
      toggleButton.innerHTML = '<i class="fas fa-bars"></i>';
      toggleButton.title = 'طي/فتح القائمة';
      
      const sidebar = document.querySelector('.sidebar');
      if (sidebar) {
        sidebar.appendChild(toggleButton);
      }
    }
    
    // إضافة معالج الحدث
    toggleButton.addEventListener('click', () => {
      this.toggleSidebar();
    });
  }

  /**
   * تطبيق سلوك الشريط الجانبي
   */
  applySidebarBehavior() {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;
    
    // إزالة جميع فئات الاستجابة
    sidebar.classList.remove('mobile-bottom', 'collapsed', 'overlay');
    
    switch (this.currentBreakpoint) {
      case 'xs':
        // شريط سفلي للهواتف
        sidebar.classList.add('mobile-bottom');
        this.setupMobileNavigation();
        break;
        
      case 'sm':
        // شريط علوي أفقي للهواتف الأفقية
        sidebar.classList.add('mobile-horizontal');
        break;
        
      case 'md':
        // شريط جانبي قابل للطي للأجهزة اللوحية
        if (this.sidebarCollapsed) {
          sidebar.classList.add('collapsed');
        }
        break;
        
      default:
        // شريط جانبي كامل للشاشات الكبيرة
        break;
    }
  }

  /**
   * إعداد التنقل للهواتف
   */
  setupMobileNavigation() {
    const navLinks = document.querySelectorAll('.sidebar .nav-link');
    
    navLinks.forEach(link => {
      // تحسين النصوص للهواتف
      const span = link.querySelector('span');
      if (span && span.textContent.length > 8) {
        span.textContent = span.textContent.substring(0, 6) + '...';
      }
      
      // إضافة تأثيرات اللمس
      link.addEventListener('touchstart', function() {
        this.classList.add('touch-active');
      });
      
      link.addEventListener('touchend', function() {
        setTimeout(() => {
          this.classList.remove('touch-active');
        }, 150);
      });
    });
  }

  /**
   * تبديل حالة الشريط الجانبي
   */
  toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;
    
    if (this.currentBreakpoint === 'xs') {
      // في الهواتف - تبديل القائمة المنبثقة
      this.mobileMenuOpen = !this.mobileMenuOpen;
      sidebar.classList.toggle('menu-open', this.mobileMenuOpen);
    } else {
      // في الشاشات الكبيرة - طي الشريط الجانبي
      this.sidebarCollapsed = !this.sidebarCollapsed;
      sidebar.classList.toggle('collapsed', this.sidebarCollapsed);
      
      // حفظ الحالة
      localStorage.setItem('sidebarCollapsed', this.sidebarCollapsed);
    }
    
    // تحديث أيقونة الزر
    this.updateToggleButtonIcon();
  }

  /**
   * تحديث أيقونة زر الطي
   */
  updateToggleButtonIcon() {
    const toggleButton = document.querySelector('.sidebar-toggle i');
    if (!toggleButton) return;
    
    if (this.currentBreakpoint === 'xs') {
      toggleButton.className = this.mobileMenuOpen ? 'fas fa-times' : 'fas fa-bars';
    } else {
      toggleButton.className = this.sidebarCollapsed ? 'fas fa-chevron-right' : 'fas fa-chevron-left';
    }
  }

  /**
   * تحديث استجابة الجداول
   */
  updateTablesResponsiveness() {
    const tables = document.querySelectorAll('.data-table');
    
    tables.forEach(table => {
      const wrapper = table.closest('.responsive-table-wrapper') || this.wrapTable(table);
      
      if (this.currentBreakpoint === 'xs' || this.currentBreakpoint === 'sm') {
        // تحويل الجدول لعرض كروت في الهواتف
        this.convertTableToCards(table);
      } else {
        // عرض الجدول العادي
        this.restoreTableView(table);
      }
    });
  }

  /**
   * تحويل الجدول إلى كروت للهواتف
   */
  convertTableToCards(table) {
    if (table.classList.contains('cards-view')) return;
    
    const rows = table.querySelectorAll('tbody tr');
    const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent);
    
    rows.forEach(row => {
      const cells = row.querySelectorAll('td');
      let cardHTML = '<div class="table-card">';
      
      cells.forEach((cell, index) => {
        if (headers[index] && cell.textContent.trim()) {
          cardHTML += `
            <div class="card-field">
              <span class="field-label">${headers[index]}:</span>
              <span class="field-value">${cell.innerHTML}</span>
            </div>
          `;
        }
      });
      
      cardHTML += '</div>';
      row.innerHTML = `<td colspan="${cells.length}">${cardHTML}</td>`;
    });
    
    table.classList.add('cards-view');
  }

  /**
   * استعادة عرض الجدول العادي
   */
  restoreTableView(table) {
    if (!table.classList.contains('cards-view')) return;
    
    // هذا يتطلب إعادة تحميل البيانات من المصدر
    table.classList.remove('cards-view');
    
    // إعادة عرض الجدول (يجب استدعاء الدالة المناسبة)
    const tableId = table.id;
    if (tableId === 'packagesTable' && typeof renderPackagesTable === 'function') {
      renderPackagesTable();
    }
    // يمكن إضافة المزيد من الجداول هنا
  }

  /**
   * تحديث تخطيط النماذج
   */
  updateFormsLayout() {
    const forms = document.querySelectorAll('.responsive-form');
    
    forms.forEach(form => {
      const formRows = form.querySelectorAll('.form-row');
      
      formRows.forEach(row => {
        if (this.currentBreakpoint === 'xs') {
          row.style.gridTemplateColumns = '1fr';
        } else if (this.currentBreakpoint === 'sm') {
          row.style.gridTemplateColumns = '1fr';
        } else if (this.currentBreakpoint === 'md') {
          row.style.gridTemplateColumns = 'repeat(auto-fit, minmax(200px, 1fr))';
        } else {
          row.style.gridTemplateColumns = 'repeat(auto-fit, minmax(250px, 1fr))';
        }
      });
    });
  }

  /**
   * إعداد تحسينات اللمس
   */
  setupTouchOptimizations() {
    if (!this.isTouch) return;
    
    document.body.classList.add('touch-device');
    
    // تحسين أحجام الأزرار للمس
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(btn => {
      if (!btn.classList.contains('btn-lg')) {
        btn.style.minHeight = '44px';
        btn.style.minWidth = '44px';
      }
    });
    
    // تحسين حقول النماذج
    const inputs = document.querySelectorAll('.form-control');
    inputs.forEach(input => {
      input.style.minHeight = '44px';
    });
    
    // إضافة تأثيرات اللمس
    this.addTouchEffects();
  }

  /**
   * إضافة تأثيرات اللمس
   */
  addTouchEffects() {
    const touchElements = document.querySelectorAll('.btn, .nav-link, .card, .list-group-item');
    
    touchElements.forEach(element => {
      element.addEventListener('touchstart', function(e) {
        this.classList.add('touch-active');
      });
      
      element.addEventListener('touchend', function(e) {
        setTimeout(() => {
          this.classList.remove('touch-active');
        }, 150);
      });
      
      element.addEventListener('touchcancel', function(e) {
        this.classList.remove('touch-active');
      });
    });
  }

  /**
   * تحديث ارتفاع النافذة (لمعالجة مشكلة الهواتف)
   */
  updateViewportHeight() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }

  /**
   * إرسال حدث تغيير نقطة التكسر
   */
  dispatchBreakpointChangeEvent(oldBreakpoint, newBreakpoint) {
    const event = new CustomEvent('breakpointChanged', {
      detail: {
        oldBreakpoint,
        newBreakpoint,
        isMobile: this.isMobile,
        isTouch: this.isTouch,
        orientation: this.orientation
      }
    });
    
    window.dispatchEvent(event);
  }

  /**
   * الحصول على معلومات الاستجابة الحالية
   */
  getResponsiveInfo() {
    return {
      breakpoint: this.currentBreakpoint,
      isMobile: this.isMobile,
      isTouch: this.isTouch,
      orientation: this.orientation,
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      sidebarCollapsed: this.sidebarCollapsed,
      mobileMenuOpen: this.mobileMenuOpen
    };
  }

  /**
   * تطبيق تخطيط مخصص
   */
  applyCustomLayout(layoutName) {
    document.body.classList.remove('layout-default', 'layout-compact', 'layout-spacious');
    document.body.classList.add(`layout-${layoutName}`);
    
    console.log(`📱 Applied layout: ${layoutName}`);
  }
}

// إنشاء مدير الاستجابة العام
const responsiveManager = new ResponsiveManager();

// دوال مساعدة للاستخدام العام
window.toggleSidebar = () => responsiveManager.toggleSidebar();
window.getResponsiveInfo = () => responsiveManager.getResponsiveInfo();
window.applyCustomLayout = (layoutName) => responsiveManager.applyCustomLayout(layoutName);

// مستمع لحدث تغيير نقطة التكسر
window.addEventListener('breakpointChanged', (event) => {
  console.log('📱 Breakpoint changed:', event.detail);
  
  // يمكن إضافة منطق إضافي هنا
  // مثل تحديث الرسوم البيانية أو إعادة تحميل المحتوى
});

// تصدير للاستخدام العام
window.responsiveManager = responsiveManager;

console.log('📱 Responsive Manager loaded successfully');