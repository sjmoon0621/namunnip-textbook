/* 카드: 재귀 함수는 자기 자신을 부르는데 왜 끝날까? — 호출 스택과 기저 조건, 귀납 가정 */
(() => {
  const root = document.getElementById("card-info-callstack");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const { code, stepper, rrect, fitText } = I1;
  const PI = [3, 1, 4, 1, 5, 9];

  const P = {
    fact: {
      src: (a) => ["def fact(n):", "    if n == 0:", "        return 1", "    return n * fact(n - 1)", "", `print(fact(${a}))`],
      init: (k) => k, show: (n) => String(n), name: "fact", argName: "n",
      base: (n) => n === 0, baseVal: () => 1, sub: (n) => n - 1,
      comb: (n, r) => n * r, pend: (n) => `${n} * fact(${n - 1})`, done: (n, r) => `${n} * ${r}`,
      baseNote: "n == 0이면 더 쪼갤 필요 없이 바로 1을 돌려줍니다(0! = 1).",
      range: [0, 8], def: 4,
    },
    rsum: {
      src: (a) => ["def rsum(xs):", "    if not xs:", "        return 0", "    return xs[0] + rsum(xs[1:])", "", `print(rsum([${PI.slice(0, a).join(", ")}]))`],
      init: (k) => PI.slice(0, k), show: (xs) => `[${xs.join(", ")}]`, name: "rsum", argName: "xs",
      base: (xs) => xs.length === 0, baseVal: () => 0, sub: (xs) => xs.slice(1),
      comb: (xs, r) => xs[0] + r, pend: (xs) => `${xs[0]} + rsum(${"[" + xs.slice(1).join(", ") + "]"})`, done: (xs, r) => `${xs[0]} + ${r}`,
      baseNote: "빈 리스트의 합은 0입니다. 더 쪼갤 수 없는 가장 작은 문제입니다.",
      range: [0, 6], def: 4,
    },
    bin: {
      src: (a) => ["def to_bin(n):", "    if n < 2:", "        return str(n)", "    return to_bin(n // 2) + str(n % 2)", "", `print(to_bin(${a}))`],
      init: (k) => k, show: (n) => String(n), name: "to_bin", argName: "n",
      base: (n) => n < 2, baseVal: (n) => `'${n}'`, sub: (n) => Math.floor(n / 2),
      comb: (n, r) => `'${r.slice(1, -1)}${n % 2}'`, pend: (n) => `to_bin(${Math.floor(n / 2)}) + '${n % 2}'`, done: (n, r) => `${r} + '${n % 2}'`,
      baseNote: "n이 0이나 1이면 이진수로도 한 자리이므로 그대로 문자열로 돌려줍니다.",
      range: [0, 64], def: 13,
    },
  };

  let key = "fact", arg = 4, noBase = false, steps = [];
  const LIMIT = 10;

  function trace() {
    const p = P[key], frames = [], lines = [], out = [];
    const st = [];
    let calls = 0, maxD = 0, crash = "";
    const snap = (line, note) => st.push(JSON.parse(JSON.stringify({ line, frames, lines, note, calls, maxD, out: out.join(""), crash })));
    const call = `${p.name}(${p.show(p.init(arg))})`;
    snap(6, `print 안의 ${call}부터 계산해야 합니다. 전역 코드가 스택 맨 아래에 있습니다.`);
    function run(a) {
      calls++;
      const f = { a: p.show(a), pend: "", ret: null };
      frames.push(f); maxD = Math.max(maxD, frames.length);
      const L = { t: `${p.name}(${p.show(a)})`, rhs: "", d: frames.length };
      lines.push(L);
      const me = () => frames[frames.length - 1];
      snap(1, `${p.name}(${p.show(a)})를 호출합니다. 새 프레임이 스택 맨 위에 쌓이고, 아래 프레임은 결과를 기다립니다.`);
      if (!noBase) {
        if (p.base(a)) {
          const r = p.baseVal(a); me().ret = r; L.rhs = String(r); L.ok = true;
          snap(2, "기저 조건을 검사합니다. 참입니다.");
          snap(3, `${p.baseNote} 이 프레임은 ${r}을 돌려주고 스택에서 빠집니다.`);
          frames.pop(); return r;
        }
        snap(2, "기저 조건을 검사합니다. 거짓이므로 더 작은 문제로 넘깁니다.");
      }
      if (key === "rsum" && a.length === 0) {
        crash = "IndexError: list index out of range";
        snap(4, "빈 리스트에서 xs[0]을 꺼내려다 오류가 납니다. 기저 조건이 없으면 끝나는 지점에서 잘못된 계산을 하게 됩니다.");
        throw new Error("stop");
      }
      if (frames.length >= LIMIT) {
        crash = "RecursionError: maximum recursion depth exceeded";
        me().pend = p.pend(a); L.rhs = p.pend(a);
        snap(4, "기저 조건이 없어 인자가 계속 작아지기만(또는 그대로이기만) 하고 끝나지 않습니다. 이렇게 프레임이 약 1000개 쌓이면 파이썬은 RecursionError를 내고 멈춥니다(그림은 10개에서 생략).");
        throw new Error("stop");
      }
      me().pend = p.pend(a); L.rhs = p.pend(a);
      snap(4, `${p.pend(a)}를 계산하려면 먼저 ${p.name}(${p.show(p.sub(a))})의 값이 필요합니다. 이 프레임은 여기서 멈추고 기다립니다.`);
      const r = run(p.sub(a));
      const v = p.comb(a, r);
      me().pend = p.done(a, r); me().ret = v; L.rhs = `${p.done(a, r)} = ${v}`; L.ok = true;
      snap(4, `아래 프레임에서 돌아온 값은 ${r}입니다. ${p.done(a, r)} = ${v}. 이 값을 자기를 부른 프레임에 돌려줍니다.`);
      frames.pop();
      return v;
    }
    try {
      const r = run(p.init(arg));
      out.push(String(r).replace(/'/g, ""));
      snap(6, `모든 프레임이 빠지고 전역으로 돌아왔습니다. 최종 결과를 출력합니다.`);
    } catch (e) { /* 오류로 멈춘 실행 */ }
    return st;
  }

  const view = fit($("canvas"), () => draw());
  let cv = null;

  function draw() {
    const { ctx } = view, { w, h } = view.size; if (!w || !steps.length) return;
    const s = steps[stp.i] || steps[0];
    ctx.clearRect(0, 0, w, h);
    const sx = 8, sw = Math.min(w * 0.42, 220), fs = w < 420 ? 10.5 : 12;
    ctx.font = `11px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "left";
    ctx.fillText("호출 스택 (위가 지금 실행 중)", sx, 13);
    ctx.fillText("식의 전개 (들여쓰기 = 깊이)", sx + sw + 18, 13);
    const n = s.frames.length + 1, bh = Math.min(30, (h - 30) / Math.max(n, 8)) - 4;
    /* 맨 아래 전역 프레임 */
    const y0 = h - 6;
    const all = [{ a: null }].concat(s.frames);
    all.forEach((f, k) => {
      const y = y0 - (k + 1) * (bh + 4);
      const top = k === all.length - 1 && !s.crash;
      ctx.fillStyle = k === 0 ? C.paper : top ? "#eef5eb" : C.card;
      ctx.strokeStyle = s.crash && k === all.length - 1 ? C.warn : top ? C.forest : C.ink2; ctx.lineWidth = top ? 1.6 : 1;
      rrect(ctx, sx, y, sw, bh); ctx.fill(); ctx.stroke();
      ctx.font = `${fs}px ${F.mono}`; ctx.fillStyle = k === 0 ? C.ink3 : C.ink; ctx.textBaseline = "middle";
      const label = k === 0 ? "전역  print(…)" : `${P[key].name}(${P[key].argName}=${f.a})`;
      fitText(ctx, label, sx + 7, y + bh / 2, sw * (f.ret != null ? 0.62 : 0.95));
      if (f.ret != null) { ctx.fillStyle = C.warn; ctx.textAlign = "right"; fitText(ctx, `→ ${f.ret}`, sx + sw - 6, y + bh / 2, sw * 0.35); ctx.textAlign = "left"; }
      ctx.textBaseline = "alphabetic";
    });
    if (s.crash) {
      ctx.fillStyle = C.warn; ctx.font = `600 ${fs}px ${F.mono}`;
      if (key !== "rsum") fitText(ctx, "⋮ 약 1000개까지 쌓임", sx + 7, y0 - all.length * (bh + 4) - 6, sw);
    }
    /* 식의 전개 */
    const tx = sx + sw + 18, tw = w - tx - 4, lh = Math.min(22, (h - 24) / Math.max(8, s.lines.length + 1));
    ctx.font = `${fs}px ${F.mono}`;
    s.lines.forEach((L, i) => {
      const y = 30 + i * lh + lh * 0.6, ind = Math.min(14, tw / 16) * (L.d - 1);
      const act = !L.ok && L.d === s.frames.length;
      ctx.fillStyle = L.ok ? C.forest : act ? C.ink : C.ink3;
      ctx.font = `${act ? "600 " : ""}${fs}px ${F.mono}`;
      fitText(ctx, `${L.t} = ${L.rhs || "?"}`, tx + ind, y, tw - ind);
    });
  }

  function show(i) {
    const s = steps[i];
    cv.set(s.line);
    $(".note").textContent = s.note;
    $(".out").textContent = s.crash ? s.crash : (s.out || "—");
    $(".out").classList.toggle("err", !!s.crash);
    $(".d-now").textContent = s.frames.length;
    $(".d-max").textContent = s.maxD;
    $(".d-calls").textContent = s.calls;
    draw();
  }
  const stp = stepper($(".i1-step"), () => steps.length, show, 700);

  function rebuild() {
    const p = P[key];
    const r = $(".av"); r.min = p.range[0]; r.max = p.range[1];
    arg = Math.max(p.range[0], Math.min(p.range[1], arg));
    r.value = arg; $(".av-out").textContent = arg;
    $(".av-name").textContent = key === "rsum" ? "리스트 길이" : "n";
    cv = code($(".code"), p.src(arg));
    cv.dim(noBase ? [2, 3] : []);
    steps = trace();
    stp.stop(); stp.go(0);
  }
  root.querySelectorAll(".presets .chip").forEach((b) => b.addEventListener("click", () => {
    root.querySelectorAll(".presets .chip").forEach((q) => q.setAttribute("aria-pressed", String(q === b)));
    key = b.dataset.f; arg = P[key].def; rebuild();
  }));
  $(".av").addEventListener("input", () => { arg = +$(".av").value; rebuild(); });
  $(".nobase").addEventListener("change", () => { noBase = $(".nobase").checked; rebuild(); });
  rebuild();
  if (I1.demo) { root.querySelector(".chip[data-f=bin]").click(); stp.go(13); }
})();
