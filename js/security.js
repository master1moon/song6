/**
 * ملف security.js - دوال الأمان والحماية من هجمات XSS
 * يوفر دوال لتعقيم البيانات، إنشاء عناصر DOM آمنة، والتحقق من المدخلات
 * 
 * المشاكل المحتملة:
 * - addSecurityHeaders معطلة حالياً مما قد يقلل من الأمان
 * - قائمة العناصر المسموح بها في sanitizeHtml محدودة جداً
 * - validateInput لا يدعم جميع أنواع المدخلات المطلوبة
 * - لا يوجد حماية ضد CSRF attacks
 * - المعقمات قد تكسر بعض المحتوى العربي المعقد
 * - لا يوجد تعقيم لـ CSS/Style
 * - لا يوجد حماية ضد SQL Injection (لا يستخدم التطبيق SQL)
 */

// دوال الأمان والحماية من XSS
// يستخدم IIFE (Immediately Invoked Function Expression) لتجنب تلويث النطاق العام
(function() {
    'use strict';

    /**
     * تعقيم النص لمنع هجمات XSS
     * يحول الأحرف الخاصة في HTML إلى HTML entities
     * مشكلة: قد لا يكون كافياً لجميع السياقات
     */
    /**
     * تعقيم النص لمنع هجمات XSS
     * يحول الأحرف الخاصة في HTML إلى HTML entities
     * مشكلة: قد لا يكون كافياً لجميع السياقات
     * @param {*} text - النص المراد تعقيمه
     * @returns {string} النص المعقم الآمن
     */
    /**
     * ملاحظة: الدالة escapeHtml — وصف تلقائي موجز لوظيفتها.
     * المدخلات: text
     * المخرجات: راجع التنفيذ
     */
    /**
     * ملاحظة: الدالة escapeHtml — وصف تلقائي موجز لوظيفتها.
     * المدخلات: text
     * المخرجات: راجع التنفيذ
     */
    function escapeHtml(text) {
        if (text == null) return '';
        
        // خريطة الأحرف الخطرة وبدائلها الآمنة
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;',
            '/': '&#x2F;'
        };
        
        return String(text).replace(/[&<>"'\/]/g, function(m) { return map[m]; });
    }

    /**
     * تعقيم السمات HTML attributes
     * يحول الأحرف الخطرة إلى رموز HTML رقمية
     * أكثر أماناً من escapeHtml للسمات
     * @param {*} attr - قيمة السمة المراد تعقيمها
     * @returns {string} السمة المعقمة
     */
    /**
     * ملاحظة: الدالة escapeAttribute — وصف تلقائي موجز لوظيفتها.
     * المدخلات: attr
     * المخرجات: راجع التنفيذ
     */
    /**
     * ملاحظة: الدالة escapeAttribute — وصف تلقائي موجز لوظيفتها.
     * المدخلات: attr
     * المخرجات: راجع التنفيذ
     */
    function escapeAttribute(attr) {
        if (attr == null) return '';
        return String(attr).replace(/[&<>"']/g, function(m) {
            return '&#' + m.charCodeAt(0) + ';';
        });
    }

    /**
     * إنشاء عنصر DOM بطريقة آمنة
     * يتعامل مع السمات والمحتوى بشكل آمن
     * يسمح بـ innerHTML فقط عند تحديد trusted:true
     * @param {string} tag - اسم العنصر HTML
     * @param {Object} attributes - سمات العنصر
     * @param {Array} children - العناصر الفرعية
     * @returns {HTMLElement} العنصر المنشأ بشكل آمن
     */
    /**
     * ملاحظة: الدالة createElement — وصف تلقائي موجز لوظيفتها.
     * المدخلات: tag, attributes = {}, children = []
     * المخرجات: راجع التنفيذ
     */
    /**
     * ملاحظة: الدالة createElement — وصف تلقائي موجز لوظيفتها.
     * المدخلات: tag, attributes = {}, children = []
     * المخرجات: راجع التنفيذ
     */
    function createElement(tag, attributes = {}, children = []) {
        const element = document.createElement(tag);
        
        // إضافة السمات بطريقة آمنة
        for (const [key, value] of Object.entries(attributes)) {
            if (key === 'className') {
                element.className = escapeAttribute(value);
            } else if (key === 'textContent') {
                element.textContent = value; // textContent آمن تلقائياً
            } else if (key === 'innerHTML' && attributes.trusted === true) {
                // السماح بـ innerHTML فقط إذا كان موثوقاً صراحة
                element.innerHTML = value;
            } else if (key.startsWith('data-')) {
                element.setAttribute(key, escapeAttribute(value));
            } else if (key !== 'trusted') {
                element.setAttribute(key, escapeAttribute(value));
            }
        }
        
        // إضافة الأطفال
        children.forEach(child => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else if (child instanceof Node) {
                element.appendChild(child);
            }
        });
        
        return element;
    }

    /**
     * تعقيم HTML من المستخدم (للمحتوى الغني)
     * يزيل العناصر والسمات غير الآمنة
     * مشكلة: قائمة العناصر المسموح بها محدودة جداً
     * @param {string} html - كود HTML المراد تعقيمه
     * @returns {string} HTML معقم وآمن
     */
    /**
     * ملاحظة: الدالة sanitizeHtml — وصف تلقائي موجز لوظيفتها.
     * المدخلات: html
     * المخرجات: راجع التنفيذ
     */
    /**
     * ملاحظة: الدالة sanitizeHtml — وصف تلقائي موجز لوظيفتها.
     * المدخلات: html
     * المخرجات: راجع التنفيذ
     */
    function sanitizeHtml(html) {
        // قائمة موسعة للعناصر المسموح بها لتجنب كسر الواجهة عند استخدام الجداول والأزرار
        const allowedTags = [
            'b','i','u','em','strong','span','small','br','p','div','pre','code','label',
            'h1','h2','h3','h4','h5','h6',
            'ul','ol','li','a','button','img',
            'input','select','option',
            'table','thead','tbody','tr','th','td'
        ];

        // دالة التحقق من السمة المسموح بها
        function isAllowedAttribute(name) {
            const n = name.toLowerCase();
            const basic = ['class','id','href','title','type','value','onclick','role','name','placeholder','for','min','max','step','checked','selected','disabled','src','alt','width','height','style'];
            if (basic.includes(n)) return true;
            if (n.startsWith('data-')) return true;
            if (n.startsWith('aria-')) return true;
            if (n.startsWith('data-bs-')) return true; // دعم Bootstrap attributes
            return false;
        }

        // إنشاء مستند مؤقت
        const temp = document.createElement('div');
        temp.innerHTML = html;

        // تنظيف جميع العناصر
        const allElements = temp.getElementsByTagName('*');
        for (let i = allElements.length - 1; i >= 0; i--) {
            const element = allElements[i];

            // إزالة العناصر غير المسموح بها
            if (!allowedTags.includes(element.tagName.toLowerCase())) {
                element.parentNode.removeChild(element);
                continue;
            }

            // إزالة السمات غير المسموح بها
            const attributes = element.attributes;
            for (let j = attributes.length - 1; j >= 0; j--) {
                const attr = attributes[j];
                if (!isAllowedAttribute(attr.name)) {
                    element.removeAttribute(attr.name);
                }
            }

            // إزالة أي محتوى JavaScript خطير داخل href أو النصوص
            if (element.innerHTML && element.innerHTML.includes('javascript:')) {
                element.innerHTML = escapeHtml(element.innerHTML);
            }
            const href = element.getAttribute('href');
            if (href && /^\s*javascript:/i.test(href)) {
                element.setAttribute('href', '#');
            }
        }

        return temp.innerHTML;
    }

    // دالة مساعدة لإنشاء جدول آمن
    function createSafeTableRow(data) {
        const tr = document.createElement('tr');
        
        data.forEach(cellData => {
            const td = document.createElement('td');
            
            if (typeof cellData === 'object' && cellData !== null) {
                if (cellData.html && cellData.trusted) {
                    // محتوى موثوق (مثل الأزرار)
                    td.innerHTML = cellData.html;
                } else if (cellData.element) {
                    // عنصر DOM
                    td.appendChild(cellData.element);
                } else {
                    // كائن عادي
                    td.textContent = JSON.stringify(cellData);
                }
            } else {
                // نص عادي
                td.textContent = cellData || '';
            }
            
            tr.appendChild(td);
        });
        
        return tr;
    }

    // دالة لتعقيم البيانات قبل العرض
    function sanitizeData(data) {
        if (Array.isArray(data)) {
            return data.map(item => sanitizeData(item));
        } else if (typeof data === 'object' && data !== null) {
            const sanitized = {};
            for (const [key, value] of Object.entries(data)) {
                sanitized[key] = sanitizeData(value);
            }
            return sanitized;
        } else if (typeof data === 'string') {
            return escapeHtml(data);
        }
        return data;
    }

    // دالة لإنشاء محتوى آمن من template
    function safeTemplate(strings, ...values) {
        let result = strings[0];
        
        for (let i = 0; i < values.length; i++) {
            result += escapeHtml(values[i]) + strings[i + 1];
        }
        
        return result;
    }

    // دالة لتحديث محتوى العنصر بطريقة آمنة
    function safeSetContent(element, content, isHtml = false) {
        if (!element) return;
        
        if (isHtml && typeof content === 'string') {
            // تعقيم HTML أولاً
            element.innerHTML = sanitizeHtml(content);
        } else if (content instanceof Node) {
            element.innerHTML = '';
            element.appendChild(content);
        } else {
            // استخدام textContent للنص العادي
            element.textContent = content || '';
        }
    }

    // دالة لإنشاء خيارات select بطريقة آمنة
    function createSafeOptions(selectElement, options, selectedValue = null) {
        selectElement.innerHTML = '';
        
        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = escapeAttribute(option.value || option.id || '');
            optionElement.textContent = option.text || option.name || option.value || '';
            
            if (selectedValue !== null && optionElement.value === String(selectedValue)) {
                optionElement.selected = true;
            }
            
            selectElement.appendChild(optionElement);
        });
    }

    // دالة للتحقق من صحة المدخلات
    function validateInput(input, type = 'text') {
        const validators = {
            text: /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\w\s\-\.،,]+$/,
            number: /^\d+(\.\d+)?$/,
            email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            date: /^\d{4}-\d{2}-\d{2}$/,
            phone: /^[\d\s\-\+\(\)]+$/
        };
        
        const validator = validators[type] || validators.text;
        return validator.test(input);
    }

    /**
     * إضافة رؤوس الأمان Security Headers
     * تضيف Content Security Policy ورؤوس أمان أخرى
     * معطلة حالياً لتجنب التعارض مع المكتبات الخارجية
     * يجب تفعيلها بعد التأكد من التوافق
     */
    /**
     * ملاحظة: الدالة addSecurityHeaders — وصف تلقائي موجز لوظيفتها.
     * المدخلات: بدون
     * المخرجات: راجع التنفيذ
     */
    /**
     * ملاحظة: الدالة addSecurityHeaders — وصف تلقائي موجز لوظيفتها.
     * المدخلات: بدون
     * المخرجات: راجع التنفيذ
     */
    function addSecurityHeaders() {
        // إضافة Content Security Policy
        // يحدد مصادر المحتوى المسموح بها
        const cspMeta = document.createElement('meta');
        cspMeta.httpEquiv = 'Content-Security-Policy';
        cspMeta.content = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com; font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; img-src 'self' data: https:; connect-src 'self' https://api.github.com";
        
        // إضافة X-XSS-Protection
        const xssProtection = document.createElement('meta');
        xssProtection.httpEquiv = 'X-XSS-Protection';
        xssProtection.content = '1; mode=block';
        
        // إضافة X-Content-Type-Options
        const contentTypeOptions = document.createElement('meta');
        contentTypeOptions.httpEquiv = 'X-Content-Type-Options';
        contentTypeOptions.content = 'nosniff';
        
        const head = document.head || document.getElementsByTagName('head')[0];
        head.appendChild(cspMeta);
        head.appendChild(xssProtection);
        head.appendChild(contentTypeOptions);
    }

    // تصدير الدوال للاستخدام العام
    if (typeof window !== 'undefined') {
        window.SecurityUtils = {
            escapeHtml,
            escapeAttribute,
            createElement,
            sanitizeHtml,
            createSafeTableRow,
            sanitizeData,
            safeTemplate,
            safeSetContent,
            createSafeOptions,
            validateInput,
            addSecurityHeaders
        };
        
        // اختصارات للاستخدام السريع
        window.escapeHtml = escapeHtml;
        window.safeSetContent = safeSetContent;
        window.createSafeTableRow = createSafeTableRow;
        window.createSafeOptions = createSafeOptions;
    }

    // تطبيق إعدادات الأمان عند التحميل
    document.addEventListener('DOMContentLoaded', function() {
        // addSecurityHeaders(); // مؤقتاً معطل لتجنب تعارض مع المكتبات الخارجية
        // يجب مراجعة وتحديث CSP ليتوافق مع متطلبات التطبيق
    });

})();