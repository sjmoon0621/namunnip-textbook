/* 카드: 반도체 회로는 왜 더 짧은 파장의 빛으로 새길까? — 회절 차수와 렌즈 구경(NA) */
(() => {
  const root = document.getElementById("card-phy-lm-litho");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const pS = $(".pitch"), pO = $(".pitch-out"), obl = $(".obl");
  const ordEl = $(".orders"), conEl = $(".contrast"), minEl = $(".pmin");
  const SRC = {
    iline: { lam: 365, na: 0.6, name: "i선 수은등" },
    krf: { lam: 248, na: 0.8, name: "KrF 레이저" },
    arf: { lam: 193, na: 0.93, name: "ArF 레이저" },
    arfi: { lam: 193, na: 1.35, name: "ArF 액침" },
    euv: { lam: 13.5, na: 0.33, name: "극자외선 EUV" },
  };
  let src = SRC.arf;
  const SIG = 0.8, TH = 0.3; // 경사 조명 위치 σ = 0.8, 감광제 문턱 = 열린 곳 세기의 30%
  const pitch = () => Math.round(Math.pow(10, +pS.value));
  // 1:1 선-간격 무늬의 푸리에 계수: c0 = 1/2, cm = sin(πm/2)/(πm)
  const cm = (m) => (m === 0 ? 0.5 : Math.sin(Math.PI * m / 2) / (Math.PI * m));
  function passed(p, s) {
    const out = [];
    for (let m = -60; m <= 60; m++) if (Math.abs(s + m * src.lam / p) <= src.na + 1e-9) out.push(m);
    return out;
  }
  function image(x, p, ms) {
    let re = 0, im = 0;
    for (const m of ms) { const ph = 2 * Math.PI * m * x / p; re += cm(m) * Math.cos(ph); im += cm(m) * Math.sin(ph); }
    return re * re + im * im;
  }
  function state() {
    const p = pitch();
    const beams = obl.checked ? [SIG * src.na, -SIG * src.na] : [0];
    const sets = beams.map((s) => passed(p, s));
    const I = (x) => sets.reduce((acc, ms) => acc + image(x, p, ms), 0) / sets.length;
    return { p, beams, sets, I };
  }

  const { ctx, size } = fit(cv, () => draw());

  function draw() {
    const { w, h } = size;
    if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const st = state();
    const gw = Math.round(w * 0.64), gx = 10, per = 3;
    const X = (x) => gx + x / (per * st.p) * (gw - gx);
    ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "left";
    // 1) 마스크
    const my = 18, mh = 16;
    ctx.fillStyle = C.ink3; ctx.fillText("마스크 (선 : 간격 = 1 : 1)", gx, my - 5);
    for (let k = 0; k < per; k++) { ctx.fillStyle = C.ink; ctx.fillRect(X((k + 0.25) * st.p), my, X(0.5 * st.p) - X(0), mh); }
    ctx.strokeStyle = C.rule; ctx.strokeRect(gx + .5, my + .5, gw - gx, mh);
    // 2) 웨이퍼에 맺힌 빛의 세기
    const gy0 = my + mh + 26, gh = h - gy0 - 56;
    const Y = (v) => gy0 + gh - Math.min(v, 1.4) / 1.4 * gh;
    ctx.fillStyle = C.ink3; ctx.fillText("웨이퍼에 닿는 빛의 세기", gx, gy0 - 6);
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(gx, gy0 + gh + .5); ctx.lineTo(gw, gy0 + gh + .5); ctx.stroke();
    ctx.setLineDash([4, 3]); ctx.strokeStyle = C.warn;
    ctx.beginPath(); ctx.moveTo(gx, Y(TH) + .5); ctx.lineTo(gw, Y(TH) + .5); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.warn; ctx.textAlign = "right"; ctx.fillText("감광 문턱", gw, Y(TH) + 12); ctx.textAlign = "left";
    const N = 360, vals = [];
    ctx.beginPath();
    for (let i = 0; i <= N; i++) { const x = i / N * per * st.p, v = st.I(x); vals.push(v); i ? ctx.lineTo(X(x), Y(v)) : ctx.moveTo(X(x), Y(v)); }
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.stroke();
    // 3) 현상 후 감광제: 문턱보다 센 곳이 녹아 없어진다 (양성 감광제)
    const ry = gy0 + gh + 18, rh = 14;
    ctx.fillStyle = C.ink3; ctx.fillText("현상 후 남은 감광제", gx, ry + rh + 14);
    ctx.fillStyle = "#e9e3cf"; ctx.fillRect(gx, ry + rh - 3, gw - gx, 3);
    ctx.fillStyle = C.amber;
    for (let i = 0; i < N; i++) if (vals[i] < TH) ctx.fillRect(X(i / N * per * st.p), ry, (gw - gx) / N + 0.6, rh - 3);

    // 4) 렌즈 구멍(동공): 회절된 빛이 들어가는 방향
    const cx = gw + (w - gw) / 2 + 4, cy = h / 2 - 4, r = Math.min((w - gw) / 2 - 18, h / 2 - 40);
    ctx.textAlign = "center"; ctx.fillStyle = C.ink3;
    ctx.fillText("렌즈가 받는 방향", cx, 14);
    ctx.fillStyle = "rgba(92,150,190,.12)"; ctx.strokeStyle = "#4b7fa3"; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#4b7fa3"; ctx.fillText(`NA ${src.na}`, cx, cy + r + 14);
    const rows = st.beams.length > 1 ? [-10, 10] : [0];
    st.beams.forEach((s, bi) => {
      const yy = cy + rows[bi];
      for (let m = -40; m <= 40; m++) {
        const u = s + m * src.lam / st.p;
        if (Math.abs(u) > src.na * 1.9) continue;
        const px = cx + u / src.na * r, c = Math.abs(cm(m));
        if (c < 1e-6) continue;
        const inside = Math.abs(u) <= src.na + 1e-9;
        ctx.beginPath(); ctx.arc(px, yy, 2 + 5 * c * 2, 0, Math.PI * 2);
        ctx.fillStyle = inside ? C.forest : "rgba(141,141,146,.35)"; ctx.fill();
        if (Math.abs(u) < src.na * 1.9 && Math.abs(m) <= 1) {
          ctx.fillStyle = inside ? C.forest : C.ink3;
          ctx.fillText(m === 0 ? "0" : m > 0 ? "+1" : "−1", px, yy + (bi ? 22 : -12));
        }
      }
    });
    ctx.fillStyle = C.ink3; ctx.fillText("● 회절된 빛 (크기 = 세기)", cx, h - 8);
    ctx.textAlign = "left";
  }

  function update() {
    const st = state();
    pO.textContent = st.p;
    const ms = st.sets[0];
    ordEl.textContent = ms.filter((m) => Math.abs(cm(m)) > 1e-6).length <= 1 ? "0차만" : `${ms.filter((m) => Math.abs(cm(m)) > 1e-6).length}개`;
    let mx = 0, mn = 9;
    for (let i = 0; i <= 400; i++) { const v = st.I(i / 400 * st.p); mx = Math.max(mx, v); mn = Math.min(mn, v); }
    const con = (mx - mn) / (mx + mn);
    conEl.textContent = con < 0.005 ? "0 (무늬 없음)" : `${Math.round(con * 100)}%`;
    conEl.classList.toggle("bad", con < 0.005 || mn > TH || mx < TH);
    const pmin = src.lam / (src.na * (obl.checked ? 1 + SIG : 1));
    minEl.textContent = `${pmin < 100 ? pmin.toFixed(1) : Math.round(pmin)} nm`;
    draw();
  }
  pS.addEventListener("input", update);
  obl.addEventListener("change", update);
  const chips = root.querySelectorAll("[data-src]");
  chips.forEach((b) => b.addEventListener("click", () => {
    src = SRC[b.dataset.src]; chips.forEach((o) => o.setAttribute("aria-pressed", o === b)); update();
  }));
  update();
})();
