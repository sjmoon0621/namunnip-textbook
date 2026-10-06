/* 카드: 건강 검진표로 대사 증후군을 알아낼 수 있을까? — 다섯 진단 기준, 생활 습관에 따른 1년 뒤 변화(교육용 어림) */
(() => {
  const root = document.getElementById("card-bio-metabolic");
  if (!root) return;
  const { C, F, fit, clamp } = NM;
  const $ = (s) => root.querySelector(s);

  /* 가상 인물: 지금 수치와 지금 습관 */
  const P = {
    a: { lab: "가상 인물 A · 남 48세 · 사무직", m: true, v: { w: 93, g: 106, s: 134, d: 86, t: 182, h: 38 }, hab: { ex: 0.5, kc: 200, sl: 5.5, dr: true, sm: true } },
    b: { lab: "가상 인물 B · 여 52세 · 자영업", m: false, v: { w: 84, g: 95, s: 126, d: 80, t: 138, h: 47 }, hab: { ex: 1.5, kc: 100, sl: 6, dr: false, sm: false } },
    c: { lab: "가상 인물 C · 남 35세 · 마른 편", m: true, v: { w: 80, g: 103, s: 128, d: 82, t: 172, h: 41 }, hab: { ex: 0, kc: 0, sl: 5, dr: true, sm: true } },
    d: { lab: "가상 인물 D · 여 28세 · 대학원생", m: false, v: { w: 72, g: 88, s: 112, d: 72, t: 85, h: 62 }, hab: { ex: 3, kc: 0, sl: 7, dr: false, sm: false } },
  };
  let who = "a";

  /* 교육용 어림 모형. 기준 습관(주 2.5시간 운동, 열량 균형, 7시간 수면, 음주·흡연 없음)이면 변화 0 */
  function project(v, H) {
    const e = Math.min(H.ex, 7) - 2.5, sd = Math.max(0, 6 - H.sl);
    const dW = clamp((H.kc * 365 - e * 52 * 300) / 7700 * 0.35, -12, 12);
    return {
      dW,
      w: v.w + 0.9 * dW - 0.4 * e,
      g: v.g + 0.9 * dW - 1.2 * e + 2.5 * sd + (H.sm ? 3 : 0),
      s: v.s + 1.0 * dW - 1.5 * e + 1.5 * sd + (H.dr ? 4 : 0),
      d: v.d + 0.6 * dW - 1.0 * e + 1.0 * sd + (H.dr ? 3 : 0),
      t: v.t + 5 * dW - 6 * e + 5 * sd + (H.dr ? 30 : 0),
      h: v.h - 0.35 * dW + 1.0 * e - (H.sm ? 4 : 0),
    };
  }
  const ROWS = [
    { k: "w", name: "허리둘레", unit: "cm", lo: 60, hi: 110, cut: (m) => (m ? 90 : 85), up: true, risk: "복부 비만" },
    { k: "s", name: "혈압", unit: "mmHg", lo: 100, hi: 160, cut: () => 130, up: true, risk: "고혈압" },
    { k: "g", name: "공복 혈당", unit: "mg/dL", lo: 70, hi: 140, cut: () => 100, up: true, risk: "2형 당뇨병" },
    { k: "t", name: "중성 지방", unit: "mg/dL", lo: 40, hi: 300, cut: () => 150, up: true, risk: "이상 지질 혈증·지방간" },
    { k: "h", name: "HDL 콜레스테롤", unit: "mg/dL", lo: 20, hi: 80, cut: (m) => (m ? 40 : 50), up: false, risk: "이상 지질 혈증" },
  ];
  const hit = (r, v, m) => (r.k === "s" ? v.s >= 130 || v.d >= 85 : r.up ? v[r.k] >= r.cut(m) : v[r.k] < r.cut(m));
  const count = (v, m) => ROWS.filter((r) => hit(r, v, m)).length;
  const H = () => ({ ex: +$(".ex").value, kc: +$(".kc").value, sl: +$(".sl").value, dr: $(".dr").checked, sm: $(".sm").checked });

  const { ctx, size } = fit($("canvas"), () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const p = P[who], now = p.v, nx = project(now, H());
    const n0 = count(now, p.m), n1 = count(nx, p.m);
    ctx.textAlign = "left"; ctx.fillStyle = C.ink; ctx.font = `600 13px ${F.sans}`;
    ctx.fillText(p.lab, 10, 18);
    const lx = 10, bx = Math.min(128, w * 0.27), bw = w - bx - 92, top = 34, rh = (h - top - 22) / 5;
    ROWS.forEach((r, i) => {
      const y = top + rh * i, cy = y + rh * 0.55, X = (v) => bx + clamp((v - r.lo) / (r.hi - r.lo), 0, 1) * bw;
      const cut = r.cut(p.m), on = hit(r, nx, p.m), was = hit(r, now, p.m);
      ctx.fillStyle = on ? C.warn : C.ink; ctx.font = `600 12px ${F.sans}`; ctx.textAlign = "left";
      ctx.fillText(r.name, lx, cy - 2);
      ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`;
      ctx.fillText(r.k === "s" ? "≥130/85" : `${r.up ? "≥" : "<"}${cut} ${r.unit}`, lx, cy + 12);
      /* 막대와 위험 구간 */
      ctx.fillStyle = C.rule; ctx.fillRect(bx, cy - 3, bw, 6);
      ctx.fillStyle = "rgba(181,83,47,.22)";
      if (r.up) ctx.fillRect(X(cut), cy - 3, bx + bw - X(cut), 6); else ctx.fillRect(bx, cy - 3, X(cut) - bx, 6);
      ctx.fillStyle = C.warn; ctx.fillRect(Math.round(X(cut)) - 1, cy - 9, 2, 18);
      ctx.fillStyle = C.ink3; ctx.font = `9.5px ${F.mono}`; ctx.textAlign = "center"; ctx.fillText(String(cut), X(cut), cy - 12);
      ctx.textAlign = "left"; ctx.fillText(String(r.lo), bx, cy + 16); ctx.textAlign = "right"; ctx.fillText(String(r.hi), bx + bw, cy + 16);
      /* 지금 → 1년 뒤 */
      const a = X(now[r.k]), b = X(nx[r.k]);
      if (Math.abs(b - a) > 6) { ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(a, cy); ctx.lineTo(b, cy); ctx.stroke(); const dir = Math.sign(b - a); ctx.beginPath(); ctx.moveTo(b - dir * 7, cy - 4); ctx.lineTo(b - dir * 1, cy); ctx.lineTo(b - dir * 7, cy + 4); ctx.stroke(); }
      ctx.lineWidth = 1.6; ctx.strokeStyle = was ? C.warn : C.forest; ctx.fillStyle = C.card; ctx.beginPath(); ctx.arc(a, cy, 5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = on ? C.warn : C.forest; ctx.beginPath(); ctx.arc(b, cy, 5, 0, Math.PI * 2); ctx.fill();
      /* 값 */
      const f = (v) => Math.round(v);
      ctx.textAlign = "left"; ctx.font = `11px ${F.mono}`; ctx.fillStyle = on ? C.warn : C.ink2;
      const txt = r.k === "s" ? [`${f(now.s)}/${f(now.d)}`, `→ ${f(nx.s)}/${f(nx.d)}`] : [`${f(now[r.k])}`, `→ ${f(nx[r.k])}`];
      ctx.fillText(txt[0], bx + bw + 10, cy - 2); ctx.fillText(txt[1], bx + bw + 10, cy + 12);
    });
    /* 범례 */
    const ly = h - 8; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left"; ctx.fillStyle = C.ink3;
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(bx + 4, ly - 4, 4, 0, Math.PI * 2); ctx.stroke(); ctx.fillText("지금", bx + 12, ly);
    ctx.beginPath(); ctx.arc(bx + 54, ly - 4, 4, 0, Math.PI * 2); ctx.fill(); ctx.fillText("1년 뒤", bx + 62, ly);
    ctx.fillStyle = "rgba(181,83,47,.4)"; ctx.fillRect(bx + 112, ly - 7, 14, 6); ctx.fillStyle = C.ink3; ctx.fillText("기준에 해당하는 구간", bx + 130, ly);

    /* 수치 칸 */
    const dd = (s, t, cls) => { const e = $(s); e.textContent = t; e.className = s.slice(1) + (cls ? " " + cls : ""); };
    dd(".dw", `${nx.dW >= 0 ? "+" : "−"}${Math.abs(nx.dW).toFixed(1)} kg`, nx.dW > 1 ? "bad" : nx.dW < -1 ? "good" : "");
    dd(".n0", `${n0} / 5`, n0 >= 3 ? "bad" : "");
    dd(".n1", `${n1} / 5`, n1 >= 3 ? "bad" : n1 < n0 ? "good" : "");
    dd(".dx", n1 >= 3 ? "대사 증후군" : "해당 아님", n1 >= 3 ? "bad" : "good");
    const risks = [...new Set(ROWS.filter((r) => hit(r, nx, p.m)).map((r) => r.risk))];
    const v = $(".verdict");
    if (n1 >= 3) v.textContent = `1년 뒤 ${n1}개 항목에 해당합니다. ${risks.join(", ")}의 위험이 함께 높아지고, 이들이 겹치면 심근 경색·뇌졸중 위험이 더 커집니다.` + (n1 > n0 ? " 습관을 그대로 두면 항목이 늘어납니다." : "");
    else if (n0 >= 3) v.textContent = `지금은 ${n0}개 항목에 해당하지만, 이 습관이면 1년 뒤 ${n1}개로 줄어 기준 아래로 내려갑니다.` + (risks.length ? ` 남은 위험: ${risks.join(", ")}.` : "");
    else v.textContent = n1 ? `1년 뒤 ${n1}개 항목(${risks.join(", ")})에 해당합니다. 아직 대사 증후군은 아니지만 3개가 되면 진단 기준에 듭니다.` : "다섯 항목 모두 기준 안에 있습니다.";
    v.className = "verdict small " + (n1 >= 3 ? "bad" : n1 < n0 || n1 === 0 ? "good" : "");
  }
  function sync() {
    $(".ex-out").textContent = (+$(".ex").value).toFixed(1);
    const k = +$(".kc").value; $(".kc-out").textContent = (k > 0 ? "+" : k < 0 ? "−" : "") + Math.abs(k);
    $(".sl-out").textContent = (+$(".sl").value).toFixed(1);
    draw();
  }
  function load(k) {
    who = k; const hb = P[k].hab;
    $(".ex").value = hb.ex; $(".kc").value = hb.kc; $(".sl").value = hb.sl; $(".dr").checked = hb.dr; $(".sm").checked = hb.sm;
    root.querySelectorAll("[data-p]").forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.p === k)));
    sync();
  }
  $(".who").addEventListener("click", (e) => { const b = e.target.closest("[data-p]"); if (b) load(b.dataset.p); });
  ["ex", "kc", "sl"].forEach((c) => $("." + c).addEventListener("input", sync));
  ["dr", "sm"].forEach((c) => $("." + c).addEventListener("change", sync));
  load("a");
  if (/[?&]demo\b/.test(location.search)) { $(".ex").value = 4; $(".kc").value = -200; $(".sl").value = 7; $(".sm").checked = false; sync(); }
})();
