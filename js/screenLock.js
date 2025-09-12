/**
 * نظام قفل الشاشة المتقدم
 * يوفر حماية إضافية للتطبيق عند عدم النشاط
 * يدعم رمز PIN ونمط الفتح والبصمة (إذا متوفرة)
 */

class ScreenLockManager {
    constructor() {
        this.isLocked = false;
        this.lockTimeout = null;
        this.inactivityTimer = null;
        this.lastActivity = Date.now();
        this.lockMethods = ['pin', 'password']; // فقط الطرق المتاحة لتطبيق الويب
        this.currentMethod = 'pin';
        this.maxAttempts = 5;
        this.currentAttempts = 0;
        
        this.init();
    }

    /**
     * تهيئة نظام القفل
     */
    init() {
        this.createLockScreen();
        this.setupEventListeners();
        this.loadSettings();
        
        // تحديث ظهور زر القفل عند التحميل
        setTimeout(() => {
            this.updateLockButtonVisibility();
        }, 1000);
        
        console.log('🔒 تم تهيئة نظام قفل الشاشة');
    }

    /**
     * تحديث ظهور زر القفل
     */
    updateLockButtonVisibility() {
        const lockButton = document.getElementById('lockButton');
        if (!lockButton) return;
        
        const settings = this.getSettings();
        
        // إظهار الزر فقط إذا كان القفل مفعل ونوع القفل محدد وهناك بيانات صحيحة
        const shouldShow = settings.autoLockEnabled && 
                          settings.lockMethod !== 'none' && 
                          ((settings.lockMethod === 'pin' && settings.pin && settings.pin.length >= 4) ||
                           (settings.lockMethod === 'password' && settings.password && settings.password.length >= 4));
        
        if (shouldShow) {
            lockButton.classList.remove('d-none');
        } else {
            lockButton.classList.add('d-none');
        }
    }

    /**
     * إنشاء واجهة شاشة القفل
     */
    createLockScreen() {
        const lockScreenHTML = `
            <div id="screenLock" class="screen-lock d-none">
                <div class="lock-overlay"></div>
                <div class="lock-container">
                    <div class="lock-header text-center mb-4">
                        <i class="fas fa-lock fa-3x text-primary mb-3"></i>
                        <h3 class="text-white">التطبيق مقفل</h3>
                        <p class="text-muted">أدخل رمز الحماية للمتابعة</p>
                    </div>

                    <!-- طريقة PIN -->
                    <div id="pinMethod" class="lock-method">
                        <div class="pin-input-container">
                            <input type="password" id="pinInput" class="form-control pin-input" 
                                   placeholder="أدخل رمز PIN" maxlength="6" autocomplete="off">
                            <div class="pin-dots mt-3">
                                <span class="pin-dot"></span>
                                <span class="pin-dot"></span>
                                <span class="pin-dot"></span>
                                <span class="pin-dot"></span>
                                <span class="pin-dot"></span>
                                <span class="pin-dot"></span>
                            </div>
                        </div>
                    </div>

                    <!-- طريقة كلمة المرور -->
                    <div id="passwordMethod" class="lock-method d-none">
                        <div class="password-input-container">
                            <input type="password" id="passwordInput" class="form-control password-input" 
                                   placeholder="أدخل كلمة المرور" autocomplete="off">
                        </div>
                    </div>


                    <!-- أزرار التحكم -->
                    <div class="lock-controls mt-4">
                        <div class="row">
                            <div class="col-12">
                                <button class="btn btn-primary w-100" onclick="screenLock.unlock()">
                                    <i class="fas fa-unlock me-2"></i>
                                    فتح
                                </button>
                            </div>
                        </div>
                        <div class="row mt-2">
                            <div class="col-12">
                                <button class="btn btn-outline-light w-100" onclick="screenLock.openSecuritySettings()">
                                    <i class="fas fa-cog me-2"></i>
                                    تغيير إعدادات القفل
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- معلومات المحاولات -->
                    <div class="attempts-info mt-3 text-center">
                        <small class="text-muted">
                            المحاولات المتبقية: <span id="attemptsLeft">5</span>
                        </small>
                    </div>

                    <!-- رسالة الخطأ -->
                    <div id="lockError" class="alert alert-danger mt-3 d-none" role="alert">
                        <i class="fas fa-exclamation-triangle me-2"></i>
                        <span id="lockErrorMessage"></span>
                    </div>
                </div>
            </div>
        `;

        // إضافة HTML إلى الصفحة
        document.body.insertAdjacentHTML('beforeend', lockScreenHTML);

        // إضافة CSS
        this.addLockScreenStyles();
    }

    /**
     * إضافة أنماط شاشة القفل
     */
    addLockScreenStyles() {
        const styles = `
            <style id="screenLockStyles">
                .screen-lock {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 10000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .lock-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(135deg, 
                        rgba(87, 86, 87, 0.95) 0%, 
                        rgba(52, 152, 219, 0.95) 100%);
                    backdrop-filter: blur(10px);
                }

                .lock-container {
                    position: relative;
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(20px);
                    border-radius: 20px;
                    padding: 40px;
                    min-width: 400px;
                    max-width: 500px;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                }

                .pin-input {
                    background: rgba(255, 255, 255, 0.1);
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    color: white;
                    text-align: center;
                    font-size: 24px;
                    font-weight: bold;
                    letter-spacing: 8px;
                    border-radius: 15px;
                    padding: 15px;
                }

                .pin-input:focus {
                    background: rgba(255, 255, 255, 0.2);
                    border-color: #3498db;
                    box-shadow: 0 0 20px rgba(52, 152, 219, 0.5);
                    color: white;
                }

                .pin-input::placeholder {
                    color: rgba(255, 255, 255, 0.5);
                    letter-spacing: 2px;
                }

                .password-input {
                    background: rgba(255, 255, 255, 0.1);
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    color: white;
                    text-align: center;
                    font-size: 18px;
                    border-radius: 15px;
                    padding: 15px;
                }

                .password-input:focus {
                    background: rgba(255, 255, 255, 0.2);
                    border-color: #3498db;
                    box-shadow: 0 0 20px rgba(52, 152, 219, 0.5);
                    color: white;
                }

                .password-input::placeholder {
                    color: rgba(255, 255, 255, 0.5);
                }

                .pin-dots {
                    display: flex;
                    justify-content: center;
                    gap: 10px;
                }

                .pin-dot {
                    width: 15px;
                    height: 15px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.3);
                    transition: all 0.3s ease;
                }

                .pin-dot.filled {
                    background: #3498db;
                    box-shadow: 0 0 10px rgba(52, 152, 219, 0.8);
                }


                .lock-controls .btn {
                    border-radius: 15px;
                    padding: 12px 20px;
                    font-weight: bold;
                    transition: all 0.3s ease;
                }

                .lock-controls .btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
                }

                .attempts-info {
                    animation: fadeIn 0.5s ease;
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                /* تأثيرات الاهتزاز عند الخطأ */
                .shake {
                    animation: shake 0.6s ease-in-out;
                }

                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                    20%, 40%, 60%, 80% { transform: translateX(5px); }
                }

                /* استجابة للهواتف */
                @media (max-width: 768px) {
                    .lock-container {
                        margin: 20px;
                        min-width: auto;
                        padding: 30px 20px;
                    }
                    
                    .pin-input {
                        font-size: 20px;
                        letter-spacing: 6px;
                    }
                }
            </style>
        `;

        document.head.insertAdjacentHTML('beforeend', styles);
    }

    /**
     * إعداد مستمعي الأحداث
     */
    setupEventListeners() {
        // مراقبة النشاط
        const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
        
        activityEvents.forEach(event => {
            document.addEventListener(event, () => {
                this.updateActivity();
            }, true);
        });

        // مستمعي الإدخال
        document.addEventListener('DOMContentLoaded', () => {
            // مستمع PIN input
            const pinInput = document.getElementById('pinInput');
            if (pinInput) {
                pinInput.addEventListener('input', (e) => {
                    this.updatePinDots(e.target.value.length);
                });

                pinInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.unlock();
                    }
                });
            }

            // مستمع Password input
            const passwordInput = document.getElementById('passwordInput');
            if (passwordInput) {
                passwordInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.unlock();
                    }
                });
            }
        });

        // مستمع تغيير التبويب
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.updateActivity();
            }
        });
    }

    /**
     * تحديث آخر نشاط
     */
    updateActivity() {
        if (this.isLocked) return;
        
        this.lastActivity = Date.now();
        
        // إعادة تشغيل مؤقت عدم النشاط
        if (this.inactivityTimer) {
            clearTimeout(this.inactivityTimer);
        }

        const settings = this.getSettings();
        if (settings.autoLockEnabled && settings.inactivityMinutes > 0) {
            this.inactivityTimer = setTimeout(() => {
                this.lock();
            }, settings.inactivityMinutes * 60 * 1000);
        }
    }

    /**
     * قفل الشاشة
     */
    lock() {
        if (this.isLocked) return;

        const settings = this.getSettings();
        
        // التحقق من تفعيل القفل
        if (!settings.autoLockEnabled || settings.lockMethod === 'none') {
            if (typeof window.showNotification === 'function') {
                window.showNotification('القفل غير مفعل. يرجى تفعيله من إعدادات الأمان أولاً', 'warning');
            }
            this.openSecuritySettings();
            return;
        }

        // التحقق من وجود بيانات القفل المطلوبة
        if (settings.lockMethod === 'pin') {
            if (!settings.pin || settings.pin.length < 4) {
                if (typeof window.showNotification === 'function') {
                    window.showNotification('يرجى تحديد رمز PIN (4-6 أرقام) من إعدادات الأمان أولاً', 'warning');
                }
                this.openSecuritySettings();
                return;
            }
        } else if (settings.lockMethod === 'password') {
            if (!settings.password || settings.password.length < 4) {
                if (typeof window.showNotification === 'function') {
                    window.showNotification('يرجى تحديد كلمة مرور من إعدادات الأمان أولاً', 'warning');
                }
                this.openSecuritySettings();
                return;
            }
        } else {
            if (typeof window.showNotification === 'function') {
                window.showNotification('نوع قفل غير مدعوم. يرجى اختيار PIN أو كلمة مرور', 'warning');
            }
            this.openSecuritySettings();
            return;
        }

        this.isLocked = true;
        this.currentAttempts = 0;
        this.currentMethod = settings.lockMethod || 'pin';
        this.maxAttempts = settings.maxAttempts || 5;
        
        const lockScreen = document.getElementById('screenLock');
        if (lockScreen) {
            lockScreen.classList.remove('d-none');
            
            // إظهار الطريقة الصحيحة
            this.switchToMethod(this.currentMethod);
            
            // تركيز على حقل الإدخال
            setTimeout(() => {
                const pinInput = document.getElementById('pinInput');
                if (pinInput && this.currentMethod === 'pin') {
                    pinInput.focus();
                }
            }, 300);
        }

        // تشغيل صوت القفل
        this.playLockSound();

        console.log('🔒 تم قفل التطبيق بطريقة:', this.currentMethod);
        
        // إرسال إشعار
        if (typeof window.showNotification === 'function') {
            window.showNotification('تم قفل التطبيق', 'info');
        }
    }

    /**
     * فتح القفل
     */
    unlock() {
        const settings = this.getSettings();
        let isValid = false;

        switch (this.currentMethod) {
            case 'pin':
                isValid = this.validatePin();
                break;
            case 'password':
                isValid = this.validatePassword();
                break;
            default:
                this.showError('طريقة قفل غير مدعومة');
                return;
        }

        if (isValid) {
            this.performUnlock();
        } else {
            this.handleFailedAttempt();
        }
    }

    /**
     * تنفيذ فتح القفل
     */
    performUnlock() {
        this.isLocked = false;
        this.currentAttempts = 0;
        
        const lockScreen = document.getElementById('screenLock');
        if (lockScreen) {
            lockScreen.classList.add('d-none');
        }

        // إخفاء رسائل الخطأ
        this.hideError();

        // تشغيل صوت الفتح
        this.playUnlockSound();

        // إعادة تشغيل مؤقت عدم النشاط
        this.updateActivity();

        console.log('🔓 تم فتح القفل بنجاح');
        
        // إرسال إشعار
        if (typeof window.showNotification === 'function') {
            window.showNotification('تم فتح القفل بنجاح', 'success');
        }
    }

    /**
     * التحقق من صحة PIN
     */
    validatePin() {
        const pinInput = document.getElementById('pinInput');
        const enteredPin = pinInput ? pinInput.value : '';
        const settings = this.getSettings();
        
        return enteredPin === settings.pin;
    }


    /**
     * التحقق من صحة كلمة المرور
     */
    validatePassword() {
        const passwordInput = document.getElementById('passwordInput');
        const enteredPassword = passwordInput ? passwordInput.value : '';
        const settings = this.getSettings();
        
        return enteredPassword === settings.password;
    }


    /**
     * معالجة المحاولة الفاشلة
     */
    handleFailedAttempt() {
        this.currentAttempts++;
        const settings = this.getSettings();
        const attemptsLeft = this.maxAttempts - this.currentAttempts;

        // تحديث عداد المحاولات
        const attemptsElement = document.getElementById('attemptsLeft');
        if (attemptsElement) {
            attemptsElement.textContent = attemptsLeft;
        }

        // إظهار رسالة خطأ
        this.showError(`رمز خاطئ. المحاولات المتبقية: ${attemptsLeft}`);

        // تأثير الاهتزاز
        const lockContainer = document.querySelector('.lock-container');
        if (lockContainer) {
            lockContainer.classList.add('shake');
            setTimeout(() => {
                lockContainer.classList.remove('shake');
            }, 600);
        }

        // مسح حقول الإدخال
        const pinInput = document.getElementById('pinInput');
        const passwordInput = document.getElementById('passwordInput');
        
        if (pinInput && this.currentMethod === 'pin') {
            pinInput.value = '';
            this.updatePinDots(0);
        }
        
        if (passwordInput && this.currentMethod === 'password') {
            passwordInput.value = '';
        }

        // إذا نفدت المحاولات
        if (attemptsLeft <= 0) {
            this.lockoutUser();
        }

        // تشغيل صوت الخطأ
        this.playErrorSound();
    }

    /**
     * قفل المستخدم مؤقتاً
     */
    lockoutUser() {
        const lockoutTime = 5 * 60 * 1000; // 5 دقائق
        
        this.showError(`تم قفل التطبيق لمدة 5 دقائق بسبب المحاولات الفاشلة`);
        
        // تعطيل جميع حقول الإدخال
        const inputs = document.querySelectorAll('#screenLock input, #screenLock button');
        inputs.forEach(input => input.disabled = true);

        setTimeout(() => {
            this.currentAttempts = 0;
            inputs.forEach(input => input.disabled = false);
            this.hideError();
            
            const attemptsElement = document.getElementById('attemptsLeft');
            if (attemptsElement) {
                attemptsElement.textContent = this.maxAttempts;
            }
        }, lockoutTime);
    }

    /**
     * تبديل طريقة القفل
     */
    switchMethod() {
        const settings = this.getSettings();
        
        // في تطبيق الويب، نستخدم فقط الطريقة المحددة في الإعدادات
        // لا نسمح بتبديل الطرق - فقط الطريقة المختارة
        this.showError('يمكن استخدام طريقة واحدة فقط. غيّر نوع القفل من الإعدادات');
        
        // إظهار الطريقة الصحيحة
        this.switchToMethod(settings.lockMethod || 'pin');
    }

    /**
     * التبديل إلى طريقة محددة
     */
    switchToMethod(method) {
        this.currentMethod = method;
        
        // إخفاء جميع الطرق
        document.querySelectorAll('.lock-method').forEach(methodEl => {
            methodEl.classList.add('d-none');
        });

        // إظهار الطريقة المحددة فقط
        const currentMethodElement = document.getElementById(`${method}Method`);
        if (currentMethodElement) {
            currentMethodElement.classList.remove('d-none');
        } else {
            // إذا لم توجد الطريقة، اعرض PIN كافتراضي
            const pinMethod = document.getElementById('pinMethod');
            if (pinMethod) {
                pinMethod.classList.remove('d-none');
                this.currentMethod = 'pin';
            }
        }

        // تحديث عنوان شاشة القفل
        this.updateLockTitle();

        // تركيز على الحقل المناسب
        setTimeout(() => {
            if (this.currentMethod === 'pin') {
                const pinInput = document.getElementById('pinInput');
                if (pinInput) {
                    pinInput.focus();
                    pinInput.value = '';
                    this.updatePinDots(0);
                }
            } else if (this.currentMethod === 'password') {
                const passwordInput = document.getElementById('passwordInput');
                if (passwordInput) {
                    passwordInput.focus();
                    passwordInput.value = '';
                }
            }
        }, 100);
    }

    /**
     * تحديث عنوان شاشة القفل
     */
    updateLockTitle() {
        const titleElement = document.querySelector('.lock-header p');
        if (titleElement) {
            const methodNames = {
                'pin': 'أدخل رمز PIN للمتابعة',
                'password': 'أدخل كلمة المرور للمتابعة'
            };
            titleElement.textContent = methodNames[this.currentMethod] || 'أدخل رمز الحماية للمتابعة';
        }
    }

    /**
     * فتح إعدادات الأمان
     */
    openSecuritySettings() {
        // فتح الإعدادات وتبويب الأمان
        if (typeof window.SettingsUI !== 'undefined' && window.SettingsUI.init) {
            // استخدام نظام الإعدادات الموجود
            window.SettingsUI.init();
            
            // التبديل إلى تبويب الأمان
            setTimeout(() => {
                if (typeof window.SettingsUI.switchTab === 'function') {
                    window.SettingsUI.switchTab('security');
                } else {
                    // fallback: إظهار تبويب الأمان مباشرة
                    document.querySelectorAll('.settings-tab').forEach(tab => {
                        tab.style.display = 'none';
                    });
                    const securityTab = document.getElementById('security-settings');
                    if (securityTab) {
                        securityTab.style.display = 'block';
                    }
                }
            }, 500);
        } else {
            // fallback: محاولة فتح الإعدادات بطريقة أخرى
            const settingsBtn = document.querySelector('[onclick*="settings"], [href*="settings"]');
            if (settingsBtn) {
                settingsBtn.click();
            }
        }
    }

    /**
     * تحديث نقاط PIN
     */
    updatePinDots(length) {
        const dots = document.querySelectorAll('.pin-dot');
        dots.forEach((dot, index) => {
            if (index < length) {
                dot.classList.add('filled');
            } else {
                dot.classList.remove('filled');
            }
        });
    }

    /**
     * إظهار رسالة خطأ
     */
    showError(message) {
        const errorElement = document.getElementById('lockError');
        const errorMessageElement = document.getElementById('lockErrorMessage');
        
        if (errorElement && errorMessageElement) {
            errorMessageElement.textContent = message;
            errorElement.classList.remove('d-none');
        }
    }

    /**
     * إخفاء رسالة الخطأ
     */
    hideError() {
        const errorElement = document.getElementById('lockError');
        if (errorElement) {
            errorElement.classList.add('d-none');
        }
    }

    /**
     * تشغيل صوت القفل
     */
    playLockSound() {
        if (typeof window.playSound === 'function') {
            window.playSound('lock');
        }
    }

    /**
     * تشغيل صوت الفتح
     */
    playUnlockSound() {
        if (typeof window.playSound === 'function') {
            window.playSound('unlock');
        }
    }

    /**
     * تشغيل صوت الخطأ
     */
    playErrorSound() {
        if (typeof window.playSound === 'function') {
            window.playSound('error');
        }
    }

    /**
     * تحميل الإعدادات من النظام الموجود
     */
    loadSettings() {
        // تحميل من نظام الإعدادات الموجود
        if (typeof window.AppSettings !== 'undefined') {
            const settings = window.AppSettings.get('security') || {};
            return {
                autoLockEnabled: settings.appLock || false,
                inactivityMinutes: settings.autoLockMinutes || 15,
                pin: settings.pin || '',
                password: settings.password || '',
                pattern: settings.pattern || '',
                biometricEnabled: settings.twoFactorAuth || false,
                lockMethod: settings.lockType || 'none',
                maxAttempts: settings.maxLoginAttempts || 5
            };
        }
        
        // fallback للتخزين المحلي
        const saved = localStorage.getItem('screenLockSettings');
        return saved ? JSON.parse(saved) : this.getDefaultSettings();
    }

    /**
     * الحصول على الإعدادات
     */
    getSettings() {
        return this.loadSettings();
    }

    /**
     * الإعدادات الافتراضية
     */
    getDefaultSettings() {
        return {
            autoLockEnabled: false,
            inactivityMinutes: 15,
            pin: '',
            password: '',
            pattern: '',
            biometricEnabled: false,
            lockMethod: 'none',
            maxAttempts: 5
        };
    }

    /**
     * حفظ الإعدادات في النظام الموجود
     */
    saveSettings(settings) {
        if (typeof window.AppSettings !== 'undefined') {
            // حفظ في نظام الإعدادات الموجود
            window.AppSettings.update('security.appLock', settings.autoLockEnabled);
            window.AppSettings.update('security.lockType', settings.lockMethod || 'none');
            window.AppSettings.update('security.autoLockMinutes', settings.inactivityMinutes || 15);
            window.AppSettings.update('security.maxLoginAttempts', settings.maxAttempts || 5);
            
            // حفظ PIN/Password بشكل آمن
            if (settings.pin) {
                window.AppSettings.update('security.pin', settings.pin);
            }
            if (settings.password) {
                window.AppSettings.update('security.password', settings.password);
            }
            if (settings.pattern) {
                window.AppSettings.update('security.pattern', settings.pattern);
            }
            
            window.AppSettings.update('security.twoFactorAuth', settings.biometricEnabled);
        } else {
            // fallback للتخزين المحلي
            localStorage.setItem('screenLockSettings', JSON.stringify(settings));
        }
    }

    /**
     * قفل يدوي
     */
    manualLock() {
        this.lock();
    }

    /**
     * اختبار القفل (يتحقق من الإعدادات أولاً)
     */
    testLock() {
        const settings = this.getSettings();
        
        // التحقق الشامل
        if (!settings.autoLockEnabled || settings.lockMethod === 'none') {
            if (typeof window.showNotification === 'function') {
                window.showNotification('يرجى تفعيل "قفل التطبيق" وتحديد نوع القفل من إعدادات الأمان أولاً', 'warning');
            }
            this.openSecuritySettings();
            return;
        }
        
        if (settings.lockMethod === 'pin') {
            if (!settings.pin || settings.pin.length < 4 || !/^\d{4,6}$/.test(settings.pin)) {
                if (typeof window.showNotification === 'function') {
                    window.showNotification('يرجى تحديد رمز PIN صحيح (4-6 أرقام) من إعدادات الأمان', 'warning');
                }
                this.openSecuritySettings();
                return;
            }
        } else if (settings.lockMethod === 'password') {
            if (!settings.password || settings.password.length < 4) {
                if (typeof window.showNotification === 'function') {
                    window.showNotification('يرجى تحديد كلمة مرور (4 أحرف على الأقل) من إعدادات الأمان', 'warning');
                }
                this.openSecuritySettings();
                return;
            }
        } else {
            if (typeof window.showNotification === 'function') {
                window.showNotification('نوع قفل غير مدعوم. اختر PIN أو كلمة مرور فقط', 'warning');
            }
            this.openSecuritySettings();
            return;
        }
        
        // إذا كان كل شيء جاهز، اقفل للاختبار
        if (typeof window.showNotification === 'function') {
            window.showNotification('سيتم قفل التطبيق الآن للاختبار...', 'info');
        }
        
        setTimeout(() => {
            this.lock();
        }, 1000);
    }

    /**
     * فحص حالة القفل
     */
    isScreenLocked() {
        return this.isLocked;
    }

    /**
     * تعطيل القفل التلقائي مؤقتاً
     */
    disableAutoLock(minutes = 60) {
        if (this.inactivityTimer) {
            clearTimeout(this.inactivityTimer);
        }
        
        setTimeout(() => {
            this.updateActivity();
        }, minutes * 60 * 1000);
        
        console.log(`تم تعطيل القفل التلقائي لمدة ${minutes} دقيقة`);
    }
}

// إنشاء مثيل عام
window.screenLock = new ScreenLockManager();

// تصدير للاستخدام في وحدات أخرى
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ScreenLockManager;
}