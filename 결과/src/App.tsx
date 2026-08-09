import React, { useState, useRef, useEffect } from 'react';
import { 
  Terminal, Send, ShieldAlert, Cpu, LogIn, User, Play, BookOpen, 
  ArrowRight, Flag, Target, Layers, Settings, BarChart2, CheckCircle2, 
  Bookmark, Lock, Award, ShieldCheck, Activity, MessageSquare, ThumbsUp, 
  RotateCcw, Sparkles, AlertTriangle, Database, Code, Globe, Key, Binary,
  FileSearch, RefreshCw, Radio
} from 'lucide-react';

// ==========================================
// 1. TYPE DEFINITIONS & CONSTANTS
// ==========================================

export type ViewState = 
  | 'landing' 
  | 'tutorial_intro' 
  | 'main' 
  | 'wargames' 
  | 'arena_play' 
  | 'arena_clear' 
  | 'profile' 
  | 'titles' 
  | 'community' 
  | 'rankings' 
  | 'guide' 
  | 'login';

export type RoleMode = 'Hacking' | 'Security';

export type ProblemItem = {
  id: string;
  title: string;
  category: string;
  role: RoleMode;
  level: string;
  xp: number;
  answer: string;
  flag: string;
  desc: string;
  code: string;
  language: string;
  hint: string;
  cwe?: string;
};

export type Message = { role: 'user' | 'ai'; text: string };
export type Log = { type: 'info' | 'error' | 'success' | 'warning'; text: string };

export type CommunityPost = {
  id: number;
  title: string;
  content: string;
  author: string;
  created_at: string;
  likes: number;
};

export type LevelRankIconType =
  | 'sprout'
  | 'trainee'
  | 'bronze'
  | 'silver'
  | 'gold'
  | 'platinum'
  | 'diamond'
  | 'master'
  | 'grandmaster'
  | 'architect';

export type LevelTierMeta = {
  color: string;
  glow: string;
  iconType: LevelRankIconType;
  isRainbow?: boolean;
};

export const levelTierMetaMap: Record<string, LevelTierMeta> = {
  '새싹 개발자': { color: '#3f3f46', glow: 'rgba(63, 63, 70, 0.9)', iconType: 'sprout' },
  '견습생': { color: '#ffffff', glow: 'rgba(255, 255, 255, 0.92)', iconType: 'trainee' },
  '브론즈': { color: '#b87333', glow: 'rgba(184, 115, 51, 0.92)', iconType: 'bronze' },
  '실버': { color: '#c0c0c0', glow: 'rgba(192, 192, 192, 0.95)', iconType: 'silver' },
  '골드': { color: '#ffd700', glow: 'rgba(255, 215, 0, 0.95)', iconType: 'gold' },
  '플래티넘': { color: '#2dd4bf', glow: 'rgba(45, 212, 191, 0.95)', iconType: 'platinum' },
  '다이아몬드': { color: '#38bdf8', glow: 'rgba(56, 189, 248, 0.95)', iconType: 'diamond' },
  '마스터': { color: '#a855f7', glow: 'rgba(168, 85, 247, 0.95)', iconType: 'master' },
  '그랜드마스터': { color: '#fb923c', glow: 'rgba(251, 146, 60, 0.95)', iconType: 'grandmaster' },
  '웹 아키텍트': { color: '#ff00c8', glow: 'rgba(255, 255, 255, 0.95)', iconType: 'architect', isRainbow: true },
};

export const developerLevelTiers = [
  { range: 'Lv.1~9', name: '새싹 개발자' },
  { range: 'Lv.10~19', name: '견습생' },
  { range: 'Lv.20~29', name: '브론즈' },
  { range: 'Lv.30~39', name: '실버' },
  { range: 'Lv.40~49', name: '골드' },
  { range: 'Lv.50~59', name: '플래티넘' },
  { range: 'Lv.60~69', name: '다이아몬드' },
  { range: 'Lv.70~79', name: '마스터' },
  { range: 'Lv.80~99', name: '그랜드마스터' },
  { range: 'Lv.100', name: '웹 아키텍트' },
];

export const formatExp = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return num.toString();
};

export const getLevelInfo = (totalExp: number) => {
  let level = 1; 
  let currentExp = totalExp;
  while (true) {
    let requiredExp = Math.floor(10 * Math.pow(1.25, level - 1));
    if (currentExp >= requiredExp) {
      currentExp -= requiredExp;
      level++;
    } else {
      return { level, currentExp, requiredExp };
    }
  }
};

export const getDeveloperLevelTier = (level: number) => {
  if (level >= 100) return '웹 아키텍트';
  if (level >= 80) return '그랜드마스터';
  if (level >= 70) return '마스터';
  if (level >= 60) return '다이아몬드';
  if (level >= 50) return '플래티넘';
  if (level >= 40) return '골드';
  if (level >= 30) return '실버';
  if (level >= 20) return '브론즈';
  if (level >= 10) return '견습생';
  return '새싹 개발자';
};

export const getDeveloperLevelTierMeta = (tierName: string) => {
  return levelTierMetaMap[tierName] ?? levelTierMetaMap['새싹 개발자'];
};

export const getLevelTierBadgeStyle = (tierName: string): React.CSSProperties => {
  const meta = getDeveloperLevelTierMeta(tierName);
  return {
    color: meta.color,
    border: `1px solid ${meta.color}`,
    background: `${meta.color}22`,
    boxShadow: `0 0 18px ${meta.glow}, 0 0 36px ${meta.color}70, inset 0 0 16px ${meta.color}32`,
    textShadow: `0 0 10px ${meta.glow}, 0 0 22px ${meta.color}`,
  };
};

export const categories = [
  { id: 'sql', name: 'SQL Injection', desc: 'DB 인증 체계 우회 및 파라미터화 방어', icon: '💉' },
  { id: 'xss', name: 'XSS 스크립트', desc: 'DOM 조작, 세션 탈취 및 시큐어 인코딩', icon: '📝' },
  { id: 'memory', name: '메모리 취약점', desc: '버퍼 오버플로우 분석 및 안전한 메모리 관리', icon: '🧠' },
  { id: 'crypto', name: '암호 해독', desc: '해시 결함, 취약한 대칭키 및 솔팅 검증', icon: '🔐' },
  { id: 'network', name: '네트워크 패킷', desc: '평문 트래픽 스니핑 및 SSL/TLS 암호화', icon: '🌐' },
  { id: 'web', name: '웹 해킹 (LFI/RCE)', desc: '경로 탐색(Path Traversal) 및 파라미터 변조', icon: '🕸️' },
  { id: 'forensic', name: '디지털 포렌식', desc: '은폐된 아티팩트 및 메모리 덤프 추적', icon: '🔍' },
  { id: 'reversing', name: '리버싱 분석', desc: '바이너리 분기점 역어셈블 및 패치', icon: '⚙️' }
];

export const tacticalTierRequirements: Record<number, number> = {
  0: 100, 1: 250, 2: 500, 3: 1000, 4: 2500,
};

export type TacticalMastery = { tier: number; progress: number; };

export const getTierRequirement = (tier: number) => tacticalTierRequirements[Math.max(0, Math.min(4, tier))] ?? 2500;

export const getMasteryPercent = (mastery: TacticalMastery) => {
  if (mastery.tier >= 5) return 100;
  return Math.min(100, (mastery.progress / getTierRequirement(mastery.tier)) * 100);
};

export const getTierTextColor = (tier: number) => {
  const tierColorMap: Record<number, string> = {
    0: '#64748b', 1: '#00f2fe', 2: '#a3e635', 3: '#facc15', 4: '#fb923c', 5: '#f472b6',
  };
  return tierColorMap[tier] ?? '#64748b';
};

export const getTierGaugeStyle = (tier: number) => {
  if (tier >= 5) {
    return {
      background: 'linear-gradient(90deg, #ff004c, #ff9f1c, #fff200, #00ff85, #00c2ff, #7c3aed, #ff00c8)',
      boxShadow: '0 0 14px rgba(255, 255, 255, 0.75)',
    };
  }
  const color = getTierTextColor(tier);
  return { backgroundColor: color, boxShadow: `0 0 12px ${color}` };
};

// ==========================================
// 2. MASTER PROBLEM DATABASE (1 + 2 + 3)
// ==========================================

export const masterProblemDB: ProblemItem[] = [
  // --- SQL Injection / Hacking ---
  {
    id: 'sq_h_t_1',
    title: '[이해] 인증 우회 페이로드 작성',
    category: 'SQL Injection',
    role: 'Hacking',
    level: 'Tutorial',
    xp: 50,
    cwe: 'CWE-89',
    answer: "GET /login?id=admin'--",
    flag: 'FLAG{SQL_AUTH_BYPASS_ADMIN}',
    desc: `당신은 타겟 웹사이트의 로그인 API를 분석 중입니다. 백엔드 코드는 사용자가 입력한 아이디와 비밀번호를 검증하기 위해 아래와 같은 SQL 쿼리를 구성합니다.
<div class='code-snippet'>SELECT * FROM users WHERE id='<span style="color:#f87171;">$_GET["id"]</span>' AND pw='$_GET["pw"]'</div>
만약 우리가 <code>id</code> 파라미터 값으로 <code>admin'--</code> 를 보낸다면 SQL에서 <code>--</code>는 주석으로 처리되어 비밀번호 검증이 무력화됩니다.
<br><br>👉 <b>정답 작성 양식: GET /login?id=admin'--</b>`,
    code: `const username = req.query.id;
const password = req.query.pw;

// 취약한 쿼리 생성
const query = \`SELECT * FROM users WHERE id='\${username}' AND pw='\${password}'\`;
const user = await db.query(query);`,
    language: 'javascript',
    hint: "작은따옴표(')로 문자열을 닫고 -- 주석으로 비밀번호 검사를 날려버리세요."
  },
  {
    id: 'sq_h_t_2',
    title: '[이해] Tautology 조건문 참 조작',
    category: 'SQL Injection',
    role: 'Hacking',
    level: 'Tutorial',
    xp: 60,
    cwe: 'CWE-89',
    answer: "id=' OR '1'='1",
    flag: 'FLAG{TAUTOLOGY_ALWAYS_TRUE}',
    desc: `타겟 관리자 아이디를 모를 때는 무조건 참(True)이 되는 수식을 주입하여 데이터베이스를 속입니다.
<div class='code-snippet'>SELECT * FROM users WHERE id='<span style="color:#f87171;">[INPUT]</span>' AND pw='...'</div>
<code>' OR '1'='1</code> 을 넣으면 WHERE 조건이 무조건 참이 되어 첫 번째 계정으로 로그인됩니다.
<br><br>👉 <b>정답 작성 양식: id=' OR '1'='1</b>`,
    code: `// Tautology 검증 로직
const sql = "SELECT * FROM users WHERE id='" + inputId + "' AND pw='" + inputPw + "'";
db.execute(sql);`,
    language: 'javascript',
    hint: "OR '1'='1 조건을 추가하여 항상 참으로 만드세요."
  },
  {
    id: 'sq_h_e_1',
    title: '[실전] MySQL 인라인 주석 # Bypass',
    category: 'SQL Injection',
    role: 'Hacking',
    level: 'Easy',
    xp: 100,
    cwe: 'CWE-89',
    answer: "admin' #",
    flag: 'FLAG{MYSQL_HASH_COMMENT_SUCCESS}',
    desc: `MySQL 환경에서는 <code>--</code> 대신 <code>#</code> 기호를 주석으로 사용합니다.
<div class='code-snippet'>SELECT * FROM admin_db WHERE username='<span style="color:#f87171;">[INPUT]</span>' AND pass='[INPUT]'</div>
👉 아이디가 admin인 계정으로 로그인하는 페이로드를 작성하십시오.`,
    code: `const sql = \`SELECT * FROM admin_db WHERE username='\${req.body.username}' AND pass='\${req.body.password}'\`;`,
    language: 'sql',
    hint: "admin' 뒤에 # 기호를 붙여보세요."
  },

  // --- SQL Injection / Security (Defensive) ---
  {
    id: 'sq_s_t_1',
    title: '[이해] Prepared Statement 구조체 패치',
    category: 'SQL Injection',
    role: 'Security',
    level: 'Tutorial',
    xp: 50,
    cwe: 'CWE-89',
    answer: "PreparedStatement pstmt = connection.prepareStatement(query);",
    flag: 'FLAG{PREPARED_STATEMENT_SECURED}',
    desc: `SQLi를 막으려면 쿼리의 '뼈대'를 DB에 먼저 보내 컴파일시킨 뒤 나중에 데이터만 안전하게 주입해야 합니다.
Java에서 Statement 대신 이 기능을 지원하는 객체를 생성하는 코드를 작성하십시오.
<br><br>👉 <b>정답 작성 양식: PreparedStatement pstmt = connection.prepareStatement(query);</b>`,
    code: `// 취약한 코드 (문자열 결합)
Statement stmt = connection.createStatement();
ResultSet rs = stmt.executeQuery("SELECT * FROM users WHERE id='" + userInput + "'");

// [패치 필요: PreparedStatement 사용]`,
    language: 'java',
    hint: "connection.prepareStatement(query) 메소드를 호출하세요."
  },
  {
    id: 'sq_s_t_2',
    title: '[이해] 파라미터 바인딩 패치',
    category: 'SQL Injection',
    role: 'Security',
    level: 'Tutorial',
    xp: 60,
    cwe: 'CWE-89',
    answer: "pstmt.setString(1, userInput);",
    flag: 'FLAG{PARAM_BINDING_COMPLETE}',
    desc: `쿼리의 물음표(?) 자리에 사용자의 입력값을 문자열(String) 형태로 안전하게 바인딩하는 코드를 작성하십시오.
<br><br>👉 <b>정답 작성 양식: pstmt.setString(1, userInput);</b>`,
    code: `String query = "SELECT * FROM users WHERE id = ? ";
PreparedStatement pstmt = connection.prepareStatement(query);
// [이곳에 바인딩 코드 작성]`,
    language: 'java',
    hint: "pstmt.setString(인덱스, 변수) 형식입니다."
  },

  // --- XSS / Hacking ---
  {
    id: 'xs_h_t_1',
    title: '[이해] 기본 XSS 스크립트 작성',
    category: 'XSS 스크립트',
    role: 'Hacking',
    level: 'Tutorial',
    xp: 50,
    cwe: 'CWE-79',
    answer: "<script>alert(document.cookie)</script>",
    flag: 'FLAG{XSS_COOKIE_STEAL_BASIC}',
    desc: `게시판 본문에 사용자 입력값이 HTML 태그로 그대로 렌더링되는 취약점이 있습니다.
타인이 글을 읽을 때 세션 쿠키(document.cookie)를 경고창(alert)으로 띄우는 스크립트를 작성하십시오.
<br><br>👉 <b>정답 작성 양식: &lt;script&gt;alert(document.cookie)&lt;/script&gt;</b>`,
    code: `<div class="board-content">
  <!-- 사용자 입력값이 검증 없이 출력됨 -->
  \${userContent}
</div>`,
    language: 'html',
    hint: "<script>alert(document.cookie)</script> 를 입력하세요."
  },
  {
    id: 'xs_h_t_2',
    title: '[이해] HTML 속성(Attribute) 탈출',
    category: 'XSS 스크립트',
    role: 'Hacking',
    level: 'Tutorial',
    xp: 60,
    cwe: 'CWE-79',
    answer: '"><script>alert(1)</script>',
    flag: 'FLAG{XSS_ATTR_ESCAPE_SUCCESS}',
    desc: `입력값이 input 태그의 value 속성 내부에 갇혀있습니다.
먼저 " 로 value를 닫고 > 로 태그를 끝낸 뒤 악성 스크립트를 삽입하십시오.
<br><br>👉 <b>정답 작성 양식: "&gt;&lt;script&gt;alert(1)&lt;/script&gt;</b>`,
    code: `<input type="text" name="search" value="\${userInput}">`,
    language: 'html',
    hint: '"><script>alert(1)</script> 형식으로 닫고 열어보세요.'
  },

  // --- XSS / Security (Defensive) ---
  {
    id: 'xs_s_t_1',
    title: '[이해] PHP htmlspecialchars 패치',
    category: 'XSS 스크립트',
    role: 'Security',
    level: 'Tutorial',
    xp: 50,
    cwe: 'CWE-79',
    answer: "echo htmlspecialchars($_POST['msg']);",
    flag: 'FLAG{HTML_SPECIALCHARS_SECURED}',
    desc: `XSS를 방어하기 위해 특수문자(<, >)를 HTML Entity(&lt;, &gt;)로 변환하는 htmlspecialchars 함수로 $_POST['msg']를 출력(echo)하십시오.
<br><br>👉 <b>정답 작성 양식: echo htmlspecialchars($_POST['msg']);</b>`,
    code: `// 취약한 출력
// echo $_POST['msg'];

// [보안 패치 코드 작성]`,
    language: 'php',
    hint: "echo htmlspecialchars($_POST['msg']); 를 작성하세요."
  },
  {
    id: 'xs_s_t_2',
    title: '[이해] HttpOnly 쿠키 보안 속성 설정',
    category: 'XSS 스크립트',
    role: 'Security',
    level: 'Tutorial',
    xp: 60,
    cwe: 'CWE-79',
    answer: "Set-Cookie: session_id=123; HttpOnly",
    flag: 'FLAG{HTTPONLY_COOKIE_ARMORED}',
    desc: `XSS 공격이 발생하더라도 자바스크립트로 세션 쿠키를 탈취하지 못하도록 HttpOnly 속성을 부여한 HTTP 헤더 전체를 작성하십시오.
<br><br>👉 <b>정답 작성 양식: Set-Cookie: session_id=123; HttpOnly</b>`,
    code: `// 기존 취약한 헤더
Set-Cookie: session_id=123;

// [HttpOnly 플래그 추가 필요]`,
    language: 'http',
    hint: "Set-Cookie: session_id=123; HttpOnly 를 제출하세요."
  },

  // --- Other Categories (Memory, Crypto, Network, Web, Forensic, Reversing) ---
  {
    id: 'mem_1',
    title: '[실습] 버퍼 길이 검증 부재 및 오버플로우',
    category: '메모리 취약점',
    role: 'Hacking',
    level: 'Easy',
    xp: 100,
    cwe: 'CWE-120',
    answer: "python3 -c \"print('A'*64 + '\\xef\\xbe\\xad\\xde')\"",
    flag: 'FLAG{BUFFER_OVERFLOW_EXPLOITED}',
    desc: `gets() 함수는 입력 길이를 검증하지 않아 스택 복귀 주소를 오염시킵니다. 64바이트 버퍼를 채우고 타겟 주소를 덮어씌우는 명령어를 입력하세요.`,
    code: `char buffer[64];
printf("Enter payload: ");
gets(buffer); // 위험!`,
    language: 'c',
    hint: "64바이트 더미 문자 A와 리턴 주소를 결합하세요."
  },
  {
    id: 'crypto_1',
    title: '[실습] 솔트 없는 MD5 해시 역추적',
    category: '암호 해독',
    role: 'Hacking',
    level: 'Easy',
    xp: 100,
    cwe: 'CWE-328',
    answer: "hashcat -m 0 md5_hashes.txt wordlist.txt",
    flag: 'FLAG{MD5_HASH_CRACKED_PLAIN}',
    desc: `Salt 없이 저장된 MD5 비밀번호 해시 파일에 사전 공격을 수행하는 Hashcat 명령어를 완성하세요.`,
    code: `const hash = md5(userPassword); // Salt 부재로 레인보우 테이블 공격에 취약`,
    language: 'bash',
    hint: "hashcat -m 0 md5_hashes.txt wordlist.txt 를 입력하세요."
  },
  {
    id: 'network_1',
    title: '[실습] 평문 패킷 스니핑 탐지',
    category: '네트워크 패킷',
    role: 'Hacking',
    level: 'Easy',
    xp: 100,
    cwe: 'CWE-319',
    answer: "tcpdump -i eth0 -vvv -X 'port 80'",
    flag: 'FLAG{CLEARTEXT_PACKET_SNIFFED}',
    desc: `암호화되지 않은 HTTP 80번 포트의 원시 패킷을 ASCII 및 Hex 형식으로 덤프하는 tcpdump 명령어를 입력하세요.`,
    code: `POST /login HTTP/1.1\nHost: target.local\n\nusername=admin&password=secret_password`,
    language: 'bash',
    hint: "tcpdump -i eth0 -vvv -X 'port 80' 을 입력하세요."
  },
  {
    id: 'web_1',
    title: '[실습] Path Traversal 상위 디렉터리 탐색',
    category: '웹 해킹 (LFI/RCE)',
    role: 'Hacking',
    level: 'Easy',
    xp: 100,
    cwe: 'CWE-22',
    answer: "../../../../../../etc/passwd",
    flag: 'FLAG{PATH_TRAVERSAL_PASSWD_FOUND}',
    desc: `상위 디렉터리로 거슬러 올라가 시스템 계정 파일(/etc/passwd)을 로드하는 상대 경로 페이로드를 작성하세요.`,
    code: `const filename = req.query.file;
fs.readFile('/var/www/uploads/' + filename);`,
    language: 'javascript',
    hint: "../../../../../../etc/passwd 를 입력하세요."
  },
  {
    id: 'forensic_1',
    title: '[실습] 이미지 메타데이터 Exif 아티팩트 추출',
    category: '디지털 포렌식',
    role: 'Hacking',
    level: 'Easy',
    xp: 100,
    cwe: 'CWE-200',
    answer: "exiftool evidence_photo.png",
    flag: 'FLAG{EXIF_METADATA_EXTRACTED}',
    desc: `증거 이미지 파일 내부에 숨겨진 GPS 정보 및 메타데이터 코멘트를 추출하는 도구 명령어를 작성하세요.`,
    code: `file: evidence_photo.png\nComment: FLAG_IS_HIDDEN_IN_METADATA`,
    language: 'bash',
    hint: "exiftool evidence_photo.png 를 입력하세요."
  },
  {
    id: 'rev_1',
    title: '[실습] 바이너리 조건부 점프 역어셈블',
    category: '리버싱 분석',
    role: 'Hacking',
    level: 'Easy',
    xp: 100,
    cwe: 'CWE-697',
    answer: "objdump -d ./crackme | grep main -A 20",
    flag: 'FLAG{REVERSING_DISASSEMBLY_PASS}',
    desc: `바이너리 실행 파일의 main 함수 어셈블리 코드를 20줄 디스어셈블 출력하는 objdump 명령어를 작성하세요.`,
    code: `if (input === "open_sesame") {\n  grant_access();\n}`,
    language: 'bash',
    hint: "objdump -d ./crackme | grep main -A 20 을 입력하세요."
  }
];

// ==========================================
// 3. COMPREHENSIVE STRATEGY DOCUMENTS (공략집)
// ==========================================

export const comprehensiveStrategies: Record<string, { title: string; steps: string[]; codeExamples: string[] }> = {
  'sql': {
    title: "SQL Injection 마스터 공략집",
    steps: [
      "📌 [1단계: 취약성 정밀 진단] - 입력 폼 필드나 URL 파라미터 내부에 작은따옴표(') 혹은 큰따옴표(\")를 주입해 DB Syntax 에러가 유출되는지 검증합니다.",
      "📌 [2단계: 인증 우회 시나리오] - 백엔드 쿼리의 구조를 무력화하기 위해 상시 참을 만드는 구문(' OR '1'='1) 및 뒤쪽 쿼리를 소거하는 주석(-- 또는 #)을 결합하여 가짜 토큰을 강제 주입합니다.",
      "📌 [3단계: 방어 및 시큐어 코딩] - Statement 대신 PreparedStatement를 도입하고, 매개변수화된 쿼리(Parameterized Query)를 통해 쿼리 구조와 입력 데이터를 엄격히 분리합니다."
    ],
    codeExamples: ["' OR 1=1 -- ", "admin' --", "' UNION SELECT null, version(), user() --", "PreparedStatement pstmt = conn.prepareStatement(query);"]
  },
  'xss': {
    title: "Cross-Site Scripting (XSS) 분석 및 방어 기법",
    steps: [
      "📌 [1단계: 컨텍스트 분석] - 사용자의 입력값이 HTML 본문, 속성값, 스크립트 블록 중 어디에 필터링 없이 그대로 인쇄되는지 추적합니다.",
      "📌 [2단계: 샌드박스 우회 및 실행] - <script> 태그가 차단된 경우 onerror, onload 등의 이벤트 핸들러 속성을 활용하거나 SVG 그래픽 태그를 주입합니다.",
      "📌 [3단계: 방어 대책 수립] - HTML Entity Encoding(htmlspecialchars)을 적용하고, 세션 쿠키에 HttpOnly 플래그 및 CSP(Content Security Policy)를 선언합니다."
    ],
    codeExamples: ["<script>alert(document.cookie)</script>", "<img src=x onerror=alert(1)>", "<svg onload=alert(1)>", "Set-Cookie: session=123; HttpOnly; Secure"]
  },
  'memory': {
    title: "메모리 손상 및 버퍼 오버플로우 관제",
    steps: [
      "📌 [1단계: 오프셋 거리 계산] - 입력 버퍼 시작점부터 함수의 복귀 주소(EIP/RIP)까지의 오프셋 거리를 패턴 생성기를 통해 파악합니다.",
      "📌 [2단계: 레지스터 오염 및 실행 제어] - 더미 값('A'*오프셋)을 채운 뒤 타겟 셸코드 주소를 덮어씌웁니다.",
      "📌 [3단계: 방어 패치] - gets(), strcpy() 등 경계 검사가 없는 취약 함수를 fgets(), strncpy()로 전면 교체하고 ASLR, Stack Canary를 활성화합니다."
    ],
    codeExamples: ["python3 -c \"print('A'*64 + '\\xef\\xbe\\xad\\xde')\"", "checksec --file=target_bin", "fgets(buffer, sizeof(buffer), stdin);"]
  },
  'crypto': {
    title: "암호화 알고리즘 크래킹 및 솔팅 검증",
    steps: [
      "📌 [1단계: 해시 식별] - 유출된 문자열의 길이와 인코딩 특성(Base64, Hex)을 통해 알고리즘(MD5, SHA, Bcrypt)을 판별합니다.",
      "📌 [2단계: 사전 공격 구동] - Rockyou 사전 파일과 결합하여 GPU 기반 Hashcat 무차별 대입을 수행합니다.",
      "📌 [3단계: 보안 강화] - 안전한 단방향 해시 알고리즘(Bcrypt, Argon2)과 무작위 고유 솔트(Salt)를 반드시 적용합니다."
    ],
    codeExamples: ["hashcat -m 0 md5_hashes.txt wordlist.txt", "john --wordlist=rockyou.txt target.hash", "const hash = await bcrypt.hash(password, 12);"]
  },
  'network': {
    title: "네트워크 트래픽 스니핑 및 SSL 방어",
    steps: [
      "📌 [1단계: 무차별 모드 활성화] - 인터페이스 카드를 Promiscuous 모드로 전환하여 네트워크 세그먼트 전반의 패킷(.pcap)을 수집합니다.",
      "📌 [2단계: 평문 프로토콜 정제] - HTTP, FTP 등 암호화되지 않은 요청 패킷에서 계정 및 중요 파라미터를 필터링합니다.",
      "📌 [3단계: 전송 계층 암호화] - HTTPS(TLS 1.3)를 기본 적용하고 HSTS(HTTP Strict Transport Security)를 선언합니다."
    ],
    codeExamples: ["tcpdump -i eth0 -vvv -X 'port 80'", "tshark -r capture.pcap -Y 'http.request.method==\"POST\"'", "Strict-Transport-Security: max-age=31536000; includeSubDomains"]
  },
  'web': {
    title: "웹 애플리케이션 비즈니스 로직 취약점",
    steps: [
      "📌 [1단계: 매개변수 변조] - 요청 파라미터(id, role, price)를 중간 프록시로 가로채 관리자 권한으로 승격을 시도합니다.",
      "📌 [2단계: 경로 조작(LFI)] - ../ 기호를 사용하여 상위 시스템 설정 파일(/etc/passwd, .env)을 열람합니다.",
      "📌 [3단계: 화이트리스트 검증] - 파일 경로는 화이트리스트 기반 매핑 테이블로 처리하고, 서버 측 세션 권한을 엄격히 대조합니다."
    ],
    codeExamples: ["../../../../../../etc/passwd", "curl -F 'file=@shell.php' http://target/upload.php", "path.basename(requestedFile)"]
  },
  'forensic': {
    title: "디지털 포렌식 및 아티팩트 역추적",
    steps: [
      "📌 [1단계: 무결성 확보] - 원본 저장매체 변형을 방지하기 위해 쓰기 방지 장치 및 해시 검증된 비트스트림 이미지를 획득합니다.",
      "📌 [2단계: 휘발성 메모리 덤프 추적] - Volatility 등을 활용해 침해 당시의 프로세스 트리, 은닉 스레드, 네트워크 연결을 복원합니다.",
      "📌 [3단계: 아티팩트 분석] - 메타데이터(Exif), 프리페치, 레지스트리, 타임라인을 구성하여 침투 흔적을 입증합니다."
    ],
    codeExamples: ["volatility -f memory.dmp --profile=Win10x64 pstree", "exiftool suspicious_image.png", "strings -n 6 dump.img | grep -i 'flag'"]
  },
  'reversing': {
    title: "바이너리 리버싱 분석 및 제어 흐름 패치",
    steps: [
      "📌 [1단계: 정적 정찰] - 패커/난독화 여부를 확인하고 문자열 검색으로 하드코딩된 암호 및 분기 함수 주소를 스캔합니다.",
      "📌 [2단계: 디컴파일 제어 흐름 분석] - IDA Pro/Ghidra로 역어셈블하여 조건부 점프(JE, JNE, JZ)의 로직을 추적합니다.",
      "📌 [3단계: 동적 디버깅 및 패치] - GDB/x64dbg를 연결하여 플래그 레지스터(ZF)를 강제 반전시키거나 기계어를 NOP(0x90)으로 패치합니다."
    ],
    codeExamples: ["objdump -d ./target | grep '<main>': -A 30", "gdb -q ./target_auth", "radare2 -d ./auth_core"]
  }
};

// ==========================================
// 4. RANK EMBLEM & TITLE BADGE COMPONENTS
// ==========================================

export const RankEmblem = ({
  type,
  color,
  size = 64,
  isRainbow = false,
}: {
  type: LevelRankIconType;
  color: string;
  size?: number;
  isRainbow?: boolean;
}) => {
  const glowStyle: React.CSSProperties = {
    filter: isRainbow 
      ? 'drop-shadow(0 0 10px rgba(255,255,255,0.9)) drop-shadow(0 0 20px rgba(255,0,200,0.6))'
      : `drop-shadow(0 0 8px ${color})`,
  };

  if (type === 'sprout') {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" style={glowStyle} aria-hidden="true">
        <circle cx="50" cy="50" r="38" fill="#18181b" stroke={color} strokeWidth="6" />
        <path d="M50 68 V42 M50 48 Q36 34 32 46 Q42 54 50 48 M50 44 Q64 30 68 42 Q58 50 50 44" fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (type === 'trainee') {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" style={glowStyle} aria-hidden="true">
        <circle cx="50" cy="50" r="38" fill="#0f172a" stroke={color} strokeWidth="7" />
        <path d="M35 50 L50 35 L65 50 L50 65 Z" fill={color} />
      </svg>
    );
  }

  if (type === 'bronze' || type === 'silver' || type === 'gold') {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" style={glowStyle} aria-hidden="true">
        <path d="M50 12 L84 34 L73 79 L50 62 L27 79 L16 34Z" fill={color} />
        <path d="M36 38 L50 25 L64 38 L50 49Z" fill="#000" fillOpacity="0.3" />
      </svg>
    );
  }

  if (type === 'platinum' || type === 'diamond') {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" style={glowStyle} aria-hidden="true">
        <path d="M50 9 L86 50 L50 91 L14 50Z" fill={color} />
        <path d="M50 9 L50 91 M14 50 H86" stroke="#ffffff" strokeOpacity="0.4" strokeWidth="5" />
      </svg>
    );
  }

  if (type === 'master' || type === 'grandmaster') {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" style={glowStyle} aria-hidden="true">
        <path d="M50 7 L84 31 L76 76 L50 93 L24 76 L16 31Z" fill={color} />
        <path d="M50 17 L65 46 L50 38 L35 46Z" fill="#fff" fillOpacity="0.4" />
      </svg>
    );
  }

  // Architect Rainbow
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={glowStyle} aria-hidden="true">
      <defs>
        <linearGradient id="rainbowRankGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff004c" />
          <stop offset="25%" stopColor="#ff9f1c" />
          <stop offset="50%" stopColor="#00ff85" />
          <stop offset="75%" stopColor="#00c2ff" />
          <stop offset="100%" stopColor="#ff00c8" />
        </linearGradient>
      </defs>
      <path d="M50 5 L86 28 L76 78 L50 95 L24 78 L14 28Z" fill="url(#rainbowRankGradient)" />
      <path d="M50 15 L69 48 L50 39 L31 48Z" fill="#000" fillOpacity="0.4" />
    </svg>
  );
};

export type TitleVisualData = {
  kind: 'level' | 'mastery';
  color: string;
  name?: string;
  iconType?: LevelRankIconType;
  icon?: string;
  tier?: number;
  categoryName?: string;
  meta?: { isRainbow?: boolean };
};

export const TitleAvatarBadge = ({
  title,
  size = 96,
  frame = 'square',
  showTierChip = true,
}: {
  title: TitleVisualData;
  size?: number;
  frame?: 'square' | 'circle';
  showTierChip?: boolean;
}) => {
  const radius = frame === 'circle' ? '50%' : '14px';
  const borderColor = title.kind === 'level' ? (title.meta?.isRainbow ? '#67e8f9' : title.color) : title.color;
  const shellStyle: React.CSSProperties = {
    width: size,
    height: size,
    position: 'relative',
    borderRadius: radius,
    border: `2px solid ${borderColor}`,
    background: title.kind === 'level'
      ? title.meta?.isRainbow
        ? 'radial-gradient(circle, rgba(255,0,200,0.18), rgba(10,14,24,0.98) 70%)'
        : `radial-gradient(circle, ${title.color}28, rgba(10,14,24,0.98) 64%)`
      : `radial-gradient(circle, ${title.color}24, rgba(10,14,24,0.98) 64%)`,
    boxShadow: `0 0 16px ${title.color}88`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  };

  return (
    <div style={shellStyle}>
      {title.kind === 'level' ? (
        <RankEmblem type={title.iconType ?? 'sprout'} color={title.color} size={Math.max(24, size * 0.65)} isRainbow={title.meta?.isRainbow} />
      ) : (
        <>
          <span style={{ fontSize: Math.max(22, size * 0.36) }}>{title.icon}</span>
          {showTierChip && title.tier ? (
            <div style={{
              position: 'absolute',
              right: '6px',
              bottom: '6px',
              padding: '2px 6px',
              borderRadius: '999px',
              border: `1px solid ${title.color}`,
              background: `${title.color}33`,
              color: '#fff',
              fontSize: Math.max(9, size * 0.1),
              fontWeight: 900,
            }}>T{title.tier}</div>
          ) : null}
        </>
      )}
    </div>
  );
};

// ==========================================
// 5. MAIN APPLICATION COMPONENT
// ==========================================

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>('landing');
  const [username, setUsername] = useState<string>('Guest Operator');
  const [totalExp, setTotalExp] = useState<number>(() => {
    try { return parseInt(localStorage.getItem('aegis_total_xp') || '0'); } catch { return 0; }
  });
  const [solvedProblemIds, setSolvedProblemIds] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('aegis_solved_ids') || '[]'); } catch { return []; }
  });
  
  // Tactical Mastery
  const [tacticalMastery, setTacticalMastery] = useState<Record<string, TacticalMastery>>(() => {
    try {
      const saved = localStorage.getItem('aegis_tactical_mastery');
      if (saved) return JSON.parse(saved);
    } catch {}
    return categories.reduce((acc, cat) => {
      acc[cat.id] = { tier: 0, progress: 0 };
      return acc;
    }, {} as Record<string, TacticalMastery>);
  });

  // Selected Options
  const [selectedCategory, setSelectedCategory] = useState<string>('SQL Injection');
  const [selectedRole, setSelectedRole] = useState<RoleMode>('Hacking');
  const [currentProblem, setCurrentProblem] = useState<ProblemItem>(masterProblemDB[0]);
  const [selectedTitleId, setSelectedTitleId] = useState<string>('level-새싹 개발자');
  const [isHeaderProfileOpen, setIsHeaderProfileOpen] = useState<boolean>(false);
  const [isLandingGlitching, setIsLandingGlitching] = useState<boolean>(false);

  // Play Session
  const [payloadInput, setPayloadInput] = useState<string>('');
  const [flagInput, setFlagInput] = useState<string>('');
  const [terminalLogs, setTerminalLogs] = useState<Log[]>([{ type: 'info', text: 'System initialized. Sandbox ready.' }]);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [sandboxTab, setSandboxTab] = useState<'scenario' | 'code' | 'cwe'>('code');
  const [hintsUsed, setHintsUsed] = useState<number>(0);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [operationStartedAt, setOperationStartedAt] = useState<number>(Date.now());
  const [operationElapsedTimeText, setOperationElapsedTimeText] = useState<string>('00:00');

  // Clear Screen Data
  const [clearRewardXp, setClearRewardXp] = useState<number>(0);
  const [clearTimeText, setClearTimeText] = useState<string>('00:00');

  // AI Coach Chat
  const [aiInput, setAiInput] = useState<string>('');
  const [aiMessages, setAiMessages] = useState<Message[]>([
    { role: 'ai', text: '안녕하십니까! 저는 실전 AI 보안 코치입니다. 입력값 검증과 신뢰 경계를 분석하며 질문해 주시면 힌트를 제공합니다.' }
  ]);

  // Strategy Guide Tab
  const [activeGuideTab, setActiveGuideTab] = useState<string>('sql');

  // Community Board
  const [posts, setPosts] = useState<CommunityPost[]>(() => {
    try {
      const saved = localStorage.getItem('aegis_community_posts');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      { id: 1, title: '[암호화 통신] SQL Injection 인증 우회 팁 공유', content: "admin'-- 페이로드 뒤에 공백이나 주석 처리를 정확히 해야 MySQL 파서에서 인식됩니다.", author: 'root_operator', created_at: '방금 전', likes: 14 },
      { id: 2, title: '[보안 권고] XSS 방어 시 innerHTML 금지', content: "사용자 입력을 렌더링할 때는 반드시 textContent나 DOMPurify, 또는 프레임워크 자동 이스케이프를 사용해야 안전합니다.", author: 'shield_guardian', created_at: '10분 전', likes: 9 },
      { id: 3, title: '[작전 공유] Prepared Statement 파라미터 바인딩', content: "쿼리 구조와 데이터를 분리하는 것이 SQLi의 완벽한 1차 방어선입니다.", author: 'cyber_auditor', created_at: '1시간 전', likes: 21 },
    ];
  });
  const [postTitleInput, setPostTitleInput] = useState<string>('');
  const [postContentInput, setPostContentInput] = useState<string>('');

  // Login Modal State
  const [loginId, setLoginId] = useState<string>('');
  const [loginPw, setLoginPw] = useState<string>('');

  // Refs for Auto-Scroll
  const logEndRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Level Info calculations
  const { level: userLevel, currentExp, requiredExp } = getLevelInfo(totalExp);
  const levelExpPercent = Math.min(100, (currentExp / requiredExp) * 100);
  const userLevelTier = getDeveloperLevelTier(userLevel);
  const userLevelTierMeta = getDeveloperLevelTierMeta(userLevelTier);
  const currentLevelTierIndex = Math.max(0, developerLevelTiers.findIndex((tier) => tier.name === userLevelTier));

  // Sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('aegis_total_xp', totalExp.toString());
      localStorage.setItem('aegis_solved_ids', JSON.stringify(solvedProblemIds));
      localStorage.setItem('aegis_tactical_mastery', JSON.stringify(tacticalMastery));
      localStorage.setItem('aegis_community_posts', JSON.stringify(posts));
    } catch {}
  }, [totalExp, solvedProblemIds, tacticalMastery, posts]);

  // Title Vault Items
  const levelTitleItems = developerLevelTiers.map((tier, index) => {
    const meta = getDeveloperLevelTierMeta(tier.name);
    const unlocked = index <= currentLevelTierIndex;
    return {
      id: `level-${tier.name}`,
      name: tier.name,
      range: tier.range,
      meta,
      unlocked,
      color: meta.color,
      iconType: meta.iconType,
      rarityScore: index,
      kind: 'level' as const,
    };
  });

  const masteryTitleItems = categories.flatMap((cat) => [1, 2, 3, 4, 5].map((tier) => {
    const mastery = tacticalMastery[cat.id] ?? { tier: 0, progress: 0 };
    const unlocked = mastery.tier >= tier;
    const color = getTierTextColor(tier);
    return {
      id: `mastery-${cat.id}-${tier}`,
      categoryName: cat.name,
      name: `${cat.name} T${tier}`,
      icon: cat.icon,
      tier,
      unlocked,
      color,
      currentTier: mastery.tier,
      rarityScore: tier,
      kind: 'mastery' as const,
    };
  }));

  const unlockedTitleItems = [...levelTitleItems, ...masteryTitleItems].filter((item) => item.unlocked);
  const selectedProfileTitle = unlockedTitleItems.find((item) => item.id === selectedTitleId) ?? levelTitleItems[currentLevelTierIndex] ?? levelTitleItems[0];

  // Glitch effect on landing
  useEffect(() => {
    let timer: number;
    const schedule = () => {
      timer = window.setTimeout(() => {
        setIsLandingGlitching(true);
        window.setTimeout(() => {
          setIsLandingGlitching(false);
          schedule();
        }, 1000);
      }, 10000 + Math.random() * 5000);
    };
    schedule();
    return () => clearTimeout(timer);
  }, []);

  // Timer updater for arena_play
  useEffect(() => {
    if (currentView !== 'arena_play') return;
    const timer = setInterval(() => {
      const elapsed = Math.max(0, Math.floor((Date.now() - operationStartedAt) / 1000));
      const m = Math.floor(elapsed / 60).toString().padStart(2, '0');
      const s = (elapsed % 60).toString().padStart(2, '0');
      setOperationElapsedTimeText(`${m}:${s}`);
    }, 1000);
    return () => clearInterval(timer);
  }, [currentView, operationStartedAt]);

  useEffect(() => { logEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [terminalLogs]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [aiMessages]);
  useEffect(() => { setIsHeaderProfileOpen(false); }, [currentView]);

  // Start Playing a Problem
  const startProblemSession = (problem: ProblemItem) => {
    setCurrentProblem(problem);
    setPayloadInput('');
    setFlagInput('');
    setIsSuccess(false);
    setShowHint(false);
    setHintsUsed(0);
    setTerminalLogs([
      { type: 'info', text: `[AEGIS-SANDBOX v3.0] 연결 수립: ${problem.title}` },
      { type: 'info', text: `카테고리: ${problem.category} | 작전 모드: ${problem.role} | 난이도: ${problem.level}` },
      { type: 'warning', text: '입력창에 페이로드 또는 시큐어 패치 코드를 입력하여 터미널을 테스트하세요.' }
    ]);
    setAiMessages([
      { role: 'ai', text: `안녕하세요! "${problem.title}" 실습을 시작합니다. 코드의 신뢰 경계를 분석하고 의문점이 있으면 질문해주세요.` }
    ]);
    setOperationStartedAt(Date.now());
    setOperationElapsedTimeText('00:00');
    setCurrentView('arena_play');
  };

  // Terminal Payload Execution Engine
  const executePayload = () => {
    if (!payloadInput.trim()) return;
    const input = payloadInput.trim();
    setTerminalLogs(prev => [...prev, { type: 'info', text: `operator@target:~$ ${input}` }]);

    setTimeout(() => {
      // Check answer match (exact, lower, or normalized)
      const expected = currentProblem.answer.trim();
      const isMatch = input === expected || 
                      input.toLowerCase() === expected.toLowerCase() ||
                      (input.includes("' or") || input.includes("'--") || input.includes("<script>") || input.includes("htmlspecialchars") || input.includes("PreparedStatement"));

      if (isMatch) {
        setTerminalLogs(prev => [
          ...prev,
          { type: 'success', text: `[SUCCESS] 대상 프로세스 취약점 검증 성공!` },
          { type: 'success', text: `[FLAG GAINED] ${currentProblem.flag}` },
          { type: 'info', text: `👉 획득한 FLAG를 아래 플래그 입력창에 제출하여 XP를 획득하십시오.` }
        ]);
        setFlagInput(currentProblem.flag);
        setIsSuccess(true);
      } else {
        setTerminalLogs(prev => [
          ...prev,
          { type: 'error', text: `[ERROR] 페이로드 실행 결과 실패: 대상 방화벽 또는 파서 조건을 통과하지 못했습니다.` },
          { type: 'warning', text: `💡 힌트: 문제 설명의 작성 양식을 다시 점검해 보세요.` }
        ]);
      }
    }, 300);

    setPayloadInput('');
  };

  // Submit Flag Engine
  const submitFlag = () => {
    if (!flagInput.trim()) {
      alert('FLAG를 입력해주세요.');
      return;
    }

    if (flagInput.trim() === currentProblem.flag) {
      const isAlreadySolved = solvedProblemIds.includes(currentProblem.id);
      const earnedXp = isAlreadySolved ? Math.floor(currentProblem.xp * 0.2) : currentProblem.xp;

      setClearRewardXp(earnedXp);
      setClearTimeText(operationElapsedTimeText);
      setTotalExp(prev => prev + earnedXp);

      if (!isAlreadySolved) {
        setSolvedProblemIds(prev => [...prev, currentProblem.id]);
      }

      // Mastery Progress
      const catId = categories.find(c => c.name.toLowerCase().includes(currentProblem.category.toLowerCase().split(' ')[0]))?.id || 'sql';
      setTacticalMastery(prev => {
        const curr = prev[catId] ?? { tier: 0, progress: 0 };
        if (curr.tier >= 5) return prev;
        let nTier = curr.tier;
        let nProg = curr.progress + 25;
        while (nTier < 5 && nProg >= getTierRequirement(nTier)) {
          nProg -= getTierRequirement(nTier);
          nTier += 1;
        }
        return { ...prev, [catId]: { tier: nTier, progress: nTier >= 5 ? 0 : nProg } };
      });

      setCurrentView('arena_clear');
    } else {
      alert('❌ 유효하지 않은 FLAG입니다. 터미널 출력을 확인하세요.');
    }
  };

  // Send AI Coach Message
  const sendAiMessage = async (textToSend?: string) => {
    const query = textToSend || aiInput;
    if (!query.trim()) return;

    setAiMessages(prev => [...prev, { role: 'user', text: query }]);
    setAiInput('');

    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeTitle: currentProblem.title,
          category: currentProblem.category,
          userMessage: query,
          codeContext: currentProblem.code
        })
      });
      if (res.ok) {
        const data = await res.json();
        setAiMessages(prev => [...prev, { role: 'ai', text: data.reply }]);
        return;
      }
    } catch {}

    // Heuristic fallback
    setTimeout(() => {
      setAiMessages(prev => [
        ...prev,
        { role: 'ai', text: `[AI 코치 조언] "${query}"에 관하여: ${currentProblem.hint} 소스코드의 입출력 경계를 주의 깊게 살펴보세요.` }
      ]);
    }, 400);
  };

  // Send Community Post
  const handleCreatePost = async () => {
    if (!postTitleInput.trim() || !postContentInput.trim()) {
      alert('통신 제목과 내용을 모두 입력해주세요.');
      return;
    }

    const newPost: CommunityPost = {
      id: posts.length + 1,
      title: postTitleInput.trim(),
      content: postContentInput.trim(),
      author: username,
      created_at: '방금 전',
      likes: 0
    };

    setPosts(prev => [newPost, ...prev]);
    setPostTitleInput('');
    setPostContentInput('');

    try {
      await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newPost.title, content: newPost.content, author: username })
      });
    } catch {}
  };

  // Top Nav Bar
  const TopBar = () => (
    <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 40px', backgroundColor: '#030611', borderBottom: '1px solid rgba(0, 242, 254, 0.35)', alignItems: 'center', zIndex: 10 }}>
      <div onClick={() => setCurrentView('landing')} style={{ display: 'flex', alignItems: 'center', fontWeight: '900', fontSize: '20px', cursor: 'pointer', letterSpacing: '1px' }}>
        <span style={{ color: '#fff', marginRight: '4px' }}>AEGIS</span>
        <span className="neon-hack-text">CYBER</span>
        <span style={{ color: '#00f2fe', marginLeft: '4px' }}>ARENA</span>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', fontSize: '13px', fontWeight: 'bold' }}>
        <span onClick={() => setCurrentView('main')} style={{ cursor: 'pointer', color: currentView === 'main' ? '#00f2fe' : '#94a3b8', textShadow: currentView === 'main' ? '0 0 10px #00f2fe' : 'none' }}>HOME</span>
        <span onClick={() => setCurrentView('wargames')} style={{ cursor: 'pointer', color: ['wargames', 'arena_play', 'arena_clear'].includes(currentView) ? '#00f2fe' : '#94a3b8', textShadow: ['wargames', 'arena_play', 'arena_clear'].includes(currentView) ? '0 0 10px #00f2fe' : 'none' }}>WARGAMES</span>
        <span onClick={() => setCurrentView('community')} style={{ cursor: 'pointer', color: currentView === 'community' ? '#00f2fe' : '#94a3b8', textShadow: currentView === 'community' ? '0 0 10px #00f2fe' : 'none' }}>COMMUNITY</span>
        <span onClick={() => setCurrentView('rankings')} style={{ cursor: 'pointer', color: currentView === 'rankings' ? '#00f2fe' : '#94a3b8', textShadow: currentView === 'rankings' ? '0 0 10px #00f2fe' : 'none' }}>RANKINGS</span>
        <span onClick={() => setCurrentView('profile')} style={{ cursor: 'pointer', color: currentView === 'profile' ? '#00f2fe' : '#94a3b8', textShadow: currentView === 'profile' ? '0 0 10px #00f2fe' : 'none' }}>PROFILE</span>
        <span onClick={() => setCurrentView('titles')} style={{ cursor: 'pointer', color: currentView === 'titles' ? '#00f2fe' : '#94a3b8', textShadow: currentView === 'titles' ? '0 0 10px #00f2fe' : 'none' }}>칭호</span>
        <span onClick={() => setCurrentView('guide')} style={{ cursor: 'pointer', color: currentView === 'guide' ? '#00f2fe' : '#94a3b8', textShadow: currentView === 'guide' ? '0 0 10px #00f2fe' : 'none' }}>📄 공략집</span>
        <span onClick={() => setCurrentView('tutorial_intro')} style={{ cursor: 'pointer', background: 'rgba(16,185,129,0.15)', border: '1px solid #10b981', color: '#10b981', padding: '5px 12px', fontWeight: 'bold' }}>🎓 튜토리얼 ★</span>

        {/* User Profile Pill */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', borderLeft: '1px solid rgba(255,255,255,0.15)', paddingLeft: '18px', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', padding: '4px 8px', fontWeight: '900', ...getLevelTierBadgeStyle(userLevelTier) }}>
            <RankEmblem type={userLevelTierMeta.iconType} color={userLevelTierMeta.color} size={18} isRainbow={userLevelTierMeta.isRainbow} />
            <span>LV.{userLevel} · {userLevelTier}</span>
          </div>

          <button
            type="button"
            className="header-profile-avatar"
            title="프로필 메뉴"
            onClick={(e) => { e.stopPropagation(); setIsHeaderProfileOpen(prev => !prev); }}
          >
            <TitleAvatarBadge title={selectedProfileTitle} size={34} frame="circle" showTierChip={false} />
          </button>

          {isHeaderProfileOpen && (
            <div className="header-profile-dropdown">
              <div style={{ padding: '8px 10px 10px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '6px' }}>
                <div style={{ fontSize: '11px', color: '#64748b' }}>장착된 칭호</div>
                <div style={{ marginTop: '4px', fontSize: '13px', color: selectedProfileTitle.color, fontWeight: 'bold' }}>
                  {selectedProfileTitle.kind === 'mastery' ? `${selectedProfileTitle.categoryName} T${selectedProfileTitle.tier}` : selectedProfileTitle.name}
                </div>
              </div>
              <div className="header-profile-dropdown-item" onClick={() => setCurrentView('profile')}>내 프로필 & 레이더</div>
              <div className="header-profile-dropdown-item" onClick={() => setCurrentView('titles')}>칭호 보관소</div>
              <div className="header-profile-dropdown-item" onClick={() => setCurrentView('login')}>로그인 / 변경</div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );

  return (
    <div className="cyber-bg-grid">
      <TopBar />

      <div className="app-viewport-lock">
        <div key={currentView} className={`view-transition ${currentView === 'landing' ? 'landing-glitch-view' : ''}`} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

          {/* ==========================================
              VIEW: LANDING
             ========================================== */}
          {currentView === 'landing' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '14px', color: '#00f2fe', letterSpacing: '4px', fontWeight: 'bold', marginBottom: '12px' }}>NEXT-GEN WARGAME SIMULATION</div>
              <h1 className={`neon-forge-logo landing-title-glitch ${isLandingGlitching ? 'is-glitching' : ''}`} style={{ marginBottom: '30px' }}>
                AEGIS<span className="neon-hack-text">CYBER</span>ARENA
              </h1>
              
              <div className="tutorial-banner" onClick={() => setCurrentView('tutorial_intro')} style={{ width: '540px', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px' }}>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center', textAlign: 'left' }}>
                  <span style={{ fontSize: '28px' }}>🎓</span>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#10b981' }}>처음이신가요? 입문 튜토리얼부터 시작하세요!</div>
                    <div style={{ fontSize: '12px', color: '#a7f3d0', marginTop: '2px' }}>SQL Injection & XSS 기본 공격과 방어 메커니즘 실습</div>
                  </div>
                </div>
                <button style={{ background: '#10b981', color: '#000', border: 'none', padding: '8px 16px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}>시작 →</button>
              </div>

              <div style={{ display: 'flex', gap: '20px' }}>
                <button onClick={() => setCurrentView('wargames')} className="cyber-btn-cyan" style={{ padding: '14px 40px', fontSize: '15px' }}>⚡ 작전 섹터 진입</button>
                <button onClick={() => setCurrentView('main')} className="cyber-btn-purple" style={{ padding: '14px 40px', fontSize: '15px' }}>📊 대시보드</button>
              </div>
            </div>
          )}

          {/* ==========================================
              VIEW: TUTORIAL INTRO
             ========================================== */}
          {currentView === 'tutorial_intro' && (
            <div style={{ width: '85%', maxWidth: '900px', margin: '40px auto', display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div className="cyber-card-main" style={{ padding: '40px', borderLeft: '4px solid #10b981' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                  <span style={{ fontSize: '32px' }}>🎓</span>
                  <h2 style={{ margin: 0, fontSize: '24px', color: '#10b981', fontWeight: '900' }}>AEGIS-CYBER WARGAME 시작 가이드</h2>
                </div>
                <p style={{ fontSize: '14px', color: '#cbd5e1', lineHeight: '1.8', marginBottom: '25px' }}>
                  본 시스템은 단답형 객관식 퀴즈가 아닙니다. <strong>실제 백엔드 서버로 전송될 조작된 HTTP 페이로드</strong>나 <strong>취약점을 근본 차단하는 시큐어 코딩 한 줄</strong>을 직접 작성해야 FLAG를 획득할 수 있습니다.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                  <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', padding: '20px' }}>
                    <h4 style={{ color: '#ef4444', margin: '0 0 10px 0' }}><i className="fa-solid fa-skull"></i> HACKING (Offensive)</h4>
                    <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.6', margin: 0 }}>취약한 백엔드 코드를 분석하고 공격 페이로드를 주입하여 데이터베이스와 세션을 탈취합니다.</p>
                  </div>
                  <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', padding: '20px' }}>
                    <h4 style={{ color: '#10b981', margin: '0 0 10px 0' }}><i className="fa-solid fa-shield-halved"></i> SECURITY (Defensive)</h4>
                    <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.6', margin: 0 }}>취약한 코드를 진단하고 PreparedStatement, 이스케이프 함수 등 안전한 방어 코드를 작성합니다.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '15px' }}>
                  <button onClick={() => startProblemSession(masterProblemDB[0])} className="cyber-btn-cyan" style={{ border: '1px solid #10b981', color: '#10b981', padding: '12px 30px' }}>
                    첫 번째 튜토리얼 문제 시작 →
                  </button>
                  <button onClick={() => setCurrentView('wargames')} style={{ background: 'transparent', border: '1px solid #475569', color: '#94a3b8', padding: '12px 20px', cursor: 'pointer' }}>
                    전체 섹터 목록 보기
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              VIEW: MAIN DASHBOARD
             ========================================== */}
          {currentView === 'main' && (
            <div style={{ width: '90%', maxWidth: '1400px', margin: '30px auto', display: 'flex', flexDirection: 'column', gap: '30px', flex: 1 }}>
              {/* Profile Overview Card */}
              <div onClick={() => setCurrentView('profile')} className="cyber-card-main" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', padding: '30px', gap: '30px', cursor: 'pointer' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                    <h2 style={{ margin: 0, fontSize: '32px', color: '#fff', fontWeight: 900 }}>{username}</h2>
                    <span style={{ fontSize: '13px', padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 900, ...getLevelTierBadgeStyle(userLevelTier) }}>
                      <RankEmblem type={userLevelTierMeta.iconType} color={userLevelTierMeta.color} size={18} isRainbow={userLevelTierMeta.isRainbow} />
                      {userLevelTier}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold' }}>ACTIVE TITLE:</span>
                    <span style={{ color: selectedProfileTitle.color, fontWeight: 'bold', fontSize: '13px' }}>
                      {selectedProfileTitle.kind === 'mastery' ? `${selectedProfileTitle.categoryName} T${selectedProfileTitle.tier}` : selectedProfileTitle.name}
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>💡 프로필을 클릭하면 8축 전술 레이더 차트와 상세 역량 정보를 확인할 수 있습니다.</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 'bold' }}>
                    <span style={{ color: '#facc15' }}>LEVEL {userLevel} XP</span>
                    <span style={{ color: '#f8fafc' }}>{formatExp(currentExp)} / {formatExp(requiredExp)} XP ({levelExpPercent.toFixed(1)}%)</span>
                  </div>
                  <div style={{ width: '100%', height: '12px', backgroundColor: '#010307', border: '1px solid rgba(250, 204, 21, 0.35)' }}>
                    <div style={{ width: `${levelExpPercent}%`, height: '100%', background: 'linear-gradient(90deg, #f59e0b, #facc15)', transition: 'width 0.4s ease' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '4px' }}>
                    <div style={{ padding: '10px', background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.2)' }}>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>해결한 FLAG</div>
                      <div style={{ fontSize: '20px', color: '#4ade80', fontWeight: 'bold', marginTop: '2px' }}>{solvedProblemIds.length}개</div>
                    </div>
                    <div style={{ padding: '10px', background: 'rgba(0,242,254,0.06)', border: '1px solid rgba(0,242,254,0.2)' }}>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>누적 총 EXP</div>
                      <div style={{ fontSize: '20px', color: '#00f2fe', fontWeight: 'bold', marginTop: '2px' }}>{formatExp(totalExp)}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Blocks Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                <div onClick={() => setCurrentView('wargames')} className="cyber-action-block" style={{ padding: '24px', cursor: 'pointer', textAlign: 'center' }}>
                  <Play size={36} color="#00f2fe" style={{ margin: '0 auto 12px' }} />
                  <h3 style={{ margin: 0, color: '#00f2fe', fontSize: '17px', fontWeight: 'bold' }}>PROJECT WARGAMES</h3>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: '8px 0 0' }}>8대 취약점 공격/방어 훈련장</p>
                </div>
                <div onClick={() => setCurrentView('community')} className="cyber-action-block" style={{ padding: '24px', cursor: 'pointer', textAlign: 'center' }}>
                  <MessageSquare size={36} color="#4ade80" style={{ margin: '0 auto 12px' }} />
                  <h3 style={{ margin: 0, color: '#4ade80', fontSize: '17px', fontWeight: 'bold' }}>ENCRYPTED CHANNEL</h3>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: '8px 0 0' }}>실시간 보안 통신망 커뮤니티</p>
                </div>
                <div onClick={() => setCurrentView('guide')} className="cyber-action-block" style={{ padding: '24px', cursor: 'pointer', textAlign: 'center' }}>
                  <Bookmark size={36} color="#a855f7" style={{ margin: '0 auto 12px' }} />
                  <h3 style={{ margin: 0, color: '#a855f7', fontSize: '17px', fontWeight: 'bold' }}>STRATEGY MANUAL</h3>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: '8px 0 0' }}>8대 분야 정밀 마스터 공략집</p>
                </div>
                <div onClick={() => setCurrentView('titles')} className="cyber-action-block" style={{ padding: '24px', cursor: 'pointer', textAlign: 'center' }}>
                  <Award size={36} color="#facc15" style={{ margin: '0 auto 12px' }} />
                  <h3 style={{ margin: 0, color: '#facc15', fontSize: '17px', fontWeight: 'bold' }}>TITLE VAULT</h3>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: '8px 0 0' }}>레벨 및 전술 마스터리 칭호</p>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              VIEW: WARGAMES SECTORS (1 + 2 + 3 통합 모드)
             ========================================== */}
          {currentView === 'wargames' && (
            <div style={{ width: '90%', maxWidth: '1400px', margin: '30px auto', display: 'flex', flexDirection: 'column', gap: '25px', flex: 1 }}>
              <div>
                <div style={{ fontSize: '12px', color: '#00f2fe', fontWeight: 'bold' }}>WARGAME SECTOR SELECTOR</div>
                <h2 className="neon-forge-cyan" style={{ margin: '4px 0 0 0', fontSize: '26px', fontWeight: '900' }}>🎯 침투 대상 시스템 및 작전 모드</h2>
              </div>

              {/* Dual Mode Switcher */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div 
                  onClick={() => setSelectedRole('Hacking')}
                  className="cyber-card-main"
                  style={{
                    padding: '20px',
                    cursor: 'pointer',
                    borderColor: selectedRole === 'Hacking' ? '#ef4444' : 'rgba(239,68,68,0.3)',
                    background: selectedRole === 'Hacking' ? 'rgba(239,68,68,0.15)' : '#050914',
                    boxShadow: selectedRole === 'Hacking' ? '0 0 20px rgba(239,68,68,0.35)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px'
                  }}
                >
                  <span style={{ fontSize: '32px', color: '#ef4444' }}>💀</span>
                  <div>
                    <h3 style={{ margin: 0, color: '#ef4444', fontSize: '16px' }}>HACKING (Offensive) 모드</h3>
                    <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#cbd5e1' }}>취약한 백엔드 코드를 분석하고 공격 페이로드를 조합해 침투합니다.</p>
                  </div>
                </div>

                <div 
                  onClick={() => setSelectedRole('Security')}
                  className="cyber-card-main"
                  style={{
                    padding: '20px',
                    cursor: 'pointer',
                    borderColor: selectedRole === 'Security' ? '#10b981' : 'rgba(16,185,129,0.3)',
                    background: selectedRole === 'Security' ? 'rgba(16,185,129,0.15)' : '#050914',
                    boxShadow: selectedRole === 'Security' ? '0 0 20px rgba(16,185,129,0.35)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px'
                  }}
                >
                  <span style={{ fontSize: '32px', color: '#10b981' }}>🛡️</span>
                  <div>
                    <h3 style={{ margin: 0, color: '#10b981', fontSize: '16px' }}>SECURITY (Defensive) 모드</h3>
                    <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#cbd5e1' }}>코드 오딧을 수행하고 해킹을 원천 차단하는 안전한 코드를 작성합니다.</p>
                  </div>
                </div>
              </div>

              {/* Category Pills & Problem List */}
              <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '25px' }}>
                {/* Left Category List */}
                <div className="cyber-card-main" style={{ padding: '15px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold', padding: '6px 10px' }}>CATEGORIES (8 SECTORS)</div>
                  {categories.map((cat) => (
                    <div
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.name)}
                      style={{
                        padding: '12px 14px',
                        cursor: 'pointer',
                        background: selectedCategory === cat.name ? 'rgba(0, 242, 254, 0.15)' : '#02050c',
                        border: selectedCategory === cat.name ? '1px solid #00f2fe' : '1px solid rgba(255,255,255,0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}
                    >
                      <span>{cat.icon}</span>
                      <span style={{ fontSize: '13px', fontWeight: 'bold', color: selectedCategory === cat.name ? '#00f2fe' : '#94a3b8' }}>{cat.name}</span>
                    </div>
                  ))}
                </div>

                {/* Right Problem Cards Grid */}
                <div>
                  <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, color: '#fff', fontSize: '18px' }}>
                      {selectedCategory} · <span style={{ color: selectedRole === 'Hacking' ? '#ef4444' : '#10b981' }}>{selectedRole} 작전 목록</span>
                    </h3>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px' }}>
                    {masterProblemDB
                      .filter(p => p.category === selectedCategory && (p.role === selectedRole || !p.role))
                      .map((prob) => {
                        const isSolved = solvedProblemIds.includes(prob.id);
                        return (
                          <div
                            key={prob.id}
                            onClick={() => startProblemSession(prob)}
                            className="cyber-card-main"
                            style={{
                              padding: '20px',
                              cursor: 'pointer',
                              borderColor: isSolved ? '#10b981' : 'rgba(0, 242, 254, 0.25)',
                              position: 'relative'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                              <span style={{ fontSize: '11px', color: '#facc15', border: '1px solid #facc15', padding: '2px 6px' }}>+{prob.xp} XP</span>
                              <span style={{ fontSize: '11px', color: isSolved ? '#10b981' : '#94a3b8', fontWeight: 'bold' }}>
                                {isSolved ? '✓ SOLVED' : prob.level}
                              </span>
                            </div>
                            <h4 style={{ margin: '0 0 8px 0', color: '#fff', fontSize: '15px' }}>{prob.title}</h4>
                            <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8', lineHeight: '1.5', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                              {prob.desc.replace(/<[^>]*>?/gm, '')}
                            </p>
                          </div>
                        );
                      })}
                  </div>

                  {masterProblemDB.filter(p => p.category === selectedCategory && (p.role === selectedRole || !p.role)).length === 0 && (
                    <div className="cyber-card-main" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                      선택한 모드의 문제가 준비 중입니다. 다른 카테고리나 모드를 선택해 주세요.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              VIEW: ARENA PLAY (3분할 인터랙티브 샌드박스)
             ========================================== */}
          {currentView === 'arena_play' && (
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#020711' }}>
              {/* Header Bar */}
              <div style={{ height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', borderBottom: '1px solid rgba(0,242,254,0.25)', background: '#07111f' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                  <button onClick={() => setCurrentView('wargames')} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>← 목록으로</button>
                  <span style={{ color: '#00f2fe' }}>🎯 {currentProblem.title}</span>
                  <span style={{ color: currentProblem.role === 'Hacking' ? '#ef4444' : '#10b981', border: `1px solid ${currentProblem.role === 'Hacking' ? '#ef4444' : '#10b981'}`, padding: '2px 8px', fontSize: '11px' }}>
                    {currentProblem.role}
                  </span>
                  {currentProblem.cwe && (
                    <span style={{ color: '#ec4899', border: '1px solid #ec4899', padding: '2px 8px', fontSize: '11px' }}>{currentProblem.cwe}</span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '12px', fontWeight: 'bold' }}>
                  <span style={{ color: '#00f2fe', border: '1px solid rgba(0,242,254,0.3)', padding: '3px 8px' }}>⏱ {operationElapsedTimeText}</span>
                  <span style={{ color: '#facc15' }}>보상 +{currentProblem.xp} XP</span>
                  <button onClick={() => setShowHint(prev => !prev)} style={{ background: 'rgba(250,204,21,0.1)', border: '1px solid #facc15', color: '#facc15', padding: '4px 10px', cursor: 'pointer' }}>
                    💡 힌트 보기
                  </button>
                  <button onClick={() => setCurrentView('wargames')} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #475569', color: '#cbd5e1', padding: '4px 10px', cursor: 'pointer' }}>나가기</button>
                </div>
              </div>

              {/* 3-Column Layout */}
              <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: '32% 42% 26%' }}>
                {/* Column 1: Briefing & Code */}
                <div style={{ minHeight: 0, borderRight: '1px solid rgba(0,242,254,0.2)', background: '#030913', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', height: '40px', borderBottom: '1px solid rgba(0,242,254,0.2)' }}>
                    <button onClick={() => setSandboxTab('scenario')} style={{ background: sandboxTab === 'scenario' ? 'rgba(0,242,254,0.1)' : 'transparent', border: 'none', color: sandboxTab === 'scenario' ? '#00f2fe' : '#94a3b8', borderBottom: sandboxTab === 'scenario' ? '2px solid #00f2fe' : 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>📋 시나리오</button>
                    <button onClick={() => setSandboxTab('code')} style={{ background: sandboxTab === 'code' ? 'rgba(0,242,254,0.1)' : 'transparent', border: 'none', color: sandboxTab === 'code' ? '#00f2fe' : '#94a3b8', borderBottom: sandboxTab === 'code' ? '2px solid #00f2fe' : 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>⌨ 소스 코드</button>
                    <button onClick={() => setSandboxTab('cwe')} style={{ background: sandboxTab === 'cwe' ? 'rgba(0,242,254,0.1)' : 'transparent', border: 'none', color: sandboxTab === 'cwe' ? '#00f2fe' : '#94a3b8', borderBottom: sandboxTab === 'cwe' ? '2px solid #00f2fe' : 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>📖 보안 이론</button>
                  </div>

                  <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
                    {sandboxTab === 'scenario' && (
                      <div>
                        <h4 style={{ color: '#00f2fe', margin: '0 0 12px 0' }}>작전 브리핑</h4>
                        <div style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.8' }} dangerouslySetInnerHTML={{ __html: currentProblem.desc }} />
                        {showHint && (
                          <div style={{ marginTop: '20px', padding: '14px', background: 'rgba(250,204,21,0.1)', border: '1px solid #facc15', color: '#facc15', fontSize: '12px' }}>
                            💡 <b>힌트:</b> {currentProblem.hint}
                          </div>
                        )}
                      </div>
                    )}

                    {sandboxTab === 'code' && (
                      <div>
                        <div style={{ fontSize: '11px', color: '#00f2fe', letterSpacing: '1px', fontWeight: 'bold', marginBottom: '10px' }}>
                          // VULNERABLE CODE — {currentProblem.language.toUpperCase()}
                        </div>
                        <pre style={{ margin: 0, padding: '16px', background: '#010407', border: '1px solid rgba(0,242,254,0.2)', color: '#e2e8f0', fontFamily: 'Consolas, monospace', fontSize: '13px', lineHeight: '1.6', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
                          <code>{currentProblem.code}</code>
                        </pre>
                        <div style={{ marginTop: '12px', padding: '10px', border: '1px solid rgba(244,63,94,0.3)', background: 'rgba(244,63,94,0.08)', color: '#f43f5e', fontSize: '11px', fontWeight: 'bold' }}>
                          ⚠ 이 코드에는 실제 시스템에 적용 가능한 취약점 및 보안 패턴이 포함되어 있습니다.
                        </div>
                      </div>
                    )}

                    {sandboxTab === 'cwe' && (
                      <div>
                        <h4 style={{ color: '#a855f7', margin: '0 0 12px 0' }}>{currentProblem.cwe || 'CWE 보안 취약성 정의'}</h4>
                        <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.7' }}>
                          이 취약점은 외부에서 유입되는 입력 데이터의 문법적 무력화 또는 적절한 인코딩 부재로 인해 발생합니다. 시큐어 코딩 지침에 따라 파라미터화 및 엄격한 데이터 바인딩을 적용해야 합니다.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Column 2: Terminal & Flag */}
                <div style={{ minHeight: 0, background: '#000', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ height: '34px', display: 'flex', alignItems: 'center', gap: '8px', padding: '0 14px', borderBottom: '1px solid rgba(255,255,255,0.08)', background: '#050505' }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ffbd2e' }} />
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }} />
                    <span style={{ marginLeft: '8px', color: '#64748b', fontFamily: 'monospace', fontSize: '12px' }}>operator@aegis-sandbox:~#</span>
                  </div>

                  <div style={{ flex: 1, minHeight: 0, padding: '16px', overflowY: 'auto', fontFamily: 'Consolas, monospace', fontSize: '13px', lineHeight: '1.65' }}>
                    <div style={{ color: '#38bdf8' }}>[AEGIS-SANDBOX] 가상 샌드박스 인스턴스 준비 완료.</div>
                    <div style={{ color: '#94a3b8' }}>타겟: [{currentProblem.title}] | 카테고리: {currentProblem.category}</div>
                    <div style={{ color: '#e2e8f0', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '8px', marginBottom: '12px' }}>
                      터미널에 페이로드를 실행하여 시스템 응답을 확인하세요.
                    </div>

                    {terminalLogs.map((log, idx) => (
                      <div key={idx} style={{ color: log.type === 'error' ? '#f43f5e' : log.type === 'success' ? '#10b981' : log.type === 'warning' ? '#facc15' : '#4ade80', marginBottom: '6px' }}>
                        {log.text}
                      </div>
                    ))}
                    <div ref={logEndRef} />
                  </div>

                  {/* Terminal Input Line */}
                  <div style={{ borderTop: '1px solid rgba(0,242,254,0.2)', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px', background: '#010407' }}>
                    <span style={{ color: '#10b981', fontFamily: 'monospace', fontWeight: 'bold' }}>$</span>
                    <input
                      type="text"
                      value={payloadInput}
                      onChange={(e) => setPayloadInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') executePayload(); }}
                      placeholder="페이로드 또는 패치 코드를 입력하세요..."
                      style={{ flex: 1, background: 'transparent', border: 'none', color: '#e2e8f0', outline: 'none', fontFamily: 'Consolas, monospace', fontSize: '13px' }}
                    />
                    <button onClick={executePayload} style={{ background: 'rgba(0,242,254,0.1)', border: '1px solid #00f2fe', color: '#00f2fe', padding: '6px 14px', cursor: 'pointer', fontWeight: 'bold' }}>
                      RUN
                    </button>
                  </div>

                  {/* Flag Submission Row */}
                  <div style={{ padding: '10px 14px', display: 'flex', gap: '10px', background: '#07111f', borderTop: '1px solid rgba(0,242,254,0.2)' }}>
                    <label style={{ color: '#38bdf8', fontSize: '12px', fontWeight: 'bold', alignSelf: 'center' }}>FLAG:</label>
                    <input
                      type="text"
                      value={flagInput}
                      onChange={(e) => setFlagInput(e.target.value)}
                      placeholder="FLAG{...}"
                      style={{ flex: 1, padding: '8px 12px', background: '#020407', border: '1px solid rgba(0,242,254,0.22)', color: '#e2e8f0', outline: 'none', fontFamily: 'Consolas, monospace', fontSize: '13px' }}
                    />
                    <button onClick={submitFlag} className="cyber-btn-cyan" style={{ padding: '8px 20px', fontSize: '13px' }}>
                      SUBMIT
                    </button>
                  </div>
                </div>

                {/* Column 3: AI Security Coach */}
                <div style={{ minHeight: 0, borderLeft: '1px solid rgba(0,242,254,0.2)', background: '#05111f', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ height: '42px', padding: '10px 14px', borderBottom: '1px solid rgba(0,242,254,0.2)', color: '#00f2fe', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>🤖 AI 보안 코치</span>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>실시간 어시스턴트</span>
                  </div>

                  <div style={{ flex: 1, minHeight: 0, padding: '14px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {aiMessages.map((msg, idx) => (
                      <div key={idx} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '92%' }}>
                        <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '2px', textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                          {msg.role === 'user' ? 'YOU' : 'AI COACH'}
                        </div>
                        <div style={{ padding: '10px 12px', fontSize: '12px', lineHeight: '1.6', background: msg.role === 'user' ? 'rgba(0,242,254,0.1)' : 'rgba(15,23,42,0.9)', border: msg.role === 'user' ? '1px solid rgba(0,242,254,0.3)' : '1px solid rgba(148,163,184,0.2)', color: '#cbd5e1' }}>
                          {msg.text}
                        </div>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>

                  {/* AI Quick Prompts & Input */}
                  <div style={{ padding: '10px', borderTop: '1px solid rgba(0,242,254,0.2)' }}>
                    <div style={{ display: 'flex', gap: '4px', marginBottom: '6px', flexWrap: 'wrap' }}>
                      {['힌트 알려줘', '취약점 원리가 뭐야?', '방어 코드 어떻게 짜?'].map(q => (
                        <button key={q} onClick={() => sendAiMessage(q)} style={{ background: 'rgba(0,242,254,0.06)', border: '1px solid rgba(0,242,254,0.2)', color: '#7dd3fc', fontSize: '10px', padding: '4px 6px', cursor: 'pointer' }}>
                          {q}
                        </button>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <input
                        type="text"
                        value={aiInput}
                        onChange={(e) => setAiInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') sendAiMessage(); }}
                        placeholder="AI 코치에게 질문..."
                        style={{ flex: 1, padding: '8px', background: '#020407', border: '1px solid rgba(0,242,254,0.22)', color: '#fff', outline: 'none', fontSize: '12px' }}
                      />
                      <button onClick={() => sendAiMessage()} className="cyber-btn-cyan" style={{ padding: '8px 12px', fontSize: '12px' }}>
                        전송
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              VIEW: ARENA CLEAR (작전 완료 승리 모달)
             ========================================== */}
          {currentView === 'arena_clear' && (
            <div style={{ width: '100%', height: '100%', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="cyber-card-main clear-card-pulse" style={{ width: 'min(800px, 90vw)', padding: '36px', textAlign: 'center', borderColor: '#10b981' }}>
                <div style={{ fontSize: '13px', color: '#10b981', letterSpacing: '3px', fontWeight: 'bold', marginBottom: '8px' }}>OPERATION COMPLETE</div>
                <h1 className="neon-forge-cyan" style={{ margin: 0, fontSize: '38px', fontWeight: 900 }}>MISSION CLEAR</h1>
                <p style={{ margin: '10px 0 25px', color: '#94a3b8' }}>FLAG 검증이 완료되었습니다. 작전 기록과 경험치가 에이전트 프로필에 기록되었습니다.</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', maxWidth: '650px', margin: '0 auto 25px' }}>
                  <div style={{ padding: '16px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}>
                    <div style={{ fontSize: '11px', color: '#86efac' }}>획득한 XP</div>
                    <div style={{ fontSize: '26px', color: '#10b981', fontWeight: 'bold', marginTop: '4px' }}>+{clearRewardXp}</div>
                  </div>
                  <div style={{ padding: '16px', background: 'rgba(0,242,254,0.1)', border: '1px solid rgba(0,242,254,0.3)' }}>
                    <div style={{ fontSize: '11px', color: '#7dd3fc' }}>소요 시간</div>
                    <div style={{ fontSize: '26px', color: '#00f2fe', fontWeight: 'bold', marginTop: '4px' }}>{clearTimeText}</div>
                  </div>
                  <div style={{ padding: '16px', background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)' }}>
                    <div style={{ fontSize: '11px', color: '#fda4af' }}>작전 섹터</div>
                    <div style={{ fontSize: '20px', color: '#f43f5e', fontWeight: 'bold', marginTop: '4px' }}>{currentProblem.category.split(' ')[0]}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                  <button onClick={() => setCurrentView('wargames')} className="cyber-action-block" style={{ padding: '14px 28px', color: '#00f2fe', fontWeight: 'bold', cursor: 'pointer' }}>
                    섹터 목록으로
                  </button>
                  <button onClick={() => startProblemSession(currentProblem)} className="cyber-action-block" style={{ padding: '14px 28px', color: '#10b981', fontWeight: 'bold', cursor: 'pointer' }}>
                    다시하기
                  </button>
                  <button onClick={() => setCurrentView('community')} className="cyber-action-block" style={{ padding: '14px 28px', color: '#facc15', fontWeight: 'bold', cursor: 'pointer' }}>
                    공략 팁 공유하기
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              VIEW: COMMUNITY (Encrypted Channel)
             ========================================== */}
          {currentView === 'community' && (
            <div style={{ width: '90%', maxWidth: '1200px', margin: '30px auto', display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
              <div>
                <div style={{ fontSize: '12px', color: '#10b981', fontWeight: 'bold' }}>ENCRYPTED COMMUNICATION NETWORK</div>
                <h2 className="neon-forge-cyan" style={{ margin: '4px 0 0 0', fontSize: '26px', fontWeight: '900' }}>📡 보안 통신망 (Community Channel)</h2>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#94a3b8' }}>훈련 중 발견한 익스플로잇 기법이나 시큐어 코딩 패치 팁을 오퍼레이터들과 공유하십시오.</p>
              </div>

              {/* Write Post Box */}
              <div className="cyber-card-main" style={{ padding: '24px' }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '15px', color: '#00f2fe' }}>✍️ 암호화 통신문 작성</h3>
                <input
                  type="text"
                  value={postTitleInput}
                  onChange={(e) => setPostTitleInput(e.target.value)}
                  placeholder="통신 제목을 입력하세요 (예: [SQLi] Prepared Statement 적용 팁)"
                  style={{ width: '100%', padding: '12px', background: '#010307', border: '1px solid rgba(0,242,254,0.3)', color: '#fff', outline: 'none', marginBottom: '12px', fontSize: '13px' }}
                />
                <textarea
                  value={postContentInput}
                  onChange={(e) => setPostContentInput(e.target.value)}
                  rows={3}
                  placeholder="공유할 페이로드 분석 내용이나 방어 가이드를 작성하세요..."
                  style={{ width: '100%', padding: '12px', background: '#010307', border: '1px solid rgba(0,242,254,0.3)', color: '#fff', outline: 'none', marginBottom: '12px', fontSize: '13px', resize: 'vertical' }}
                />
                <button onClick={handleCreatePost} className="cyber-btn-cyan" style={{ padding: '10px 24px', fontSize: '13px' }}>
                  <i className="fa-solid fa-paper-plane"></i> 보안 통신망에 전송
                </button>
              </div>

              {/* Post List */}
              <div className="cyber-card-main" style={{ padding: '0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: 'rgba(0,242,254,0.06)', borderBottom: '1px solid rgba(0,242,254,0.3)' }}>
                      <th style={{ padding: '14px 20px', color: '#00f2fe', width: '20%' }}>송신 에이전트</th>
                      <th style={{ padding: '14px 20px', color: '#00f2fe' }}>통신 내용 및 요약</th>
                      <th style={{ padding: '14px 20px', color: '#00f2fe', width: '15%' }}>작성 시간</th>
                    </tr>
                  </thead>
                  <tbody>
                    {posts.map((post) => (
                      <tr key={post.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '16px 20px', fontWeight: 'bold', color: '#cbd5e1' }}>
                          <span style={{ color: '#00f2fe' }}>⚡</span> {post.author}
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ fontWeight: 'bold', color: '#fff', marginBottom: '4px' }}>{post.title}</div>
                          <div style={{ color: '#94a3b8', fontSize: '12px', lineHeight: '1.5' }}>{post.content}</div>
                        </td>
                        <td style={{ padding: '16px 20px', color: '#64748b', fontSize: '12px' }}>{post.created_at}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==========================================
              VIEW: PROFILE & TACTICAL RADAR
             ========================================== */}
          {currentView === 'profile' && (
            <div style={{ width: '90%', maxWidth: '1200px', margin: '30px auto', display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
              <div>
                <div style={{ fontSize: '12px', color: '#00f2fe', fontWeight: 'bold' }}>AGENT DOSSIER</div>
                <h2 className="neon-forge-cyan" style={{ margin: '4px 0 0 0', fontSize: '26px', fontWeight: '900' }}>🎖️ 화이트햇 에이전트 상세 프로필</h2>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.8fr', gap: '25px', alignItems: 'start' }}>
                {/* Identity & Radar Card */}
                <div className="cyber-card-main" style={{ padding: '25px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                    <TitleAvatarBadge title={selectedProfileTitle} size={110} frame="circle" />
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>장착된 칭호</div>
                  <div style={{ color: selectedProfileTitle.color, fontWeight: 'bold', fontSize: '14px', marginBottom: '8px' }}>
                    {selectedProfileTitle.kind === 'mastery' ? `${selectedProfileTitle.categoryName} T${selectedProfileTitle.tier}` : selectedProfileTitle.name}
                  </div>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '22px', color: '#fff' }}>{username}</h3>
                  
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: 'bold', ...getLevelTierBadgeStyle(userLevelTier) }}>
                    <RankEmblem type={userLevelTierMeta.iconType} color={userLevelTierMeta.color} size={20} isRainbow={userLevelTierMeta.isRainbow} />
                    <span>LEVEL {userLevel} · {userLevelTier}</span>
                  </div>

                  {/* 8-Axis Polygon Radar Chart */}
                  <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold', marginBottom: '10px', textAlign: 'left' }}>
                      8축 전술 역량 레이더 (0T ~ 5T)
                    </div>
                    {(() => {
                      const center = 110;
                      const maxRadius = 75;
                      const angleStep = (Math.PI * 2) / categories.length;
                      const points = categories.map((cat, i) => {
                        const m = tacticalMastery[cat.id] ?? { tier: 0, progress: 0 };
                        const r = (Math.max(0, Math.min(5, m.tier)) / 5) * maxRadius;
                        const angle = -Math.PI / 2 + i * angleStep;
                        return { x: center + Math.cos(angle) * r, y: center + Math.sin(angle) * r, cat };
                      });
                      const poly = points.map(p => `${p.x},${p.y}`).join(' ');

                      return (
                        <svg viewBox="0 0 220 220" style={{ width: '100%', maxWidth: '240px', margin: '0 auto', display: 'block' }}>
                          {[1, 2, 3, 4, 5].map(step => {
                            const r = (maxRadius / 5) * step;
                            const ring = categories.map((_, i) => {
                              const angle = -Math.PI / 2 + i * angleStep;
                              return `${center + Math.cos(angle) * r},${center + Math.sin(angle) * r}`;
                            }).join(' ');
                            return <polygon key={step} points={ring} fill="none" stroke="rgba(148,163,184,0.2)" strokeWidth="1" />;
                          })}
                          {categories.map((c, i) => {
                            const angle = -Math.PI / 2 + i * angleStep;
                            const lx = center + Math.cos(angle) * (maxRadius + 18);
                            const ly = center + Math.sin(angle) * (maxRadius + 18);
                            return <text key={c.id} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fontSize="9" fill="#94a3b8" fontWeight="bold">{c.name.split(' ')[0]}</text>;
                          })}
                          <polygon points={poly} fill="rgba(0,242,254,0.18)" stroke="#00f2fe" strokeWidth="2" />
                        </svg>
                      );
                    })()}
                  </div>
                </div>

                {/* Right Mastery Gauges */}
                <div className="cyber-card-main" style={{ padding: '25px' }}>
                  <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', color: '#00f2fe' }}>📊 8대 전술 마스터리 진행도</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {categories.map(cat => {
                      const m = tacticalMastery[cat.id] ?? { tier: 0, progress: 0 };
                      const pct = getMasteryPercent(m);
                      const req = getTierRequirement(m.tier);

                      return (
                        <div key={cat.id}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                            <span style={{ color: '#fff', fontWeight: 'bold' }}>
                              {cat.icon} {cat.name}
                              <span style={{ marginLeft: '8px', color: getTierTextColor(m.tier), border: `1px solid ${getTierTextColor(m.tier)}`, padding: '1px 6px', fontSize: '10px' }}>
                                {m.tier}T
                              </span>
                            </span>
                            <span style={{ color: getTierTextColor(m.tier), fontWeight: 'bold', fontSize: '12px' }}>
                              {pct.toFixed(1)}% ({m.tier >= 5 ? 'MAX' : `${m.progress} / ${req}`})
                            </span>
                          </div>
                          <div style={{ width: '100%', height: '8px', background: '#010307', border: '1px solid rgba(0,242,254,0.2)', overflow: 'hidden' }}>
                            <div className={m.tier >= 5 ? 'rainbow-mastery-bar' : ''} style={{ width: `${pct}%`, height: '100%', ...getTierGaugeStyle(m.tier), transition: 'width 0.4s' }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              VIEW: TITLE VAULT (칭호 보관소)
             ========================================== */}
          {currentView === 'titles' && (
            <div style={{ width: '90%', maxWidth: '1300px', margin: '30px auto', display: 'flex', flexDirection: 'column', gap: '25px', flex: 1, paddingBottom: '40px' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#facc15', fontWeight: 'bold' }}>TITLE VAULT</div>
                <h2 className="neon-forge-cyan" style={{ margin: '4px 0 0 0', fontSize: '26px', fontWeight: '900' }}>🏅 칭호 보관소</h2>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#94a3b8' }}>레벨 업 및 전술 마스터리 달성을 통해 획득한 칭호를 선택하여 프로필에 장착할 수 있습니다.</p>
              </div>

              {/* Level Titles */}
              <div className="cyber-card-main" style={{ padding: '24px' }}>
                <h3 style={{ margin: '0 0 16px 0', color: '#facc15', fontSize: '17px' }}>🎖️ 개발자 레벨 랭크 칭호 (Lv.1 ~ Lv.100)</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px' }}>
                  {levelTitleItems.map(item => {
                    const isSelected = selectedTitleId === item.id;
                    return (
                      <div
                        key={item.id}
                        onClick={() => item.unlocked && setSelectedTitleId(item.id)}
                        style={{
                          padding: '16px',
                          background: item.unlocked ? `${item.color}15` : 'rgba(15,23,42,0.5)',
                          border: `1px solid ${item.unlocked ? item.color : 'rgba(255,255,255,0.1)'}`,
                          boxShadow: isSelected ? `0 0 20px ${item.color}` : 'none',
                          cursor: item.unlocked ? 'pointer' : 'not-allowed',
                          opacity: item.unlocked ? 1 : 0.45
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <RankEmblem type={item.iconType} color={item.meta.color} size={32} isRainbow={item.meta.isRainbow} />
                          <span style={{ fontSize: '11px', color: item.meta.color, fontWeight: 'bold' }}>{item.range}</span>
                        </div>
                        <div style={{ color: item.unlocked ? '#fff' : '#64748b', fontWeight: 'bold', fontSize: '14px' }}>{item.name}</div>
                        <div style={{ fontSize: '11px', color: item.unlocked ? (isSelected ? '#00f2fe' : '#94a3b8') : '#64748b', marginTop: '4px' }}>
                          {item.unlocked ? (isSelected ? '● 장착 중' : '장착 가능') : '잠김'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tactical Mastery Titles */}
              <div className="cyber-card-main" style={{ padding: '24px' }}>
                <h3 style={{ margin: '0 0 16px 0', color: '#00f2fe', fontSize: '17px' }}>⚔️ 8대 전술 마스터리 티어 칭호 (T1 ~ T5)</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '14px' }}>
                  {masteryTitleItems.map(item => {
                    const isSelected = selectedTitleId === item.id;
                    return (
                      <div
                        key={item.id}
                        onClick={() => item.unlocked && setSelectedTitleId(item.id)}
                        style={{
                          padding: '16px',
                          background: item.unlocked ? `${item.color}15` : 'rgba(15,23,42,0.5)',
                          border: `1px solid ${item.unlocked ? item.color : 'rgba(255,255,255,0.1)'}`,
                          boxShadow: isSelected ? `0 0 20px ${item.color}` : 'none',
                          cursor: item.unlocked ? 'pointer' : 'not-allowed',
                          opacity: item.unlocked ? 1 : 0.45
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '24px' }}>{item.icon}</span>
                          <span style={{ fontSize: '11px', color: item.color, border: `1px solid ${item.color}`, padding: '2px 6px', fontWeight: 'bold' }}>T{item.tier}</span>
                        </div>
                        <div style={{ color: item.unlocked ? '#fff' : '#64748b', fontWeight: 'bold', fontSize: '14px' }}>{item.categoryName}</div>
                        <div style={{ fontSize: '11px', color: item.unlocked ? (isSelected ? '#00f2fe' : '#94a3b8') : '#64748b', marginTop: '4px' }}>
                          {item.unlocked ? (isSelected ? '● 장착 중' : '장착 가능') : `T${item.tier} 필요`}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              VIEW: STRATEGY MANUAL (공략집)
             ========================================== */}
          {currentView === 'guide' && (
            <div style={{ width: '90%', maxWidth: '1300px', margin: '30px auto', display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
              <div>
                <div style={{ fontSize: '12px', color: '#a855f7', fontWeight: 'bold' }}>TACTICAL PLAYBOOK</div>
                <h2 className="neon-forge-cyan" style={{ margin: '4px 0 0 0', fontSize: '26px', fontWeight: '900' }}>📚 8대 카테고리 마스터 공략집</h2>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '25px', alignItems: 'start' }}>
                {/* Left: Guide Content */}
                <div className="cyber-card-main" style={{ padding: '30px', borderLeft: '4px solid #00f2fe' }}>
                  <h3 style={{ margin: '0 0 20px 0', fontSize: '22px', color: '#fff' }}>
                    {comprehensiveStrategies[activeGuideTab]?.title}
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '30px' }}>
                    {comprehensiveStrategies[activeGuideTab]?.steps.map((s, i) => (
                      <div key={i} style={{ background: '#020610', padding: '16px', borderLeft: '3px solid #a855f7' }}>
                        <p style={{ margin: 0, fontSize: '13px', color: '#cbd5e1', lineHeight: '1.8' }}>{s}</p>
                      </div>
                    ))}
                  </div>

                  <div>
                    <h4 style={{ color: '#00f2fe', margin: '0 0 10px 0', fontSize: '14px' }}>💻 대표 공격/방어 페이로드 구조</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {comprehensiveStrategies[activeGuideTab]?.codeExamples.map((code, idx) => (
                        <div key={idx} style={{ background: '#000', padding: '12px', fontFamily: 'monospace', fontSize: '13px', color: '#f43f5e', border: '1px solid rgba(244, 63, 94, 0.25)' }}>
                          {code}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Guide Selector */}
                <div className="cyber-card-main" style={{ padding: '15px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold', padding: '4px 8px' }}>SELECT SECTOR</div>
                  {categories.map(cat => (
                    <div
                      key={cat.id}
                      onClick={() => setActiveGuideTab(cat.id)}
                      style={{
                        padding: '12px',
                        cursor: 'pointer',
                        background: activeGuideTab === cat.id ? 'rgba(168,85,247,0.15)' : '#02050c',
                        border: activeGuideTab === cat.id ? '1px solid #a855f7' : '1px solid rgba(255,255,255,0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span>{cat.icon}</span>
                        <span style={{ fontSize: '13px', fontWeight: 'bold', color: activeGuideTab === cat.id ? '#fff' : '#94a3b8' }}>{cat.name}</span>
                      </div>
                      <ArrowRight size={14} color={activeGuideTab === cat.id ? '#a855f7' : '#475569'} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              VIEW: GLOBAL RANKINGS
             ========================================== */}
          {currentView === 'rankings' && (
            <div style={{ width: '85%', maxWidth: '950px', margin: '30px auto', display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
              <div>
                <div style={{ fontSize: '12px', color: '#facc15', fontWeight: 'bold' }}>GLOBAL LEADERBOARD</div>
                <h2 className="neon-forge-cyan" style={{ margin: '4px 0 0 0', fontSize: '26px', fontWeight: '900' }}>🏆 화이트해커 전역 실시간 랭킹</h2>
              </div>

              <div className="cyber-card-main" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: 'rgba(0,242,254,0.06)', borderBottom: '1px solid rgba(0,242,254,0.3)' }}>
                      <th style={{ padding: '14px 20px', color: '#00f2fe', width: '15%' }}>순위</th>
                      <th style={{ padding: '14px 20px', color: '#00f2fe' }}>에이전트명</th>
                      <th style={{ padding: '14px 20px', color: '#00f2fe', width: '25%' }}>레벨 등급</th>
                      <th style={{ padding: '14px 20px', color: '#00f2fe', width: '20%' }}>누적 EXP</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(250,204,21,0.03)' }}>
                      <td style={{ padding: '16px 20px', fontWeight: 'bold', color: '#facc15' }}>🥇 1위</td>
                      <td style={{ padding: '16px 20px', fontWeight: 'bold', color: '#fff' }}>root_operator</td>
                      <td style={{ padding: '16px 20px' }}><span style={{ color: '#facc15', border: '1px solid #facc15', padding: '2px 8px' }}>LV.99 · 그랜드마스터</span></td>
                      <td style={{ padding: '16px 20px', color: '#facc15', fontWeight: 'bold' }}>1,245.8K</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '16px 20px', fontWeight: 'bold', color: '#cbd5e1' }}>🥈 2위</td>
                      <td style={{ padding: '16px 20px', color: '#fff' }}>null_pointer</td>
                      <td style={{ padding: '16px 20px' }}><span style={{ color: '#ffd700', border: '1px solid #ffd700', padding: '2px 8px' }}>LV.45 · 골드</span></td>
                      <td style={{ padding: '16px 20px', color: '#cbd5e1' }}>42.5K</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '16px 20px', fontWeight: 'bold', color: '#b45309' }}>🥉 3위</td>
                      <td style={{ padding: '16px 20px', color: '#fff' }}>packet_sniffer</td>
                      <td style={{ padding: '16px 20px' }}><span style={{ color: '#c0c0c0', border: '1px solid #c0c0c0', padding: '2px 8px' }}>LV.32 · 실버</span></td>
                      <td style={{ padding: '16px 20px', color: '#b45309' }}>18.2K</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,242,254,0.03)' }}>
                      <td style={{ padding: '16px 20px', color: '#00f2fe', fontWeight: 'bold' }}>✨ MY</td>
                      <td style={{ padding: '16px 20px', fontWeight: 'bold', color: '#00f2fe' }}>{username} (나)</td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ padding: '3px 8px', ...getLevelTierBadgeStyle(userLevelTier) }}>LV.{userLevel} · {userLevelTier}</span>
                      </td>
                      <td style={{ padding: '16px 20px', color: '#00f2fe', fontWeight: 'bold' }}>{formatExp(totalExp)} XP</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==========================================
              VIEW: LOGIN / SIGNUP
             ========================================== */}
          {currentView === 'login' && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '40px' }}>
              <div className="cyber-card-main" style={{ width: '420px', padding: '40px' }}>
                <h2 className="neon-forge-cyan" style={{ fontSize: '22px', margin: '0 0 25px 0', textAlign: 'center', fontWeight: '900' }}>
                  🔒 OPERATOR LOGIN
                </h2>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '11px', color: '#64748b', fontWeight: 'bold', marginBottom: '6px' }}>에이전트 닉네임 (CALLSIGN)</label>
                  <input
                    type="text"
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    placeholder="접속할 닉네임을 입력하세요"
                    style={{ width: '100%', padding: '12px', border: '1px solid rgba(0, 242, 254, 0.3)', backgroundColor: '#010307', color: '#00f2fe', outline: 'none' }}
                  />
                </div>
                <div style={{ marginBottom: '25px' }}>
                  <label style={{ display: 'block', fontSize: '11px', color: '#64748b', fontWeight: 'bold', marginBottom: '6px' }}>비밀번호 (KEYPHRASE)</label>
                  <input
                    type="password"
                    value={loginPw}
                    onChange={(e) => setLoginPw(e.target.value)}
                    placeholder="비밀번호"
                    style={{ width: '100%', padding: '12px', border: '1px solid rgba(0, 242, 254, 0.3)', backgroundColor: '#010307', color: '#00f2fe', outline: 'none' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <button
                    onClick={() => {
                      if (loginId.trim()) setUsername(loginId.trim());
                      setCurrentView('main');
                    }}
                    className="cyber-btn-cyan"
                    style={{ padding: '12px' }}
                  >
                    로그인 세션 활성화
                  </button>
                  <button
                    onClick={() => setCurrentView('main')}
                    style={{ background: 'transparent', border: '1px solid #475569', color: '#94a3b8', padding: '10px', cursor: 'pointer' }}
                  >
                    취소하고 대시보드로
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
