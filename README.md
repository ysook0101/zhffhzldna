# AEGISPATH & CYBERHACKSTEP 통합 마스터 워게임 플랫폼 (결과)

하위 폴더 1(AegisPath 단일 HTML 워게임), 2(Sentinel Arena 백엔드/데이터베이스 연동 풀스택), 3(CYBERHACKSTEP 사이버펑크 테크니컬 HUD 시스템)의 모든 기능과 소스 코드를 단일 마스터 아키텍처로 통합한 종합 보안 워게임 플랫폼입니다.

---

## 🚀 빠른 실행 방법

### 방법 1. 즉시 브라우저 실행 (설치 필요 없음)
`결과/standalone.html` 파일을 브라우저(Chrome, Edge 등)로 **더블클릭**하여 즉시 실행할 수 있습니다.

### 방법 2. Vite + React 개발 서버 실행
```bash
# 1. 의존성 패키지 설치
npm install

# 2. Vite 프론트엔드 개발 서버 시작
npm run dev

# 3. (선택사항) Express 백엔드 API 서버와 동시 실행
npm run dev:full
```

---

## 🌟 통합 핵심 기능 목록

1. **듀얼 작전 모드 (Offensive & Defensive)**
   - **HACKING (Offensive)**: 취약점 분석 및 페이로드 조립을 통한 침투 실습
   - **SECURITY (Defensive)**: Prepared Statement, htmlspecialchars, HttpOnly 등 시큐어 코딩 패치 실습
2. **8대 종합 보안 카테고리**
   - SQL Injection, XSS 스크립트, 메모리 취약점, 암호 해독, 네트워크 패킷, 웹 해킹(LFI/RCE), 디지털 포렌식, 리버싱 분석
3. **3분할 실전 샌드박스**
   - **좌측**: 시나리오 브리핑 / 소스 코드 / CWE 보안 이론 탭
   - **중앙**: 실시간 명령어 터미널 샌드박스 (`operator@target:~$`) + FLAG 제출
   - **우측**: 실시간 AI 보안 코치 대화창 및 추천 질문 프롬프트
4. **8축 전술 레이더 차트 & 마스터리 시스템**
   - 0T ~ 5T 전술 마스터리 다각형 레이더 차트 (5T 도달 시 레인보우 애니메이션)
5. **10단계 개발자 레벨 티어 & 칭호 보관소 (Title Vault)**
   - 새싹 개발자(Lv.1)부터 웹 아키텍트(Lv.100)까지 10개 레벨 칭호 + 40개 전술 칭호 장착 시스템
6. **암호화 통신망 (Encrypted Channel) 커뮤니티**
   - 취약점 분석 팁, 방어 페이로드 공유 및 실시간 포스팅/피드
7. **8대 분야 마스터 공략집 (Strategy Document)**
   - 3단계 정밀 공략 가이드 및 핵심 익스플로잇/시큐어 코드 예제 수록
8. **백엔드 API 서버 (`server.js`) & DB 마이그레이션 (`init-db.js`)**
   - PostgreSQL (Neon DB) 연결 및 인메모리 복원력 내장 (DB 연결 없이도 완벽 작동)
