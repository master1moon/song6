/**
 * Web Worker للتقارير الثقيلة
 * يعمل في خيط منفصل لمنع تجميد الواجهة
 */

// هذا الملف يعمل في Web Worker (خيط منفصل)
self.addEventListener('message', function(e) {
  const { type, data, id } = e.data;
  
  try {
    let result;
    
    switch (type) {
      case 'CALCULATE_COMPREHENSIVE_REPORT':
        result = calculateComprehensiveReport(data);
        break;
        
      case 'GENERATE_PROFIT_ANALYSIS':
        result = generateProfitAnalysis(data);
        break;
        
      case 'PROCESS_LARGE_EXPORT':
        result = processLargeExport(data);
        break;
        
      case 'ANALYZE_SALES_PATTERNS':
        result = analyzeSalesPatterns(data);
        break;
        
      default:
        throw new Error(`Unknown task type: ${type}`);
    }
    
    // إرسال النتيجة مع معرف المهمة
    self.postMessage({
      id,
      type: 'SUCCESS',
      result
    });
    
  } catch (error) {
    // إرسال الخطأ
    self.postMessage({
      id,
      type: 'ERROR',
      error: error.message
    });
  }
});

/**
 * حساب تقرير شامل (عملية ثقيلة)
 */
function calculateComprehensiveReport(data) {
  const { sales, payments, expenses, stores, packages } = data;
  
  // إرسال تحديث التقدم
  self.postMessage({ type: 'PROGRESS', progress: 0, message: 'بدء حساب التقرير...' });
  
  // 1. تحليل المبيعات
  const salesAnalysis = analyzeSales(sales, packages);
  self.postMessage({ type: 'PROGRESS', progress: 25, message: 'تحليل المبيعات...' });
  
  // 2. تحليل المدفوعات
  const paymentsAnalysis = analyzePayments(payments, stores);
  self.postMessage({ type: 'PROGRESS', progress: 50, message: 'تحليل المدفوعات...' });
  
  // 3. تحليل المصروفات
  const expensesAnalysis = analyzeExpenses(expenses);
  self.postMessage({ type: 'PROGRESS', progress: 75, message: 'تحليل المصروفات...' });
  
  // 4. حساب الإحصائيات المتقدمة
  const advancedStats = calculateAdvancedStatistics(salesAnalysis, paymentsAnalysis, expensesAnalysis);
  self.postMessage({ type: 'PROGRESS', progress: 100, message: 'اكتمل!' });
  
  return {
    salesAnalysis,
    paymentsAnalysis,
    expensesAnalysis,
    advancedStats,
    generatedAt: new Date().toISOString()
  };
}

function analyzeSales(sales, packages) {
  const analysis = {
    totalSales: 0,
    salesByPackage: {},
    salesByMonth: {},
    topSellingPackages: [],
    averageSaleValue: 0
  };
  
  // تحليل مفصل للمبيعات
  sales.forEach(sale => {
    analysis.totalSales += sale.total || 0;
    
    // حسب الباقة
    const packageName = packages.find(p => p.id === sale.packageId)?.name || 'غير محدد';
    analysis.salesByPackage[packageName] = (analysis.salesByPackage[packageName] || 0) + (sale.total || 0);
    
    // حسب الشهر
    const month = new Date(sale.date).toISOString().substring(0, 7);
    analysis.salesByMonth[month] = (analysis.salesByMonth[month] || 0) + (sale.total || 0);
  });
  
  // أعلى الباقات مبيعاً
  analysis.topSellingPackages = Object.entries(analysis.salesByPackage)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, total]) => ({ name, total }));
  
  analysis.averageSaleValue = analysis.totalSales / sales.length;
  
  return analysis;
}

function analyzePayments(payments, stores) {
  const analysis = {
    totalPayments: 0,
    paymentsByStore: {},
    paymentsByMonth: {},
    averagePayment: 0,
    paymentFrequency: {}
  };
  
  payments.forEach(payment => {
    analysis.totalPayments += payment.amount || 0;
    
    // حسب المحل
    const storeName = stores.find(s => s.id === payment.storeId)?.name || 'غير محدد';
    analysis.paymentsByStore[storeName] = (analysis.paymentsByStore[storeName] || 0) + (payment.amount || 0);
    
    // حسب الشهر
    const month = new Date(payment.date).toISOString().substring(0, 7);
    analysis.paymentsByMonth[month] = (analysis.paymentsByMonth[month] || 0) + (payment.amount || 0);
  });
  
  analysis.averagePayment = analysis.totalPayments / payments.length;
  
  return analysis;
}

function analyzeExpenses(expenses) {
  const analysis = {
    totalExpenses: 0,
    expensesByType: {},
    expensesByMonth: {},
    averageExpense: 0,
    expensesTrend: []
  };
  
  expenses.forEach(expense => {
    analysis.totalExpenses += expense.amount || 0;
    
    // حسب النوع
    analysis.expensesByType[expense.type] = (analysis.expensesByType[expense.type] || 0) + (expense.amount || 0);
    
    // حسب الشهر
    const month = new Date(expense.date).toISOString().substring(0, 7);
    analysis.expensesByMonth[month] = (analysis.expensesByMonth[month] || 0) + (expense.amount || 0);
  });
  
  analysis.averageExpense = analysis.totalExpenses / expenses.length;
  
  return analysis;
}

function calculateAdvancedStatistics(salesAnalysis, paymentsAnalysis, expensesAnalysis) {
  return {
    netProfit: paymentsAnalysis.totalPayments - expensesAnalysis.totalExpenses,
    profitMargin: ((paymentsAnalysis.totalPayments - expensesAnalysis.totalExpenses) / salesAnalysis.totalSales * 100).toFixed(2),
    collectionRate: (paymentsAnalysis.totalPayments / salesAnalysis.totalSales * 100).toFixed(2),
    expenseRatio: (expensesAnalysis.totalExpenses / paymentsAnalysis.totalPayments * 100).toFixed(2),
    
    // اتجاهات النمو
    growthTrends: calculateGrowthTrends(salesAnalysis.salesByMonth, paymentsAnalysis.paymentsByMonth),
    
    // تحليل الموسمية
    seasonality: analyzeSeasonality(salesAnalysis.salesByMonth),
    
    // مؤشرات الأداء الرئيسية
    kpis: {
      averageDailyRevenue: paymentsAnalysis.totalPayments / 365,
      averageDailySales: salesAnalysis.totalSales / 365,
      averageDailyExpenses: expensesAnalysis.totalExpenses / 365
    }
  };
}

function calculateGrowthTrends(salesByMonth, paymentsByMonth) {
  const months = Object.keys(salesByMonth).sort();
  const trends = [];
  
  for (let i = 1; i < months.length; i++) {
    const currentMonth = months[i];
    const previousMonth = months[i - 1];
    
    const salesGrowth = ((salesByMonth[currentMonth] - salesByMonth[previousMonth]) / salesByMonth[previousMonth] * 100).toFixed(2);
    const paymentsGrowth = ((paymentsByMonth[currentMonth] - paymentsByMonth[previousMonth]) / paymentsByMonth[previousMonth] * 100).toFixed(2);
    
    trends.push({
      month: currentMonth,
      salesGrowth: parseFloat(salesGrowth),
      paymentsGrowth: parseFloat(paymentsGrowth)
    });
  }
  
  return trends;
}

function analyzeSeasonality(salesByMonth) {
  const monthlyData = {};
  
  Object.entries(salesByMonth).forEach(([monthYear, amount]) => {
    const month = new Date(monthYear + '-01').getMonth() + 1;
    monthlyData[month] = (monthlyData[month] || []).concat(amount);
  });
  
  const seasonality = {};
  Object.entries(monthlyData).forEach(([month, amounts]) => {
    seasonality[month] = {
      average: amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length,
      count: amounts.length,
      total: amounts.reduce((sum, amt) => sum + amt, 0)
    };
  });
  
  return seasonality;
}

/**
 * تحليل أنماط المبيعات المتقدم
 */
function analyzeSalesPatterns(data) {
  const { sales, stores, packages } = data;
  
  // تحليل أنماط الشراء للعملاء
  const customerPatterns = analyzeCustomerPatterns(sales, stores);
  
  // تحليل أداء الباقات
  const packagePerformance = analyzePackagePerformance(sales, packages);
  
  // تحليل التوقيت
  const timingAnalysis = analyzeTimingPatterns(sales);
  
  return {
    customerPatterns,
    packagePerformance,
    timingAnalysis,
    insights: generateInsights(customerPatterns, packagePerformance, timingAnalysis)
  };
}

function analyzeCustomerPatterns(sales, stores) {
  const patterns = {};
  
  sales.forEach(sale => {
    const storeId = sale.storeId;
    if (!patterns[storeId]) {
      patterns[storeId] = {
        totalPurchases: 0,
        totalAmount: 0,
        purchaseFrequency: 0,
        averageOrderValue: 0,
        lastPurchase: null,
        firstPurchase: null
      };
    }
    
    patterns[storeId].totalPurchases++;
    patterns[storeId].totalAmount += sale.total || 0;
    
    const saleDate = new Date(sale.date);
    if (!patterns[storeId].firstPurchase || saleDate < new Date(patterns[storeId].firstPurchase)) {
      patterns[storeId].firstPurchase = sale.date;
    }
    if (!patterns[storeId].lastPurchase || saleDate > new Date(patterns[storeId].lastPurchase)) {
      patterns[storeId].lastPurchase = sale.date;
    }
  });
  
  // حساب المتوسطات
  Object.values(patterns).forEach(pattern => {
    pattern.averageOrderValue = pattern.totalAmount / pattern.totalPurchases;
    
    if (pattern.firstPurchase && pattern.lastPurchase) {
      const daysDiff = (new Date(pattern.lastPurchase) - new Date(pattern.firstPurchase)) / (1000 * 60 * 60 * 24);
      pattern.purchaseFrequency = pattern.totalPurchases / (daysDiff || 1);
    }
  });
  
  return patterns;
}

function analyzePackagePerformance(sales, packages) {
  const performance = {};
  
  packages.forEach(pkg => {
    performance[pkg.id] = {
      name: pkg.name,
      totalSold: 0,
      totalRevenue: 0,
      averagePrice: 0,
      salesCount: 0
    };
  });
  
  sales.forEach(sale => {
    if (performance[sale.packageId]) {
      performance[sale.packageId].totalSold += sale.quantity || 0;
      performance[sale.packageId].totalRevenue += sale.total || 0;
      performance[sale.packageId].salesCount++;
    }
  });
  
  Object.values(performance).forEach(perf => {
    if (perf.salesCount > 0) {
      perf.averagePrice = perf.totalRevenue / perf.totalSold;
    }
  });
  
  return performance;
}

function analyzeTimingPatterns(sales) {
  const patterns = {
    hourly: {},
    daily: {},
    monthly: {},
    seasonal: {}
  };
  
  sales.forEach(sale => {
    const date = new Date(sale.date);
    const hour = date.getHours();
    const day = date.getDay(); // 0 = Sunday
    const month = date.getMonth() + 1;
    const season = getSeason(month);
    
    patterns.hourly[hour] = (patterns.hourly[hour] || 0) + (sale.total || 0);
    patterns.daily[day] = (patterns.daily[day] || 0) + (sale.total || 0);
    patterns.monthly[month] = (patterns.monthly[month] || 0) + (sale.total || 0);
    patterns.seasonal[season] = (patterns.seasonal[season] || 0) + (sale.total || 0);
  });
  
  return patterns;
}

function getSeason(month) {
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'autumn';
  return 'winter';
}

function generateInsights(customerPatterns, packagePerformance, timingAnalysis) {
  const insights = [];
  
  // أفضل العملاء
  const topCustomers = Object.entries(customerPatterns)
    .sort((a, b) => b[1].totalAmount - a[1].totalAmount)
    .slice(0, 5);
  
  if (topCustomers.length > 0) {
    insights.push(`أفضل 5 عملاء يشكلون ${((topCustomers.reduce((sum, [_, data]) => sum + data.totalAmount, 0) / Object.values(customerPatterns).reduce((sum, data) => sum + data.totalAmount, 0)) * 100).toFixed(1)}% من إجمالي المبيعات`);
  }
  
  // أفضل الباقات
  const topPackages = Object.values(packagePerformance)
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, 3);
  
  if (topPackages.length > 0) {
    insights.push(`أفضل 3 باقات: ${topPackages.map(p => p.name).join('، ')}`);
  }
  
  // أفضل أوقات البيع
  const bestHour = Object.entries(timingAnalysis.hourly)
    .sort((a, b) => b[1] - a[1])[0];
  
  if (bestHour) {
    insights.push(`أفضل ساعة للمبيعات: ${bestHour[0]}:00`);
  }
  
  return insights;
}