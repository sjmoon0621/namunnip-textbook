/* 공통수학2 함수 카드 공용 도구 window.NMMap — 집합 사이의 대응을 화살표 그림으로 그린다
   make(canvas, cols, draw): cols = [{name, items: [이름...]}] 를 가로로 늘어놓는다.
   돌려주는 M: pos(c, i) 원소 위치, sets(o) 집합·원소 그리기, arrow(...) 화살표, label(c, t) 화살표 이름, tap(fn) 누른 원소 {c, i} */
window.NMMap = (() => {
  function make(canvas, cols, draw) {
    const { C, F, fit } = NM;
    const { ctx, size } = fit(canvas, () => draw());
    const M = { ctx, size, cols };
    const TOP = 34, BOT = 10;
    M.r = () => Math.max(11, Math.min(15, size.w / 30));
    M.cx = (c) => size.w * (c + 0.5) / M.cols.length;
    M.gap = (c) => Math.min(50, (size.h - TOP - BOT) / M.cols[c].items.length);
    M.mid = () => (TOP + size.h - BOT) / 2;
    M.pos = (c, i) => { const n = M.cols[c].items.length; return [M.cx(c), M.mid() + (i - (n - 1) / 2) * M.gap(c)]; };

    /* o.ring(c, i) → 테두리 색 또는 null, o.fill(c, i) → 바탕 색 또는 null */
    M.sets = (o = {}) => {
      ctx.clearRect(0, 0, size.w, size.h);
      const R = M.r();
      M.cols.forEach((col, c) => {
        const n = col.items.length, hh = (n - 1) * M.gap(c) / 2 + R + 9, rx = R * 2.3;
        ctx.strokeStyle = C.ink3; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.ellipse(M.cx(c), M.mid(), rx, hh, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = C.ink2; ctx.font = `italic 600 15px ${F.serif}`; ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
        ctx.fillText(col.name, M.cx(c), M.mid() - hh - 6);
        col.items.forEach((t, i) => {
          const [x, y] = M.pos(c, i), ring = o.ring && o.ring(c, i), fill = o.fill && o.fill(c, i);
          ctx.fillStyle = fill || C.card; ctx.beginPath(); ctx.arc(x, y, R, 0, 7); ctx.fill();
          ctx.strokeStyle = ring || C.ink2; ctx.lineWidth = ring ? 2.6 : 1.3; ctx.stroke();
          ctx.fillStyle = C.ink; ctx.font = `600 ${R > 12 ? 13 : 12}px ${F.sans}`; ctx.textBaseline = "middle";
          ctx.fillText(t, x, y + 0.5);
        });
      });
    };

    /* (c1, i1) → (c2, i2) 화살표. 원 테두리에서 시작해 테두리에서 끝난다 */
    M.arrow = (c1, i1, c2, i2, color, wd = 1.6, dash) => {
      const [x1, y1] = M.pos(c1, i1), [x2, y2] = M.pos(c2, i2), R = M.r() + 2;
      const L = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / L, uy = (y2 - y1) / L;
      const ax = x1 + ux * R, ay = y1 + uy * R, bx = x2 - ux * R, by = y2 - uy * R;
      ctx.save(); ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = wd; ctx.setLineDash(dash || []);
      ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx - ux * 6, by - uy * 6); ctx.stroke();
      ctx.setLineDash([]); ctx.beginPath(); ctx.moveTo(bx, by);
      ctx.lineTo(bx - ux * 10 - uy * 4.5, by - uy * 10 + ux * 4.5); ctx.lineTo(bx - ux * 10 + uy * 4.5, by - uy * 10 - ux * 4.5); ctx.fill();
      ctx.restore();
    };

    /* 두 집합 사이(가운데 위쪽)에 화살표 이름을 쓴다 */
    M.label = (c, t, color) => {
      ctx.save(); ctx.fillStyle = color || C.ink2; ctx.font = `italic 600 14px ${F.serif}`; ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
      ctx.fillText(t, (M.cx(c) + M.cx(c + 1)) / 2, 18); ctx.restore();
    };

    M.hit = (px, py) => {
      const R = M.r() + 9;
      for (let c = 0; c < M.cols.length; c++) for (let i = 0; i < M.cols[c].items.length; i++) {
        const [x, y] = M.pos(c, i);
        if (Math.hypot(x - px, y - py) < R) return { c, i };
      }
      return null;
    };
    M.tap = (fn) => {
      const at = (e) => { const r = canvas.getBoundingClientRect(); return M.hit(e.clientX - r.left, e.clientY - r.top); };
      canvas.addEventListener("click", (e) => { const h = at(e); if (h) fn(h); });
      canvas.addEventListener("pointermove", (e) => { canvas.style.cursor = at(e) ? "pointer" : ""; });
    };
    return M;
  }
  return { make };
})();
