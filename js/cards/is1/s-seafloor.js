/* 카드: 바다 밑 줄무늬는 무엇을 기록하고 있을까? — 해양저 확장과 고지자기 줄무늬 */
(() => {
  const root = document.getElementById("card-is1-seafloor");
  if (!root) return;
  const { C, F, clamp, fit, loop } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const sRate = $(".rate"), oRate = $(".rate-out"), sX = $(".probe"), oX = $(".probe-out"), play = $(".grow");
  const nHalf = $(".half"), nAge = $(".age"), nPol = $(".pol"), nEdge = $(".edge");

  // 지구 자기장 정자극기 (단위: 백만 년 전, GTS2012). 수만 년보다 짧은 사건은 생략.
  const NORMAL = [[0, 0.781], [0.988, 1.072], [1.778, 1.945], [2.581, 3.032], [3.116, 3.207], [3.330, 3.596],
    [4.187, 4.300], [4.493, 4.631], [4.799, 4.896], [4.997, 5.235]];
  const TMAX = 5.235, D = 250; // 그림 범위: 해령에서 ±250 km
  const normal = (age) => NORMAL.some(([a, b]) => age >= a && age < b);

  let now = 0;              // 재생 중 '지금'이 몇 백만 년 전인지 (0 = 현재)
  let growing = false;
  const { ctx, size } = fit(cv, () => draw());
  const half = () => +sRate.value / 2 * 10; // 한쪽 확장 속도: cm/년 → km/백만 년

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const v = half(), padX = 12;
    const X = (km) => w / 2 + km / D * (w / 2 - padX);
    const mapT = 18, mapB = h * 0.48, profT = mapB + 12, profB = h * 0.66, tlT = Math.max(h * 0.8, h * 0.66 + 34), tlB = tlT + Math.max(10, h * 0.06);
    // 해저 지도 (위에서 본 모습)
    ctx.fillStyle = "#e7e7e0"; ctx.fillRect(padX, mapT, w - 2 * padX, mapB - mapT);
    const made = TMAX - now;  // 재생 시작 이후 만들어진 지각의 나이 범위
    const step = Math.max(0.5, (w - 2 * padX) / 600);
    for (let px = padX; px < w - padX; px += step) {
      const km = (px - w / 2) / (w / 2 - padX) * D;
      const age = Math.abs(km) / v;     // 지금 기준으로 이 지각이 만들어진 뒤 흐른 시간
      if (age > made) continue;         // 재생 시작 전에 있던 지각 → 회색
      const formed = now + age;         // 만들어진 때 (백만 년 전)
      ctx.fillStyle = normal(formed) ? "#2d3a33" : "#f4f4ef";
      ctx.fillRect(px, mapT, step + .6, mapB - mapT);
    }
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1; ctx.strokeRect(padX + .5, mapT + .5, w - 2 * padX - 1, mapB - mapT - 1);
    // 해령 축
    ctx.strokeStyle = C.apple; ctx.lineWidth = 2; ctx.setLineDash([5, 4]);
    ctx.beginPath(); ctx.moveTo(w / 2, mapT - 4); ctx.lineTo(w / 2, mapB + 4); ctx.stroke(); ctx.setLineDash([]);
    ctx.font = `600 11px ${F.sans}`; ctx.fillStyle = C.apple; ctx.textAlign = "center"; ctx.fillText("해령", w / 2, mapT - 5);
    // 판 이동 화살표
    ctx.fillStyle = C.ink; ctx.font = `11px ${F.mono}`;
    ctx.textAlign = "left"; ctx.fillText("← 판 이동", padX + 2, mapT - 5);
    ctx.textAlign = "right"; ctx.fillText("판 이동 →", w - padX - 2, mapT - 5);

    // 선박 자력계 기록 (자기 이상)
    const mid = (profT + profB) / 2, amp = (profB - profT) * 0.36;
    ctx.strokeStyle = C.rule; ctx.beginPath(); ctx.moveTo(padX, mid + .5); ctx.lineTo(w - padX, mid + .5); ctx.stroke();
    ctx.beginPath();
    let first = true, sm = 0;
    for (let px = padX; px < w - padX; px += 1) {
      const km = (px - w / 2) / (w / 2 - padX) * D, age = Math.abs(km) / v;
      const target = age > made ? 0 : normal(now + age) ? 1 : -1;
      sm = first ? target : sm + (target - sm) * 0.35;
      const y = mid - sm * amp;
      first ? ctx.moveTo(px, y) : ctx.lineTo(px, y); first = false;
    }
    ctx.strokeStyle = C.forest; ctx.lineWidth = 1.6; ctx.stroke();
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "left";
    ctx.fillText("배로 잰 자기 이상 (+ 강함 / − 약함)", padX, profT + 2);

    // 거리 눈금
    ctx.textAlign = "center";
    for (let km = -200; km <= 200; km += 100) {
      ctx.fillStyle = C.ink3; ctx.fillText(`${Math.abs(km)}`, X(km), profB + 14);
    }
    ctx.textAlign = "right"; ctx.fillText("해령에서의 거리 (km)", w - padX, profB + 26);

    // 측정 위치
    const pk = +sX.value, px = X(pk);
    ctx.strokeStyle = C.amber; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(px, mapT); ctx.lineTo(px, profB); ctx.stroke();
    ctx.beginPath(); ctx.arc(px, mapT + 10, 5, 0, Math.PI * 2); ctx.fillStyle = C.amber; ctx.fill();

    // 지자기 역전 연대표
    const tl0 = padX + 72, tl1 = w - padX;
    const T = (a) => tl0 + a / TMAX * (tl1 - tl0);
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink2; ctx.textAlign = "left";
    ctx.fillText("지자기 역전", padX, tlB - 1);
    for (let a = 0; a < TMAX; a += 0.005) {
      ctx.fillStyle = normal(a) ? "#2d3a33" : "#f4f4ef"; ctx.fillRect(T(a), tlT, (tl1 - tl0) * 0.005 / TMAX + .6, tlB - tlT);
    }
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1; ctx.strokeRect(tl0 + .5, tlT + .5, tl1 - tl0 - 1, tlB - tlT - 1);
    ctx.fillStyle = C.ink3; ctx.textAlign = "center";
    for (let a = 0; a <= 5; a++) ctx.fillText(`${a * 100}`, T(a), tlB + 12);
    ctx.textAlign = "left"; ctx.fillText("(만 년 전)", padX, tlB + 12);
    ctx.textAlign = "center"; ctx.fillStyle = C.ink2;
    // 측정 위치의 나이 표시
    const pa = Math.abs(pk) / v;
    if (pa <= made) {
      ctx.strokeStyle = C.amber; ctx.lineWidth = 2;
      const ta = T(Math.min(now + pa, TMAX));
      ctx.beginPath(); ctx.moveTo(ta, tlT - 3); ctx.lineTo(ta, tlB + 3); ctx.stroke();
    }
    // 재생 중이면 현재 시점
    if (now > 0) {
      ctx.fillStyle = C.apple; ctx.textAlign = "left"; ctx.font = `600 12px ${F.mono}`;
      ctx.fillText(`${Math.round(now * 100)}만 년 전`, padX + 4, mapB - 8);
    }
    ctx.textAlign = "left";
  }

  function update() {
    oRate.textContent = (+sRate.value).toFixed(1);
    const v = half(), pk = +sX.value, age = Math.abs(pk) / v;
    oX.textContent = `${pk < 0 ? "서쪽 " : pk > 0 ? "동쪽 " : ""}${Math.abs(pk)}`;
    nHalf.textContent = `${v.toFixed(1)} km`;
    if (age <= TMAX) {
      nAge.textContent = `${Math.round(age * 100)}만 년`;
      nPol.textContent = normal(age) ? "지금과 같음" : "지금과 반대";
    } else { nAge.textContent = `${Math.round(age * 100)}만 년`; nPol.textContent = "그림 범위 밖"; }
    nEdge.textContent = `${Math.round(v * TMAX)} km`;
    draw();
  }
  sRate.addEventListener("input", update);
  sX.addEventListener("input", update);
  root.querySelectorAll("[data-rate]").forEach((b) => b.addEventListener("click", () => { sRate.value = b.dataset.rate; update(); }));
  play.addEventListener("click", () => { now = TMAX; growing = true; });
  // 캔버스를 눌러 측정 위치 옮기기
  cv.addEventListener("pointerdown", (e) => {
    const r = cv.getBoundingClientRect(), w = r.width;
    const km = ((e.clientX - r.left) - w / 2) / (w / 2 - 12) * D;
    sX.value = Math.round(clamp(km, -D, D)); update();
  });
  update();
  loop(cv, (dt) => {
    if (!growing) return;
    now = Math.max(0, now - dt * 0.55);
    if (now === 0) growing = false;
    draw();
  });
})();
