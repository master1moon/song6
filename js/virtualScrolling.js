/**
 * نظام Virtual Scrolling للجداول الكبيرة
 * يعرض فقط الصفوف المرئية لتحسين الأداء
 */

class VirtualScrollTable {
  constructor(containerId, data, options = {}) {
    this.container = document.getElementById(containerId);
    this.data = data;
    this.itemHeight = options.itemHeight || 50; // ارتفاع كل صف
    this.visibleCount = options.visibleCount || Math.ceil(this.container.offsetHeight / this.itemHeight);
    this.renderItem = options.renderItem;
    this.headers = options.headers || [];
    
    this.scrollTop = 0;
    this.startIndex = 0;
    this.endIndex = Math.min(this.visibleCount, this.data.length);
    
    this.init();
  }

  init() {
    // إنشاء هيكل الجدول
    this.container.innerHTML = `
      <div class="virtual-table-wrapper" style="position: relative; height: 400px; overflow: auto;">
        <div class="virtual-table-header">
          <table class="table table-bordered">
            <thead>
              <tr>
                ${this.headers.map(header => `<th>${header}</th>`).join('')}
              </tr>
            </thead>
          </table>
        </div>
        <div class="virtual-table-body" style="height: ${this.data.length * this.itemHeight}px; position: relative;">
          <div class="virtual-table-content" style="position: absolute; top: 0; left: 0; right: 0;">
            <table class="table table-bordered">
              <tbody id="virtualTableBody"></tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    this.wrapper = this.container.querySelector('.virtual-table-wrapper');
    this.tbody = this.container.querySelector('#virtualTableBody');
    
    // إضافة مستمع التمرير
    this.wrapper.addEventListener('scroll', (e) => this.handleScroll(e));
    
    // العرض الأولي
    this.render();
  }

  handleScroll(e) {
    const scrollTop = e.target.scrollTop;
    const startIndex = Math.floor(scrollTop / this.itemHeight);
    const endIndex = Math.min(startIndex + this.visibleCount + 5, this.data.length); // +5 للتخزين المؤقت
    
    if (startIndex !== this.startIndex || endIndex !== this.endIndex) {
      this.startIndex = startIndex;
      this.endIndex = endIndex;
      this.render();
    }
  }

  render() {
    // مسح المحتوى الحالي
    this.tbody.innerHTML = '';
    
    // عرض الصفوف المرئية فقط
    for (let i = this.startIndex; i < this.endIndex; i++) {
      const item = this.data[i];
      const row = this.renderItem(item, i);
      
      // ضبط موضع الصف
      row.style.position = 'absolute';
      row.style.top = `${i * this.itemHeight}px`;
      row.style.left = '0';
      row.style.right = '0';
      row.style.height = `${this.itemHeight}px`;
      
      this.tbody.appendChild(row);
    }
    
    // تحديث موضع المحتوى
    const content = this.container.querySelector('.virtual-table-content');
    content.style.transform = `translateY(${this.startIndex * this.itemHeight}px)`;
  }

  // تحديث البيانات
  updateData(newData) {
    this.data = newData;
    this.endIndex = Math.min(this.visibleCount, this.data.length);
    
    // تحديث ارتفاع الحاوية
    const body = this.container.querySelector('.virtual-table-body');
    body.style.height = `${this.data.length * this.itemHeight}px`;
    
    this.render();
  }
}

// مثال على الاستخدام في التطبيق
function renderPackagesTableWithVirtualScrolling() {
  const virtualTable = new VirtualScrollTable('packagesTable', data.packages, {
    itemHeight: 60,
    headers: ['اسم الباقة', 'سعر القطاعي', 'سعر الجملة', 'سعر الموزع', 'التاريخ', 'إجراءات'],
    renderItem: (pkg, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${pkg.name}</td>
        <td class="currency">${pkg.retailPrice ? formatNumber(pkg.retailPrice) : '-'}</td>
        <td class="currency">${pkg.wholesalePrice ? formatNumber(pkg.wholesalePrice) : '-'}</td>
        <td class="currency">${pkg.distributorPrice ? formatNumber(pkg.distributorPrice) : '-'}</td>
        <td>${pkg.createdAt}</td>
        <td class="action-buttons">
          <button class="btn btn-sm btn-warning" onclick="editPackage('${pkg.id}')">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-sm btn-danger" onclick="deletePackage('${pkg.id}')">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      `;
      return row;
    }
  });
}

// مثال للاستخدام مع بيانات كبيرة
function demonstrateVirtualScrolling() {
  // محاكاة 10,000 باقة
  const largePakagesData = [];
  for (let i = 1; i <= 10000; i++) {
    largePakagesData.push({
      id: `pkg_${i}`,
      name: `باقة رقم ${i}`,
      retailPrice: Math.floor(Math.random() * 1000) + 100,
      wholesalePrice: Math.floor(Math.random() * 800) + 80,
      distributorPrice: Math.floor(Math.random() * 600) + 60,
      createdAt: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toLocaleDateString('ar')
    });
  }

  console.log('عرض 10,000 باقة باستخدام Virtual Scrolling...');
  
  const startTime = performance.now();
  
  const virtualTable = new VirtualScrollTable('packagesTable', largePakagesData, {
    itemHeight: 60,
    headers: ['اسم الباقة', 'سعر القطاعي', 'سعر الجملة', 'سعر الموزع', 'التاريخ', 'إجراءات'],
    renderItem: (pkg, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${pkg.name}</td>
        <td class="currency">${formatNumber(pkg.retailPrice)}</td>
        <td class="currency">${formatNumber(pkg.wholesalePrice)}</td>
        <td class="currency">${formatNumber(pkg.distributorPrice)}</td>
        <td>${pkg.createdAt}</td>
        <td class="action-buttons">
          <button class="btn btn-sm btn-warning">تعديل</button>
          <button class="btn btn-sm btn-danger">حذف</button>
        </td>
      `;
      return row;
    }
  });
  
  const endTime = performance.now();
  console.log(`تم العرض في ${endTime - startTime}ms - يعرض فقط ${virtualTable.visibleCount} صف في DOM!`);
}