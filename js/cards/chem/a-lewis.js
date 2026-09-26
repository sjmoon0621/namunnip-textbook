/* 카드: 루이스 전자점식은 어떻게 그릴까? — 결합 차수를 바꿔 옥텟 맞추기 */
(() => {
  const root = document.getElementById("card-chem-lewis");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), bb = $(".bonds");
  const dTot = $(".v-tot"), dSh = $(".v-sh"), dLp = $(".v-lp"), dOk = $(".v-ok"), msg = $(".lw-msg");

  const VAL = { H: 1, C: 4, N: 5, O: 6, F: 7 };
  // 원자: [원소, x, y], 결합: [i, j]
  const MOLS = {
    h2o: { n: "H₂O", a: [["O", 0, 0], ["H", -1, .75], ["H", 1, .75]], b: [[0, 1], [0, 2]] },
    nh3: { n: "NH₃", a: [["N", 0, 0], ["H", -1.2, .1], ["H", 1.2, .1], ["H", 0, 1.2]], b: [[0, 1], [0, 2], [0, 3]] },
    co2: { n: "CO₂", a: [["C", 0, 0], ["O", -1.4, 0], ["O", 1.4, 0]], b: [[0, 1], [0, 2]] },
    hcn: { n: "HCN", a: [["C", 0, 0], ["H", -1.3, 0], ["N", 1.4, 0]], b: [[0, 1], [0, 2]] },
    ch2o: { n: "HCHO", a: [["C", 0, 0], ["O", 1.4, 0], ["H", -.95, -.9], ["H", -.95, .9]], b: [[0, 1], [0, 2], [0, 3]] },
    n2: { n: "N₂", a: [["N", -.7, 0], ["N", .7, 0]], b: [[0, 1]] },
  };
  let mk = "co2", ord = [];

  function solve() {
    const m = MOLS[mk], n = m.a.length;
    const total = m.a.reduce((s, [e]) => s + VAL[e], 0);
    const bsum = Array(n).fill(0), deg = Array(n).fill(0);
    m.b.forEach(([i, j], k) => { bsum[i] += ord[k]; bsum[j] += ord[k]; deg[i]++; deg[j]++; });
    const shared = 2 * ord.reduce((s, o) => s + o, 0);
    let left = total - shared;
    const lp = Array(n).fill(0);
    // 비공유 전자쌍: 바깥 원자(H 제외)부터 옥텟을 채우고, 남으면 가운데 원자에
    const order = [...Array(n).keys()].filter((i) => m.a[i][0] !== "H").sort((i, j) => deg[i] - deg[j]);
    for (const i of order) {
      const need = Math.max(0, (8 - 2 * bsum[i]) / 2), give = Math.max(0, Math.min(need, Math.floor(left / 2)));
      lp[i] = give; left -= give * 2;
    }
    if (left > 0 && order.length) { const c = order[order.length - 1]; lp[c] += Math.floor(left / 2); left -= Math.floor(left / 2) * 2; }
    const around = m.a.map(([e], i) => 2 * bsum[i] + 2 * lp[i]);
    const ok = m.a.map(([e], i) => around[i] === (e === "H" ? 2 : 8));
    const fc = m.a.map(([e], i) => VAL[e] - 2 * lp[i] - bsum[i]);
    return { total, shared, lp, around, ok, fc, over: shared > total, bsum };
  }

  function buildBonds() {
    const m = MOLS[mk];
    ord = m.b.map(() => 1);
    bb.innerHTML = "";
    m.b.forEach(([i, j], k) => {
      if (m.a[i][0] === "H" || m.a[j][0] === "H") return;
      const b = document.createElement("button");
      b.type = "button"; b.className = "chip"; b.dataset.k = k;
      b.addEventListener("click", () => cycle(k));
      bb.appendChild(b);
    });
    update();
  }
  function cycle(k) { ord[k] = ord[k] % 3 + 1; update(); }

  const { ctx, size } = fit(cv, () => draw());
  let geo = null;

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const m = MOLS[mk], s = solve(), small = w < 520;
    const U = Math.min(w / 5.2, h / 3.4), cx = w / 2, cy = h * 0.46;
    const P = m.a.map(([, x, y]) => [cx + x * U, cy + y * U]);
    geo = { P, U };
    const fs = small ? 22 : 30;
    // 결합
    m.b.forEach(([i, j], k) => {
      const [x1, y1] = P[i], [x2, y2] = P[j], L = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / L, uy = (y2 - y1) / L;
      const nx = -uy, ny = ux, cut = fs * 0.62, o = ord[k];
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2.2;
      for (let q = 0; q < o; q++) {
        const off = (q - (o - 1) / 2) * 7;
        ctx.beginPath(); ctx.moveTo(x1 + ux * cut + nx * off, y1 + uy * cut + ny * off); ctx.lineTo(x2 - ux * cut + nx * off, y2 - uy * cut + ny * off); ctx.stroke();
      }
    });
    // 원자, 비공유 전자쌍, 옥텟 표시
    m.a.forEach(([e], i) => {
      const [x, y] = P[i];
      ctx.beginPath(); ctx.arc(x, y, fs * 0.95, 0, Math.PI * 2);
      ctx.fillStyle = s.ok[i] ? "rgba(116,171,102,.14)" : "rgba(181,83,47,.12)"; ctx.fill();
      ctx.fillStyle = C.ink; ctx.font = `600 ${fs}px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText(e, x, y + fs * 0.36);
      // 결합 방향을 피해 전자쌍 자리를 고른다
      const dirs = m.b.filter(([a, b]) => a === i || b === i).map(([a, b]) => { const o = a === i ? b : a; return Math.atan2(P[o][1] - y, P[o][0] - x); });
      const cand = [0, 1, 2, 3, 4, 5, 6, 7].map((k) => -Math.PI / 2 + k * Math.PI / 4);
      const score = (t) => Math.min(...dirs.map((d) => Math.abs(Math.atan2(Math.sin(t - d), Math.cos(t - d)))), 9);
      const pick = [];
      for (let q = 0; q < s.lp[i]; q++) {
        const t = cand.filter((c) => !pick.includes(c)).sort((a, b) => (Math.min(score(b), ...pick.map((p) => Math.abs(Math.atan2(Math.sin(b - p), Math.cos(b - p))))) - Math.min(score(a), ...pick.map((p) => Math.abs(Math.atan2(Math.sin(a - p), Math.cos(a - p)))))))[0];
        pick.push(t);
      }
      ctx.fillStyle = "#3f6fb5";
      for (const t of pick) {
        const r = fs * 0.78, px = x + Math.cos(t) * r, py = y + Math.sin(t) * r, tx = -Math.sin(t) * 4.5, ty = Math.cos(t) * 4.5;
        ctx.beginPath(); ctx.arc(px + tx, py + ty, 2.8, 0, Math.PI * 2); ctx.arc(px - tx, py - ty, 2.8, 0, Math.PI * 2); ctx.fill();
      }
      ctx.font = `${small ? 9.5 : 10.5}px ${F.mono}`; ctx.fillStyle = s.ok[i] ? C.forest : C.warn;
      ctx.fillText(`${s.around[i]}`, x + fs * 0.95, y - fs * 0.8);
      if (s.fc[i] && !s.over && s.ok.every(Boolean)) { ctx.fillStyle = C.ink3; ctx.fillText(`${s.fc[i] > 0 ? "+" : ""}${s.fc[i]}`, x - fs * 0.95, y - fs * 0.8); }
    });
    ctx.font = `${small ? 9.5 : 10.5}px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "left";
    ctx.fillText("원자 오른쪽 위 숫자: 그 원자 둘레의 전자 수", 8, h - 10);
  }

  function update() {
    const m = MOLS[mk], s = solve();
    bb.querySelectorAll("[data-k]").forEach((b) => {
      const k = +b.dataset.k, [i, j] = m.b[k];
      b.textContent = `${m.a[i][0]}–${m.a[j][0]}: ${["", "단일", "2중", "3중"][ord[k]]} 결합`;
    });
    const nOk = s.ok.filter(Boolean).length;
    dTot.textContent = `${s.total}개`;
    dSh.textContent = `${s.shared}개`;
    dLp.textContent = s.over ? "—" : `${s.total - s.shared}개`;
    dOk.textContent = `${nOk} / ${s.ok.length}`;
    dOk.className = nOk === s.ok.length && !s.over ? "v-ok good" : "v-ok bad";
    const hasFc = s.fc.some((f) => f);
    msg.textContent = s.over ? "공유하는 전자가 원자가 전자 총수보다 많습니다. 결합 차수를 줄이세요."
      : nOk < s.ok.length ? `옥텟을 채우지 못한 원자가 있습니다. 전자가 모자란 원자와 이웃 사이의 결합을 2중, 3중으로 바꿔 보세요.`
      : hasFc ? "모든 원자가 옥텟을 이뤘지만 원자 왼쪽 위에 형식 전하가 남았습니다. 전하가 없는 구조가 더 안정합니다(심화)."
      : `완성입니다. 모든 원자가 옥텟(H는 2개)을 이뤘습니다.`;
    draw();
  }

  cv.addEventListener("click", (ev) => {
    if (!geo) return;
    const r = cv.getBoundingClientRect(), x = ev.clientX - r.left, y = ev.clientY - r.top, m = MOLS[mk];
    m.b.forEach(([i, j], k) => {
      if (m.a[i][0] === "H" || m.a[j][0] === "H") return;
      const mx = (geo.P[i][0] + geo.P[j][0]) / 2, my = (geo.P[i][1] + geo.P[j][1]) / 2;
      if (Math.hypot(x - mx, y - my) < 22) cycle(k);
    });
  });
  root.querySelectorAll("[data-mol]").forEach((b) => b.addEventListener("click", () => {
    mk = b.dataset.mol;
    root.querySelectorAll("[data-mol]").forEach((x) => x.setAttribute("aria-pressed", x === b ? "true" : "false"));
    buildBonds();
  }));
  buildBonds();
})();
