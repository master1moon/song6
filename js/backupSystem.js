/**
 * نظام النسخ الاحتياطي
 * يدير عمليات النسخ الاحتياطي والاستعادة للبيانات
 * يدعم التخزين المحلي والسحابي
 */

(function() {
    'use strict';

    /**
     * نظام النسخ الاحتياطي الرئيسي
     */
    const BackupSystem = {
        /**
         * إنشاء نسخة احتياطية وإرسالها بالبريد
         */
        /**
         * ملاحظة: الدالة createEmailBackup — وصف تلقائي موجز لوظيفتها.
         * المدخلات: بدون
         * المخرجات: راجع التنفيذ
         */
        async createEmailBackup() {
            try {
                showNotification('جاري إنشاء النسخة الاحتياطية...', 'info');
                
                // جمع البيانات
                const backupData = this.collectBackupData();
                const filename = `backup_${new Date().toISOString().split('T')[0]}_${Date.now()}.json`;
                
                // تحميل الملف أولاً
                this.downloadBackup(backupData, filename);
                
                // عرض واجهة البريد الإلكتروني
                this.showEmailInterface(backupData, filename);
                
            } catch (error) {
                console.error('خطأ في إنشاء نسخة البريد:', error);
                showNotification('فشل إنشاء النسخة الاحتياطية', 'error');
            }
        },

        /**
         * عرض واجهة البريد الإلكتروني
         */
        /**
         * ملاحظة: الدالة showEmailInterface — وصف تلقائي موجز لوظيفتها.
         * المدخلات: backupData, filename
         * المخرجات: راجع التنفيذ
         */
        showEmailInterface(backupData, filename) {
            const modalHTML = `
                <div class="modal fade" id="emailBackupModal" tabindex="-1">
                    <div class="modal-dialog modal-lg">
                        <div class="modal-content">
                            <div class="modal-header bg-info text-white">
                                <h5 class="modal-title">
                                    <i class="fas fa-envelope"></i> إرسال النسخة الاحتياطية بالبريد
                                </h5>
                                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body">
                                <div class="alert alert-success mb-3">
                                    <i class="fas fa-check-circle"></i> تم تحميل النسخة الاحتياطية!
                                    <br>الملف: <strong>${filename}</strong>
                                </div>
                                
                                <h6>📧 الخطوة التالية: أرسل الملف لبريدك</h6>
                                
                                <div class="mb-3">
                                    <label class="form-label">بريدك الإلكتروني:</label>
                                    <input type="email" id="userEmail" class="form-control" 
                                           placeholder="example@gmail.com" value="n1993love@gmail.com">
                                </div>
                                
                                <div class="d-grid gap-2">
                                    <button class="btn btn-primary" onclick="
                                        const email = document.getElementById('userEmail').value;
                                        if(!email) {
                                            showNotification('الرجاء إدخال البريد الإلكتروني', 'warning');
                                            return;
                                        }
                                        const subject = 'نسخة احتياطية - ${filename}';
                                        const body = 'مرحباً،\\n\\nمرفق ملف النسخة الاحتياطية للتطبيق.\\n\\nالرجاء حفظ الملف في مكان آمن:\\n- Google Drive → مجلد نجيب المقداد\\n- أو أي مكان آمن آخر\\n\\nملاحظة: الملف يحتوي على جميع بيانات التطبيق.';
                                        window.location.href = 'mailto:' + email + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
                                        showNotification('تم فتح البريد الإلكتروني - أرفق الملف المحمّل', 'info');
                                    ">
                                        <i class="fas fa-envelope-open"></i> فتح برنامج البريد
                                    </button>
                                </div>
                                
                                <hr>
                                
                                <div class="alert alert-info">
                                    <h6>📋 تعليمات الإرسال:</h6>
                                    <ol class="mb-0">
                                        <li>سيفتح برنامج البريد الإلكتروني</li>
                                        <li>أرفق الملف المحمّل (<strong>${filename}</strong>)</li>
                                        <li>أرسل البريد لنفسك</li>
                                        <li>افتح البريد واحفظ المرفق في Google Drive</li>
                                    </ol>
                                </div>
                                
                                <div class="alert alert-warning">
                                    <h6>⚠️ لم يفتح البريد؟</h6>
                                    <p>انسخ هذه المعلومات وألصقها في بريد جديد:</p>
                                    <div class="mb-2">
                                        <strong>إلى:</strong> 
                                        <code id="emailTo">n1993love@gmail.com</code>
                                        <button class="btn btn-sm btn-outline-primary ms-2" onclick="
                                            const email = document.getElementById('userEmail').value || 'n1993love@gmail.com';
                                            document.getElementById('emailTo').textContent = email;
                                            navigator.clipboard.writeText(email);
                                            showNotification('تم نسخ البريد', 'success');
                                        ">
                                            <i class="fas fa-copy"></i> نسخ
                                        </button>
                                    </div>
                                    <div class="mb-2">
                                        <strong>الموضوع:</strong>
                                        <code>نسخة احتياطية - ${filename}</code>
                                        <button class="btn btn-sm btn-outline-primary ms-2" onclick="
                                            navigator.clipboard.writeText('نسخة احتياطية - ${filename}');
                                            showNotification('تم نسخ الموضوع', 'success');
                                        ">
                                            <i class="fas fa-copy"></i> نسخ
                                        </button>
                                    </div>
                                    <div>
                                        <strong>المرفق:</strong> <code>${filename}</code> (الملف المحمّل)
                                    </div>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إغلاق</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // إضافة النافذة للصفحة
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = modalHTML;
            document.body.appendChild(tempDiv.firstElementChild);
            
            // عرض النافذة
            const modal = new bootstrap.Modal(document.getElementById('emailBackupModal'));
            modal.show();
            
            // حذف النافذة عند الإغلاق
            document.getElementById('emailBackupModal').addEventListener('hidden.bs.modal', function() {
                this.remove();
            });
        },

        /**
         * إنشاء نسخة احتياطية
         * @param {boolean} silent - إنشاء بدون رسائل
         * @returns {Promise<Object>} بيانات النسخة الاحتياطية
         */
        /**
         * ملاحظة: الدالة createBackup — وصف تلقائي موجز لوظيفتها.
         * المدخلات: silent = false
         * المخرجات: راجع التنفيذ
         */
        async createBackup(silent = false) {
            try {
                if (!silent) {
                    showNotification('جاري إنشاء النسخة الاحتياطية...', 'info');
                }

                // جمع جميع البيانات
                const backupData = {
                    version: '2.0',
                    timestamp: new Date().toISOString(),
                    app: 'نظام إدارة كروت الشبكات',
                    data: {
                        stores: data.stores || [],
                        packages: data.packages || [],
                        inventory: data.inventory || [],
                        sales: data.sales || [],
                        payments: data.payments || [],
                        expenses: data.expenses || [],
                        trash: data.trash || [],
                        settings: AppSettings.getAll()
                    },
                    metadata: {
                        storesCount: data.stores?.length || 0,
                        salesCount: data.sales?.length || 0,
                        paymentsCount: data.payments?.length || 0,
                        expensesCount: data.expenses?.length || 0,
                        totalRecords: 0
                    }
                };

                // حساب إجمالي السجلات
                backupData.metadata.totalRecords = Object.values(backupData.data)
                    .filter(Array.isArray)
                    .reduce((sum, arr) => sum + arr.length, 0);

                // الحصول على إعدادات النسخ الاحتياطي
                const backupSettings = AppSettings.get('backup') || {};
                
                // تطبيق الضغط إذا كان مفعلاً
                if (backupSettings.compress) {
                    backupData.compressed = true;
                    backupData.data = this.compressData(JSON.stringify(backupData.data));
                }

                // تطبيق التشفير إذا كان مفعلاً
                if (backupSettings.encrypt) {
                    backupData.encrypted = true;
                    const password = await this.getPassword();
                    if (password) {
                        backupData.data = this.encryptData(backupData.data, password);
                    }
                }

                // حفظ النسخة حسب المكان المحدد
                await this.saveBackup(backupData, backupSettings.location);

                if (!silent) {
                    showNotification('تم إنشاء النسخة الاحتياطية بنجاح', 'success');
                }

                return backupData;

            } catch (error) {
                console.error('خطأ في إنشاء النسخة الاحتياطية:', error);
                showNotification('فشل إنشاء النسخة الاحتياطية', 'error');
                throw error;
            }
        },

        /**
         * حفظ النسخة الاحتياطية
         * @param {Object} backupData - بيانات النسخة
         * @param {string} location - مكان الحفظ
         */
        /**
         * ملاحظة: الدالة saveBackup — وصف تلقائي موجز لوظيفتها.
         * المدخلات: backupData, location = 'local'
         * المخرجات: راجع التنفيذ
         */
        async saveBackup(backupData, location = 'local') {
            const filename = `backup_${moment().format('YYYY-MM-DD_HH-mm-ss')}.json`;
            
            switch(location) {
                case 'local':
                    // تحميل كملف محلي
                    this.downloadBackup(backupData, filename);
                    break;
                    
                case 'browser':
                    // حفظ في متصفح (localStorage)
                    this.saveToBrowser(backupData);
                    break;
                    
                case 'drive':
                    // Google Drive - عرض الحلول المبتكرة
                    this.downloadBackup(backupData, filename);
                    
                    // عرض النافذة مباشرة
                    console.log('Showing Google Drive instructions...');
                    
                    // استخدام الحل المباشر فوراً
                    if (typeof window.showGoogleDriveInstructions === 'function') {
                        console.log('Using direct solution');
                        window.showGoogleDriveInstructions(backupData);
                    } else {
                        console.log('Direct solution not found, trying alternatives...');
                        // تأخير بسيط للتأكد من تحميل المكتبة
                        setTimeout(() => {
                            if (typeof window.CloudStorageHelper !== 'undefined' && window.CloudStorageHelper.showAllSolutions) {
                                console.log('Using CloudStorageHelper');
                                window.CloudStorageHelper.showAllSolutions(backupData, filename);
                            } else {
                                console.log('Using showCloudInstructions');
                                this.showCloudInstructions('drive', backupData, filename);
                            }
                        }, 100);
                    }
                    break;
                    
                default:
                    this.downloadBackup(backupData, filename);
            }
        },

        /**
         * تحميل النسخة كملف
         * @param {Object} data - البيانات
         * @param {string} filename - اسم الملف
         */
        /**
         * ملاحظة: الدالة downloadBackup — وصف تلقائي موجز لوظيفتها.
         * المدخلات: data, filename
         * المخرجات: راجع التنفيذ
         */
        downloadBackup(data, filename) {
            const jsonStr = JSON.stringify(data, null, 2);
            const blob = new Blob([jsonStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        },

        /**
         * حفظ في المتصفح
         * @param {Object} data - البيانات
         */
        /**
         * ملاحظة: الدالة saveToBrowser — وصف تلقائي موجز لوظيفتها.
         * المدخلات: data
         * المخرجات: راجع التنفيذ
         */
        saveToBrowser(data) {
            try {
                // حفظ في localStorage
                const key = `backup_${Date.now()}`;
                localStorage.setItem(key, JSON.stringify(data));
                
                // حفظ قائمة النسخ
                let backupsList = (typeof safeJsonParse === 'function' && typeof FeatureFlags !== 'undefined' && FeatureFlags.isEnabled('safeJsonParse')) ? (safeJsonParse(localStorage.getItem('backupsList')||'[]', [])||[]) : JSON.parse(localStorage.getItem('backupsList') || '[]');
                backupsList.push({
                    key: key,
                    timestamp: data.timestamp,
                    size: JSON.stringify(data).length,
                    metadata: data.metadata
                });
                
                // الاحتفاظ بآخر 10 نسخ فقط
                if (backupsList.length > 10) {
                    const oldBackup = backupsList.shift();
                    localStorage.removeItem(oldBackup.key);
                }
                
                localStorage.setItem('backupsList', JSON.stringify(backupsList));
                
                showNotification('تم حفظ النسخة في المتصفح', 'success');
            } catch (error) {
                if (error.name === 'QuotaExceededError') {
                    showNotification('لا توجد مساحة كافية في المتصفح', 'error');
                } else {
                    throw error;
                }
            }
        },

        /**
         * عرض تعليمات التخزين السحابي
         * @param {string} service - نوع الخدمة
         * @param {Object} data - البيانات
         * @param {string} filename - اسم الملف
         */
        /**
         * ملاحظة: الدالة showCloudInstructions — وصف تلقائي موجز لوظيفتها.
         * المدخلات: service, data, filename
         * المخرجات: راجع التنفيذ
         */
        showCloudInstructions(service, data, filename) {
            // إنشاء كود Google Colab
            const dataStr = JSON.stringify(data, null, 2);
            const colabCode = `# كود Python لحفظ النسخة الاحتياطية في Google Drive
from google.colab import drive
import json
from datetime import datetime

# ربط Google Drive
drive.mount('/content/drive')

# البيانات
backup_data = '''${dataStr}'''

# حفظ الملف
filename = f"backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
filepath = f"/content/drive/MyDrive/{filename}"

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(backup_data)

print(f"✅ تم حفظ النسخة في: {filename}")`;
            
            // عرض التعليمات
            const instructions = {
                drive: {
                    title: 'حفظ في Google Drive',
                    content: `
                        <div class="accordion" id="driveInstructions">
                            <div class="accordion-item">
                                <h2 class="accordion-header">
                                    <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#colabMethod">
                                        <strong>الطريقة 1: Google Colab (الأسهل والأسرع)</strong>
                                    </button>
                                </h2>
                                <div id="colabMethod" class="accordion-collapse collapse show">
                                    <div class="accordion-body">
                                        <ol>
                                            <li>افتح <a href="https://colab.research.google.com" target="_blank">Google Colab</a></li>
                                            <li>أنشئ دفتر ملاحظات جديد</li>
                                            <li>انسخ الكود التالي:</li>
                                        </ol>
                                        <pre class="bg-dark text-light p-3 rounded" style="max-height: 300px; overflow-y: auto;"><code>${this.escapeHtml(colabCode)}</code></pre>
                                        <button class="btn btn-primary mt-2" onclick="navigator.clipboard.writeText(\`${colabCode.replace(/`/g, '\\`')}\`); showNotification('تم نسخ الكود!', 'success')">
                                            <i class="fas fa-copy"></i> نسخ الكود
                                        </button>
                                        <ol start="4">
                                            <li>الصق الكود في Colab واضغط تشغيل ▶️</li>
                                            <li>اسمح بالوصول لـ Drive</li>
                                            <li>انتظر رسالة النجاح!</li>
                                        </ol>
                                    </div>
                                </div>
                            </div>
                            <div class="accordion-item">
                                <h2 class="accordion-header">
                                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#manualMethod">
                                        الطريقة 2: الرفع اليدوي
                                    </button>
                                </h2>
                                <div id="manualMethod" class="accordion-collapse collapse">
                                    <div class="accordion-body">
                                        <p>تم تحميل الملف: <strong>${filename}</strong></p>
                                        <ol>
                                            <li>افتح <a href="https://drive.google.com" target="_blank">Google Drive</a></li>
                                            <li>اضغط على "جديد" أو "New"</li>
                                            <li>اختر "رفع ملف" أو "File upload"</li>
                                            <li>اختر الملف من مجلد التنزيلات</li>
                                        </ol>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `
                },
                dropbox: {
                    title: 'حفظ في Dropbox',
                    content: `
                        <div class="accordion" id="dropboxInstructions">
                            <div class="accordion-item">
                                <h2 class="accordion-header">
                                    <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#sendToDropbox">
                                        <strong>الطريقة 1: Send to Dropbox (الأسهل)</strong>
                                    </button>
                                </h2>
                                <div id="sendToDropbox" class="accordion-collapse collapse show">
                                    <div class="accordion-body">
                                        <ol>
                                            <li>سجل في <a href="https://sendtodropbox.com" target="_blank">Send to Dropbox</a></li>
                                            <li>احصل على بريدك الخاص (مثل: yourname.xyz@sendtodropbox.com)</li>
                                            <li>أرسل الملف المحمّل إلى هذا البريد</li>
                                            <li>سيظهر تلقائياً في Dropbox!</li>
                                        </ol>
                                        <p class="alert alert-success">
                                            <strong>ملاحظة:</strong> الملف <strong>${filename}</strong> محفوظ في مجلد التنزيلات
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div class="accordion-item">
                                <h2 class="accordion-header">
                                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#dropboxManual">
                                        الطريقة 2: الرفع اليدوي
                                    </button>
                                </h2>
                                <div id="dropboxManual" class="accordion-collapse collapse">
                                    <div class="accordion-body">
                                        <ol>
                                            <li>افتح <a href="https://dropbox.com" target="_blank">Dropbox</a></li>
                                            <li>اضغط على "رفع" أو "Upload"</li>
                                            <li>اختر الملف: <strong>${filename}</strong></li>
                                        </ol>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `
                }
            };
            
            const info = instructions[service];
            if (info) {
                // إنشاء نافذة التعليمات
                const modal = `
                    <div class="modal fade" id="cloudInstructionsModal" tabindex="-1">
                        <div class="modal-dialog modal-lg">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <h5 class="modal-title">
                                        <i class="${service === 'drive' ? 'fab fa-google-drive' : 'fab fa-dropbox'}"></i>
                                        ${info.title}
                                    </h5>
                                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                                </div>
                                <div class="modal-body">
                                    ${info.content}
                                </div>
                                <div class="modal-footer">
                                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إغلاق</button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                
                // إضافة وعرض النافذة
                const modalEl = document.createElement('div');
                modalEl.innerHTML = modal;
                document.body.appendChild(modalEl.firstElementChild);
                const modalInstance = new bootstrap.Modal(document.getElementById('cloudInstructionsModal'));
                modalInstance.show();
                
                // إزالة النافذة عند الإغلاق
                document.getElementById('cloudInstructionsModal').addEventListener('hidden.bs.modal', function() {
                    this.remove();
                });
            }
        },

        /**
         * حفظ في GitHub
         * @param {Object} data - البيانات
         */
        /**
         * ملاحظة: الدالة saveToGithub — وصف تلقائي موجز لوظيفتها.
         * المدخلات: data
         * المخرجات: راجع التنفيذ
         */
        async saveToGithub(data) {
            if (typeof githubUploadData === 'function') {
                try {
                    await githubUploadData();
                    showNotification('تم رفع النسخة إلى GitHub', 'success');
                } catch (error) {
                    showNotification('فشل الرفع إلى GitHub - تحقق من الإعدادات', 'error');
                    // تحميل محلي كبديل
                    this.downloadBackup(data, `backup_${moment().format('YYYY-MM-DD_HH-mm-ss')}.json`);
                }
            } else {
                showNotification('GitHub غير مهيأ - سيتم التحميل محلياً', 'warning');
                this.downloadBackup(data, `backup_${moment().format('YYYY-MM-DD_HH-mm-ss')}.json`);
            }
        },

        /**
         * ضغط البيانات
         * @param {string} str - النص
         * @returns {string} النص المضغوط
         */
        /**
         * ملاحظة: الدالة compressData — وصف تلقائي موجز لوظيفتها.
         * المدخلات: str
         * المخرجات: راجع التنفيذ
         */
        compressData(str) {
            // استخدام ضغط بسيط (يمكن استبداله بمكتبة ضغط حقيقية)
            return btoa(encodeURIComponent(str));
        },

        /**
         * فك ضغط البيانات
         * @param {string} str - النص المضغوط
         * @returns {string} النص الأصلي
         */
        /**
         * ملاحظة: الدالة decompressData — وصف تلقائي موجز لوظيفتها.
         * المدخلات: str
         * المخرجات: راجع التنفيذ
         */
        decompressData(str) {
            return decodeURIComponent(atob(str));
        },

        /**
         * تشفير البيانات
         * @param {string} data - البيانات
         * @param {string} password - كلمة المرور
         * @returns {string} البيانات المشفرة
         */
        /**
         * ملاحظة: الدالة encryptData — وصف تلقائي موجز لوظيفتها.
         * المدخلات: data, password
         * المخرجات: راجع التنفيذ
         */
        encryptData(data, password) {
            // استخدام تشفير بسيط (يُفضل استخدام مكتبة تشفير قوية)
            if (typeof simpleEncrypt === 'function') {
                return simpleEncrypt(data, password);
            }
            return data; // إرجاع البيانات كما هي إذا لم يكن التشفير متاحاً
        },

        /**
         * فك تشفير البيانات
         * @param {string} data - البيانات المشفرة
         * @param {string} password - كلمة المرور
         * @returns {string} البيانات الأصلية
         */
        /**
         * ملاحظة: الدالة decryptData — وصف تلقائي موجز لوظيفتها.
         * المدخلات: data, password
         * المخرجات: راجع التنفيذ
         */
        decryptData(data, password) {
            if (typeof simpleDecrypt === 'function') {
                return simpleDecrypt(data, password);
            }
            return data;
        },

        /**
         * الحصول على كلمة المرور من المستخدم
         * @returns {Promise<string>} كلمة المرور
         */
        /**
         * ملاحظة: الدالة getPassword — وصف تلقائي موجز لوظيفتها.
         * المدخلات: بدون
         * المخرجات: راجع التنفيذ
         */
        async getPassword() {
            return new Promise((resolve) => {
                const password = prompt('أدخل كلمة مرور للتشفير (اختياري):');
                resolve(password || null);
            });
        },

        /**
         * استعادة نسخة احتياطية
         * @param {File} file - ملف النسخة الاحتياطية
         */
        /**
         * ملاحظة: الدالة restoreBackup — وصف تلقائي موجز لوظيفتها.
         * المدخلات: file
         * المخرجات: راجع التنفيذ
         */
        async restoreBackup(file) {
            try {
                showNotification('جاري استعادة النسخة الاحتياطية...', 'info');
                
                const text = await file.text();
                let backupData = (typeof safeJsonParse === 'function' && typeof FeatureFlags !== 'undefined' && FeatureFlags.isEnabled('safeJsonParse')) ? safeJsonParse(text, {}) : JSON.parse(text);
                
                // التحقق من صحة البيانات
                if (!backupData.version || !backupData.data) {
                    throw new Error('ملف نسخة احتياطية غير صالح');
                }
                
                // فك التشفير إذا كان مشفراً
                if (backupData.encrypted) {
                    const password = await this.getPassword();
                    if (!password) {
                        showNotification('التشفير مطلوب - تم إلغاء الاستعادة', 'warning');
                        return;
                    }
                    backupData.data = this.decryptData(backupData.data, password);
                }
                
                // فك الضغط إذا كان مضغوطاً
                if (backupData.compressed) {
                    backupData.data = (typeof safeJsonParse === 'function' && typeof FeatureFlags !== 'undefined' && FeatureFlags.isEnabled('safeJsonParse')) ? safeJsonParse(this.decompressData(backupData.data), {}) : JSON.parse(this.decompressData(backupData.data));
                }
                
                // استعادة البيانات
                if (typeof backupData.data === 'string') {
                    backupData.data = (typeof safeJsonParse === 'function' && typeof FeatureFlags !== 'undefined' && FeatureFlags.isEnabled('safeJsonParse')) ? safeJsonParse(backupData.data, {}) : JSON.parse(backupData.data);
                }
                
                // تطبيق البيانات
                Object.assign(data, backupData.data);
                
                // حفظ البيانات
                saveData();
                
                // استعادة الإعدادات إذا كانت موجودة
                if (backupData.data.settings) {
                    AppSettings.import(JSON.stringify({
                        settings: backupData.data.settings,
                        version: '1.0.0'
                    }));
                }
                
                showNotification('تمت استعادة النسخة الاحتياطية بنجاح', 'success');
                
                // تحديث جميع الواجهات
                if (typeof refreshCurrentView === 'function') {
                    refreshCurrentView();
                }
                
            } catch (error) {
                console.error('خطأ في استعادة النسخة:', error);
                showNotification('فشلت استعادة النسخة الاحتياطية', 'error');
            }
        },

        /**
         * عرض قائمة النسخ المحفوظة في المتصفح
         */
        /**
         * ملاحظة: الدالة showBrowserBackups — وصف تلقائي موجز لوظيفتها.
         * المدخلات: بدون
         * المخرجات: راجع التنفيذ
         */
        showBrowserBackups() {
            const backupsList = (typeof safeJsonParse === 'function' && typeof FeatureFlags !== 'undefined' && FeatureFlags.isEnabled('safeJsonParse')) ? (safeJsonParse(localStorage.getItem('backupsList')||'[]', [])||[]) : JSON.parse(localStorage.getItem('backupsList') || '[]');
            
            if (backupsList.length === 0) {
                showNotification('لا توجد نسخ احتياطية محفوظة', 'info');
                return;
            }
            
            // إنشاء قائمة بالنسخ
            let html = '<div class="list-group">';
            backupsList.forEach(backup => {
                const date = moment(backup.timestamp).format('YYYY-MM-DD HH:mm');
                const size = (backup.size / 1024).toFixed(2) + ' KB';
                html += `
                    <div class="list-group-item">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="mb-1">${date}</h6>
                                <small>الحجم: ${size} | السجلات: ${backup.metadata.totalRecords}</small>
                            </div>
                            <div>
                                <button class="btn btn-sm btn-primary" onclick="BackupSystem.restoreBrowserBackup('${backup.key}')">
                                    استعادة
                                </button>
                                <button class="btn btn-sm btn-danger" onclick="BackupSystem.deleteBrowserBackup('${backup.key}')">
                                    حذف
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
            
            // عرض في نافذة
            const modal = `
                <div class="modal fade" id="browserBackupsModal" tabindex="-1">
                    <div class="modal-dialog modal-lg">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">النسخ الاحتياطية المحفوظة</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body">
                                ${html}
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            const modalEl = document.createElement('div');
            modalEl.innerHTML = modal;
            document.body.appendChild(modalEl.firstElementChild);
            const modalInstance = new bootstrap.Modal(document.getElementById('browserBackupsModal'));
            modalInstance.show();
            
            document.getElementById('browserBackupsModal').addEventListener('hidden.bs.modal', function() {
                this.remove();
            });
        },

        /**
         * استعادة نسخة من المتصفح
         * @param {string} key - مفتاح النسخة
         */
        /**
         * ملاحظة: الدالة restoreBrowserBackup — وصف تلقائي موجز لوظيفتها.
         * المدخلات: key
         * المخرجات: راجع التنفيذ
         */
        async restoreBrowserBackup(key) {
            try {
                const backupStr = localStorage.getItem(key);
                if (!backupStr) {
                    showNotification('النسخة غير موجودة', 'error');
                    return;
                }
                
                const backupData = (typeof safeJsonParse === 'function' && typeof FeatureFlags !== 'undefined' && FeatureFlags.isEnabled('safeJsonParse')) ? safeJsonParse(backupStr, {}) : JSON.parse(backupStr);
                const file = new File([JSON.stringify(backupData)], 'backup.json', { type: 'application/json' });
                await this.restoreBackup(file);
                
                // إغلاق النافذة
                const modal = bootstrap.Modal.getInstance(document.getElementById('browserBackupsModal'));
                if (modal) modal.hide();
                
            } catch (error) {
                console.error('خطأ في استعادة النسخة:', error);
                showNotification('فشلت استعادة النسخة', 'error');
            }
        },

        /**
         * تنظيف HTML
         */
        /**
         * ملاحظة: الدالة escapeHtml — وصف تلقائي موجز لوظيفتها.
         * المدخلات: text
         * المخرجات: راجع التنفيذ
         */
        escapeHtml(text) {
            const map = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            };
            return text.replace(/[&<>"']/g, m => map[m]);
        },

        /**
         * حذف نسخة من المتصفح
         * @param {string} key - مفتاح النسخة
         */
        /**
         * ملاحظة: الدالة deleteBrowserBackup — وصف تلقائي موجز لوظيفتها.
         * المدخلات: key
         * المخرجات: راجع التنفيذ
         */
        deleteBrowserBackup(key) {
            if (!confirm('هل أنت متأكد من حذف هذه النسخة؟')) return;
            
            try {
                localStorage.removeItem(key);
                
                // تحديث القائمة
                let backupsList = (typeof safeJsonParse === 'function' && typeof FeatureFlags !== 'undefined' && FeatureFlags.isEnabled('safeJsonParse')) ? (safeJsonParse(localStorage.getItem('backupsList')||'[]', [])||[]) : JSON.parse(localStorage.getItem('backupsList') || '[]');
                backupsList = backupsList.filter(b => b.key !== key);
                localStorage.setItem('backupsList', JSON.stringify(backupsList));
                
                showNotification('تم حذف النسخة', 'success');
                
                // تحديث العرض
                this.showBrowserBackups();
                
            } catch (error) {
                console.error('خطأ في حذف النسخة:', error);
                showNotification('فشل حذف النسخة', 'error');
            }
        }
    };

    // تصدير النظام
    window.BackupSystem = BackupSystem;
    
    // دالة مختصرة للاستخدام السريع
    window.createBackup = () => BackupSystem.createBackup();
    window.restoreBackup = (file) => BackupSystem.restoreBackup(file);

})();