/* 공통수학2 집합과 명제 공용 도구 — window.NMSets: 집합 표기, 벤 다이어그램 영역 칠하기, 원소 자리 잡기, 수직선 */
window.NMSets = (() => {
  const { C, F } = NM;
  /* 수 표기: 음수는 유니코드 빼기, 소수는 둘째 자리까지 */
  const n = (v) => { const r = +(+v).toFixed(2); return r < 0 ? "−" + Math.abs(r) : String(Math.abs(r)); };
  /* 원소나열법 문자열. 너무 길면 등차수열은 {a, b, c, …, z}로 줄인다 */
  function fmt(arr, max = 12) {
    if (!arr.length) return "∅";
    if (arr.length > max) {
      const d = arr[1] - arr[0], ar = arr.every((v, i) => i === 0 || v - arr[i - 1] === d);
      const head = ar ? arr.slice(0, 3) : arr.slice(0, max - 1);
      return `{${head.map(n).join(", ")}, …, ${n(arr[arr.length - 1])}}`;
    }
    return `{${arr.map(n).join(", ")}}`;
  }
  const inC = (c, x, y) => Math.hypot(x - c.x, y - c.y) < c.r;
  /* 영역 번호: i번째 원 안이면 i번째 비트가 1 */
  const region = (cs, x, y) => cs.reduce((m, c, i) => m | (inC(c, x, y) ? 1 << i : 0), 0);
  /* 영역 하나(mask)를 칠한다: 원 안은 그대로 자르고, 원 밖은 짝홀 규칙으로 자른다 */
  function shade(ctx, cs, rect, mask, color, alpha = 1) {
    ctx.save();
    const R = new Path2D(); R.rect(rect.x, rect.y, rect.w, rect.h); ctx.clip(R);
    cs.forEach((c, i) => {
      const p = new Path2D();
      if (mask >> i & 1) p.arc(c.x, c.y, c.r, 0, Math.PI * 2);
      else { p.rect(rect.x - 2, rect.y - 2, rect.w + 4, rect.h + 4); p.moveTo(c.x + c.r, c.y); p.arc(c.x, c.y, c.r, 0, Math.PI * 2); }
      ctx.clip(p, "evenodd");
    });
    ctx.globalAlpha = alpha; ctx.fillStyle = color; ctx.fillRect(rect.x - 1, rect.y - 1, rect.w + 2, rect.h + 2);
    ctx.restore();
  }
  function shadeWhere(ctx, cs, rect, pred, color, alpha = 1) {
    for (let m = 0; m < 1 << cs.length; m++) if (pred(m)) shade(ctx, cs, rect, m, color, alpha);
  }
  /* 원 테두리와 이름표. ang: 이름표를 놓을 각(도) */
  function outline(ctx, cs, names, ang, color) {
    ctx.save(); ctx.lineWidth = 1.6; ctx.font = `600 13px ${F.sans}`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    cs.forEach((c, i) => {
      ctx.strokeStyle = (color && color[i]) || C.ink; ctx.beginPath(); ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2); ctx.stroke();
      if (!names[i]) return;
      const a = (ang ? ang[i] : 135) * Math.PI / 180;
      ctx.fillStyle = (color && color[i]) || C.ink; ctx.fillText(names[i], c.x + (c.r + 10) * Math.cos(a), c.y - (c.r + 10) * Math.sin(a));
    });
    ctx.restore();
  }
  /* 원소 자리: groups = [[mask, [이름표…]], …]. 영역마다 격자점을 모아 중심에 가까운 것부터 쓴다 */
  function place(cs, rect, groups, step = 24, pad = 12) {
    for (let s = step; s >= 12; s -= 2) {
      const cand = {};
      for (let y = rect.y + pad; y <= rect.y + rect.h - pad; y += s)
        for (let x = rect.x + pad; x <= rect.x + rect.w - pad; x += s) {
          if (cs.some((c) => Math.abs(Math.hypot(x - c.x, y - c.y) - c.r) < Math.max(9, s * 0.42))) continue;
          const m = region(cs, x, y); (cand[m] = cand[m] || []).push([x, y]);
        }
      const out = []; let ok = true;
      for (const [m, labs] of groups) {
        if (!labs.length) continue;
        const pts = cand[m] || [];
        if (pts.length < labs.length) { ok = false; }
        const cx = pts.reduce((a, p) => a + p[0], 0) / (pts.length || 1), cy = pts.reduce((a, p) => a + p[1], 0) / (pts.length || 1);
        pts.sort((p, q) => Math.hypot(p[0] - cx, p[1] - cy) - Math.hypot(q[0] - cx, q[1] - cy));
        labs.forEach((l, i) => { if (pts[i]) out.push({ label: l, x: pts[i][0], y: pts[i][1], mask: m }); });
      }
      if (ok || s <= 13) return out;
    }
    return [];
  }
  /* 수직선: 반환값은 수 → 화면 x 변환 */
  function line(ctx, o) {
    const X = (v) => o.x0 + (v - o.lo) / (o.hi - o.lo) * (o.x1 - o.x0);
    ctx.save(); ctx.strokeStyle = C.ink3; ctx.fillStyle = C.ink3; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(o.x0 - 8, o.y); ctx.lineTo(o.x1 + 6, o.y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(o.x1 + 12, o.y); ctx.lineTo(o.x1 + 4, o.y - 4); ctx.lineTo(o.x1 + 4, o.y + 4); ctx.closePath(); ctx.fill();
    ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
    const every = o.every || 1;
    for (let i = 0, v = o.lo; v <= o.hi + 1e-9; i++, v = o.lo + i * o.step) {
      const x = X(v); ctx.beginPath(); ctx.moveTo(x, o.y - 4); ctx.lineTo(x, o.y + 4); ctx.stroke();
      if (i % every === 0) ctx.fillText(n(v), x, o.y + 17);
    }
    ctx.restore(); return X;
  }
  /* 구간 막대: a, b는 ±Infinity 가능, ca·cb는 끝점을 포함하는지 */
  function seg(ctx, X, y, a, b, color, ca, cb, edge) {
    const xa = a === -Infinity ? edge[0] : X(a), xb = b === Infinity ? edge[1] : X(b);
    ctx.save(); ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 4;
    if (xb > xa) { ctx.beginPath(); ctx.moveTo(xa, y); ctx.lineTo(xb, y); ctx.stroke(); }
    if (b === Infinity) { ctx.beginPath(); ctx.moveTo(xb + 8, y); ctx.lineTo(xb, y - 6); ctx.lineTo(xb, y + 6); ctx.closePath(); ctx.fill(); }
    if (a === -Infinity) { ctx.beginPath(); ctx.moveTo(xa - 8, y); ctx.lineTo(xa, y - 6); ctx.lineTo(xa, y + 6); ctx.closePath(); ctx.fill(); }
    ctx.lineWidth = 2;
    [[a, xa, ca], [b, xb, cb]].forEach(([v, x, cl]) => {
      if (!isFinite(v)) return;
      ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fillStyle = cl ? color : C.card; ctx.fill(); ctx.stroke();
    });
    ctx.restore();
  }
  return { n, fmt, region, shade, shadeWhere, outline, place, line, seg };
})();
