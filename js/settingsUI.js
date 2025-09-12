/**
 * ملف settingsUI.js - واجهة المستخدم لنظام الإعدادات
 * يدير عرض وتحديث الإعدادات في الواجهة
 * يتكامل مع settings.js لتطبيق التغييرات
 */

(function() {
    'use strict';

    /**
     * تهيئة واجهة الإعدادات
     * يتم استدعاؤها عند تحميل الصفحة
     */
    /**
     * ملاحظة: الدالة initSettingsUI — وصف تلقائي موجز لوظيفتها.
     * المدخلات: بدون
     * المخرجات: راجع التنفيذ
     */
    /**
     * ملاحظة: الدالة initSettingsUI — وصف تلقائي موجز لوظيفتها.
     * المدخلات: بدون
     * المخرجات: راجع التنفيذ
     */
    function initSettingsUI() {
        // التحقق من وجود AppSettings
        if (typeof window.AppSettings === 'undefined') {
            console.error('AppSettings غير موجود. تأكد من تحميل settings.js أولاً');
            return;
        }

        // تحميل الإعدادات الحالية في الواجهة
        loadSettingsToUI();

        // إضافة مستمعات الأحداث
        setupEventListeners();

        // إنشاء محتوى التبويبات الديناميكي
        createSettingsTabs();

        // إذا كان هناك تبويب محدد مسبقاً كـ active في قائمة #settingsTabs، افتحه افتراضياً
        try {
            const preActive = document.querySelector('#settingsTabs .list-group-item.active');
            const initialTab = preActive && preActive.getAttribute('data-tab') ? preActive.getAttribute('data-tab') : 'display';
            if (typeof switchSettingsTab === 'function') {
                switchSettingsTab(initialTab);
            }
        } catch (_) {}
    }

    /**
     * تحميل الإعدادات الحالية في عناصر الواجهة
     */
    /**
     * ملاحظة: الدالة loadSettingsToUI — وصف تلقائي موجز لوظيفتها.
     * المدخلات: بدون
     * المخرجات: راجع التنفيذ
     */
    /**
     * ملاحظة: الدالة loadSettingsToUI — وصف تلقائي موجز لوظيفتها.
     * المدخلات: بدون
     * المخرجات: راجع التنفيذ
     */
    function loadSettingsToUI() {
        const settings = AppSettings.getAll();
        
        // تحميل إعدادات العرض
        setElementValue('setting-theme', settings.display.theme);
        setElementValue('setting-fontSize', settings.display.fontSize);
        setElementValue('setting-fontWeight', settings.display.fontWeight);
        setElementValue('setting-density', settings.display.density);
        setElementValue('setting-primaryColor', settings.display.primaryColor);
        setElementValue('setting-secondaryColor', settings.display.secondaryColor);
        setElementValue('setting-textColor', settings.display.textColor);
        setElementChecked('setting-animations', settings.display.animations);
        setElementChecked('setting-roundedCorners', settings.display.roundedCorners);

        // تحميل إعدادات المالية
        setElementValue('setting-currency', settings.financial.currency);
        setElementValue('setting-currencyName', settings.financial.currencyName);
        setElementValue('setting-currencyPosition', settings.financial.currencyPosition);
        setElementValue('setting-decimals', settings.financial.decimals);
        setElementValue('setting-taxRate', settings.financial.taxRate);
        setElementValue('setting-numberFormat', settings.financial.numberFormat);
        setElementChecked('setting-taxIncluded', settings.financial.taxIncluded);
        setElementChecked('setting-showZeroDecimals', settings.financial.showZeroDecimals);

        // تحميل إعدادات التنبيهات
        setElementChecked('setting-notificationsEnabled', settings.notifications.enabled);
        setElementChecked('setting-soundEnabled', settings.notifications.soundEnabled);
        setElementValue('setting-notificationPosition', settings.notifications.position);
        setElementValue('setting-notificationDuration', settings.notifications.duration / 1000);
        setElementChecked('setting-lowStockEnabled', settings.notifications.lowStock.enabled);
        setElementValue('setting-lowStockThreshold', settings.notifications.lowStock.threshold);
        setElementValue('setting-lowStockUrgent', settings.notifications.lowStock.urgentThreshold);

        // تحميل إعدادات النسخ الاحتياطي
        setElementChecked('setting-autoBackup', settings.backup.autoBackup);
        setElementValue('setting-backupFrequency', settings.backup.frequency);
        setElementValue('setting-backupTime', settings.backup.time);
        setElementValue('setting-keepCount', settings.backup.keepCount);
        setElementValue('setting-backupLocation', settings.backup.location);
        setElementChecked('setting-compress', settings.backup.compress);
        setElementChecked('setting-encrypt', settings.backup.encrypt);
        setElementChecked('setting-cloudSync', settings.backup.cloudSync);

        // تحميل إعدادات الأمان
        setElementChecked('setting-appLock', settings.security.appLock);
        setElementValue('setting-lockType', settings.security.lockType);
        setElementValue('setting-autoLockMinutes', settings.security.autoLockMinutes);
        setElementValue('setting-maxLoginAttempts', settings.security.maxLoginAttempts);
        setElementValue('setting-sessionTimeout', settings.security.sessionTimeout);
        setElementChecked('setting-encryptSensitive', settings.security.encryptSensitive);
        setElementChecked('setting-hideBalances', settings.security.hideBalances);
        setElementChecked('setting-activityLog', settings.security.activityLog);

        // تحميل إعدادات الأداء
        setElementChecked('setting-cacheEnabled', settings.performance.cacheEnabled);
        setElementValue('setting-cacheSize', settings.performance.cacheSize);
        setElementValue('setting-cacheDuration', settings.performance.cacheDuration);
        setElementChecked('setting-lazyLoading', settings.performance.lazyLoading);
        setElementValue('setting-itemsPerPage', settings.performance.itemsPerPage);
        setElementChecked('setting-offlineMode', settings.performance.offlineMode);
        setElementChecked('setting-powerSaveMode', settings.performance.powerSaveMode);
    }

    /**
     * إعداد مستمعات الأحداث
     */
    /**
     * ملاحظة: الدالة setupEventListeners — وصف تلقائي موجز لوظيفتها.
     * المدخلات: بدون
     * المخرجات: راجع التنفيذ
     */
    /**
     * ملاحظة: الدالة setupEventListeners — وصف تلقائي موجز لوظيفتها.
     * المدخلات: بدون
     * المخرجات: راجع التنفيذ
     */
    function setupEventListeners() {
        // مستمع لتبديل التبويبات
        const tabs = document.querySelectorAll('#settingsTabs .list-group-item');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                switchSettingsTab(tab.dataset.tab);
            });
        });

        // مستمع لزر التصدير
        const exportBtn = document.getElementById('exportSettingsBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', exportSettings);
        }

        // مستمع لزر الاستيراد
        const importBtn = document.getElementById('importSettingsBtn');
        if (importBtn) {
            importBtn.addEventListener('click', importSettings);
        }
    }

    /**
     * تبديل التبويب النشط
     */
    /**
     * ملاحظة: الدالة switchSettingsTab — وصف تلقائي موجز لوظيفتها.
     * المدخلات: tabName
     * المخرجات: راجع التنفيذ
     */
    /**
     * ملاحظة: الدالة switchSettingsTab — وصف تلقائي موجز لوظيفتها.
     * المدخلات: tabName
     * المخرجات: راجع التنفيذ
     */
    function switchSettingsTab(tabName) {
        // إخفاء جميع التبويبات
        document.querySelectorAll('.settings-tab').forEach(tab => {
            tab.style.display = 'none';
        });

        // إزالة active من جميع الروابط
        document.querySelectorAll('#settingsTabs .list-group-item').forEach(link => {
            link.classList.remove('active');
        });

        // إظهار التبويب المحدد
        const selectedTab = document.getElementById(`${tabName}-settings`);
        if (selectedTab) {
            selectedTab.style.display = 'block';
        }

        // تفعيل الرابط المحدد
        const selectedLink = document.querySelector(`#settingsTabs [data-tab="${tabName}"]`);
        if (selectedLink) {
            selectedLink.classList.add('active');
        }
    }

    /**
     * إنشاء محتوى التبويبات الديناميكي
     */
    /**
     * ملاحظة: الدالة createSettingsTabs — وصف تلقائي موجز لوظيفتها.
     * المدخلات: بدون
     * المخرجات: راجع التنفيذ
     */
    /**
     * ملاحظة: الدالة createSettingsTabs — وصف تلقائي موجز لوظيفتها.
     * المدخلات: بدون
     * المخرجات: راجع التنفيذ
     */
    function createSettingsTabs() {
        const container = document.getElementById('settingsContent');
        if (!container) return;

        const settings = AppSettings.getAll();
        
        // إنشاء HTML للتبويبات
        let html = '';

        // تبويب العرض والمظهر
        html += createDisplayTab(settings.display);
        
        // تبويب المالية والعملة
        html += createFinancialTab(settings.financial);
        
        // تبويب التنبيهات
        html += createNotificationsTab(settings.notifications);
        
        // تبويب النسخ الاحتياطي
        html += createBackupTab(settings.backup);
        
        // تبويب الأمان
        html += createSecurityTab(settings.security);
        
        // تبويب التقارير والطباعة
        html += createReportsTab(settings.reports);
        
        // تبويب الأداء
        html += createPerformanceTab(settings.performance);

        // تبويب الأعلام (الميزات التجريبية)
        html += createFeatureFlagsTab(settings.advanced || {});

        container.innerHTML = html;

        // إعادة تحميل القيم
        loadSettingsToUI();
    }

    /**
     * إنشاء تبويب الأعلام (Feature Flags)
     */
    /**
     * ملاحظة: الدالة createFeatureFlagsTab — وصف تلقائي موجز لوظيفتها.
     * المدخلات: advanced
     * المخرجات: راجع التنفيذ
     */
    /**
     * ملاحظة: الدالة createFeatureFlagsTab — وصف تلقائي موجز لوظيفتها.
     * المدخلات: advanced
     * المخرجات: راجع التنفيذ
     */
    function createFeatureFlagsTab(advanced) {
        const exp = !!(advanced && advanced.experimentalFeatures);
        const flags = (advanced && advanced.flags) || {};
        return `
            <div class="settings-tab" id="flags-settings" style="display:none;">
                <h5 class="mb-4"><i class="fas fa-flask"></i> الميزات التجريبية (Feature Flags)</h5>

                <div class="alert alert-info">
                    <i class="fas fa-info-circle"></i>
                    هذه التحسينات لا تغيّر أي سلوك محاسبي. لن تُطبَّق الأعلام إلا بعد تفعيل خيار "الميزات التجريبية".
                </div>

                <div class="card mb-4">
                    <div class="card-header bg-light">
                        <strong>التفعيل العام</strong>
                    </div>
                    <div class="card-body">
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" id="setting-experimentalFeatures"
                                   ${exp ? 'checked' : ''}
                                   onchange="AppSettings.update('advanced.experimentalFeatures', this.checked)">
                            <label class="form-check-label" for="setting-experimentalFeatures">
                                تشغيل الميزات التجريبية (لا يغيّر سلوك الحسابات، يتيح فقط الأعلام أدناه)
                            </label>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header bg-light">
                        <strong>أعلام التشغيل</strong>
                    </div>
                    <div class="card-body">
                        <div class="row g-3">
                            <div class="col-md-6">
                                <div class="form-check form-switch">
                                    <input class="form-check-input" type="checkbox" id="flag-safeJsonParse"
                                           ${flags.safeJsonParse ? 'checked' : ''}
                                           onchange="AppSettings.update('advanced.flags.safeJsonParse', this.checked)">
                                    <label class="form-check-label" for="flag-safeJsonParse">
                                        safeJsonParse — طبقة حراسة لـ JSON.parse لمنع الأعطال عند تلف البيانات
                                    </label>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-check form-switch">
                                    <input class="form-check-input" type="checkbox" id="flag-safeDomRendering"
                                           ${flags.safeDomRendering ? 'checked' : ''}
                                           onchange="AppSettings.update('advanced.flags.safeDomRendering', this.checked)">
                                    <label class="form-check-label" for="flag-safeDomRendering">
                                        safeDomRendering — تغليف العرض الآمن للـ DOM بدلاً من innerHTML المباشر
                                    </label>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-check form-switch">
                                    <input class="form-check-input" type="checkbox" id="flag-idbChunking"
                                           ${flags.idbChunking ? 'checked' : ''}
                                           onchange="AppSettings.update('advanced.flags.idbChunking', this.checked)">
                                    <label class="form-check-label" for="flag-idbChunking">
                                        idbChunking — مزامنة IndexedDB على دفعات لتجنب تجمّد الواجهة
                                    </label>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-check form-switch">
                                    <input class="form-check-input" type="checkbox" id="flag-enhancedGithubErrors"
                                           ${flags.enhancedGithubErrors ? 'checked' : ''}
                                           onchange="AppSettings.update('advanced.flags.enhancedGithubErrors', this.checked)">
                                    <label class="form-check-label" for="flag-enhancedGithubErrors">
                                        enhancedGithubErrors — رسائل أخطاء أوضح عند فشل مزامنة GitHub
                                    </label>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-check form-switch">
                                    <input class="form-check-input" type="checkbox" id="flag-strictDateNormalization"
                                           ${flags.strictDateNormalization ? 'checked' : ''}
                                           onchange="AppSettings.update('advanced.flags.strictDateNormalization', this.checked)">
                                    <label class="form-check-label" for="flag-strictDateNormalization">
                                        strictDateNormalization — تطبيع صارم للتواريخ قبل أي فلترة/حساب
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <small class="text-muted d-block mt-3">
                    تلميح: يمكنك أيضاً إدارة الأعلام من الكونسول: FeatureFlags.enable('safeJsonParse') / FeatureFlags.disable('safeJsonParse').
                </small>
            </div>
        `;
    }

    /**
     * إنشاء تبويب العرض والمظهر
     */
    /**
     * ملاحظة: الدالة createDisplayTab — وصف تلقائي موجز لوظيفتها.
     * المدخلات: display
     * المخرجات: راجع التنفيذ
     */
    /**
     * ملاحظة: الدالة createDisplayTab — وصف تلقائي موجز لوظيفتها.
     * المدخلات: display
     * المخرجات: راجع التنفيذ
     */
    function createDisplayTab(display) {
        return `
            <div class="settings-tab active" id="display-settings">
                <h5 class="mb-4"><i class="fas fa-palette"></i> إعدادات العرض والمظهر</h5>
                
                <div class="row mb-3">
                    <div class="col-md-6">
                        <label class="form-label">المظهر</label>
                        <select class="form-select" id="setting-theme" onchange="AppSettings.update('display.theme', this.value)">
                            <option value="light">فاتح</option>
                            <option value="dark">داكن</option>
                            <option value="auto">تلقائي (حسب النظام)</option>
                        </select>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">حجم الخط</label>
                        <select class="form-select" id="setting-fontSize" onchange="AppSettings.update('display.fontSize', this.value)">
                            <option value="tiny">صغير جداً</option>
                            <option value="small">صغير</option>
                            <option value="medium">متوسط</option>
                            <option value="large">كبير</option>
                            <option value="xlarge">كبير جداً</option>
                            <option value="huge">ضخم</option>
                            <option value="massive">ضخم جداً</option>
                        </select>
                    </div>
                </div>

                <div class="row mb-3">
                    <div class="col-md-6">
                        <label class="form-label">وزن/سمك الخط</label>
                        <select class="form-select" id="setting-fontWeight" onchange="AppSettings.update('display.fontWeight', this.value)">
                            <option value="thin">رفيع جداً</option>
                            <option value="light">رفيع</option>
                            <option value="normal">عادي</option>
                            <option value="medium">متوسط</option>
                            <option value="semibold">شبه عريض</option>
                            <option value="bold">عريض</option>
                            <option value="extrabold">عريض جداً</option>
                            <option value="black">أسود</option>
                        </select>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">كثافة العرض</label>
                        <select class="form-select" id="setting-density" onchange="AppSettings.update('display.density', this.value)">
                            <option value="ultra-compact">مضغوط جداً</option>
                            <option value="compact">مضغوط</option>
                            <option value="normal">عادي</option>
                            <option value="comfortable">مريح</option>
                            <option value="spacious">واسع</option>
                        </select>
                    </div>
                </div>

                <div class="row mb-3">
                    <div class="col-md-4">
                        <label class="form-label">اللون الرئيسي</label>
                        <div class="input-group">
                            <input type="color" class="form-control form-control-color" id="setting-primaryColor" 
                                   value="${display.primaryColor}" onchange="AppSettings.update('display.primaryColor', this.value)">
                            <input type="text" class="form-control" value="${display.primaryColor}" 
                                   onchange="document.getElementById('setting-primaryColor').value = this.value; AppSettings.update('display.primaryColor', this.value)">
                        </div>
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">اللون الثانوي</label>
                        <div class="input-group">
                            <input type="color" class="form-control form-control-color" id="setting-secondaryColor"
                                   value="${display.secondaryColor}" onchange="AppSettings.update('display.secondaryColor', this.value)">
                            <input type="text" class="form-control" value="${display.secondaryColor}"
                                   onchange="document.getElementById('setting-secondaryColor').value = this.value; AppSettings.update('display.secondaryColor', this.value)">
                        </div>
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">لون النص</label>
                        <div class="input-group">
                            <input type="color" class="form-control form-control-color" id="setting-textColor"
                                   value="${display.textColor}" onchange="AppSettings.update('display.textColor', this.value)">
                            <input type="text" class="form-control" value="${display.textColor}"
                                   onchange="document.getElementById('setting-textColor').value = this.value; AppSettings.update('display.textColor', this.value)">
                        </div>
                    </div>
                </div>

                <div class="row mb-3">
                    <div class="col-md-6">
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" id="setting-animations"
                                   ${display.animations ? 'checked' : ''} onchange="AppSettings.update('display.animations', this.checked)">
                            <label class="form-check-label" for="setting-animations">
                                تفعيل التأثيرات الحركية
                            </label>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" id="setting-roundedCorners"
                                   ${display.roundedCorners ? 'checked' : ''} onchange="AppSettings.update('display.roundedCorners', this.checked)">
                            <label class="form-check-label" for="setting-roundedCorners">
                                الزوايا المستديرة
                            </label>
                        </div>
                    </div>
                </div>

                <div class="alert alert-info">
                    <i class="fas fa-info-circle"></i> التغييرات على إعدادات العرض تطبق فوراً
                </div>
            </div>
        `;
    }

    /**
     * إنشاء تبويب المالية والعملة
     */
    /**
     * ملاحظة: الدالة createFinancialTab — وصف تلقائي موجز لوظيفتها.
     * المدخلات: financial
     * المخرجات: راجع التنفيذ
     */
    /**
     * ملاحظة: الدالة createFinancialTab — وصف تلقائي موجز لوظيفتها.
     * المدخلات: financial
     * المخرجات: راجع التنفيذ
     */
    function createFinancialTab(financial) {
        return `
            <div class="settings-tab" id="financial-settings" style="display:none;">
                <h5 class="mb-4"><i class="fas fa-money-bill"></i> إعدادات المالية والعملة</h5>
                
                <div class="row mb-3">
                    <div class="col-md-4">
                        <label class="form-label">رمز العملة</label>
                        <input type="text" class="form-control" id="setting-currency" 
                               value="${financial.currency}" placeholder="SAR" 
                               onchange="AppSettings.update('financial.currency', this.value)">
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">اسم العملة</label>
                        <input type="text" class="form-control" id="setting-currencyName"
                               value="${financial.currencyName}" placeholder="ريال" 
                               onchange="AppSettings.update('financial.currencyName', this.value)">
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">موضع العملة</label>
                        <select class="form-select" id="setting-currencyPosition"
                                onchange="AppSettings.update('financial.currencyPosition', this.value)">
                            <option value="after" ${financial.currencyPosition === 'after' ? 'selected' : ''}>بعد الرقم</option>
                            <option value="before" ${financial.currencyPosition === 'before' ? 'selected' : ''}>قبل الرقم</option>
                        </select>
                    </div>
                </div>

                <div class="row mb-3">
                    <div class="col-md-4">
                        <label class="form-label">عدد الخانات العشرية</label>
                        <input type="number" class="form-control" id="setting-decimals"
                               value="${financial.decimals}" min="0" max="4" 
                               onchange="AppSettings.update('financial.decimals', parseInt(this.value))">
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">نسبة الضريبة %</label>
                        <input type="number" class="form-control" id="setting-taxRate"
                               value="${financial.taxRate}" min="0" max="100" step="0.5" 
                               onchange="AppSettings.update('financial.taxRate', parseFloat(this.value))">
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">صيغة الأرقام</label>
                        <select class="form-select" id="setting-numberFormat"
                                onchange="AppSettings.update('financial.numberFormat', this.value)">
                            <option value="en" ${financial.numberFormat === 'en' ? 'selected' : ''}>إنجليزية (123)</option>
                            <option value="ar" ${financial.numberFormat === 'ar' ? 'selected' : ''}>عربية (١٢٣)</option>
                        </select>
                    </div>
                </div>

                <div class="row mb-3">
                    <div class="col-md-6">
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" id="setting-taxIncluded"
                                   ${financial.taxIncluded ? 'checked' : ''} 
                                   onchange="AppSettings.update('financial.taxIncluded', this.checked)">
                            <label class="form-check-label" for="setting-taxIncluded">
                                الضريبة مضمنة في السعر
                            </label>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" id="setting-showZeroDecimals"
                                   ${financial.showZeroDecimals ? 'checked' : ''} 
                                   onchange="AppSettings.update('financial.showZeroDecimals', this.checked)">
                            <label class="form-check-label" for="setting-showZeroDecimals">
                                عرض الأصفار العشرية
                            </label>
                        </div>
                    </div>
                </div>

                <div class="alert alert-warning">
                    <i class="fas fa-exclamation-triangle"></i> تغيير إعدادات العملة لا يؤثر على البيانات المحفوظة مسبقاً
                </div>
            </div>
        `;
    }

    /**
     * إنشاء تبويب التنبيهات
     */
    /**
     * ملاحظة: الدالة createNotificationsTab — وصف تلقائي موجز لوظيفتها.
     * المدخلات: notifications
     * المخرجات: راجع التنفيذ
     */
    /**
     * ملاحظة: الدالة createNotificationsTab — وصف تلقائي موجز لوظيفتها.
     * المدخلات: notifications
     * المخرجات: راجع التنفيذ
     */
    function createNotificationsTab(notifications) {
        return `
            <div class="settings-tab" id="notifications-settings" style="display:none;">
                <h5 class="mb-4"><i class="fas fa-bell"></i> إعدادات التنبيهات والإشعارات</h5>
                
                <div class="row mb-3">
                    <div class="col-md-6">
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" id="setting-notificationsEnabled"
                                   ${notifications.enabled ? 'checked' : ''} 
                                   onchange="AppSettings.update('notifications.enabled', this.checked)">
                            <label class="form-check-label" for="setting-notificationsEnabled">
                                تفعيل التنبيهات
                            </label>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" id="setting-soundEnabled"
                                   ${notifications.soundEnabled ? 'checked' : ''} 
                                   onchange="AppSettings.update('notifications.soundEnabled', this.checked)">
                            <label class="form-check-label" for="setting-soundEnabled">
                                تفعيل الأصوات
                            </label>
                        </div>
                        <button type="button" class="btn btn-sm btn-primary mt-2" onclick="testNotificationSound()">
                            <i class="fas fa-volume-up"></i> اختبار الصوت
                        </button>
                        
                        <div class="mt-3">
                            <label class="form-label">مستوى الصوت: <span id="volumeValue">${notifications.soundVolume || 50}%</span></label>
                            <input type="range" class="form-range" id="setting-soundVolume"
                                   min="0" max="100" step="10" 
                                   value="${notifications.soundVolume || 50}"
                                   onchange="AppSettings.update('notifications.soundVolume', parseInt(this.value)); document.getElementById('volumeValue').textContent = this.value + '%';">
                        </div>
                    </div>
                </div>

                <div class="row mb-3">
                    <div class="col-md-6">
                        <label class="form-label">موضع التنبيهات</label>
                        <select class="form-select" id="setting-notificationPosition"
                                onchange="AppSettings.update('notifications.position', this.value)">
                            <option value="top-right" ${notifications.position === 'top-right' ? 'selected' : ''}>أعلى اليمين</option>
                            <option value="top-left" ${notifications.position === 'top-left' ? 'selected' : ''}>أعلى اليسار</option>
                            <option value="bottom-right" ${notifications.position === 'bottom-right' ? 'selected' : ''}>أسفل اليمين</option>
                            <option value="bottom-left" ${notifications.position === 'bottom-left' ? 'selected' : ''}>أسفل اليسار</option>
                        </select>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">مدة العرض (ثانية)</label>
                        <input type="number" class="form-control" id="setting-notificationDuration"
                               value="${notifications.duration / 1000}" min="1" max="10" step="0.5" 
                               onchange="AppSettings.update('notifications.duration', this.value * 1000)">
                    </div>
                </div>

                <hr>
                <h6>تنبيهات المخزون</h6>
                <div class="row mb-3">
                    <div class="col-md-4">
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" id="setting-lowStockEnabled"
                                   ${notifications.lowStock.enabled ? 'checked' : ''} 
                                   onchange="AppSettings.update('notifications.lowStock.enabled', this.checked)">
                            <label class="form-check-label" for="setting-lowStockEnabled">
                                تفعيل تنبيه المخزون المنخفض
                            </label>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">الحد الأدنى</label>
                        <input type="number" class="form-control" id="setting-lowStockThreshold"
                               value="${notifications.lowStock.threshold}" min="1" 
                               onchange="AppSettings.update('notifications.lowStock.threshold', parseInt(this.value))">
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">الحد الحرج</label>
                        <input type="number" class="form-control" id="setting-lowStockUrgent"
                               value="${notifications.lowStock.urgentThreshold}" min="1" 
                               onchange="AppSettings.update('notifications.lowStock.urgentThreshold', parseInt(this.value))">
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * إنشاء تبويب النسخ الاحتياطي
     */
    /**
     * ملاحظة: الدالة createBackupTab — وصف تلقائي موجز لوظيفتها.
     * المدخلات: backup
     * المخرجات: راجع التنفيذ
     */
    /**
     * ملاحظة: الدالة createBackupTab — وصف تلقائي موجز لوظيفتها.
     * المدخلات: backup
     * المخرجات: راجع التنفيذ
     */
    function createBackupTab(backup) {
        return `
            <div class="settings-tab" id="backup-settings" style="display:none;">
                <h5 class="mb-4"><i class="fas fa-cloud-upload-alt"></i> إعدادات النسخ الاحتياطي</h5>
                
                <div class="row mb-3">
                    <div class="col-md-6">
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" id="setting-autoBackup"
                                   ${backup.autoBackup ? 'checked' : ''} 
                                   onchange="AppSettings.update('backup.autoBackup', this.checked)">
                            <label class="form-check-label" for="setting-autoBackup">
                                النسخ الاحتياطي التلقائي
                            </label>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">التكرار</label>
                        <select class="form-select" id="setting-backupFrequency"
                                onchange="AppSettings.update('backup.frequency', this.value)">
                            <option value="hourly" ${backup.frequency === 'hourly' ? 'selected' : ''}>كل ساعة</option>
                            <option value="daily" ${backup.frequency === 'daily' ? 'selected' : ''}>يومياً</option>
                            <option value="weekly" ${backup.frequency === 'weekly' ? 'selected' : ''}>أسبوعياً</option>
                            <option value="monthly" ${backup.frequency === 'monthly' ? 'selected' : ''}>شهرياً</option>
                        </select>
                    </div>
                </div>

                <div class="row mb-3">
                    <div class="col-md-4">
                        <label class="form-label">وقت النسخ</label>
                        <input type="time" class="form-control" id="setting-backupTime"
                               value="${backup.time}" onchange="AppSettings.update('backup.time', this.value)">
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">عدد النسخ المحفوظة</label>
                        <input type="number" class="form-control" id="setting-keepCount"
                               value="${backup.keepCount}" min="1" max="30" 
                               onchange="AppSettings.update('backup.keepCount', parseInt(this.value))">
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">مكان الحفظ</label>
                        <select class="form-select" id="setting-backupLocation"
                                onchange="AppSettings.update('backup.location', this.value)">
                            <option value="local" ${backup.location === 'local' ? 'selected' : ''}>محلي (جهازك)</option>
                            <option value="browser" ${backup.location === 'browser' ? 'selected' : ''}>المتصفح</option>
                            <option value="drive" ${backup.location === 'drive' ? 'selected' : ''}>Google Drive</option>
                        </select>
                    </div>
                </div>

                <div class="row mb-3">
                    <div class="col-md-4">
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" id="setting-compress"
                                   ${backup.compress ? 'checked' : ''} 
                                   onchange="AppSettings.update('backup.compress', this.checked)">
                            <label class="form-check-label" for="setting-compress">
                                ضغط البيانات
                            </label>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" id="setting-encrypt"
                                   ${backup.encrypt ? 'checked' : ''} 
                                   onchange="AppSettings.update('backup.encrypt', this.checked)">
                            <label class="form-check-label" for="setting-encrypt">
                                تشفير النسخ
                            </label>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" id="setting-cloudSync"
                                   ${backup.cloudSync ? 'checked' : ''} 
                                   onchange="AppSettings.update('backup.cloudSync', this.checked)">
                            <label class="form-check-label" for="setting-cloudSync">
                                المزامنة السحابية
                            </label>
                        </div>
                        <small class="text-muted d-block mt-1">
                            يحاول الرفع تلقائياً للسحابة عند إنشاء نسخة احتياطية
                        </small>
                    </div>
                </div>

                <div class="d-flex gap-2 flex-wrap">
                    <button class="btn btn-primary" onclick="if(typeof createBackup === 'function') createBackup()">
                        <i class="fas fa-save"></i> إنشاء نسخة احتياطية الآن
                    </button>
                    <button class="btn btn-warning" onclick="if(typeof testGoogleDriveBackup === 'function') testGoogleDriveBackup()">
                        <i class="fas fa-vial"></i> اختبار Google Drive
                    </button>
                    
                    <button class="btn btn-info" onclick="if(typeof BackupSystem !== 'undefined') BackupSystem.createEmailBackup()">
                        <i class="fas fa-envelope"></i> إرسال بالبريد
                    </button>
                    
                    <button class="btn btn-secondary" onclick="document.getElementById('restoreBackupFile').click()">
                        <i class="fas fa-upload"></i> استعادة نسخة احتياطية
                    </button>
                    
                    <button class="btn btn-info" onclick="if(typeof BackupSystem !== 'undefined') BackupSystem.showBrowserBackups()">
                        <i class="fas fa-list"></i> النسخ المحفوظة
                    </button>
                </div>
                
                <input type="file" id="restoreBackupFile" accept=".json" style="display:none" 
                       onchange="if(this.files[0] && typeof restoreBackup === 'function') restoreBackup(this.files[0])">
                
                <div class="alert alert-info mt-3">
                    <h6><i class="fas fa-info-circle"></i> معلومات عن أماكن الحفظ:</h6>
                    <ul class="mb-0">
                        <li><strong>محلي (جهازك):</strong> يتم تحميل الملف مباشرة إلى مجلد التنزيلات - الأسرع والأبسط</li>
                        <li><strong>المتصفح:</strong> يحفظ في ذاكرة المتصفح، يمكن استعراض آخر 10 نسخ (محدود بـ 5-10 ميجا)</li>
                        <li><strong>Google Drive:</strong> 
                            <ul>
                                <li>يحمّل الملف أولاً ثم يعرض نافذة بحلول متعددة</li>
                                <li>أسهل طريقة: Google Colab (انسخ الكود والصقه)</li>
                                <li>أو: أرسل بالبريد ثم احفظ في Drive</li>
                            </ul>
                        </li>
                    </ul>
                    
                    <div class="alert alert-success mt-2 mb-0">
                        <strong>💡 نصيحة:</strong> ابدأ بـ "محلي" أو "المتصفح" - الأسهل والأسرع. 
                        Google Drive يحتاج خطوات إضافية لكنه يوفر أماناً أكثر.
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * إنشاء تبويب الأمان
     */
    /**
     * ملاحظة: الدالة createSecurityTab — وصف تلقائي موجز لوظيفتها.
     * المدخلات: security
     * المخرجات: راجع التنفيذ
     */
    /**
     * ملاحظة: الدالة createSecurityTab — وصف تلقائي موجز لوظيفتها.
     * المدخلات: security
     * المخرجات: راجع التنفيذ
     */
    function createSecurityTab(security) {
        return `
            <div class="settings-tab" id="security-settings" style="display:none;">
                <h5 class="mb-4"><i class="fas fa-shield-alt"></i> إعدادات الأمان والخصوصية</h5>
                
                <div class="row mb-3">
                    <div class="col-md-6">
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" id="setting-appLock"
                                   ${security.appLock ? 'checked' : ''} 
                                   onchange="AppSettings.update('security.appLock', this.checked); updateLockButton()">
                            <label class="form-check-label" for="setting-appLock">
                                قفل التطبيق
                            </label>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">نوع القفل</label>
                        <select class="form-select" id="setting-lockType"
                                onchange="AppSettings.update('security.lockType', this.value); toggleLockCredentials(this.value); updateLockButton()">
                            <option value="none" ${security.lockType === 'none' ? 'selected' : ''}>بدون قفل</option>
                            <option value="pin" ${security.lockType === 'pin' ? 'selected' : ''}>رمز PIN</option>
                            <option value="password" ${security.lockType === 'password' ? 'selected' : ''}>كلمة مرور</option>
                        </select>
                        <div class="form-text">الخيارات المتاحة لتطبيق الويب</div>
                    </div>
                </div>

                <div class="row mb-3">
                    <div class="col-md-4">
                        <label class="form-label">القفل التلقائي (دقائق)</label>
                        <input type="number" class="form-control" id="setting-autoLockMinutes"
                               value="${security.autoLockMinutes}" min="1" max="60" 
                               onchange="AppSettings.update('security.autoLockMinutes', parseInt(this.value))">
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">محاولات الدخول القصوى</label>
                        <input type="number" class="form-control" id="setting-maxLoginAttempts"
                               value="${security.maxLoginAttempts}" min="3" max="10" 
                               onchange="AppSettings.update('security.maxLoginAttempts', parseInt(this.value))">
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">مهلة الجلسة (دقائق)</label>
                        <input type="number" class="form-control" id="setting-sessionTimeout"
                               value="${security.sessionTimeout}" min="5" max="120" 
                               onchange="AppSettings.update('security.sessionTimeout', parseInt(this.value))">
                    </div>
                </div>

                <div class="row mb-3">
                    <div class="col-md-4">
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" id="setting-encryptSensitive"
                                   ${security.encryptSensitive ? 'checked' : ''} 
                                   onchange="AppSettings.update('security.encryptSensitive', this.checked)">
                            <label class="form-check-label" for="setting-encryptSensitive">
                                تشفير البيانات الحساسة
                            </label>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" id="setting-hideBalances"
                                   ${security.hideBalances ? 'checked' : ''} 
                                   onchange="AppSettings.update('security.hideBalances', this.checked)">
                            <label class="form-check-label" for="setting-hideBalances">
                                إخفاء الأرصدة
                            </label>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" id="setting-activityLog"
                                   ${security.activityLog ? 'checked' : ''} 
                                   onchange="AppSettings.update('security.activityLog', this.checked)">
                            <label class="form-check-label" for="setting-activityLog">
                                سجل النشاطات
                            </label>
                        </div>
                    </div>
                </div>

                <!-- إعدادات PIN وكلمة المرور -->
                <div class="mb-3" id="lockCredentials" style="${security.lockType === 'none' ? 'display:none' : ''}">
                    <div id="pinSection" style="${security.lockType === 'pin' ? '' : 'display:none'}">
                        <label class="form-label">رمز PIN (4-6 أرقام)</label>
                        <input type="password" class="form-control form-control-lg" id="setting-pin"
                               value="${security.pin || ''}" maxlength="6" placeholder="أدخل رمز PIN"
                               onchange="AppSettings.update('security.pin', this.value); updateLockButton()"
                               pattern="[0-9]{4,6}" title="4-6 أرقام فقط" 
                               style="font-size: 18px; text-align: center; letter-spacing: 3px;">
                        <div class="form-text">سيستخدم لفتح الشاشة المقفلة</div>
                    </div>
                    <div id="passwordSection" style="${security.lockType === 'password' ? '' : 'display:none'}">
                        <label class="form-label">كلمة المرور</label>
                        <input type="password" class="form-control form-control-lg" id="setting-password"
                               value="${security.password || ''}" placeholder="أدخل كلمة المرور"
                               onchange="AppSettings.update('security.password', this.value); updateLockButton()"
                               minlength="4" title="4 أحرف على الأقل"
                               style="font-size: 16px;">
                        <div class="form-text">يجب أن تكون 4 أحرف على الأقل</div>
                    </div>
                </div>

                <!-- أزرار اختبار القفل -->
                <div class="row mb-3">
                    <div class="col-12">
                        <div class="d-grid gap-2 d-md-flex justify-content-md-end">
                            <button class="btn btn-outline-warning" onclick="testScreenLock()" 
                                    ${security.lockType === 'none' ? 'disabled' : ''}>
                                <i class="fas fa-vial me-2"></i>
                                اختبار القفل
                            </button>
                            <button class="btn btn-outline-info" onclick="resetSecuritySettings()">
                                <i class="fas fa-undo me-2"></i>
                                إعادة تعيين
                            </button>
                        </div>
                    </div>
                </div>

                <div class="alert alert-danger">
                    <i class="fas fa-lock"></i> تأكد من حفظ كلمة المرور أو رمز PIN في مكان آمن
                </div>
            </div>
        `;
    }

    /**
     * إنشاء تبويب التقارير والطباعة
     */
    /**
     * ملاحظة: الدالة createReportsTab — وصف تلقائي موجز لوظيفتها.
     * المدخلات: reports
     * المخرجات: راجع التنفيذ
     */
    /**
     * ملاحظة: الدالة createReportsTab — وصف تلقائي موجز لوظيفتها.
     * المدخلات: reports
     * المخرجات: راجع التنفيذ
     */
    function createReportsTab(reports) {
        return `
            <div class="settings-tab" id="reports-settings" style="display:none;">
                <h5 class="mb-4"><i class="fas fa-file-alt"></i> إعدادات التقارير والطباعة</h5>
                
                <!-- معلومات الشركة -->
                <div class="card mb-4">
                    <div class="card-header bg-primary text-white">
                        <h6 class="mb-0"><i class="fas fa-building"></i> معلومات الشركة</h6>
                    </div>
                    <div class="card-body">
                        <div class="row mb-3">
                            <div class="col-md-8">
                                <label class="form-label">اسم الشركة</label>
                                <input type="text" class="form-control" id="setting-companyName"
                                       value="${reports.companyName}" placeholder="أدخل اسم شركتك"
                                       onchange="AppSettings.update('reports.companyName', this.value)">
                                <small class="text-muted">سيظهر في رأس جميع التقارير</small>
                            </div>
                            <div class="col-md-4">
                                <label class="form-label">شعار الشركة</label>
                                <div class="d-flex align-items-center">
                                    <div id="logoPreview" class="border rounded p-2 me-2" style="width: 60px; height: 60px; display: flex; align-items: center; justify-content: center;">
                                        ${reports.companyLogo ? 
                                            `<img src="${reports.companyLogo}" style="max-width: 100%; max-height: 100%;">` : 
                                            '<i class="fas fa-image text-muted"></i>'}
                                    </div>
                                    <div>
                                        <input type="file" id="logoUpload" accept="image/*" style="display: none;"
                                               onchange="handleLogoUpload(this)">
                                        <button class="btn btn-sm btn-outline-primary" onclick="document.getElementById('logoUpload').click()">
                                            <i class="fas fa-upload"></i> رفع شعار
                                        </button>
                                        ${reports.companyLogo ? 
                                            `<button class="btn btn-sm btn-outline-danger ms-1" onclick="removeLogo()">
                                                <i class="fas fa-trash"></i>
                                            </button>` : ''}
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="row mb-3">
                            <div class="col-md-4">
                                <label class="form-label">رقم الهاتف</label>
                                <input type="tel" class="form-control" id="setting-companyPhone"
                                       value="${reports.companyPhone}" placeholder="مثال: 01-234567"
                                       onchange="AppSettings.update('reports.companyPhone', this.value)">
                            </div>
                            <div class="col-md-4">
                                <label class="form-label">البريد الإلكتروني</label>
                                <input type="email" class="form-control" id="setting-companyEmail"
                                       value="${reports.companyEmail}" placeholder="email@company.com"
                                       onchange="AppSettings.update('reports.companyEmail', this.value)">
                            </div>
                            <div class="col-md-4">
                                <label class="form-label">السجل التجاري</label>
                                <input type="text" class="form-control" id="setting-commercialRegister"
                                       value="${reports.commercialRegister}" placeholder="رقم السجل"
                                       onchange="AppSettings.update('reports.commercialRegister', this.value)">
                            </div>
                        </div>
                        
                        <div class="row mb-3">
                            <div class="col-md-8">
                                <label class="form-label">العنوان</label>
                                <input type="text" class="form-control" id="setting-companyAddress"
                                       value="${reports.companyAddress}" placeholder="العنوان الكامل"
                                       onchange="AppSettings.update('reports.companyAddress', this.value)">
                            </div>
                            <div class="col-md-4">
                                <label class="form-label">الرقم الضريبي</label>
                                <input type="text" class="form-control" id="setting-taxNumber"
                                       value="${reports.taxNumber}" placeholder="VAT Number"
                                       onchange="AppSettings.update('reports.taxNumber', this.value)">
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <label class="form-label">تذييل التقارير</label>
                            <textarea class="form-control" id="setting-reportFooter" rows="2"
                                      placeholder="نص مخصص يظهر في أسفل التقارير"
                                      onchange="AppSettings.update('reports.reportFooter', this.value)">${reports.reportFooter}</textarea>
                            <small class="text-muted">مثال: شكراً لتعاملكم معنا - جميع الأسعار شاملة الضريبة</small>
                        </div>
                    </div>
                </div>
                
                <!-- إعدادات التنسيق -->
                <div class="card mb-4">
                    <div class="card-header bg-secondary text-white">
                        <h6 class="mb-0"><i class="fas fa-cog"></i> إعدادات التنسيق والطباعة</h6>
                    </div>
                    <div class="card-body">
                        <div class="row mb-3">
                            <div class="col-md-4">
                                <label class="form-label">صيغة التاريخ</label>
                                <select class="form-select" id="setting-dateFormat"
                                        onchange="AppSettings.update('reports.dateFormat', this.value)">
                                    <option value="DD/MM/YYYY" ${reports.dateFormat === 'DD/MM/YYYY' ? 'selected' : ''}>31/12/2024</option>
                                    <option value="MM/DD/YYYY" ${reports.dateFormat === 'MM/DD/YYYY' ? 'selected' : ''}>12/31/2024</option>
                                    <option value="YYYY-MM-DD" ${reports.dateFormat === 'YYYY-MM-DD' ? 'selected' : ''}>2024-12-31</option>
                                    <option value="DD-MM-YYYY" ${reports.dateFormat === 'DD-MM-YYYY' ? 'selected' : ''}>31-12-2024</option>
                                </select>
                            </div>
                            <div class="col-md-4">
                                <label class="form-label">حجم الورق</label>
                                <select class="form-select" id="setting-paperSize"
                                        onchange="AppSettings.update('reports.paperSize', this.value)">
                                    <option value="A4" ${reports.paperSize === 'A4' ? 'selected' : ''}>A4 (210 × 297 مم)</option>
                                    <option value="Letter" ${reports.paperSize === 'Letter' ? 'selected' : ''}>Letter (8.5 × 11 بوصة)</option>
                                    <option value="Legal" ${reports.paperSize === 'Legal' ? 'selected' : ''}>Legal (8.5 × 14 بوصة)</option>
                                    <option value="A5" ${reports.paperSize === 'A5' ? 'selected' : ''}>A5 (148 × 210 مم)</option>
                                    <option value="custom" ${reports.paperSize === 'custom' ? 'selected' : ''}>مخصص</option>
                                </select>
                            </div>
                            <div class="col-md-4">
                                <label class="form-label">اتجاه الصفحة</label>
                                <select class="form-select" id="setting-orientation"
                                        onchange="AppSettings.update('reports.orientation', this.value)">
                                    <option value="portrait" ${reports.orientation === 'portrait' ? 'selected' : ''}>
                                        <i class="fas fa-file"></i> عمودي
                                    </option>
                                    <option value="landscape" ${reports.orientation === 'landscape' ? 'selected' : ''}>
                                        <i class="fas fa-file-landscape"></i> أفقي
                                    </option>
                                </select>
                            </div>
                        </div>
                        
                        <!-- هوامش الطباعة -->
                        <div class="mb-3">
                            <label class="form-label">هوامش الطباعة (مم)</label>
                            <div class="row g-2">
                                <div class="col-3">
                                    <div class="input-group input-group-sm">
                                        <span class="input-group-text">أعلى</span>
                                        <input type="number" class="form-control" value="${reports.margins.top}"
                                               min="0" max="50" step="5"
                                               onchange="updateMargin('top', this.value)">
                                    </div>
                                </div>
                                <div class="col-3">
                                    <div class="input-group input-group-sm">
                                        <span class="input-group-text">يمين</span>
                                        <input type="number" class="form-control" value="${reports.margins.right}"
                                               min="0" max="50" step="5"
                                               onchange="updateMargin('right', this.value)">
                                    </div>
                                </div>
                                <div class="col-3">
                                    <div class="input-group input-group-sm">
                                        <span class="input-group-text">أسفل</span>
                                        <input type="number" class="form-control" value="${reports.margins.bottom}"
                                               min="0" max="50" step="5"
                                               onchange="updateMargin('bottom', this.value)">
                                    </div>
                                </div>
                                <div class="col-3">
                                    <div class="input-group input-group-sm">
                                        <span class="input-group-text">يسار</span>
                                        <input type="number" class="form-control" value="${reports.margins.left}"
                                               min="0" max="50" step="5"
                                               onchange="updateMargin('left', this.value)">
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- خيارات إضافية -->
                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-check form-switch mb-2">
                                    <input class="form-check-input" type="checkbox" id="setting-showPageNumbers"
                                           ${reports.showPageNumbers ? 'checked' : ''} 
                                           onchange="AppSettings.update('reports.showPageNumbers', this.checked)">
                                    <label class="form-check-label" for="setting-showPageNumbers">
                                        عرض أرقام الصفحات
                                    </label>
                                </div>
                                <div class="form-check form-switch mb-2">
                                    <input class="form-check-input" type="checkbox" id="setting-showGridLines"
                                           ${reports.showGridLines ? 'checked' : ''} 
                                           onchange="AppSettings.update('reports.showGridLines', this.checked)">
                                    <label class="form-check-label" for="setting-showGridLines">
                                        عرض خطوط الجدول
                                    </label>
                                </div>
                                <div class="form-check form-switch">
                                    <input class="form-check-input" type="checkbox" id="setting-includeCharts"
                                           ${reports.includeCharts ? 'checked' : ''} 
                                           onchange="AppSettings.update('reports.includeCharts', this.checked)">
                                    <label class="form-check-label" for="setting-includeCharts">
                                        تضمين الرسوم البيانية
                                    </label>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-check form-switch mb-2">
                                    <input class="form-check-input" type="checkbox" id="setting-qrCode"
                                           ${reports.qrCode ? 'checked' : ''} 
                                           onchange="AppSettings.update('reports.qrCode', this.checked)">
                                    <label class="form-check-label" for="setting-qrCode">
                                        إضافة رمز QR للتحقق
                                    </label>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">علامة مائية</label>
                                    <input type="text" class="form-control form-control-sm" 
                                           value="${reports.watermark}" placeholder="نص العلامة المائية"
                                           onchange="AppSettings.update('reports.watermark', this.value)">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- معاينة -->
                <div class="card">
                    <div class="card-header bg-info text-white">
                        <h6 class="mb-0"><i class="fas fa-eye"></i> معاينة التقرير</h6>
                    </div>
                    <div class="card-body">
                        <button class="btn btn-primary" onclick="previewReportSettings()">
                            <i class="fas fa-file-pdf"></i> معاينة تقرير تجريبي
                        </button>
                        <button class="btn btn-secondary ms-2" onclick="testPrintSettings()">
                            <i class="fas fa-print"></i> اختبار الطباعة
                        </button>
                        <small class="d-block mt-2 text-muted">
                            سيتم تطبيق هذه الإعدادات على جميع التقارير المصدرة
                        </small>
                    </div>
                </div>

                
            </div>
        `;
    }

    /**
     * إنشاء تبويب الأداء
     */
    /**
     * ملاحظة: الدالة createPerformanceTab — وصف تلقائي موجز لوظيفتها.
     * المدخلات: performance
     * المخرجات: راجع التنفيذ
     */
    /**
     * ملاحظة: الدالة createPerformanceTab — وصف تلقائي موجز لوظيفتها.
     * المدخلات: performance
     * المخرجات: راجع التنفيذ
     */
    function createPerformanceTab(performance) {
        return `
            <div class="settings-tab" id="performance-settings" style="display:none;">
                <h5 class="mb-4"><i class="fas fa-tachometer-alt"></i> إعدادات الأداء</h5>
                
                <div class="row mb-3">
                    <div class="col-md-6">
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" id="setting-cacheEnabled"
                                   ${performance.cacheEnabled ? 'checked' : ''} 
                                   onchange="AppSettings.update('performance.cacheEnabled', this.checked)">
                            <label class="form-check-label" for="setting-cacheEnabled">
                                تفعيل الكاش الذكي
                            </label>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">حجم الكاش</label>
                        <select class="form-select" id="setting-cacheSize"
                                onchange="AppSettings.update('performance.cacheSize', this.value)">
                            <option value="small" ${performance.cacheSize === 'small' ? 'selected' : ''}>صغير (100 عنصر)</option>
                            <option value="medium" ${performance.cacheSize === 'medium' ? 'selected' : ''}>متوسط (200 عنصر)</option>
                            <option value="large" ${performance.cacheSize === 'large' ? 'selected' : ''}>كبير (500 عنصر)</option>
                        </select>
                    </div>
                </div>

                <div class="row mb-3">
                    <div class="col-md-4">
                        <label class="form-label">مدة الكاش (دقائق)</label>
                        <input type="number" class="form-control" id="setting-cacheDuration"
                               value="${performance.cacheDuration}" min="1" max="60" 
                               onchange="AppSettings.update('performance.cacheDuration', parseInt(this.value))">
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">عدد العناصر بالصفحة</label>
                        <input type="number" class="form-control" id="setting-itemsPerPage"
                               value="${performance.itemsPerPage}" min="10" max="100" step="5" 
                               onchange="AppSettings.update('performance.itemsPerPage', parseInt(this.value))">
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">فترة المزامنة (دقائق)</label>
                        <input type="number" class="form-control" id="setting-syncInterval"
                               value="${performance.syncInterval}" min="1" max="60" 
                               onchange="AppSettings.update('performance.syncInterval', parseInt(this.value))">
                    </div>
                </div>

                <div class="row mb-3">
                    <div class="col-md-4">
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" id="setting-lazyLoading"
                                   ${performance.lazyLoading ? 'checked' : ''} 
                                   onchange="AppSettings.update('performance.lazyLoading', this.checked)">
                            <label class="form-check-label" for="setting-lazyLoading">
                                التحميل الكسول
                            </label>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" id="setting-offlineMode"
                                   ${performance.offlineMode ? 'checked' : ''} 
                                   onchange="AppSettings.update('performance.offlineMode', this.checked)">
                            <label class="form-check-label" for="setting-offlineMode">
                                الوضع دون اتصال
                            </label>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" id="setting-powerSaveMode"
                                   ${performance.powerSaveMode ? 'checked' : ''} 
                                   onchange="AppSettings.update('performance.powerSaveMode', this.checked)">
                            <label class="form-check-label" for="setting-powerSaveMode">
                                وضع توفير الطاقة
                            </label>
                        </div>
                    </div>
                </div>

                <button class="btn btn-warning" onclick="if(typeof balanceCache !== 'undefined') { balanceCache.clear(); reportCache.clear(); showNotification('تم مسح الكاش', 'success'); }">
                    <i class="fas fa-broom"></i> مسح الكاش
                </button>
            </div>
        `;
    }

    /**
     * وظائف مساعدة لتعيين القيم
     */
    /**
     * ملاحظة: الدالة setElementValue — وصف تلقائي موجز لوظيفتها.
     * المدخلات: id, value
     * المخرجات: راجع التنفيذ
     */
    /**
     * ملاحظة: الدالة setElementValue — وصف تلقائي موجز لوظيفتها.
     * المدخلات: id, value
     * المخرجات: راجع التنفيذ
     */
    function setElementValue(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.value = value;
        }
    }

    /**
     * ملاحظة: الدالة setElementChecked — وصف تلقائي موجز لوظيفتها.
     * المدخلات: id, checked
     * المخرجات: راجع التنفيذ
     */
    /**
     * ملاحظة: الدالة setElementChecked — وصف تلقائي موجز لوظيفتها.
     * المدخلات: id, checked
     * المخرجات: راجع التنفيذ
     */
    function setElementChecked(id, checked) {
        const element = document.getElementById(id);
        if (element) {
            element.checked = checked;
        }
    }

    // تحديث اسم الشريك
    window.updatePartnerName = function(index, value){
        try {
            const s = AppSettings.getAll();
            s.reports = s.reports || {};
            s.reports.partners = s.reports.partners || {};
            s.reports.partners.list = s.reports.partners.list || [];
            if (s.reports.partners.list[index]) {
                s.reports.partners.list[index].name = value;
                AppSettings.update('reports.partners', s.reports.partners);
            }
        } catch(_) {}
    };

    // تحديث نسبة الشريك
    window.updatePartnerPercent = function(index, value){
        try {
            const s = AppSettings.getAll();
            s.reports = s.reports || {};
            s.reports.partners = s.reports.partners || {};
            s.reports.partners.list = s.reports.partners.list || [];
            if (s.reports.partners.list[index]) {
                const v = value ? parseFloat(value) : null;
                s.reports.partners.list[index].sharePercent = isNaN(v) ? null : v;
                AppSettings.update('reports.partners', s.reports.partners);
            }
        } catch(_) {}
    };

    // إضافة سحب شريك للفترة الحالية
    window.addPartnerAdjustment = function(){
        try {
            const s = AppSettings.getAll();
            s.reports = s.reports || {};
            const P = s.reports.partners || (s.reports.partners = {});
            const pf = (typeof getPartnersPeriodRange==='function')?getPartnersPeriodRange():{fromDate:'',toDate:'',text:''};
            const periodKey = (pf.fromDate||'')+'_'+(pf.toDate||'');
            const list = (P.adjustments && P.adjustments[periodKey]) ? P.adjustments[periodKey] : [];
            const pid = document.getElementById('partnerAdjPartner').value;
            const amount = parseFloat(document.getElementById('partnerAdjAmount').value)||0;
            const date = document.getElementById('partnerAdjDate').value;
            if (amount>0 && pid) {
                list.push({ partnerId: pid, amount: amount, date: date, notes: '' });
                P.adjustments = P.adjustments || {};
                P.adjustments[periodKey] = list;
                AppSettings.update('reports.partners', P);
                if (typeof showNotification==='function') showNotification('تم إضافة سحب الشريك', 'success');
                document.getElementById('partnerAdjAmount').value = '';
            }
        } catch(_) {}
    };

    /**
     * تصدير الإعدادات
     */
    /**
     * ملاحظة: الدالة exportSettings — وصف تلقائي موجز لوظيفتها.
     * المدخلات: بدون
     * المخرجات: راجع التنفيذ
     */
    /**
     * ملاحظة: الدالة exportSettings — وصف تلقائي موجز لوظيفتها.
     * المدخلات: بدون
     * المخرجات: راجع التنفيذ
     */
    function exportSettings() {
        const jsonString = AppSettings.export();
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `settings_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        if (typeof showNotification === 'function') {
            showNotification('تم تصدير الإعدادات بنجاح', 'success');
        }
    }

    /**
     * استيراد الإعدادات
     */
    /**
     * ملاحظة: الدالة importSettings — وصف تلقائي موجز لوظيفتها.
     * المدخلات: بدون
     * المخرجات: راجع التنفيذ
     */
    /**
     * ملاحظة: الدالة importSettings — وصف تلقائي موجز لوظيفتها.
     * المدخلات: بدون
     * المخرجات: راجع التنفيذ
     */
    function importSettings() {
        const fileInput = document.getElementById('importSettingsFile');
        if (!fileInput || !fileInput.files.length) {
            if (typeof showNotification === 'function') {
                showNotification('الرجاء اختيار ملف الإعدادات', 'warning');
            }
            return;
        }

        const file = fileInput.files[0];
        const reader = new FileReader();
        
        /**
         * ملاحظة: الدالة reader.onload — وصف تلقائي موجز لوظيفتها.
         * المدخلات: e
         * المخرجات: راجع التنفيذ
         */
        reader.onload = function(e) {
            try {
                const success = AppSettings.import(e.target.result);
                if (success) {
                    loadSettingsToUI();
                    createSettingsTabs();
                }
            } catch (error) {
                console.error('خطأ في استيراد الإعدادات:', error);
                if (typeof showNotification === 'function') {
                    showNotification('فشل استيراد الإعدادات', 'error');
                }
            }
        };
        
        reader.readAsText(file);
    }

    /**
     * معالجة رفع الشعار
     */
    /**
     * ملاحظة: الدالة window.handleLogoUpload — وصف تلقائي موجز لوظيفتها.
     * المدخلات: input
     * المخرجات: راجع التنفيذ
     */
    window.handleLogoUpload = function(input) {
        const file = input.files[0];
        if (!file) return;
        
        // التحقق من حجم الملف (500KB كحد أقصى)
        if (file.size > 500 * 1024) {
            showNotification('حجم الملف كبير جداً. الحد الأقصى 500KB', 'warning');
            return;
        }
        
        // التحقق من نوع الملف
        if (!file.type.startsWith('image/')) {
            showNotification('الرجاء اختيار ملف صورة', 'warning');
            return;
        }
        
        const reader = new FileReader();
        /**
         * ملاحظة: الدالة reader.onload — وصف تلقائي موجز لوظيفتها.
         * المدخلات: e
         * المخرجات: راجع التنفيذ
         */
        reader.onload = function(e) {
            const img = new Image();
            /**
             * ملاحظة: الدالة img.onload — وصف تلقائي موجز لوظيفتها.
             * المدخلات: بدون
             * المخرجات: راجع التنفيذ
             */
            img.onload = function() {
                // تحديد الحجم المناسب (200x200 كحد أقصى)
                const maxSize = 200;
                let width = img.width;
                let height = img.height;
                
                if (width > maxSize || height > maxSize) {
                    if (width > height) {
                        height = (height * maxSize) / width;
                        width = maxSize;
                    } else {
                        width = (width * maxSize) / height;
                        height = maxSize;
                    }
                }
                
                // إنشاء canvas لتصغير الصورة
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                // تحويل إلى base64
                const base64 = canvas.toDataURL('image/png');
                
                // حفظ في الإعدادات
                AppSettings.update('reports.companyLogo', base64);
                
                // تحديث المعاينة
                document.getElementById('logoPreview').innerHTML = 
                    `<img src="${base64}" style="max-width: 100%; max-height: 100%;">`;
                
                // إظهار زر الحذف
                const deleteBtn = document.querySelector('#logoPreview').nextElementSibling.querySelector('.btn-outline-danger');
                if (!deleteBtn) {
                    document.querySelector('#logoPreview').nextElementSibling.innerHTML += 
                        `<button class="btn btn-sm btn-outline-danger ms-1" onclick="removeLogo()">
                            <i class="fas fa-trash"></i>
                        </button>`;
                }
                
                showNotification('تم رفع الشعار بنجاح', 'success');
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    };

    /**
     * حذف الشعار
     */
    /**
     * ملاحظة: الدالة window.removeLogo — وصف تلقائي موجز لوظيفتها.
     * المدخلات: بدون
     * المخرجات: راجع التنفيذ
     */
    window.removeLogo = function() {
        AppSettings.update('reports.companyLogo', '');
        document.getElementById('logoPreview').innerHTML = '<i class="fas fa-image text-muted"></i>';
        
        // إخفاء زر الحذف
        const deleteBtn = document.querySelector('#logoPreview').nextElementSibling.querySelector('.btn-outline-danger');
        if (deleteBtn) {
            deleteBtn.remove();
        }
        
        showNotification('تم حذف الشعار', 'info');
    };

    /**
     * تحديث الهوامش
     */
    /**
     * ملاحظة: الدالة window.updateMargin — وصف تلقائي موجز لوظيفتها.
     * المدخلات: side, value
     * المخرجات: راجع التنفيذ
     */
    window.updateMargin = function(side, value) {
        const margins = AppSettings.getAll().reports.margins;
        margins[side] = parseInt(value) || 0;
        AppSettings.update('reports.margins', margins);
    };

    /**
     * معاينة إعدادات التقرير
     */
    /**
     * ملاحظة: الدالة window.previewReportSettings — وصف تلقائي موجز لوظيفتها.
     * المدخلات: بدون
     * المخرجات: راجع التنفيذ
     */
    window.previewReportSettings = function() {
        const settings = AppSettings.getAll().reports;
        
        // إنشاء تقرير تجريبي
        const previewHTML = `
            <!DOCTYPE html>
            <html dir="rtl">
            <head>
                <meta charset="UTF-8">
                <title>معاينة التقرير</title>
                <style>
                    @page {
                        size: ${settings.paperSize} ${settings.orientation};
                        margin: ${settings.margins.top}mm ${settings.margins.right}mm ${settings.margins.bottom}mm ${settings.margins.left}mm;
                    }
                    body {
                        font-family: Arial, sans-serif;
                        direction: rtl;
                        margin: 0;
                        padding: 20px;
                    }
                    .header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        border-bottom: 2px solid #333;
                        padding-bottom: 20px;
                        margin-bottom: 20px;
                    }
                    .logo img {
                        max-height: 80px;
                    }
                    .company-info h1 {
                        margin: 0;
                        color: #333;
                    }
                    .company-details {
                        color: #666;
                        font-size: 14px;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        ${settings.showGridLines ? 'border: 1px solid #ddd;' : ''}
                    }
                    th, td {
                        padding: 10px;
                        text-align: right;
                        ${settings.showGridLines ? 'border: 1px solid #ddd;' : 'border-bottom: 1px solid #eee;'}
                    }
                    th {
                        background-color: #f5f5f5;
                        font-weight: bold;
                    }
                    .footer {
                        margin-top: 50px;
                        padding-top: 20px;
                        border-top: 1px solid #ddd;
                        text-align: center;
                        color: #666;
                    }
                    ${settings.watermark ? `
                    body::before {
                        content: "${settings.watermark}";
                        position: fixed;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%) rotate(-45deg);
                        font-size: 120px;
                        color: rgba(0,0,0,0.05);
                        z-index: -1;
                    }` : ''}
                    ${settings.showPageNumbers ? `
                    @page {
                        @bottom-center {
                            content: "صفحة " counter(page) " من " counter(pages);
                        }
                    }` : ''}
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="company-info">
                        <h1>${settings.companyName || 'اسم الشركة'}</h1>
                        <div class="company-details">
                            ${settings.companyPhone ? `<div>هاتف: ${settings.companyPhone}</div>` : ''}
                            ${settings.companyEmail ? `<div>بريد: ${settings.companyEmail}</div>` : ''}
                            ${settings.companyAddress ? `<div>العنوان: ${settings.companyAddress}</div>` : ''}
                            ${settings.commercialRegister ? `<div>س.ت: ${settings.commercialRegister}</div>` : ''}
                            ${settings.taxNumber ? `<div>ر.ض: ${settings.taxNumber}</div>` : ''}
                        </div>
                    </div>
                    ${settings.companyLogo ? `
                    <div class="logo">
                        <img src="${settings.companyLogo}" alt="شعار الشركة">
                    </div>` : ''}
                </div>
                
                <h2>تقرير المبيعات - ${moment().format(settings.dateFormat)}</h2>
                
                <table>
                    <thead>
                        <tr>
                            <th>التاريخ</th>
                            <th>المتجر</th>
                            <th>المنتج</th>
                            <th>الكمية</th>
                            <th>السعر</th>
                            <th>الإجمالي</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>${moment().format(settings.dateFormat)}</td>
                            <td>متجر الرئيسي</td>
                            <td>منتج تجريبي</td>
                            <td>10</td>
                            <td>100 ريال</td>
                            <td>1,000 ريال</td>
                        </tr>
                        <tr>
                            <td>${moment().subtract(1, 'day').format(settings.dateFormat)}</td>
                            <td>الفرع الأول</td>
                            <td>منتج آخر</td>
                            <td>5</td>
                            <td>200 ريال</td>
                            <td>1,000 ريال</td>
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr>
                            <th colspan="5">الإجمالي</th>
                            <th>2,000 ريال</th>
                        </tr>
                    </tfoot>
                </table>
                
                ${settings.qrCode ? `
                <div style="text-align: center; margin-top: 30px;">
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=REPORT-${Date.now()}" alt="QR Code">
                    <div style="font-size: 12px; color: #666;">رمز التحقق</div>
                </div>` : ''}
                
                <div class="footer">
                    ${settings.reportFooter || 'شكراً لتعاملكم معنا'}
                </div>
            </body>
            </html>
        `;
        
        // فتح نافذة المعاينة
        const previewWindow = window.open('', '_blank');
        if (!previewWindow) { return null; }
        try {
            previewWindow.document.open();
            previewWindow.document.write(previewHTML);
            previewWindow.document.close();
        } catch(_) {}
        return previewWindow;
    };

    /**
     * اختبار إعدادات الطباعة
     */
    /**
     * ملاحظة: الدالة window.testPrintSettings — وصف تلقائي موجز لوظيفتها.
     * المدخلات: بدون
     * المخرجات: راجع التنفيذ
     */
    window.testPrintSettings = function() {
        const w = previewReportSettings();
        if (w) {
            try { w.focus(); } catch(_) {}
            setTimeout(() => { try { w.print(); } catch(_) {} }, 500);
        }
    };

    // دوال مساعدة لإعدادات الأمان
    window.toggleLockCredentials = function(lockType) {
        const lockCredentials = document.getElementById('lockCredentials');
        const pinSection = document.getElementById('pinSection');
        const passwordSection = document.getElementById('passwordSection');
        const testButton = document.querySelector('button[onclick="testScreenLock()"]');
        
        if (lockCredentials) {
            if (lockType === 'none') {
                lockCredentials.style.display = 'none';
                if (testButton) testButton.disabled = true;
            } else {
                lockCredentials.style.display = '';
                if (testButton) testButton.disabled = false;
            }
        }
        
        if (pinSection) {
            pinSection.style.display = lockType === 'pin' ? '' : 'none';
        }
        
        if (passwordSection) {
            passwordSection.style.display = lockType === 'password' ? '' : 'none';
        }
    };
    
    // دالة تحديث ظهور زر القفل
    window.updateLockButton = function() {
        // استدعاء دالة التحديث من نظام القفل
        if (typeof window.screenLock !== 'undefined' && window.screenLock.updateLockButtonVisibility) {
            window.screenLock.updateLockButtonVisibility();
        }
    };
    
    window.testScreenLock = function() {
        if (typeof window.screenLock !== 'undefined') {
            window.screenLock.testLock();
        } else {
            showNotification('نظام قفل الشاشة غير متاح', 'error');
        }
    };
    
    window.resetSecuritySettings = function() {
        if (confirm('هل أنت متأكد من إعادة تعيين إعدادات الأمان؟')) {
            AppSettings.reset('security');
            if (typeof refreshSettings === 'function') {
                refreshSettings();
            }
            showNotification('تم إعادة تعيين إعدادات الأمان', 'info');
        }
    };

    // تصدير الوظائف للاستخدام العام
    window.SettingsUI = {
        init: initSettingsUI,
        switchTab: switchSettingsTab,
        reload: loadSettingsToUI,
        export: exportSettings,
        import: importSettings
    };

    // تهيئة الواجهة: إن كان DOM جاهزاً الآن نفّذ مباشرة، وإلا انتظر التحميل
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSettingsUI);
    } else {
        initSettingsUI();
    }

})();