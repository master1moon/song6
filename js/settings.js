/**
 * ملف settings.js - نظام إدارة الإعدادات المتقدم
 * يوفر واجهة شاملة لتخصيص جميع جوانب التطبيق
 * يدعم الحفظ الذكي مع إمكانية التراجع والاستعادة
 * يتكامل بسلاسة مع جميع وظائف التطبيق الموجودة
 */

(function() {
    'use strict';

    /**
     * كائن الإعدادات الافتراضية
     * يحتوي على جميع الإعدادات القابلة للتخصيص مع قيمها الافتراضية
     * مصمم ليتوافق مع الوضع الحالي للتطبيق لضمان عدم حدوث تعارض
     */
    const defaultSettings = {
        // إعدادات العرض والمظهر
        display: {
            theme: 'dark',               // المظهر: light | dark | auto - الافتراضي داكن
            fontSize: 'medium',          // حجم الخط: tiny | small | medium | large | xlarge | huge | massive
            fontWeight: 'normal',        // وزن الخط: thin | light | normal | medium | semibold | bold | extrabold | black
            fontStyle: 'normal',         // نمط الخط: normal | italic
            textDecoration: 'none',      // زخرفة النص: none | underline | overline | line-through
            letterSpacing: 'normal',     // تباعد الأحرف: tight | normal | wide | wider | widest
            lineHeight: 'normal',        // ارتفاع السطر: compact | normal | relaxed | loose
            fontFamily: 'default',       // نوع الخط
            primaryColor: '#c4123f',     // اللون الرئيسي
            secondaryColor: '#6c757d',   // اللون الثانوي
            textColor: '#212529',        // لون النص
            density: 'normal',           // كثافة العرض: ultra-compact | compact | normal | comfortable | spacious
            animations: true,            // تفعيل الحركات
            showIcons: true,            // عرض الأيقونات
            roundedCorners: true,       // الزوايا المستديرة
            sidebarPosition: 'right'    // موضع الشريط الجانبي
        },

        // إعدادات المالية والعملة
        financial: {
            currency: 'YER',             // رمز العملة
            currencyName: 'ريال',         // اسم العملة
            currencyPosition: 'after',   // موضع العملة: before | after
            decimalSeparator: '.',       // الفاصل العشري
            thousandsSeparator: ',',     // فاصل الآلاف
            decimals: 2,                 // عدد الخانات العشرية
            numberFormat: 'en',          // صيغة الأرقام: ar | en
            taxRate: 15,                 // نسبة الضريبة %
            taxIncluded: false,          // الضريبة مضمنة في السعر
            roundingMethod: 'normal',    // طريقة التقريب
            showZeroDecimals: false,     // عرض الأصفار العشرية
            negativeFormat: 'minus'      // صيغة الأرقام السالبة
        },

        // إعدادات التنبيهات والإشعارات
        notifications: {
            enabled: true,                          // تفعيل التنبيهات
            position: 'top-right',                  // موضع التنبيهات
            duration: 3000,                         // مدة العرض (مللي ثانية)
            soundEnabled: true,                     // الأصوات
            soundVolume: 50,                        // مستوى الصوت %
            browserNotifications: false,            // إشعارات المتصفح
            lowStock: {
                enabled: true,                      // تنبيه المخزون المنخفض
                threshold: 10,                      // الحد الأدنى
                urgentThreshold: 5,                 // الحد الحرج
                checkInterval: 'daily'              // فترة الفحص
            },
            dueDates: {
                enabled: true,                      // تنبيه المواعيد المستحقة
                daysBefore: 3,                      // عدد الأيام قبل الاستحقاق
                reminderTime: '09:00',              // وقت التذكير
                repeatReminder: true                // تكرار التذكير
            },
            targets: {
                enabled: true,                      // تنبيهات الأهداف
                dailyTarget: true,                  // الهدف اليومي
                weeklyTarget: true,                 // الهدف الأسبوعي
                monthlyTarget: true                 // الهدف الشهري
            }
        },

        // إعدادات النسخ الاحتياطي والمزامنة
        backup: {
            autoBackup: true,                      // النسخ التلقائي
            frequency: 'daily',                    // التكرار: hourly | daily | weekly | monthly
            time: '02:00',                        // وقت النسخ
            keepCount: 7,                         // عدد النسخ المحفوظة
            location: 'local',                    // المكان: local | github | gdrive | dropbox
            compress: true,                       // ضغط البيانات
            encrypt: true,                        // تشفير النسخ
            includeSettings: true,                // تضمين الإعدادات
            includeReports: false,                // تضمين التقارير
            notifyOnSuccess: false,               // إشعار عند النجاح
            notifyOnFailure: true,                // إشعار عند الفشل
            autoRestore: false,                   // استعادة تلقائية عند الخطأ
            cloudSync: false                      // المزامنة السحابية
        },

        // إعدادات الأمان والخصوصية
        security: {
            appLock: false,                       // قفل التطبيق
            lockType: 'none',                     // نوع القفل: none | pin | password | pattern | biometric
            autoLockMinutes: 15,                  // القفل التلقائي (دقائق)
            pinLength: 4,                         // طول رمز PIN
            passwordMinLength: 8,                 // الحد الأدنى لكلمة المرور
            requireUppercase: true,               // طلب أحرف كبيرة
            requireNumbers: true,                 // طلب أرقام
            requireSpecialChars: false,           // طلب رموز خاصة
            encryptSensitive: true,               // تشفير البيانات الحساسة
            hideBalances: false,                  // إخفاء الأرصدة
            blurSensitive: false,                 // طمس البيانات الحساسة
            activityLog: true,                    // سجل النشاطات
            maxLoginAttempts: 5,                  // محاولات الدخول القصوى
            sessionTimeout: 30,                   // مهلة الجلسة (دقائق)
            twoFactorAuth: false                  // التحقق بخطوتين
        },

        // إعدادات التقارير والطباعة
        reports: {
            companyName: '',                      // اسم الشركة
            companyLogo: '',                      // شعار الشركة (base64)
            companyPhone: '',                     // هاتف الشركة
            companyEmail: '',                     // بريد الشركة
            companyAddress: '',                   // عنوان الشركة
            commercialRegister: '',               // السجل التجاري
            taxNumber: '',                        // الرقم الضريبي
            reportFooter: '',                     // تذييل التقارير
            dateFormat: 'DD/MM/YYYY',            // صيغة التاريخ
            timeFormat: '24h',                    // صيغة الوقت: 12h | 24h
            paperSize: 'A4',                      // حجم الورق
            orientation: 'portrait',              // الاتجاه: portrait | landscape
            margins: {
                top: 20,
                right: 20,
                bottom: 20,
                left: 20
            },
            showGridLines: true,                  // عرض خطوط الشبكة
            showPageNumbers: true,                // عرض أرقام الصفحات
            defaultExportFormat: 'pdf',          // الصيغة الافتراضية: pdf | excel | csv
            includeCharts: true,                  // تضمين الرسوم البيانية
            watermark: '',                        // العلامة المائية
            qrCode: false                         // رمز QR للتحقق
        },
        // إعدادات الشركاء (جديدة)
        partners: {
            count: 2,                            // عدد الشركاء
            list: [                              // قائمة الشركاء (أسماء ونِسَب اختيارية)
                { id: 'p1', name: 'الشريك 1', sharePercent: null },
                { id: 'p2', name: 'الشريك 2', sharePercent: null }
            ],
            distribution: 'equal',               // equal | percent
            adjustments: {},                     // سحوبات الشركاء حسب الفترة { periodKey: [{partnerId, amount, date, notes}] }
            carryover: {}                        // أرصدة مرحّلة لكل شريك { partnerId: number }
        },

        // إعدادات الأداء والكاش
        performance: {
            cacheEnabled: true,                   // تفعيل الكاش
            cacheSize: 'medium',                  // الحجم: small | medium | large
            cacheDuration: 10,                    // المدة (دقائق)
            lazyLoading: true,                    // التحميل الكسول
            itemsPerPage: 25,                     // عدد العناصر بالصفحة
            preloadData: true,                    // تحميل البيانات مسبقاً
            virtualScrolling: false,              // التمرير الافتراضي
            imageOptimization: true,              // تحسين الصور
            compressionLevel: 'medium',           // مستوى الضغط
            offlineMode: true,                    // الوضع دون اتصال
            syncInterval: 5,                      // فترة المزامنة (دقائق)
            reducedMotion: false,                 // تقليل الحركة
            powerSaveMode: false                  // وضع توفير الطاقة
        },

        // إعدادات المخزون والمنتجات
        inventory: {
            trackStock: true,                     // تتبع المخزون
            allowNegativeStock: false,            // السماح بمخزون سالب
            defaultUnit: 'قطعة',                  // الوحدة الافتراضية
            showStockAlerts: true,                // عرض تنبيهات المخزون
            autoReorder: false,                   // إعادة الطلب التلقائي
            reorderPoint: 10,                     // نقطة إعادة الطلب
            barcodeScanning: false,               // مسح الباركود
            batchTracking: false,                 // تتبع الدفعات
            expiryTracking: false,                // تتبع الصلاحية
            serialTracking: false,                // تتبع الأرقام التسلسلية
            categoriesEnabled: true,              // تفعيل التصنيفات
            brandsEnabled: false,                 // تفعيل العلامات التجارية
            variantsEnabled: false,               // تفعيل المتغيرات
            priceHistory: true                    // سجل الأسعار
        },

        // إعدادات المبيعات والفواتير
        sales: {
            invoicePrefix: 'INV-',                // بادئة الفاتورة
            startingNumber: 1,                    // رقم البداية
            autoIncrementNumber: true,            // ترقيم تلقائي
            requireCustomer: true,                // طلب اختيار عميل
            defaultPaymentMethod: 'cash',         // طريقة الدفع الافتراضية
            allowPartialPayment: true,            // السماح بالدفع الجزئي
            allowDiscount: true,                  // السماح بالخصومات
            maxDiscountPercent: 50,               // أقصى نسبة خصم %
            requireDiscountReason: false,         // طلب سبب الخصم
            printAfterSave: false,                // طباعة بعد الحفظ
            emailAfterSave: false,                // إرسال بالبريد بعد الحفظ
            showProfitInSales: false,            // عرض الربح في المبيعات
            allowPriceEdit: true,                 // السماح بتعديل السعر
            returnPeriodDays: 7,                  // فترة الإرجاع (أيام)
            requireReturnReason: true             // طلب سبب الإرجاع
        },

        // إعدادات العملاء والموردين
        customers: {
            requirePhone: false,                  // طلب رقم الهاتف
            requireEmail: false,                  // طلب البريد الإلكتروني
            requireAddress: false,                // طلب العنوان
            creditLimit: true,                    // حد الائتمان
            defaultCreditLimit: 10000,           // الحد الافتراضي
            loyaltyProgram: false,                // برنامج الولاء
            pointsPerCurrency: 1,                 // نقاط لكل عملة
            birthdayReminders: false,             // تذكير بأعياد الميلاد
            customerGroups: true,                 // مجموعات العملاء
            priceListsEnabled: false,             // قوائم الأسعار
            statementPeriod: 'monthly',          // فترة الكشف
            autoArchiveInactive: false,          // أرشفة غير النشطين تلقائياً
            inactiveDays: 365                    // أيام عدم النشاط
        },

        // إعدادات متقدمة للمطورين
        advanced: {
            debugMode: false,                     // وضع التطوير
            showConsoleErrors: false,             // عرض أخطاء وحدة التحكم
            performanceMonitor: false,            // مراقب الأداء
            apiEndpoint: '',                      // نقطة نهاية API
            apiKey: '',                          // مفتاح API
            webhooksEnabled: false,               // تفعيل Webhooks
            webhookUrl: '',                      // رابط Webhook
            customCSS: '',                       // CSS مخصص
            customJS: '',                        // JavaScript مخصص
            experimentalFeatures: false,         // الميزات التجريبية
            // أعلام التشغيل (Feature Flags) - افتراضياً متوقفة، لا تغيّر سلوك التطبيق إلا عند التفعيل الصريح
            flags: {
                safeJsonParse: false,            // تغليف JSON.parse لمنع الأعطال عند تلف البيانات
                safeDomRendering: false,         // استخدام طرق عرض DOM آمنة بدلاً من innerHTML حيثما أمكن
                idbChunking: false,              // تفريغ/مزامنة IndexedDB على دفعات لتجنب تجمّد الواجهة
                enhancedGithubErrors: false,     // رسائل أخطاء تفصيلية لمزامنة GitHub
                strictDateNormalization: false   // تطبيع تاريخ صارم قبل الفلترة/الحساب
            },
            telemetry: false,                    // إرسال بيانات الاستخدام
            errorReporting: true,                // تقارير الأخطاء
            maintenanceMode: false,              // وضع الصيانة
            dataRetentionDays: 0,                // فترة الاحتفاظ بالبيانات (0 = دائم)
            allowDataExport: true,               // السماح بتصدير البيانات
            allowDataImport: true                // السماح باستيراد البيانات
        }
    };

    /**
     * كائن الإعدادات الحالية
     * يتم تحميله من التخزين المحلي أو استخدام القيم الافتراضية
     */
    let currentSettings = {};
    let settingsHistory = [];              // سجل التغييرات للتراجع
    let unsavedChanges = {};              // التغييرات غير المحفوظة
    let autoSaveTimer = null;             // مؤقت الحفظ التلقائي

    /**
     * تحميل الإعدادات من التخزين المحلي
     * يدمج الإعدادات المحفوظة مع الافتراضية لضمان وجود جميع المفاتيح
     */
    /**
     * ملاحظة: الدالة loadSettings — وصف تلقائي موجز لوظيفتها.
     * المدخلات: بدون
     * المخرجات: راجع التنفيذ
     */
    /**
     * ملاحظة: الدالة loadSettings — وصف تلقائي موجز لوظيفتها.
     * المدخلات: بدون
     * المخرجات: راجع التنفيذ
     */
    function loadSettings() {
        try {
            const saved = localStorage.getItem('appSettings');
            if (saved) {
                const parsed = (typeof safeJsonParse === 'function' && typeof FeatureFlags !== 'undefined' && FeatureFlags.isEnabled('safeJsonParse')) ? safeJsonParse(saved, {}) : JSON.parse(saved);
                // دمج عميق للإعدادات المحفوظة مع الافتراضية
                currentSettings = deepMerge(defaultSettings, parsed);
            } else {
                currentSettings = JSON.parse(JSON.stringify(defaultSettings));
            }
            
            // تطبيق الإعدادات المحملة
            applySettings(currentSettings);
            
            // حفظ الحالة الأولية في التاريخ
            settingsHistory = [];
            settingsHistory.push(JSON.stringify(currentSettings));
            
            console.log('تم تحميل الإعدادات بنجاح');
        } catch (error) {
            console.error('خطأ في تحميل الإعدادات:', error);
            currentSettings = JSON.parse(JSON.stringify(defaultSettings));
        }
    }

    /**
     * حفظ الإعدادات في التخزين المحلي
     * يدعم الحفظ الذكي مع إمكانية التراجع
     * @param {boolean} immediate - حفظ فوري أم مؤجل
     */
    /**
     * ملاحظة: الدالة saveSettings — وصف تلقائي موجز لوظيفتها.
     * المدخلات: immediate = false
     * المخرجات: راجع التنفيذ
     */
    /**
     * ملاحظة: الدالة saveSettings — وصف تلقائي موجز لوظيفتها.
     * المدخلات: immediate = false
     * المخرجات: راجع التنفيذ
     */
    function saveSettings(immediate = false) {
        if (!immediate && autoSaveTimer) {
            clearTimeout(autoSaveTimer);
        }

        /**
         * ملاحظة: الدالة doSave — وصف تلقائي موجز لوظيفتها.
         * المدخلات: بدون
         * المخرجات: راجع التنفيذ
         */
        /**
         * ملاحظة: الدالة doSave — وصف تلقائي موجز لوظيفتها.
         * المدخلات: بدون
         * المخرجات: راجع التنفيذ
         */
        const doSave = () => {
            try {
                // حفظ في السجل للتراجع
                if (settingsHistory.length >= 10) {
                    settingsHistory.shift(); // الاحتفاظ بآخر 10 تغييرات فقط
                }
                settingsHistory.push(JSON.stringify(currentSettings));

                // حفظ في التخزين المحلي
                localStorage.setItem('appSettings', JSON.stringify(currentSettings));
                localStorage.setItem('appSettingsBackup', JSON.stringify(currentSettings));
                localStorage.setItem('appSettingsTimestamp', new Date().toISOString());

                // مسح التغييرات غير المحفوظة
                unsavedChanges = {};

                // إشعار بالحفظ
                if (typeof showNotification === 'function') {
                    showNotification('تم حفظ الإعدادات بنجاح', 'success');
                }

                console.log('تم حفظ الإعدادات');
                return true;
            } catch (error) {
                console.error('خطأ في حفظ الإعدادات:', error);
                if (typeof showNotification === 'function') {
                    showNotification('فشل حفظ الإعدادات', 'error');
                }
                return false;
            }
        };

        if (immediate) {
            return doSave();
        } else {
            // حفظ مؤجل بعد 2 ثانية من آخر تغيير
            autoSaveTimer = setTimeout(doSave, 2000);
        }
    }

    /**
     * تطبيق الإعدادات على التطبيق
     * يحدث جميع الوظائف المتأثرة بالإعدادات
     * @param {object} settings - الإعدادات المراد تطبيقها
     */
    /**
     * ملاحظة: الدالة applySettings — وصف تلقائي موجز لوظيفتها.
     * المدخلات: settings
     * المخرجات: راجع التنفيذ
     */
    /**
     * ملاحظة: الدالة applySettings — وصف تلقائي موجز لوظيفتها.
     * المدخلات: settings
     * المخرجات: راجع التنفيذ
     */
    function applySettings(settings) {
        // تطبيق إعدادات العرض
        applyDisplaySettings(settings.display);
        
        // تطبيق إعدادات المالية
        applyFinancialSettings(settings.financial);
        
        // تطبيق إعدادات التنبيهات
        applyNotificationSettings(settings.notifications);
        
        // تطبيق إعدادات الأداء
        applyPerformanceSettings(settings.performance);
        
        // تطبيق إعدادات الأمان
        applySecuritySettings(settings.security);

        // إطلاق حدث تغيير الإعدادات
        document.dispatchEvent(new CustomEvent('settingsChanged', { 
            detail: settings 
        }));
    }

    /**
     * تطبيق إعدادات العرض والمظهر
     */
    /**
     * ملاحظة: الدالة applyDisplaySettings — وصف تلقائي موجز لوظيفتها.
     * المدخلات: display
     * المخرجات: راجع التنفيذ
     */
    /**
     * ملاحظة: الدالة applyDisplaySettings — وصف تلقائي موجز لوظيفتها.
     * المدخلات: display
     * المخرجات: راجع التنفيذ
     */
    function applyDisplaySettings(display) {
        // تطبيق المظهر (Theme)
        if (display.theme === 'dark') {
            document.body.classList.add('dark-theme');
        } else if (display.theme === 'auto') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.body.classList.toggle('dark-theme', prefersDark);
        } else {
            document.body.classList.remove('dark-theme');
        }

        // تطبيق حجم الخط
        document.body.setAttribute('data-font-size', display.fontSize);
        document.documentElement.style.setProperty('--font-size-base', 
            getFontSize(display.fontSize));
        
        // تطبيق وزن الخط
        document.body.setAttribute('data-font-weight', display.fontWeight);
        document.documentElement.style.setProperty('--font-weight-base', 
            getFontWeight(display.fontWeight));

        // تطبيق الألوان مع التحقق من التباين
        const primaryColor = display.primaryColor;
        const secondaryColor = display.secondaryColor;
        const textColor = display.textColor;
        
        // التحقق من أن لون النص مختلف عن لون الخلفية
        const isDark = document.body.classList.contains('dark-theme');
        const bgColor = isDark ? '#1a1a1a' : '#ffffff';
        
        // حساب التباين وتعديل اللون إذا لزم
        const adjustedTextColor = ensureContrast(textColor, bgColor);
        
        document.documentElement.style.setProperty('--primary-color', primaryColor);
        document.documentElement.style.setProperty('--secondary-color', secondaryColor);
        document.documentElement.style.setProperty('--text-color', adjustedTextColor);
        
        // حساب لون النص المناسب للون الأساسي (للأزرار والخلفيات الملونة)
        const primaryRgb = hexToRgb(primaryColor);
        if (primaryRgb) {
            const primaryLuminance = getLuminance(primaryRgb);
            const primaryTextColor = primaryLuminance > 0.5 ? '#000000' : '#ffffff';
            document.documentElement.style.setProperty('--primary-color-text', primaryTextColor);
            
            // حساب لون hover
            const hoverColor = primaryLuminance > 0.5 
                ? shadeColor(primaryColor, -20) // أغمق قليلاً
                : shadeColor(primaryColor, 20);  // أفتح قليلاً
            document.documentElement.style.setProperty('--primary-color-hover', hoverColor);
        }
        
        // تطبيق لون النص مباشرة
        document.body.style.color = adjustedTextColor;
        document.body.setAttribute('data-text-color', 'custom');
        
        // تطبيق اللون على جميع العناصر الموجودة
        const allElements = document.querySelectorAll('*');
        allElements.forEach(element => {
            // تجاهل العناصر التي لها ألوان خاصة
            if (!element.classList.contains('btn') && 
                !element.classList.contains('badge') &&
                !element.classList.contains('alert') &&
                !element.classList.contains('text-primary') &&
                !element.classList.contains('text-secondary') &&
                !element.classList.contains('text-success') &&
                !element.classList.contains('text-danger') &&
                !element.classList.contains('text-warning') &&
                !element.classList.contains('text-info') &&
                !element.classList.contains('text-muted')) {
                element.style.color = '';  // مسح أي لون inline
            }
        });

        // تطبيق كثافة العرض
        document.body.setAttribute('data-density', display.density);

        // تطبيق الحركات
        document.body.classList.toggle('no-animations', !display.animations);
        
        // تطبيق الزوايا المستديرة
        document.body.classList.toggle('no-rounded-corners', !display.roundedCorners);
    }
    
    /**
     * التحقق من التباين بين لونين وتعديل اللون إذا لزم
     */
    /**
     * ملاحظة: الدالة ensureContrast — وصف تلقائي موجز لوظيفتها.
     * المدخلات: color1, color2
     * المخرجات: راجع التنفيذ
     */
    /**
     * ملاحظة: الدالة ensureContrast — وصف تلقائي موجز لوظيفتها.
     * المدخلات: color1, color2
     * المخرجات: راجع التنفيذ
     */
    function ensureContrast(color1, color2) {
        const c1 = hexToRgb(color1);
        const c2 = hexToRgb(color2);
        
        if (!c1 || !c2) return color1;
        
        // حساب التباين
        const contrast = getContrastRatio(c1, c2);
        
        // إذا كان التباين أقل من 4.5:1 (WCAG AA standard)
        if (contrast < 4.5) {
            // تعديل اللون ليكون أغمق أو أفتح حسب الخلفية
            const isDarkBg = (c2.r + c2.g + c2.b) / 3 < 128;
            return isDarkBg ? '#ffffff' : '#000000';
        }
        
        return color1;
    }
    
    /**
     * تحويل اللون من hex إلى RGB
     */
    /**
     * ملاحظة: الدالة hexToRgb — وصف تلقائي موجز لوظيفتها.
     * المدخلات: hex
     * المخرجات: راجع التنفيذ
     */
    /**
     * ملاحظة: الدالة hexToRgb — وصف تلقائي موجز لوظيفتها.
     * المدخلات: hex
     * المخرجات: راجع التنفيذ
     */
    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }
    
    /**
     * حساب نسبة التباين بين لونين
     */
    /**
     * ملاحظة: الدالة getContrastRatio — وصف تلقائي موجز لوظيفتها.
     * المدخلات: rgb1, rgb2
     * المخرجات: راجع التنفيذ
     */
    /**
     * ملاحظة: الدالة getContrastRatio — وصف تلقائي موجز لوظيفتها.
     * المدخلات: rgb1, rgb2
     * المخرجات: راجع التنفيذ
     */
    function getContrastRatio(rgb1, rgb2) {
        const l1 = getLuminance(rgb1);
        const l2 = getLuminance(rgb2);
        const lighter = Math.max(l1, l2);
        const darker = Math.min(l1, l2);
        return (lighter + 0.05) / (darker + 0.05);
    }
    
    /**
     * حساب الإضاءة النسبية للون
     */
    /**
     * ملاحظة: الدالة getLuminance — وصف تلقائي موجز لوظيفتها.
     * المدخلات: rgb
     * المخرجات: راجع التنفيذ
     */
    /**
     * ملاحظة: الدالة getLuminance — وصف تلقائي موجز لوظيفتها.
     * المدخلات: rgb
     * المخرجات: راجع التنفيذ
     */
    function getLuminance(rgb) {
        const rsRGB = rgb.r / 255;
        const gsRGB = rgb.g / 255;
        const bsRGB = rgb.b / 255;
        
        const r = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
        const g = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
        const b = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);
        
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }
    
    /**
     * تغيير درجة اللون (أفتح أو أغمق)
     * @param {string} color - اللون بصيغة hex
     * @param {number} percent - النسبة المئوية للتغيير (موجب = أفتح، سالب = أغمق)
     */
    /**
     * ملاحظة: الدالة shadeColor — وصف تلقائي موجز لوظيفتها.
     * المدخلات: color, percent
     * المخرجات: راجع التنفيذ
     */
    /**
     * ملاحظة: الدالة shadeColor — وصف تلقائي موجز لوظيفتها.
     * المدخلات: color, percent
     * المخرجات: راجع التنفيذ
     */
    function shadeColor(color, percent) {
        const rgb = hexToRgb(color);
        if (!rgb) return color;
        
        const t = percent < 0 ? 0 : 255;
        const p = percent < 0 ? percent * -1 : percent;
        const w = p / 100;
        
        const r = Math.round((t - rgb.r) * w + rgb.r);
        const g = Math.round((t - rgb.g) * w + rgb.g);
        const b = Math.round((t - rgb.b) * w + rgb.b);
        
        return '#' + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }
    
    /**
     * تطبيق إعدادات المالية والعملة
     */
    /**
     * ملاحظة: الدالة applyFinancialSettings — وصف تلقائي موجز لوظيفتها.
     * المدخلات: financial
     * المخرجات: راجع التنفيذ
     */
    /**
     * ملاحظة: الدالة applyFinancialSettings — وصف تلقائي موجز لوظيفتها.
     * المدخلات: financial
     * المخرجات: راجع التنفيذ
     */
    function applyFinancialSettings(financial) {
        // تحديث دالة formatNumber إن وجدت
        if (typeof window.formatNumber === 'function') {
            const originalFormatNumber = window.formatNumber;
            /**
             * ملاحظة: الدالة window.formatNumber — وصف تلقائي موجز لوظيفتها.
             * المدخلات: number, showCurrency = true
             * المخرجات: راجع التنفيذ
             */
            window.formatNumber = function(number, showCurrency = true) {
                // تحويل الأرقام حسب الإعداد
                let formatted = new Intl.NumberFormat(
                    financial.numberFormat === 'ar' ? 'ar-SA' : 'en-US',
                    {
                        minimumFractionDigits: financial.showZeroDecimals ? financial.decimals : 0,
                        maximumFractionDigits: financial.decimals
                    }
                ).format(number);

                // إضافة العملة
                if (showCurrency) {
                    const currency = financial.currencyName || financial.currency;
                    if (financial.currencyPosition === 'before') {
                        formatted = currency + ' ' + formatted;
                    } else {
                        formatted = formatted + ' ' + currency;
                    }
                }

                return formatted;
            };
        }
    }

    /**
     * تطبيق إعدادات التنبيهات
     */
    /**
     * ملاحظة: الدالة applyNotificationSettings — وصف تلقائي موجز لوظيفتها.
     * المدخلات: notifications
     * المخرجات: راجع التنفيذ
     */
    /**
     * ملاحظة: الدالة applyNotificationSettings — وصف تلقائي موجز لوظيفتها.
     * المدخلات: notifications
     * المخرجات: راجع التنفيذ
     */
    function applyNotificationSettings(notifications) {
        // تحديث دالة showNotification إن وجدت
        if (typeof window.showNotification === 'function') {
            const originalShowNotification = window.showNotification;
            /**
             * ملاحظة: الدالة window.showNotification — وصف تلقائي موجز لوظيفتها.
             * المدخلات: message, type = 'info'
             * المخرجات: راجع التنفيذ
             */
            window.showNotification = function(message, type = 'info') {
                if (!notifications.enabled) return;
                
                // استخدام الإعدادات المخصصة
                const options = {
                    position: notifications.position,
                    duration: notifications.duration,
                    sound: notifications.soundEnabled
                };
                
                // استدعاء الدالة الأصلية مع الخيارات
                originalShowNotification(message, type, options);
            };
        }
        
        // تحديث نظام الصوت إذا كان متاحاً
        if (typeof window.SoundSystem !== 'undefined') {
            window.SoundSystem.updateSettings(
                notifications.soundEnabled,
                notifications.soundVolume
            );
        }

        // طلب إذن إشعارات المتصفح إذا مفعلة
        if (notifications.browserNotifications && 'Notification' in window) {
            Notification.requestPermission();
        }
    }

    /**
     * تطبيق إعدادات الأداء
     */
    /**
     * ملاحظة: الدالة applyPerformanceSettings — وصف تلقائي موجز لوظيفتها.
     * المدخلات: performance
     * المخرجات: راجع التنفيذ
     */
    /**
     * ملاحظة: الدالة applyPerformanceSettings — وصف تلقائي موجز لوظيفتها.
     * المدخلات: performance
     * المخرجات: راجع التنفيذ
     */
    function applyPerformanceSettings(performance) {
        // تحديث إعدادات الكاش
        if (typeof window.balanceCache !== 'undefined') {
            const cacheSize = {
                'small': 100,
                'medium': 200,
                'large': 500
            }[performance.cacheSize] || 200;

            const cacheDuration = performance.cacheDuration * 60 * 1000; // تحويل لمللي ثانية

            // إعادة إنشاء الكاش بالحجم الجديد
            window.balanceCache = new SmartCache(cacheSize, cacheDuration);
            window.reportCache = new SmartCache(Math.floor(cacheSize / 4), cacheDuration * 2);
        }

        // تطبيق عدد العناصر بالصفحة
        if (typeof window.itemsPerPage !== 'undefined') {
            window.itemsPerPage = performance.itemsPerPage;
        }

        // تطبيق وضع توفير الطاقة
        document.body.classList.toggle('power-save-mode', performance.powerSaveMode);
    }

    /**
     * تطبيق إعدادات الأمان
     */
    /**
     * ملاحظة: الدالة applySecuritySettings — وصف تلقائي موجز لوظيفتها.
     * المدخلات: security
     * المخرجات: راجع التنفيذ
     */
    /**
     * ملاحظة: الدالة applySecuritySettings — وصف تلقائي موجز لوظيفتها.
     * المدخلات: security
     * المخرجات: راجع التنفيذ
     */
    function applySecuritySettings(security) {
        // تطبيق إخفاء الأرصدة
        document.body.classList.toggle('hide-balances', security.hideBalances);
        
        // تطبيق طمس البيانات الحساسة
        document.body.classList.toggle('blur-sensitive', security.blurSensitive);

        // تعيين مهلة الجلسة
        if (security.sessionTimeout > 0) {
            setupSessionTimeout(security.sessionTimeout);
        }
    }

    /**
     * دمج عميق للكائنات
     * يستخدم لدمج الإعدادات المحفوظة مع الافتراضية
     */
    /**
     * ملاحظة: الدالة deepMerge — وصف تلقائي موجز لوظيفتها.
     * المدخلات: target, source
     * المخرجات: راجع التنفيذ
     */
    /**
     * ملاحظة: الدالة deepMerge — وصف تلقائي موجز لوظيفتها.
     * المدخلات: target, source
     * المخرجات: راجع التنفيذ
     */
    function deepMerge(target, source) {
        const output = Object.assign({}, target);
        if (isObject(target) && isObject(source)) {
            Object.keys(source).forEach(key => {
                if (isObject(source[key])) {
                    if (!(key in target))
                        Object.assign(output, { [key]: source[key] });
                    else
                        output[key] = deepMerge(target[key], source[key]);
                } else {
                    Object.assign(output, { [key]: source[key] });
                }
            });
        }
        return output;
    }

    /**
     * التحقق من كون القيمة كائن
     */
    /**
     * ملاحظة: الدالة isObject — وصف تلقائي موجز لوظيفتها.
     * المدخلات: item
     * المخرجات: راجع التنفيذ
     */
    /**
     * ملاحظة: الدالة isObject — وصف تلقائي موجز لوظيفتها.
     * المدخلات: item
     * المخرجات: راجع التنفيذ
     */
    function isObject(item) {
        return item && typeof item === 'object' && !Array.isArray(item);
    }

    /**
     * الحصول على حجم الخط بناءً على الإعداد
     */
    /**
     * ملاحظة: الدالة getFontSize — وصف تلقائي موجز لوظيفتها.
     * المدخلات: size
     * المخرجات: راجع التنفيذ
     */
    /**
     * ملاحظة: الدالة getFontSize — وصف تلقائي موجز لوظيفتها.
     * المدخلات: size
     * المخرجات: راجع التنفيذ
     */
    function getFontSize(size) {
        const sizes = {
            'tiny': '10px',
            'small': '12px',
            'medium': '14px',
            'large': '16px',
            'xlarge': '18px',
            'huge': '20px',
            'massive': '24px'
        };
        return sizes[size] || '14px';
    }
    
    /**
     * الحصول على وزن الخط بناءً على الإعداد
     */
    /**
     * ملاحظة: الدالة getFontWeight — وصف تلقائي موجز لوظيفتها.
     * المدخلات: weight
     * المخرجات: راجع التنفيذ
     */
    /**
     * ملاحظة: الدالة getFontWeight — وصف تلقائي موجز لوظيفتها.
     * المدخلات: weight
     * المخرجات: راجع التنفيذ
     */
    function getFontWeight(weight) {
        const weights = {
            'thin': '100',
            'light': '300',
            'normal': '400',
            'medium': '500',
            'semibold': '600',
            'bold': '700',
            'extrabold': '800',
            'black': '900'
        };
        return weights[weight] || '400';
    }

    /**
     * إعداد مهلة الجلسة
     */
    /**
     * ملاحظة: الدالة setupSessionTimeout — وصف تلقائي موجز لوظيفتها.
     * المدخلات: minutes
     * المخرجات: راجع التنفيذ
     */
    /**
     * ملاحظة: الدالة setupSessionTimeout — وصف تلقائي موجز لوظيفتها.
     * المدخلات: minutes
     * المخرجات: راجع التنفيذ
     */
    function setupSessionTimeout(minutes) {
        let timeout;
        /**
         * ملاحظة: الدالة resetTimeout — وصف تلقائي موجز لوظيفتها.
         * المدخلات: بدون
         * المخرجات: راجع التنفيذ
         */
        /**
         * ملاحظة: الدالة resetTimeout — وصف تلقائي موجز لوظيفتها.
         * المدخلات: بدون
         * المخرجات: راجع التنفيذ
         */
        const resetTimeout = () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                // قفل التطبيق أو تسجيل الخروج
                if (currentSettings.security.appLock) {
                    lockApp();
                }
            }, minutes * 60 * 1000);
        };

        // إعادة تعيين المؤقت عند أي نشاط
        ['mousedown', 'keypress', 'scroll', 'touchstart'].forEach(event => {
            document.addEventListener(event, resetTimeout, true);
        });

        resetTimeout();
    }

    /**
     * قفل التطبيق
     */
    /**
     * ملاحظة: الدالة lockApp — وصف تلقائي موجز لوظيفتها.
     * المدخلات: بدون
     * المخرجات: راجع التنفيذ
     */
    /**
     * ملاحظة: الدالة lockApp — وصف تلقائي موجز لوظيفتها.
     * المدخلات: بدون
     * المخرجات: راجع التنفيذ
     */
    function lockApp() {
        // عرض شاشة القفل
        console.log('تم قفل التطبيق بسبب عدم النشاط');
        // TODO: تنفيذ شاشة القفل
    }

    /**
     * تحديث إعداد معين
     * @param {string} path - مسار الإعداد (مثل: display.theme)
     * @param {*} value - القيمة الجديدة
     */
    /**
     * ملاحظة: الدالة updateSetting — وصف تلقائي موجز لوظيفتها.
     * المدخلات: path, value
     * المخرجات: راجع التنفيذ
     */
    /**
     * ملاحظة: الدالة updateSetting — وصف تلقائي موجز لوظيفتها.
     * المدخلات: path, value
     * المخرجات: راجع التنفيذ
     */
    function updateSetting(path, value) {
        const keys = path.split('.');
        let obj = currentSettings;
        
        // الوصول للكائن الأب
        for (let i = 0; i < keys.length - 1; i++) {
            if (!obj[keys[i]]) obj[keys[i]] = {};
            obj = obj[keys[i]];
        }
        
        // حفظ القيمة القديمة للتراجع
        const oldValue = obj[keys[keys.length - 1]];
        unsavedChanges[path] = { old: oldValue, new: value };
        
        // حفظ نسخة من الإعدادات الحالية قبل التغيير (فقط إذا كانت القيمة مختلفة)
        if (oldValue !== value && settingsHistory.length > 0) {
            // التحقق من أن آخر حالة في التاريخ مختلفة عن الحالة الحالية
            const lastHistory = (typeof safeJsonParse === 'function' && typeof FeatureFlags !== 'undefined' && FeatureFlags.isEnabled('safeJsonParse')) ? safeJsonParse(settingsHistory[settingsHistory.length - 1], currentSettings) : JSON.parse(settingsHistory[settingsHistory.length - 1]);
            if (JSON.stringify(lastHistory) !== JSON.stringify(currentSettings)) {
                if (settingsHistory.length >= 10) {
                    settingsHistory.shift(); // الاحتفاظ بآخر 10 تغييرات فقط
                }
                settingsHistory.push(JSON.stringify(currentSettings));
            }
        } else if (oldValue !== value && settingsHistory.length === 0) {
            // إذا كان التاريخ فارغاً، أضف الحالة الحالية
            settingsHistory.push(JSON.stringify(currentSettings));
        }
        
        // تعيين القيمة الجديدة
        obj[keys[keys.length - 1]] = value;
        
        // تطبيق التغيير فوراً
        applySettings(currentSettings);
        
        // حفظ ذكي (مؤجل)
        saveSettings(false);
    }

    /**
     * الحصول على قيمة إعداد
     * @param {string} path - مسار الإعداد
     * @returns {*} قيمة الإعداد
     */
    /**
     * ملاحظة: الدالة getSetting — وصف تلقائي موجز لوظيفتها.
     * المدخلات: path
     * المخرجات: راجع التنفيذ
     */
    /**
     * ملاحظة: الدالة getSetting — وصف تلقائي موجز لوظيفتها.
     * المدخلات: path
     * المخرجات: راجع التنفيذ
     */
    function getSetting(path) {
        const keys = path.split('.');
        let obj = currentSettings;
        
        for (let i = 0; i < keys.length; i++) {
            if (!obj[keys[i]]) return undefined;
            obj = obj[keys[i]];
        }
        
        return obj;
    }

    /**
     * إعادة تعيين الإعدادات للقيم الافتراضية
     * @param {string} category - الفئة المراد إعادة تعيينها (اختياري)
     */
    /**
     * ملاحظة: الدالة resetSettings — وصف تلقائي موجز لوظيفتها.
     * المدخلات: category = null
     * المخرجات: راجع التنفيذ
     */
    /**
     * ملاحظة: الدالة resetSettings — وصف تلقائي موجز لوظيفتها.
     * المدخلات: category = null
     * المخرجات: راجع التنفيذ
     */
    function resetSettings(category = null) {
        if (category && defaultSettings[category]) {
            currentSettings[category] = JSON.parse(JSON.stringify(defaultSettings[category]));
        } else {
            currentSettings = JSON.parse(JSON.stringify(defaultSettings));
        }
        
        applySettings(currentSettings);
        saveSettings(true);
        
        if (typeof showNotification === 'function') {
            showNotification('تم إعادة تعيين الإعدادات', 'info');
        }
    }

    /**
     * التراجع عن آخر تغيير
     */
    /**
     * ملاحظة: الدالة undoSettings — وصف تلقائي موجز لوظيفتها.
     * المدخلات: بدون
     * المخرجات: راجع التنفيذ
     */
    /**
     * ملاحظة: الدالة undoSettings — وصف تلقائي موجز لوظيفتها.
     * المدخلات: بدون
     * المخرجات: راجع التنفيذ
     */
    function undoSettings() {
        if (settingsHistory.length > 0) {
            const previous = settingsHistory.pop();
            currentSettings = (typeof safeJsonParse === 'function' && typeof FeatureFlags !== 'undefined' && FeatureFlags.isEnabled('safeJsonParse')) ? safeJsonParse(previous, currentSettings) : JSON.parse(previous);
            applySettings(currentSettings);
            
            // حفظ بدون إضافة للتاريخ
            try {
                localStorage.setItem('appSettings', JSON.stringify(currentSettings));
                localStorage.setItem('appSettingsBackup', JSON.stringify(currentSettings));
                localStorage.setItem('appSettingsTimestamp', new Date().toISOString());
                
                // مسح التغييرات غير المحفوظة
                unsavedChanges = {};
                
                // تحديث واجهة المستخدم
                if (typeof SettingsUI !== 'undefined' && SettingsUI.reload) {
                    SettingsUI.reload();
                }
                
                if (typeof showNotification === 'function') {
                    showNotification('تم التراجع عن التغيير', 'info');
                }
            } catch (e) {
                console.error('Error saving settings after undo:', e);
                if (typeof showNotification === 'function') {
                    showNotification('حدث خطأ أثناء التراجع', 'error');
                }
            }
        } else {
            if (typeof showNotification === 'function') {
                showNotification('لا توجد تغييرات للتراجع عنها', 'warning');
            }
        }
    }

    /**
     * تصدير الإعدادات
     * @returns {string} الإعدادات بصيغة JSON
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
        const exportData = {
            settings: currentSettings,
            version: '1.0.0',
            timestamp: new Date().toISOString(),
            app: 'نظام إدارة المحلات'
        };
        
        return JSON.stringify(exportData, null, 2);
    }

    /**
     * استيراد الإعدادات
     * @param {string} jsonString - الإعدادات بصيغة JSON
     * @returns {boolean} نجاح العملية
     */
    /**
     * ملاحظة: الدالة importSettings — وصف تلقائي موجز لوظيفتها.
     * المدخلات: jsonString
     * المخرجات: راجع التنفيذ
     */
    /**
     * ملاحظة: الدالة importSettings — وصف تلقائي موجز لوظيفتها.
     * المدخلات: jsonString
     * المخرجات: راجع التنفيذ
     */
    function importSettings(jsonString) {
        try {
            const importData = (typeof safeJsonParse === 'function' && typeof FeatureFlags !== 'undefined' && FeatureFlags.isEnabled('safeJsonParse')) ? safeJsonParse(jsonString, {}) : JSON.parse(jsonString);
            
            if (!importData.settings) {
                throw new Error('ملف الإعدادات غير صالح');
            }
            
            // حفظ نسخة احتياطية
            settingsHistory.push(JSON.stringify(currentSettings));
            
            // تطبيق الإعدادات المستوردة
            currentSettings = deepMerge(defaultSettings, importData.settings);
            applySettings(currentSettings);
            saveSettings(true);
            
            if (typeof showNotification === 'function') {
                showNotification('تم استيراد الإعدادات بنجاح', 'success');
            }
            
            return true;
        } catch (error) {
            console.error('خطأ في استيراد الإعدادات:', error);
            if (typeof showNotification === 'function') {
                showNotification('فشل استيراد الإعدادات', 'error');
            }
            return false;
        }
    }

    /**
     * الحصول على جميع الإعدادات
     */
    /**
     * ملاحظة: الدالة getAllSettings — وصف تلقائي موجز لوظيفتها.
     * المدخلات: بدون
     * المخرجات: راجع التنفيذ
     */
    /**
     * ملاحظة: الدالة getAllSettings — وصف تلقائي موجز لوظيفتها.
     * المدخلات: بدون
     * المخرجات: راجع التنفيذ
     */
    function getAllSettings() {
        return JSON.parse(JSON.stringify(currentSettings));
    }

    /**
     * الحصول على الإعدادات الافتراضية
     */
    /**
     * ملاحظة: الدالة getDefaultSettings — وصف تلقائي موجز لوظيفتها.
     * المدخلات: بدون
     * المخرجات: راجع التنفيذ
     */
    /**
     * ملاحظة: الدالة getDefaultSettings — وصف تلقائي موجز لوظيفتها.
     * المدخلات: بدون
     * المخرجات: راجع التنفيذ
     */
    function getDefaultSettings() {
        return JSON.parse(JSON.stringify(defaultSettings));
    }

    /**
     * التحقق من وجود تغييرات غير محفوظة
     */
    /**
     * ملاحظة: الدالة hasUnsavedChanges — وصف تلقائي موجز لوظيفتها.
     * المدخلات: بدون
     * المخرجات: راجع التنفيذ
     */
    /**
     * ملاحظة: الدالة hasUnsavedChanges — وصف تلقائي موجز لوظيفتها.
     * المدخلات: بدون
     * المخرجات: راجع التنفيذ
     */
    function hasUnsavedChanges() {
        return Object.keys(unsavedChanges).length > 0;
    }

    // تصدير الوظائف للاستخدام العام
    window.AppSettings = {
        load: loadSettings,
        save: saveSettings,
        update: updateSetting,
        get: getSetting,
        getAll: getAllSettings,
        getDefaults: getDefaultSettings,
        reset: resetSettings,
        undo: undoSettings,
        apply: applySettings,
        export: exportSettings,
        import: importSettings,
        hasUnsavedChanges: hasUnsavedChanges,
        currentSettings: () => currentSettings,
        defaultSettings: () => defaultSettings
    };

    // أعلام التشغيل - طبقة مساعدة لتفعيل التحسينات بشكل آمن وتدريجي
    // ملاحظة: هذه الطبقة لا تغيّر أي سلوك إلا إذا كانت experimentalFeatures=true والعلم المطلوب=true
    window.FeatureFlags = {
        isEnabled(flagName) {
            try {
                const adv = (currentSettings && currentSettings.advanced) ? currentSettings.advanced : {};
                if (adv.experimentalFeatures !== true) return false;
                const flags = adv.flags || {};
                return flags[flagName] === true;
            } catch(_) { return false; }
        },
        enable(flagName) {
            try {
                if (!flagName) return false;
                updateSetting('advanced.experimentalFeatures', true);
                const path = `advanced.flags.${flagName}`;
                updateSetting(path, true);
                saveSettings();
                return true;
            } catch(_) { return false; }
        },
        disable(flagName) {
            try {
                if (!flagName) return false;
                const path = `advanced.flags.${flagName}`;
                updateSetting(path, false);
                saveSettings();
                return true;
            } catch(_) { return false; }
        },
        all() {
            try {
                const adv = (currentSettings && currentSettings.advanced) ? currentSettings.advanced : {};
                return Object.assign({ experimentalFeatures: !!adv.experimentalFeatures }, adv.flags || {});
            } catch(_) { return { experimentalFeatures: false }; }
        }
    };

    // تحميل الإعدادات عند بدء التطبيق
    document.addEventListener('DOMContentLoaded', () => {
        loadSettings();
        
        // التأكد من تطبيق الإعدادات بعد تحميل الصفحة بالكامل
        setTimeout(() => {
            if (currentSettings && currentSettings.display) {
                applyDisplaySettings(currentSettings.display);
            }
        }, 100);
    });

    // حفظ الإعدادات قبل إغلاق الصفحة
    window.addEventListener('beforeunload', (e) => {
        if (hasUnsavedChanges()) {
            saveSettings(true);
            e.preventDefault();
            e.returnValue = 'لديك تغييرات غير محفوظة';
        }
    });
    
    // مراقبة تغيير اللون المفضل للنظام
    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (currentSettings.display.theme === 'auto') {
                document.body.classList.toggle('dark-theme', e.matches);
            }
        });
    }

})();