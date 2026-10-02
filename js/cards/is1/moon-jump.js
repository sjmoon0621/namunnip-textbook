/* 카드: 달에서 뛰면 얼마나 높이, 얼마나 오래 떠 있을까? — 지구·달 도약 비교, 무게와 질량, 망치와 깃털 */
(() => {
  const root = document.getElementById("card-is1-moon-jump");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const $ = (s) => root.querySelector(s);
  const sV = $(".v"), sM = $(".m");
  const G = { e: 9.8, m: 1.62 };
  let mode = null, t = 0;
  const { ctx, size } = fit($("canvas"), () => draw());

  function person(x, y, s, col, air) {
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 2.4; ctx.lineCap = "round";
    ctx.beginPath(); ctx.arc(x, y - 30 * s, 6 * s, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x, y - 24 * s); ctx.lineTo(x, y - 10 * s);
    const k = air ? 6 : 0;
    ctx.moveTo(x, y - 10 * s); ctx.lineTo(x - 5 * s, y - k * s * 0.3); ctx.moveTo(x, y - 10 * s); ctx.lineTo(x + 5 * s, y - k * s * 0.3);
    ctx.moveTo(x, y - 20 * s); ctx.lineTo(x - 8 * s, y - (air ? 28 : 14) * s); ctx.moveTo(x, y - 20 * s); ctx.lineTo(x + 8 * s, y - (air ? 28 : 14) * s); ctx.stroke(); ctx.lineCap = "butt";
  }
  function panel(x0, w, h, key, label, sky, ground) {
    const g = G[key], v = +sV.value, Hmax = 4 ** 2 / (2 * G.m);   // 눈금: 가장 높은 경우
    const base = h - 22, sc = (h - 60) / Hmax;
    ctx.fillStyle = sky; ctx.fillRect(x0, 0, w, h);
    ctx.fillStyle = ground; ctx.fillRect(x0, base, w, h - base);
    // 높이 눈금
    ctx.strokeStyle = "rgba(255,255,255,.25)"; ctx.fillStyle = "rgba(255,255,255,.7)"; ctx.font = `10px ${F.mono}`; ctx.textAlign = "left";
    for (let m = 1; m <= Hmax; m++) { const y = base - m * sc; ctx.beginPath(); ctx.moveTo(x0 + 4, y); ctx.lineTo(x0 + w - 4, y); ctx.stroke(); ctx.fillText(m + " m", x0 + 6, y - 3); }
    ctx.fillStyle = "#fff"; ctx.font = `600 13px ${F.sans}`; ctx.fillText(label, x0 + 8, 18);
    let y = 0, air = false;
    if (mode === "jump") { const T = 2 * v / g; if (t < T) { y = v * t - g * t * t / 2; air = true; } }
    // 궤적 최고점 표시
    const hmax = v * v / (2 * g);
    ctx.setLineDash([3, 3]); ctx.strokeStyle = "rgba(255,210,120,.8)"; ctx.beginPath(); ctx.moveTo(x0 + w * 0.2, base - hmax * sc); ctx.lineTo(x0 + w * 0.55, base - hmax * sc); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = "rgba(255,210,120,.95)"; ctx.font = `10.5px ${F.mono}`; ctx.fillText(`최고 ${hmax.toFixed(2)} m`, x0 + w * 0.2, base - hmax * sc - 4);
    person(x0 + w * 0.35, base - y * sc, 1, "#f3f4ef", air);
    // 망치와 깃털
    if (mode === "drop") {
      const H = 1.5, fx = x0 + w * 0.72;
      const yh = Math.max(0, H - g * t * t / 2);
      const yf = key === "e" ? Math.max(0, H - 0.6 * t) : yh;   // 지구: 깃털은 공기 저항으로 거의 등속
      ctx.fillStyle = "#cfcfd4"; ctx.fillRect(fx - 7, base - yh * sc - 6, 14, 6); ctx.fillRect(fx - 1.5, base - yh * sc - 18, 3, 12);
      ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.5; ctx.beginPath(); const yy = base - yf * sc; ctx.moveTo(fx + 20, yy); ctx.quadraticCurveTo(fx + 28, yy - 10, fx + 36, yy - 16); ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,.75)"; ctx.font = `10px ${F.sans}`; ctx.fillText("망치  깃털", fx - 8, base + 14);
    }
    ctx.fillStyle = "#fff"; ctx.font = `600 12px ${F.mono}`; ctx.textAlign = "right"; ctx.fillText(`t = ${t.toFixed(2)} s`, x0 + w - 8, 18);
  }
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    panel(0, w / 2 - 2, h, "e", "지구", "#6e9fcf", "#6f8f4e");
    panel(w / 2 + 2, w / 2 - 2, h, "m", "달", "#16181d", "#8d8d92");
  }
  function nums() {
    const v = +sV.value, m = +sM.value;
    $(".v-out").textContent = v.toFixed(1); $(".m-out").textContent = m;
    $(".n-h").textContent = `${(v * v / 2 / G.e).toFixed(2)}/${(v * v / 2 / G.m).toFixed(2)}`;
    $(".n-t").textContent = `${(2 * v / G.e).toFixed(2)}/${(2 * v / G.m).toFixed(2)}`;
    $(".n-w").textContent = `${Math.round(m * G.e)}/${Math.round(m * G.m)}`;
  }
  loop($("canvas"), (dt) => { if (mode) { t += dt; const end = mode === "jump" ? 2 * +sV.value / G.m + 0.6 : 3; if (t > end) t = end; } draw(); });
  [sV, sM].forEach((el) => el.addEventListener("input", () => { nums(); draw(); }));
  $(".jump").addEventListener("click", () => { mode = "jump"; t = 0; });
  $(".drop").addEventListener("click", () => { mode = "drop"; t = 0; });
  nums();
  if (/[?&]demo\b/.test(location.search)) { mode = "jump"; t = 0.51; }
})();
