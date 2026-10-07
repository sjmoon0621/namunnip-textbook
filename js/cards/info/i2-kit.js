/* 정보과학(탐색·분해·분할 정복) 카드 공용 도구 window.I2 — 파이썬 코드 줄 강조, 시드 난수, 단계 실행기 */
window.I2 = window.I2 || (() => {
  "use strict";
  /* pre 안에 코드 줄을 넣고, set(i)로 i번째 줄을 강조한다 (i < 0이면 강조 없음) */
  function code(pre, lines) {
    pre.textContent = "";
    const ls = lines.map((t) => {
      const s = document.createElement("span");
      s.className = "ln";
      s.textContent = t || " ";
      pre.appendChild(s);
      return s;
    });
    return { set(i) { ls.forEach((s, k) => s.classList.toggle("on", k === i)); } };
  }
  /* 같은 시드면 같은 결과를 내는 난수 (mulberry32) */
  function rng(seed) {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  /* 실행/멈춤 버튼: tick()이 false를 돌려주면 멈춘다. 반환값 stop()으로 멈춘다 */
  function runner(btn, tick, ms) {
    let id = 0;
    const label = btn.textContent;
    const stop = () => { if (id) { clearInterval(id); id = 0; } btn.textContent = label; btn.setAttribute("aria-pressed", "false"); };
    btn.addEventListener("click", () => {
      if (id) { stop(); return; }
      btn.textContent = "멈춤"; btn.setAttribute("aria-pressed", "true");
      id = setInterval(() => { if (tick() === false) stop(); }, typeof ms === "function" ? ms() : ms);
    });
    return { stop, get on() { return !!id; } };
  }
  return { code, rng, runner };
})();
