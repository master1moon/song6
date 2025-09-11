/**
 * مدير الثيمات (Dark/Light Mode)
 * يدير تبديل الوضع المظلم والفاتح مع حفظ التفضيلات
 */

class ThemeManager {
  constructor() {
    this.currentTheme = 'light';
    this.themes = {
      light: {
        name: 'فاتح',
        icon: '☀️',
        colors: {
          primary: '#007bff',
          secondary: '#6c757d',
          success: '#28a745',
          danger: '#dc3545',
          warning: '#ffc107',
          info: '#17a2b8',
          light: '#f8f9fa',
          dark: '#343a40',
          background: '#ffffff',
          surface: '#f5f7fa',
          onBackground: '#212529',
          onSurface: '#495057'
        }
      },
      dark: {
        name: 'مظلم',
        icon: '🌙',
        colors: {
          primary: '#0d6efd',
          secondary: '#6c757d',
          success: '#198754',
          danger: '#dc3545',
          warning: '#ffc107',
          info: '#0dcaf0',
          light: '#495057',
          dark: '#212529',
          background: '#121212',
          surface: '#1e1e1e',
          onBackground: '#ffffff',
          onSurface: '#e9ecef'
        }
      }
    };
    
    this.init();
  }

  /**
   * تهيئة مدير الثيمات
   */
  init() {
    // تحميل الثيم المحفوظ
    this.loadSavedTheme();
    
    // تطبيق الثيم
    this.applyTheme(this.currentTheme);
    
    // إضافة مستمع للتغيير التلقائي حسب النظام
    this.setupSystemThemeListener();
    
    console.log('🎨 Theme Manager initialized');
  }

  /**
   * تحميل الثيم المحفوظ
   */
  loadSavedTheme() {
    const savedTheme = localStorage.getItem('app-theme');
    
    if (savedTheme && this.themes[savedTheme]) {
      this.currentTheme = savedTheme;
    } else {
      // استخدام تفضيل النظام كافتراضي
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.currentTheme = prefersDark ? 'dark' : 'light';
    }
  }

  /**
   * حفظ الثيم المختار
   */
  saveTheme(theme) {
    localStorage.setItem('app-theme', theme);
    console.log(`💾 Theme saved: ${theme}`);
  }

  /**
   * تطبيق الثيم
   */
  applyTheme(themeName) {
    if (!this.themes[themeName]) {
      console.error(`❌ Theme not found: ${themeName}`);
      return;
    }

    const theme = this.themes[themeName];
    const root = document.documentElement;
    
    // تطبيق الألوان كمتغيرات CSS
    Object.entries(theme.colors).forEach(([name, value]) => {
      root.style.setProperty(`--color-${name}`, value);
    });
    
    // إضافة/إزالة فئة الوضع المظلم
    if (themeName === 'dark') {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    } else {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
    }
    
    this.currentTheme = themeName;
    this.updateThemeToggleButton();
    
    // إرسال حدث تغيير الثيم
    this.dispatchThemeChangeEvent(themeName);
    
    console.log(`🎨 Theme applied: ${theme.name}`);
  }

  /**
   * تبديل الثيم
   */
  toggleTheme() {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.applyTheme(newTheme);
    this.saveTheme(newTheme);
    
    // إضافة تأثير انتقال سلس
    this.addTransitionEffect();
    
    if (typeof showNotification === 'function') {
      showNotification(`تم التبديل إلى الوضع ${this.themes[newTheme].name}`, 'info', 2000);
    }
  }

  /**
   * إضافة تأثير انتقال سلس
   */
  addTransitionEffect() {
    document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
    
    // إزالة التأثير بعد الانتقال
    setTimeout(() => {
      document.body.style.transition = '';
    }, 300);
  }

  /**
   * تحديث زر تبديل الثيم
   */
  updateThemeToggleButton() {
    const toggleButton = document.getElementById('themeToggle');
    if (toggleButton) {
      const theme = this.themes[this.currentTheme];
      const oppositeTheme = this.currentTheme === 'light' ? 'dark' : 'light';
      
      toggleButton.innerHTML = `
        <i class="fas fa-${this.currentTheme === 'light' ? 'moon' : 'sun'}"></i>
        <span class="d-none d-md-inline ms-2">${this.themes[oppositeTheme].name}</span>
      `;
      
      toggleButton.title = `التبديل إلى الوضع ${this.themes[oppositeTheme].name}`;
    }
  }

  /**
   * إعداد مستمع تغيير ثيم النظام
   */
  setupSystemThemeListener() {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    mediaQuery.addListener((e) => {
      // تطبيق تفضيل النظام فقط إذا لم يختر المستخدم ثيماً يدوياً
      const savedTheme = localStorage.getItem('app-theme');
      if (!savedTheme) {
        const systemTheme = e.matches ? 'dark' : 'light';
        this.applyTheme(systemTheme);
        console.log(`🔄 System theme changed to: ${systemTheme}`);
      }
    });
  }

  /**
   * إرسال حدث تغيير الثيم
   */
  dispatchThemeChangeEvent(themeName) {
    const event = new CustomEvent('themeChanged', {
      detail: {
        theme: themeName,
        colors: this.themes[themeName].colors
      }
    });
    
    window.dispatchEvent(event);
  }

  /**
   * الحصول على الثيم الحالي
   */
  getCurrentTheme() {
    return {
      name: this.currentTheme,
      ...this.themes[this.currentTheme]
    };
  }

  /**
   * إضافة ثيم مخصص
   */
  addCustomTheme(name, themeData) {
    this.themes[name] = themeData;
    console.log(`➕ Custom theme added: ${name}`);
  }
}

// إنشاء مدير الثيمات العام
const themeManager = new ThemeManager();

/**
 * دوال مساعدة للاستخدام في التطبيق
 */

// تبديل الثيم
window.toggleTheme = () => themeManager.toggleTheme();

// تطبيق ثيم محدد
window.setTheme = (themeName) => {
  themeManager.applyTheme(themeName);
  themeManager.saveTheme(themeName);
};

// الحصول على الثيم الحالي
window.getCurrentTheme = () => themeManager.getCurrentTheme();

// إضافة زر التبديل إلى الواجهة
function createThemeToggleButton() {
  // البحث عن مكان مناسب لإضافة الزر
  const navbar = document.querySelector('.navbar') || document.querySelector('.header-bar');
  
  if (navbar) {
    const toggleButton = document.createElement('button');
    toggleButton.id = 'themeToggle';
    toggleButton.className = 'btn btn-outline-secondary btn-sm ms-2';
    toggleButton.onclick = () => themeManager.toggleTheme();
    
    // إضافة الزر للشريط العلوي
    navbar.appendChild(toggleButton);
    
    // تحديث محتوى الزر
    themeManager.updateThemeToggleButton();
    
    console.log('🎨 Theme toggle button created');
  }
}

// إضافة أنماط CSS للثيمات
function injectThemeStyles() {
  const style = document.createElement('style');
  style.id = 'theme-styles';
  style.textContent = `
    /* متغيرات الألوان */
    :root {
      --color-primary: #007bff;
      --color-secondary: #6c757d;
      --color-success: #28a745;
      --color-danger: #dc3545;
      --color-warning: #ffc107;
      --color-info: #17a2b8;
      --color-light: #f8f9fa;
      --color-dark: #343a40;
      --color-background: #ffffff;
      --color-surface: #f5f7fa;
      --color-on-background: #212529;
      --color-on-surface: #495057;
    }

    /* الوضع الفاتح */
    .light-theme {
      background-color: var(--color-background);
      color: var(--color-on-background);
    }

    .light-theme .sidebar {
      background: linear-gradient(135deg, var(--color-primary), #0056b3);
      color: white;
    }

    .light-theme .section-content {
      background: var(--color-surface);
      border: 1px solid #dee2e6;
    }

    .light-theme .card {
      background: var(--color-background);
      border-color: #dee2e6;
    }

    .light-theme .data-table th {
      background: var(--color-light);
      color: var(--color-on-background);
    }

    .light-theme .form-control {
      background: var(--color-background);
      border-color: #ced4da;
      color: var(--color-on-background);
    }

    /* الوضع المظلم */
    .dark-theme {
      background-color: var(--color-background);
      color: var(--color-on-background);
    }

    .dark-theme .sidebar {
      background: linear-gradient(135deg, #1a1a1a, #2d2d2d);
      color: #ffffff;
      border-right: 1px solid #404040;
    }

    .dark-theme .section-content {
      background: var(--color-surface);
      border: 1px solid #404040;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
    }

    .dark-theme .card {
      background: var(--color-surface);
      border-color: #404040;
      color: var(--color-on-surface);
    }

    .dark-theme .card-header {
      background: #2a2a2a;
      border-bottom-color: #404040;
      color: var(--color-on-surface);
    }

    .dark-theme .data-table th {
      background: #2a2a2a;
      color: var(--color-on-surface);
      border-color: #404040;
    }

    .dark-theme .data-table td {
      border-color: #404040;
      color: var(--color-on-surface);
    }

    .dark-theme .form-control {
      background: #2a2a2a;
      border-color: #404040;
      color: var(--color-on-surface);
    }

    .dark-theme .form-control:focus {
      background: #333333;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
    }

    .dark-theme .btn-outline-secondary {
      color: #adb5bd;
      border-color: #6c757d;
    }

    .dark-theme .btn-outline-secondary:hover {
      background: #6c757d;
      color: white;
    }

    .dark-theme .modal-content {
      background: var(--color-surface);
      color: var(--color-on-surface);
    }

    .dark-theme .modal-header {
      border-bottom-color: #404040;
    }

    .dark-theme .modal-footer {
      border-top-color: #404040;
    }

    .dark-theme .nav-link {
      color: rgba(255, 255, 255, 0.75) !important;
    }

    .dark-theme .nav-link:hover,
    .dark-theme .nav-link.active {
      color: white !important;
      background: rgba(255, 255, 255, 0.1);
    }

    .dark-theme .stat-box {
      background: var(--color-surface);
      border: 1px solid #404040;
    }

    .dark-theme .notification-toast {
      background: var(--color-surface);
      color: var(--color-on-surface);
      border: 1px solid #404040;
    }

    /* تأثيرات الانتقال */
    .theme-transition * {
      transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease !important;
    }

    /* زر تبديل الثيم */
    #themeToggle {
      position: relative;
      overflow: hidden;
    }

    #themeToggle::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      transition: width 0.3s ease, height 0.3s ease;
    }

    #themeToggle:hover::before {
      width: 100px;
      height: 100px;
    }

    /* تحسينات للطباعة */
    @media print {
      .dark-theme {
        background: white !important;
        color: black !important;
      }
      
      .dark-theme .section-content,
      .dark-theme .card {
        background: white !important;
        color: black !important;
        border-color: #dee2e6 !important;
      }
    }

    /* تحسينات للشاشات عالية التباين */
    @media (prefers-contrast: high) {
      .dark-theme {
        --color-background: #000000;
        --color-on-background: #ffffff;
      }
      
      .light-theme {
        --color-background: #ffffff;
        --color-on-background: #000000;
      }
    }
  `;
  
  document.head.appendChild(style);
  console.log('🎨 Theme styles injected');
}

// تهيئة النظام عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
  // إضافة الأنماط
  injectThemeStyles();
  
  // إنشاء زر التبديل
  createThemeToggleButton();
  
  // إضافة فئة الانتقال للتأثيرات السلسة
  document.body.classList.add('theme-transition');
  
  console.log('🎨 Theme system initialized');
});

// مستمع لحدث تغيير الثيم
window.addEventListener('themeChanged', (event) => {
  console.log(`🎨 Theme changed to: ${event.detail.theme}`);
  
  // يمكن إضافة منطق إضافي هنا
  // مثل تحديث الرسوم البيانية أو الخرائط
});

// تصدير للاستخدام العام
window.themeManager = themeManager;

console.log('🎨 Theme Manager loaded successfully');