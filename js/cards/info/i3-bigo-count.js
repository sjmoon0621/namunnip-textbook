/* 카드: 입력이 두 배가 되면 연산은 몇 배가 될까? — 실제 실행으로 연산 횟수를 세고 빅오를 추정 */
(() => {
  const root = document.getElementById("card-info-bigo-count");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const pre = $("pre.code");
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  /* 각 알고리즘: 파이썬 코드, 센 줄(0부터), n 목록, 실행 함수(배열 → 연산 수) */
  const ALG = {
    lin: {
      code: ["def linear_search(a, x):", "    for i in range(len(a)):", "        if a[i] == x:", "            return i", "    return -1"],
      line: 2, ns: [1000, 2000, 4000, 8000, 16000, 32000],
      run(a) { let c = 0; const x = -1; for (let i = 0; i < a.length; i++) { c++; if (a[i] === x) return c; } return c; },
    },
    bin: {
      code: ["def binary_search(a, x):", "    lo, hi = 0, len(a) - 1", "    while lo <= hi:", "        mid = (lo + hi) // 2", "        if a[mid] == x:", "            return mid", "        elif a[mid] < x:", "            lo = mid + 1", "        else:", "            hi = mid - 1", "    return -1"],
      line: 4, ns: [1000, 2000, 4000, 8000, 16000, 32000], sorted: true,
      run(a) {
        let c = 0, lo = 0, hi = a.length - 1; const x = a.length + 0.5;
        while (lo <= hi) { const mid = (lo + hi) >> 1; c++; if (a[mid] === x) return c; if (a[mid] < x) lo = mid + 1; else hi = mid - 1; }
        return c;
      },
    },
    bub: {
      code: ["def bubble_sort(a):", "    n = len(a)", "    for i in range(n - 1):", "        swapped = False", "        for j in range(n - 1 - i):", "            if a[j] > a[j + 1]:", "                a[j], a[j + 1] = a[j + 1], a[j]", "                swapped = True", "        if not swapped:", "            break"],
      line: 5, ns: [100, 200, 400, 800, 1600, 3200],
      run(a) {
        let c = 0; const n = a.length;
        for (let i = 0; i < n - 1; i++) {
          let sw = false;
          for (let j = 0; j < n - 1 - i; j++) { c++; if (a[j] > a[j + 1]) { const t = a[j]; a[j] = a[j + 1]; a[j + 1] = t; sw = true; } }
          if (!sw) break;
        }
        return c;
      },
    },
    mrg: {
      code: ["def merge_sort(a):", "    if len(a) <= 1:", "        return a", "    mid = len(a) // 2", "    L, R = merge_sort(a[:mid]), merge_sort(a[mid:])", "    out, i, j = [], 0, 0", "    while i < len(L) and j < len(R):", "        if L[i] <= R[j]:", "            out.append(L[i])", "            i += 1", "        else:", "            out.append(R[j])", "            j += 1", "    return out + L[i:] + R[j:]"],
      line: 7, ns: [1000, 2000, 4000, 8000, 16000, 32000],
      run(a) {
        let c = 0;
        const ms = (v) => {
          if (v.length <= 1) return v;
          const m = v.length >> 1, L = ms(v.slice(0, m)), R = ms(v.slice(m)), out = [];
          let i = 0, j = 0;
          while (i < L.length && j < R.length) { c++; if (L[i] <= R[j]) out.push(L[i++]); else out.push(R[j++]); }
          return out.concat(L.slice(i), R.slice(j));
        };
        ms(a); return c;
      },
    },
    sub: {
      code: ["def subset_sum(a, target):", "    n = len(a)", "    for mask in range(2 ** n):", "        s = sum(a[k] for k in range(n) if mask >> k & 1)", "        if s == target:", "            return True", "    return False"],
      line: 4, ns: [10, 12, 14, 16, 18, 20],
      run(a) {
        const n = a.length; let c = 0; const target = -1;
        for (let mask = 0; mask < (1 << n); mask++) {
          let s = 0; for (let k = 0; k < n; k++) if ((mask >> k) & 1) s += a[k];
          c++; if (s === target) return c;
        }
        return c;
      },
    },
  };
  const FN = {
    log: [(n) => Math.log2(n), "log₂ n"], n: [(n) => n, "n"], nlog: [(n) => n * Math.log2(n), "n log₂ n"],
    n2: [(n) => n * n, "n²"], exp: [(n) => 2 ** n, "2ⁿ"],
  };
  let alg = "bub", inp = "rand", hyp = "n", rows = [];

  function makeInput(n) {
    const a = Array.from({ length: n }, (_, i) => i);
    if (ALG[alg].sorted || inp === "sorted") return a;
    if (inp === "rev") return a.reverse();
    let s = 12345;
    for (let i = n - 1; i > 0; i--) { s = (s * 1103515245 + 12345) % 2147483648; const j = s % (i + 1); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }

  function run() {
    const A = ALG[alg];
    pre.innerHTML = A.code.map((l, i) => `<span class="l${i === A.line ? " on" : ""}">${esc(l)}</span>`).join("");
    rows = A.ns.map((n) => {
      const a = makeInput(n);
      const t0 = performance.now(); const c = A.run(a); const t = performance.now() - t0;
      return { n, c, t };
    });
    render();
  }

  const fmtR = (v) => v >= 100 ? v.toFixed(0) : v >= 10 ? v.toFixed(1) : v >= 0.01 ? v.toFixed(3) : v.toExponential(1);
  function render() {
    const f = FN[hyp][0], stepLab = alg === "sub" ? "n+2일 때 배수" : "2n일 때 배수";
    const ratios = rows.map((r) => r.c / f(r.n));
    $(".res").innerHTML = `<table><thead><tr><th>n</th><th>연산 수</th><th>${stepLab}</th><th>연산/${FN[hyp][1]}</th><th>시간 (ms)</th></tr></thead><tbody>${
      rows.map((r, i) => `<tr><td>${r.n.toLocaleString()}</td><td>${r.c.toLocaleString()}</td><td>${i ? (r.c / rows[i - 1].c).toFixed(2) : "—"}</td><td>${fmtR(ratios[i])}</td><td>${r.t.toFixed(1)}</td></tr>`).join("")}</tbody></table>`;
    draw();
  }

  const cv = fit($("canvas"), () => draw());
  function draw() {
    const { ctx } = cv, { w, h } = cv.size; if (!w || !rows.length) return;
    ctx.clearRect(0, 0, w, h);
    const f = FN[hyp][0];
    const nMax = rows[rows.length - 1].n, cMax = Math.max(...rows.map((r) => r.c));
    const cfit = rows[rows.length - 1].c / f(nMax);
    const box = { x0: 62, y0: 24, w: w - 78, h: h - 62 };
    const xr = alg === "sub" ? [8, nMax] : [0, nMax];
    const yr = [0, cMax * 1.12];
    const X = (v) => box.x0 + (v - xr[0]) / (xr[1] - xr[0]) * box.w, Y = (v) => box.y0 + box.h - (v - yr[0]) / (yr[1] - yr[0]) * box.h;
    const tk = (lo, hi, k) => NMLab.ticks(lo, hi, k);
    const lab = (v) => v >= 1e6 ? (v / 1e6).toLocaleString() + "M" : v >= 1e3 ? (v / 1e3).toLocaleString() + "k" : String(v);
    NM.axes(ctx, { ...box, X, Y, xt: tk(xr[0], xr[1], 5).map((v) => [v, lab(v)]), yt: tk(0, yr[1], 4).map((v) => [v, lab(v)]), xlabel: "입력 크기 n", ylabel: "센 연산 수" });
    ctx.save(); ctx.beginPath(); ctx.rect(box.x0, box.y0, box.w, box.h); ctx.clip();
    ctx.strokeStyle = C.ink3; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.6; ctx.beginPath();
    for (let i = 0; i <= 120; i++) { const n = xr[0] + (xr[1] - xr[0]) * i / 120, y = cfit * f(Math.max(n, 1)); i ? ctx.lineTo(X(n), Y(y)) : ctx.moveTo(X(n), Y(y)); }
    ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.forest;
    for (const r of rows) { ctx.beginPath(); ctx.arc(X(r.n), Y(r.c), 4, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
    ctx.font = `11px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillStyle = C.forest; ctx.fillText("● 실제로 센 연산 수", box.x0 + 8, box.y0 + 14);
    ctx.fillStyle = C.ink2; ctx.fillText(`- - 예상 ${fmtR(cfit)} × ${FN[hyp][1]} (가장 큰 n에 맞춤)`, box.x0 + 8, box.y0 + 30);
  }

  const group = (sel, key, cb) => root.querySelectorAll(sel + " .chip").forEach((b) => b.addEventListener("click", () => {
    root.querySelectorAll(sel + " .chip").forEach((c) => c.setAttribute("aria-pressed", String(c === b)));
    cb(b.dataset[key]);
  }));
  group(".alg", "a", (v) => { alg = v; run(); });
  group(".inp", "i", (v) => { inp = v; run(); });
  group(".hyp", "f", (v) => { hyp = v; render(); });
  if (window.NMLab && NMLab.demo) {
    hyp = "n2";
    root.querySelectorAll(".hyp .chip").forEach((c) => c.setAttribute("aria-pressed", String(c.dataset.f === "n2")));
  }
  run();
})();
