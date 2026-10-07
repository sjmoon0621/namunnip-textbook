/* 카드: 함수에 넘긴 리스트는 왜 함수 밖에서도 바뀔까? — 프레임(이름표)과 객체, 객체 참조 전달 */
(() => {
  const root = document.getElementById("card-info-scope");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const { code, stepper, rrect, arrow, fitText } = I1;

  const SRC = {
    append: (n) => [
      "def add_item(box, x):",
      "    box.append(x)",
      "    x = x * 10",
      "    return len(box)",
      "",
      "nums = [1, 2]",
      `n = ${n}`,
      "k = add_item(nums, n)",
      "print(nums, n, k)",
    ],
    rebind: (n) => [
      "def add_item(box, x):",
      "    box = box + [x]",
      "    x = x * 10",
      "    return len(box)",
      "",
      "nums = [1, 2]",
      `n = ${n}`,
      "k = add_item(nums, n)",
      "print(nums, n, k)",
    ],
    scope: (n) => [
      "total = 0",
      "def add(a, b=1):",
      "    total = a + b",
      "    return total",
      "",
      `r1 = add(${n})`,
      `r2 = add(${n}, b=10)`,
      "print(total, r1, r2)",
    ],
  };

  /* 실행 기록 만들기: 단계마다 {line, frames, objs, out, note}의 복사본을 남긴다 */
  function trace(mode, n) {
    const objs = [], frames = [{ name: "전역", vars: [] }], steps = [];
    let out = "";
    const mk = (kind, v) => { objs.push({ id: objs.length, kind, v }); return objs.length - 1; };
    const int = (v) => { const o = objs.find((q) => q.kind === "int" && q.v === v); return o ? o.id : mk("int", v); };
    const bind = (f, name, id) => { const r = f.vars.find((q) => q[0] === name); if (r) r[1] = id; else f.vars.push([name, id]); };
    const get = (f, name) => f.vars.find((q) => q[0] === name)[1];
    const snap = (line, note) => steps.push(JSON.parse(JSON.stringify({ line, frames, objs, out, note })));
    const show = (id) => { const o = objs[id]; return o.kind === "list" ? `[${o.v.join(", ")}]` : String(o.v); };
    const G = frames[0];

    if (mode === "scope") {
      bind(G, "total", int(0)); snap(1, "전역 이름 total이 정수 객체 0을 가리킵니다.");
      bind(G, "add", mk("func", "add")); snap(2, "def는 함수 객체를 만들고 이름 add에 붙입니다. 함수 몸체는 아직 실행하지 않습니다.");
      const call = (line, b, kw) => {
        const f = { name: "add", vars: [] }; frames.push(f);
        bind(f, "a", int(n)); bind(f, "b", int(b));
        snap(2, kw ? `호출하면 새 프레임이 생깁니다. 키워드 인자 b=10이 기본값 1 대신 쓰입니다.` : `호출하면 새 프레임(이름표 묶음)이 생깁니다. b를 넘기지 않았으므로 기본값 1을 씁니다.`);
        bind(f, "total", int(n + b)); snap(3, "함수 안에서 대입한 total은 이 프레임의 지역 변수입니다. 전역 total과 이름만 같은 다른 변수입니다.");
        f.ret = get(f, "total"); snap(4, `return이 값이 ${n + b}인 객체를 호출한 곳으로 돌려줍니다.`);
        frames.pop();
        return f.ret;
      };
      bind(G, "r1", call(6, 1, false)); snap(6, "함수가 끝나면 프레임과 지역 변수 a, b, total이 사라지고, 반환값만 r1에 남습니다.");
      bind(G, "r2", call(7, 10, true)); snap(7, "두 번째 호출도 새 프레임에서 따로 계산합니다. 전역 total은 여전히 0입니다.");
      out = `${show(get(G, "total"))} ${show(get(G, "r1"))} ${show(get(G, "r2"))}`;
      snap(8, "출력에서 전역 total이 0 그대로인 것을 확인하세요. 함수 안의 대입은 지역 이름에만 영향을 줍니다.");
      return steps;
    }

    bind(G, "add_item", mk("func", "add_item")); snap(1, "def는 함수 객체를 만들고 이름 add_item에 붙입니다. 몸체는 아직 실행하지 않습니다.");
    bind(G, "nums", mk("list", [1, 2])); snap(6, "리스트 객체 [1, 2]가 만들어지고 이름 nums가 그것을 가리킵니다.");
    bind(G, "n", int(n)); snap(7, `이름 n이 값이 ${n}인 정수 객체를 가리킵니다.`);
    snap(8, "add_item(nums, n)을 부릅니다. 인자 자리에는 nums와 n이 가리키는 객체가 들어갑니다.");
    const f = { name: "add_item", vars: [] }; frames.push(f);
    bind(f, "box", get(G, "nums")); bind(f, "x", get(G, "n"));
    snap(1, "새 프레임에서 매개변수 box와 x가 같은 객체를 가리킵니다. 객체를 복사하지 않고 참조를 전달합니다.");
    if (mode === "append") {
      objs[get(f, "box")].v.push(n);
      snap(2, "box.append(x)는 box가 가리키는 바로 그 리스트를 고칩니다. nums도 같은 리스트를 가리키므로 함께 바뀌어 보입니다.");
    } else {
      bind(f, "box", mk("list", [...objs[get(f, "box")].v, n]));
      snap(2, "box + [x]는 새 리스트를 만들고, box라는 이름표만 새 리스트로 옮겨 붙입니다. nums가 가리키는 리스트는 그대로입니다.");
    }
    bind(f, "x", int(n * 10));
    snap(3, `x = x * 10은 값이 ${n * 10}인 정수 객체를 새로 만들고 지역 이름 x만 옮깁니다. 정수는 바꿀 수 없는(immutable) 객체라 n은 영향을 받지 않습니다.`);
    f.ret = int(objs[get(f, "box")].v.length);
    snap(4, `return len(box)는 box가 가리키는 리스트의 길이(${objs[get(f, "box")].v.length})를 돌려줍니다.`);
    frames.pop();
    bind(G, "k", f.ret);
    snap(8, "프레임이 사라지고 반환값이 k에 대입됩니다. 아무 이름도 가리키지 않는 객체는 흐리게 그렸습니다(나중에 메모리에서 정리됨).");
    out = `${show(get(G, "nums"))} ${show(get(G, "n"))} ${show(get(G, "k"))}`;
    snap(9, mode === "append" ? "nums는 함수 안에서 고친 결과를 보여 주고, n은 그대로입니다." : "이번에는 nums도 n도 그대로입니다. 함수 밖에 영향을 주려면 객체를 직접 고치거나 결과를 return해야 합니다.");
    return steps;
  }

  let mode = "append", N = 5, steps = [];
  let cv = null;
  const view = fit($("canvas"), () => draw());

  function draw() {
    const { ctx } = view, { w, h } = view.size; if (!w || !steps.length) return;
    const s = steps[st.i] || steps[0];
    ctx.clearRect(0, 0, w, h);
    const sc = Math.min(1, w / 520), rowH = 22 * sc, fs = Math.max(10, 12.5 * sc);
    const fx = 8, fw = w * 0.44, ox = w * 0.62, ow = w - ox - 8;
    ctx.font = `11px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "left";
    ctx.fillText("프레임 (이름표)", fx, 14); ctx.fillText("객체", ox, 14);

    /* 객체 위치: 만든 순서대로 위에서 아래로 */
    const refd = new Set();
    s.frames.forEach((f) => { f.vars.forEach((v) => refd.add(v[1])); if (f.ret != null) refd.add(f.ret); });
    const pos = {};
    let oy = 26;
    s.objs.forEach((o) => {
      const hh = 24 * sc;
      pos[o.id] = { x: ox, y: oy, h: hh };
      oy += hh + 9 * sc;
    });

    /* 프레임 */
    let fy = 26;
    const links = [];
    s.frames.forEach((f, k) => {
      const rows = f.vars.length + (f.ret != null ? 1 : 0);
      const bh = 22 * sc + Math.max(1, rows) * rowH + 6;
      const top = k === s.frames.length - 1;
      ctx.fillStyle = top ? "#eef5eb" : C.card; ctx.strokeStyle = top ? C.forest : C.ink2; ctx.lineWidth = top ? 1.6 : 1;
      rrect(ctx, fx, fy, fw, bh); ctx.fill(); ctx.stroke();
      ctx.fillStyle = top ? C.forest : C.ink2; ctx.font = `600 ${fs}px ${F.mono}`;
      ctx.fillText(k ? `${f.name}() 프레임` : "전역 프레임", fx + 8, fy + 16 * sc);
      ctx.font = `${fs}px ${F.mono}`;
      const rowsList = f.vars.map((v) => [v[0], v[1]]);
      if (f.ret != null) rowsList.push(["반환값", f.ret]);
      rowsList.forEach(([name, id], r) => {
        const y = fy + 22 * sc + r * rowH + rowH * 0.7;
        ctx.fillStyle = name === "반환값" ? C.warn : C.ink;
        ctx.textAlign = "right"; fitText(ctx, name, fx + fw - 22, y, fw - 34); ctx.textAlign = "left";
        const dx = fx + fw - 12, dy = y - 4 * sc;
        ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(dx, dy, 3, 0, Math.PI * 2); ctx.fill();
        links.push([dx, dy, id, name === "반환값"]);
      });
      fy += bh + 10 * sc;
    });

    /* 객체 상자 */
    s.objs.forEach((o) => {
      const p = pos[o.id], live = refd.has(o.id);
      ctx.globalAlpha = live ? 1 : 0.3;
      ctx.font = `${fs}px ${F.mono}`;
      if (o.kind === "list") {
        const cw = Math.min(30 * sc, (ow - 60) / Math.max(1, o.v.length));
        const lx = p.x;
        ctx.fillStyle = C.ink3; ctx.font = `${Math.max(9, 10 * sc)}px ${F.mono}`; ctx.fillText("list", lx + Math.max(1, o.v.length) * cw + 5, p.y + p.h * 0.65);
        o.v.forEach((v, i) => {
          ctx.fillStyle = "#fff"; ctx.strokeStyle = C.ink2; ctx.lineWidth = 1;
          ctx.fillRect(lx + i * cw, p.y, cw, p.h); ctx.strokeRect(lx + i * cw + .5, p.y + .5, cw, p.h);
          ctx.fillStyle = C.ink; ctx.font = `${fs}px ${F.mono}`; ctx.textAlign = "center";
          ctx.fillText(String(v), lx + i * cw + cw / 2, p.y + p.h * 0.68); ctx.textAlign = "left";
        });
        if (!o.v.length) { ctx.strokeStyle = C.ink2; ctx.strokeRect(lx + .5, p.y + .5, cw, p.h); }
      } else {
        const label = o.kind === "func" ? `function ${o.v}` : `int  ${o.v}`;
        ctx.fillStyle = o.kind === "func" ? C.paper : "#fff"; ctx.strokeStyle = C.ink2; ctx.lineWidth = 1;
        const bw = Math.min(ow, ctx.measureText(label).width + 16);
        rrect(ctx, p.x, p.y, bw, p.h); ctx.fill(); ctx.stroke();
        ctx.fillStyle = o.kind === "func" ? C.ink2 : C.ink; fitText(ctx, label, p.x + 8, p.y + p.h * 0.68, ow - 14);
      }
      if (!live) { ctx.fillStyle = C.ink3; ctx.font = `${Math.max(9, 10 * sc)}px ${F.sans}`; ctx.textAlign = "right"; ctx.fillText("참조 없음", w - 6, p.y + p.h * 0.68); ctx.textAlign = "left"; }
      ctx.globalAlpha = 1;
    });

    /* 이름표 → 객체 화살표 */
    links.forEach(([x, y, id, ret]) => {
      const p = pos[id]; if (!p) return;
      arrow(ctx, x, y, p.x - 3, p.y + p.h / 2, ret ? C.warn : C.ink2, (y - (p.y + p.h / 2)) * 0.15);
    });
  }

  function show(i) {
    const s = steps[i];
    cv.set(s.line);
    $(".note").textContent = s.note;
    $(".out").textContent = s.out ? s.out : "—";
    draw();
  }
  const st = stepper($(".i1-step"), () => steps.length, show, 900);

  function rebuild() {
    cv = code($(".code"), SRC[mode](N));
    steps = trace(mode, N);
    st.stop(); st.go(0);
  }
  root.querySelectorAll(".presets .chip").forEach((b) => b.addEventListener("click", () => {
    root.querySelectorAll(".presets .chip").forEach((q) => q.setAttribute("aria-pressed", String(q === b)));
    mode = b.dataset.m; rebuild();
  }));
  $(".nv").addEventListener("input", () => { N = +$(".nv").value; $(".nv-out").textContent = N; rebuild(); });
  rebuild();
  if (I1.demo) st.go(7);
})();
