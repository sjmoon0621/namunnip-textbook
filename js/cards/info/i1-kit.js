/* 정보과학(함수·재귀·자료 구조) 카드 공용 도구 window.I1 — 파이썬 코드 줄 강조, 단계 실행기, 캔버스 도우미 */
window.I1 = window.I1 || (() => {
  "use strict";
  const KW = new Set(["def", "return", "if", "elif", "else", "for", "while", "in", "not", "and", "or", "import", "from", "class", "None", "True", "False", "pass", "break", "continue", "lambda", "global", "is"]);
  const BI = new Set(["print", "len", "range", "str", "int", "list", "append", "pop", "popleft", "deque", "sum"]);
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  /* 한 줄을 간단히 색칠한다: 주석, 문자열, 예약어, 내장 함수, 숫자 */
  function paint(line) {
    const re = /("[^"]*"|'[^']*')|(#.*$)|([A-Za-z_]\w*)|(\d+)/g;
    let out = "", last = 0, m;
    while ((m = re.exec(line))) {
      out += esc(line.slice(last, m.index));
      if (m[1]) out += `<span class="s">${esc(m[1])}</span>`;
      else if (m[2]) out += `<span class="c">${esc(m[2])}</span>`;
      else if (m[3]) out += KW.has(m[3]) ? `<span class="k">${m[3]}</span>` : BI.has(m[3]) ? `<span class="b">${m[3]}</span>` : m[3];
      else out += `<span class="d">${m[4]}</span>`;
      last = re.lastIndex;
    }
    return out + esc(line.slice(last));
  }

  /* pre에 코드를 넣는다. 반환 set(n | [n…])은 1부터 센 줄 번호를 강조한다. dim([n…])은 흐리게 */
  function code(pre, src) {
    const lines = Array.isArray(src) ? src : src.split("\n");
    pre.innerHTML = lines.map((l) => `<span class="ln">${paint(l) || " "}</span>`).join("");
    const ls = [...pre.querySelectorAll(".ln")];
    return {
      set(n) { const a = [].concat(n); ls.forEach((s, k) => s.classList.toggle("on", a.includes(k + 1))); },
      dim(n) { const a = [].concat(n || []); ls.forEach((s, k) => s.classList.toggle("off", a.includes(k + 1))); },
    };
  }

  /* 단계 실행기. box 안의 .s-first .s-prev .s-next .s-play .s-pos를 쓴다.
     count()는 전체 단계 수, show(i)는 i번째 단계를 그린다. */
  function stepper(box, count, show, ms = 650) {
    const $ = (s) => box.querySelector(s);
    let i = 0, id = 0;
    const play = $(".s-play");
    const stop = () => { if (id) { clearInterval(id); id = 0; } if (play) play.textContent = "재생"; };
    const go = (k) => {
      const n = Math.max(1, count());
      i = Math.max(0, Math.min(n - 1, k));
      show(i);
      const pos = $(".s-pos"); if (pos) pos.textContent = `${i + 1} / ${n}`;
    };
    $(".s-first") && $(".s-first").addEventListener("click", () => { stop(); go(0); });
    $(".s-prev") && $(".s-prev").addEventListener("click", () => { stop(); go(i - 1); });
    $(".s-next") && $(".s-next").addEventListener("click", () => { stop(); go(i + 1); });
    $(".s-last") && $(".s-last").addEventListener("click", () => { stop(); go(count() - 1); });
    if (play) play.addEventListener("click", () => {
      if (id) { stop(); return; }
      if (i >= count() - 1) go(0);
      play.textContent = "멈춤";
      id = setInterval(() => { if (i >= count() - 1) stop(); else go(i + 1); }, ms);
    });
    return { go, stop, get i() { return i; } };
  }

  /* 모서리가 둥근 사각형 경로 */
  function rrect(ctx, x, y, w, h, r = 3) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
  }

  /* 화살표 (끝에 삼각형 머리) */
  function arrow(ctx, x0, y0, x1, y1, col, curve = 0) {
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 1.3;
    const mx = (x0 + x1) / 2, my = (y0 + y1) / 2 - curve;
    ctx.beginPath(); ctx.moveTo(x0, y0);
    let a;
    if (curve) { ctx.quadraticCurveTo(mx, my, x1, y1); a = Math.atan2(y1 - my, x1 - mx); }
    else { ctx.lineTo(x1, y1); a = Math.atan2(y1 - y0, x1 - x0); }
    ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x1, y1);
    ctx.lineTo(x1 - 7 * Math.cos(a - 0.4), y1 - 7 * Math.sin(a - 0.4));
    ctx.lineTo(x1 - 7 * Math.cos(a + 0.4), y1 - 7 * Math.sin(a + 0.4));
    ctx.closePath(); ctx.fill();
  }

  /* 글자가 칸보다 길면 줄여서 쓴다 */
  function fitText(ctx, s, x, y, maxW) {
    let t = String(s);
    if (ctx.measureText(t).width <= maxW) { ctx.fillText(t, x, y); return; }
    while (t.length > 1 && ctx.measureText(t + "…").width > maxW) t = t.slice(0, -1);
    ctx.fillText(t + "…", x, y);
  }

  const demo = /[?&]demo\b/.test(location.search);
  return { code, stepper, rrect, arrow, fitText, paint, esc, demo };
})();
