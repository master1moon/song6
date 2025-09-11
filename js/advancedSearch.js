/**
 * نظام البحث المتقدم والمحسن
 * يستخدم خوارزميات متقدمة للبحث السريع والدقيق
 */

/**
 * فهرس البحث المتقدم
 */
class SearchIndex {
  constructor() {
    this.indices = new Map();
    this.invertedIndex = new Map();
    this.fuzzyIndex = new Map();
    this.lastUpdated = null;
  }

  /**
   * بناء فهرس البحث لنوع بيانات معين
   */
  buildIndex(dataType, items, searchFields) {
    console.log(`🏗️ Building search index for ${dataType}...`);
    const startTime = performance.now();
    
    const index = {
      items: items,
      searchFields: searchFields,
      wordIndex: new Map(),
      prefixIndex: new Map(),
      fuzzyIndex: new Map(),
      metadata: {
        itemCount: items.length,
        fieldCount: searchFields.length,
        createdAt: new Date().toISOString()
      }
    };

    // بناء فهرس الكلمات والبادئات
    items.forEach((item, itemIndex) => {
      searchFields.forEach(field => {
        const value = this.getFieldValue(item, field);
        if (!value) return;

        const words = this.tokenize(value);
        
        words.forEach(word => {
          // فهرس الكلمات الكاملة
          if (!index.wordIndex.has(word)) {
            index.wordIndex.set(word, new Set());
          }
          index.wordIndex.get(word).add(itemIndex);

          // فهرس البادئات (للبحث أثناء الكتابة)
          for (let i = 1; i <= word.length; i++) {
            const prefix = word.substring(0, i);
            if (!index.prefixIndex.has(prefix)) {
              index.prefixIndex.set(prefix, new Set());
            }
            index.prefixIndex.get(prefix).add(itemIndex);
          }

          // فهرس البحث الضبابي (Fuzzy Search)
          const fuzzyKey = this.generateFuzzyKey(word);
          if (!index.fuzzyIndex.has(fuzzyKey)) {
            index.fuzzyIndex.set(fuzzyKey, new Set());
          }
          index.fuzzyIndex.get(fuzzyKey).add(itemIndex);
        });
      });
    });

    this.indices.set(dataType, index);
    
    const endTime = performance.now();
    console.log(`✅ Search index for ${dataType} built in ${endTime - startTime}ms`);
    console.log(`📊 Index stats: ${index.wordIndex.size} words, ${index.prefixIndex.size} prefixes`);
    
    this.lastUpdated = new Date();
    return index;
  }

  /**
   * الحصول على قيمة حقل من عنصر
   */
  getFieldValue(item, field) {
    if (typeof field === 'string') {
      return item[field]?.toString() || '';
    } else if (typeof field === 'function') {
      return field(item)?.toString() || '';
    }
    return '';
  }

  /**
   * تقسيم النص إلى كلمات (tokenization)
   */
  tokenize(text) {
    if (!text) return [];
    
    return text
      .toLowerCase()
      .replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\w\s]/g, ' ') // الاحتفاظ بالعربية والإنجليزية فقط
      .split(/\s+/)
      .filter(word => word.length > 0);
  }

  /**
   * إنشاء مفتاح البحث الضبابي
   */
  generateFuzzyKey(word) {
    // إزالة التشكيل والحروف المتشابهة
    return word
      .replace(/[ًٌٍَُِّْ]/g, '') // إزالة التشكيل
      .replace(/[أإآ]/g, 'ا') // توحيد الألف
      .replace(/[ىي]/g, 'ي') // توحيد الياء
      .replace(/[هة]/g, 'ه') // توحيد الهاء
      .replace(/[طظ]/g, 'ط') // توحيد الطاء والظاء
      .replace(/[صض]/g, 'ص') // توحيد الصاد والضاد
      .replace(/[ذز]/g, 'ز') // توحيد الذال والزاي
      .replace(/[ثت]/g, 'ت'); // توحيد الثاء والتاء
  }

  /**
   * البحث المتقدم
   */
  search(dataType, query, options = {}) {
    const {
      fuzzy = true,
      prefix = true,
      limit = 50,
      sortBy = 'relevance',
      filters = {}
    } = options;

    const index = this.indices.get(dataType);
    if (!index) {
      console.warn(`No search index found for ${dataType}`);
      return [];
    }

    const startTime = performance.now();
    
    // تقسيم الاستعلام
    const queryWords = this.tokenize(query);
    if (queryWords.length === 0) return [];

    // البحث في الفهرس
    const results = new Map(); // itemIndex -> score
    
    queryWords.forEach(word => {
      // البحث الدقيق
      if (index.wordIndex.has(word)) {
        index.wordIndex.get(word).forEach(itemIndex => {
          results.set(itemIndex, (results.get(itemIndex) || 0) + 10);
        });
      }

      // البحث بالبادئات
      if (prefix && index.prefixIndex.has(word)) {
        index.prefixIndex.get(word).forEach(itemIndex => {
          results.set(itemIndex, (results.get(itemIndex) || 0) + 5);
        });
      }

      // البحث الضبابي
      if (fuzzy) {
        const fuzzyKey = this.generateFuzzyKey(word);
        if (index.fuzzyIndex.has(fuzzyKey)) {
          index.fuzzyIndex.get(fuzzyKey).forEach(itemIndex => {
            results.set(itemIndex, (results.get(itemIndex) || 0) + 2);
          });
        }
      }
    });

    // تحويل النتائج إلى مصفوفة مع العناصر
    let searchResults = Array.from(results.entries())
      .map(([itemIndex, score]) => ({
        item: index.items[itemIndex],
        score: score,
        index: itemIndex
      }));

    // تطبيق المرشحات
    if (Object.keys(filters).length > 0) {
      searchResults = searchResults.filter(result => {
        return Object.entries(filters).every(([field, value]) => {
          const itemValue = this.getFieldValue(result.item, field);
          if (Array.isArray(value)) {
            return value.includes(itemValue);
          }
          return itemValue === value;
        });
      });
    }

    // الترتيب
    if (sortBy === 'relevance') {
      searchResults.sort((a, b) => b.score - a.score);
    } else if (typeof sortBy === 'function') {
      searchResults.sort(sortBy);
    }

    // التحديد
    searchResults = searchResults.slice(0, limit);

    const endTime = performance.now();
    console.log(`🔍 Search completed in ${endTime - startTime}ms, found ${searchResults.length} results`);

    return searchResults.map(result => ({
      ...result.item,
      _searchScore: result.score,
      _searchIndex: result.index
    }));
  }

  /**
   * اقتراحات البحث (Auto-complete)
   */
  getSuggestions(dataType, query, limit = 10) {
    const index = this.indices.get(dataType);
    if (!index || !query) return [];

    const queryWords = this.tokenize(query);
    const lastWord = queryWords[queryWords.length - 1] || '';
    
    const suggestions = new Set();
    
    // البحث في البادئات
    for (const [prefix, itemIndices] of index.prefixIndex.entries()) {
      if (prefix.startsWith(lastWord) && prefix !== lastWord) {
        suggestions.add(prefix);
        if (suggestions.size >= limit) break;
      }
    }

    return Array.from(suggestions).slice(0, limit);
  }

  /**
   * تحديث الفهرس عند تغيير البيانات
   */
  updateIndex(dataType, items, searchFields) {
    console.log(`🔄 Updating search index for ${dataType}...`);
    this.buildIndex(dataType, items, searchFields);
  }

  /**
   * حذف فهرس
   */
  removeIndex(dataType) {
    this.indices.delete(dataType);
    console.log(`🗑️ Search index for ${dataType} removed`);
  }

  /**
   * الحصول على إحصائيات الفهرس
   */
  getIndexStats(dataType) {
    const index = this.indices.get(dataType);
    if (!index) return null;

    return {
      dataType,
      itemCount: index.metadata.itemCount,
      wordCount: index.wordIndex.size,
      prefixCount: index.prefixIndex.size,
      fuzzyKeyCount: index.fuzzyIndex.size,
      createdAt: index.metadata.createdAt,
      memoryUsage: this.estimateMemoryUsage(index)
    };
  }

  /**
   * تقدير استخدام الذاكرة
   */
  estimateMemoryUsage(index) {
    let size = 0;
    
    // تقدير حجم فهرس الكلمات
    for (const [word, indices] of index.wordIndex) {
      size += word.length * 2; // Unicode characters
      size += indices.size * 4; // Integer indices
    }
    
    // تقدير حجم فهرس البادئات
    for (const [prefix, indices] of index.prefixIndex) {
      size += prefix.length * 2;
      size += indices.size * 4;
    }
    
    return `${(size / 1024 / 1024).toFixed(2)} MB`;
  }
}

/**
 * مدير البحث الرئيسي
 */
class SearchManager {
  constructor() {
    this.searchIndex = new SearchIndex();
    this.searchHistory = [];
    this.popularQueries = new Map();
    this.isInitialized = false;
  }

  /**
   * تهيئة فهارس البحث لجميع أنواع البيانات
   */
  initialize(data) {
    console.log('🚀 Initializing search system...');
    
    // فهرس المحلات
    this.searchIndex.buildIndex('stores', data.stores || [], [
      'name',
      'phone',
      'address',
      'notes',
      (store) => this.getPriceTypeName(store.priceType)
    ]);

    // فهرس الباقات
    this.searchIndex.buildIndex('packages', data.packages || [], [
      'name',
      'createdAt'
    ]);

    // فهرس المبيعات
    this.searchIndex.buildIndex('sales', data.sales || [], [
      (sale) => this.getStoreNameById(sale.storeId, data.stores),
      (sale) => this.getPackageNameById(sale.packageId, data.packages),
      'reason',
      'date'
    ]);

    // فهرس المدفوعات
    this.searchIndex.buildIndex('payments', data.payments || [], [
      (payment) => this.getStoreNameById(payment.storeId, data.stores),
      'notes',
      'date'
    ]);

    // فهرس المصروفات
    this.searchIndex.buildIndex('expenses', data.expenses || [], [
      'type',
      'notes',
      'date'
    ]);

    this.isInitialized = true;
    console.log('✅ Search system initialized successfully');
  }

  /**
   * البحث الموحد عبر جميع أنواع البيانات
   */
  globalSearch(query, options = {}) {
    if (!this.isInitialized) {
      console.warn('Search system not initialized');
      return {};
    }

    const {
      types = ['stores', 'packages', 'sales', 'payments', 'expenses'],
      limit = 10
    } = options;

    const results = {};
    
    types.forEach(type => {
      results[type] = this.searchIndex.search(type, query, { limit });
    });

    // حفظ في تاريخ البحث
    this.addToHistory(query, results);
    
    return results;
  }

  /**
   * البحث في نوع بيانات محدد
   */
  search(dataType, query, options = {}) {
    if (!this.isInitialized) {
      console.warn('Search system not initialized');
      return [];
    }

    const results = this.searchIndex.search(dataType, query, options);
    
    // تحديث الاستعلامات الشائعة
    this.updatePopularQueries(query);
    
    return results;
  }

  /**
   * الحصول على اقتراحات البحث
   */
  getSuggestions(dataType, query, limit = 10) {
    if (!this.isInitialized) return [];
    
    return this.searchIndex.getSuggestions(dataType, query, limit);
  }

  /**
   * إضافة إلى تاريخ البحث
   */
  addToHistory(query, results) {
    const totalResults = Object.values(results).reduce((sum, arr) => sum + arr.length, 0);
    
    this.searchHistory.unshift({
      query,
      timestamp: new Date().toISOString(),
      resultsCount: totalResults
    });

    // الاحتفاظ بآخر 100 بحث فقط
    if (this.searchHistory.length > 100) {
      this.searchHistory = this.searchHistory.slice(0, 100);
    }
  }

  /**
   * تحديث الاستعلامات الشائعة
   */
  updatePopularQueries(query) {
    const normalizedQuery = query.toLowerCase().trim();
    if (normalizedQuery.length < 2) return;

    this.popularQueries.set(normalizedQuery, (this.popularQueries.get(normalizedQuery) || 0) + 1);
  }

  /**
   * الحصول على الاستعلامات الشائعة
   */
  getPopularQueries(limit = 10) {
    return Array.from(this.popularQueries.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([query, count]) => ({ query, count }));
  }

  /**
   * تحديث الفهارس عند تغيير البيانات
   */
  updateIndices(data) {
    console.log('🔄 Updating search indices...');
    this.initialize(data);
  }

  // دوال مساعدة
  getPriceTypeName(priceType) {
    const names = {
      'retail': 'تجزئة',
      'wholesale': 'جملة',
      'distributor': 'موزعين'
    };
    return names[priceType] || 'غير معروف';
  }

  getStoreNameById(storeId, stores) {
    const store = stores?.find(s => s.id === storeId);
    return store?.name || 'غير محدد';
  }

  getPackageNameById(packageId, packages) {
    const pkg = packages?.find(p => p.id === packageId);
    return pkg?.name || 'غير محدد';
  }

  /**
   * الحصول على إحصائيات النظام
   */
  getSystemStats() {
    const indices = ['stores', 'packages', 'sales', 'payments', 'expenses'];
    const stats = {};
    
    indices.forEach(type => {
      stats[type] = this.searchIndex.getIndexStats(type);
    });

    return {
      indices: stats,
      searchHistory: this.searchHistory.length,
      popularQueries: this.popularQueries.size,
      isInitialized: this.isInitialized,
      lastUpdated: this.searchIndex.lastUpdated
    };
  }
}

// إنشاء مدير البحث العام
const searchManager = new SearchManager();

/**
 * دوال البحث للاستخدام في التطبيق
 */

// البحث في المحلات مع التحسين
function searchStoresAdvanced(query, options = {}) {
  return searchManager.search('stores', query, {
    fuzzy: true,
    prefix: true,
    limit: options.limit || 50,
    filters: options.filters || {}
  });
}

// البحث في الباقات
function searchPackagesAdvanced(query, options = {}) {
  return searchManager.search('packages', query, {
    fuzzy: true,
    prefix: true,
    limit: options.limit || 50
  });
}

// البحث العام
function globalSearchAdvanced(query, options = {}) {
  return searchManager.globalSearch(query, options);
}

// اقتراحات البحث للمحلات
function getStoreSearchSuggestions(query) {
  return searchManager.getSuggestions('stores', query, 10);
}

/**
 * مثال على الاستخدام في واجهة البحث
 */
function setupAdvancedSearchUI() {
  const searchInput = document.getElementById('storeSearch');
  if (!searchInput) return;

  let searchTimeout;
  
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    
    // إلغاء البحث السابق
    clearTimeout(searchTimeout);
    
    if (query.length === 0) {
      clearSearchResults();
      return;
    }

    // تأخير البحث لتجنب الاستعلامات المتكررة
    searchTimeout = setTimeout(() => {
      performAdvancedSearch(query);
    }, 300);
  });

  // إضافة اقتراحات البحث
  searchInput.addEventListener('focus', () => {
    showSearchSuggestions();
  });
}

function performAdvancedSearch(query) {
  console.log(`🔍 Advanced search: "${query}"`);
  
  const startTime = performance.now();
  
  // البحث في المحلات
  const storeResults = searchStoresAdvanced(query, { limit: 20 });
  
  const endTime = performance.now();
  console.log(`⚡ Search completed in ${endTime - startTime}ms, found ${storeResults.length} stores`);
  
  // عرض النتائج
  displaySearchResults(storeResults, query);
}

function displaySearchResults(results, query) {
  const resultsContainer = document.getElementById('searchResults') || createSearchResultsContainer();
  
  if (results.length === 0) {
    resultsContainer.innerHTML = `
      <div class="no-results">
        <i class="fas fa-search"></i>
        <p>لم يتم العثور على نتائج لـ "${query}"</p>
      </div>
    `;
    return;
  }

  resultsContainer.innerHTML = results.map(store => `
    <div class="search-result-item" onclick="showStoreDetails('${store.id}')">
      <div class="result-main">
        <h6 class="result-title">${highlightSearchTerm(store.name, query)}</h6>
        <p class="result-details">
          ${store.phone ? `📞 ${store.phone}` : ''}
          ${store.address ? `📍 ${store.address}` : ''}
        </p>
      </div>
      <div class="result-score">
        <small class="text-muted">نسبة التطابق: ${store._searchScore || 0}</small>
      </div>
    </div>
  `).join('');
}

function highlightSearchTerm(text, term) {
  if (!term) return text;
  
  const regex = new RegExp(`(${term})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

function createSearchResultsContainer() {
  const container = document.createElement('div');
  container.id = 'searchResults';
  container.className = 'search-results-container';
  
  // البحث عن مكان مناسب لإدراج النتائج
  const searchContainer = document.querySelector('.search-container') || document.body;
  searchContainer.appendChild(container);
  
  return container;
}

function clearSearchResults() {
  const resultsContainer = document.getElementById('searchResults');
  if (resultsContainer) {
    resultsContainer.innerHTML = '';
  }
}

function showSearchSuggestions() {
  const popularQueries = searchManager.getPopularQueries(5);
  
  if (popularQueries.length > 0) {
    console.log('📊 Popular search queries:', popularQueries);
    // يمكن عرض الاقتراحات في واجهة المستخدم
  }
}

// تهيئة النظام عند تحميل البيانات
function initializeSearchSystem() {
  if (typeof window.data !== 'undefined') {
    searchManager.initialize(window.data);
    setupAdvancedSearchUI();
    console.log('🔍 Advanced search system ready!');
  }
}

// تصدير للاستخدام العام
if (typeof window !== 'undefined') {
  window.searchManager = searchManager;
  window.searchStoresAdvanced = searchStoresAdvanced;
  window.globalSearchAdvanced = globalSearchAdvanced;
  window.initializeSearchSystem = initializeSearchSystem;
  
  // تهيئة تلقائية عند تحميل الصفحة
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSearchSystem);
  } else {
    initializeSearchSystem();
  }
}