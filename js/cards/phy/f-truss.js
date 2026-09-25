/* 카드: 다리의 뼈대는 왜 삼각형으로 짤까? — 트러스의 마디마다 힘의 평형을 세워 연립해서 푼다 */
(() => {
  const root = document.getElementById("card-phy-truss");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const sPos = $(".pos"), sH = $(".ht"), diag = $(".diag");
  const oPos = $(".pos-out"), oH = $(".ht-out");
  const nT = $(".tmax"), nC = $(".cmax"), nR = $(".reac");

  const BLUE = "#3569a8", W = 20 * 9.81; // 트럭 20 t → 196 kN
  const PANEL = 5, SPAN = 20;
  // 마디: 아래 B0..B4 (0..4), 위 T1..T3 (5..7)
  const joints = (h) => [[0, 0], [5, 0], [10, 0], [15, 0], [20, 0], [5, h], [10, h], [15, h]];
  const BASE = [[0, 1], [1, 2], [2, 3], [3, 4], [5, 6], [6, 7], [0, 5], [4, 7], [1, 5], [2, 6], [3, 7]];
  const DIAG = [[5, 2], [7, 2]];

  function gauss(A, b) {
    const n = b.length, M = A.map((r, i) => [...r, b[i]]);
    for (let c = 0; c < n; c++) {
      let p = c;
      for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
      if (Math.abs(M[p][c]) < 1e-9) return null;
      [M[c], M[p]] = [M[p], M[c]];
      for (let r = 0; r < n; r++) {
        if (r === c) continue;
        const f = M[r][c] / M[c][c];
        for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k];
      }
    }
    return M.map((r, i) => r[n] / r[i]);
  }

  function solve() {
    const h = +sH.value, pos = +sPos.value, J = joints(h);
    const mem = diag.checked ? [...BASE, ...DIAG] : BASE;
    const i = Math.min(3, Math.floor(pos / PANEL)), f = pos / PANEL - i;
    const load = new Array(8).fill(0);
    load[i] += W * (1 - f); load[i + 1] += W * f; // 지렛대 규칙으로 양옆 마디에 나눔
    const res = { h, pos, J, mem, load, ok: false };
    const nu = mem.length + 3;
    if (nu !== 2 * J.length) return res; // 식 16개, 미지수가 모자라면 평형을 이루는 힘 조합이 없음
    const A = Array.from({ length: 16 }, () => new Array(nu).fill(0)), b = new Array(16).fill(0);
    mem.forEach(([a, c], k) => {
      const dx = J[c][0] - J[a][0], dy = J[c][1] - J[a][1], L = Math.hypot(dx, dy);
      A[2 * a][k] += dx / L; A[2 * a + 1][k] += dy / L;   // 인장(+)이면 마디를 부재 쪽으로 당김
      A[2 * c][k] -= dx / L; A[2 * c + 1][k] -= dy / L;
    });
    const m = mem.length;
    A[0][m] = 1; A[1][m + 1] = 1; A[2 * 4 + 1][m + 2] = 1;  // B0 핀(가로·세로), B4 롤러(세로)
    for (let j = 0; j < 8; j++) b[2 * j + 1] = load[j];      // ΣF = 0 → 부재 + 반력 = 하중(아래)
    const x = gauss(A, b);
    if (!x) return res;
    res.ok = true; res.F = x.slice(0, m); res.R = [x[m + 1], x[m + 2]];
    return res;
  }

  function update() {
    const r = solve();
    oPos.textContent = r.pos.toFixed(1); oH.textContent = r.h.toFixed(1);
    if (r.ok) {
      const t = Math.max(0, ...r.F), c = Math.min(0, ...r.F);
      nT.textContent = `${t.toFixed(0)} kN`; nC.textContent = `${(-c).toFixed(0)} kN`;
      nR.textContent = `${r.R[0].toFixed(0)} · ${r.R[1].toFixed(0)} kN`;
    } else { nT.textContent = nC.textContent = nR.textContent = "—"; }
    draw(r);
  }

  const { ctx, size } = fit(cv, () => update());

  function draw(r) {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const s = Math.min(w / 23.5, (h - 50) / 10.5), ox = (w - SPAN * s) / 2, gy = h - 34;
    const X = (x) => ox + x * s, Y = (y) => gy - 1.2 * s - y * s;
    // 강둑과 물
    ctx.fillStyle = "rgba(53,105,168,.10)"; ctx.fillRect(X(0), Y(0) + 10, SPAN * s, gy - Y(0));
    ctx.fillStyle = "#c9c4b4";
    ctx.fillRect(0, Y(0) + 6, X(0) + 4, h); ctx.fillRect(X(SPAN) - 4, Y(0) + 6, w, h);
    // 받침 기호
    ctx.fillStyle = C.ink2;
    for (const x of [0, SPAN]) { ctx.beginPath(); ctx.moveTo(X(x), Y(0) + 1); ctx.lineTo(X(x) - 7, Y(0) + 11); ctx.lineTo(X(x) + 7, Y(0) + 11); ctx.closePath(); ctx.fill(); }
    ctx.beginPath(); ctx.arc(X(SPAN) - 4, Y(0) + 14, 2.5, 0, Math.PI * 2); ctx.arc(X(SPAN) + 4, Y(0) + 14, 2.5, 0, Math.PI * 2); ctx.fill();

    const J = r.J;
    // 부재
    r.mem.forEach(([a, c], k) => {
      const f = r.ok ? r.F[k] : 0;
      ctx.strokeStyle = !r.ok ? C.ink3 : Math.abs(f) < 0.5 ? C.ink3 : f > 0 ? BLUE : C.warn;
      ctx.lineWidth = r.ok ? 1.5 + Math.min(9, Math.abs(f) / 500 * 7) : 2;
      ctx.beginPath(); ctx.moveTo(X(J[a][0]), Y(J[a][1])); ctx.lineTo(X(J[c][0]), Y(J[c][1])); ctx.stroke();
    });
    // 사각형 칸이 어떻게 찌그러질 수 있는지 (막대 길이는 그대로, 각만 바뀜)
    if (!r.ok) {
      ctx.setLineDash([4, 4]); ctx.strokeStyle = C.warn; ctx.lineWidth = 1.5;
      for (const x0 of [5, 10]) {
        const dx = r.h * Math.sin(0.35), dy = r.h * Math.cos(0.35);
        ctx.beginPath(); ctx.moveTo(X(x0), Y(0)); ctx.lineTo(X(x0 + dx), Y(dy)); ctx.lineTo(X(x0 + 5 + dx), Y(dy)); ctx.lineTo(X(x0 + 5), Y(0)); ctx.stroke();
      }
      ctx.setLineDash([]);
    }
    // 마디
    J.forEach(([x, y]) => { ctx.beginPath(); ctx.arc(X(x), Y(y), 3.2, 0, Math.PI * 2); ctx.fillStyle = C.card; ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2; ctx.stroke(); });
    // 힘 숫자
    ctx.font = `10px ${F.mono}`; ctx.textAlign = "center";
    if (r.ok && w > 340) r.mem.forEach(([a, c], k) => {
      const f = r.F[k]; if (Math.abs(f) < 0.5) return;
      const mx = (X(J[a][0]) + X(J[c][0])) / 2, my = (Y(J[a][1]) + Y(J[c][1])) / 2;
      const t = Math.abs(f).toFixed(0), tw = ctx.measureText(t).width + 6;
      ctx.fillStyle = "rgba(251,251,248,.9)"; ctx.fillRect(mx - tw / 2, my - 7, tw, 13);
      ctx.fillStyle = f > 0 ? BLUE : C.warn; ctx.fillText(t, mx, my + 3);
    });
    // 트럭
    const tx = X(r.pos), ty = Y(0) - 3;
    ctx.fillStyle = C.ink;
    ctx.fillRect(tx - 1.6 * s, ty - 1.3 * s, 2.4 * s, 1.1 * s);
    ctx.fillRect(tx + 0.9 * s, ty - 1.0 * s, 0.8 * s, 0.8 * s);
    ctx.beginPath(); ctx.arc(tx - 1.1 * s, ty - 0.15 * s, 0.22 * s, 0, Math.PI * 2); ctx.arc(tx + 1.2 * s, ty - 0.15 * s, 0.22 * s, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.ink2; ctx.textAlign = "center"; ctx.font = `10.5px ${F.mono}`;
    ctx.fillText("20 t", tx, ty - 1.3 * s - 5);
    // 받침 반력
    if (r.ok) {
      ctx.fillStyle = C.forest; ctx.textAlign = "left";
      ctx.fillText(`↑${r.R[0].toFixed(0)}`, X(0) + 8, Y(0) + 24);
      ctx.textAlign = "right"; ctx.fillText(`↑${r.R[1].toFixed(0)}`, X(SPAN) - 8, Y(0) + 24);
    }
    ctx.textAlign = "left"; ctx.fillStyle = C.ink3;
    ctx.fillText("부재가 받는 힘 (kN) · 부재 무게는 무시 · 마디는 핀", 8, 14);
    if (!r.ok) {
      ctx.fillStyle = C.warn; ctx.font = `600 13px ${F.sans}`;
      ctx.fillText("막대 길이는 그대로인 채 모양이 바뀔 수 있어, 버티지 못합니다", 8, 33);
    }
  }

  [sPos, sH, diag].forEach((el) => el.addEventListener("input", update));
  update();
})();
