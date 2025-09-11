/**
 * مدير Web Workers
 * يدير تشغيل المهام الثقيلة في خيوط منفصلة
 */

class WorkerManager {
  constructor() {
    this.workers = new Map();
    this.taskQueue = [];
    this.activeTasks = new Map();
    this.taskIdCounter = 0;
  }

  /**
   * إنشاء worker جديد
   */
  createWorker(workerName, scriptPath) {
    if (this.workers.has(workerName)) {
      console.warn(`Worker ${workerName} already exists`);
      return this.workers.get(workerName);
    }

    const worker = new Worker(scriptPath);
    
    // إعداد معالج الرسائل
    worker.addEventListener('message', (e) => {
      this.handleWorkerMessage(workerName, e.data);
    });

    // إعداد معالج الأخطاء
    worker.addEventListener('error', (error) => {
      console.error(`Worker ${workerName} error:`, error);
      this.handleWorkerError(workerName, error);
    });

    this.workers.set(workerName, worker);
    console.log(`✅ Worker ${workerName} created successfully`);
    
    return worker;
  }

  /**
   * تشغيل مهمة في worker
   */
  async runTask(workerName, taskType, data, options = {}) {
    const taskId = ++this.taskIdCounter;
    
    return new Promise((resolve, reject) => {
      // التحقق من وجود الـ worker
      if (!this.workers.has(workerName)) {
        reject(new Error(`Worker ${workerName} not found`));
        return;
      }

      // حفظ معلومات المهمة
      this.activeTasks.set(taskId, {
        workerName,
        taskType,
        resolve,
        reject,
        startTime: Date.now(),
        onProgress: options.onProgress,
        onComplete: options.onComplete
      });

      // إرسال المهمة للـ worker
      const worker = this.workers.get(workerName);
      worker.postMessage({
        id: taskId,
        type: taskType,
        data
      });

      console.log(`🚀 Task ${taskId} (${taskType}) sent to worker ${workerName}`);
    });
  }

  /**
   * معالجة رسائل الـ worker
   */
  handleWorkerMessage(workerName, message) {
    const { id, type, result, error, progress, message: progressMessage } = message;

    if (!id || !this.activeTasks.has(id)) {
      console.warn('Received message for unknown task:', message);
      return;
    }

    const task = this.activeTasks.get(id);

    switch (type) {
      case 'SUCCESS':
        const duration = Date.now() - task.startTime;
        console.log(`✅ Task ${id} completed in ${duration}ms`);
        
        if (task.onComplete) {
          task.onComplete(result);
        }
        
        task.resolve(result);
        this.activeTasks.delete(id);
        break;

      case 'ERROR':
        console.error(`❌ Task ${id} failed:`, error);
        task.reject(new Error(error));
        this.activeTasks.delete(id);
        break;

      case 'PROGRESS':
        if (task.onProgress) {
          task.onProgress(progress, progressMessage);
        }
        console.log(`📊 Task ${id} progress: ${progress}% - ${progressMessage}`);
        break;

      default:
        console.warn('Unknown message type:', type);
    }
  }

  /**
   * معالجة أخطاء الـ worker
   */
  handleWorkerError(workerName, error) {
    // إلغاء جميع المهام النشطة لهذا الـ worker
    for (const [taskId, task] of this.activeTasks.entries()) {
      if (task.workerName === workerName) {
        task.reject(new Error(`Worker ${workerName} crashed: ${error.message}`));
        this.activeTasks.delete(taskId);
      }
    }
  }

  /**
   * إنهاء worker
   */
  terminateWorker(workerName) {
    if (this.workers.has(workerName)) {
      const worker = this.workers.get(workerName);
      worker.terminate();
      this.workers.delete(workerName);
      
      console.log(`🛑 Worker ${workerName} terminated`);
    }
  }

  /**
   * إنهاء جميع الـ workers
   */
  terminateAll() {
    for (const [workerName] of this.workers) {
      this.terminateWorker(workerName);
    }
  }

  /**
   * الحصول على إحصائيات الـ workers
   */
  getStats() {
    return {
      activeWorkers: this.workers.size,
      activeTasks: this.activeTasks.size,
      workerNames: Array.from(this.workers.keys()),
      taskTypes: Array.from(this.activeTasks.values()).map(task => task.taskType)
    };
  }
}

// إنشاء مدير عام للـ workers
const workerManager = new WorkerManager();

/**
 * فئة خاصة لإدارة تقارير التطبيق
 */
class ReportWorkerManager {
  constructor() {
    this.workerManager = workerManager;
    this.isInitialized = false;
  }

  /**
   * تهيئة worker التقارير
   */
  initialize() {
    if (this.isInitialized) return;
    
    this.workerManager.createWorker('reports', './js/reportWorker.js');
    this.isInitialized = true;
  }

  /**
   * إنشاء تقرير شامل
   */
  async generateComprehensiveReport(onProgress = null) {
    this.initialize();
    
    const data = {
      sales: window.data.sales || [],
      payments: window.data.payments || [],
      expenses: window.data.expenses || [],
      stores: window.data.stores || [],
      packages: window.data.packages || []
    };

    return await this.workerManager.runTask(
      'reports',
      'CALCULATE_COMPREHENSIVE_REPORT',
      data,
      {
        onProgress: (progress, message) => {
          if (onProgress) onProgress(progress, message);
          this.updateProgressUI(progress, message);
        }
      }
    );
  }

  /**
   * تحليل أنماط المبيعات
   */
  async analyzeSalesPatterns() {
    this.initialize();
    
    const data = {
      sales: window.data.sales || [],
      stores: window.data.stores || [],
      packages: window.data.packages || []
    };

    return await this.workerManager.runTask(
      'reports',
      'ANALYZE_SALES_PATTERNS',
      data
    );
  }

  /**
   * معالجة تصدير كبير
   */
  async processLargeExport(exportData, format = 'excel') {
    this.initialize();
    
    return await this.workerManager.runTask(
      'reports',
      'PROCESS_LARGE_EXPORT',
      { data: exportData, format }
    );
  }

  /**
   * تحديث واجهة التقدم
   */
  updateProgressUI(progress, message) {
    // البحث عن عنصر شريط التقدم
    let progressBar = document.getElementById('reportProgress');
    
    if (!progressBar) {
      // إنشاء شريط التقدم إذا لم يكن موجوداً
      progressBar = this.createProgressBar();
    }

    // تحديث الشريط
    const progressFill = progressBar.querySelector('.progress-bar');
    const progressText = progressBar.querySelector('.progress-text');
    
    progressFill.style.width = `${progress}%`;
    progressFill.setAttribute('aria-valuenow', progress);
    progressText.textContent = `${progress}% - ${message}`;

    // إخفاء الشريط عند الانتهاء
    if (progress >= 100) {
      setTimeout(() => {
        progressBar.style.display = 'none';
      }, 2000);
    } else {
      progressBar.style.display = 'block';
    }
  }

  /**
   * إنشاء شريط التقدم
   */
  createProgressBar() {
    const progressContainer = document.createElement('div');
    progressContainer.id = 'reportProgress';
    progressContainer.className = 'progress-container';
    progressContainer.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      width: 400px;
      background: white;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      z-index: 9999;
      display: none;
    `;
    
    progressContainer.innerHTML = `
      <div class="progress-header" style="margin-bottom: 10px;">
        <h6 style="margin: 0; color: #333;">جاري إنشاء التقرير...</h6>
      </div>
      <div class="progress" style="height: 20px; background-color: #e9ecef; border-radius: 10px;">
        <div class="progress-bar" role="progressbar" style="width: 0%; background-color: #007bff; border-radius: 10px; transition: width 0.3s ease;" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
      </div>
      <div class="progress-text" style="margin-top: 10px; font-size: 14px; color: #666; text-align: center;">0% - بدء العملية...</div>
    `;
    
    document.body.appendChild(progressContainer);
    return progressContainer;
  }
}

// إنشاء مدير تقارير عام
const reportWorker = new ReportWorkerManager();

/**
 * أمثلة على الاستخدام في التطبيق
 */

// تحديث دالة إنشاء التقرير الشامل
async function generateAdvancedReport() {
  try {
    // إظهار رسالة التحميل
    if (typeof showNotification === 'function') {
      showNotification('جاري إنشاء التقرير المتقدم...', 'info');
    }

    console.log('🚀 Starting advanced report generation...');
    
    const report = await reportWorker.generateComprehensiveReport((progress, message) => {
      console.log(`📊 ${progress}% - ${message}`);
    });

    console.log('✅ Advanced report completed:', report);

    // عرض النتائج
    displayAdvancedReport(report);
    
    if (typeof showNotification === 'function') {
      showNotification('تم إنشاء التقرير المتقدم بنجاح!', 'success');
    }

  } catch (error) {
    console.error('❌ Error generating advanced report:', error);
    
    if (typeof showNotification === 'function') {
      showNotification('فشل في إنشاء التقرير: ' + error.message, 'error');
    }
  }
}

// دالة عرض التقرير المتقدم
function displayAdvancedReport(report) {
  const reportContainer = document.getElementById('advancedReportContainer') || createAdvancedReportContainer();
  
  reportContainer.innerHTML = `
    <div class="advanced-report">
      <div class="report-header">
        <h3>📊 التقرير الشامل المتقدم</h3>
        <p class="text-muted">تم الإنشاء: ${new Date(report.generatedAt).toLocaleString('ar')}</p>
      </div>
      
      <div class="row">
        <!-- تحليل المبيعات -->
        <div class="col-md-4">
          <div class="card">
            <div class="card-header">
              <h5>📈 تحليل المبيعات</h5>
            </div>
            <div class="card-body">
              <p><strong>إجمالي المبيعات:</strong> ${formatNumber(report.salesAnalysis.totalSales)}</p>
              <p><strong>متوسط قيمة البيع:</strong> ${formatNumber(report.salesAnalysis.averageSaleValue)}</p>
              <p><strong>أفضل الباقات:</strong></p>
              <ul>
                ${report.salesAnalysis.topSellingPackages.slice(0, 3).map(pkg => 
                  `<li>${pkg.name}: ${formatNumber(pkg.total)}</li>`
                ).join('')}
              </ul>
            </div>
          </div>
        </div>
        
        <!-- تحليل المدفوعات -->
        <div class="col-md-4">
          <div class="card">
            <div class="card-header">
              <h5>💰 تحليل المدفوعات</h5>
            </div>
            <div class="card-body">
              <p><strong>إجمالي المدفوعات:</strong> ${formatNumber(report.paymentsAnalysis.totalPayments)}</p>
              <p><strong>متوسط الدفعة:</strong> ${formatNumber(report.paymentsAnalysis.averagePayment)}</p>
            </div>
          </div>
        </div>
        
        <!-- تحليل المصروفات -->
        <div class="col-md-4">
          <div class="card">
            <div class="card-header">
              <h5>💸 تحليل المصروفات</h5>
            </div>
            <div class="card-body">
              <p><strong>إجمالي المصروفات:</strong> ${formatNumber(report.expensesAnalysis.totalExpenses)}</p>
              <p><strong>متوسط المصروف:</strong> ${formatNumber(report.expensesAnalysis.averageExpense)}</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- الإحصائيات المتقدمة -->
      <div class="card mt-4">
        <div class="card-header">
          <h5>🎯 مؤشرات الأداء الرئيسية</h5>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-3">
              <div class="kpi-item">
                <div class="kpi-value ${report.advancedStats.netProfit >= 0 ? 'text-success' : 'text-danger'}">
                  ${formatNumber(report.advancedStats.netProfit)}
                </div>
                <div class="kpi-label">صافي الربح</div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="kpi-item">
                <div class="kpi-value">${report.advancedStats.profitMargin}%</div>
                <div class="kpi-label">هامش الربح</div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="kpi-item">
                <div class="kpi-value">${report.advancedStats.collectionRate}%</div>
                <div class="kpi-label">معدل التحصيل</div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="kpi-item">
                <div class="kpi-value">${report.advancedStats.expenseRatio}%</div>
                <div class="kpi-label">نسبة المصروفات</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  reportContainer.style.display = 'block';
}

function createAdvancedReportContainer() {
  const container = document.createElement('div');
  container.id = 'advancedReportContainer';
  container.className = 'advanced-report-container';
  container.style.display = 'none';
  
  // البحث عن مكان مناسب لإدراج التقرير
  const reportsSection = document.querySelector('#reports .section-content') || document.body;
  reportsSection.appendChild(container);
  
  return container;
}

// تحليل أنماط المبيعات
async function analyzeSalesPatternsAdvanced() {
  try {
    console.log('🔍 Analyzing sales patterns...');
    
    const patterns = await reportWorker.analyzeSalesPatterns();
    console.log('✅ Sales patterns analysis completed:', patterns);
    
    // عرض النتائج
    displaySalesPatternsReport(patterns);
    
    if (typeof showNotification === 'function') {
      showNotification('تم تحليل أنماط المبيعات بنجاح!', 'success');
    }

  } catch (error) {
    console.error('❌ Error analyzing sales patterns:', error);
    
    if (typeof showNotification === 'function') {
      showNotification('فشل في تحليل أنماط المبيعات: ' + error.message, 'error');
    }
  }
}

function displaySalesPatternsReport(patterns) {
  // عرض تحليل أنماط المبيعات
  console.log('📊 Sales Patterns Report:', patterns);
  
  // يمكن إضافة واجهة لعرض النتائج هنا
  if (patterns.insights && patterns.insights.length > 0) {
    const insights = patterns.insights.join('\n• ');
    alert(`🧠 رؤى تحليل المبيعات:\n\n• ${insights}`);
  }
}

// تصدير للاستخدام العام
if (typeof window !== 'undefined') {
  window.workerManager = workerManager;
  window.reportWorker = reportWorker;
  window.generateAdvancedReport = generateAdvancedReport;
  window.analyzeSalesPatternsAdvanced = analyzeSalesPatternsAdvanced;
}

// تنظيف الـ workers عند إغلاق الصفحة
window.addEventListener('beforeunload', () => {
  workerManager.terminateAll();
});