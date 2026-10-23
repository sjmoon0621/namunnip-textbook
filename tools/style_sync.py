"""나뭇잎과 QURI가 함께 쓰는 파일이 두 저장소에서 같은지 확인한다(STYLE.md 5·7절). 두 저장소에 같은 파일이 있다.

usage: python -I -X utf8 tools/style_sync.py <다른 저장소 경로>
같으면 종료 코드 0, 다르면 다른 파일을 적고 1. 줄 끝(CRLF/LF)은 무시한다."""
import sys
from pathlib import Path

SHARED = ["STYLE.md", "css/shared.css", "tools/style_check.py", "tools/style_sync.py"]
ROOT = Path(__file__).resolve().parent.parent


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    other = Path(sys.argv[1]).resolve()
    bad = []
    for f in SHARED:
        a, b = ROOT / f, other / f
        if not a.exists() or not b.exists():
            bad.append(f"{f}: {'여기' if not a.exists() else '다른 저장소'}에 없음")
        elif a.read_bytes().replace(b"\r\n", b"\n") != b.read_bytes().replace(b"\r\n", b"\n"):
            bad.append(f"{f}: 내용이 다름")
    for x in bad:
        print(x)
    print("같음" if not bad else f"다른 파일 {len(bad)}개")
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
