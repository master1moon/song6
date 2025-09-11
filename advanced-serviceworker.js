/**
 * Service Worker متقدم مع استراتيجيات تخزين ذكية
 * يوفر أداء فائق وعمل بدون إنترنت محسن
 */

const CACHE_VERSION = 'v2.1.0';
const CACHE_NAMES = {
  STATIC: `static-cache-${CACHE_VERSION}`,
  DYNAMIC: `dynamic-cache-${CACHE_VERSION}`,
  API: `api-cache-${CACHE_VERSION}`,
  IMAGES: `images-cache-${CACHE_VERSION}`,
  FONTS: `fonts-cache-${CACHE_VERSION}`
};

// الملفات الأساسية للتخزين المؤقت
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/dark-theme-fixes.css',
  './js/packages.js',
  './js/sales.js',
  './js/expenses.js',
  './js/inventory.js',
  './js/stores.js',
  './js/reports.js',
  './js/settings.js',
  './js/utils.js',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// استراتيجيات التخزين المؤقت
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  NETWORK_ONLY: 'network-only',
  CACHE_ONLY: 'cache-only'
};

// قواعد التخزين المؤقت للموارد المختلفة
const CACHE_RULES = [
  {
    pattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
    strategy: CACHE_STRATEGIES.CACHE_FIRST,
    cacheName: CACHE_NAMES.IMAGES,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 يوم
    maxEntries: 100
  },
  {
    pattern: /\.(?:woff|woff2|ttf|eot)$/,
    strategy: CACHE_STRATEGIES.CACHE_FIRST,
    cacheName: CACHE_NAMES.FONTS,
    maxAge: 365 * 24 * 60 * 60 * 1000, // سنة واحدة
    maxEntries: 30
  },
  {
    pattern: /\.(?:js|css)$/,
    strategy: CACHE_STRATEGIES.STALE_WHILE_REVALIDATE,
    cacheName: CACHE_NAMES.STATIC,
    maxAge: 7 * 24 * 60 * 60 * 1000, // أسبوع
    maxEntries: 50
  },
  {
    pattern: /api\.github\.com/,
    strategy: CACHE_STRATEGIES.NETWORK_FIRST,
    cacheName: CACHE_NAMES.API,
    maxAge: 5 * 60 * 1000, // 5 دقائق
    maxEntries: 20
  },
  {
    pattern: /cdn\.jsdelivr\.net|cdnjs\.cloudflare\.com/,
    strategy: CACHE_STRATEGIES.CACHE_FIRST,
    cacheName: CACHE_NAMES.STATIC,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 يوم
    maxEntries: 50
  }
];

/**
 * تثبيت Service Worker
 */
self.addEventListener('install', event => {
  console.log('🔧 Service Worker: Installing...');
  
  event.waitUntil(
    (async () => {
      try {
        // فتح الكاش الثابت
        const staticCache = await caches.open(CACHE_NAMES.STATIC);
        
        // تخزين الملفات الأساسية
        await staticCache.addAll(STATIC_ASSETS);
        
        console.log('✅ Service Worker: Static assets cached');
        
        // تفعيل فوري للـ Service Worker الجديد
        await self.skipWaiting();
        
      } catch (error) {
        console.error('❌ Service Worker: Installation failed', error);
      }
    })()
  );
});

/**
 * تفعيل Service Worker
 */
self.addEventListener('activate', event => {
  console.log('🚀 Service Worker: Activating...');
  
  event.waitUntil(
    (async () => {
      try {
        // حذف الكاش القديم
        const cacheNames = await caches.keys();
        const validCacheNames = Object.values(CACHE_NAMES);
        
        await Promise.all(
          cacheNames.map(cacheName => {
            if (!validCacheNames.includes(cacheName)) {
              console.log(`🗑️ Service Worker: Deleting old cache: ${cacheName}`);
              return caches.delete(cacheName);
            }
          })
        );
        
        // السيطرة على جميع العملاء
        await self.clients.claim();
        
        console.log('✅ Service Worker: Activated successfully');
        
        // إرسال رسالة للعملاء بالتحديث
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
          client.postMessage({
            type: 'SW_UPDATED',
            version: CACHE_VERSION
          });
        });
        
      } catch (error) {
        console.error('❌ Service Worker: Activation failed', error);
      }
    })()
  );
});

/**
 * اعتراض طلبات الشبكة
 */
self.addEventListener('fetch', event => {
  // تجاهل الطلبات غير HTTP/HTTPS
  if (!event.request.url.startsWith('http')) {
    return;
  }
  
  // تجاهل طلبات POST/PUT/DELETE
  if (event.request.method !== 'GET') {
    return;
  }
  
  event.respondWith(handleRequest(event.request));
});

/**
 * معالجة الطلبات باستخدام استراتيجيات مختلفة
 */
async function handleRequest(request) {
  const url = new URL(request.url);
  
  // البحث عن قاعدة مطابقة
  const rule = CACHE_RULES.find(rule => rule.pattern.test(url.pathname + url.search));
  
  if (rule) {
    return await applyCacheStrategy(request, rule);
  }
  
  // الاستراتيجية الافتراضية للصفحات
  if (url.pathname.endsWith('.html') || url.pathname === '/' || url.pathname === '') {
    return await staleWhileRevalidate(request, CACHE_NAMES.DYNAMIC);
  }
  
  // للموارد الأخرى - محاولة الشبكة أولاً
  return await networkFirst(request, CACHE_NAMES.DYNAMIC);
}

/**
 * تطبيق استراتيجية التخزين المؤقت
 */
async function applyCacheStrategy(request, rule) {
  switch (rule.strategy) {
    case CACHE_STRATEGIES.CACHE_FIRST:
      return await cacheFirst(request, rule.cacheName, rule.maxAge);
      
    case CACHE_STRATEGIES.NETWORK_FIRST:
      return await networkFirst(request, rule.cacheName, rule.maxAge);
      
    case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
      return await staleWhileRevalidate(request, rule.cacheName, rule.maxAge);
      
    case CACHE_STRATEGIES.NETWORK_ONLY:
      return await fetch(request);
      
    case CACHE_STRATEGIES.CACHE_ONLY:
      return await cacheOnly(request, rule.cacheName);
      
    default:
      return await networkFirst(request, rule.cacheName);
  }
}

/**
 * استراتيجية: الكاش أولاً (Cache First)
 * مناسبة للموارد الثابتة مثل الصور والخطوط
 */
async function cacheFirst(request, cacheName, maxAge) {
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      // التحقق من انتهاء الصلاحية
      if (maxAge && isCacheExpired(cachedResponse, maxAge)) {
        console.log('⏰ Cache expired, fetching from network:', request.url);
        return await fetchAndCache(request, cache);
      }
      
      console.log('✅ Serving from cache:', request.url);
      return cachedResponse;
    }
    
    // ليس في الكاش، جلب من الشبكة
    return await fetchAndCache(request, cache);
    
  } catch (error) {
    console.error('❌ Cache First strategy failed:', error);
    return new Response('Service Unavailable', { status: 503 });
  }
}

/**
 * استراتيجية: الشبكة أولاً (Network First)
 * مناسبة للبيانات الديناميكية والـ API
 */
async function networkFirst(request, cacheName, maxAge) {
  try {
    const cache = await caches.open(cacheName);
    
    try {
      // محاولة الشبكة أولاً
      const networkResponse = await fetch(request);
      
      if (networkResponse.ok) {
        // حفظ في الكاش
        const responseClone = networkResponse.clone();
        await cache.put(request, responseClone);
        console.log('🌐 Served from network and cached:', request.url);
        return networkResponse;
      }
    } catch (networkError) {
      console.log('🔌 Network failed, trying cache:', request.url);
    }
    
    // فشل الشبكة، محاولة الكاش
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      console.log('📦 Served from cache (network failed):', request.url);
      return cachedResponse;
    }
    
    // لا يوجد في الكاش أيضاً
    return new Response('Network Error', { status: 503 });
    
  } catch (error) {
    console.error('❌ Network First strategy failed:', error);
    return new Response('Service Unavailable', { status: 503 });
  }
}

/**
 * استراتيجية: قديم أثناء إعادة التحقق (Stale While Revalidate)
 * مناسبة للموارد التي تتغير أحياناً
 */
async function staleWhileRevalidate(request, cacheName, maxAge) {
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    // جلب من الشبكة في الخلفية
    const fetchPromise = fetch(request).then(networkResponse => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
        console.log('🔄 Updated cache in background:', request.url);
      }
      return networkResponse;
    }).catch(error => {
      console.log('🔌 Background fetch failed:', request.url);
    });
    
    // إرجاع الكاش فوراً إذا كان متاحاً
    if (cachedResponse) {
      console.log('⚡ Served from cache (updating in background):', request.url);
      return cachedResponse;
    }
    
    // لا يوجد كاش، انتظار الشبكة
    console.log('🌐 No cache, waiting for network:', request.url);
    return await fetchPromise;
    
  } catch (error) {
    console.error('❌ Stale While Revalidate strategy failed:', error);
    return new Response('Service Unavailable', { status: 503 });
  }
}

/**
 * استراتيجية: الكاش فقط (Cache Only)
 */
async function cacheOnly(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('📦 Served from cache only:', request.url);
      return cachedResponse;
    }
    
    return new Response('Not Found in Cache', { status: 404 });
    
  } catch (error) {
    console.error('❌ Cache Only strategy failed:', error);
    return new Response('Cache Error', { status: 500 });
  }
}

/**
 * جلب من الشبكة وحفظ في الكاش
 */
async function fetchAndCache(request, cache) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const responseClone = networkResponse.clone();
      await cache.put(request, responseClone);
      console.log('🌐 Fetched from network and cached:', request.url);
      return networkResponse;
    }
    
    return networkResponse;
    
  } catch (error) {
    console.error('❌ Fetch and cache failed:', error);
    throw error;
  }
}

/**
 * التحقق من انتهاء صلاحية الكاش
 */
function isCacheExpired(response, maxAge) {
  if (!maxAge) return false;
  
  const dateHeader = response.headers.get('date');
  if (!dateHeader) return false;
  
  const cacheTime = new Date(dateHeader).getTime();
  const now = Date.now();
  
  return (now - cacheTime) > maxAge;
}

/**
 * تنظيف الكاش القديم
 */
async function cleanupCache(cacheName, maxEntries) {
  try {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    
    if (keys.length > maxEntries) {
      const keysToDelete = keys.slice(0, keys.length - maxEntries);
      await Promise.all(keysToDelete.map(key => cache.delete(key)));
      console.log(`🧹 Cleaned up ${keysToDelete.length} old entries from ${cacheName}`);
    }
    
  } catch (error) {
    console.error('❌ Cache cleanup failed:', error);
  }
}

/**
 * معالجة رسائل من التطبيق الرئيسي
 */
self.addEventListener('message', event => {
  const { type, data } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'GET_CACHE_STATS':
      getCacheStats().then(stats => {
        event.ports[0].postMessage({ type: 'CACHE_STATS', data: stats });
      });
      break;
      
    case 'CLEAR_CACHE':
      clearAllCaches().then(() => {
        event.ports[0].postMessage({ type: 'CACHE_CLEARED' });
      });
      break;
      
    case 'PREFETCH_RESOURCES':
      prefetchResources(data.urls);
      break;
      
    default:
      console.log('Unknown message type:', type);
  }
});

/**
 * الحصول على إحصائيات الكاش
 */
async function getCacheStats() {
  try {
    const cacheNames = await caches.keys();
    const stats = {};
    
    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();
      stats[cacheName] = {
        count: keys.length,
        urls: keys.map(req => req.url)
      };
    }
    
    return stats;
    
  } catch (error) {
    console.error('❌ Failed to get cache stats:', error);
    return {};
  }
}

/**
 * مسح جميع الكاش
 */
async function clearAllCaches() {
  try {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
    console.log('🗑️ All caches cleared');
    
  } catch (error) {
    console.error('❌ Failed to clear caches:', error);
  }
}

/**
 * تحميل مسبق للموارد
 */
async function prefetchResources(urls) {
  try {
    const cache = await caches.open(CACHE_NAMES.DYNAMIC);
    
    for (const url of urls) {
      try {
        const response = await fetch(url);
        if (response.ok) {
          await cache.put(url, response);
          console.log('📥 Prefetched:', url);
        }
      } catch (error) {
        console.log('❌ Failed to prefetch:', url);
      }
    }
    
  } catch (error) {
    console.error('❌ Prefetch failed:', error);
  }
}

/**
 * تنظيف دوري للكاش
 */
setInterval(() => {
  Object.entries(CACHE_NAMES).forEach(([name, cacheName]) => {
    const rule = CACHE_RULES.find(r => r.cacheName === cacheName);
    if (rule && rule.maxEntries) {
      cleanupCache(cacheName, rule.maxEntries);
    }
  });
}, 60 * 60 * 1000); // كل ساعة

console.log('🎯 Advanced Service Worker loaded successfully');
console.log('📋 Cache strategies configured:', CACHE_RULES.length);
console.log('🏪 Static assets to cache:', STATIC_ASSETS.length);