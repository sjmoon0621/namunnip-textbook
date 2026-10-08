/* 나뭇잎 디지털 교과서 — 공통 도구 (모든 페이지가 먼저 불러온다) */
window.NM = (() => {
  "use strict";

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const C = {
    ink: "#232326", ink2: "#5d5d61", ink3: "#8d8d92", rule: "#d9dad2",
    paper: "#f3f4ef", card: "#fbfbf8", leaf: "#74ab66", forest: "#3b7c2a", sprout: "#b5d7ac",
    warn: "#b5532f", night: "#1c1e1b", amber: "#e0a02a", apple: "#d4493a",
  };
  const F = {
    mono: '"IBM Plex Mono", ui-monospace, Menlo, monospace',
    sans: '"Pretendard Variable", Pretendard, -apple-system, "Apple SD Gothic Neo", sans-serif',
    serif: "Newsreader, Georgia, serif",
  };
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  const ease = (t) => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  /* 캔버스를 CSS 크기 × DPR로 맞춘다. 첫 그리기는 ResizeObserver 첫 콜백에서. */
  function fit(canvas, draw) {
    const ctx = canvas.getContext("2d");
    const size = { w: 0, h: 0 };
    const resize = (first) => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      size.w = canvas.clientWidth; size.h = canvas.clientHeight;
      canvas.width = Math.round(size.w * dpr); canvas.height = Math.round(size.h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (draw && first !== true) draw();
    };
    new ResizeObserver(() => resize()).observe(canvas);
    resize(true);
    return { ctx, size };
  }

  /* 화면에 보일 때만 도는 루프. frame(dt)가 false를 돌려주면 다음 프레임을 쉰다. */
  function loop(el, frame) {
    let on = false, raf = 0, last = 0;
    const tick = (now) => {
      const dt = clamp((now - last) / 1000, 0, 0.05); last = now;
      frame(dt);
      if (on) raf = requestAnimationFrame(tick);
    };
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !on) { on = true; last = performance.now(); raf = requestAnimationFrame(tick); }
      else if (!e.isIntersecting) { on = false; cancelAnimationFrame(raf); }
    }, { threshold: 0.05 }).observe(el);
  }

  /* 축 눈금 도우미 */
  function axes(ctx, o) {
    // o: {x0,y0,w,h, xt:[[v,label]], yt:[[v,label]], X, Y, xlabel, ylabel}
    ctx.save();
    ctx.font = `10.5px ${F.mono}`; ctx.strokeStyle = C.rule; ctx.fillStyle = C.ink3; ctx.lineWidth = 1;
    for (const [v, lab] of o.xt || []) {
      const x = Math.round(o.X(v)) + .5;
      ctx.beginPath(); ctx.moveTo(x, o.y0); ctx.lineTo(x, o.y0 + o.h); ctx.stroke();
      ctx.textAlign = "center"; ctx.fillText(lab, x, o.y0 + o.h + 14);
    }
    for (const [v, lab] of o.yt || []) {
      const y = Math.round(o.Y(v)) + .5;
      ctx.beginPath(); ctx.moveTo(o.x0, y); ctx.lineTo(o.x0 + o.w, y); ctx.stroke();
      ctx.textAlign = "right"; ctx.fillText(lab, o.x0 - 5, y + 3);
    }
    if (o.xlabel) { ctx.textAlign = "right"; ctx.fillText(o.xlabel, o.x0 + o.w, o.y0 + o.h + 28); }
    if (o.ylabel) { ctx.textAlign = "left"; ctx.fillText(o.ylabel, o.x0, o.y0 - 7); }
    ctx.restore();
  }

  /* 브랜드 심볼 스프라이트 */
  const SPRITE = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><symbol id="nm" viewBox="627.0 324.8 299.2 299.1"><path fill="currentColor" d="M 872.27 425.05 L 836.37 425.05 C 830.61 425.05 825.94 420.38 825.94 414.63 L 825.94 378.72 C 825.94 372.96 830.61 368.29 836.37 368.29 L 861.84 368.29 C 873.36 368.29 882.71 377.63 882.71 389.15 L 882.71 414.63 C 882.71 420.38 878.04 425.05 872.27 425.05 M 782.49 345.70 L 782.49 447.64 C 782.49 459.16 791.83 468.50 803.36 468.50 L 905.29 468.50 C 916.81 468.50 926.16 459.16 926.16 447.64 L 926.16 387.43 C 926.16 352.86 898.13 324.84 863.56 324.84 L 803.36 324.84 C 791.83 324.84 782.49 334.18 782.49 345.70"/><path fill="currentColor" d="M 660.02 324.84 L 637.44 324.84 C 631.68 324.84 627.00 329.51 627.00 335.27 L 627.00 447.64 C 627.00 459.16 636.35 468.50 647.87 468.50 L 760.24 468.50 C 766.00 468.50 770.67 463.84 770.67 458.07 L 770.67 435.49 C 770.67 429.73 766.00 425.05 760.24 425.05 L 670.45 425.05 L 670.45 335.27 C 670.45 329.51 665.79 324.84 660.02 324.84"/><path fill="currentColor" d="M 698.84 580.54 C 683.16 580.54 670.45 567.83 670.45 552.16 C 670.45 536.48 683.16 523.77 698.84 523.77 C 714.52 523.77 727.22 536.48 727.22 552.16 C 727.22 567.83 714.52 580.54 698.84 580.54 M 698.84 480.32 C 659.16 480.32 627.00 512.48 627.00 552.16 C 627.00 591.83 659.16 623.99 698.84 623.99 C 738.51 623.99 770.67 591.83 770.67 552.16 C 770.67 512.48 738.51 480.32 698.84 480.32"/><path fill="#74ab66" d="M 810.60 501.00 C 863.82 513.98 892.93 548.74 904.99 598.88 C 882.36 556.11 851.18 523.16 810.60 501.00 M 863.56 480.32 L 803.36 480.32 C 791.83 480.32 782.49 489.66 782.49 501.19 L 782.49 561.39 C 782.49 595.96 810.51 623.99 845.08 623.99 L 905.29 623.99 C 916.81 623.99 926.16 614.65 926.16 603.13 L 926.16 542.92 C 926.16 508.35 898.13 480.32 863.56 480.32"/></symbol></svg>`;
  document.body.insertAdjacentHTML("afterbegin", SPRITE);

  /* 다크 모드: <head>의 짧은 스크립트가 첫 그리기 전에 html[data-theme]를 정한다. 여기서는 상단바 버튼만 잇는다.
     저장 값(localStorage "namunnip-theme")이 없으면 운영체제 설정을 따른다. */
  const THEME_KEY = "namunnip-theme", html = document.documentElement;
  const setTheme = (t) => {
    html.dataset.theme = t;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = t === "dark" ? "#17181a" : "#f3f4ef";
    document.querySelectorAll(".theme-btn").forEach((b) => b.setAttribute("aria-pressed", String(t === "dark")));
  };
  const savedTheme = () => { try { return localStorage.getItem(THEME_KEY); } catch (e) { return null; } };   // 저장소를 막은 브라우저
  setTheme(html.dataset.theme === "dark" ? "dark" : "light");
  document.querySelectorAll(".theme-btn").forEach((b) => b.addEventListener("click", () => {
    const t = html.dataset.theme === "dark" ? "light" : "dark";
    try { localStorage.setItem(THEME_KEY, t); } catch (e) { console.warn("테마를 저장하지 못함", e); }
    setTheme(t);
  }));
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
    if (!savedTheme() && !/[?&]theme=/.test(location.search)) setTheme(e.matches ? "dark" : "light");
  });

  /* 확인 문제: 고르면 맞든 틀리든 '왜'를 보여 준다 */
  document.querySelectorAll(".quiz").forEach((q) => {
    const opts = [...q.querySelectorAll("button.opt")];
    opts.forEach((b) => b.addEventListener("click", () => {
      b.classList.add(b.dataset.ok === "1" ? "right" : "wrong");
      b.setAttribute("aria-pressed", "true");
      if (b.dataset.ok === "1") q.dataset.done = "1";
      q.dispatchEvent(new CustomEvent("answered", { bubbles: true, detail: { button: b, ok: b.dataset.ok === "1" } }));
    }));
  });

  /* 주제 페이지 목차: 보고 있는 카드 표시 + 푼 문제 수 */
  const toc = document.querySelector(".toc");
  if (toc) {
    const links = [...toc.querySelectorAll("a[href^='#']")];
    const cards = links.map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      links.forEach((a) => a.classList.toggle("on", a.getAttribute("href") === "#" + e.target.id));
    }), { rootMargin: "-40% 0px -55% 0px" });
    cards.forEach((c) => io.observe(c));
    const prog = toc.querySelector(".progress");
    const upd = () => {
      const qs = [...document.querySelectorAll(".quiz")];
      if (prog) prog.textContent = `확인 문제 ${qs.filter((q) => q.dataset.done).length} / ${qs.length}`;
    };
    document.addEventListener("answered", upd); upd();
  }

  /* 절(section) 페이지: <body data-course="is1" data-sec="3-3"> 이면 toc.js로 위치 정보를 채운다 */
  const b = document.body.dataset;
  if (b.course && b.sec && window.TOC) {
    const course = TOC.find((c) => c.id === b.course);
    const flat = [];
    TOC.forEach((c) => c.chapters.forEach((ch) => ch.sections.forEach((s) => flat.push({ c, ch, s }))));
    const i = flat.findIndex((x) => x.c.id === b.course && `${x.ch.n}-${x.s.n}` === b.sec);
    if (course && i >= 0) {
      const { ch, s } = flat[i];
      const R = ["", "Ⅰ", "Ⅱ", "Ⅲ", "Ⅳ", "Ⅴ"];
      const crumbs = document.querySelector(".crumbs");
      if (crumbs) crumbs.innerHTML = `<span aria-hidden="true">/</span><a href="./">${course.name}</a><span aria-hidden="true">/</span><span>${R[ch.n]}. ${ch.title}</span><span aria-hidden="true">/</span><b>${ch.n}.${s.n} ${s.title}</b>`;
      const meta = document.querySelector(".topic-hero .meta");
      if (meta) {
        const nc = document.querySelectorAll("article.card:not(.reading)").length, nt = document.querySelectorAll("article.reading").length, nv = document.querySelectorAll(".video-block").length;
        meta.innerHTML = `<span class="tag-pill live">${course.name}</span><span class="tag-pill">${R[ch.n]}. ${ch.title}</span>` +
          (/\d/.test(s.code) ? `<span class="tag-pill">[${s.code}]</span>` : "") +
          `<span class="tag-pill">${[nc && `카드 ${nc}장`, nt && `읽기 ${nt}편`, nv && `영상 ${nv}편`].filter(Boolean).join(" · ")}</span>`;
      }
      document.title = `${ch.n}.${s.n} ${s.title} — ${course.name} · 나뭇잎 과학 교과서`;
      const nav = document.querySelector("nav.next");
      if (nav) {
        const link = (x, dir) => {
          if (!x || x.c.id !== b.course) return `<div><span class="mono">${dir === "prev" ? "이전 절" : "다음 절"}</span><b>${dir === "prev" ? "과목의 첫 절입니다" : "과목의 마지막 절입니다"}</b></div>`;
          const label = `${x.ch.n}.${x.s.n} ${x.s.title}`;
          if (!x.s.page) return `<div><span class="mono">${dir === "prev" ? "← 이전 절" : "다음 절 →"}</span><b>${label} (준비 중)</b></div>`;
          return `<a href="${x.ch.n}-${x.s.n}.html"><span class="mono">${dir === "prev" ? "← 이전 절" : "다음 절 →"}</span><b>${label}</b></a>`;
        };
        nav.innerHTML = link(flat[i - 1], "prev") + link(flat[i + 1], "next");
      }
    }
  }

  return { reduce, C, F, clamp, ease, fit, loop, axes };
})();

/* 앱으로 설치(PWA)·오프라인: 교과서 최상위의 sw.js를 등록한다. 시험 모드(?test)와 iframe 안에서는 건너뛴다. */
(() => {
  if (!("serviceWorker" in navigator) || !window.isSecureContext) return;
  if (!/^https?:$/.test(location.protocol)) return;   // 데스크톱 앱(tauri://) 안에서는 파일이 이미 내장되어 있다
  if (window !== window.top || /[?&]test\b/.test(location.search)) return;
  const sw = new URL("../sw.js", document.currentScript.src);
  addEventListener("load", () => {
    navigator.serviceWorker.register(sw.href, { scope: new URL("./", sw).href }).catch((e) => console.warn("서비스 워커 등록 실패", e));
    // 학습 기록(localStorage)이 저장 공간 정리로 지워지지 않게 요청한다. 브라우저가 거절할 수 있다.
    if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
  });
})();
