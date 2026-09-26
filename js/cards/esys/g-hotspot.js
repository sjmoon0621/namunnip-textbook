/* 카드: 하와이 섬들의 나이로 판의 속도를 잴 수 있을까? — 열점 단면과 나이–거리 그래프 */
(() => {
  const root = document.getElementById("card-esys-hotspot");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sV = $(".v"), oV = $(".v-out"), nM = $(".n-m"), nE = $(".n-err"), nF = $(".n-fit");
  // [이름, 킬라우에아에서의 거리 km, 나이 백만 년] 대략값
  const IS = [["하와이", 0, 0.4], ["마우이", 220, 1.3], ["몰로카이", 280, 1.9], ["오아후", 350, 3.0], ["카우아이", 520, 5.1], ["니호아", 780, 7.2], ["네커", 1060, 10.3], ["미드웨이", 2430, 27.7]];
  const vFit = IS.reduce((a, [, d, t]) => a + d * t, 0) / IS.reduce((a, [, , t]) => a + t * t, 0) / 10; // cm/년 (km/백만 년 ÷ 10)
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const v = +sV.value, x0 = 52, x1 = w - 16, X = (d) => x1 - d / 2600 * (x1 - x0);
    // 위: 단면 (판과 플룸)
    const sea = h * 0.14, pl = h * 0.25, pb = h * 0.31;
    ctx.fillStyle = "rgba(110,164,230,.18)"; ctx.fillRect(x0, sea, x1 - x0, pl - sea);
    ctx.fillStyle = "#8a6d57"; ctx.fillRect(x0, pl, x1 - x0, pb - pl);
    ctx.fillStyle = "rgba(181,83,47,.16)"; ctx.fillRect(x0, pb, x1 - x0, h * 0.37 - pb);
    const px = X(0); const g = ctx.createLinearGradient(0, pb, 0, h * 0.37); g.addColorStop(0, "#e0602a"); g.addColorStop(1, "rgba(224,96,42,0)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(px - 10, h * 0.37); ctx.quadraticCurveTo(px - 26, pb + 4, px, pb); ctx.quadraticCurveTo(px + 26, pb + 4, px + 10, h * 0.37); ctx.fill();
    IS.forEach(([n, d, t]) => { const hh = Math.max(3, 34 * Math.exp(-t / 4)), bw = 10 + 6 * Math.exp(-t / 6); ctx.fillStyle = t < 1 ? "#b5532f" : "#6f5a48"; ctx.beginPath(); ctx.moveTo(X(d) - bw, pl); ctx.lineTo(X(d), pl - hh - 6 + (t > 8 ? 14 : 0)); ctx.lineTo(X(d) + bw, pl); ctx.fill(); });
    ctx.fillStyle = C.ink2; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("열점 (플룸)", px - 70, pb + 12);
    ctx.fillText("해수면", x0 + 4, sea - 4); ctx.fillStyle = "#fff"; ctx.fillText("태평양판", X(1900), pl + 13);
    // 판 이동 화살표
    ctx.strokeStyle = C.ink; ctx.fillStyle = C.ink; ctx.lineWidth = 2; const ay = pl + 7, ax = (x0 + x1) / 2; ctx.beginPath(); ctx.moveTo(ax + 40, ay); ctx.lineTo(ax - 40, ay); ctx.stroke(); ctx.beginPath(); ctx.moveTo(ax - 46, ay); ctx.lineTo(ax - 36, ay - 5); ctx.lineTo(ax - 36, ay + 5); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.font = `10px ${F.sans}`; ctx.fillText("판의 이동 방향(북서)", ax + 46, ay + 4);
    // 아래: 나이–거리
    const gy0 = h - 30, gy1 = h * 0.43, Y = (t) => gy0 - t / 30 * (gy0 - gy1);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, gy1); ctx.lineTo(x0, gy0); ctx.lineTo(x1, gy0); ctx.stroke();
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "right"; [0, 10, 20, 30].forEach((t) => ctx.fillText(`${t}`, x0 - 4, Y(t) + 3));
    ctx.save(); ctx.translate(14, (gy0 + gy1) / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = "center"; ctx.fillText("나이 (백만 년)", 0, 0); ctx.restore();
    ctx.textAlign = "center"; [0, 500, 1000, 1500, 2000, 2500].forEach((d) => ctx.fillText(`${d} km`, X(d), gy0 + 13));
    ctx.strokeStyle = "#e0a02a"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(0), Y(0)); const dm = Math.min(2600, 30 * v * 10); ctx.lineTo(X(dm), Y(dm / (v * 10))); ctx.stroke();
    IS.forEach(([n, d, t], i) => { ctx.fillStyle = "#3f6fa3"; ctx.beginPath(); ctx.arc(X(d), Y(t), 4, 0, Math.PI * 2); ctx.fill(); if (i === 1 || i === 2) return; ctx.fillStyle = C.ink2; ctx.font = `10px ${F.sans}`; ctx.textAlign = i === 0 ? "right" : "center"; ctx.fillText(n, X(d) + (i === 0 ? -2 : 0), Y(t) - (i === 0 ? 8 : 9)); });
  }
  function update() {
    const v = +sV.value; oV.textContent = v.toFixed(1);
    nM.textContent = `${(2430 / (v * 10)).toFixed(1)} 백만 년 (실제 약 27.7)`;
    const err = IS.reduce((a, [, d, t]) => a + Math.abs(d / (v * 10) - t), 0) / IS.length; nE.textContent = `${err.toFixed(1)} 백만 년`;
    nF.textContent = Math.abs(v - vFit) < 0.4 ? `약 ${vFit.toFixed(1)} cm/년 — 찾았습니다` : "막대를 움직여 찾아보세요";
    draw();
  }
  sV.addEventListener("input", update); update();
})();
