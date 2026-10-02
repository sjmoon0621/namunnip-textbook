/* 카드: 생활 로봇 설계 — 할 일별 필요한 감지·판단·구동 부품 조합, 부품 수·가격 제약 */
(() => {
  const root = document.getElementById("card-is2-robot-design");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  // 부품: [이름, 종류(s 감지, j 판단, a 구동), 가격(만 원)]
  const PART = {
    lidar: ["라이다 (거리)", "s", 30], cam: ["카메라", "s", 8], ir: ["적외선 근접", "s", 2], bump: ["범퍼 (접촉)", "s", 1], cliff: ["낙하 감지", "s", 2],
    mic: ["마이크", "s", 2], load: ["무게 센서", "s", 3], imu: ["손목 가속도 센서", "s", 5],
    slam: ["지도 만들기 (SLAM)", "j", 10], vision: ["영상 인식 AI", "j", 15], voice: ["음성 인식 AI", "j", 10], net: ["무선 통신", "j", 3],
    wheel: ["바퀴 모터", "a", 10], suction: ["흡입 모터", "a", 8], screen: ["스피커·화면", "a", 6], arm: ["로봇 팔", "a", 60],
  };
  // 할 일: [설명, 필요 부품의 대안 목록 (하나라도 모두 갖추면 해결)]
  const TASK = {
    serve: [["테이블까지 길 찾기", [["lidar", "slam", "wheel"], ["cam", "vision", "slam", "wheel"]]], ["갑자기 다가온 아이 피하기", [["lidar", "wheel"], ["cam", "vision", "wheel"], ["ir", "wheel"]]], ["손님이 음식을 내렸는지 알기", [["load"], ["cam", "vision"]]], ["손님에게 도착 알리기", [["screen"]]]],
    clean: [["벽·가구 피하기", [["ir", "wheel"], ["bump", "wheel"], ["lidar", "wheel"]]], ["계단에서 떨어지지 않기", [["cliff", "wheel"]]], ["먼지 빨아들이기", [["suction"]]], ["안 닦은 곳 찾아가기", [["lidar", "slam", "wheel"], ["cam", "slam", "wheel"]]]],
    care: [["넘어진 것 알아채기", [["imu"], ["cam", "vision"]]], ["말을 알아듣고 대답하기", [["mic", "voice", "screen"]]], ["약 먹을 시간 알리기", [["screen"]]], ["위급할 때 보호자에게 연락", [["net"]]]],
  };
  let kind = "serve"; const sel = new Set();
  $(".parts").innerHTML = Object.entries(PART).map(([k, p]) => `<button class="chip" data-p="${k}" aria-pressed="false">${p[0]}</button>`).join("");
  const { ctx, size } = fit($("canvas"), () => draw());
  const solved = (alts) => alts.some((a) => a.every((p) => sel.has(p)));
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const cols = [["s", "감지", "#3f6fa3"], ["j", "판단", "#8a5fd0"], ["a", "구동", C.forest]], cw = w * 0.16;
    cols.forEach(([t, name, c], i) => {
      const x = 12 + i * (cw + 14);
      ctx.fillStyle = c; ctx.font = `600 12px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText(name, x, 16);
      const items = [...sel].filter((k) => PART[k][1] === t);
      items.forEach((k, j) => { ctx.fillStyle = "#fff"; ctx.strokeStyle = c; ctx.lineWidth = 1.2; ctx.fillRect(x, 24 + j * 26, cw, 22); ctx.strokeRect(x + 0.5, 24.5 + j * 26, cw - 1, 21); ctx.fillStyle = C.ink; ctx.font = `10px ${F.sans}`; ctx.fillText(PART[k][0], x + 4, 39 + j * 26, cw - 8); });
      if (i < 2) { ctx.strokeStyle = C.ink3; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x + cw + 2, 60); ctx.lineTo(x + cw + 12, 60); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x + cw + 12, 60); ctx.lineTo(x + cw + 7, 56); ctx.lineTo(x + cw + 7, 64); ctx.fill(); }
    });
    const tx = 12 + 3 * (cw + 14) + 2;
    ctx.fillStyle = C.ink; ctx.font = `600 12px ${F.sans}`; ctx.fillText("할 일", tx, 16);
    let n = 0;
    TASK[kind].forEach(([t, alts], i) => { const ok = solved(alts); if (ok) n++; ctx.fillStyle = ok ? C.forest : C.warn; ctx.font = `600 13px ${F.sans}`; ctx.fillText(ok ? "✓" : "✗", tx, 40 + i * 24); ctx.fillStyle = ok ? C.ink : C.ink3; ctx.font = `11px ${F.sans}`; ctx.fillText(t, tx + 16, 40 + i * 24, w - tx - 20); });
    const cost = [...sel].reduce((a, k) => a + PART[k][2], 0);
    $(".n-d").textContent = `${n} / 4`; $(".n-d").className = "n-d " + (n === 4 ? "good" : "");
    $(".n-p").textContent = `${sel.size}개`; $(".n-p").className = "n-p " + (sel.size > 7 ? "bad" : "");
    $(".n-c").textContent = `${cost}만 원`;
    const v = $(".verdict");
    v.textContent = n === 4 && sel.size <= 7 ? "모든 일을 해결했습니다. 쓰지 않는 부품을 빼서 더 싸게 만들 수 있는지 확인해 보세요." : sel.size > 7 ? "부품이 너무 많습니다. 여러 일을 함께 해결하는 부품을 찾아보세요." : "아직 해결하지 못한 일이 있습니다. 그 일에 무엇을 감지하고 무엇을 움직여야 하는지 생각해 보세요.";
    v.className = "verdict small " + (n === 4 && sel.size <= 7 ? "good" : sel.size > 7 ? "bad" : "");
  }
  root.addEventListener("click", (e) => {
    const p = e.target.closest("[data-p]"), k = e.target.closest("[data-k]");
    if (p) { const id = p.dataset.p; sel.has(id) ? sel.delete(id) : sel.add(id); p.setAttribute("aria-pressed", String(sel.has(id))); draw(); }
    if (k) { kind = k.dataset.k; root.querySelectorAll("[data-k]").forEach((x) => x.setAttribute("aria-pressed", String(x === k))); draw(); }
  });
  draw();
  if (/[?&]demo\b/.test(location.search)) ["lidar", "slam", "wheel", "load", "screen"].forEach((id) => root.querySelector(`[data-p="${id}"]`).click());
})();
