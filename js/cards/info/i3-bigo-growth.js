/* 카드: 빠른 컴퓨터를 사면 느린 알고리즘을 따라잡을 수 있을까? — 증가율 비교와 상수 계수 */
(() => {
  const root = document.getElementById("card-info-bigo-growth");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const sN = $(".n"), sS = $(".s"), sA = $(".a"), sB = $(".b");
  const L2 = Math.log2;
  /* 연산 수의 log10 (2ⁿ은 직접 계산하면 넘치므로 로그로) */
  const FNS = [
    { lab: "log₂ n", col: "#8d8d92", lg: (n) => Math.log10(Math.max(L2(n), 1)) },
    { lab: "n", col: C.forest, lg: (n) => Math.log10(n) },
    { lab: "n log₂ n", col: "#3f74b5", lg: (n) => Math.log10(n * Math.max(L2(n), 1)) },
    { lab: "n²", col: C.amber, lg: (n) => 2 * Math.log10(n) },
    { lab: "2ⁿ", col: C.warn, lg: (n) => n * Math.log10(2) },
  ];
  const sup = (k) => String(k).split("").map((d) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[+d] || d).join("");
  const fmtN = (n) => n < 1e4 ? n.toLocaleString() : Math.abs(Math.log10(n) - Math.round(Math.log10(n))) < 0.005 ? "10" + sup(Math.round(Math.log10(n))) : n.toLocaleString();

  /* 초(로그값) → 사람이 읽는 시간 */
  const p2 = (v) => Number(v.toPrecision(2)).toLocaleString();
  function human(lgSec) {
    const s = 10 ** lgSec;
    if (lgSec < -6) return p2(s * 1e9) + " ns";
    if (lgSec < -3) return p2(s * 1e6) + " µs";
    if (lgSec < 0) return p2(s * 1e3) + " ms";
    if (s < 60) return p2(s) + " 초";
    if (s < 3600) return p2(s / 60) + " 분";
    if (s < 86400) return p2(s / 3600) + " 시간";
    if (s < 3.156e7) return p2(s / 86400) + " 일";
    const yr = lgSec - Math.log10(3.156e7);
    if (yr < 4) return Math.round(10 ** yr).toLocaleString() + " 년";
    const age = yr - Math.log10(1.38e10);
    if (age < 0) return "약 10" + sup(Math.floor(yr)) + " 년";
    return "우주 나이의 약 10" + sup(Math.floor(age)) + "배";
  }

  const cv = fit($("canvas"), () => draw());
  let mode = "g";

  function update() {
    const n = Math.round(10 ** +sN.value), sp = +sS.value;
    $(".n-out").textContent = fmtN(n);
    $(".s-out").textContent = "10" + sup(sp) + " 번";
    $(".res").innerHTML = `<table><thead><tr><th>f(n)</th><th class="t">연산 수</th><th class="t">걸리는 시간</th></tr></thead><tbody>${
      FNS.map((f) => {
        const lg = f.lg(n), ops = lg < 15 ? Math.round(10 ** lg).toLocaleString() : "10" + sup(Math.floor(lg)) + " 이상";
        const over = lg - sp > 0;
        return `<tr><td><i style="background:${f.col}"></i>${f.lab}</td><td class="t">${ops}</td><td class="t${over ? " bad" : ""}">${human(lg - sp)}</td></tr>`;
      }).join("")}</tbody></table>`;
    const a = +sA.value, b = +sB.value;
    $(".a-out").textContent = a; $(".b-out").textContent = b;
    // A = a n log n, B = b n² 같아지는 n: b n = a log2 n (n > 2)
    let x = null;
    for (let m = 2; m <= 1e7; m *= 1.001) if (b * m >= a * L2(m)) { x = m; break; }
    $(".n-x").textContent = x ? "약 " + Math.round(x).toLocaleString() : "—";
    const A100 = a * 100 * L2(100), B100 = b * 1e4;
    $(".n-100").textContent = A100 < B100 ? "A (n log n)" : A100 > B100 ? "B (n²)" : "같음";
    $(".n-big").textContent = Math.round((b * 1e12) / (a * 1e6 * L2(1e6))).toLocaleString() + "배";
    draw();
  }

  function draw() {
    const { ctx } = cv, { w, h } = cv.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const box = { x0: 46, y0: 22, w: w - 62, h: h - 58 };
    const xMax = mode === "g" ? 6 : 6, yMax = mode === "g" ? 18 : 15;
    const X = (lgn) => box.x0 + lgn / xMax * box.w, Y = (lgy) => box.y0 + box.h - lgy / yMax * box.h;
    const yt = []; for (let k = 0; k <= yMax; k += 3) yt.push([k, k ? "10" + sup(k) : "1"]);
    NM.axes(ctx, { ...box, X, Y, xt: [0, 1, 2, 3, 4, 5, 6].map((k) => [k, k ? "10" + sup(k) : "1"]), yt, xlabel: "n", ylabel: mode === "g" ? "연산 수" : "연산 수 (A, B)" });
    ctx.save(); ctx.beginPath(); ctx.rect(box.x0, box.y0 - 4, box.w, box.h + 4); ctx.clip();
    const curve = (lg, col, width, dash) => {
      ctx.strokeStyle = col; ctx.lineWidth = width; ctx.setLineDash(dash || []); ctx.beginPath();
      let started = false;
      for (let i = 0; i <= 400; i++) {
        const t = xMax * i / 400, v = lg(10 ** t);
        if (v > yMax + 1) { if (started) { ctx.lineTo(X(t), Y(yMax + 1)); } break; }
        started ? ctx.lineTo(X(t), Y(v)) : ctx.moveTo(X(t), Y(v)); started = true;
      }
      ctx.stroke(); ctx.setLineDash([]);
    };
    if (mode === "g") {
      for (const f of FNS) curve(f.lg, f.col, 2);
      const sp = +sS.value;
      ctx.strokeStyle = C.ink3; ctx.setLineDash([2, 4]); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(box.x0, Y(sp)); ctx.lineTo(box.x0 + box.w, Y(sp)); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(X(+sN.value), box.y0); ctx.lineTo(X(+sN.value), box.y0 + box.h); ctx.stroke(); ctx.setLineDash([]);
      ctx.restore();
      ctx.fillStyle = C.ink2; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "right";
      ctx.fillText("1초 안에 끝나는 한계", box.x0 + box.w - 4, Y(sp) - 4);
      // 곡선 이름 (오른쪽 끝)
      ctx.textAlign = "left"; ctx.font = `11px ${F.mono}`;
      const used = [];
      for (const f of FNS) {
        let t = xMax, v = f.lg(10 ** t);
        if (v > yMax) { t = 0; while (f.lg(10 ** t) < yMax - 0.6) t += 0.005; v = f.lg(10 ** t); }
        let y = Y(Math.min(v, yMax - 0.3));
        while (used.some((u) => Math.abs(u - y) < 12)) y += 12;
        used.push(y);
        ctx.fillStyle = f.col;
        const tx = Math.min(X(t) + 4, box.x0 + box.w - ctx.measureText(f.lab).width - 2);
        ctx.fillText(f.lab, f.lab === "2ⁿ" ? X(t) + 5 : tx, f.lab === "2ⁿ" ? Y(yMax) + 12 : y - 4);
      }
    } else {
      const a = +sA.value, b = +sB.value;
      const lgA = (n) => Math.log10(a * n * Math.max(L2(n), 1)), lgB = (n) => Math.log10(b * n * n);
      curve(lgA, "#3f74b5", 2.2); curve(lgB, C.amber, 2.2);
      ctx.restore();
      let x = null;
      for (let m = 2; m <= 1e6; m *= 1.001) if (b * m >= a * L2(m)) { x = m; break; }
      if (x) {
        const px = X(Math.log10(x)), py = Y(lgB(x));
        ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2); ctx.fill();
        ctx.font = `11px ${F.sans}`; ctx.textAlign = px > box.x0 + box.w * 0.6 ? "right" : "left";
        ctx.fillText(`n ≈ ${Math.round(x).toLocaleString()}부터 A가 빠름`, px + (ctx.textAlign === "left" ? 8 : -8), py + 16);
      }
      ctx.textAlign = "left"; ctx.font = `11px ${F.mono}`;
      ctx.fillStyle = "#3f74b5"; ctx.fillText(`A: ${a} × n log₂ n`, box.x0 + 8, box.y0 + 12);
      ctx.fillStyle = C.amber; ctx.fillText(`B: ${b} × n²`, box.x0 + 8, box.y0 + 28);
    }
  }

  [sN, sS, sA, sB].forEach((s) => s.addEventListener("input", update));
  root.querySelectorAll(".mode .chip").forEach((b) => b.addEventListener("click", () => {
    root.querySelectorAll(".mode .chip").forEach((c) => c.setAttribute("aria-pressed", String(c === b)));
    mode = b.dataset.m; root.dataset.mode = mode; update();
  }));
  if (window.NMLab && NMLab.demo) {
    sN.value = 2;
    if (/[?&]m=c/.test(location.search)) { mode = "c"; root.dataset.mode = "c"; root.querySelectorAll(".mode .chip").forEach((c) => c.setAttribute("aria-pressed", String(c.dataset.m === "c"))); }
  }
  update();
})();
