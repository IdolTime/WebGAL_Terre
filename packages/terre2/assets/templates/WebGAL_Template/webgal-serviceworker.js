// 安装事件
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing');
  event.waitUntil(self.skipWaiting());
});

// 激活事件
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating');
  event.waitUntil(self.clients.claim());
});

// fetch事件
self.addEventListener('fetch', (event) => {
  // console.log('[Service Worker] Fetching:', event.request.url);
  const ignoreResources = ['.mp4', '.flv', '.webm'];

  const url = event.request.url;
  let shouldReturningFromCache = !!(url.match('/assets/') || url.match('/game/'));
  const shouldIgnore = ignoreResources.some((x) => url.endsWith(x));

  if (shouldReturningFromCache) {
    console.log('%cCACHED: ' + url, 'color: #005CAF; padding: 2px;');
  }

  if (!shouldReturningFromCache || shouldIgnore) {
    event.respondWith(fetch(event.request));
  } else {
    event.respondWith(
      caches
        .match(event.request)
        .then((response) => {
          if (response) {
            // console.log('[Service Worker] Returning from cache:', url);
            return response;
          }
          // console.log('[Service Worker] Fetching from network:', url);
          return fetch(event.request).then((networkResponse) => {
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              // 处理 206 Partial Content 响应
              return handlePartialContent(event.request, networkResponse);
            }

            const responseToCache = networkResponse.clone();

            // eslint-disable-next-line max-nested-callbacks
            caches.open('my-cache').then((cache) => {
              cache.put(event.request, responseToCache);
            });

            return networkResponse;
          });
        })
        .catch((error) => {
          console.error('[Service Worker] Fetching failed:', error);
          throw error;
        }),
    );
  }
});

async function handlePartialContent(request, partialResponse) {
  // 如果是部分响应且请求带有 Range 头，则创建新的请求，将完整响应返回给客户端
  if (request.headers.has('range')) {
    // 请求完整资源
    const fullResponse = await fetch(request.url);

    // 检查完整响应是否有效
    if (!fullResponse || fullResponse.status !== 200) {
      return partialResponse;
    }

    // 将完整响应存入缓存
    const responseToCache = fullResponse.clone();
    caches.open('my-cache').then((cache) => {
      cache.put(request, responseToCache);
    });

    return fullResponse;
  }

  return partialResponse;
}
