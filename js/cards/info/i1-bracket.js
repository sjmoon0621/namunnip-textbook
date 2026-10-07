/* 카드: 괄호 짝과 후위 표기식을 스택 하나로 어떻게 처리할까? */
(() => {
  const root = document.getElementById("card-info-bracket");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const { code, stepper, rrect, fitText } = I1;

  const SRC = {
    br: ["def balanced(s):", "    pairs = {')': '(', ']': '[', '}': '{'}", "    stack = []", "    for ch in s:", "        if ch in '([{':", "            stack.append(ch)", "        elif ch in pairs:", "            if not stack or stack.pop() != pairs[ch]:", "                return False", "    return not stack"],
    pf: ["import operator as op", "OPS = {'+': op.add, '-': op.sub, '*': op.mul, '/': op.truediv}", "", "def eval_postfix(expr):", "    stack = []", "    for t in expr.split():", "        if t in OPS:", "            b = stack.pop()", "            a = stack.pop()", "            stack.append(OPS[t](a, b))", "        else:", "            stack.append(int(t))", "    return stack.pop()"],
  };
  const PRE = {
    br: ["{[()()]}", "([)]", "((a+b)*c", "a[i] = f(x) }", "print(len([1, 2]))"],
    pf: ["3 4 + 2 *", "5 1 2 + 4 * + 3 -", "2 3 4 * +", "8 2 / 3 -", "1 +"],
  };
  let mode = "br", steps = [], toks = [];
  const fmt = (v) => (typeof v === "number" ? (Number.isInteger(v) ? String(v) : String(+v.toFixed(4))) : String(v));

  function traceBr(s) {
    const st = [], out = [], pairs = { ")": "(", "]": "[", "}": "{" };
    toks = [...s];
    const snap = (i, line, note, res) => out.push({ i, st: [...st], line, note, res });
    snap(-1, 3, "빈 스택으로 시작합니다. 여는 괄호는 넣고, 닫는 괄호를 만나면 맨 위의 여는 괄호와 짝을 맞춥니다.");
    for (let i = 0; i < toks.length; i++) {
      const ch = toks[i];
      if ("([{".includes(ch)) { st.push(ch); snap(i, 6, `여는 괄호 ${ch}: 스택에 넣습니다. 나중에 닫힐 차례를 기다립니다.`); }
      else if (pairs[ch]) {
        if (!st.length) { snap(i, [8, 9], `닫는 괄호 ${ch}가 나왔는데 스택이 비어 있습니다. 짝이 될 여는 괄호가 없습니다.`, false); return out; }
        const top = st.pop();
        if (top !== pairs[ch]) { snap(i, [8, 9], `닫는 괄호 ${ch}의 짝은 ${pairs[ch]}인데 맨 위에서 나온 것은 ${top}입니다. 순서가 엇갈렸습니다.`, false); return out; }
        snap(i, 8, `닫는 괄호 ${ch}: 맨 위에서 꺼낸 것이 ${top}이므로 짝이 맞습니다. 둘 다 지웁니다. 가장 최근에 열린 괄호가 가장 먼저 닫혀야 합니다.`);
      }
    }
    const ok = !st.length;
    snap(toks.length, 10, ok ? "문자열을 다 읽었고 스택이 비었습니다. 모든 괄호가 짝을 이룹니다." : `문자열을 다 읽었는데 스택이 비지 않았습니다(남은 것: ${st.join(" ")}). 닫히지 않은 괄호가 있습니다.`, ok);
    return out;
  }

  function tracePf(s) {
    const st = [], out = [];
    toks = s.trim().split(/\s+/).filter(Boolean);
    const snap = (i, line, note, res) => out.push({ i, st: [...st], line, note, res });
    snap(-1, 5, "토큰을 왼쪽부터 읽습니다. 수는 스택에 넣고, 연산자를 만나면 맨 위의 두 수를 꺼내 계산한 결과를 다시 넣습니다.");
    const OP = { "+": (a, b) => a + b, "-": (a, b) => a - b, "*": (a, b) => a * b, "/": (a, b) => a / b };
    for (let i = 0; i < toks.length; i++) {
      const t = toks[i];
      if (OP[t]) {
        if (st.length < 2) { snap(i, st.length ? 9 : 8, `연산자 ${t}에 필요한 수가 스택에 ${st.length}개뿐입니다. IndexError: pop from empty list — 식이 잘못되었습니다.`, "오류"); return out; }
        const b = st.pop(), a = st.pop();
        if (t === "/" && b === 0) { snap(i, 10, "0으로 나누게 됩니다. ZeroDivisionError.", "오류"); return out; }
        const v = OP[t](a, b); st.push(v);
        snap(i, [8, 9, 10], `연산자 ${t}: 먼저 꺼낸 것이 오른쪽 수 b = ${fmt(b)}, 다음이 왼쪽 수 a = ${fmt(a)}. ${fmt(a)} ${t} ${fmt(b)} = ${fmt(v)}. 결과를 다시 스택에 넣습니다.`);
      } else if (/^-?\d+$/.test(t)) { st.push(+t); snap(i, 12, `${t}: 수이므로 스택에 넣습니다.`); }
      else { snap(i, 12, `토큰 ${t}: 수도 연산자도 아니어서 int(t)에서 ValueError가 납니다.`, "오류"); return out; }
    }
    if (st.length === 1) snap(toks.length, 13, `토큰을 다 읽었고 스택에 값 하나(${fmt(st[0])})가 남았습니다. 이것이 식의 값입니다.`, fmt(st[0]));
    else if (!st.length) snap(toks.length, 13, "스택이 비어 있어 결과가 없습니다.", "오류");
    else snap(toks.length, 13, `스택에 값이 ${st.length}개 남았습니다. 연산자가 모자란 잘못된 식입니다(코드는 맨 위 값만 돌려주므로 검사를 더해야 합니다).`, "오류");
    return out;
  }

  const view = fit($("canvas"), () => draw());
  let cv = null, stp = null;

  function draw() {
    const { ctx } = view, { w, h } = view.size; if (!w || !steps.length) return;
    const s = steps[stp.i] || steps[0];
    ctx.clearRect(0, 0, w, h);
    /* 입력 토큰 줄 */
    ctx.font = `11px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "left";
    ctx.fillText(mode === "br" ? "입력 문자열" : "입력 토큰", 8, 14);
    const n = toks.length, tw = Math.min(mode === "br" ? 26 : 38, (w - 16) / Math.max(1, n));
    toks.forEach((t, i) => {
      const x = 8 + i * tw, y = 22;
      const isB = mode === "br" ? "()[]{}".includes(t) : true;
      ctx.fillStyle = i === s.i ? (s.res === false || s.res === "오류" ? C.warn + "33" : "#dcebd6") : i < s.i ? C.paper : "#fff";
      ctx.strokeStyle = i === s.i ? C.forest : C.rule; ctx.lineWidth = i === s.i ? 1.6 : 1;
      ctx.fillRect(x + 1, y, tw - 2, 26); ctx.strokeRect(x + 1.5, y + .5, tw - 3, 25);
      ctx.fillStyle = i < s.i ? C.ink3 : isB ? C.ink : C.ink3;
      ctx.font = `${isB ? "600 " : ""}${Math.min(14, tw * 0.55)}px ${F.mono}`; ctx.textAlign = "center";
      fitText(ctx, t === " " ? "·" : t, x + tw / 2, y + 18, tw - 4);
    });
    /* 스택 */
    const sw = Math.min(110, w * 0.3), sx = w * 0.5 - sw / 2, base = h - 16, ch = Math.min(28, (h - 90) / 8);
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(sx - 6, base - ch * 8 - 4); ctx.lineTo(sx - 6, base + 2); ctx.lineTo(sx + sw + 6, base + 2); ctx.lineTo(sx + sw + 6, base - ch * 8 - 4); ctx.stroke();
    ctx.font = `11px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "left"; ctx.fillText("stack", sx + sw + 12, base);
    s.st.slice(-8).forEach((v, k) => {
      const y = base - (k + 1) * ch;
      const top = k === Math.min(8, s.st.length) - 1;
      ctx.fillStyle = top ? "#dcebd6" : "#fff"; ctx.strokeStyle = top ? C.forest : C.ink2; ctx.lineWidth = 1;
      rrect(ctx, sx, y + 1, sw, ch - 3); ctx.fill(); ctx.stroke();
      ctx.fillStyle = C.ink; ctx.font = `600 ${Math.min(14, ch * 0.55)}px ${F.mono}`; ctx.textAlign = "center";
      fitText(ctx, fmt(v), sx + sw / 2, y + ch / 2 + 4, sw - 8);
    });
    if (s.st.length > 8) { ctx.fillStyle = C.ink3; ctx.font = `11px ${F.mono}`; ctx.textAlign = "left"; ctx.fillText(`(아래에 ${s.st.length - 8}개 더)`, sx + sw + 12, base - 16); }
    if (s.st.length) { ctx.fillStyle = C.forest; ctx.font = `600 11px ${F.mono}`; ctx.textAlign = "right"; ctx.fillText("top →", sx - 10, base - Math.min(8, s.st.length) * ch + ch / 2 + 4); }
    /* 판정 */
    if (s.res !== undefined) {
      const ok = s.res === true || (mode === "pf" && s.res !== "오류");
      ctx.fillStyle = ok ? C.forest : C.warn; ctx.font = `700 15px ${F.sans}`; ctx.textAlign = "left";
      const t = mode === "br" ? (s.res ? "짝이 맞음 (True)" : "짝이 안 맞음 (False)") : s.res === "오류" ? "잘못된 식" : `결과 = ${s.res}`;
      ctx.fillText(t, 10, 76);
    }
  }

  function show(i) { const s = steps[i]; cv.set(s.line); $(".note").textContent = s.note; draw(); }
  stp = stepper($(".i1-step"), () => steps.length, show, 700);

  function presets() {
    const box = $(".ex");
    box.innerHTML = PRE[mode].map((p, k) => `<button type="button" class="chip" data-k="${k}" aria-pressed="${k === 0}">${I1.esc(p)}</button>`).join("");
    box.querySelectorAll(".chip").forEach((b) => b.addEventListener("click", () => {
      box.querySelectorAll(".chip").forEach((q) => q.setAttribute("aria-pressed", String(q === b)));
      $(".expr").value = PRE[mode][+b.dataset.k]; run();
    }));
  }
  function run() {
    const v = $(".expr").value.slice(0, 40);
    steps = mode === "br" ? traceBr(v) : tracePf(v);
    stp.stop(); stp.go(0);
  }
  root.querySelectorAll(".modes .chip").forEach((b) => b.addEventListener("click", () => {
    root.querySelectorAll(".modes .chip").forEach((q) => q.setAttribute("aria-pressed", String(q === b)));
    mode = b.dataset.m; cv = code($(".code"), SRC[mode]); presets(); $(".expr").value = PRE[mode][0]; run();
  }));
  $(".expr").addEventListener("input", () => { root.querySelectorAll(".ex .chip").forEach((q) => q.setAttribute("aria-pressed", "false")); run(); });
  cv = code($(".code"), SRC.br); presets(); $(".expr").value = PRE.br[0]; run();
  if (I1.demo) { root.querySelector(".modes .chip[data-m=pf]").click(); root.querySelector(".ex .chip[data-k='1']").click(); stp.go(7); }
})();
