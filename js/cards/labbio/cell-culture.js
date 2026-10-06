/* 카드: 바닥을 다 덮은 세포는 언제, 얼마나 나눠 옮겨야 할까? — 부착 세포 생장 곡선, 트립신 처리, 분주 비율, 오염 */
(() => {
  const root = document.getElementById("card-labbio-cell-culture");
  if (!root) return;
  const { C, F, fit, clamp } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const TD = 24, K = 2.5e6, R = Math.LN2 / TD;   // 배가 시간(h), 다 덮였을 때 세포 수, 비생장 속도(1/h)
  let ratio = 4, st;

  // 현미경 시야에 그릴 세포 자리 (고정 난수)
  let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const SPOTS = Array.from({ length: 420 }, () => { const r = Math.sqrt(rnd()), a = rnd() * Math.PI * 2; return { x: r * Math.cos(a), y: r * Math.sin(a), t: rnd() * Math.PI }; });

  function fresh(n0) { st = { day: 0, h: 0, lag: 20, N: n0, P: 1, acid: 0, over: 0, contam: null, dead: false }; }
  fresh(2.5e5);

  const tbl = L.table($(".tbl-host"), [
    { key: "d", label: "경과 (일)", res: 0.5 }, { key: "P", label: "계대 차수" }, { key: "c", label: "덮인 비율 (%)", res: 5 },
    { key: "n", label: "세포 수 (×10⁵)", res: 0.1 }, { key: "m", label: "배지 상태" },
  ], () => drawPlot());
  const app = fit($(".cv-wide"), () => drawApp());
  const pl = fit($(".cv-plot"), () => drawPlot());
  const msg = (t) => { $(".cc-msg").textContent = t; };

  const conf = () => clamp(st.N / K, 0, 1);
  const phase = () => (st.contam != null && st.contam > 12 ? "오염" : st.h < st.lag ? "지연기" : conf() < 0.8 ? "대수 생장기" : st.over > 30 ? "정체기 (세포가 떨어져 나감)" : "정체기");
  const medium = () => (st.contam != null && st.contam > 12 ? "노랗고 뿌옇다" : st.acid > 1.1 ? "노란색 (산성)" : st.acid > 0.6 ? "주황색" : "붉은색");

  function step(hours) {
    for (let i = 0; i < hours * 4; i++) {
      const dt = 0.25;
      st.h += dt; st.day += dt / 24;
      const lagF = clamp(st.h / st.lag, 0, 1) ** 2;
      st.N += R * lagF * st.N * Math.max(0, 1 - (st.N / K) ** 4) * dt;   // 거의 다 덮일 때까지 지수 생장
      st.acid += st.N / K * dt / 72;
      if (conf() > 0.97) st.over += dt;
      if (st.over > 30 || st.acid > 1.3) st.N *= Math.exp(-0.006 * dt);   // 접촉·영양 부족으로 떨어져 나감
      if (st.contam != null) { st.contam += dt; if (st.contam > 12) st.N *= Math.exp(-0.03 * dt); }
    }
  }
  const risk = () => ($(".skip").checked ? 0.35 : 0.01);
  const openFlask = () => { if (st.contam == null && Math.random() < risk()) st.contam = 0; };

  function count() {
    if (st.dead) return;
    openFlask();
    const c = conf() * 100;
    tbl.add({ d: Math.round(st.day * 2) / 2, P: "P" + st.P, c: clamp(L.measure(c, { sd: 4, res: 5 }), 0, 100), n: Math.max(0, L.measure(st.N / 1e5, { rel: 0.09, res: 0.1 })), m: medium(), log: st.h > st.lag });
    msg("");
  }
  function passage() {
    if (st.dead) return;
    if (st.contam != null && st.contam > 12) { msg("오염된 플라스크는 계대하지 않습니다. 고압 증기 멸균한 뒤 폐기하고 새 플라스크로 시작하세요."); return; }
    const t = +$(".tr").value;
    const det = 1 - Math.exp(-t / 2.2);
    const via = t <= 6 ? 0.95 : 0.95 * Math.exp(-(t - 6) / 7);
    const got = st.N * det * via;
    const note = t <= 2 ? `트립신이 짧아 세포가 ${Math.round(det * 100)}%만 떨어졌습니다. 남은 세포는 버려집니다.` : t >= 9 ? `트립신에 너무 오래 두어 생존율이 ${Math.round(via * 100)}%로 떨어졌습니다. 회복이 늦어 지연기가 길어집니다.` : `세포의 ${Math.round(det * 100)}%가 떨어졌고 생존율은 ${Math.round(via * 100)}%입니다.`;
    st = { day: st.day, h: 0, lag: 16 + (1 - via) * 60 + (st.over > 30 ? 12 : 0), N: got / ratio, P: st.P + 1, acid: 0, over: 0, contam: null, dead: false };
    openFlask();
    msg(`P${st.P}로 계대: ${note} 1:${ratio}로 나눠 ${(st.N / 1e5).toFixed(1)}×10⁵개를 새 배지에 담았습니다.`);
  }

  function drawApp() {
    const { ctx } = app, { w, h } = app.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const cx = conf(), bad = st.contam != null && st.contam > 12;
    const pinkY = clamp(st.acid / 1.2, 0, 1), col = bad ? "rgb(222,200,90)" : `rgb(${Math.round(232 + 4 * pinkY)},${Math.round(110 + 96 * pinkY)},${Math.round(140 - 76 * pinkY)})`;
    // 플라스크 (위에서 본 모습)
    const fx = w * 0.05, fy = h * 0.14, fw = w * 0.4, fh = h * 0.42;
    ctx.fillStyle = col; ctx.globalAlpha = 0.55;
    ctx.beginPath(); ctx.moveTo(fx + fw * 0.22, fy); ctx.lineTo(fx + fw, fy); ctx.lineTo(fx + fw, fy + fh); ctx.lineTo(fx + fw * 0.22, fy + fh); ctx.lineTo(fx, fy + fh * 0.62); ctx.lineTo(fx, fy + fh * 0.38); ctx.closePath(); ctx.fill();
    ctx.globalAlpha = 1;
    if (bad) { ctx.fillStyle = "rgba(255,255,255,.45)"; for (let i = 0; i < 70; i++) ctx.fillRect(fx + fw * 0.25 + (i * 37) % (fw * 0.72), fy + 4 + (i * 23) % (fh - 8), 3, 3); }
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(fx + fw * 0.22, fy); ctx.lineTo(fx + fw, fy); ctx.lineTo(fx + fw, fy + fh); ctx.lineTo(fx + fw * 0.22, fy + fh); ctx.lineTo(fx, fy + fh * 0.62); ctx.lineTo(fx, fy + fh * 0.38); ctx.closePath(); ctx.stroke();
    ctx.fillStyle = C.ink2; ctx.fillRect(fx - 12, fy + fh * 0.36, 12, fh * 0.28);
    ctx.font = `11px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "left";
    ctx.fillText("T25 플라스크 · 배지 5 mL", fx, fy - 8);
    // 정보
    ctx.fillStyle = C.ink; ctx.font = `600 13px ${F.sans}`;
    let y = fy + fh + 24;
    ctx.fillText(`P${st.P} · ${phase()}`, fx, y);
    ctx.font = `12px ${F.mono}`; ctx.fillStyle = C.ink2;
    ctx.fillText(`경과 ${st.day.toFixed(1)}일 (계대 후 ${Math.round(st.h)} h)`, fx, y + 20);
    ctx.fillText(`배지: ${medium()}`, fx, y + 38);
    // 현미경 시야
    const mx = w * 0.74, my = h * 0.5, mr = Math.min(w * 0.22, h * 0.4);
    ctx.save(); ctx.beginPath(); ctx.arc(mx, my, mr, 0, Math.PI * 2); ctx.fillStyle = "#eef0ea"; ctx.fill(); ctx.clip();
    const n = Math.round(cx * SPOTS.length * (bad ? 0.6 : 1));
    for (let i = 0; i < n; i++) {
      const s = SPOTS[i], round = st.h < 4 && st.P > 1;   // 막 옮긴 세포는 둥글다
      ctx.save(); ctx.translate(mx + s.x * mr, my + s.y * mr); ctx.rotate(s.t);
      ctx.fillStyle = "rgba(120,130,110,.55)"; ctx.strokeStyle = "rgba(70,80,60,.6)"; ctx.lineWidth = 0.7;
      ctx.beginPath(); ctx.ellipse(0, 0, round ? 3.5 : mr * 0.085, round ? 3.5 : mr * 0.032, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.restore();
    }
    if (bad) { ctx.fillStyle = "rgba(60,60,60,.7)"; for (let i = 0; i < 260; i++) ctx.fillRect(mx - mr + (i * 53) % (2 * mr), my - mr + (i * 31 + i * i) % (2 * mr), 1.6, 1.6); }
    ctx.restore();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(mx, my, mr, 0, Math.PI * 2); ctx.stroke();
    ctx.font = `11px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "center";
    ctx.fillText("도립 현미경 ×100", mx, my - mr - 6);
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const rows = tbl.rows.filter((r) => r.n > 0);
    const pts = rows.map((r) => ({ x: r.d, y: Math.log10(r.n * 1e5) }));
    const sel = rows.filter((r) => r.log && r.c >= 10 && r.c <= 60 && r.P === (rows[0] || {}).P);
    const f = sel.length >= 2 ? L.linfit(sel.map((r) => r.d), sel.map((r) => Math.log10(r.n * 1e5))) : null;
    const xmax = Math.max(8, Math.ceil(Math.max(0, ...rows.map((r) => r.d)) + 1));
    L.plot(ctx, { x0: 44, y0: 30, w: w - 58, h: h - 64 }, { pts, fit: f, xr: [0, xmax], yr: [4.5, 6.8], xlabel: "경과 (일)", ylabel: "log₁₀(세포 수)" });
    if (f && f.a > 0) {
      ctx.fillStyle = C.warn; ctx.font = `11px ${F.mono}`; ctx.textAlign = "left";
      ctx.fillText(`기울기 ${f.a.toFixed(3)} /일 → 배가 시간 ${(Math.log10(2) / f.a * 24).toFixed(0)} h`, 50, 44);
    }
  }

  root.querySelector(".split").addEventListener("click", (e) => { const b = e.target.closest("[data-r]"); if (!b) return; ratio = +b.dataset.r; root.querySelectorAll("[data-r]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); });
  $(".tr").addEventListener("input", () => { $(".tr-out").textContent = $(".tr").value; });
  $(".grow").addEventListener("click", () => { step(12); if (st.contam != null && st.contam > 12) msg("배지가 하루 사이에 노랗고 뿌옇게 변했습니다. 세균이 들어온 것 같습니다."); drawApp(); });
  $(".count").addEventListener("click", () => { count(); drawApp(); });
  $(".pass").addEventListener("click", () => { passage(); drawApp(); });
  $(".reset").addEventListener("click", () => { fresh(2.5e5); msg("새 플라스크에 세포 2.5×10⁵개를 뿌렸습니다."); drawApp(); });
  $(".clear").addEventListener("click", () => tbl.clear());
  drawApp();

  if (L.demo) {
    for (let d = 0; d <= 7; d++) { if (d) step(24); count(); }
    st.contam = null; passage(); step(24); count(); step(24); count();
    st.contam = null; drawApp();
  }
})();
