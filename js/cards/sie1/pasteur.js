/* 카드: 고깃국물 속 미생물은 저절로 생길까? — 파스퇴르 백조목 플라스크, 두 가설의 예측 비교 */
(() => {
  const root = document.getElementById("card-sie1-pasteur");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const boil = $(".boil");
  const NAME = { open: "열린 입구", swan: "백조목", broken: "목 잘라 냄", tilt: "백조목·기울임" };
  let setup = "open", day = 0, run = null, dust = [];
  const tbl = L.table($(".tbl-host"), [{ key: "s", label: "장치" }, { key: "b", label: "끓임" }, { key: "r", label: "결과" }]);

  // 먼지(미생물)가 국물에 닿는 날. Infinity면 끝까지 안 닿음
  function contactDay(s, boiled) {
    if (!boiled) return 0;
    if (s === "swan") return Infinity;
    if (s === "tilt") return 5;                       // 5일째 기울였다 되돌림
    return 0.5 + Math.random();
  }
  const turb = (d) => (run && d > run.c ? 1 / (1 + Math.exp(-(d - run.c - 2.2) * 2.4)) : 0);

  const app = fit($(".cv-wide"), () => draw());
  function draw() {
    const { ctx } = app, { w, h } = app.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const R = Math.min(50, h * 0.24), cx = w * 0.32, cy = h - R - 14, d = Math.asin(10 / R), topY = cy - Math.sqrt(R * R - 100);
    // 국물: 원 안에서 수면 아래만
    const t = turb(day);
    ctx.save(); ctx.beginPath(); ctx.rect(cx - R, cy + R * 0.1, 2 * R, R); ctx.clip();
    ctx.fillStyle = `rgba(${Math.round(232 - 60 * t)},${Math.round(196 - 70 * t)},${Math.round(120 - 50 * t)},${0.55 + 0.4 * t})`;
    ctx.beginPath(); ctx.arc(cx, cy, R - 2, 0, Math.PI * 2); ctx.fill();
    if (t > 0.05) for (let i = 0; i < 50 * t; i++) { const a = i * 2.4, r = (R - 8) * Math.sqrt((i % 13) / 13); ctx.fillStyle = "rgba(90,70,40,.55)"; ctx.fillRect(cx + Math.cos(a) * r, cy + R * 0.45 + Math.sin(a) * R * 0.3, 2, 2); }
    ctx.restore();
    // 유리 몸통 + 짧은 목
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, cy, R, -Math.PI / 2 + d, Math.PI * 1.5 - d); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - 10, topY); ctx.lineTo(cx - 10, topY - 22); ctx.moveTo(cx + 10, topY); ctx.lineTo(cx + 10, topY - 22); ctx.stroke();
    const n0 = topY - 22;
    let mouth;
    if (setup === "open" || setup === "broken") {
      ctx.beginPath(); ctx.moveTo(cx - 10, n0); ctx.lineTo(cx - 10, n0 - 30); ctx.moveTo(cx + 10, n0); ctx.lineTo(cx + 10, n0 - 30); ctx.stroke();
      mouth = { x: cx, y: n0 - 30 };
      if (setup === "broken") { ctx.setLineDash([3, 3]); ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx + 30, n0 - 30); ctx.quadraticCurveTo(cx + 60, n0 - 60, cx + 100, n0 - 20); ctx.quadraticCurveTo(cx + 125, n0 + 5, cx + 140, n0 - 40); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("잘라 낸 목", cx + 70, n0 - 54); }
    } else {
      // 백조목: 위로 올라갔다 아래로 휘었다가 다시 위로
      ctx.lineWidth = 22; ctx.strokeStyle = C.ink2; ctx.lineCap = "butt";
      const neck = () => { ctx.beginPath(); ctx.moveTo(cx, n0 + 2); ctx.quadraticCurveTo(cx, n0 - 50, cx + 50, n0 - 22); ctx.quadraticCurveTo(cx + 90, n0 + 4, cx + 110, n0 + 12); ctx.quadraticCurveTo(cx + 140, n0 + 20, cx + 150, n0 - 30); ctx.stroke(); };
      neck(); ctx.lineWidth = 18; ctx.strokeStyle = C.card; neck();
      ctx.fillStyle = C.card; ctx.fillRect(cx - 8, n0 - 2, 16, 8);
      mouth = { x: cx + 150, y: n0 - 30 };
      // 굽은 곳의 물방울과 걸린 먼지
      ctx.fillStyle = "rgba(110,164,230,.7)"; ctx.beginPath(); ctx.arc(cx + 110, n0 + 16, 4, 0, Math.PI * 2); ctx.fill();
      const caught = Math.min(14, Math.floor(day * 1.2));
      ctx.fillStyle = "#6b5a3a"; for (let i = 0; i < caught; i++) ctx.fillRect(cx + 102 + (i * 7) % 16, n0 + 12 + (i * 3) % 6, 2, 2);
      if (setup === "tilt" && day >= 4.6 && day <= 5.4) { ctx.fillStyle = C.warn; ctx.font = `600 11px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("기울임 → 국물이 먼지에 닿음", cx + R + 10, cy + 10); }
    }
    // 먼지 입자
    ctx.fillStyle = "#6b5a3a";
    dust.forEach((p) => ctx.fillRect(p.x, p.y, 2, 2));
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("공기 중 먼지(미생물 포함)", 12, 16);
    // 달력
    ctx.fillStyle = C.ink; ctx.font = `600 22px ${F.mono}`; ctx.textAlign = "right"; ctx.fillText(`${Math.floor(day)}일째`, w - 14, 34);
    ctx.font = `11px ${F.sans}`; ctx.fillStyle = t > 0.5 ? C.warn : C.forest; ctx.fillText(t > 0.5 ? "탁해짐 (미생물 증식)" : "맑음", w - 14, 52);
    app.mouth = mouth;
  }
  function predict() {
    const boiled = boil.checked, sealedDust = setup === "swan";
    $(".n-a").textContent = "탁해짐";                                  // 공기가 통하므로
    $(".n-b").textContent = !boiled ? "탁해짐" : sealedDust ? "맑게 남음" : "탁해짐";
    $(".n-r").textContent = "—"; $(".n-r").className = "n-r";
  }
  loop($(".cv-wide"), (dt) => {
    const { w } = app.size;
    if (dust.length < 30 && Math.random() < 0.3) dust.push({ x: Math.random() * w, y: 20, vx: (Math.random() - 0.5) * 10, vy: 8 + Math.random() * 10 });
    dust.forEach((p) => { p.x += p.vx * dt; p.y += p.vy * dt; });
    const m = app.mouth;
    dust = dust.filter((p) => p.y < app.size.h && !(m && Math.abs(p.x - m.x) < 10 && Math.abs(p.y - m.y) < 6));
    if (run) {
      day = Math.min(30, day + dt * 6);
      if (day >= 30 && !run.done) {
        run.done = true;
        const cloudy = turb(30) > 0.5;
        const r = cloudy ? `${Math.max(1, Math.round(run.c + 2.2))}일째 탁해짐` : "30일 내내 맑음";
        $(".n-r").textContent = cloudy ? "탁해짐" : "맑게 남음"; $(".n-r").className = "n-r " + (cloudy ? "bad" : "good");
        tbl.add({ s: NAME[setup], b: boil.checked ? "예" : "아니요", r });
      }
    }
    draw();
  });
  function start() { day = 0; run = { c: contactDay(setup, boil.checked), done: false }; predict(); }
  $(".setup").addEventListener("click", (e) => {
    const b = e.target.closest("[data-s]"); if (!b) return;
    setup = b.dataset.s; root.querySelectorAll("[data-s]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    run = null; day = 0; predict(); draw();
  });
  boil.addEventListener("change", () => { run = null; day = 0; predict(); draw(); });
  $(".run").addEventListener("click", start);
  $(".clear").addEventListener("click", () => tbl.clear());
  predict();
  if (L.demo) {
    ["open", "broken", "tilt", "swan"].forEach((s) => { setup = s; run = { c: contactDay(s, true) }; const cl = turb(30) > 0.5; tbl.add({ s: NAME[s], b: "예", r: cl ? `${Math.round(run.c + 2.2)}일째 탁해짐` : "30일 내내 맑음" }); });
    setup = "swan"; root.querySelector('[data-s="swan"]').click(); day = 30; run = { c: Infinity, done: true }; predict(); $(".n-r").textContent = "맑게 남음";
  }
})();
