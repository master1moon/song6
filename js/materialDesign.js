/**
 * مدير Material Design
 * يطبق مبادئ وعناصر Material Design على التطبيق
 */

class MaterialDesignManager {
  constructor() {
    this.rippleColor = 'rgba(255, 255, 255, 0.3)';
    this.activeDropdowns = new Set();
    this.activeSnackbars = new Set();
    
    this.init();
  }

  /**
   * تهيئة Material Design
   */
  init() {
    this.convertExistingElements();
    this.setupRippleEffects();
    this.setupDropdowns();
    this.setupTabs();
    this.setupSwitches();
    
    console.log('🎨 Material Design Manager initialized');
  }

  /**
   * تحويل العناصر الموجودة إلى Material Design
   */
  convertExistingElements() {
    // تحويل الأزرار
    const buttons = document.querySelectorAll('.btn:not(.btn-material)');
    buttons.forEach(btn => {
      btn.classList.add('btn-material');
      
      // تحديد نوع الزر بناءً على الفئات الموجودة
      if (btn.classList.contains('btn-primary')) {
        btn.classList.add('btn-primary');
      } else if (btn.classList.contains('btn-outline-primary')) {
        btn.classList.add('btn-outlined');
      } else {
        btn.classList.add('btn-text');
      }
    });

    // تحويل الكروت
    const cards = document.querySelectorAll('.card:not(.card-material)');
    cards.forEach(card => {
      card.classList.add('card-material');
      
      // تحويل رأس الكرت
      const header = card.querySelector('.card-header');
      if (header) {
        header.classList.add('card-material-header');
      }
      
      // تحويل محتوى الكرت
      const body = card.querySelector('.card-body');
      if (body) {
        body.classList.add('card-material-content');
      }
      
      // تحويل أزرار الكرت
      const actions = card.querySelector('.card-footer, .card-actions');
      if (actions) {
        actions.classList.add('card-material-actions');
      }
    });

    // تحويل حقول الإدخال
    const formGroups = document.querySelectorAll('.form-group:not(.input-material)');
    formGroups.forEach(group => {
      this.convertToMaterialInput(group);
    });

    // تحويل القوائم
    const lists = document.querySelectorAll('.list-group:not(.list-material)');
    lists.forEach(list => {
      list.classList.add('list-material');
      
      const items = list.querySelectorAll('.list-group-item');
      items.forEach(item => {
        item.classList.add('list-item-material');
      });
    });
  }

  /**
   * تحويل حقل إدخال إلى Material Design
   */
  convertToMaterialInput(formGroup) {
    formGroup.classList.add('input-material');
    
    const input = formGroup.querySelector('input, textarea, select');
    const label = formGroup.querySelector('label');
    
    if (input && label) {
      // إعادة ترتيب العناصر
      input.parentNode.appendChild(label);
      
      // إضافة placeholder فارغ لتفعيل تأثير التحريك
      if (!input.placeholder) {
        input.placeholder = ' ';
      }
    }
  }

  /**
   * إعداد تأثيرات الموجة (Ripple)
   */
  setupRippleEffects() {
    const rippleElements = document.querySelectorAll('.btn-material, .list-item-material, .chip-material');
    
    rippleElements.forEach(element => {
      element.addEventListener('click', (e) => {
        this.createRipple(e, element);
      });
    });
  }

  /**
   * إنشاء تأثير الموجة
   */
  createRipple(event, element) {
    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      background: ${this.rippleColor};
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      animation: ripple 0.6s linear;
      pointer-events: none;
      z-index: 1;
    `;
    
    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(ripple);
    
    // إزالة التأثير بعد الانتهاء
    setTimeout(() => {
      ripple.remove();
    }, 600);
  }

  /**
   * إعداد القوائم المنسدلة
   */
  setupDropdowns() {
    const dropdowns = document.querySelectorAll('.dropdown-material');
    
    dropdowns.forEach(dropdown => {
      const trigger = dropdown.querySelector('[data-dropdown-trigger]');
      const content = dropdown.querySelector('.dropdown-material-content');
      
      if (trigger && content) {
        trigger.addEventListener('click', (e) => {
          e.stopPropagation();
          this.toggleDropdown(dropdown);
        });
      }
    });
    
    // إغلاق القوائم عند النقر خارجها
    document.addEventListener('click', () => {
      this.closeAllDropdowns();
    });
  }

  /**
   * تبديل القائمة المنسدلة
   */
  toggleDropdown(dropdown) {
    const isActive = dropdown.classList.contains('active');
    
    // إغلاق جميع القوائم الأخرى
    this.closeAllDropdowns();
    
    if (!isActive) {
      dropdown.classList.add('active');
      this.activeDropdowns.add(dropdown);
    }
  }

  /**
   * إغلاق جميع القوائم المنسدلة
   */
  closeAllDropdowns() {
    this.activeDropdowns.forEach(dropdown => {
      dropdown.classList.remove('active');
    });
    this.activeDropdowns.clear();
  }

  /**
   * إعداد التبويبات
   */
  setupTabs() {
    const tabContainers = document.querySelectorAll('.tabs-material');
    
    tabContainers.forEach(container => {
      const tabs = container.querySelectorAll('.tab-material');
      
      tabs.forEach(tab => {
        tab.addEventListener('click', () => {
          this.switchTab(container, tab);
        });
      });
    });
  }

  /**
   * تبديل التبويب
   */
  switchTab(container, activeTab) {
    // إزالة الحالة النشطة من جميع التبويبات
    const tabs = container.querySelectorAll('.tab-material');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // تفعيل التبويب المختار
    activeTab.classList.add('active');
    
    // إرسال حدث تغيير التبويب
    const event = new CustomEvent('tabChanged', {
      detail: {
        tab: activeTab,
        tabId: activeTab.getAttribute('data-tab'),
        container: container
      }
    });
    
    container.dispatchEvent(event);
  }

  /**
   * إعداد المفاتيح
   */
  setupSwitches() {
    const switches = document.querySelectorAll('.switch-material input');
    
    switches.forEach(switchInput => {
      switchInput.addEventListener('change', (e) => {
        this.onSwitchChange(e.target);
      });
    });
  }

  /**
   * معالجة تغيير المفتاح
   */
  onSwitchChange(switchInput) {
    const event = new CustomEvent('switchChanged', {
      detail: {
        checked: switchInput.checked,
        value: switchInput.value,
        switch: switchInput
      }
    });
    
    switchInput.dispatchEvent(event);
  }

  /**
   * إنشاء زر عائم (FAB)
   */
  createFAB(options = {}) {
    const {
      icon = 'fas fa-plus',
      position = 'bottom-right',
      size = 'normal',
      color = 'primary',
      onClick = null
    } = options;
    
    const fab = document.createElement('button');
    fab.className = `btn-material btn-fab ${size === 'mini' ? 'btn-fab-mini' : ''}`;
    fab.style.cssText = `
      position: fixed;
      z-index: 1000;
      ${this.getFABPosition(position)}
    `;
    
    fab.innerHTML = `<i class="${icon}"></i>`;
    
    if (onClick) {
      fab.addEventListener('click', onClick);
    }
    
    document.body.appendChild(fab);
    
    // تأثير الظهور
    if (typeof window.animate === 'function') {
      window.animate(fab, 'scale-in');
    }
    
    return fab;
  }

  /**
   * الحصول على موضع الزر العائم
   */
  getFABPosition(position) {
    const positions = {
      'bottom-right': 'bottom: 16px; right: 16px;',
      'bottom-left': 'bottom: 16px; left: 16px;',
      'top-right': 'top: 16px; right: 16px;',
      'top-left': 'top: 16px; left: 16px;'
    };
    
    return positions[position] || positions['bottom-right'];
  }

  /**
   * إظهار Snackbar (إشعار سفلي)
   */
  showSnackbar(message, actionText = null, actionCallback = null, duration = 4000) {
    const snackbar = document.createElement('div');
    snackbar.className = 'snackbar-material';
    
    let snackbarHTML = `<span class="snackbar-message">${message}</span>`;
    
    if (actionText && actionCallback) {
      snackbarHTML += `<button class="snackbar-action" data-action="custom">${actionText}</button>`;
    }
    
    snackbar.innerHTML = snackbarHTML;
    
    // إضافة معالج الحدث للإجراء
    const actionButton = snackbar.querySelector('.snackbar-action[data-action="custom"]');
    if (actionButton && actionCallback) {
      actionButton.addEventListener('click', () => {
        actionCallback();
        this.hideSnackbar(snackbar);
      });
    }
    
    document.body.appendChild(snackbar);
    this.activeSnackbars.add(snackbar);
    
    // إظهار الـ Snackbar
    setTimeout(() => {
      snackbar.classList.add('show');
    }, 10);
    
    // إخفاء تلقائي
    if (duration > 0) {
      setTimeout(() => {
        this.hideSnackbar(snackbar);
      }, duration);
    }
    
    return snackbar;
  }

  /**
   * إخفاء Snackbar
   */
  hideSnackbar(snackbar) {
    snackbar.classList.remove('show');
    this.activeSnackbars.delete(snackbar);
    
    setTimeout(() => {
      if (snackbar.parentNode) {
        snackbar.remove();
      }
    }, 300);
  }

  /**
   * إنشاء رقاقة (Chip)
   */
  createChip(text, options = {}) {
    const {
      icon = null,
      deletable = false,
      selected = false,
      onDelete = null,
      onClick = null
    } = options;
    
    const chip = document.createElement('div');
    chip.className = `chip-material ${selected ? 'chip-selected' : ''}`;
    
    let chipHTML = '';
    
    if (icon) {
      chipHTML += `<i class="chip-icon ${icon}"></i>`;
    }
    
    chipHTML += `<span class="chip-text">${text}</span>`;
    
    if (deletable) {
      chipHTML += `<button class="chip-delete" title="حذف"><i class="fas fa-times"></i></button>`;
    }
    
    chip.innerHTML = chipHTML;
    
    // إضافة معالجات الأحداث
    if (onClick) {
      chip.addEventListener('click', (e) => {
        if (!e.target.closest('.chip-delete')) {
          onClick(chip);
        }
      });
    }
    
    if (deletable && onDelete) {
      const deleteButton = chip.querySelector('.chip-delete');
      deleteButton.addEventListener('click', (e) => {
        e.stopPropagation();
        onDelete(chip);
      });
    }
    
    return chip;
  }

  /**
   * إنشاء شريط تقدم
   */
  createProgressBar(container, options = {}) {
    const {
      value = 0,
      indeterminate = false,
      color = 'primary'
    } = options;
    
    const progress = document.createElement('div');
    progress.className = `progress-material ${indeterminate ? 'indeterminate' : ''}`;
    
    const bar = document.createElement('div');
    bar.className = 'progress-material-bar';
    bar.style.width = indeterminate ? '30%' : `${value}%`;
    
    if (color !== 'primary') {
      bar.style.backgroundColor = `var(--md-${color})`;
    }
    
    progress.appendChild(bar);
    container.appendChild(progress);
    
    return {
      element: progress,
      bar: bar,
      setValue: (newValue) => {
        if (!indeterminate) {
          bar.style.width = `${newValue}%`;
        }
      }
    };
  }

  /**
   * تحويل النماذج إلى Material Design
   */
  convertFormsToMaterial() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
      form.classList.add('form-material');
      
      const formGroups = form.querySelectorAll('.form-group');
      formGroups.forEach(group => {
        this.convertToMaterialInput(group);
      });
    });
  }

  /**
   * تحويل حقل إدخال إلى Material
   */
  convertToMaterialInput(formGroup) {
    if (formGroup.classList.contains('input-material')) return;
    
    formGroup.classList.add('input-material');
    
    const input = formGroup.querySelector('input, textarea, select');
    const label = formGroup.querySelector('label');
    
    if (input && label) {
      // إعادة ترتيب العناصر (input أولاً، ثم label)
      if (input.nextElementSibling !== label) {
        input.parentNode.insertBefore(label, input.nextSibling);
      }
      
      // إضافة placeholder فارغ
      if (!input.placeholder) {
        input.placeholder = ' ';
      }
      
      // إضافة معالج التركيز
      input.addEventListener('focus', () => {
        formGroup.classList.add('focused');
      });
      
      input.addEventListener('blur', () => {
        formGroup.classList.remove('focused');
      });
    }
  }

  /**
   * إنشاء تبويبات Material
   */
  createMaterialTabs(container, tabsData) {
    const tabsContainer = document.createElement('div');
    tabsContainer.className = 'tabs-material';
    
    tabsData.forEach((tabData, index) => {
      const tab = document.createElement('button');
      tab.className = `tab-material ${index === 0 ? 'active' : ''}`;
      tab.textContent = tabData.title;
      tab.setAttribute('data-tab', tabData.id);
      
      if (tabData.onClick) {
        tab.addEventListener('click', () => tabData.onClick(tab));
      }
      
      tabsContainer.appendChild(tab);
    });
    
    container.appendChild(tabsContainer);
    this.setupTabs();
    
    return tabsContainer;
  }

  /**
   * إنشاء مفتاح Material
   */
  createMaterialSwitch(container, options = {}) {
    const {
      id = 'switch_' + Date.now(),
      label = 'مفتاح',
      checked = false,
      onChange = null
    } = options;
    
    const switchContainer = document.createElement('div');
    switchContainer.className = 'form-check form-switch-material';
    
    switchContainer.innerHTML = `
      <label class="switch-material">
        <input type="checkbox" id="${id}" ${checked ? 'checked' : ''}>
        <span class="switch-material-slider"></span>
      </label>
      <label for="${id}" class="form-check-label ms-2">${label}</label>
    `;
    
    const input = switchContainer.querySelector('input');
    if (onChange) {
      input.addEventListener('change', (e) => onChange(e.target.checked));
    }
    
    container.appendChild(switchContainer);
    this.setupSwitches();
    
    return { container: switchContainer, input };
  }

  /**
   * تطبيق Material Design على الجداول
   */
  materializeTable(table) {
    table.classList.add('table-material');
    
    // إضافة تأثيرات الصفوف
    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(row => {
      row.addEventListener('mouseenter', () => {
        row.style.backgroundColor = 'rgba(0, 0, 0, 0.04)';
      });
      
      row.addEventListener('mouseleave', () => {
        row.style.backgroundColor = '';
      });
    });
    
    // تحسين رأس الجدول
    const thead = table.querySelector('thead');
    if (thead) {
      thead.style.backgroundColor = 'var(--md-surface-variant)';
      thead.style.fontWeight = 'var(--md-font-weight-medium)';
    }
  }

  /**
   * إضافة تأثير التحميل Material
   */
  showMaterialLoading(container, message = 'جاري التحميل...') {
    const loading = document.createElement('div');
    loading.className = 'material-loading';
    loading.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--md-spacing-xxl);
      text-align: center;
    `;
    
    loading.innerHTML = `
      <div class="progress-material indeterminate" style="width: 200px; margin-bottom: var(--md-spacing-md);">
        <div class="progress-material-bar"></div>
      </div>
      <p style="color: var(--md-on-surface); margin: 0; font-size: var(--md-text-body2);">${message}</p>
    `;
    
    container.innerHTML = '';
    container.appendChild(loading);
    
    return loading;
  }

  /**
   * إخفاء تأثير التحميل
   */
  hideMaterialLoading(container) {
    const loading = container.querySelector('.material-loading');
    if (loading) {
      if (typeof window.animate === 'function') {
        window.animate(loading, 'fade-out').then(() => {
          loading.remove();
        });
      } else {
        loading.remove();
      }
    }
  }

  /**
   * إضافة تأثير الرفع (Elevation) للعناصر
   */
  addElevation(element, level = 1) {
    element.style.boxShadow = `var(--md-elevation-${Math.min(Math.max(level, 0), 5)})`;
  }

  /**
   * إنشاء بطاقة Material
   */
  createMaterialCard(container, options = {}) {
    const {
      title = '',
      subtitle = '',
      content = '',
      actions = [],
      elevation = 1,
      image = null
    } = options;
    
    const card = document.createElement('div');
    card.className = 'card-material';
    this.addElevation(card, elevation);
    
    let cardHTML = '';
    
    if (image) {
      cardHTML += `<div class="card-material-media"><img src="${image}" alt="${title}" style="width: 100%; height: 200px; object-fit: cover;"></div>`;
    }
    
    if (title || subtitle) {
      cardHTML += `
        <div class="card-material-header">
          ${title ? `<h3 style="margin: 0; font-size: var(--md-text-h6); font-weight: var(--md-font-weight-medium);">${title}</h3>` : ''}
          ${subtitle ? `<p style="margin: 4px 0 0 0; font-size: var(--md-text-body2); color: rgba(0,0,0,0.6);">${subtitle}</p>` : ''}
        </div>
      `;
    }
    
    if (content) {
      cardHTML += `<div class="card-material-content">${content}</div>`;
    }
    
    if (actions.length > 0) {
      cardHTML += `<div class="card-material-actions">`;
      actions.forEach(action => {
        cardHTML += `<button class="btn-material btn-text" onclick="${action.onClick || ''}">${action.text}</button>`;
      });
      cardHTML += `</div>`;
    }
    
    card.innerHTML = cardHTML;
    container.appendChild(card);
    
    // تطبيق تأثيرات Material
    this.setupRippleEffects();
    
    return card;
  }

  /**
   * الحصول على معلومات Material Design
   */
  getMaterialInfo() {
    return {
      activeDropdowns: this.activeDropdowns.size,
      activeSnackbars: this.activeSnackbars.size,
      materialButtons: document.querySelectorAll('.btn-material').length,
      materialCards: document.querySelectorAll('.card-material').length,
      materialInputs: document.querySelectorAll('.input-material').length
    };
  }
}

// إنشاء مدير Material Design العام
const materialManager = new MaterialDesignManager();

// دوال مساعدة للاستخدام العام
window.showSnackbar = (message, actionText, actionCallback, duration) => 
  materialManager.showSnackbar(message, actionText, actionCallback, duration);

window.createFAB = (options) => materialManager.createFAB(options);
window.createMaterialCard = (container, options) => materialManager.createMaterialCard(container, options);
window.createMaterialTabs = (container, tabsData) => materialManager.createMaterialTabs(container, tabsData);
window.showMaterialLoading = (container, message) => materialManager.showMaterialLoading(container, message);
window.hideMaterialLoading = (container) => materialManager.hideMaterialLoading(container);

// تصدير للاستخدام العام
window.materialManager = materialManager;

console.log('🎨 Material Design Manager loaded successfully');