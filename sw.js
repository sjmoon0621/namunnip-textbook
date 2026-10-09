/* 나뭇잎 디지털 교과서 — 서비스 워커 (오프라인 사용)
   설치할 때 sw-files.js의 파일 목록 전체를 한 번에 받아 두고, 이후에는 저장본을 먼저 쓴다.
   sw-files.js는 python3 tools/build.py가 만든다. 파일이 바뀌면 VERSION이 바뀌고,
   브라우저가 새 목록을 받아 새 저장소를 채운 뒤 옛 저장소를 지운다. */
importScripts("sw-files.js");   // self.PRECACHE = { version, files }

const PREFIX = "namunnip-textbook-";
const CACHE = PREFIX + self.PRECACHE.version;
const BASE = new URL("./", self.location).href;   // 교과서 최상위 (GitHub Pages 하위 경로 포함)

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // HTTP 캐시를 건너뛰어 옛 파일이 새 버전에 섞이지 않게 한다.
    await cache.addAll(self.PRECACHE.files.map((f) => new Request(BASE + f, { cache: "reload" })));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) {
      if (key.startsWith(PREFIX) && key !== CACHE) await caches.delete(key);
    }
    await self.clients.claim();
  })());
});

/* 주소를 저장본의 키로 바꾼다: 쿼리·해시 제거, 폴더 주소는 index.html */
function cacheKey(url) {
  const u = new URL(url);
  u.search = ""; u.hash = "";
  if (u.pathname.endsWith("/")) u.pathname += "index.html";
  return u.href;
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET" || !req.url.startsWith(BASE)) return;   // 다른 사이트 요청은 건드리지 않는다
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const hit = await cache.match(cacheKey(req.url));
    if (hit) return hit;
    try {
      return await fetch(req);
    } catch (err) {
      // 오프라인이고 저장본에도 없는 페이지: 첫 화면을 보여 준다.
      if (req.mode === "navigate") {
        const home = await cache.match(BASE + "index.html");
        if (home) return home;
      }
      throw err;
    }
  })());
});
