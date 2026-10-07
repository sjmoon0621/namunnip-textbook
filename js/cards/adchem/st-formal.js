/* 카드: 세 결합의 길이가 같은 질산 이온을 루이스 구조식으로 어떻게 나타낼까? — 결합 차수를 바꾸며 형식 전하·공명 구조 비교 */
(() => {
  const root = document.getElementById("card-adchem-formal");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const VAL = { C: 4, N: 5, O: 6, S: 6 }, EN = { C: 2.55, N: 3.04, O: 3.44, S: 2.58 }, PER = { C: 2, N: 2, O: 2, S: 3 };
  const s3 = Math.sqrt(3) / 2;
  const M = {
    no3: { name: "NO₃⁻", q: -1, c: 0, at: [["N", 0, 0], ["O", 0, -1], ["O", -s3, 0.5], ["O", s3, 0.5]], b: [[0, 1], [0, 2], [0, 3]] },
    co3: { name: "CO₃²⁻", q: -2, c: 0, at: [["C", 0, 0], ["O", 0, -1], ["O", -s3, 0.5], ["O", s3, 0.5]], b: [[0, 1], [0, 2], [0, 3]] },
    o3: { name: "O₃", q: 0, c: 1, at: [["O", -s3, 0.3], ["O", 0, -0.2], ["O", s3, 0.3]], b: [[1, 0], [1, 2]] },
    co2: { name: "CO₂", q: 0, c: 1, at: [["O", -1.1, 0], ["C", 0, 0], ["O", 1.1, 0]], b: [[1, 0], [1, 2]] },
    n2o: { name: "N₂O", q: 0, c: 1, at: [["N", -1.1, 0], ["N", 0, 0], ["O", 1.1, 0]], b: [[1, 0], [1, 2]] },
    ocn: { name: "OCN⁻", q: -1, c: 1, at: [["O", -1.1, 0], ["C", 0, 0], ["N", 1.1, 0]], b: [[1, 0], [1, 2]] },
    so4: { name: "SO₄²⁻", q: -2, c: 0, at: [["S", 0, 0], ["O", 0, -1], ["O", 1, 0], ["O", 0, 1], ["O", -1, 0]], b: [[0, 1], [0, 2], [0, 3], [0, 4]] },
  };
  let key = "no3", ord = [], saved = [];
  const mol = () => M[key];
  function reset() { ord = mol().b.map(() => 1); saved = []; }

  function analyze() {
    const m = mol(), n = m.at.length, total = m.at.reduce((s, a) => s + VAL[a[0]], 0) - m.q;
    const bsum = new Array(n).fill(0); m.b.forEach(([i, j], k) => { bsum[i] += ord[k]; bsum[j] += ord[k]; });
    const lp = new Array(n).fill(0); let used = 2 * ord.reduce((s, o) => s + o, 0);
    for (let i = 0; i < n; i++) if (i !== m.c) { lp[i] = Math.max(0, 8 - 2 * bsum[i]); used += lp[i]; }
    const rem = total - used; lp[m.c] = Math.max(0, rem);
    const fc = m.at.map((a, i) => VAL[a[0]] - lp[i] - bsum[i]);
    const shell = m.at.map((a, i) => lp[i] + 2 * bsum[i]);
    const issues = [];
    if (rem < 0) issues.push(`전자가 ${-rem}개 모자랍니다. 결합이 너무 많습니다.`);
    if (rem % 2) issues.push("홀수 전자가 남습니다.");
    m.at.forEach((a, i) => {
      if (PER[a[0]] === 2 && shell[i] > 8) issues.push(`${a[0]} 주위 전자가 ${shell[i]}개입니다. 2주기 원소는 옥텟을 넘을 수 없습니다.`);
      if (rem >= 0 && shell[i] < 8) issues.push(`${a[0]} 주위 전자가 ${shell[i]}개로 옥텟을 이루지 못했습니다.`);
    });
    return { total, lp, fc, bsum, shell, ok: !issues.length, issues };
  }
  function judge(a) {
    const m = mol(), notes = [];
    const sumAbs = a.fc.reduce((s, v) => s + Math.abs(v), 0);
    let enBad = false;
    a.fc.forEach((v, i) => { if (v < 0) a.fc.forEach((w, j) => { if (w >= 0 && EN[m.at[j][0]] > EN[m.at[i][0]]) enBad = true; }); });
    let adj = false;
    m.b.forEach(([i, j]) => { if (a.fc[i] * a.fc[j] > 0) adj = true; });
    let score = sumAbs * 10 + (enBad ? 3 : 0) + (adj ? 6 : 0);
    if (a.fc.some((v, i) => v > 0 && m.at[i][0] === "O")) score += 2;
    notes.push(`형식 전하 절댓값의 합 ${sumAbs}`);
    notes.push(enBad ? "음전하가 전기 음성도가 더 작은 원자에 있음 ✗" : "음전하 위치 적절 ✓");
    if (adj) notes.push("같은 부호의 전하가 이웃함 ✗");
    return { score, text: notes.join(" · ") };
  }
  const sig = () => ord.join("");

  const { ctx, size } = fit(cv, () => draw());
  let geo = null;
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const m = mol(), a = analyze(), sc = Math.min(w, h) * (key === "so4" ? 0.3 : 0.33), cx = w / 2, cy = h * 0.5;
    const P = m.at.map(([, x, y]) => [cx + x * sc, cy + y * sc]);
    geo = { P };
    /* 평균 결합 차수 (저장된 구조) */
    const avg = saved.length >= 2 ? m.b.map((_, k) => saved.reduce((s, st) => s + st.ord[k], 0) / saved.length) : null;
    m.b.forEach(([i, j], k) => {
      const [x1, y1] = P[i], [x2, y2] = P[j], L = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / L, uy = (y2 - y1) / L, nx = -uy, ny = ux, pad = 16;
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2.2;
      const offs = ord[k] === 1 ? [0] : ord[k] === 2 ? [-3.5, 3.5] : [-6, 0, 6];
      offs.forEach((o) => { ctx.beginPath(); ctx.moveTo(x1 + ux * pad + nx * o, y1 + uy * pad + ny * o); ctx.lineTo(x2 - ux * pad + nx * o, y2 - uy * pad + ny * o); ctx.stroke(); });
      if (avg) {
        const mx = (x1 + x2) / 2 + nx * 16, my = (y1 + y2) / 2 + ny * 16;
        ctx.fillStyle = C.forest; ctx.font = `600 11px ${F.mono}`; ctx.textAlign = "center"; ctx.fillText(avg[k].toFixed(2), mx, my + 4);
      }
    });
    /* 원자, 비공유 전자쌍, 형식 전하 */
    m.at.forEach(([el], i) => {
      const [x, y] = P[i];
      ctx.fillStyle = C.ink; ctx.font = `600 19px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText(el, x, y + 7);
      const dirs = m.b.filter(([p, q]) => p === i || q === i).map(([p, q]) => { const o = p === i ? q : p; return Math.atan2(P[o][1] - y, P[o][0] - x); });
      const occ = dirs.slice(), pairs = a.lp[i] / 2;
      for (let k = 0; k < pairs; k++) {
        let best = 0, bd = -1;
        for (let t = 0; t < 24; t++) {
          const th = t * Math.PI / 12; let md = 9;
          occ.forEach((o) => { let d = Math.abs(((th - o) % (2 * Math.PI) + 3 * Math.PI) % (2 * Math.PI) - Math.PI); md = Math.min(md, d); });
          if (occ.length === 0) md = 9 - Math.abs(th - Math.PI / 2);
          if (md > bd + 1e-6) { bd = md; best = th; }
        }
        occ.push(best);
        const r = 17, px = x + Math.cos(best) * r, py = y + Math.sin(best) * r, tx = -Math.sin(best) * 4, ty = Math.cos(best) * 4;
        ctx.fillStyle = C.ink2; [1, -1].forEach((sg) => { ctx.beginPath(); ctx.arc(px + sg * tx, py + sg * ty, 2.1, 0, 7); ctx.fill(); });
      }
      const f = a.fc[i];
      if (f && a.lp.every((v) => v >= 0)) {
        let ba = 0, bdd = -1;
        for (let t = 0; t < 72; t++) {
          const th = t * Math.PI / 36; let md = 9;
          occ.forEach((o) => { const d = Math.abs(((th - o) % (2 * Math.PI) + 3 * Math.PI) % (2 * Math.PI) - Math.PI); md = Math.min(md, d); });
          md -= Math.abs(Math.sin(th) + 0.7) * 0.05;
          if (md > bdd) { bdd = md; ba = th; }
        }
        const bx = x + Math.cos(ba) * 25, by = y + Math.sin(ba) * 25;
        ctx.fillStyle = f > 0 ? C.apple : "#3f6fa3"; ctx.beginPath(); ctx.arc(bx, by, 9, 0, 7); ctx.fill();
        ctx.fillStyle = "#fff"; ctx.font = `600 10px ${F.mono}`; ctx.fillText(`${f > 0 ? "+" : "−"}${Math.abs(f) > 1 ? Math.abs(f) : ""}`, bx, by + 3.5);
      }
    });
    ctx.fillStyle = C.ink2; ctx.font = `11px ${F.mono}`; ctx.textAlign = "left";
    ctx.fillText(`원자가 전자 ${a.total}개 · 그린 구조의 전자 ${2 * ord.reduce((s, o) => s + o, 0) + a.lp.reduce((s, v) => s + v, 0)}개`, 8, 16);
    ctx.textAlign = "right"; ctx.fillText(`${m.name}${m.q ? "  (전하 " + (m.q < 0 ? "−" : "+") + Math.abs(m.q) + ")" : ""}`, w - 8, 16);
    if (avg) { ctx.fillStyle = C.forest; ctx.textAlign = "left"; ctx.fillText(`초록 숫자: 저장한 ${saved.length}개 구조의 평균 결합 차수`, 8, h - 8); }
  }
  function update() {
    root.querySelectorAll("[data-m]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.m === key)));
    const a = analyze(), v = $(".verdict");
    if (!a.ok) { v.innerHTML = `<b class="bad">올바른 루이스 구조가 아닙니다.</b> ${a.issues[0]}`; }
    else { const j = judge(a); v.innerHTML = `<b>올바른 구조</b> · 형식 전하 합 ${a.fc.reduce((s, x) => s + x, 0)} (= 전하) · ${j.text}`; }
    if (saved.length) {
      const best = Math.min(...saved.map((s) => s.score));
      $(".saved").innerHTML = "저장한 구조: " + saved.map((s, i) => `${i + 1}번(${s.label}${s.score === best ? ", 가장 안정" : ""})`).join(" · ");
    } else $(".saved").textContent = "";
    draw();
  }
  function label() {
    const m = mol(); return m.b.map(([i, j], k) => `${m.at[i][0]}${["", "–", "=", "≡"][ord[k]]}${m.at[j][0]}`).join(" ");
  }
  cv.addEventListener("click", (e) => {
    if (!geo) return;
    const r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top, m = mol();
    let bk = -1, bd = 26;
    m.b.forEach(([i, j], k) => { const mx = (geo.P[i][0] + geo.P[j][0]) / 2, my = (geo.P[i][1] + geo.P[j][1]) / 2, d = Math.hypot(x - mx, y - my); if (d < bd) { bd = d; bk = k; } });
    if (bk >= 0) { ord[bk] = ord[bk] % 3 + 1; update(); }
  });
  $(".save").addEventListener("click", () => {
    const a = analyze();
    if (!a.ok) { $(".verdict").innerHTML = `<b class="bad">저장할 수 없습니다.</b> ${a.issues[0]}`; return; }
    if (saved.some((s) => s.sig === sig())) { $(".verdict").innerHTML += " · 이미 저장한 구조입니다."; return; }
    saved.push({ sig: sig(), ord: ord.slice(), score: judge(a).score, label: label() }); update();
  });
  $(".clear").addEventListener("click", () => { saved = []; update(); });
  root.querySelectorAll("[data-m]").forEach((b) => b.addEventListener("click", () => { key = b.dataset.m; reset(); update(); }));
  reset();
  if (/[?&]demo\b/.test(location.search)) {
    [[2, 1, 1], [1, 2, 1], [1, 1, 2]].forEach((o) => { ord = o; const a = analyze(); saved.push({ sig: sig(), ord: o.slice(), score: judge(a).score, label: label() }); });
    ord = [2, 1, 1];
  }
  update();
})();
