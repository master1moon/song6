/**
 * ملف backup.js - نظام النسخ الاحتياطي المحلي
 * يستخدم File System Access API لحفظ نسخ احتياطية محلية
 * يحفظ مرجع الملف في IndexedDB للوصول السريع
 * يتكامل مع دالة saveData للحفظ التلقائي
 * 
 * المشاكل المحتملة:
 * - يعمل فقط في المتصفحات الحديثة (Chrome/Edge)
 * - معالجة الأخطاء بسيطة جداً (catch فارغ)
 * - لا يوجد آلية لاستعادة النسخ الاحتياطية
 * - لا يحفظ نسخ متعددة (يستبدل الملف كل مرة)
 * - لا يوجد تشفير للبيانات المحفوظة
 */

// Local file backup using File System Access API, with handle persisted in IndexedDB
(function(){
  const DB_NAME = 'networkCardsDB';
  const DB_VERSION = 2; // allow upgrade independent of storage.js
  const STORE = 'backup';

  let dbPromise = null;
  /**
   * ملاحظة: الدالة openDB — وصف تلقائي موجز لوظيفتها.
   * المدخلات: بدون
   * المخرجات: راجع التنفيذ
   */
  /**
   * ملاحظة: الدالة openDB — وصف تلقائي موجز لوظيفتها.
   * المدخلات: بدون
   * المخرجات: راجع التنفيذ
   */
  function openDB(){
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      /**
       * ملاحظة: الدالة req.onupgradeneeded — وصف تلقائي موجز لوظيفتها.
       * المدخلات: بدون
       * المخرجات: راجع التنفيذ
       */
      req.onupgradeneeded = function(){
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    return dbPromise;
  }
  /**
   * ملاحظة: الدالة idbGet — وصف تلقائي موجز لوظيفتها.
   * المدخلات: key
   * المخرجات: راجع التنفيذ
   */
  async function idbGet(key){
    try { const db = await openDB(); return await new Promise((res, rej)=>{ const tx=db.transaction(STORE,'readonly'); const os=tx.objectStore(STORE); const r=os.get(key); r.onsuccess=()=>res(r.result); r.onerror=()=>rej(r.error); }); } catch { return undefined; }
  }
  /**
   * ملاحظة: الدالة idbSet — وصف تلقائي موجز لوظيفتها.
   * المدخلات: key, val
   * المخرجات: راجع التنفيذ
   */
  async function idbSet(key, val){
    try { const db = await openDB(); return await new Promise((res, rej)=>{ const tx=db.transaction(STORE,'readwrite'); const os=tx.objectStore(STORE); const r=os.put(val, key); r.onsuccess=()=>res(true); r.onerror=()=>rej(r.error); }); } catch { return false; }
  }

  /**
   * ملاحظة: الدالة hasPermission — وصف تلقائي موجز لوظيفتها.
   * المدخلات: handle, mode='readwrite'
   * المخرجات: راجع التنفيذ
   */
  async function hasPermission(handle, mode='readwrite'){
    if (!handle) return false;
    if (await handle.queryPermission({ mode }) === 'granted') return true;
    return (await handle.requestPermission({ mode })) === 'granted';
  }

  async function getBackupHandle(){ return await idbGet('fileHandle'); }
  async function setBackupHandle(h){ return await idbSet('fileHandle', h); }

  /**
   * ملاحظة: الدالة requestLocalBackupFile — وصف تلقائي موجز لوظيفتها.
   * المدخلات: بدون
   * المخرجات: راجع التنفيذ
   */
  async function requestLocalBackupFile(){
    if (!window.showSaveFilePicker) {
      showNotification('المتصفح لا يدعم الحفظ المباشر للملفات. استخدم مزامنة GitHub أو متصفح كروم/إيدج.', 'error');
      return null;
    }
    try {
      const handle = await showSaveFilePicker({
        suggestedName: 'network-cards.json',
        types: [{ description: 'JSON', accept: { 'application/json': ['.json'] } }]
      });
      const ok = await hasPermission(handle, 'readwrite');
      if (!ok) { showNotification('تم رفض الإذن للكتابة على الملف', 'error'); return null; }
      await setBackupHandle(handle);
      showNotification('تم إعداد النسخ الاحتياطي المحلي بنجاح', 'success');
      updateBackupStatus(true);
      return handle;
    } catch (e) {
      showNotification('تم إلغاء اختيار الملف', 'error');
      return null;
    }
  }

  /**
   * ملاحظة: الدالة writeLocalBackup — وصف تلقائي موجز لوظيفتها.
   * المدخلات: dataObj
   * المخرجات: راجع التنفيذ
   */
  async function writeLocalBackup(dataObj){
    try {
      let handle = await getBackupHandle();
      if (!handle) return false;
      const ok = await hasPermission(handle, 'readwrite');
      if (!ok) return false;
      const writable = await handle.createWritable();
      await writable.write(new Blob([JSON.stringify(dataObj || {}, null, 2)], { type: 'application/json' }));
      await writable.close();
      return true;
    } catch (_) { return false; }
  }

  /**
   * ملاحظة: الدالة updateBackupStatus — وصف تلقائي موجز لوظيفتها.
   * المدخلات: active
   * المخرجات: راجع التنفيذ
   */
  /**
   * ملاحظة: الدالة updateBackupStatus — وصف تلقائي موجز لوظيفتها.
   * المدخلات: active
   * المخرجات: راجع التنفيذ
   */
  function updateBackupStatus(active){
    const el = document.getElementById('localBackupStatus');
    if (!el) return;
    el.textContent = active ? 'مفعل (يحفظ تلقائياً)' : 'غير مفعل';
    el.className = active ? 'text-success small' : 'text-muted small';
  }

  // Wire UI
  document.addEventListener('DOMContentLoaded', async function(){
    const btn = document.getElementById('localBackupSetupBtn');
    if (btn) btn.addEventListener('click', requestLocalBackupFile);
    const handle = await getBackupHandle();
    let active = false;
    if (handle) { active = await hasPermission(handle, 'readwrite'); }
    updateBackupStatus(active);
  });

  // Hook into saveData to mirror backups
  const prevSaveData = window.saveData;
  /**
   * ملاحظة: الدالة window.saveData — وصف تلقائي موجز لوظيفتها.
   * المدخلات: بدون
   * المخرجات: راجع التنفيذ
   */
  window.saveData = function(){
    const res = prevSaveData ? prevSaveData() : undefined;
    try { if (typeof window.data !== 'undefined') { writeLocalBackup(window.data); } } catch(_){}
    return res;
  };

  // Expose minimal API if needed globally
  window.__localBackup = { requestLocalBackupFile, writeLocalBackup };
})();