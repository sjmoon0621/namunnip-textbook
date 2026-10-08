/* 카드: 행렬의 곱은 왜 행과 열을 짝지어 계산할까? — 결과 칸을 골라 행·열의 곱의 합 확인, AB와 BA 비교 */
(() => {
  const root = document.getElementById("card-cm1-matrix-mult");
  if (!root) return;
  const { C, F, fit } = NM;
  const X = NMMat;
  const $ = (s) => root.querySelector(s), shapes = [...root.querySelectorAll(".shape .chip")], cv = $("canvas");
  const sv = $(".v"), swap = $(".go-swap");
  const full = { A: [[3, 2], [1, 4]], B: [[2, 3], [3, 2]] };
  let dim = { A: [2, 2], B: [2, 2] }, ba = false, ri = 0, rj = 0, ed = { m: "A", i: 0, j: 0 }, hit = [];
  const { ctx, size } = fit(cv, () => draw());

  const get = (m) => full[m].slice(0, dim[m][0]).map((r) => r.slice(0, dim[m][1]));
  const order = () => (ba ? ["B", "A"] : ["A", "B"]);
  const prod = () => { const [l, r] = order(); return X.mul(get(l), get(r)); };

  function grid(M, x, y, cs, color, mark) {
    const R = M.length, K = M[0].length;
    if (mark) mark(x, y);
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    for (let i = 0; i < R; i++) for (let j = 0; j < K; j++) {
      ctx.font = `600 ${Math.round(Math.min(17, cs * 0.42))}px ${F.mono}`; ctx.fillStyle = color(i, j);
      ctx.fillText(X.n(M[i][j]), x + (j + 0.5) * cs, y + (i + 0.5) * cs);
    }
    X.paren(ctx, x - 7, y - 2, K * cs + 14, R * cs + 4, C.ink);
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h); hit = [];
    const [ln, rn] = order(), L = get(ln), R = get(rn), P = X.mul(L, R);
    const cols = L[0].length + R[0].length + (P ? P[0].length : 0);
    const gaps = 20 + 20 + (P ? 34 + 20 : 0);
    const cs = Math.max(26, Math.min(48, (w - 24 - gaps) / cols, (h - 92) / 2));
    const tot = cs * cols + gaps, rows = Math.max(L.length, R.length);
    let x = (w - tot) / 2 + 10;
    const yTop = Math.max(30, (h - rows * cs - 56) / 2 + 12), cy = yTop + rows * cs / 2;
    const place = (M) => cy - M.length * cs / 2;
    const lab = (t, x0, M) => { ctx.font = `600 11.5px ${F.sans}`; ctx.fillStyle = C.ink2; ctx.textAlign = "center"; ctx.textBaseline = "alphabetic"; ctx.fillText(`${t} (${X.size(M)})`, x0 + M[0].length * cs / 2, yTop - 12); };
    const editMark = (m, x0, y0) => { if (ed.m !== m) return; ctx.setLineDash([3, 3]); ctx.strokeStyle = C.ink; ctx.lineWidth = 1.3; ctx.strokeRect(x0 + ed.j * cs + 3, y0 + ed.i * cs + 3, cs - 6, cs - 6); ctx.setLineDash([]); };
    const band = (x0, y0, ww, hh, col) => { ctx.globalAlpha = 0.3; ctx.fillStyle = col; ctx.fillRect(x0, y0, ww, hh); ctx.globalAlpha = 1; };

    const xL = x, yL = place(L);
    lab(ln, xL, L);
    grid(L, xL, yL, cs, (i) => (P && i === ri ? C.warn : C.ink), (x0, y0) => { if (P) band(x0, y0 + ri * cs, L[0].length * cs, cs, C.amber); editMark(ln, x0, y0); });
    hit.push({ m: ln, x: xL, y: yL, cs, R: L.length, K: L[0].length });
    x += L[0].length * cs + 20;
    const xR = x, yR = place(R);
    lab(rn, xR, R);
    grid(R, xR, yR, cs, (i, j) => (P && j === rj ? C.forest : C.ink), (x0, y0) => { if (P) band(x0 + rj * cs, y0, cs, R.length * cs, C.leaf); editMark(rn, x0, y0); });
    hit.push({ m: rn, x: xR, y: yR, cs, R: R.length, K: R[0].length });
    x += R[0].length * cs + 20;

    const yB = yTop + rows * cs + 24;
    ctx.textBaseline = "middle"; ctx.textAlign = "center";
    if (!P) {
      ctx.font = `600 ${w < 400 ? 12 : 13}px ${F.sans}`; ctx.fillStyle = C.warn;
      ctx.fillText(`${ln}의 열의 수 ${L[0].length} ≠ ${rn}의 행의 수 ${R.length}`, w / 2, yB + 4);
      ctx.fillText(`→ ${ln}${rn}는 정의되지 않습니다`, w / 2, yB + 24);
      return;
    }
    ctx.font = `600 18px ${F.mono}`; ctx.fillStyle = C.ink2; ctx.fillText("=", x + 7, cy);
    x += 34;
    const xP = x, yP = place(P);
    lab(ln + rn, xP, P);
    grid(P, xP, yP, cs, (i, j) => (i === ri && j === rj ? C.ink : C.ink3), (x0, y0) => {
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2.2; ctx.strokeRect(x0 + rj * cs + 2, y0 + ri * cs + 2, cs - 4, cs - 4);
    });
    hit.push({ m: "P", x: xP, y: yP, cs, R: P.length, K: P[0].length });

    const segs = [[`(${ri + 1}, ${rj + 1}) 성분 = `, C.ink2]];
    L[ri].forEach((v, k) => {
      if (k) segs.push([" + ", C.ink2]);
      segs.push([X.n(v), C.warn], ["·", C.ink3], [X.n(R[k][rj]), C.forest]);
    });
    segs.push([` = ${X.n(P[ri][rj])}`, C.ink]);
    ctx.font = `600 ${w < 400 ? 13 : 15}px ${F.mono}`;
    const tw = segs.reduce((s, [t]) => s + ctx.measureText(t).width, 0);
    let tx = (w - tw) / 2; ctx.textAlign = "left";
    for (const [t, c] of segs) { ctx.fillStyle = c; ctx.fillText(t, tx, yB + 10); tx += ctx.measureText(t).width; }
  }

  function update() {
    const [ln, rn] = order(), P = prod();
    if (P) { ri = Math.min(ri, P.length - 1); rj = Math.min(rj, P[0].length - 1); }
    ed.i = Math.min(ed.i, dim[ed.m][0] - 1); ed.j = Math.min(ed.j, dim[ed.m][1] - 1);
    sv.value = full[ed.m][ed.i][ed.j];
    $(".e-name").textContent = `${ed.m}의 (${ed.i + 1}, ${ed.j + 1}) 성분`;
    $(".v-out").textContent = X.n(+sv.value);
    if (P) {
      const L = get(ln), R = get(rn);
      const terms = L[ri].map((v, k) => `${X.n(v)}·${X.n(R[k][rj])}`).join(" + ");
      $(".eq").innerHTML = `${ln}${rn} = ${X.html(P)} &nbsp; (${ri + 1}, ${rj + 1}) 성분: ${ln}의 제${ri + 1}행 · ${rn}의 제${rj + 1}열 = ${terms} = ${X.n(P[ri][rj])}`;
    } else $(".eq").innerHTML = `${ln}${rn}는 정의되지 않습니다. 앞 행렬의 열의 수와 뒤 행렬의 행의 수가 같아야 합니다.`;
    const AB = X.mul(get("A"), get("B")), BA = X.mul(get("B"), get("A"));
    $(".n-ab").textContent = AB ? X.size(AB) : "정의 안 됨";
    $(".n-ba").textContent = BA ? X.size(BA) : "정의 안 됨";
    const e = $(".n-eq"), same = AB && BA && X.eq(AB, BA);
    e.textContent = !AB || !BA ? "비교 불가" : same ? "같음" : AB.length !== BA.length || AB[0].length !== BA[0].length ? "다름 (크기부터)" : "다름";
    e.className = `n-eq ${same ? "good" : "bad"}`;
    swap.textContent = `순서 바꾸기: ${ba ? "AB" : "BA"}`; swap.setAttribute("aria-pressed", String(ba));
    draw();
  }

  cv.addEventListener("click", (e) => {
    const { w } = size; if (!w) return;
    const r = cv.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top;
    for (const g of hit) {
      const j = Math.floor((px - g.x) / g.cs), i = Math.floor((py - g.y) / g.cs);
      if (i < 0 || j < 0 || i >= g.R || j >= g.K) continue;
      if (g.m === "P") { ri = i; rj = j; } else ed = { m: g.m, i, j };
      update(); return;
    }
  });
  root.querySelector(".go-step").addEventListener("click", () => {
    const P = prod(); if (!P) return;
    const K = P[0].length, n = (ri * K + rj + 1) % (P.length * K);
    ri = Math.floor(n / K); rj = n % K; update();
  });
  swap.addEventListener("click", () => { ba = !ba; update(); });
  sv.addEventListener("input", () => { full[ed.m][ed.i][ed.j] = +sv.value; update(); });
  shapes.forEach((b) => b.addEventListener("click", () => {
    const s = b.dataset.s.split(",").map(Number);
    dim = { A: [s[0], s[1]], B: [s[2], s[3]] };
    shapes.forEach((x) => x.setAttribute("aria-pressed", String(x === b))); update();
  }));
  update();
})();
