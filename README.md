# 랜덤 3곡 셀렉터

`song.csv`의 곡 중 중복 없이 3곡을 무작위로 뽑는 모바일 웹 페이지입니다. 설치나 서버 프로그램 없이 GitHub Pages에서 동작합니다.

## GitHub Pages에 올리기

1. 이 폴더의 파일을 GitHub 저장소의 기본 브랜치 최상위에 올립니다.
2. 저장소 **Settings → Pages → Build and deployment**에서 **Deploy from a branch**를 선택합니다.
3. 기본 브랜치와 **/(root)** 폴더를 선택하고 저장합니다.
4. Pages 화면에 표시된 주소로 접속합니다. 배포가 반영되기까지 잠시 걸릴 수 있습니다.

곡을 추가하거나 삭제하려면 `song.csv`의 `곡명` 열을 편집하면 됩니다. 웹 페이지가 열릴 때 이 파일을 읽습니다.

로컬에서 확인할 때는 이 폴더에서 `python3 -m http.server 8000`을 실행하고 `http://localhost:8000`에 접속하세요. 브라우저에서 `index.html` 파일을 직접 열면 CSV 읽기가 차단될 수 있습니다.
