/* 카드: 지층의 순서만으로 나이를 알 수 있을까? — 상대 연령 퍼즐
   단면은 사건(퇴적·기울어짐·관입·단층·침식)을 차례로 적용한 모형으로 계산한다.
   화면의 한 점이 무엇인지는 사건을 거꾸로 되짚어 판정한다. */
(() => {
  const root = document.getElementById("card-earth-relative-age");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), chipsEl = $(".items"), seqEl = $(".seq"), fb = $(".feedback");
  const hist = $(".hist"), histOut = $(".hist-out");

  // 암석 종류: 기본색과 무늬
  const ROCK = {
    sand: { name: "사암", col: [226, 203, 150] },
    shale: { name: "셰일", col: [160, 166, 150] },
    lime: { name: "석회암", col: [200, 207, 212] },
    cong: { name: "역암", col: [214, 178, 128] },
    granite: { name: "화강암", col: [226, 160, 150] },
  };

  // 사건 목록. id는 내부 이름, lab은 그림에 적는 이름(순서를 드러내지 않게 섞었다)
  const SC = [
    {
      name: "기울어진 지층과 관입",
      ev: [
        { t: "dep", id: "a", lab: "C", top: 7.7, rock: "lime" },
        { t: "dep", id: "b", lab: "F", top: 6.1, rock: "shale" },
        { t: "dep", id: "c", lab: "A", top: 4.5, rock: "sand" },
        { t: "dep", id: "d", lab: "E", top: 2.4, rock: "shale" },
        { t: "tilt", ang: 14, cx: 8, cy: 5 },
        { t: "dike", id: "x", lab: "B", rock: "granite", poly: [[9.9, 10], [11.1, 10], [10.9, 6.5], [10.6, 2.4], [10.3, 2.4], [10.1, 6.5]] },
        { t: "ero", id: "u", lab: "부정합면", level: 3.5 },
        { t: "dep", id: "e", lab: "D", top: 2.8, rock: "cong" },
        { t: "dep", id: "f", lab: "G", top: 1.5, rock: "sand" },
      ],
      why: {
        a: "맨 아래에 있고 다른 어떤 것에도 잘리지 않았습니다. 지층 누중의 법칙에 따라 가장 먼저 쌓였습니다.",
        b: "C 위에 쌓였습니다. 기울어져 있어도 아래에 있는 층이 먼저입니다.",
        c: "F 위에 쌓였습니다.",
        d: "기울어진 지층 가운데 가장 위에 있습니다. 쌓일 때는 수평이었다가 나중에 함께 기울어졌습니다.",
        x: "B는 C·F·A·E를 모두 뚫고 들어왔으니 그보다 나중입니다(관입의 법칙). 그런데 부정합면에서 잘려 있으니 침식보다는 먼저입니다.",
        u: "기울어진 지층과 관입암 B의 윗부분이 한꺼번에 깎여 나갔습니다. 융기해서 물 밖으로 드러나야 깎입니다.",
        e: "깎인 면 바로 위의 역암(기저 역암)입니다. 침식 뒤에 다시 가라앉아 쌓이기 시작했다는 표시입니다.",
        f: "가장 위에 있는 수평층이라 가장 나중입니다.",
      },
    },
    {
      name: "단층과 부정합",
      ev: [
        { t: "dep", id: "a", lab: "D", top: 7.8, rock: "sand" },
        { t: "dep", id: "b", lab: "A", top: 6.4, rock: "shale" },
        { t: "dep", id: "c", lab: "F", top: 5.0, rock: "lime" },
        { t: "dep", id: "d", lab: "B", top: 3.2, rock: "sand" },
        { t: "fault", id: "f", lab: "f", x1: 6.0, y1: -1, x2: 10.2, y2: 10, s: 1.5 },
        { t: "ero", id: "u", lab: "부정합면", level: 3.9 },
        { t: "dep", id: "e", lab: "G", top: 2.7, rock: "cong" },
        { t: "dike", id: "y", lab: "E", rock: "granite", poly: [[3.2, 10], [4.1, 10], [3.95, 6], [3.8, 2.7], [3.55, 2.7], [3.4, 6]] },
        { t: "dep", id: "g", lab: "C", top: 1.6, rock: "shale" },
      ],
      why: {
        a: "가장 아래 지층입니다.",
        b: "D 위에 쌓였습니다.",
        c: "A 위에 쌓였습니다.",
        d: "단층에 잘린 지층 가운데 가장 위에 있습니다.",
        f: "단층 f는 D·A·F·B를 모두 끊었으니 그 뒤에 생겼습니다. 부정합면은 끊지 못했으니 침식보다는 먼저입니다.",
        u: "단층으로 어긋난 지층의 윗면이 평평하게 깎였습니다. 단층이 만든 턱이 사라졌습니다.",
        e: "침식면 바로 위의 역암입니다. 다시 퇴적이 시작되었습니다.",
        y: "E는 G까지 뚫고 올라왔지만 C는 뚫지 못했습니다. G보다 나중, C보다 먼저입니다.",
        g: "관입암 E를 덮고 있으니 가장 나중입니다.",
      },
    },
    {
      name: "관입암이 단층에 잘리면",
      ev: [
        { t: "dep", id: "a", lab: "E", top: 7.5, rock: "shale" },
        { t: "dep", id: "b", lab: "B", top: 5.8, rock: "lime" },
        { t: "dep", id: "c", lab: "G", top: 3.4, rock: "sand" },
        { t: "dike", id: "x", lab: "A", rock: "granite", poly: [[4.6, 10], [5.8, 10], [5.7, 6], [5.4, 3.4], [5.0, 3.4], [4.8, 6]] },
        { t: "fault", id: "f", lab: "f", x1: 11.2, y1: -1, x2: 7.4, y2: 10, s: -1.4 },
        { t: "ero", id: "u", lab: "부정합면", level: 3.6 },
        { t: "dep", id: "d", lab: "F", top: 2.9, rock: "cong" },
        { t: "dep", id: "e", lab: "D", top: 1.6, rock: "shale" },
      ],
      why: {
        a: "가장 아래 지층입니다.",
        b: "E 위에 쌓였습니다.",
        c: "B 위에 쌓였습니다.",
        x: "A는 E·B·G를 뚫었으니 그 뒤입니다. 그리고 단층 f가 A까지 끊었으니 A는 단층보다 먼저입니다.",
        f: "f는 관입암 A까지 끊었습니다. 끊은 쪽이 끊긴 쪽보다 나중입니다(단층도 관입과 같은 논리입니다).",
        u: "단층 f의 윗부분이 깎인 면에서 멈췄습니다. 단층 뒤에 융기·침식이 있었습니다.",
        d: "침식면 위의 역암입니다.",
        e: "가장 위의 층입니다.",
      },
    },
  ];

  let S = 0, seq = [], solved = false, nShow = 0;
  const items = () => SC[S].ev.filter((e) => e.id);
  const order = () => items().map((e) => e.id);

  // ── 모형: 화면의 한 점이 무엇인지 사건을 거꾸로 되짚어 판정 ──
  const LW = 0.055;
  function hanging(e, x, y) {
    // 단층선 위쪽에 놓인 쪽(상반)을 판정: 선 위의 점에서 바로 위로 한 칸 옮긴 점과 같은 쪽이면 상반
    const cr = (px, py) => (e.x2 - e.x1) * (py - e.y1) - (e.y2 - e.y1) * (px - e.x1);
    const mx = (e.x1 + e.x2) / 2, my = (e.y1 + e.y2) / 2;
    return Math.sign(cr(x, y)) === Math.sign(cr(mx, my - 1));
  }
  function inPoly(p, x, y) {
    let c = false;
    for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
      const [xi, yi] = p[i], [xj, yj] = p[j];
      if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c;
    }
    return c;
  }
  function probe(ev, n, px, py) {
    let x = px, y = py, cand = -1, cu = 0, cvv = 0, mark = -1;
    for (let k = n - 1; k >= 0; k--) {
      const e = ev[k];
      if (e.t === "dep") {
        if (y < e.top) return (mark >= 0 && cand >= 0 && cand < mark) ? { k: mark } : cand >= 0 ? { k: cand, u: cu, v: cvv } : null;
        cand = k; cu = x; cvv = y;
      } else if (e.t === "ero") {
        if (y < e.level) return (mark >= 0 && cand >= 0 && cand < mark) ? { k: mark } : cand >= 0 ? { k: cand, u: cu, v: cvv } : null;
        if (y - e.level < LW * 1.4 && mark < 0) mark = k;
      } else if (e.t === "tilt") {
        const a = -e.ang * Math.PI / 180, dx = x - e.cx, dy = y - e.cy;
        x = e.cx + dx * Math.cos(a) - dy * Math.sin(a); y = e.cy + dx * Math.sin(a) + dy * Math.cos(a);
      } else if (e.t === "fault") {
        const L = Math.hypot(e.x2 - e.x1, e.y2 - e.y1), dx = (e.x2 - e.x1) / L, dy = (e.y2 - e.y1) / L;
        const d = Math.abs((x - e.x1) * dy - (y - e.y1) * dx);
        if (d < LW && mark < 0) mark = k;
        if (hanging(e, x, y)) { x -= e.s * dx; y -= e.s * dy; }
      } else if (e.t === "dike") {
        if (inPoly(e.poly, x, y)) return mark >= 0 ? { k: mark } : { k, u: x, v: y };
      }
    }
    return mark >= 0 ? { k: mark } : cand >= 0 ? { k: cand, u: cu, v: cvv } : null;
  }

  const hash = (i, j) => { const s = Math.sin(i * 127.1 + j * 311.7) * 43758.5453; return s - Math.floor(s); };
  function shade(rock, u, v) {
    if (rock === "sand") {
      const g = 0.2, i = Math.floor(u / g), j = Math.floor(v / g);
      const cx = (i + .2 + .6 * hash(i, j)) * g, cy = (j + .2 + .6 * hash(j, i)) * g;
      return Math.hypot(u - cx, v - cy) < 0.028 ? 0.62 : 1;
    }
    if (rock === "shale") {
      const r = v / 0.22, row = Math.floor(r);
      return (r - row < 0.12 && (u * 1.3 + hash(row, 3)) % 1 < 0.72) ? 0.72 : 1;
    }
    if (rock === "lime") {
      const h = 0.36, r = v / h, row = Math.floor(r);
      if (r - row < 0.09) return 0.72;
      const c = (u + (row % 2) * 0.4) / 0.8;
      return c - Math.floor(c) < 0.045 ? 0.72 : 1;
    }
    if (rock === "cong") {
      const g = 0.42, i = Math.floor(u / g), j = Math.floor(v / g);
      const cx = (i + .5) * g + (hash(i, j) - .5) * .12, cy = (j + .5) * g + (hash(j, i) - .5) * .12;
      const rr = 0.1 + 0.08 * hash(i + 7, j), d = Math.hypot((u - cx) * 0.85, v - cy);
      return d < rr ? (d > rr - 0.03 ? 0.6 : 1.08) : 0.94;
    }
    if (rock === "granite") {
      const g = 0.24, i = Math.floor(u / g), j = Math.floor(v / g);
      const du = u - (i + .5) * g, dv = v - (j + .5) * g, hsh = hash(i, j);
      if (hsh < 0.35) return (Math.abs(du) < 0.015 && Math.abs(dv) < 0.07) || (Math.abs(dv) < 0.015 && Math.abs(du) < 0.07) ? 0.55 : 1;
      if (hsh < 0.5) return Math.hypot(du, dv) < 0.03 ? 0.35 : 1;
      return 1;
    }
    return 1;
  }

  const { ctx, size } = fit(cv, () => { render(); draw(); });
  const off = document.createElement("canvas");
  let idBuf = null, bw = 0, bh = 0, labels = {};

  function render() {
    const { w, h } = size; if (!w) return;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    bw = Math.round(w * dpr); bh = Math.round(h * dpr);
    off.width = bw; off.height = bh;
    const oc = off.getContext("2d"), img = oc.createImageData(bw, bh), d = img.data;
    const ev = SC[S].ev, n = nShow, sc = 16 / bw;
    idBuf = new Int16Array(bw * bh);
    const acc = {};
    const sky = [243, 244, 239];
    for (let py = 0; py < bh; py++) {
      for (let px = 0; px < bw; px++) {
        const X = (px + .5) * sc, Y = (py + .5) * sc;
        const r = probe(ev, n, X, Y), o = (py * bw + px) * 4;
        let col = sky, k = -1;
        if (r) {
          k = r.k; const e = ev[k];
          if (e.t === "fault" || e.t === "ero") col = [52, 52, 56];
          else {
            const base = ROCK[e.rock].col, f = shade(e.rock, r.u, r.v) * (0.93 + 0.07 * ((k * 37) % 3) / 2);
            col = [base[0] * f, base[1] * f, base[2] * f];
          }
          if (e.id) { const a = acc[e.id] || (acc[e.id] = []); if ((px + py) % 3 === 0) a.push(px, py); }
        }
        idBuf[py * bw + px] = k;
        d[o] = col[0]; d[o + 1] = col[1]; d[o + 2] = col[2]; d[o + 3] = 255;
      }
    }
    // 경계선
    for (let py = 0; py < bh - 1; py++) for (let px = 0; px < bw - 1; px++) {
      const i = py * bw + px, a = idBuf[i];
      if (a !== idBuf[i + 1] || a !== idBuf[i + bw]) {
        const o = i * 4; d[o] = d[o + 1] = d[o + 2] = 60;
      }
    }
    oc.putImageData(img, 0, 0);
    // 이름 붙일 자리: 가운데에 가까운 열에서 그 암석의 세로 중앙
    labels = {};
    for (const id in acc) {
      const a = acc[id], xs = [];
      for (let i = 0; i < a.length; i += 2) xs.push(a[i]);
      xs.sort((p, q) => p - q);
      const e = ev.find((q) => q.id === id);
      let tx = xs[Math.floor(xs.length * (e.t === "fault" ? 0.5 : 0.3))];
      if (e.t === "ero") tx = xs[Math.floor(xs.length * 0.93)];
      const ys = [];
      for (let i = 0; i < a.length; i += 2) if (Math.abs(a[i] - tx) < 6 * dpr) ys.push(a[i + 1]);
      ys.sort((p, q) => p - q);
      labels[id] = { x: tx / dpr, y: (ys[Math.floor(ys.length / 2)] || 0) / dpr };
    }
  }

  function draw() {
    const { w, h } = size; if (!w || !bw) return;
    ctx.clearRect(0, 0, w, h);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(off, 0, 0, w, h);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.strokeRect(.5, .5, w - 1, h - 1);
    const ev = SC[S].ev;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    for (const id in labels) {
      const e = ev.find((q) => q.id === id), L = labels[id];
      const pos = seq.indexOf(id);
      const txt = e.lab, big = !(e.t === "ero");
      ctx.font = big ? `700 15px ${F.sans}` : `600 11.5px ${F.sans}`;
      const tw = ctx.measureText(txt).width + 12;
      let y = L.y; if (e.t === "ero") y -= 10;
      ctx.fillStyle = pos >= 0 ? C.ink : "rgba(251,251,248,.92)";
      ctx.fillRect(L.x - tw / 2, y - 11, tw, 22);
      ctx.strokeStyle = C.ink; ctx.strokeRect(L.x - tw / 2 + .5, y - 10.5, tw - 1, 21);
      ctx.fillStyle = pos >= 0 ? C.paper : C.ink; ctx.fillText(txt, L.x, y + 1);
      if (pos >= 0) {
        ctx.beginPath(); ctx.arc(L.x + tw / 2 + 2, y - 11, 8, 0, Math.PI * 2); ctx.fillStyle = C.forest; ctx.fill();
        ctx.font = `600 10px ${F.mono}`; ctx.fillStyle = "#fff"; ctx.fillText(pos + 1, L.x + tw / 2 + 2, y - 10.5);
      }
    }
    ctx.textBaseline = "alphabetic";
    // 단층의 상대 운동 화살표
    const f = ev.find((q) => q.t === "fault");
    if (f && ev.indexOf(f) < nShow && labels.f) {
      const L = Math.hypot(f.x2 - f.x1, f.y2 - f.y1), dx = (f.x2 - f.x1) / L, dy = (f.y2 - f.y1) / L;
      const k = w / 16, mx = labels.f.x, my = labels.f.y + 34;
      const nx = -dy, ny = dx; // 선에 수직
      const side = hanging(f, (mx + nx * 12) / k, (my + ny * 12) / k) ? 1 : -1;
      const arrow = (ox, oy, sgn) => {
        const x0 = mx + ox, y0 = my + oy, L2 = 16 * sgn;
        ctx.beginPath(); ctx.moveTo(x0 - dx * L2, y0 - dy * L2); ctx.lineTo(x0 + dx * L2, y0 + dy * L2); ctx.stroke();
        const hx = x0 + dx * L2, hy = y0 + dy * L2;
        ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx - dx * 6 * sgn + nx * 3.5, hy - dy * 6 * sgn + ny * 3.5); ctx.lineTo(hx - dx * 6 * sgn - nx * 3.5, hy - dy * 6 * sgn - ny * 3.5); ctx.closePath(); ctx.fill();
      };
      ctx.strokeStyle = C.warn; ctx.fillStyle = C.warn; ctx.lineWidth = 1.6;
      const sh = Math.sign(f.s);
      arrow(nx * 9 * side, ny * 9 * side, sh);
      arrow(-nx * 9 * side, -ny * 9 * side, -sh);
    }
    ctx.textAlign = "left";
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3;
    ctx.fillText("모식 단면", 8, 14);
  }

  // ── 조작 ──
  function buildChips() {
    chipsEl.innerHTML = "";
    const its = items().slice().sort((a, b) => (a.t === "dep" || a.t === "dike" ? 0 : 1) - (b.t === "dep" || b.t === "dike" ? 0 : 1) || a.lab.localeCompare(b.lab, "ko"));
    for (const e of its) {
      const b = document.createElement("button");
      b.type = "button"; b.className = "chip"; b.dataset.id = e.id;
      b.textContent = e.t === "fault" ? "단층 f" : e.t === "ero" ? "침식(부정합)" : `${e.lab} · ${ROCK[e.rock].name}`;
      b.addEventListener("click", () => pick(e.id));
      chipsEl.appendChild(b);
    }
  }
  function syncUI() {
    const ev = SC[S].ev;
    chipsEl.querySelectorAll(".chip").forEach((b) => b.setAttribute("aria-pressed", seq.includes(b.dataset.id) ? "true" : "false"));
    seqEl.textContent = seq.length ? seq.map((id) => { const e = ev.find((q) => q.id === id); return e.t === "fault" ? "단층" : e.t === "ero" ? "침식" : e.lab; }).join(" → ") : "오래된 것부터 차례로 누르세요";
    hist.disabled = !solved;
    root.querySelector(".hist-wrap").classList.toggle("dim", !solved);
    histOut.textContent = solved ? (nShow >= ev.length ? "현재" : `${nShow} / ${ev.length} 단계`) : "정답을 맞히면 열립니다";
  }
  function pick(id) {
    if (solved) return;
    const i = seq.indexOf(id);
    if (i >= 0) seq.splice(i, 1); else seq.push(id);
    fb.textContent = ""; fb.className = "feedback small";
    syncUI(); draw();
    if (seq.length === order().length) check();
  }
  function check() {
    const ok = order(), ev = SC[S].ev, why = SC[S].why;
    const i = seq.findIndex((id, k) => id !== ok[k]);
    if (i < 0) {
      solved = true; fb.className = "feedback small good";
      fb.textContent = "맞았습니다. 아래 막대를 움직여 이 단면이 만들어진 과정을 되짚어 보세요.";
      syncUI(); return;
    }
    const e = ev.find((q) => q.id === ok[i]);
    const nm = e.t === "fault" ? "단층 f" : e.t === "ero" ? "침식" : e.lab;
    fb.className = "feedback small bad";
    fb.innerHTML = `${i + 1}번째가 다릅니다. 그 자리는 <b>${nm}</b>입니다. ${why[ok[i]]}`;
    seq = seq.slice(0, i); syncUI(); draw();
  }
  function load(k) {
    S = k; seq = []; solved = false; nShow = SC[S].ev.length;
    hist.max = SC[S].ev.length; hist.value = nShow;
    root.querySelectorAll("[data-sc]").forEach((b) => b.setAttribute("aria-pressed", +b.dataset.sc === k ? "true" : "false"));
    fb.textContent = ""; buildChips(); syncUI(); render(); draw();
  }
  root.querySelectorAll("[data-sc]").forEach((b) => b.addEventListener("click", () => load(+b.dataset.sc)));
  $(".undo").addEventListener("click", () => { if (!solved) { seq.pop(); syncUI(); draw(); } });
  $(".reveal").addEventListener("click", () => {
    seq = order().slice(); solved = true; fb.className = "feedback small";
    fb.textContent = "정답 순서입니다. 막대를 움직여 한 단계씩 확인해 보세요.";
    syncUI(); draw();
  });
  hist.addEventListener("input", () => { nShow = +hist.value; syncUI(); render(); draw(); });
  cv.addEventListener("click", (ev) => {
    if (!idBuf) return;
    const r = cv.getBoundingClientRect();
    const px = Math.floor((ev.clientX - r.left) / r.width * bw), py = Math.floor((ev.clientY - r.top) / r.height * bh);
    // 선(단층·침식면)은 가늘어서 주변 몇 픽셀까지 찾아본다
    let best = -1;
    for (let rr = 0; rr <= 8 && best < 0; rr += 2) {
      for (let dy = -rr; dy <= rr && best < 0; dy += 2) for (let dx = -rr; dx <= rr; dx += 2) {
        const x = px + dx, y = py + dy; if (x < 0 || y < 0 || x >= bw || y >= bh) continue;
        const k = idBuf[y * bw + x]; if (k < 0) continue;
        const e = SC[S].ev[k]; if (rr === 0 || e.t === "fault" || e.t === "ero") { best = k; break; }
      }
    }
    if (best < 0) { const k = idBuf[py * bw + px]; if (k >= 0) best = k; }
    if (best >= 0 && SC[S].ev[best].id) pick(SC[S].ev[best].id);
  });
  load(0);
})();
