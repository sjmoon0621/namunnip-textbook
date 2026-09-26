#!/usr/bin/env python3
"""페이지를 로컬 서버로 띄워 헤드리스 크롬으로 열고, 콘솔 오류와 404(없는 스크립트·이미지)를 보고한다. 선택적으로 스크린샷.

사용:
  python3 tools/check.py PORT c/is1/1-1.html [c/is1/1-2.html ...]
  python3 tools/check.py PORT --shot OUT_DIR c/is1/1-1.html ...      # 1440px 전체 스크린샷도 저장
  python3 tools/check.py PORT --mobile --shot OUT_DIR c/is1/1-1.html  # 390px 폭으로 (iframe 사용)
PORT는 에이전트마다 다른 번호를 쓸 것.
"""
import sys, subprocess, threading, http.server, socketserver, functools, pathlib, os, re, tempfile

ROOT = pathlib.Path(__file__).resolve().parent.parent
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"


MISSING = []   # 서버가 404로 응답한 경로 (페이지마다 비움)


def serve(port):
    p = subprocess.Popen([sys.executable, "-u", "-m", "http.server", str(port), "--bind", "127.0.0.1", "--directory", str(ROOT)],
                         stdout=subprocess.DEVNULL, stderr=subprocess.PIPE, text=True)

    def watch():
        for line in p.stderr:
            m = re.search(r'"GET (\S+) HTTP[^"]*" 404', line)
            if m and not m.group(1).startswith("/favicon"):
                MISSING.append(m.group(1))
    threading.Thread(target=watch, daemon=True).start()
    import time; time.sleep(0.8)
    return p


def main():
    args = sys.argv[1:]
    port = int(args.pop(0))
    shot, mobile = None, False
    if "--mobile" in args:
        args.remove("--mobile"); mobile = True
    if "--shot" in args:
        i = args.index("--shot"); shot = pathlib.Path(args[i + 1]); args[i:i + 2] = []
        shot.mkdir(parents=True, exist_ok=True)
    httpd = serve(port)
    bad = 0
    for page in args:
        url = f"http://127.0.0.1:{port}/{page}"
        MISSING.clear()
        r = subprocess.run([CHROME, "--headless=new", "--enable-logging=stderr", "--v=1",
                            "--virtual-time-budget=6000", "--window-size=1440,1000", "--dump-dom", url],
                           capture_output=True, text=True, timeout=120)
        errs = [l for l in r.stderr.splitlines() if "CONSOLE" in l and ("Error" in l or "error" in l or "Uncaught" in l)]
        errs = [re.sub(r"^.*?CONSOLE\(\d+\)\] ", "", e) for e in errs]
        errs += [f"404 {m}" for m in dict.fromkeys(MISSING)]
        if "<main" not in r.stdout:
            errs.append("페이지를 불러오지 못함")
        print(("OK   " if not errs else "FAIL ") + page)
        for e in errs[:8]:
            print("     " + e[:300])
        bad += bool(errs)
        if shot:
            name = page.replace("/", "_").replace(".html", "") + ("_m" if mobile else "") + ".png"
            if mobile:
                wrap = ROOT / f"_wrap_{port}.html"
                wrap.write_text(f'<body style="margin:0"><iframe src="{page}" style="width:390px;height:7000px;border:0"></iframe></body>')
                target, size = f"http://127.0.0.1:{port}/{wrap.name}", "600,7000"
            else:
                target, size = url, "1440,6000"
            subprocess.run([CHROME, "--headless=new", "--hide-scrollbars", "--virtual-time-budget=8000",
                            f"--window-size={size}", f"--screenshot={shot / name}", target], capture_output=True, timeout=120)
            if mobile:
                wrap.unlink(missing_ok=True)
            print(f"     스크린샷: {shot / name}")
    httpd.terminate()
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
