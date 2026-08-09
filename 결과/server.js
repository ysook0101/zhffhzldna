import express from 'express';
import pg from 'pg';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'aegis_cyber_wargame_super_secret_key_2026';

app.use(cors());
app.use(express.json());

// In-memory fallback state when DATABASE_URL is not configured
const inMemoryStore = {
  users: [
    { id: 1, username: 'root_operator', password: '', points: 1245800, level: 99, streak: 42 },
    { id: 2, username: 'null_pointer', password: '', points: 42500, level: 45, streak: 12 },
    { id: 3, username: 'packet_sniffer', password: '', points: 18200, level: 32, streak: 7 },
  ],
  posts: [
    { id: 1, title: '[암호화 통신] SQL Injection 인증 우회 팁 공유', content: "admin'-- 페이로드 뒤에 공백이나 주석 처리를 정확히 해야 MySQL 파서에서 인식됩니다.", author: 'root_operator', created_at: new Date(Date.now() - 3600000).toISOString(), likes: 14 },
    { id: 2, title: '[보안 권고] XSS 방어 시 innerHTML 금지', content: "사용자 입력을 렌더링할 때는 반드시 textContent나 DOMPurify, 또는 프레임워크 자동 이스케이프를 사용해야 안전합니다.", author: 'shield_guardian', created_at: new Date(Date.now() - 7200000).toISOString(), likes: 9 },
    { id: 3, title: '[작전 공유] Prepared Statement 파라미터 바인딩', content: "쿼리 구조와 데이터를 분리하는 것이 SQLi의 완벽한 1차 방어선입니다.", author: 'cyber_auditor', created_at: new Date(Date.now() - 10800000).toISOString(), likes: 21 },
  ],
  solved: []
};

// Initialize PG Pool
let pool = null;
if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  pool.connect((err, client, release) => {
    if (err) {
      console.warn('⚠️ PostgreSQL connection failed. Falling back to in-memory mode:', err.message);
      pool = null;
    } else {
      console.log('⚡ Connected to PostgreSQL Database successfully.');
      release();
    }
  });
} else {
  console.log('ℹ️ DATABASE_URL not set. Running in resilient in-memory mode.');
}

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: '인증 토큰이 필요합니다.' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: '유효하지 않거나 만료된 토큰입니다.' });
    req.user = user;
    next();
  });
};

// --- AUTHENTICATION ENDPOINTS ---

app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: '사용자 이름과 비밀번호를 입력해주세요.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    if (pool) {
      const userCheck = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
      if (userCheck.rows.length > 0) {
        return res.status(400).json({ error: '이미 존재하는 에이전트 이름입니다.' });
      }

      const insertRes = await pool.query(
        'INSERT INTO users (username, password, points, level, streak) VALUES ($1, $2, 0, 1, 1) RETURNING id, username, points, level, streak',
        [username, hashedPassword]
      );
      const user = insertRes.rows[0];
      const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
      return res.status(201).json({ token, user });
    } else {
      if (inMemoryStore.users.some(u => u.username === username)) {
        return res.status(400).json({ error: '이미 존재하는 에이전트 이름입니다.' });
      }
      const newUser = { id: inMemoryStore.users.length + 1, username, password: hashedPassword, points: 0, level: 1, streak: 1 };
      inMemoryStore.users.push(newUser);
      const token = jwt.sign({ id: newUser.id, username: newUser.username }, JWT_SECRET, { expiresIn: '7d' });
      return res.status(201).json({ token, user: { id: newUser.id, username: newUser.username, points: 0, level: 1, streak: 1 } });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: '회원가입 처리 중 오류가 발생했습니다.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: '사용자 이름과 비밀번호를 입력해주세요.' });
  }

  try {
    let user = null;
    if (pool) {
      const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
      if (result.rows.length > 0) user = result.rows[0];
    } else {
      user = inMemoryStore.users.find(u => u.username === username);
    }

    if (!user) {
      // Create guest session seamlessly
      const hashedPassword = await bcrypt.hash(password, 10);
      const guestUser = { id: inMemoryStore.users.length + 1, username, password: hashedPassword, points: 0, level: 1, streak: 1 };
      inMemoryStore.users.push(guestUser);
      const token = jwt.sign({ id: guestUser.id, username: guestUser.username }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({ token, user: { id: guestUser.id, username: guestUser.username, points: 0, level: 1, streak: 1 } });
    }

    if (user.password) {
      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(401).json({ error: '비밀번호가 일치하지 않습니다.' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, username: user.username, points: user.points, level: user.level, streak: user.streak } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: '로그인 처리 중 오류가 발생했습니다.' });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    let user = null;
    if (pool) {
      const result = await pool.query('SELECT id, username, points, level, streak, created_at FROM users WHERE id = $1', [req.user.id]);
      if (result.rows.length > 0) user = result.rows[0];
    } else {
      user = inMemoryStore.users.find(u => u.id === req.user.id);
    }

    if (!user) return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    res.json({ user });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: '프로필 조회 중 오류가 발생했습니다.' });
  }
});

// --- RANKINGS ENDPOINT ---

app.get('/api/rankings', async (req, res) => {
  try {
    if (pool) {
      const result = await pool.query('SELECT id, username, points, level, streak FROM users ORDER BY points DESC LIMIT 50');
      return res.json({ rankings: result.rows });
    } else {
      const sorted = [...inMemoryStore.users].sort((a, b) => b.points - a.points);
      return res.json({ rankings: sorted });
    }
  } catch (error) {
    console.error('Rankings error:', error);
    res.status(500).json({ error: '랭킹 조회 중 오류가 발생했습니다.' });
  }
});

// --- COMMUNITY POSTS ENDPOINTS ---

app.get('/api/posts', async (req, res) => {
  try {
    if (pool) {
      const result = await pool.query('SELECT * FROM posts ORDER BY id DESC LIMIT 50');
      return res.json({ posts: result.rows });
    } else {
      return res.json({ posts: inMemoryStore.posts });
    }
  } catch (error) {
    console.error('Posts fetch error:', error);
    res.status(500).json({ error: '게시글 목록 조회 중 오류가 발생했습니다.' });
  }
});

app.post('/api/posts', async (req, res) => {
  const { title, content, author } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: '통신 제목과 내용을 모두 입력해 주세요.' });
  }

  const postAuthor = author || 'Anonymous Operator';

  try {
    if (pool) {
      const result = await pool.query(
        'INSERT INTO posts (title, content, author, likes) VALUES ($1, $2, $3, 0) RETURNING *',
        [title, content, postAuthor]
      );
      return res.status(201).json({ post: result.rows[0] });
    } else {
      const newPost = {
        id: inMemoryStore.posts.length + 1,
        title,
        content,
        author: postAuthor,
        created_at: new Date().toISOString(),
        likes: 0,
        comments: []
      };
      inMemoryStore.posts.unshift(newPost);
      return res.status(201).json({ post: newPost });
    }
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: '게시글 전송 중 오류가 발생했습니다.' });
  }
});

app.delete('/api/posts/:id', async (req, res) => {
  const postId = parseInt(req.params.id);
  try {
    if (pool) {
      await pool.query('DELETE FROM posts WHERE id = $1', [postId]);
    } else {
      inMemoryStore.posts = inMemoryStore.posts.filter(p => p.id !== postId);
    }
    return res.json({ success: true, message: '게시글이 삭제되었습니다.' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: '게시글 삭제 중 오류가 발생했습니다.' });
  }
});

app.post('/api/posts/:id/comments', async (req, res) => {
  const postId = parseInt(req.params.id);
  const { author, text } = req.body;
  if (!text) return res.status(400).json({ error: '댓글 내용을 입력해주세요.' });

  try {
    const post = inMemoryStore.posts.find(p => p.id === postId);
    if (!post) return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });

    post.comments = post.comments || [];
    const comment = {
      id: Date.now(),
      author: author || 'Anonymous Operator',
      text,
      time: '방금 전'
    };
    post.comments.push(comment);
    return res.status(201).json({ comment, comments: post.comments });
  } catch (error) {
    res.status(500).json({ error: '댓글 등록 중 오류가 발생했습니다.' });
  }
});

// --- AI COACH ENDPOINT ---

app.post('/api/coach', async (req, res) => {
  const { challengeTitle, category, userMessage, codeContext } = req.body;
  
  // 1. Check Gemini API
  if (process.env.GEMINI_API_KEY) {
    try {
      const sysPrompt = `당신은 화이트햇 보안 교육 워게임 시스템의 전문 AI 코치입니다.
현재 카테고리: ${category || 'Web Security'}
문제 제목: ${challengeTitle || 'Wargame Challenge'}
코드 컨텍스트:
${codeContext || ''}

지침: 플래그 정답을 직접 주지 말고, 보안 원리, 단계별 힌트, 시큐어 코딩 모범 패치를 친절히 설명하세요.
질문: ${userMessage || '힌트를 알려주세요.'}`;

      const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: sysPrompt }] }]
        })
      });
      const data = await geminiRes.json();
      if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
        return res.json({ reply: data.candidates[0].content.parts[0].text });
      }
    } catch (e) {
      console.warn('Gemini API call failed:', e.message);
    }
  }

  // 2. Check OpenAI API
  if (process.env.OPENAI_API_KEY) {
    try {
      const fetchRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `당신은 화이트햇 보안 워게임 전문 AI 코치입니다. 카테고리: ${category}, 문제: ${challengeTitle}. 정답을 직접 주지 말고 원리와 힌트, 시큐어 코딩 패치를 설명하세요.`
            },
            { role: 'user', content: userMessage || '힌트를 알려주세요.' }
          ],
          temperature: 0.7,
          max_tokens: 400
        })
      });

      const data = await fetchRes.json();
      if (data.choices && data.choices.length > 0) {
        return res.json({ reply: data.choices[0].message.content });
      }
    } catch (e) {
      console.warn('OpenAI API call failed:', e.message);
    }
  }

  // 3. Smart Heuristic Fallback
  const hints = {
    'SQL Injection': 'SQL Injection의 핵심은 사용자 입력이 데이터가 아닌 "명령어(문법 기호)"로 해석되는 데 있습니다. 작은따옴표(\')로 문자열을 닫고, OR 조건이나 주석 기호(--, #)가 쿼리 구조에 미치는 영향을 추적해 보세요.',
    'XSS 스크립트': 'XSS 공격은 브라우저가 사용자 입력을 단순 텍스트가 아닌 실행 가능한 HTML 태그나 자바스크립트로 인식할 때 발생합니다. <script> 태그나 이벤트 핸들러(onerror, onload) 속성을 확인하세요.',
    'default': '입력값이 검증 없이 서버나 브라우저의 핵심 렌더링/실행 엔진에 전달되는 신뢰 경계를 파악하는 것이 급선무입니다.'
  };

  const advice = hints[category] || hints['default'];
  res.json({ reply: `[AI 코치 분석] ${advice}\n\n질문하신 내용("${userMessage}")에 대해 코드의 파라미터 처리 부분을 다시 한 번 점검해 보세요.` });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Aegis Cyber Arena Master API', time: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`⚡ Aegis Cyber Arena Server running on port ${PORT}`);
});
