/**
 * ملف encryption.js - نظام تشفير البيانات الحساسة
 * يوفر تشفير بسيط باستخدام XOR وBase64
 * يتعامل مع البيانات المالية والحساسة في التطبيق
 * يدعم تشفير وفك تشفير الكائنات بالكامل
 * 
 * المشاكل المحتملة:
 * - التشفير بـ XOR بسيط وغير آمن للاستخدام الحقيقي
 * - المفتاح مخزن في الكود مما يجعله غير آمن
 * - لا يستخدم معايير تشفير قوية مثل AES
 * - deriveKey يستخدم hash بسيط غير آمن
 * - معالجة الأخطاء تعيد البيانات غير المشفرة
 * - لا يوجد آلية لإدارة مفاتيح التشفير
 * - لا يوجد تأمين ضد هجمات القوة الغاشمة
 * - لا يستخدم Web Crypto API المتقدمة
 */

// مكتبة تشفير البيانات الحساسة

/**
 * نظام تشفير البيانات الحساسة
 * يوفر تشفير بسيط باستخدام XOR وBase64
 * يتعامل مع البيانات المالية والحساسة في التطبيق
 * يدعم تشفير وفك تشفير الكائنات بالكامل
 */
(function() {
    'use strict';

    // مفتاح التشفير - في بيئة الإنتاج يجب أن يكون أكثر تعقيداً وأماناً
    // تحذير: هذا المفتاح ثابت ومعروف - غير آمن للبيانات الحساسة
    // يجب استخدام مفتاح متغير ومخزن بشكل آمن
    const ENCRYPTION_KEY = 'NC-2024-SEC-KEY-' + window.location.hostname;
    
    /**
     * إنشاء مفتاح مشتق للتشفير
     * يستخدم مفتاح أساسي مع salt لزيادة العشوائية
     * ينشئ hash بسيط باستخدام العمليات الحسابية
     * @param {string} salt - قيمة إضافية لتعزيز المفتاح
     * @returns {string} مفتاح مشتق بصيغة base36
     */
    /**
     * ملاحظة: الدالة deriveKey — وصف تلقائي موجز لوظيفتها.
     * المدخلات: salt = ''
     * المخرجات: راجع التنفيذ
     */
    /**
     * ملاحظة: الدالة deriveKey — وصف تلقائي موجز لوظيفتها.
     * المدخلات: salt = ''
     * المخرجات: راجع التنفيذ
     */
    function deriveKey(salt = '') {
        const baseKey = ENCRYPTION_KEY + salt;
        let hash = 0;
        for (let i = 0; i < baseKey.length; i++) {
            const char = baseKey.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // تحويل إلى 32-bit integer
        }
        return Math.abs(hash).toString(36);
    }

    /**
     * تشفير نص باستخدام XOR وBase64
     * يطبق عملية XOR على كل حرف مع المفتاح
     * يحول النتيجة إلى Base64 لتجنب مشاكل الترميز
     * @param {string} text - النص المراد تشفيره
     * @param {string} key - مفتاح التشفير
     * @returns {string} النص المشفر بصيغة Base64
     */
    /**
     * ملاحظة: الدالة simpleEncrypt — وصف تلقائي موجز لوظيفتها.
     * المدخلات: text, key
     * المخرجات: راجع التنفيذ
     */
    /**
     * ملاحظة: الدالة simpleEncrypt — وصف تلقائي موجز لوظيفتها.
     * المدخلات: text, key
     * المخرجات: راجع التنفيذ
     */
    function simpleEncrypt(text, key) {
        if (!text) return '';
        
        let result = '';
        for (let i = 0; i < text.length; i++) {
            const charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
            result += String.fromCharCode(charCode);
        }
        
        // تحويل إلى Base64 لتجنب مشاكل الترميز
        try {
            return btoa(unescape(encodeURIComponent(result)));
        } catch (e) {
            console.error('خطأ في التشفير:', e);
            // تحذير: إرجاع النص الأصلي يكشف البيانات الحساسة
            return text; // إرجاع النص الأصلي في حالة الفشل
        }
    }

    /**
     * فك تشفير نص مشفر بـ XOR وBase64
     * يفك ترميز Base64 أولاً
     * يطبق عملية XOR مرة أخرى للحصول على النص الأصلي
     * @param {string} encryptedText - النص المشفر
     * @param {string} key - مفتاح فك التشفير
     * @returns {string} النص الأصلي
     */
    /**
     * ملاحظة: الدالة simpleDecrypt — وصف تلقائي موجز لوظيفتها.
     * المدخلات: encryptedText, key
     * المخرجات: راجع التنفيذ
     */
    /**
     * ملاحظة: الدالة simpleDecrypt — وصف تلقائي موجز لوظيفتها.
     * المدخلات: encryptedText, key
     * المخرجات: راجع التنفيذ
     */
    function simpleDecrypt(encryptedText, key) {
        if (!encryptedText) return '';
        
        try {
            // فك Base64 أولاً
            const decoded = decodeURIComponent(escape(atob(encryptedText)));
            
            let result = '';
            for (let i = 0; i < decoded.length; i++) {
                const charCode = decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length);
                result += String.fromCharCode(charCode);
            }
            
            return result;
        } catch (e) {
            console.error('خطأ في فك التشفير:', e);
            // تحذير: قد يكون هناك خطأ في المفتاح أو البيانات
            return encryptedText; // إرجاع النص المشفر في حالة الفشل
        }
    }

    /**
     * تشفير كائن بالكامل أو حقول محددة
     * يشفر الحقول الحساسة تلقائياً (الأسعار، المبالغ، إلخ)
     * يدعم الكائنات والمصفوفات المتداخلة
     * يضيف علامة للحقول المشفرة
     * @param {Object|Array} obj - الكائن أو المصفوفة للتشفير
     * @param {Array<string>} fieldsToEncrypt - حقول إضافية للتشفير
     * @returns {Object|Array} الكائن المشفر
     */
    /**
     * ملاحظة: الدالة encryptObject — وصف تلقائي موجز لوظيفتها.
     * المدخلات: obj, fieldsToEncrypt = []
     * المخرجات: راجع التنفيذ
     */
    /**
     * ملاحظة: الدالة encryptObject — وصف تلقائي موجز لوظيفتها.
     * المدخلات: obj, fieldsToEncrypt = []
     * المخرجات: راجع التنفيذ
     */
    function encryptObject(obj, fieldsToEncrypt = []) {
        if (!obj || typeof obj !== 'object') return obj;
        
        const key = deriveKey(new Date().toDateString());
        const encrypted = (typeof safeJsonParse==='function' && typeof FeatureFlags!=='undefined' && FeatureFlags.isEnabled('safeJsonParse')) ? safeJsonParse(JSON.stringify(obj), {}) : JSON.parse(JSON.stringify(obj)); // نسخة عميقة
        
        // قائمة الحقول الحساسة الافتراضية
        const sensitiveFields = [
            'price', 'amount', 'total', 'balance',
            'retailPrice', 'wholesalePrice', 'distributorPrice',
            'cost', 'profit', 'debt', 'payment',
            'salary', 'income', 'expense',
            ...fieldsToEncrypt
        ];
        
        /**
         * ملاحظة: الدالة encryptFields — وصف تلقائي موجز لوظيفتها.
         * المدخلات: item
         * المخرجات: راجع التنفيذ
         */
        /**
         * ملاحظة: الدالة encryptFields — وصف تلقائي موجز لوظيفتها.
         * المدخلات: item
         * المخرجات: راجع التنفيذ
         */
        function encryptFields(item) {
            if (!item || typeof item !== 'object') return;
            
            for (const field of Object.keys(item)) {
                // تشفير الحقول الحساسة
                if (sensitiveFields.some(sf => field.toLowerCase().includes(sf.toLowerCase()))) {
                    if (typeof item[field] === 'string' || typeof item[field] === 'number') {
                        item[field] = simpleEncrypt(String(item[field]), key);
                        item[`_${field}_encrypted`] = true;
                    }
                }
                
                // معالجة الكائنات والمصفوفات المتداخلة
                if (typeof item[field] === 'object' && item[field] !== null) {
                    if (Array.isArray(item[field])) {
                        item[field].forEach(encryptFields);
                    } else {
                        encryptFields(item[field]);
                    }
                }
            }
        }
        
        if (Array.isArray(encrypted)) {
            encrypted.forEach(encryptFields);
        } else {
            encryptFields(encrypted);
        }
        
        return encrypted;
    }

    /**
     * فك تشفير كائن مشفر
     * يفك تشفير جميع الحقول المشفرة في الكائن
     * يحول القيم إلى أرقام إذا كانت أرقاماً في الأصل
     * يزيل علامات التشفير من الحقول
     * @param {Object|Array} obj - الكائن المشفر لفك تشفيره
     * @returns {Object|Array} الكائن بعد فك التشفير
     */
    /**
     * ملاحظة: الدالة decryptObject — وصف تلقائي موجز لوظيفتها.
     * المدخلات: obj
     * المخرجات: راجع التنفيذ
     */
    /**
     * ملاحظة: الدالة decryptObject — وصف تلقائي موجز لوظيفتها.
     * المدخلات: obj
     * المخرجات: راجع التنفيذ
     */
    function decryptObject(obj) {
        if (!obj || typeof obj !== 'object') return obj;
        
        const key = deriveKey(new Date().toDateString());
        const decrypted = (typeof safeJsonParse==='function' && typeof FeatureFlags!=='undefined' && FeatureFlags.isEnabled('safeJsonParse')) ? safeJsonParse(JSON.stringify(obj), {}) : JSON.parse(JSON.stringify(obj)); // نسخة عميقة
        
        /**
         * ملاحظة: الدالة decryptFields — وصف تلقائي موجز لوظيفتها.
         * المدخلات: item
         * المخرجات: راجع التنفيذ
         */
        /**
         * ملاحظة: الدالة decryptFields — وصف تلقائي موجز لوظيفتها.
         * المدخلات: item
         * المخرجات: راجع التنفيذ
         */
        function decryptFields(item) {
            if (!item || typeof item !== 'object') return;
            
            for (const field of Object.keys(item)) {
                // فك تشفير الحقول المشفرة
                if (item[`_${field}_encrypted`] === true) {
                    try {
                        item[field] = simpleDecrypt(item[field], key);
                        // محاولة تحويل إلى رقم إذا كان رقماً
                        const numValue = Number(item[field]);
                        if (!isNaN(numValue) && item[field] !== '') {
                            item[field] = numValue;
                        }
                        delete item[`_${field}_encrypted`];
                    } catch (e) {
                        console.error(`خطأ في فك تشفير ${field}:`, e);
                    }
                }
                
                // معالجة الكائنات والمصفوفات المتداخلة
                if (typeof item[field] === 'object' && item[field] !== null) {
                    if (Array.isArray(item[field])) {
                        item[field].forEach(decryptFields);
                    } else {
                        decryptFields(item[field]);
                    }
                }
            }
        }
        
        if (Array.isArray(decrypted)) {
            decrypted.forEach(decryptFields);
        } else {
            decryptFields(decrypted);
        }
        
        return decrypted;
    }

    /**
     * حفظ بيانات مشفرة في localStorage
     * يشفر البيانات قبل الحفظ
     * يضيف توقيع للتحقق من سلامة البيانات
     * يضيف طابع زمني للحفظ
     * @param {string} key - مفتاح التخزين
     * @param {*} data - البيانات المراد حفظها
     * @returns {boolean} true إذا تم الحفظ بنجاح
     */
    /**
     * ملاحظة: الدالة saveEncrypted — وصف تلقائي موجز لوظيفتها.
     * المدخلات: key, data
     * المخرجات: راجع التنفيذ
     */
    /**
     * ملاحظة: الدالة saveEncrypted — وصف تلقائي موجز لوظيفتها.
     * المدخلات: key, data
     * المخرجات: راجع التنفيذ
     */
    function saveEncrypted(key, data) {
        try {
            const encrypted = encryptObject(data);
            const jsonString = JSON.stringify(encrypted);
            
            // إضافة توقيع للتحقق من سلامة البيانات
            const signature = deriveKey(jsonString);
            const dataWithSignature = {
                data: encrypted,
                signature: signature,
                timestamp: new Date().toISOString()
            };
            
            localStorage.setItem(key, JSON.stringify(dataWithSignature));
            return true;
        } catch (error) {
            console.error('خطأ في حفظ البيانات المشفرة:', error);
            return false;
        }
    }

    /**
     * قراءة بيانات مشفرة من localStorage
     * يتحقق من سلامة البيانات بالتوقيع
     * يفك تشفير البيانات ويعيدها
     * @param {string} key - مفتاح التخزين
     * @returns {*} البيانات بعد فك التشفير أو null
     */
    /**
     * ملاحظة: الدالة loadEncrypted — وصف تلقائي موجز لوظيفتها.
     * المدخلات: key
     * المخرجات: راجع التنفيذ
     */
    /**
     * ملاحظة: الدالة loadEncrypted — وصف تلقائي موجز لوظيفتها.
     * المدخلات: key
     * المخرجات: راجع التنفيذ
     */
    function loadEncrypted(key) {
        try {
            const stored = localStorage.getItem(key);
            if (!stored) return null;
            
            const parsed = (typeof safeJsonParse==='function' && typeof FeatureFlags!=='undefined' && FeatureFlags.isEnabled('safeJsonParse')) ? safeJsonParse(stored, null) : JSON.parse(stored);
            
            // التحقق من التوقيع
            const expectedSignature = deriveKey(JSON.stringify(parsed.data));
            if (parsed.signature !== expectedSignature) {
                console.warn('تحذير: البيانات قد تكون معدلة!');
            }
            
            // فك التشفير
            return decryptObject(parsed.data);
        } catch (error) {
            console.error('خطأ في قراءة البيانات المشفرة:', error);
            return null;
        }
    }

    /**
     * تشفير قيمة واحدة (نص أو رقم)
     * يستخدم مفتاح يومي للتشفير
     * @param {*} value - القيمة المراد تشفيرها
     * @returns {string} القيمة المشفرة
     */
    /**
     * ملاحظة: الدالة encryptValue — وصف تلقائي موجز لوظيفتها.
     * المدخلات: value
     * المخرجات: راجع التنفيذ
     */
    /**
     * ملاحظة: الدالة encryptValue — وصف تلقائي موجز لوظيفتها.
     * المدخلات: value
     * المخرجات: راجع التنفيذ
     */
    function encryptValue(value) {
        const key = deriveKey(new Date().toDateString());
        return simpleEncrypt(String(value), key);
    }

    /**
     * فك تشفير قيمة واحدة
     * يحول إلى رقم إذا كانت القيمة رقمية
     * @param {string} encryptedValue - القيمة المشفرة
     * @returns {*} القيمة بعد فك التشفير
     */
    /**
     * ملاحظة: الدالة decryptValue — وصف تلقائي موجز لوظيفتها.
     * المدخلات: encryptedValue
     * المخرجات: راجع التنفيذ
     */
    /**
     * ملاحظة: الدالة decryptValue — وصف تلقائي موجز لوظيفتها.
     * المدخلات: encryptedValue
     * المخرجات: راجع التنفيذ
     */
    function decryptValue(encryptedValue) {
        const key = deriveKey(new Date().toDateString());
        const decrypted = simpleDecrypt(encryptedValue, key);
        
        // محاولة تحويل إلى رقم إذا كان رقماً
        const numValue = Number(decrypted);
        if (!isNaN(numValue) && decrypted !== '') {
            return numValue;
        }
        
        return decrypted;
    }

    /**
     * التحقق من دعم التشفير في المتصفح
     * يختبر دوال btoa وatob المطلوبة للتشفير
     * @returns {boolean} true إذا كان التشفير مدعوماً
     */
    /**
     * ملاحظة: الدالة isEncryptionSupported — وصف تلقائي موجز لوظيفتها.
     * المدخلات: بدون
     * المخرجات: راجع التنفيذ
     */
    /**
     * ملاحظة: الدالة isEncryptionSupported — وصف تلقائي موجز لوظيفتها.
     * المدخلات: بدون
     * المخرجات: راجع التنفيذ
     */
    function isEncryptionSupported() {
        try {
            // اختبار btoa و atob
            const test = 'test';
            const encoded = btoa(test);
            const decoded = atob(encoded);
            return decoded === test;
        } catch (e) {
            return false;
        }
    }

    // ترحيل البيانات الموجودة إلى تشفير
    function migrateExistingData() {
        try {
            const existingData = localStorage.getItem('networkCardsData');
            if (existingData && !existingData.includes('"_encrypted"')) {
                // البيانات غير مشفرة، قم بتشفيرها
                const parsed = (typeof safeJsonParse==='function' && typeof FeatureFlags!=='undefined' && FeatureFlags.isEnabled('safeJsonParse')) ? safeJsonParse(existingData, {}) : JSON.parse(existingData);
                saveEncrypted('networkCardsData', parsed);
                console.log('تم ترحيل البيانات إلى التشفير بنجاح');
            }
        } catch (error) {
            console.error('خطأ في ترحيل البيانات:', error);
        }
    }

    // تصدير الدوال
    if (typeof window !== 'undefined') {
        window.DataEncryption = {
            encrypt: simpleEncrypt,
            decrypt: simpleDecrypt,
            encryptObject,
            decryptObject,
            saveEncrypted,
            loadEncrypted,
            encryptValue,
            decryptValue,
            isEncryptionSupported,
            migrateExistingData
        };
        
        // اختصارات سريعة
        window.$encrypt = {
            save: saveEncrypted,
            load: loadEncrypted,
            value: encryptValue,
            decrypt: decryptValue
        };
    }

    // التحقق من دعم التشفير عند التحميل
    document.addEventListener('DOMContentLoaded', function() {
        if (!isEncryptionSupported()) {
            console.warn('تحذير: المتصفح لا يدعم التشفير الكامل');
        } else {
            // ترحيل البيانات الموجودة
            migrateExistingData();
        }
    });

})();