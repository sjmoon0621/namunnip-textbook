/* 카드: 분수를 차로 쪼개면 무엇이 남을까? — 1/(k(k+1)), 1/(k(k+2)), 1/(√(k+1)+√k)를 차로 쪼개 이웃 항 지우기 */
(() => {
  const root = document.getElementById("card-alg-sum-telescope");
  if (!root) return;
  const { C, F, fit } = NM;
  const S = NMSeq;
  const $ = (s) => root.querySelector(s), btns = [...root.querySelectorAll(".presets .chip")];
  const sn = $(".n");
  let mode = "1";
  /* 분수 [p, q] 덧셈 */
  const add = ([a, b], [c, d]) => { const p = a * d + c * b, q = b * d, g = S.gcd(p, q) || 1; return [p / g, q / g]; };
  /* 줄 k의 [앞, 뒤] 글자, 지워지는지 판단에 쓰는 값 */
  const M = {
    "1": { gap: 1, coef: "", f: (k) => [`1/${k}`, `1/${k + 1}`], key: (k) => [k, k + 1], term: (k) => [1, k * (k + 1)], lim: 1 },
    "2": { gap: 2, coef: "½(", f: (k) => [`1/${k}`, `1/${k + 2}`], key: (k) => [k, k + 2], term: (k) => [1, k * (k + 2)], lim: 0.75 },
    r: { gap: 1, coef: "", f: (k) => [`√${k + 1}`, `√${k}`], key: (k) => [k + 1, k], term: null, lim: null },
  };
  const { ctx, size } = fit($("canvas"), () => draw());
  const lineOf = (m, k) => { const [a, b] = m.f(k); return m.coef ? `½(${a} − ${b})` : `${a} − ${b}`; };

  function survivors(m, n) {
    /* 앞쪽 값 집합과 뒤쪽 값 집합에서 짝이 없는 것 */
    const fr = [], bk = [];
    for (let k = 1; k <= n; k++) { const [a, b] = m.key(k); fr.push([a, k]); bk.push([b, k]); }
    const fs = fr.filter(([v]) => !bk.some(([u]) => u === v)), bs = bk.filter(([v]) => !fr.some(([u]) => u === v));
    return { fs, bs, fr, bk };
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const m = M[mode], n = +sn.value, fs = w < 380 ? 12 : 13.5, rh = Math.min(30, (h - 70) / 6.5);
    const xL = 16, xA = w * 0.36, xB = w * 0.62, y = (k) => 10 + rh * (k - 0.5);
    const { fs: F1, bs: B1 } = survivors(m, n);
    ctx.textBaseline = "middle";
    for (let k = 1; k <= n; k++) {
      const [a, b] = m.f(k), [ka, kb] = m.key(k), aLive = F1.some(([v]) => v === ka), bLive = B1.some(([v]) => v === kb);
      S.rich(ctx, `k=${k}`, xL, y(k), { size: 11, family: F.mono, col: C.ink3 });
      const pre = m.coef ? "½(" : "", post = m.coef ? ")" : "";
      S.rich(ctx, pre, xA - 30, y(k), { size: fs, family: F.mono, col: C.ink2, align: "right" });
      S.rich(ctx, a, xA, y(k), { size: fs, family: F.mono, weight: 600, col: aLive ? C.warn : C.ink3, align: "center" });
      S.rich(ctx, "−", (xA + xB) / 2, y(k), { size: fs, family: F.mono, col: C.ink2, align: "center" });
      S.rich(ctx, b + post, xB, y(k), { size: fs, family: F.mono, weight: 600, col: bLive ? C.warn : C.ink3, align: "center" });
      if (!bLive) { /* 뒤쪽 수가 gap줄 아래의 앞쪽 수와 지워짐 */
        const k2 = mode === "r" ? k - 1 : k + m.gap, dy = k2 > k ? 7 : -7;
        ctx.strokeStyle = mode === "2" && k % 2 ? S.BLUE : C.forest; ctx.lineWidth = 1.2; ctx.setLineDash([3, 3]);
        ctx.beginPath(); ctx.moveTo(xB - 14, y(k) + dy); ctx.lineTo(xA + 14, y(k2) - dy); ctx.stroke(); ctx.setLineDash([]);
      }
      [[xA, aLive], [xB, bLive]].forEach(([x, live]) => { if (!live) { ctx.strokeStyle = C.ink3; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(x - 16, y(k) + 5); ctx.lineTo(x + 16, y(k) - 5); ctx.stroke(); } });
    }
    /* 아래 띠: 부분합의 크기 */
    const val = mode === "r" ? Math.sqrt(n + 1) - 1 : (() => { let s = 0; for (let k = 1; k <= n; k++) { const [p, q] = m.term(k); s += p / q; } return s; })();
    const top = mode === "r" ? Math.sqrt(7) - 1 : m.lim, bx = 16, bw = w - 32, by = h - 34;
    ctx.fillStyle = C.rule; ctx.fillRect(bx, by, bw, 12);
    ctx.fillStyle = C.leaf; ctx.fillRect(bx, by, bw * val / top, 12);
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "left"; ctx.fillText("0", bx, by + 24);
    ctx.textAlign = "right"; ctx.fillText(mode === "r" ? "√7 − 1" : mode === "1" ? "1" : "3/4", bx + bw, by + 24);
    S.tag(ctx, `합 ≈ ${S.n(val)}`, Math.min(bx + bw - 40, Math.max(bx + 40, bx + bw * val / top)), by - 10, C.forest, "center", 11);
  }

  function update() {
    const m = M[mode], n = +sn.value;
    $(".n-out").textContent = n;
    const { fs, bs } = survivors(m, n);
    if (mode === "r") {
      $(".v-s").textContent = `≈ ${S.n(Array.from({ length: n }, (_, i) => 1 / (Math.sqrt(i + 2) + Math.sqrt(i + 1))).reduce((a, b) => a + b, 0))}`;
      $(".v-r").textContent = `√${n + 1} − √1`; $(".v-f").textContent = `≈ ${S.n(Math.sqrt(n + 1) - 1)}`;
    } else {
      let s = [0, 1]; for (let k = 1; k <= n; k++) s = add(s, m.term(k));
      $(".v-s").textContent = S.fr(s[0], s[1]);
      const live = [...fs.map(([v]) => [1, v]), ...bs.map(([v]) => [-1, v])];
      $(".v-r").textContent = (m.coef ? "½(" : "") + live.map(([sg, v], i) => `${i ? (sg > 0 ? " + " : " − ") : ""}1/${v}`).join("") + (m.coef ? ")" : "");
      let r = [0, 1]; live.forEach(([sg, v]) => { r = add(r, [sg, v]); }); if (m.coef) r = [r[0], r[1] * 2];
      $(".v-f").textContent = S.fr(r[0], r[1]);
    }
    draw();
  }
  btns.forEach((b) => b.addEventListener("click", () => { mode = b.dataset.m; btns.forEach((x) => x.setAttribute("aria-pressed", String(x === b))); update(); }));
  sn.addEventListener("input", update);
  update();
})();
