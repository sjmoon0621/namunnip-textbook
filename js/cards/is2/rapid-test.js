/* 카드: 신속 항원 검사 — 측방 유동 띠, 샌드위치 결합, 검출 한계, PCR 비교, 대조선 */
(() => {
  const root = document.getElementById("card-is2-rapid-test");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const $ = (s) => root.querySelector(s);
  const sV = $(".v"), sD = $(".d");
  const LOD_AG = 6, LOD_PCR = 3;
  let t = 1, parts = [];
  // 감염 뒤 날짜에 따른 바이러스 양 (log10): 2일째 오르기 시작, 4~5일 최고 8.5, 그 뒤 감소
  const load = (d) => (d < 1 ? 1 : d <= 4.5 ? 2 + (8.5 - 2) * (d - 1) / 3.5 : Math.max(1, 8.5 - (d - 4.5) * 0.75));
  const { ctx, size } = fit($("canvas"), () => draw());
  function start() {
    const lv = +sV.value, nol = $(".nolabel").checked;
    const nag = lv >= LOD_AG ? Math.round(Math.min(40, 4 * 10 ** ((lv - LOD_AG) / 2))) : Math.max(0, Math.floor((lv - 4) * 1.5));   // 검출 한계 아래에서는 줄이 보이지 않을 만큼만
    parts = Array.from({ length: 14 }, () => ({ x: -Math.random() * 0.25, y: Math.random(), ag: false, stuck: null }))
      .concat(Array.from({ length: nag }, () => ({ x: -Math.random() * 0.25, y: Math.random(), ag: true, lab: false, stuck: null })));
    for (let i = 0; i < 40; i++) parts.push({ x: 0.22 + Math.random() * 0.05, y: Math.random(), ab: !nol, stuck: null });
    t = 0;
  }
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const sx = 20, sw = w - 40, sy = h * 0.35, sh = h * 0.3, X = (u) => sx + u * sw, Y = (v) => sy + v * sh;
    ctx.fillStyle = "#fbfbf8"; ctx.fillRect(sx, sy, sw, sh); ctx.strokeStyle = C.rule; ctx.strokeRect(sx, sy, sw, sh);
    ctx.fillStyle = "rgba(141,141,146,.12)"; ctx.fillRect(X(0), sy, X(0.18) - X(0), sh); ctx.fillStyle = "rgba(208,58,58,.08)"; ctx.fillRect(X(0.2), sy, X(0.3) - X(0.2), sh);
    const TL = 0.6, CL = 0.8;
    const tCount = parts.filter((p) => p.stuck === "T").length, cCount = parts.filter((p) => p.stuck === "C").length;
    const lineAlpha = (n) => (n < 4 ? 0 : Math.min(0.9, n / 8));
    [[TL, "T", tCount], [CL, "C", cCount]].forEach(([u, lab, n]) => { ctx.fillStyle = `rgba(200,40,70,${0.06 + lineAlpha(n)})`; ctx.fillRect(X(u) - 4, sy, 8, sh); ctx.fillStyle = C.ink; ctx.font = `600 12px ${F.mono}`; ctx.textAlign = "center"; ctx.fillText(lab, X(u), sy - 6); });
    ctx.font = `10px ${F.sans}`; ctx.fillStyle = C.ink2;
    ctx.fillText("시료", X(0.09), sy + sh + 14); ctx.fillText("표지 항체(색 입자)", X(0.25), sy + sh + 14); ctx.fillText("검사선: 고정 항체", X(TL), sy + sh + 14); ctx.fillText("대조선: 항체를 잡는 항체", X(CL), sy + sh + 28);
    parts.forEach((p) => {
      const x = X(Math.min(p.x, 0.98)), y = Y(p.y);
      if (p.ab !== undefined) { if (!p.ab) return; ctx.fillStyle = "rgba(200,40,70,.85)"; ctx.beginPath(); ctx.arc(x, y, 2.6, 0, Math.PI * 2); ctx.fill(); }
      else if (p.ag) { ctx.fillStyle = "#3f6fa3"; ctx.beginPath(); ctx.arc(x, y, 3.2, 0, Math.PI * 2); ctx.fill(); if (p.lab) { ctx.fillStyle = "rgba(200,40,70,.9)"; ctx.beginPath(); ctx.arc(x + 3, y - 2, 2.2, 0, Math.PI * 2); ctx.fill(); } }
      else { ctx.fillStyle = "#c9c9cf"; ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill(); }
    });
    // 키트 창
    const kx = w / 2 - 70, ky = 8; ctx.fillStyle = "#fff"; ctx.strokeStyle = C.ink2; ctx.fillRect(kx, ky, 140, 34); ctx.strokeRect(kx, ky, 140, 34);
    [[kx + 60, tCount, "T"], [kx + 95, cCount, "C"]].forEach(([x, n, l]) => { ctx.fillStyle = `rgba(200,40,70,${lineAlpha(n)})`; ctx.fillRect(x - 3, ky + 4, 6, 26); ctx.fillStyle = C.ink3; ctx.font = `9px ${F.mono}`; ctx.fillText(l, x, ky + 44); });
    ctx.fillStyle = C.ink3; ctx.font = `9px ${F.sans}`; ctx.fillText("결과 창", kx + 20, ky + 20);
  }
  function result() {
    const lv = +sV.value, c = !$(".nolabel").checked;
    $(".n-c").textContent = c ? "보임" : "안 보임"; $(".n-c").className = "n-c " + (c ? "good" : "bad");
    $(".n-r").textContent = !c ? "무효" : lv >= LOD_AG ? "양성" : "음성"; $(".n-r").className = "n-r " + (!c ? "bad" : lv >= LOD_AG ? "bad" : "");
    $(".n-p").textContent = lv >= LOD_PCR ? "양성" : "음성";
  }
  loop($("canvas"), (dt) => {
    t += dt;
    parts.forEach((p) => {
      if (p.stuck) return;
      p.x += dt * 0.12 * (0.8 + 0.4 * ((p.y * 7) % 1));
      if (p.ag && !p.lab && p.x > 0.22 && !$(".nolabel").checked) p.lab = true;
      if (p.ag && p.lab && Math.abs(p.x - 0.6) < 0.01) { p.stuck = "T"; p.x = 0.6; }
      if (p.ab && !p.attached && Math.abs(p.x - 0.8) < 0.01 && Math.random() < 0.5) { p.stuck = "C"; p.x = 0.8; }
    });
    draw();
  });
  sV.addEventListener("input", () => { $(".v-out").textContent = sV.value; $(".d-out").textContent = "—"; result(); });
  sD.addEventListener("input", () => { const L = load(+sD.value); sV.value = Math.round(L * 2) / 2; $(".v-out").textContent = sV.value; $(".d-out").textContent = `${sD.value}일`; result(); start(); });
  $(".nolabel").addEventListener("change", () => { result(); start(); });
  $(".run").addEventListener("click", () => { start(); result(); });
  sD.dispatchEvent(new Event("input"));
  if (/[?&]demo\b/.test(location.search)) { for (let i = 0; i < 300; i++) parts.forEach((p) => { if (p.stuck) return; p.x += 0.02; if (p.ag && p.x > 0.22) p.lab = true; if (p.ag && p.lab && p.x >= 0.6) { p.stuck = "T"; p.x = 0.6; } if (p.ab && p.x >= 0.8 && Math.random() < 0.5) { p.stuck = "C"; p.x = 0.8; } }); }
})();
