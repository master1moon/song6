/**
 * مدير الرسوم المتحركة السلسة
 * يوفر تأثيرات حركية متقدمة وسلسة للتطبيق
 */

class AnimationManager {
  constructor() {
    this.animationsEnabled = true;
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.currentAnimations = new Map();
    this.animationQueue = [];
    
    this.easing = {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
    };
    
    this.init();
  }

  /**
   * تهيئة مدير الرسوم المتحركة
   */
  init() {
    this.injectAnimationStyles();
    this.setupReducedMotionListener();
    this.setupIntersectionObserver();
    this.addGlobalAnimations();
    
    console.log('✨ Animation Manager initialized');
  }

  /**
   * إضافة أنماط الرسوم المتحركة
   */
  injectAnimationStyles() {
    const style = document.createElement('style');
    style.id = 'animation-styles';
    style.textContent = `
      /* ===== الرسوم المتحركة الأساسية ===== */
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
      }
      
      @keyframes slideInUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      @keyframes slideInDown {
        from {
          opacity: 0;
          transform: translateY(-30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      @keyframes slideInRight {
        from {
          opacity: 0;
          transform: translateX(30px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      
      @keyframes slideInLeft {
        from {
          opacity: 0;
          transform: translateX(-30px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      
      @keyframes scaleIn {
        from {
          opacity: 0;
          transform: scale(0.8);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }
      
      @keyframes bounce {
        0%, 20%, 53%, 80%, 100% {
          transform: translate3d(0, 0, 0);
        }
        40%, 43% {
          transform: translate3d(0, -30px, 0);
        }
        70% {
          transform: translate3d(0, -15px, 0);
        }
        90% {
          transform: translate3d(0, -4px, 0);
        }
      }
      
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }
      
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
      }
      
      @keyframes ripple {
        0% {
          transform: scale(0);
          opacity: 1;
        }
        100% {
          transform: scale(4);
          opacity: 0;
        }
      }
      
      @keyframes loading {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      @keyframes progress {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
      
      /* ===== فئات الرسوم المتحركة ===== */
      .animate-fade-in {
        animation: fadeIn 0.3s ${this.easing.easeOut} forwards;
      }
      
      .animate-fade-out {
        animation: fadeOut 0.3s ${this.easing.easeIn} forwards;
      }
      
      .animate-slide-in-up {
        animation: slideInUp 0.4s ${this.easing.easeOut} forwards;
      }
      
      .animate-slide-in-down {
        animation: slideInDown 0.4s ${this.easing.easeOut} forwards;
      }
      
      .animate-slide-in-right {
        animation: slideInRight 0.4s ${this.easing.easeOut} forwards;
      }
      
      .animate-slide-in-left {
        animation: slideInLeft 0.4s ${this.easing.easeOut} forwards;
      }
      
      .animate-scale-in {
        animation: scaleIn 0.3s ${this.easing.bounce} forwards;
      }
      
      .animate-bounce {
        animation: bounce 0.6s ${this.easing.easeOut};
      }
      
      .animate-pulse {
        animation: pulse 1s infinite;
      }
      
      .animate-shake {
        animation: shake 0.5s ${this.easing.easeInOut};
      }
      
      /* ===== تأثيرات التمرير ===== */
      .hover-lift {
        transition: transform 0.3s ${this.easing.easeOut}, box-shadow 0.3s ${this.easing.easeOut};
      }
      
      .hover-lift:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 25px rgba(0,0,0,0.15);
      }
      
      .hover-scale {
        transition: transform 0.2s ${this.easing.easeOut};
      }
      
      .hover-scale:hover {
        transform: scale(1.05);
      }
      
      .hover-glow {
        transition: box-shadow 0.3s ${this.easing.easeOut};
      }
      
      .hover-glow:hover {
        box-shadow: 0 0 20px rgba(0, 123, 255, 0.3);
      }
      
      /* ===== تأثيرات الأزرار ===== */
      .btn-animated {
        position: relative;
        overflow: hidden;
        transition: all 0.3s ${this.easing.easeOut};
      }
      
      .btn-animated::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 50%;
        transform: translate(-50%, -50%);
        transition: width 0.6s, height 0.6s;
      }
      
      .btn-animated:hover::before {
        width: 300px;
        height: 300px;
      }
      
      .btn-ripple {
        position: relative;
        overflow: hidden;
      }
      
      .btn-ripple .ripple-effect {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        animation: ripple 0.6s linear;
        pointer-events: none;
      }
      
      /* ===== تأثيرات النماذج ===== */
      .form-group-animated .form-control {
        transition: border-color 0.3s ${this.easing.easeOut}, box-shadow 0.3s ${this.easing.easeOut};
      }
      
      .form-group-animated .form-control:focus {
        border-color: #007bff;
        box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
      }
      
      /* ===== تأثيرات الكروت ===== */
      .card-animated {
        transition: all 0.3s ${this.easing.easeOut};
      }
      
      .card-animated:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      }
      
      /* ===== تأثيرات القوائم ===== */
      .list-item-animated {
        transition: all 0.2s ${this.easing.easeOut};
      }
      
      .list-item-animated:hover {
        background: rgba(0, 123, 255, 0.05);
        transform: translateX(5px);
      }
      
      /* ===== تأثيرات التحميل ===== */
      .loading-spinner {
        width: 20px;
        height: 20px;
        border: 2px solid #f3f3f3;
        border-top: 2px solid #007bff;
        border-radius: 50%;
        animation: loading 1s linear infinite;
      }
      
      .loading-bar {
        width: 100%;
        height: 4px;
        background: #f3f3f3;
        border-radius: 2px;
        overflow: hidden;
        position: relative;
      }
      
      .loading-bar::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: 50%;
        background: linear-gradient(90deg, transparent, #007bff, transparent);
        animation: progress 1.5s infinite;
      }
      
      /* ===== تأثيرات الإشعارات ===== */
      .notification-enter {
        animation: slideInRight 0.3s ${this.easing.easeOut} forwards;
      }
      
      .notification-exit {
        animation: slideInRight 0.3s ${this.easing.easeIn} reverse forwards;
      }
      
      /* ===== تأثيرات المودال ===== */
      .modal.fade .modal-dialog {
        transition: transform 0.3s ${this.easing.easeOut};
        transform: scale(0.8);
      }
      
      .modal.show .modal-dialog {
        transform: scale(1);
      }
      
      /* ===== تحسينات الأداء ===== */
      .will-animate {
        will-change: transform, opacity;
      }
      
      .gpu-accelerated {
        transform: translateZ(0);
        backface-visibility: hidden;
        perspective: 1000px;
      }
      
      /* ===== إعدادات الحركة المحدودة ===== */
      @media (prefers-reduced-motion: reduce) {
        *,
        *::before,
        *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
          scroll-behavior: auto !important;
        }
      }
    `;
    
    document.head.appendChild(style);
  }

  /**
   * إعداد مستمع الحركة المحدودة
   */
  setupReducedMotionListener() {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleChange = (e) => {
      this.reducedMotion = e.matches;
      this.animationsEnabled = !e.matches;
      
      document.body.classList.toggle('reduced-motion', e.matches);
      
      console.log(`✨ Animations ${this.animationsEnabled ? 'enabled' : 'disabled'} (reduced motion: ${this.reducedMotion})`);
    };
    
    mediaQuery.addListener(handleChange);
    handleChange(mediaQuery);
  }

  /**
   * إعداد مراقب التقاطع للرسوم المتحركة عند التمرير
   */
  setupIntersectionObserver() {
    if (!('IntersectionObserver' in window)) return;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animateOnScroll(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '50px'
    });
    
    // مراقبة العناصر القابلة للتحريك
    const animatableElements = document.querySelectorAll('[data-animate-on-scroll]');
    animatableElements.forEach(el => observer.observe(el));
    
    this.scrollObserver = observer;
  }

  /**
   * تحريك العناصر عند التمرير
   */
  animateOnScroll(element) {
    const animationType = element.getAttribute('data-animate-on-scroll') || 'fade-in';
    this.animate(element, animationType);
  }

  /**
   * إضافة الرسوم المتحركة العامة
   */
  addGlobalAnimations() {
    // تحريك الكروت مع تأخير متدرج
    const cards = document.querySelectorAll('.card, .section-content, .stat-box');
    cards.forEach((card, index) => {
      card.classList.add('card-animated', 'hover-lift');
      
      // تأثير الظهور المتدرج
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      
      setTimeout(() => {
        card.style.transition = 'all 0.4s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, index * 100);
    });
    
    // تحريك الأزرار
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(btn => {
      btn.classList.add('btn-animated', 'hover-scale');
      this.addRippleEffect(btn);
    });
    
    // تحريك عناصر القائمة الجانبية
    const navLinks = document.querySelectorAll('.sidebar .nav-link');
    navLinks.forEach((link, index) => {
      link.classList.add('list-item-animated');
      
      // تأثير الظهور المتدرج للقائمة
      link.style.opacity = '0';
      link.style.transform = 'translateX(-20px)';
      
      setTimeout(() => {
        link.style.transition = 'all 0.3s ease';
        link.style.opacity = '1';
        link.style.transform = 'translateX(0)';
      }, index * 50 + 200);
    });
    
    // تحريك حقول النماذج
    const formGroups = document.querySelectorAll('.form-group');
    formGroups.forEach(group => {
      group.classList.add('form-group-animated');
    });
    
    // تحريك عناصر القوائم
    const listItems = document.querySelectorAll('.list-group-item');
    listItems.forEach(item => {
      item.classList.add('list-item-animated', 'hover-lift');
    });
    
    // تحريك الجداول
    const tables = document.querySelectorAll('.table');
    tables.forEach(table => {
      table.classList.add('table-animated');
      
      // تحريك الصفوف عند التحميل
      const rows = table.querySelectorAll('tbody tr');
      rows.forEach((row, index) => {
        row.style.opacity = '0';
        row.style.transform = 'translateX(20px)';
        
        setTimeout(() => {
          row.style.transition = 'all 0.3s ease';
          row.style.opacity = '1';
          row.style.transform = 'translateX(0)';
        }, index * 30);
      });
    });
    
    // تحريك الإحصائيات
    this.animateCounters();
  }

  /**
   * تحريك العدادات الرقمية
   */
  animateCounters() {
    const counters = document.querySelectorAll('.stat-value, [data-animate-counter]');
    
    counters.forEach((counter, index) => {
      const targetValue = parseInt(counter.textContent.replace(/[^\d]/g, '')) || 0;
      
      if (targetValue > 0) {
        // إعادة تعيين القيمة إلى الصفر
        counter.textContent = '0';
        
        // بدء التحريك بعد تأخير
        setTimeout(() => {
          this.animateCounter(counter, targetValue, 1500);
        }, index * 200 + 500);
      }
    });
  }

  /**
   * إضافة تأثير الموجة للأزرار
   */
  addRippleEffect(button) {
    button.classList.add('btn-ripple');
    
    button.addEventListener('click', (e) => {
      if (!this.animationsEnabled) return;
      
      const ripple = document.createElement('span');
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      
      ripple.className = 'ripple-effect';
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';
      
      button.appendChild(ripple);
      
      // إزالة التأثير بعد الانتهاء
      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  }

  /**
   * تحريك عنصر بتأثير محدد
   */
  animate(element, animationType, options = {}) {
    if (!this.animationsEnabled) return Promise.resolve();
    
    const {
      duration = 300,
      delay = 0,
      easing = 'easeOut',
      onComplete = null
    } = options;
    
    return new Promise((resolve) => {
      // إضافة تحسينات الأداء
      element.classList.add('will-animate', 'gpu-accelerated');
      
      setTimeout(() => {
        element.classList.add(`animate-${animationType}`);
        
        const animationEnd = () => {
          element.classList.remove(`animate-${animationType}`, 'will-animate', 'gpu-accelerated');
          element.removeEventListener('animationend', animationEnd);
          
          if (onComplete) onComplete();
          resolve();
        };
        
        element.addEventListener('animationend', animationEnd);
      }, delay);
    });
  }

  /**
   * تأثير الظهور التدريجي للعناصر
   */
  staggeredAnimation(elements, animationType = 'fade-in', staggerDelay = 100) {
    if (!this.animationsEnabled) return Promise.resolve();
    
    const promises = [];
    
    elements.forEach((element, index) => {
      const promise = this.animate(element, animationType, {
        delay: index * staggerDelay
      });
      promises.push(promise);
    });
    
    return Promise.all(promises);
  }

  /**
   * تحريك الإشعارات
   */
  animateNotification(notification, type = 'enter') {
    if (!this.animationsEnabled) {
      if (type === 'enter') {
        notification.style.display = 'block';
      } else {
        notification.style.display = 'none';
      }
      return Promise.resolve();
    }
    
    if (type === 'enter') {
      notification.classList.add('notification-enter');
      return new Promise(resolve => {
        notification.addEventListener('animationend', () => {
          notification.classList.remove('notification-enter');
          resolve();
        }, { once: true });
      });
    } else {
      notification.classList.add('notification-exit');
      return new Promise(resolve => {
        notification.addEventListener('animationend', () => {
          notification.style.display = 'none';
          notification.classList.remove('notification-exit');
          resolve();
        }, { once: true });
      });
    }
  }

  /**
   * تحريك تبديل الثيم
   */
  animateThemeTransition() {
    if (!this.animationsEnabled) return Promise.resolve();
    
    document.body.style.transition = 'all 0.3s ease';
    
    return new Promise(resolve => {
      setTimeout(() => {
        document.body.style.transition = '';
        resolve();
      }, 300);
    });
  }

  /**
   * تحريك تحميل البيانات
   */
  showLoadingAnimation(container, message = 'جاري التحميل...') {
    if (!container) return;
    
    const loadingHTML = `
      <div class="loading-container" style="text-align: center; padding: 2rem;">
        <div class="loading-spinner" style="margin: 0 auto 1rem;"></div>
        <div class="loading-message">${message}</div>
      </div>
    `;
    
    container.innerHTML = loadingHTML;
    
    if (this.animationsEnabled) {
      const loadingContainer = container.querySelector('.loading-container');
      this.animate(loadingContainer, 'fade-in');
    }
  }

  /**
   * إخفاء تحريك التحميل
   */
  hideLoadingAnimation(container) {
    const loadingContainer = container.querySelector('.loading-container');
    
    if (loadingContainer) {
      if (this.animationsEnabled) {
        this.animate(loadingContainer, 'fade-out').then(() => {
          loadingContainer.remove();
        });
      } else {
        loadingContainer.remove();
      }
    }
  }

  /**
   * تحريك ظهور المودال
   */
  animateModal(modal, show = true) {
    if (!this.animationsEnabled) return Promise.resolve();
    
    const dialog = modal.querySelector('.modal-dialog');
    
    if (show) {
      modal.style.display = 'block';
      modal.classList.add('fade', 'show');
      
      return this.animate(dialog, 'scale-in');
    } else {
      return this.animate(dialog, 'fade-out').then(() => {
        modal.classList.remove('fade', 'show');
        modal.style.display = 'none';
      });
    }
  }

  /**
   * تحريك العداد التصاعدي
   */
  animateCounter(element, targetValue, duration = 1000) {
    if (!this.animationsEnabled) {
      element.textContent = targetValue;
      return Promise.resolve();
    }
    
    const startValue = parseInt(element.textContent) || 0;
    const increment = (targetValue - startValue) / (duration / 16); // 60 FPS
    
    let currentValue = startValue;
    
    return new Promise(resolve => {
      const updateCounter = () => {
        currentValue += increment;
        
        if ((increment > 0 && currentValue >= targetValue) || 
            (increment < 0 && currentValue <= targetValue)) {
          element.textContent = targetValue;
          resolve();
        } else {
          element.textContent = Math.floor(currentValue);
          requestAnimationFrame(updateCounter);
        }
      };
      
      updateCounter();
    });
  }

  /**
   * تحريك شريط التقدم
   */
  animateProgressBar(progressBar, targetPercent, duration = 500) {
    if (!this.animationsEnabled) {
      progressBar.style.width = `${targetPercent}%`;
      return Promise.resolve();
    }
    
    const startPercent = parseFloat(progressBar.style.width) || 0;
    const increment = (targetPercent - startPercent) / (duration / 16);
    
    let currentPercent = startPercent;
    
    return new Promise(resolve => {
      const updateProgress = () => {
        currentPercent += increment;
        
        if ((increment > 0 && currentPercent >= targetPercent) || 
            (increment < 0 && currentPercent <= targetPercent)) {
          progressBar.style.width = `${targetPercent}%`;
          resolve();
        } else {
          progressBar.style.width = `${currentPercent}%`;
          requestAnimationFrame(updateProgress);
        }
      };
      
      updateProgress();
    });
  }

  /**
   * تفعيل/تعطيل الرسوم المتحركة
   */
  toggleAnimations(enabled = null) {
    if (enabled !== null) {
      this.animationsEnabled = enabled && !this.reducedMotion;
    } else {
      this.animationsEnabled = !this.animationsEnabled;
    }
    
    document.body.classList.toggle('animations-disabled', !this.animationsEnabled);
    
    console.log(`✨ Animations ${this.animationsEnabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * الحصول على حالة الرسوم المتحركة
   */
  getAnimationInfo() {
    return {
      enabled: this.animationsEnabled,
      reducedMotion: this.reducedMotion,
      activeAnimations: this.currentAnimations.size,
      queuedAnimations: this.animationQueue.length
    };
  }
}

// إنشاء مدير الرسوم المتحركة العام
const animationManager = new AnimationManager();

// دوال مساعدة للاستخدام العام
window.animate = (element, type, options) => animationManager.animate(element, type, options);
window.staggeredAnimation = (elements, type, delay) => animationManager.staggeredAnimation(elements, type, delay);
window.animateNotification = (notification, type) => animationManager.animateNotification(notification, type);
window.showLoadingAnimation = (container, message) => animationManager.showLoadingAnimation(container, message);
window.hideLoadingAnimation = (container) => animationManager.hideLoadingAnimation(container);
window.animateCounter = (element, value, duration) => animationManager.animateCounter(element, value, duration);
window.toggleAnimations = (enabled) => animationManager.toggleAnimations(enabled);

// تصدير للاستخدام العام
window.animationManager = animationManager;

console.log('✨ Animation Manager loaded successfully');