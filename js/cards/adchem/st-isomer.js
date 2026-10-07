/* 카드: C₆H₁₄로 만들 수 있는 분자는 모두 몇 가지일까? — 삼각 격자 위에 탄소 골격을 그려 이성질체 판정 */
(() => {
  const root = document.getElementById("card-adchem-isomer");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");

  /* ---------- 그래프 정규형 (탄소 7개 이하라 순열 전수 조사) ---------- */
  function perms(n, fixed) {
    const out = [], a = [...Array(n).keys()].filter((i) => i !== fixed);
    const rec = (k) => {
      if (k === a.length) { out.push(fixed >= 0 ? [fixed, ...a] : a.slice()); return; }
      for (let i = k; i < a.length; i++) { [a[k], a[i]] = [a[i], a[k]]; rec(k + 1); [a[k], a[i]] = [a[i], a[k]]; }
    };
    rec(0); return out;
  }
  const PC = {};
  function canon(n, M, fixed = -1) {
    const key = `${n},${fixed}`; const ps = PC[key] || (PC[key] = perms(n, fixed));
    let best = null;
    for (const p of ps) {
      let s = "";
      for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) s += M[p[i]][p[j]];
      if (best === null || s < best) best = s;
    }
    return `${n}:${best}`;
  }
  const mat = (n, edges) => { const M = [...Array(n)].map(() => new Array(n).fill(0)); edges.forEach(([a, b, o]) => { M[a][b] = M[b][a] = o || 1; }); return M; };

  /* ---------- 알려진 이성질체 (끓는점 °C, 1기압) ---------- */
  const ch = (n) => [...Array(n - 1)].map((_, i) => [i, i + 1]);
  const DEF = {
    C4H10: [["뷰테인", 4, ch(4), null, -0.5], ["2-메틸프로페인", 4, [[0, 1], [1, 2], [1, 3]], null, -11.7]],
    C5H12: [["펜테인", 5, ch(5), null, 36.1], ["2-메틸뷰테인", 5, [...ch(4), [1, 4]], null, 27.8], ["2,2-다이메틸프로페인", 5, [[0, 1], [1, 2], [1, 3], [1, 4]], null, 9.5]],
    C6H14: [["헥세인", 6, ch(6), null, 68.7], ["2-메틸펜테인", 6, [...ch(5), [1, 5]], null, 60.3], ["3-메틸펜테인", 6, [...ch(5), [2, 5]], null, 63.3],
      ["2,2-다이메틸뷰테인", 6, [...ch(4), [1, 4], [1, 5]], null, 49.7], ["2,3-다이메틸뷰테인", 6, [...ch(4), [1, 4], [2, 5]], null, 58.0]],
    C7H16: [["헵테인", 7, ch(7), null, 98.4], ["2-메틸헥세인", 7, [...ch(6), [1, 6]], null, 90.0], ["3-메틸헥세인", 7, [...ch(6), [2, 6]], null, 92.0],
      ["2,2-다이메틸펜테인", 7, [...ch(5), [1, 5], [1, 6]], null, 79.2], ["2,3-다이메틸펜테인", 7, [...ch(5), [1, 5], [2, 6]], null, 89.8],
      ["2,4-다이메틸펜테인", 7, [...ch(5), [1, 5], [3, 6]], null, 80.5], ["3,3-다이메틸펜테인", 7, [...ch(5), [2, 5], [2, 6]], null, 86.1],
      ["3-에틸펜테인", 7, [...ch(5), [2, 5], [5, 6]], null, 93.5], ["2,2,3-트라이메틸뷰테인", 7, [...ch(4), [1, 4], [1, 5], [2, 6]], null, 80.9]],
    C4H8: [["1-뷰텐", 4, [[0, 1, 2], [1, 2], [2, 3]], null, null], ["cis-2-뷰텐", 4, [[0, 1], [1, 2, 2], [2, 3]], "c", 3.7], ["trans-2-뷰텐", 4, [[0, 1], [1, 2, 2], [2, 3]], "t", 0.9],
      ["2-메틸프로펜", 4, [[0, 1, 2], [1, 2], [1, 3]], null, null], ["사이클로뷰테인", 4, [...ch(4), [3, 0]], null, null], ["메틸사이클로프로페인", 4, [[0, 1], [1, 2], [2, 0], [0, 3]], null, null]],
    C5H10: [["1-펜텐", 5, [[0, 1, 2], [1, 2], [2, 3], [3, 4]], null, null], ["cis-2-펜텐", 5, [[0, 1], [1, 2, 2], [2, 3], [3, 4]], "c", null], ["trans-2-펜텐", 5, [[0, 1], [1, 2, 2], [2, 3], [3, 4]], "t", null],
      ["2-메틸-1-뷰텐", 5, [[0, 1, 2], [1, 2], [2, 3], [1, 4]], null, null], ["3-메틸-1-뷰텐", 5, [[0, 1, 2], [1, 2], [2, 3], [2, 4]], null, null], ["2-메틸-2-뷰텐", 5, [[0, 1], [1, 2, 2], [2, 3], [1, 4]], null, null],
      ["사이클로펜테인", 5, [...ch(5), [4, 0]], null, null], ["메틸사이클로뷰테인", 5, [...ch(4), [3, 0], [0, 4]], null, null], ["에틸사이클로프로페인", 5, [[0, 1], [1, 2], [2, 0], [0, 3], [3, 4]], null, null],
      ["1,1-다이메틸사이클로프로페인", 5, [[0, 1], [1, 2], [2, 0], [0, 3], [0, 4]], null, null], ["1,2-다이메틸사이클로프로페인", 5, [[0, 1], [1, 2], [2, 0], [0, 3], [1, 4]], null, null]],
  };
  const KNOWN = {};
  for (const t in DEF) KNOWN[t] = DEF[t].map(([name, n, e, st, bp]) => ({ name, bp, key: canon(n, mat(n, e)) + "|" + (st || "") }));

  /* ---------- 판 상태 ---------- */
  const T = { C4H10: [4, 10], C5H12: [5, 12], C6H14: [6, 14], C7H16: [7, 16], C4H8: [4, 8], C5H10: [5, 10] };
  let target = "C6H14", atoms = [], bonds = {}, sel = -1, found = {}, lastNew = "", history = [];
  const snap = () => { history.push(JSON.stringify([atoms, bonds, sel])); if (history.length > 60) history.shift(); };
  const bkey = (a, b) => a < b ? `${a}|${b}` : `${b}|${a}`;
  let geo = { d: 40, x0: 0, y0: 0, cols: 9, rows: 6 };
  const pt = (i, j) => [geo.x0 + (i + (j % 2) * 0.5) * geo.d, geo.y0 + j * geo.d * 0.866];
  const adjacent = (a, b) => {
    const [i1, j1] = a, [i2, j2] = b;
    if (j1 === j2) return Math.abs(i1 - i2) === 1;
    if (Math.abs(j1 - j2) !== 1) return false;
    const di = i2 - i1; return j1 % 2 === 0 ? (di === -1 || di === 0) : (di === 0 || di === 1);
  };
  const atomAt = (i, j) => atoms.findIndex((a) => a && a[0] === i && a[1] === j);
  const live = () => atoms.map((a, k) => a ? k : -1).filter((k) => k >= 0);
  const bsum = (k) => Object.entries(bonds).reduce((s, [kk, o]) => { const [a, b] = kk.split("|").map(Number); return s + ((a === k || b === k) ? o : 0); }, 0);

  function analyze() {
    const ids = live(), n = ids.length;
    if (!n) return { n: 0 };
    const idx = new Map(ids.map((k, i) => [k, i])), M = [...Array(n)].map(() => new Array(n).fill(0));
    Object.entries(bonds).forEach(([kk, o]) => { const [a, b] = kk.split("|").map(Number); if (o) M[idx.get(a)][idx.get(b)] = M[idx.get(b)][idx.get(a)] = o; });
    const val = ids.map((k) => bsum(k)), over = val.some((v) => v > 4);
    const H = val.reduce((s, v) => s + 4 - v, 0);
    const seen = new Set([0]), st = [0];
    while (st.length) { const u = st.pop(); for (let v = 0; v < n; v++) if (M[u][v] && !seen.has(v)) { seen.add(v); st.push(v); } }
    const conn = seen.size === n;
    let stereo = "", amb = false;
    if (n <= 7 && conn && !over) {
      for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) if (M[a][b] === 2) {
        const side = (x, y) => {
          const subs = []; for (let v = 0; v < n; v++) if (M[x][v] && v !== y) subs.push(v);
          const h = 4 - val[x];
          if (subs.length + h !== 2) return null;
          if (h === 2) return null;
          let pick;
          if (subs.length === 1) pick = subs[0];
          else {
            const br = subs.map((s) => {
              const keep = new Set([s]), q = [s];
              while (q.length) { const u = q.pop(); for (let v = 0; v < n; v++) if (M[u][v] && v !== x && !keep.has(v)) { keep.add(v); q.push(v); } }
              const L = [...keep], sub = L.map((u) => L.map((v) => M[u][v]));
              return [L.length, canon(L.length, sub, 0)];
            });
            if (br[0][0] === br[1][0] && br[0][1] === br[1][1]) return null;
            pick = (br[0][0] > br[1][0] || (br[0][0] === br[1][0] && br[0][1] > br[1][1])) ? subs[0] : subs[1];
          }
          const P = (i) => pt(...atoms[ids[i]]), [ax, ay] = P(x), [bx, by] = P(y), [sx, sy] = P(pick);
          return (bx - ax) * (sy - ay) - (by - ay) * (sx - ax);
        };
        const s1 = side(a, b), s2 = side(b, a);
        if (s1 !== null && s2 !== null) {
          /* 두 치환기를 같은 기준선(a→b)에 대해 비교 */
          const c1 = s1, c2 = -s2;
          if (Math.abs(c1) < 1e-6 || Math.abs(c2) < 1e-6) amb = true;
          else stereo = c1 * c2 > 0 ? "c" : "t";
        }
      }
    }
    const key = (n <= 7 && conn && !over) ? canon(n, M) + "|" + stereo : null;
    return { n, H, conn, over, key, amb };
  }

  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    geo.d = Math.min(w / 9.2, 58); geo.cols = Math.floor((w - geo.d * 0.6) / geo.d); geo.rows = Math.floor((h - geo.d * 0.4) / (geo.d * 0.866));
    geo.x0 = (w - (geo.cols - 0.5) * geo.d) / 2; geo.y0 = (h - (geo.rows - 1) * geo.d * 0.866) / 2;
    ctx.fillStyle = C.rule;
    for (let j = 0; j < geo.rows; j++) for (let i = 0; i < geo.cols - (j % 2); i++) { const [x, y] = pt(i, j); ctx.beginPath(); ctx.arc(x, y, 2, 0, 7); ctx.fill(); }
    Object.entries(bonds).forEach(([kk, o]) => {
      if (!o) return;
      const [a, b] = kk.split("|").map(Number), [x1, y1] = pt(...atoms[a]), [x2, y2] = pt(...atoms[b]);
      const L = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / L, uy = (y2 - y1) / L, nx = -uy, ny = ux, pad = geo.d * 0.3;
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2;
      (o === 1 ? [0] : o === 2 ? [-3, 3] : [-5, 0, 5]).forEach((off) => { ctx.beginPath(); ctx.moveTo(x1 + ux * pad + nx * off, y1 + uy * pad + ny * off); ctx.lineTo(x2 - ux * pad + nx * off, y2 - uy * pad + ny * off); ctx.stroke(); });
    });
    const SUB = ["", "", "₂", "₃", "₄"];
    live().forEach((k) => {
      const [x, y] = pt(...atoms[k]), v = bsum(k), hh = 4 - v;
      if (k === sel) { ctx.strokeStyle = C.forest; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, geo.d * 0.3, 0, 7); ctx.stroke(); }
      ctx.fillStyle = v > 4 ? C.warn : C.ink; ctx.font = `600 ${Math.round(geo.d * 0.27)}px ${F.sans}`; ctx.textAlign = "center";
      ctx.fillText(hh > 0 ? `CH${SUB[hh]}` : "C", x, y + geo.d * 0.1);
    });
    if (!live().length) { ctx.fillStyle = C.ink3; ctx.font = `12px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("점을 눌러 탄소를 놓으세요", w / 2, h / 2 - geo.d * 0.4); }
  }
  function update() {
    root.querySelectorAll("[data-t]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.t === target)));
    const a = analyze(), st = $(".status"), [tn, th] = T[target], list = KNOWN[target];
    if (!a.n) st.innerHTML = `분자식 ${target.replace(/(\d+)/g, (m) => m.split("").map((d) => "₀₁₂₃₄₅₆₇₈₉"[d]).join(""))}의 이성질체를 그려 보세요.`;
    else if (a.over) st.innerHTML = `<b class="bad">결합이 5개 이상인 탄소가 있습니다.</b>`;
    else if (!a.conn) st.innerHTML = `탄소들이 하나로 이어져 있지 않습니다. 사이를 눌러 결합을 만드세요.`;
    else {
      const fm = `C${a.n}H${a.H}`;
      if (fm !== target) st.innerHTML = `그린 분자: <b>${fm}</b> — 목표 분자식과 다릅니다.`;
      else if (a.amb) st.innerHTML = `분자식은 맞습니다. 이중 결합 양쪽 결합을 일직선이 아니라 꺾어서 그려야 cis·trans를 판정할 수 있습니다.`;
      else {
        const hit = list.find((x) => x.key === a.key);
        if (!hit) st.innerHTML = `분자식은 맞지만 목록에서 찾지 못했습니다.`;
        else if (found[target] && found[target].includes(hit.name) && lastNew !== hit.name) st.innerHTML = `<b>${hit.name}</b> — 이미 찾은 분자입니다. 모양만 다르게 그렸을 뿐 같은 분자입니다.`;
        else {
          (found[target] = found[target] || []); if (!found[target].includes(hit.name)) { found[target].push(hit.name); lastNew = hit.name; }
          st.innerHTML = `<b class="good" style="color:var(--forest)">새 이성질체: ${hit.name}</b>${hit.bp !== null ? ` · 끓는점 ${hit.bp} °C` : ""}`;
        }
      }
    }
    const fl = found[target] || [];
    $(".cnt").textContent = `찾은 이성질체 ${fl.length} / ${list.length}${target === "C5H10" ? " (1,2-다이메틸사이클로프로페인의 cis·trans는 하나로 셈)" : ""}`;
    $(".found").innerHTML = list.filter((x) => fl.includes(x.name)).map((x) => `<li class="${x.name === lastNew ? "new" : ""}">${x.name}${x.bp !== null ? " " + x.bp + " °C" : ""}</li>`).join("");
    draw();
  }
  cv.addEventListener("click", (e) => {
    const r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top, d = geo.d;
    lastNew = "";
    /* 결합 중점 먼저 */
    const ids = live();
    for (let p = 0; p < ids.length; p++) for (let q = p + 1; q < ids.length; q++) {
      const A = atoms[ids[p]], B = atoms[ids[q]]; if (!adjacent(A, B)) continue;
      const [x1, y1] = pt(...A), [x2, y2] = pt(...B);
      if (Math.hypot(x - (x1 + x2) / 2, y - (y1 + y2) / 2) < d * 0.2) { snap(); const k = bkey(ids[p], ids[q]); bonds[k] = ((bonds[k] || 0) + 1) % 4; if (!bonds[k]) delete bonds[k]; update(); return; }
    }
    let bi = -1, bj = -1, bd = d * 0.36;
    for (let j = 0; j < geo.rows; j++) for (let i = 0; i < geo.cols - (j % 2); i++) { const [px, py] = pt(i, j), dd = Math.hypot(x - px, y - py); if (dd < bd) { bd = dd; bi = i; bj = j; } }
    if (bi < 0) return;
    const k = atomAt(bi, bj);
    snap();
    if (k >= 0) {
      if (k === sel) { atoms[k] = null; Object.keys(bonds).forEach((kk) => { if (kk.split("|").map(Number).includes(k)) delete bonds[kk]; }); sel = -1; }
      else sel = k;
    } else {
      if (live().length >= 8) { history.pop(); $(".status").textContent = "탄소는 8개까지만 놓을 수 있습니다."; return; }
      atoms.push([bi, bj]); const nk = atoms.length - 1;
      if (sel >= 0 && atoms[sel] && adjacent(atoms[sel], [bi, bj])) bonds[bkey(sel, nk)] = 1;
      sel = nk;
    }
    update();
  });
  $(".wipe").addEventListener("click", () => { snap(); atoms = []; bonds = {}; sel = -1; lastNew = ""; update(); });
  $(".undo").addEventListener("click", () => { const s = history.pop(); if (!s) return; [atoms, bonds, sel] = JSON.parse(s); lastNew = ""; update(); });
  root.querySelectorAll("[data-t]").forEach((b) => b.addEventListener("click", () => { target = b.dataset.t; atoms = []; bonds = {}; sel = -1; lastNew = ""; history = []; update(); }));
  if (/[?&]demo\b/.test(location.search)) {
    found.C6H14 = ["헥세인", "2-메틸펜테인"];
    atoms = [[1, 2], [1, 1], [2, 2], [2, 1], [3, 2], [2, 3]];
    bonds = { "0|1": 1, "1|2": 1, "2|3": 1, "3|4": 1, "2|5": 1 }; sel = 4;
  }
  update();
})();
