/**
 * ملف sales.js - نظام إدارة المبيعات
 * يتعامل مع إضافة، تعديل، وحذف المبيعات
 * يدعم نوعين من المبيعات: باقات ومبالغ مخصصة
 * يتكامل مع نظام المخزون لخصم الكميات المباعة
 * 
 * المشاكل المحتملة:
 * - دالة cleanupModalBackdrops غير موجودة
 * - لا يوجد تحقق كافي من توفر الكمية قبل البيع
 * - حذف البيع لا يعيد الكمية للمخزون تلقائياً
 * - معالجة أحداث change متكررة قد تسبب تسرب ذاكرة
 * - لا يوجد تحقق من صحة البيانات قبل الحفظ
 * - لا يوجد تسجيل للعمليات (audit log)
 */

// إدارة المبيعات

/**
 * فتح نموذج إضافة بيع جديد
 * يملأ قائمة الباقات من البيانات المتاحة
 * يسمح باختيار باقة أو إدخال مبلغ مخصص
 * يتعامل مع الحقول المختلفة بناءً على نوع البيع
 * مشكلة: إضافة مستمع أحداث جديد في كل مرة قد يسبب تكرار
 * @param {string} storeId - معرف المحل الذي سيتم إضافة البيع له
 */
/**
 * ملاحظة: الدالة addSale — وصف تلقائي موجز لوظيفتها.
 * المدخلات: storeId
 * المخرجات: راجع التنفيذ
 */
/**
 * ملاحظة: الدالة addSale — وصف تلقائي موجز لوظيفتها.
 * المدخلات: storeId
 * المخرجات: راجع التنفيذ
 */
function addSale(storeId) {
  const select = document.getElementById('salePackage');
  select.innerHTML = '';
  select.innerHTML = '<option value="">اختر الباقة</option>';
  select.innerHTML += '<option value="custom">مخصص (مبلغ مباشر)</option>';
  data.packages.forEach(pkg => { const option = document.createElement('option'); option.value = pkg.id; option.textContent = pkg.name; select.appendChild(option); });
  select.addEventListener('change', function () {
    const isCustom = this.value === 'custom';
    document.getElementById('customReasonGroup').style.display = isCustom ? 'block' : 'none';
    document.getElementById('quantityGroup').style.display = isCustom ? 'none' : 'block';
    document.getElementById('amountGroup').style.display = isCustom ? 'block' : 'none';
    if (isCustom) { document.getElementById('saleReason').value = ''; document.getElementById('saleAmount').value = ''; }
    else { document.getElementById('saleQuantity').value = ''; }
  });
  document.getElementById('saleModalTitle').textContent = 'إضافة بيع';
  document.getElementById('saleId').value = '';
  document.getElementById('saleStoreId').value = storeId;
  document.getElementById('saleReason').value = '';
  document.getElementById('saleQuantity').value = '';
  document.getElementById('saleAmount').value = '';
  document.getElementById('saleDate').value = getTodayDate();
  document.getElementById('customReasonGroup').style.display = 'none';
  document.getElementById('amountGroup').style.display = 'none';
  const modal = new bootstrap.Modal(document.getElementById('saleModal')); modal.show();
}

/**
 * حفظ بيانات البيع (إضافة جديد أو تحديث موجود)
 * يتحقق من صحة البيانات المدخلة
 * يحسب السعر بناءً على نوع سعر المحل (تجزئة، جملة، موزع)
 * يخصم الكمية من المخزون للمبيعات غير المخصصة
 * يتحقق من انخفاض المخزون ويعرض تحذيراً إذا لزم الأمر
 * يحدث جميع الجداول والتقارير المتعلقة
 */
/**
 * ملاحظة: الدالة saveSale — وصف تلقائي موجز لوظيفتها.
 * المدخلات: بدون
 * المخرجات: راجع التنفيذ
 */
/**
 * ملاحظة: الدالة saveSale — وصف تلقائي موجز لوظيفتها.
 * المدخلات: بدون
 * المخرجات: راجع التنفيذ
 */
function saveSale() {
  const id = document.getElementById('saleId').value;
  const storeId = document.getElementById('saleStoreId').value;
  const packageId = document.getElementById('salePackage').value;
  const reason = document.getElementById('saleReason').value;
  const quantity = parseFormattedNumber(document.getElementById('saleQuantity').value) || 0;
  const amount = parseFormattedNumber(document.getElementById('saleAmount').value) || 0;
  const date = document.getElementById('saleDate').value ? formatDateEn(document.getElementById('saleDate').value) : getTodayDate();
  if (!storeId || (!packageId && !reason)) { showNotification('يرجى ملء جميع الحقول المطلوبة', 'error'); return; }
  const isCustom = packageId === 'custom';
  const store = data.stores.find(s => s.id === storeId);
  const pkg = packageId && !isCustom ? data.packages.find(p => p.id === packageId) : null;
  let pricePerUnit = 0, total = 0;
  if (isCustom) { total = amount; }
  else if (pkg && store) {
    switch (store.priceType) {
      case 'retail': pricePerUnit = pkg.retailPrice || 0; break;
      case 'wholesale': pricePerUnit = pkg.wholesalePrice || 0; break;
      case 'distributor': pricePerUnit = pkg.distributorPrice || 0; break;
      default: pricePerUnit = pkg.retailPrice || 0;
    }
    total = quantity * pricePerUnit;
    if (quantity <= 0) { showNotification('الكمية غير صحيحة', 'error'); return; }
    const ok = deductFromInventory(packageId, quantity);
    if (!ok) { showNotification('الكمية المطلوبة غير متوفرة في المخزون', 'error'); return; }
  }
  if (id) {
    const sale = data.sales.find(s => s.id === id);
    if (sale) {
      if (sale.packageId && sale.packageId !== 'custom' && sale.quantity) { addToInventory(sale.packageId, sale.quantity); }
      sale.packageId = packageId; sale.reason = reason; sale.quantity = quantity; sale.amount = amount; sale.pricePerUnit = pricePerUnit; sale.total = total; sale.date = date;
    }
    showNotification('تم تحديث البيع بنجاح', 'success');
  } else {
    const newId = 'sale_' + Date.now();
    data.sales.push({ id: newId, storeId, packageId, reason, quantity, amount, pricePerUnit, total, date });
    showNotification('تم إضافة البيع بنجاح', 'success');
  }
  if (!isCustom && packageId) { checkLowStockForPackage(packageId); }
  /**
   * حفظ البيانات وتحديث الكاش
   * يحفظ البيانات في التخزين المحلي
   * يبطل كاش المحل المتأثر ليتم إعادة حساب رصيده
   * يبطل كاش التقارير ذات الصلة
   */
  saveData();
  
  // إبطال كاش المحل المتأثر
  if (typeof balanceCache !== 'undefined') {
    balanceCache.invalidateStore(storeId);
    console.log(`تم تحديث كاش المحل: ${storeId}`);
  }
  
  // إبطال كاش التقارير ذات الصلة
  if (typeof reportCache !== 'undefined') {
    reportCache.invalidate(/^report_profit/);
    reportCache.invalidate(/^report_debt/);
  }
  
  // تحديث جميع العروض والتقارير المتعلقة
  refreshCurrentView(); // تحديث جميع العروض المرئية
  showStoreDetails(storeId); // تحديث تفاصيل المحل
  updateProfitReport(); // خاص بتقرير الأرباح
  generateDebtReport(); // خاص بتقرير الديون
  // إغلاق نافذة البيع
  const modal = bootstrap.Modal.getInstance(document.getElementById('saleModal')); 
  modal.hide();
  
  // تنظيف خلفيات النوافذ المنبثقة - الدالة غير موجودة
  if (typeof cleanupModalBackdrops === 'function') setTimeout(cleanupModalBackdrops, 300);
}

/**
 * فتح نموذج تعديل بيع موجود
 * يملأ النموذج بالبيانات الحالية للبيع
 * يتعامل مع نوعي البيع (باقة أو مخصص)
 * يضبط ظهور الحقول بناءً على نوع البيع
 * @param {string} id - معرف البيع المراد تعديله
 */
/**
 * ملاحظة: الدالة editSale — وصف تلقائي موجز لوظيفتها.
 * المدخلات: id
 * المخرجات: راجع التنفيذ
 */
/**
 * ملاحظة: الدالة editSale — وصف تلقائي موجز لوظيفتها.
 * المدخلات: id
 * المخرجات: راجع التنفيذ
 */
function editSale(id) {
  const sale = data.sales.find(s => s.id === id); if (!sale) return;
  const select = document.getElementById('salePackage');
  select.innerHTML = '';
  select.innerHTML = '<option value="">اختر الباقة</option>';
  select.innerHTML += '<option value="custom">مخصص (مبلغ مباشر)</option>';
  data.packages.forEach(pkg => { const option = document.createElement('option'); option.value = pkg.id; option.textContent = pkg.name; option.selected = pkg.id === sale.packageId; select.appendChild(option); });
  const isCustom = sale.packageId === 'custom'; if (isCustom) { select.value = 'custom'; }
  select.addEventListener('change', function () {
    const isCustom = this.value === 'custom';
    document.getElementById('customReasonGroup').style.display = isCustom ? 'block' : 'none';
    document.getElementById('quantityGroup').style.display = isCustom ? 'none' : 'block';
    document.getElementById('amountGroup').style.display = isCustom ? 'block' : 'none';
    if (isCustom) {
      document.getElementById('saleReason').value = sale.reason || '';
      document.getElementById('saleAmount').value = formatNumber(sale.amount) || '';
    } else { document.getElementById('saleQuantity').value = sale.quantity || ''; }
  });
  document.getElementById('saleModalTitle').textContent = 'تعديل البيع';
  document.getElementById('saleId').value = sale.id;
  document.getElementById('saleStoreId').value = sale.storeId;
  document.getElementById('saleReason').value = sale.reason || '';
  document.getElementById('saleQuantity').value = sale.quantity || '';
  document.getElementById('saleAmount').value = formatNumber(sale.amount) || '';
  document.getElementById('saleDate').value = sale.date;
  document.getElementById('customReasonGroup').style.display = isCustom ? 'block' : 'none';
  document.getElementById('quantityGroup').style.display = isCustom ? 'none' : 'block';
  document.getElementById('amountGroup').style.display = isCustom ? 'block' : 'none';
  const modal = new bootstrap.Modal(document.getElementById('saleModal')); modal.show();
}

/**
 * حذف بيع من السجلات
 * يطلب تأكيد من المستخدم قبل الحذف
 * ينقل البيع المحذوف إلى سلة المحذوفات إذا كانت متاحة
 * يحدث جميع الجداول والتقارير المتعلقة
 * @param {string} id - معرف البيع المراد حذفه
 */
/**
 * ملاحظة: الدالة deleteSale — وصف تلقائي موجز لوظيفتها.
 * المدخلات: id
 * المخرجات: راجع التنفيذ
 */
/**
 * ملاحظة: الدالة deleteSale — وصف تلقائي موجز لوظيفتها.
 * المدخلات: id
 * المخرجات: راجع التنفيذ
 */
function deleteSale(id) {
  const sale = data.sales.find(s => s.id === id); if (!sale) return;
  if (!confirm('هل أنت متأكد من حذف هذا البيع؟')) return;
  /**
   * حذف البيع وتحديث الكاش
   * يحذف البيع من قائمة المبيعات
   * يبطل كاش المحل المتأثر ليتم إعادة حساب رصيده
   * يبطل كاش التقارير ذات الصلة
   */
  data.sales = data.sales.filter(s => s.id !== id);
  saveData();
  
  // إبطال كاش المحل المتأثر
  if (typeof balanceCache !== 'undefined' && sale) {
    balanceCache.invalidateStore(sale.storeId);
    console.log(`تم تحديث كاش المحل بعد حذف البيع: ${sale.storeId}`);
  }
  
  // إبطال كاش التقارير
  if (typeof reportCache !== 'undefined') {
    reportCache.invalidate(/^report_/);
  }
  
  // إضافة إلى سلة المحذوفات وتحديث العروض
  // يستخدم async/await للتعامل مع عملية الحذف بشكل غير متزامن
  (async()=>{ try{ if (typeof addToTrash==='function') await addToTrash('sales', sale); }catch{}; refreshCurrentView(); updateProfitReport(); })();
  showNotification('تم حذف البيع بنجاح', 'success');
}