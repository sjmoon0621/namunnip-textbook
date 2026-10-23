/* 본문 카드(STYLE.md 2·4절) 그림 도우미 NMQ: SVG 요소 만들기, 좌표 틀, 축·그래프, 슬라이더 묶기, 점 끌기.
   색은 css/tb.css의 .q-fig svg 클래스(ax·gd·k·a·b·c·d, fa…, la…, ta…)로 주므로 다크 모드에서도 그대로 보인다.
   그림마다 과목의 body.js에서 NMQ.def("이름", (fig, svg) => { … })로 등록하고, 블록에는 <figure class="q-fig" data-q="이름">을 둔다.
   SVG 글자 안에는 KaTeX 수식을 쓰지 않는다(js/math.js가 SVG 속 글자까지 바꾸면 그림이 깨진다). */
window.NMQ = (() => {
  "use strict";
  const NS = "http://www.w3.org/2000/svg";
  function el(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs || {}) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function clear(g) { while (g.firstChild) g.removeChild(g.firstChild); }
  function txt(parent, x, y, s, cls, anchor) {
    const t = el("text", { x, y, class: cls || "", "text-anchor": anchor || "start" }, parent);
    t.textContent = s;
    return t;
  }
  // 수 표시: 음수는 '−', 소수 d자리까지
  function num(x, d) {
    const p = 10 ** (d == null ? 2 : d), r = Math.round(x * p) / p;
    return (r < 0 ? "−" : "") + Math.abs(r);
  }
  // 수학 좌표 [x0,x1]×[y0,y1] → SVG 사각형 [X0,X1]×[Y0,Y1] (y는 위로)
  function frame(x0, x1, y0, y1, X0, X1, Y0, Y1) {
    const sx = (X1 - X0) / (x1 - x0), sy = (Y1 - Y0) / (y1 - y0);
    return {
      x0, x1, y0, y1, X0, X1, Y0, Y1,
      x: (v) => X0 + (v - x0) * sx,
      y: (v) => Y1 - (v - y0) * sy,
      ix: (p) => x0 + (p - X0) / sx,
      iy: (p) => y0 + (Y1 - p) / sy,
    };
  }
  // 모눈과 축. o = { step: 1, label: true, xs: "x", ys: "y" }. step, lstep은 [x 간격, y 간격]으로도 줄 수 있다.
  function axes(g, F, o) {
    o = o || {};
    const two = (v, d) => (Array.isArray(v) ? v : [v == null ? d : v, v == null ? d : v]);
    const [sx, sy] = two(o.step, 1), gs = o.grid === false ? null : el("g", {}, g);
    if (gs) {
      for (let v = Math.ceil(F.x0 / sx) * sx; v <= F.x1 + 1e-9; v += sx) el("line", { x1: F.x(v), y1: F.Y0, x2: F.x(v), y2: F.Y1, class: "gd" }, gs);
      for (let v = Math.ceil(F.y0 / sy) * sy; v <= F.y1 + 1e-9; v += sy) el("line", { x1: F.X0, y1: F.y(v), x2: F.X1, y2: F.y(v), class: "gd" }, gs);
    }
    if (F.y0 <= 0 && F.y1 >= 0) el("line", { x1: F.X0, y1: F.y(0), x2: F.X1, y2: F.y(0), class: "ax" }, g);
    if (F.x0 <= 0 && F.x1 >= 0) el("line", { x1: F.x(0), y1: F.Y0, x2: F.x(0), y2: F.Y1, class: "ax" }, g);
    if (o.label !== false) {
      const [lx, ly] = o.lstep ? two(o.lstep) : [sx * (o.every || 1), sy * (o.every || 1)];
      for (let v = Math.ceil(F.x0 / lx) * lx; v <= F.x1 + 1e-9; v += lx) if (Math.abs(v) > 1e-9 && F.y0 <= 0 && F.y1 >= 0) txt(g, F.x(v), F.y(0) + 14, num(v), "s", "middle");
      for (let v = Math.ceil(F.y0 / ly) * ly; v <= F.y1 + 1e-9; v += ly) if (Math.abs(v) > 1e-9 && F.x0 <= 0 && F.x1 >= 0) txt(g, F.x(0) - 5, F.y(v) + 4, num(v), "s", "end");
      if (F.y0 <= 0 && F.y1 >= 0) txt(g, F.X1 - 4, F.y(0) - 6, o.xs || "x", "i", "end");
      if (F.x0 <= 0 && F.x1 >= 0) txt(g, F.x(0) + 6, F.Y0 + 14, o.ys || "y", "i");
    }
  }
  // 함수 그래프. 화면 밖으로 크게 나가거나 끊기는 곳(분모 0)은 선을 끊는다.
  function plot(g, F, f, cls, a, b, n) {
    a = a == null ? F.x0 : a; b = b == null ? F.x1 : b; n = n || 240;
    let d = "", pen = false;
    const lo = F.y0 - (F.y1 - F.y0), hi = F.y1 + (F.y1 - F.y0);
    for (let i = 0; i <= n; i++) {
      const x = a + (b - a) * i / n, y = f(x);
      if (!isFinite(y) || y < lo || y > hi) { pen = false; continue; }
      d += (pen ? "L" : "M") + F.x(x).toFixed(1) + " " + F.y(y).toFixed(1);
      pen = true;
    }
    return el("path", { d, class: cls || "a" }, g);
  }
  function dot(g, x, y, cls, r) { return el("circle", { cx: x, cy: y, r: r || 4, class: cls || "fk" }, g); }
  function line(g, x1, y1, x2, y2, cls) { return el("line", { x1, y1, x2, y2, class: cls || "k" }, g); }
  // 화살표 머리가 달린 선
  function arrow(g, x1, y1, x2, y2, cls, fcls) {
    line(g, x1, y1, x2, y2, cls);
    const a = Math.atan2(y2 - y1, x2 - x1), s = 7;
    el("path", { d: `M${x2} ${y2}L${x2 - s * Math.cos(a - .4)} ${y2 - s * Math.sin(a - .4)}L${x2 - s * Math.cos(a + .4)} ${y2 - s * Math.sin(a + .4)}Z`, class: fcls || "fk" }, g);
  }
  // fig 안의 input[data-k] 값을 모아 draw(v)에 넘기고, output[data-k]에 값을 적는다.
  function bind(fig, draw, fmt) {
    const ins = fig.querySelectorAll("input[data-k], select[data-k]");
    const run = () => {
      const v = {};
      ins.forEach((i) => { v[i.dataset.k] = i.type === "checkbox" ? i.checked : +i.value; });
      fig.querySelectorAll("output[data-k]").forEach((o) => { o.textContent = fmt ? fmt(o.dataset.k, v[o.dataset.k]) : num(v[o.dataset.k]); });
      draw(v);
    };
    ins.forEach((i) => i.addEventListener("input", run));
    run();
    return run;
  }
  // SVG 안의 요소를 끌면 onmove(svg 좌표 x, y)를 부른다. 마우스·터치 모두.
  function drag(svg, node, onmove) {
    node.classList.add("drag");
    node.style.touchAction = "none";
    const pt = (e) => {
      const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY;
      return p.matrixTransform(svg.getScreenCTM().inverse());
    };
    node.addEventListener("pointerdown", (e) => {
      node.setPointerCapture(e.pointerId);
      const mv = (ev) => { const p = pt(ev); onmove(p.x, p.y); };
      const up = () => { node.removeEventListener("pointermove", mv); node.removeEventListener("pointerup", up); };
      node.addEventListener("pointermove", mv);
      node.addEventListener("pointerup", up);
      e.preventDefault();
    });
  }
  // 보일 때만 도는 애니메이션. frame(t초)
  function loop(fig, frame) {
    let on = false, t0 = 0, id = 0;
    const tick = (ms) => { if (!on) return; frame((ms - t0) / 1000); id = requestAnimationFrame(tick); };
    const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { frame(0); return; }
    new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting && !on) { on = true; t0 = performance.now(); id = requestAnimationFrame(tick); }
      else if (!e.isIntersecting) { on = false; cancelAnimationFrame(id); }
    })).observe(fig);
    frame(0);
  }
  function def(name, fn) {
    document.querySelectorAll(`figure.q-fig[data-q="${name}"]`).forEach((f) => fn(f, f.querySelector("svg")));
  }
  return { el, clear, txt, num, frame, axes, plot, dot, line, arrow, bind, drag, loop, def };
})();
