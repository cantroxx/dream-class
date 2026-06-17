import { useState, useEffect, useCallback, useRef } from "react";

/* ═══════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════ */
const P = { bg:"#0f172a", card:"#1e293b", accent:"#38bdf8", gold:"#fbbf24", green:"#34d399", pink:"#f472b6", purple:"#a78bfa", orange:"#fb923c", red:"#f87171", text:"#f1f5f9", muted:"#94a3b8", border:"rgba(148,163,184,.15)" };

const STAT_META = {
  academic:  { name:"학업력", icon:"📖", color:"#38bdf8" },
  physical:  { name:"체력",   icon:"💪", color:"#34d399" },
  creativity:{ name:"창의력", icon:"🎨", color:"#f472b6" },
  social:    { name:"사회성", icon:"🤝", color:"#fbbf24" },
  inquiry:   { name:"탐구력", icon:"🔬", color:"#a78bfa" },
  tech:      { name:"기술력", icon:"💻", color:"#fb923c" },
  emotion:   { name:"감성",   icon:"🎵", color:"#f87171" },
  grit:      { name:"끈기",   icon:"🔥", color:"#e879f9" },
};
const SK = Object.keys(STAT_META);
const initStats = ()=>Object.fromEntries(SK.map(k=>[k,10]));

const CLASSES = [
  { id:"c1", name:"국어 심화",  eff:{academic:3,emotion:1} },
  { id:"c2", name:"수학 심화",  eff:{academic:3,inquiry:2} },
  { id:"c3", name:"과학 탐구",  eff:{inquiry:3,tech:1} },
  { id:"c4", name:"사회 탐구",  eff:{academic:2,social:2} },
  { id:"c5", name:"영어 회화",  eff:{academic:2,social:1} },
  { id:"c6", name:"코딩 수업",  eff:{tech:3,inquiry:1}, school:"middle" },
  { id:"c7", name:"체육 강화",  eff:{physical:4,grit:1} },
  { id:"c8", name:"음악/미술",  eff:{emotion:3,creativity:2} },
];

const CLUBS = [
  { id:"cl1",  name:"축구부",     eff:{physical:4,social:2,grit:1} },
  { id:"cl2",  name:"미술부",     eff:{creativity:4,emotion:2} },
  { id:"cl3",  name:"과학반",     eff:{inquiry:4,academic:1} },
  { id:"cl4",  name:"밴드부",     eff:{emotion:4,social:2} },
  { id:"cl5",  name:"로봇공학반", eff:{tech:4,inquiry:2}, school:"middle" },
  { id:"cl6",  name:"독서토론반", eff:{academic:2,social:3} },
  { id:"cl7",  name:"학생회",     eff:{social:4,grit:2} },
  { id:"cl8",  name:"요리반",     eff:{creativity:3,emotion:2} },
  { id:"cl9",  name:"방송반",     eff:{tech:2,social:3,creativity:1} },
  { id:"cl10", name:"댄스부",     eff:{physical:3,emotion:3} },
];

const VACATIONS = [
  { id:"v1", name:"학원 집중",   eff:{academic:5}, stress:3 },
  { id:"v2", name:"스포츠 캠프", eff:{physical:5,grit:2} },
  { id:"v3", name:"해외 체험",   eff:{social:4,creativity:2} },
  { id:"v4", name:"자유 놀이",   eff:{creativity:1}, stress:-5 },
  { id:"v5", name:"직업 체험",   eff:{inquiry:3,social:2} },
  { id:"v6", name:"봉사활동",    eff:{social:3,emotion:2,grit:1} },
  { id:"v7", name:"코딩 캠프",   eff:{tech:5,grit:1}, school:"middle" },
  { id:"v8", name:"예술 워크숍", eff:{creativity:5,emotion:2} },
];

const EVENTS = [
  { id:"e1", school:"elementary", title:"전학생이 왔다!", desc:"새 친구가 전학을 왔어요. 어떻게 할까요?",
    choices:[{text:"먼저 말 걸기",eff:{social:3,emotion:1}},{text:"조용히 지켜보기",eff:{inquiry:2}}] },
  { id:"e2", school:"elementary", title:"과학 발명 대회", desc:"학교에서 과학 대회를 열어요!",
    choices:[{text:"참가한다",eff:{inquiry:4,grit:2},stress:2},{text:"친구 응원",eff:{social:2}}] },
  { id:"e3", school:"elementary", title:"학예회 무대", desc:"학예회에서 역할을 맡게 됐어요.",
    choices:[{text:"주인공 도전!",eff:{emotion:4,grit:2},stress:1},{text:"스태프 참여",eff:{tech:2,social:2}}] },
  { id:"e4", school:"elementary", title:"비 오는 날 길고양이", desc:"등굣길에 젖은 고양이를 발견했어요.",
    choices:[{text:"돌봐주기",eff:{emotion:3,social:1}},{text:"지나치기",eff:{grit:1}}] },
  { id:"e5", school:"elementary", title:"달리기 대회", desc:"체육대회 달리기에 나가게 됐어요!",
    choices:[{text:"열심히 연습",eff:{physical:4,grit:2},stress:1},{text:"즐기면서 뛰기",eff:{physical:2,social:1}}] },
  { id:"e6", school:"elementary", title:"그림 그리기 대회", desc:"미술 시간에 선생님이 대회를 추천해요.",
    choices:[{text:"도전!",eff:{creativity:4,emotion:1},stress:1},{text:"그냥 수업만",eff:{academic:1}}] },
  { id:"e7", school:"elementary", title:"친구와 다툼", desc:"가장 친한 친구와 사소한 일로 다퉜어요.",
    choices:[{text:"먼저 사과하기",eff:{social:3,emotion:2}},{text:"시간을 두고 기다리기",eff:{grit:2}}] },
  { id:"e8", school:"elementary", title:"새로운 취미 발견", desc:"우연히 재미있는 활동을 발견했어요!",
    choices:[{text:"빠져들기",eff:{creativity:3,emotion:2}},{text:"공부에 집중",eff:{academic:2,grit:1}}] },
  { id:"m1", school:"middle", title:"진로 상담의 날", desc:"담임선생님이 장래희망을 물어봐요.",
    choices:[{text:"구체적으로 답하기",eff:{inquiry:3,grit:2}},{text:"아직 모르겠어요",eff:{academic:1,social:1,creativity:1,emotion:1}}] },
  { id:"m2", school:"middle", title:"중간고사 벼락치기", desc:"시험이 코앞인데 준비가 부족해요!",
    choices:[{text:"밤새 공부!",eff:{academic:5},stress:4},{text:"적당히 자고 컨디션 관리",eff:{physical:1,academic:1}}] },
  { id:"m3", school:"middle", title:"SNS 갈등", desc:"친구들 사이에 오해가 생겼어요.",
    choices:[{text:"중재 나서기",eff:{social:4,emotion:1},stress:2},{text:"거리 두기",eff:{grit:2}}] },
  { id:"m4", school:"middle", title:"유튜브 도전?", desc:"친구가 같이 채널을 만들자고 해요.",
    choices:[{text:"해보자!",eff:{tech:3,creativity:3,social:1}},{text:"공부에 집중",eff:{academic:3}}] },
  { id:"m5", school:"middle", title:"동아리 갈등", desc:"동아리에서 의견 충돌이 생겼어요.",
    choices:[{text:"의견을 관철하기",eff:{grit:3,social:-1},stress:1},{text:"타협하기",eff:{social:3,emotion:1}}] },
  { id:"m6", school:"middle", title:"코딩 경진대회", desc:"학교 대표로 코딩 대회에 나갈 수 있어요.",
    choices:[{text:"출전!",eff:{tech:5,inquiry:2},stress:2},{text:"다음 기회에",eff:{grit:1}}] },
  { id:"m7", school:"middle", title:"봉사활동 제안", desc:"선생님이 양로원 봉사를 추천해요.",
    choices:[{text:"참여하기",eff:{social:3,emotion:3,grit:1}},{text:"다른 일에 집중",eff:{academic:2}}] },
  { id:"m8", school:"middle", title:"체육대회 응원단장", desc:"반 응원단장을 맡아달라는 부탁을 받았어요.",
    choices:[{text:"맡는다!",eff:{social:4,physical:2,creativity:1},stress:1},{text:"사양",eff:{grit:1}}] },
  { id:"h1", school:"high", title:"전국 대회 출전", desc:"실력이 인정받아 전국 대회에 초대됐어요!",
    choices:[{text:"출전한다!",eff:{grit:4},stress:2,bestStat:6},{text:"포기하고 쉬기",eff:{},stress:-4}] },
  { id:"h2", school:"high", title:"번아웃 위기", desc:"최근 너무 무리한 것 같아요...",
    choices:[{text:"쉬어가기",eff:{},stress:-8},{text:"끝까지 버티기",eff:{grit:5,physical:-2},stress:3}] },
  { id:"h3", school:"high", title:"멘토와의 만남", desc:"존경하는 분을 만날 기회가 생겼어요!",
    choices:[{text:"적극적으로 질문",eff:{inquiry:3,social:2,grit:2}},{text:"조용히 관찰",eff:{inquiry:3,emotion:2}}] },
  { id:"h4", school:"high", title:"대입 vs 취업 고민", desc:"진로를 진지하게 고민하는 시기예요.",
    choices:[{text:"대학 진학 준비",eff:{academic:4,grit:2},stress:2},{text:"실무 경험 쌓기",eff:{tech:3,physical:2,social:1}}] },
  { id:"h5", school:"high", title:"친구의 고민 상담", desc:"친한 친구가 진지한 고민을 털어놓았어요.",
    choices:[{text:"끝까지 들어주기",eff:{emotion:4,social:3}},{text:"해결책 제안",eff:{inquiry:2,social:2}}] },
  { id:"h6", school:"high", title:"수능 D-100", desc:"수능이 100일 앞으로 다가왔어요!",
    choices:[{text:"올인 모드!",eff:{academic:6,grit:3},stress:5},{text:"내 페이스 유지",eff:{academic:2,grit:1}}] },
  { id:"h7", school:"high", title:"창업 아이디어", desc:"번뜩이는 아이디어가 떠올랐어요!",
    choices:[{text:"바로 실행!",eff:{creativity:4,tech:3,social:2},stress:2},{text:"메모만 해두기",eff:{creativity:2}}] },
  { id:"h8", school:"high", title:"마지막 축제", desc:"고등학교 마지막 축제예요. 어떻게 참여할까요?",
    choices:[{text:"무대에 서기",eff:{emotion:4,social:3,creativity:2}},{text:"뒤에서 운영",eff:{tech:2,social:2,grit:2}}] },
];

const JOBS = [
  { name:"의사",emoji:"🩺",cat:"이공계",req:{academic:80,inquiry:60,grit:50} },
  { name:"과학자",emoji:"🔬",cat:"이공계",req:{inquiry:85,academic:60} },
  { name:"AI 연구원",emoji:"🤖",cat:"이공계",req:{tech:75,inquiry:70,academic:50} },
  { name:"약사",emoji:"💊",cat:"이공계",req:{academic:75,inquiry:55,grit:45} },
  { name:"건축가",emoji:"🏗️",cat:"이공계",req:{creativity:60,inquiry:55,tech:50} },
  { name:"수의사",emoji:"🐾",cat:"이공계",req:{inquiry:65,emotion:70,academic:50} },
  { name:"프로그래머",emoji:"💻",cat:"IT",req:{tech:80,inquiry:50} },
  { name:"게임 개발자",emoji:"🎮",cat:"IT",req:{tech:70,creativity:65} },
  { name:"드론 엔지니어",emoji:"🚁",cat:"IT",req:{tech:70,inquiry:60,physical:30} },
  { name:"로봇 공학자",emoji:"🦾",cat:"IT",req:{tech:75,inquiry:70} },
  { name:"데이터 분석가",emoji:"📈",cat:"IT",req:{tech:60,academic:65,inquiry:50} },
  { name:"디자이너",emoji:"🎨",cat:"예술",req:{creativity:75,emotion:60} },
  { name:"웹툰 작가",emoji:"✏️",cat:"예술",req:{creativity:80,grit:55,emotion:50} },
  { name:"음악가",emoji:"🎵",cat:"예술",req:{emotion:85,grit:50} },
  { name:"영화감독",emoji:"🎬",cat:"예술",req:{creativity:70,emotion:60,social:50} },
  { name:"뷰티 크리에이터",emoji:"💄",cat:"예술",req:{creativity:65,social:60,emotion:50} },
  { name:"요리사",emoji:"👨‍🍳",cat:"예술",req:{creativity:65,emotion:60,physical:40} },
  { name:"교사",emoji:"👩‍🏫",cat:"사회",req:{academic:60,social:70} },
  { name:"변호사",emoji:"⚖️",cat:"사회",req:{academic:75,social:60,grit:55} },
  { name:"외교관",emoji:"🌍",cat:"사회",req:{social:80,academic:60,emotion:40} },
  { name:"기자",emoji:"✍️",cat:"사회",req:{academic:55,emotion:70,social:50} },
  { name:"유튜버",emoji:"📱",cat:"사회",req:{creativity:60,tech:50,social:60} },
  { name:"환경운동가",emoji:"🌱",cat:"사회",req:{emotion:65,social:65,grit:50} },
  { name:"프로 운동선수",emoji:"⚽",cat:"체력",req:{physical:85,grit:70} },
  { name:"e스포츠 선수",emoji:"🕹️",cat:"체력",req:{tech:60,grit:75,physical:40} },
  { name:"소방관",emoji:"🚒",cat:"체력",req:{physical:70,grit:65,social:40} },
  { name:"군인/경찰",emoji:"🎖️",cat:"체력",req:{physical:65,grit:70,social:40} },
  { name:"탐험가",emoji:"🧭",cat:"체력",req:{physical:60,inquiry:60,creativity:45} },
  { name:"공무원",emoji:"🏛️",cat:"안정",req:{academic:70,grit:60,social:40} },
  { name:"회계사",emoji:"🧮",cat:"안정",req:{academic:75,grit:55,inquiry:40} },
  { name:"기업가",emoji:"🚀",cat:"안정",req:{social:75,grit:70,creativity:50} },
  { name:"간호사",emoji:"💉",cat:"안정",req:{academic:55,emotion:60,physical:50,social:45} },
  { name:"푸드 사이언티스트",emoji:"🧪",cat:"안정",req:{inquiry:60,creativity:55,emotion:45} },
];

const TITLES = [
  { name:"만능 천재",emoji:"🌟",check:(s,f)=>SK.every(k=>s[k]>=60) },
  { name:"한 우물 장인",emoji:"⛏️",check:(s)=>SK.some(k=>s[k]>=95) },
  { name:"덕후의 극치",emoji:"🔥",check:(s)=>SK.some(k=>s[k]>=95)&&SK.filter(k=>s[k]<=30).length>=6 },
  { name:"인싸 of 인싸",emoji:"🎉",check:(s)=>s.social>=95 },
  { name:"번아웃 생존자",emoji:"💪",check:(s,f)=>f.burnouts>=3 },
  { name:"자유영혼",emoji:"🦋",check:(s,f)=>f.neverRepeat },
  { name:"고집불통",emoji:"🪨",check:(s,f)=>f.maxConsecutiveClub>=10 },
  { name:"이벤트 헌터",emoji:"🎯",check:(s,f)=>f.eventCount>=18 },
  { name:"스트레스 제로",emoji:"😌",check:(s,f)=>f.maxStress<=30 },
  { name:"근성의 아이콘",emoji:"🏔️",check:(s,f)=>s.grit>=90&&f.burnouts>=1 },
  { name:"균형의 달인",emoji:"⚖️",check:(s)=>{const v=SK.map(k=>s[k]);return Math.max(...v)-Math.min(...v)<=15;} },
  { name:"늦깎이 반전왕",emoji:"🔄",check:(s,f)=>f.topStatChanged },
  { name:"봉사왕",emoji:"🤲",check:(s,f)=>f.volunteerCount>=4 },
  { name:"체력 괴물",emoji:"🦁",check:(s)=>s.physical>=95 },
  { name:"숨겨진 재능",emoji:"💎",check:(s,f)=>f.hiddenEvents>=3 },
];

/* ═══════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════ */
function getSchoolInfo(year) {
  if (year <= 6) return { school:"elementary", label:"초등학교", grade:year };
  if (year <= 9) return { school:"middle", label:"중학교", grade:year-6 };
  return { school:"high", label:"고등학교", grade:year-9 };
}

function getTurnInfo(turn, mode) {
  const tpy = mode === "fast" ? 2 : 4;
  const yearIdx = Math.floor(turn / tpy);
  const year = yearIdx + 1;
  const phase = turn % tpy;
  const isVacation = mode === "normal" && (phase === 1 || phase === 3);
  const semLabel = mode === "fast"
    ? (phase === 0 ? "1학기" : "2학기")
    : (["1학기","여름방학","2학기","겨울방학"][phase]);
  return { year, ...getSchoolInfo(year), phase, isVacation, semLabel, tpy };
}

function calcJob(stats) {
  let best = null, bestScore = 0;
  for (const j of JOBS) {
    const keys = Object.keys(j.req);
    if (keys.every(k => stats[k] >= j.req[k])) {
      const score = keys.reduce((a, k) => a + stats[k], 0);
      if (score > bestScore) { best = j; bestScore = score; }
    }
  }
  return best || { name:"프리랜서", emoji:"🌈", cat:"기본" };
}

function calcTitles(stats, flags) {
  return TITLES.filter(t => { try { return t.check(stats, flags); } catch { return false; } });
}

function clamp(v, lo=0, hi=100) { return Math.max(lo, Math.min(hi, v)); }

function applyEffects(stats, stress, eff, stressD=0, mult=1) {
  const ns = { ...stats };
  for (const k of SK) if (eff[k]) ns[k] = clamp(ns[k] + Math.round(eff[k] * mult));
  return { stats: ns, stress: clamp(stress + stressD, 0, 100) };
}

/* localStorage 래퍼 */
function storageSet(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}
function storageGet(key, def=null) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : def; } catch { return def; }
}

/* ═══════════════════════════════════════════
   COMPONENTS
   ═══════════════════════════════════════════ */
const Btn = ({ children, onClick, color=P.accent, disabled, small, full }) => (
  <button disabled={disabled} onClick={onClick} style={{
    padding: small ? "8px 16px" : "12px 24px", borderRadius: 12, border:"none",
    background: disabled ? P.card : color, color: disabled ? P.muted : (color===P.gold?"#0f172a":P.text),
    fontWeight: 700, fontSize: small ? 13 : 15, cursor: disabled ? "default" : "pointer",
    opacity: disabled ? .5 : 1, width: full ? "100%" : "auto", transition:"all .2s",
  }}>{children}</button>
);

const StatBars = ({ stats, stress, compact }) => (
  <div style={{ display:"grid", gridTemplateColumns: compact?"1fr 1fr":"1fr", gap: compact?4:6 }}>
    {SK.map(k=>(
      <div key={k} style={{ fontSize:12 }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:2 }}>
          <span>{STAT_META[k].icon} {STAT_META[k].name}</span>
          <span style={{color:P.muted}}>{stats[k]}</span>
        </div>
        <div style={{ height:6, background:"rgba(255,255,255,.08)", borderRadius:3, overflow:"hidden" }}>
          <div style={{ width:`${stats[k]}%`, height:"100%", background:STAT_META[k].color, borderRadius:3, transition:"width .5s" }} />
        </div>
      </div>
    ))}
    <div style={{ fontSize:12 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:2 }}>
        <span>😰 스트레스</span><span style={{color:P.muted}}>{stress}</span>
      </div>
      <div style={{ height:6, background:"rgba(255,255,255,.08)", borderRadius:3, overflow:"hidden" }}>
        <div style={{ width:`${stress}%`, height:"100%", background:P.red, borderRadius:3, transition:"width .5s" }} />
      </div>
    </div>
  </div>
);

const GlassCard = ({ children, accent, onClick, selected, style:s }) => (
  <div onClick={onClick} style={{
    background: selected ? accent+"22" : "rgba(255,255,255,.04)", border:`1px solid ${selected?accent:P.border}`,
    borderRadius:12, padding:"12px 16px", cursor: onClick?"pointer":"default", transition:"all .2s", ...s,
  }}>{children}</div>
);

/* ═══════════════════════════════════════════
   SCREENS
   ═══════════════════════════════════════════ */
function TitleScreen({ onNew, saves, onLoad, onCollection }) {
  return (
    <div style={{ textAlign:"center", paddingTop:60 }}>
      <div style={{ fontSize:56, marginBottom:16 }}>🎓</div>
      <h1 style={{ fontSize:32, fontWeight:800, margin:0, background:`linear-gradient(135deg,${P.accent},${P.gold})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>꿈의 교실</h1>
      <p style={{ color:P.gold, fontSize:14, marginTop:4, letterSpacing:2 }}>DREAM CLASS</p>
      <p style={{ color:P.muted, fontSize:13, marginTop:16 }}>나의 선택이 나의 미래를 만든다</p>
      <div style={{ display:"flex", flexDirection:"column", gap:10, marginTop:36, maxWidth:280, margin:"36px auto 0" }}>
        <Btn onClick={onNew} full>🆕 새 게임</Btn>
        {saves.map((s,i)=> s && (
          <Btn key={i} onClick={()=>onLoad(i)} color={P.card} full small>
            📂 슬롯{i+1}: {s.name} ({getTurnInfo(s.turn,s.mode).label} {getTurnInfo(s.turn,s.mode).grade}학년)
          </Btn>
        ))}
        <Btn onClick={onCollection} color="rgba(255,255,255,.08)" full small>🗄️ 도감</Btn>
      </div>
    </div>
  );
}

function SetupScreen({ onStart }) {
  const [name, setName] = useState("");
  const [mode, setMode] = useState(null);
  const [slot, setSlot] = useState(0);
  return (
    <div style={{ maxWidth:400, margin:"40px auto" }}>
      <h2 style={{ color:P.accent, fontSize:22, marginBottom:24 }}>🎒 새 게임 시작</h2>
      <div style={{ marginBottom:20 }}>
        <label style={{ fontSize:13, color:P.muted, display:"block", marginBottom:6 }}>이름을 입력하세요</label>
        <input value={name} onChange={e=>setName(e.target.value)} maxLength={8} placeholder="홍길동"
          style={{ width:"100%", padding:"12px 16px", borderRadius:10, border:`1px solid ${P.border}`, background:P.card, color:P.text, fontSize:16, outline:"none", boxSizing:"border-box" }} />
      </div>
      <div style={{ marginBottom:20 }}>
        <label style={{ fontSize:13, color:P.muted, display:"block", marginBottom:8 }}>게임 모드</label>
        <div style={{ display:"flex", gap:8 }}>
          {[{id:"fast",label:"⚡ 빠른 모드",desc:"24턴 · 약 25분"},{id:"normal",label:"📚 기본 모드",desc:"48턴 · 약 50분"}].map(m=>(
            <GlassCard key={m.id} selected={mode===m.id} accent={P.accent} onClick={()=>setMode(m.id)} style={{flex:1,textAlign:"center"}}>
              <div style={{ fontWeight:700, fontSize:15, color: mode===m.id?P.accent:P.text }}>{m.label}</div>
              <div style={{ fontSize:12, color:P.muted, marginTop:4 }}>{m.desc}</div>
            </GlassCard>
          ))}
        </div>
      </div>
      <div style={{ marginBottom:24 }}>
        <label style={{ fontSize:13, color:P.muted, display:"block", marginBottom:8 }}>저장 슬롯</label>
        <div style={{ display:"flex", gap:8 }}>
          {[0,1,2].map(i=>(
            <GlassCard key={i} selected={slot===i} accent={P.gold} onClick={()=>setSlot(i)} style={{flex:1,textAlign:"center"}}>
              <div style={{ fontWeight:700, fontSize:14, color:slot===i?P.gold:P.text }}>슬롯 {i+1}</div>
            </GlassCard>
          ))}
        </div>
      </div>
      <Btn onClick={()=>onStart(name||"학생",mode||"normal",slot)} disabled={!mode} full color={P.gold}>
        🚀 입학하기!
      </Btn>
    </div>
  );
}

function ScheduleScreen({ G, turnInfo, onConfirm }) {
  const [cls, setCls] = useState(null);
  const [club, setClub] = useState(null);
  const [vac, setVac] = useState(null);
  const mult = G.mode === "fast" ? 1.8 : 1;

  const availClasses = CLASSES.filter(c => !c.school || (c.school==="middle" && turnInfo.year>=7));
  const availClubs = CLUBS.filter(c => !c.school || (c.school==="middle" && turnInfo.year>=7));
  const availVacs = VACATIONS.filter(v => !v.school || (v.school==="middle" && turnInfo.year>=7));

  const isVac = turnInfo.isVacation;

  const renderEff = (eff, stressD=0) => {
    const parts = [];
    for (const k of SK) if (eff[k]) parts.push(`${STAT_META[k].icon}${eff[k]>0?"+":""}${Math.round(eff[k]*mult)}`);
    if (stressD) parts.push(`😰${stressD>0?"+":""}${stressD}`);
    return <span style={{fontSize:11,color:P.muted}}>{parts.join(" ")}</span>;
  };

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <div>
          <div style={{ fontSize:13, color:P.muted }}>{turnInfo.label} {turnInfo.grade}학년</div>
          <div style={{ fontSize:20, fontWeight:700, color:P.gold }}>{turnInfo.semLabel}</div>
        </div>
        <div style={{ textAlign:"right" }}>
          <div style={{ fontSize:13, color:P.muted }}>턴 {G.turn+1}/{G.mode==="fast"?24:48}</div>
          <div style={{ fontSize:13, color:P.accent }}>{G.name}</div>
        </div>
      </div>

      <div style={{ marginBottom:16 }}>
        <StatBars stats={G.stats} stress={G.stress} compact />
      </div>

      {!isVac ? (
        <>
          <h3 style={{ fontSize:15, color:P.accent, margin:"16px 0 8px" }}>📚 수업 선택</h3>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6, marginBottom:12 }}>
            {availClasses.map(c=>(
              <GlassCard key={c.id} selected={cls===c.id} accent={P.accent} onClick={()=>setCls(c.id)}>
                <div style={{ fontWeight:600, fontSize:13, color:cls===c.id?P.accent:P.text }}>{c.name}</div>
                {renderEff(c.eff)}
              </GlassCard>
            ))}
          </div>
          <h3 style={{ fontSize:15, color:P.green, margin:"16px 0 8px" }}>🎯 방과후 활동</h3>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6, marginBottom:16 }}>
            {availClubs.map(c=>(
              <GlassCard key={c.id} selected={club===c.id} accent={P.green} onClick={()=>setClub(c.id)}>
                <div style={{ fontWeight:600, fontSize:13, color:club===c.id?P.green:P.text }}>{c.name}</div>
                {renderEff(c.eff)}
              </GlassCard>
            ))}
          </div>
          <Btn onClick={()=>onConfirm(cls,club,null)} disabled={!cls||!club} full color={P.accent}>
            ✅ 학기 시작!
          </Btn>
        </>
      ) : (
        <>
          <h3 style={{ fontSize:15, color:P.gold, margin:"16px 0 8px" }}>🌴 방학 활동 선택</h3>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6, marginBottom:16 }}>
            {availVacs.map(v=>(
              <GlassCard key={v.id} selected={vac===v.id} accent={P.gold} onClick={()=>setVac(v.id)}>
                <div style={{ fontWeight:600, fontSize:13, color:vac===v.id?P.gold:P.text }}>{v.name}</div>
                {renderEff(v.eff, v.stress||0)}
              </GlassCard>
            ))}
          </div>
          <Btn onClick={()=>onConfirm(null,null,vac)} disabled={!vac} full color={P.gold}>
            ✅ 방학 시작!
          </Btn>
        </>
      )}
    </div>
  );
}

function ResultScreen({ changes, turnInfo, onContinue }) {
  return (
    <div style={{ textAlign:"center", paddingTop:30 }}>
      <div style={{ fontSize:15, color:P.muted, marginBottom:8 }}>{turnInfo.label} {turnInfo.grade}학년 · {turnInfo.semLabel}</div>
      <h2 style={{ fontSize:20, color:P.accent, margin:"0 0 20px" }}>📊 결과</h2>
      <div style={{ display:"flex", flexWrap:"wrap", gap:8, justifyContent:"center", marginBottom:24 }}>
        {Object.entries(changes).filter(([,v])=>v!==0).map(([k,v])=>(
          <div key={k} style={{ padding:"8px 14px", background:v>0?"rgba(52,211,153,.12)":"rgba(248,113,113,.12)", borderRadius:10, border:`1px solid ${v>0?P.green:P.red}44` }}>
            <span style={{fontSize:13}}>{k==="stress"?"😰":STAT_META[k]?.icon} {k==="stress"?"스트레스":STAT_META[k]?.name}</span>
            <span style={{ marginLeft:6, fontWeight:700, color:v>0?P.green:P.red }}>{v>0?"+":""}{v}</span>
          </div>
        ))}
      </div>
      <Btn onClick={onContinue}>계속 →</Btn>
    </div>
  );
}

function EventScreen({ event, onChoice, mult }) {
  return (
    <div style={{ paddingTop:20 }}>
      <div style={{ textAlign:"center", marginBottom:16 }}>
        <span style={{ fontSize:13, color:P.gold }}>🎲 이벤트 발생!</span>
      </div>
      <GlassCard accent={P.gold} style={{ marginBottom:20 }}>
        <h3 style={{ margin:"0 0 8px", fontSize:18, color:P.gold }}>{event.title}</h3>
        <p style={{ margin:0, fontSize:14, color:P.muted, lineHeight:1.6 }}>{event.desc}</p>
      </GlassCard>
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {event.choices.map((c,i)=>(
          <GlassCard key={i} accent={P.accent} onClick={()=>onChoice(i)} style={{ cursor:"pointer" }}>
            <div style={{ fontWeight:600, fontSize:14, color:P.accent, marginBottom:4 }}>
              {String.fromCharCode(65+i)}. {c.text}
            </div>
            <div style={{ fontSize:11, color:P.muted }}>
              {Object.entries(c.eff).filter(([k])=>SK.includes(k)).map(([k,v])=>`${STAT_META[k].icon}${v>0?"+":""}${Math.round(v*mult)}`).join(" ")}
              {c.stress ? ` 😰${c.stress>0?"+":""}${c.stress}` : ""}
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

function MilestoneScreen({ school, name, stats, onContinue }) {
  const titles = { elementary:"초등학교 졸업식 🎒", middle:"중학교 졸업식 📘", high:"고등학교 졸업식 🎓" };
  const msgs = { elementary:"초등학교 6년이 눈 깜짝할 사이에 지나갔어요!", middle:"중학교 3년 동안 정말 많이 성장했어요!", high:"드디어 졸업! 새로운 세상이 기다리고 있어요!" };
  return (
    <div style={{ textAlign:"center", paddingTop:40 }}>
      <div style={{ fontSize:48, marginBottom:16 }}>{school==="high"?"🎓":"🏫"}</div>
      <h2 style={{ fontSize:22, color:P.gold, margin:"0 0 8px" }}>{titles[school]}</h2>
      <p style={{ color:P.muted, fontSize:14, marginBottom:24 }}>{name}, {msgs[school]}</p>
      <div style={{ maxWidth:320, margin:"0 auto 24px" }}>
        <StatBars stats={stats} stress={0} compact />
      </div>
      <Btn onClick={onContinue} color={P.gold}>
        {school==="high" ? "🌟 나의 미래는?" : "다음 학교로! →"}
      </Btn>
    </div>
  );
}

function EndingScreen({ G, job, titles, collection, onTitle }) {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    if (phase < 3) { const t = setTimeout(()=>setPhase(p=>p+1), phase===0?2000:1500); return ()=>clearTimeout(t); }
  }, [phase]);

  return (
    <div style={{ textAlign:"center", paddingTop:30 }}>
      {phase === 0 && (
        <div><div style={{ fontSize:48, marginBottom:16 }}>🎓</div>
        <h2 style={{ fontSize:22, color:P.muted }}>졸업 후 10년...</h2></div>
      )}
      {phase >= 1 && (
        <div style={{ animation:"fadeIn .8s ease" }}>
          <div style={{ fontSize:64, marginBottom:12 }}>{job.emoji}</div>
          <h2 style={{ fontSize:26, color:P.gold, margin:"0 0 4px" }}>{G.name}</h2>
          <p style={{ fontSize:20, color:P.accent, fontWeight:700, margin:"0 0 20px" }}>{job.name}{job.name==="프리랜서"?" (아직 꿈을 찾는 중...)":""}</p>
        </div>
      )}
      {phase >= 2 && titles.length > 0 && (
        <div style={{ animation:"fadeIn .8s ease", marginBottom:20 }}>
          <p style={{ fontSize:13, color:P.muted, marginBottom:8 }}>🎖️ 획득 칭호</p>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6, justifyContent:"center" }}>
            {titles.map((t,i)=>(
              <span key={i} style={{ padding:"6px 12px", background:P.gold+"22", border:`1px solid ${P.gold}44`, borderRadius:20, fontSize:13, color:P.gold }}>
                {t.emoji} {t.name}
              </span>
            ))}
          </div>
        </div>
      )}
      {phase >= 3 && (
        <div style={{ animation:"fadeIn .8s ease" }}>
          <div style={{ maxWidth:320, margin:"0 auto 20px" }}>
            <StatBars stats={G.stats} stress={G.stress} compact />
          </div>
          <p style={{ fontSize:12, color:P.muted, marginBottom:16 }}>
            🗄️ 도감: {collection.jobs.length}/33 직업 · {collection.titles.length}/15 칭호
          </p>
          <Btn onClick={onTitle} color={P.gold}>🏠 타이틀로</Btn>
        </div>
      )}
    </div>
  );
}

function CollectionScreen({ collection, onBack }) {
  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <h2 style={{ fontSize:20, color:P.gold, margin:0 }}>🗄️ 도감</h2>
        <Btn onClick={onBack} small color={P.card}>← 돌아가기</Btn>
      </div>
      <h3 style={{ fontSize:15, color:P.accent, margin:"0 0 10px" }}>직업 ({collection.jobs.length}/33)</h3>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(90px,1fr))", gap:6, marginBottom:20 }}>
        {JOBS.map((j,i)=>{
          const unlocked = collection.jobs.includes(j.name);
          return (
            <div key={i} style={{ textAlign:"center", padding:"10px 4px", background: unlocked?"rgba(255,255,255,.04)":"rgba(0,0,0,.2)", borderRadius:10, border:`1px solid ${P.border}`, opacity:unlocked?1:.4 }}>
              <div style={{fontSize:22}}>{unlocked?j.emoji:"❓"}</div>
              <div style={{fontSize:11,color:unlocked?P.text:P.muted,marginTop:4}}>{unlocked?j.name:"???"}</div>
            </div>
          );
        })}
      </div>
      <h3 style={{ fontSize:15, color:P.gold, margin:"0 0 10px" }}>칭호 ({collection.titles.length}/15)</h3>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))", gap:6 }}>
        {TITLES.map((t,i)=>{
          const unlocked = collection.titles.includes(t.name);
          return (
            <div key={i} style={{ padding:"8px 10px", background: unlocked?"rgba(255,255,255,.04)":"rgba(0,0,0,.2)", borderRadius:10, border:`1px solid ${P.border}`, opacity:unlocked?1:.4 }}>
              <span style={{fontSize:18}}>{unlocked?t.emoji:"❓"}</span>
              <span style={{fontSize:12,color:unlocked?P.text:P.muted,marginLeft:6}}>{unlocked?t.name:"???"}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BurnoutScreen({ name, onContinue }) {
  return (
    <div style={{ textAlign:"center", paddingTop:40 }}>
      <div style={{ fontSize:48, marginBottom:16 }}>😵</div>
      <h2 style={{ fontSize:22, color:P.red, margin:"0 0 8px" }}>번아웃 발생!</h2>
      <p style={{ color:P.muted, fontSize:14, marginBottom:20, lineHeight:1.6 }}>
        {name}의 스트레스가 한계를 넘었어요...<br/>강제로 쉬면서 회복해야 합니다.
      </p>
      <p style={{ color:P.red, fontSize:13, marginBottom:24 }}>스트레스 -30 / 모든 스탯 -3</p>
      <Btn onClick={onContinue} color={P.orange}>😮‍💨 다시 힘내자...</Btn>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN GAME
   ═══════════════════════════════════════════ */
export default function App() {
  const [screen, setScreen] = useState("title");
  const [saves, setSaves] = useState(()=>[0,1,2].map(i=>storageGet(`dreamclass:save${i}`)));
  const [collection, setCollection] = useState(()=>storageGet("dreamclass:collection",{jobs:[],titles:[]}));
  const [G, setG] = useState(null);
  const [turnChanges, setTurnChanges] = useState(null);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [milestoneSchool, setMilestoneSchool] = useState(null);
  const [endingData, setEndingData] = useState(null);

  const saveCurrentGame = useCallback((gameState) => {
    if (!gameState || gameState.slot == null) return;
    storageSet(`dreamclass:save${gameState.slot}`, gameState);
    setSaves(prev => { const n=[...prev]; n[gameState.slot] = gameState; return n; });
  }, []);

  const handleNew = () => setScreen("setup");

  const handleStart = (name, mode, slot) => {
    const g = { name, mode, slot, turn:0, stats:initStats(), stress:0, burnouts:0, seenEvents:[], volunteerCount:0, maxStress:0, eventCount:0, neverRepeat:true, lastActivity:null, maxConsecutiveClub:0, currentConsecutiveClub:0, lastClub:null, topStatElementary:null, topStatChanged:false, hiddenEvents:0 };
    setG(g);
    saveCurrentGame(g);
    setScreen("schedule");
  };

  const handleLoad = (slot) => {
    const g = saves[slot];
    if (g) { setG(g); setScreen("schedule"); }
  };

  const handleConfirm = (clsId, clubId, vacId) => {
    const mult = G.mode === "fast" ? 1.8 : 1;
    let ns = { ...G.stats };
    let nStress = G.stress;
    const changes = {};

    if (clsId) {
      const cls = CLASSES.find(c=>c.id===clsId);
      const r = applyEffects(ns, nStress, cls.eff, 0, mult);
      ns = r.stats; nStress = r.stress;
    }
    if (clubId) {
      const club = CLUBS.find(c=>c.id===clubId);
      const r = applyEffects(ns, nStress, club.eff, 0, mult);
      ns = r.stats; nStress = r.stress;
      nStress = clamp(nStress + 1);
    }
    if (vacId) {
      const vac = VACATIONS.find(v=>v.id===vacId);
      const r = applyEffects(ns, nStress, vac.eff, vac.stress||0, mult);
      ns = r.stats; nStress = r.stress;
    }

    for (const k of SK) { const d = ns[k] - G.stats[k]; if (d) changes[k] = d; }
    const sd = nStress - G.stress; if (sd) changes.stress = sd;

    let cc = G.currentConsecutiveClub||0, mc = G.maxConsecutiveClub||0;
    if (clubId && clubId === G.lastClub) { cc++; } else { cc = clubId ? 1 : 0; }
    mc = Math.max(mc, cc);

    let nr = G.neverRepeat;
    const actKey = clsId||vacId;
    if (actKey && actKey === G.lastActivity) nr = false;

    let vol = G.volunteerCount||0;
    if (vacId === "v6") vol++;

    const ng = { ...G, stats:ns, stress:nStress, maxStress:Math.max(G.maxStress||0, nStress), lastActivity:actKey, lastClub:clubId||G.lastClub, currentConsecutiveClub:cc, maxConsecutiveClub:mc, neverRepeat:nr, volunteerCount:vol };

    const turnInfo = getTurnInfo(G.turn, G.mode);
    if (turnInfo.year === 6 && !G.topStatElementary) {
      ng.topStatElementary = SK.reduce((a,b)=>ns[a]>=ns[b]?a:b);
    }

    setG(ng);
    setTurnChanges(changes);
    setScreen("result");
  };

  const handleResultContinue = () => {
    const turnInfo = getTurnInfo(G.turn, G.mode);
    const mult = G.mode === "fast" ? 1.8 : 1;

    if (G.stress >= 80) { setScreen("burnout"); return; }

    const evChance = G.mode === "fast" ? 0.42 : 0.32;
    if (!turnInfo.isVacation && Math.random() < evChance) {
      const pool = EVENTS.filter(e => e.school === turnInfo.school && !G.seenEvents.includes(e.id));
      if (pool.length > 0) {
        setCurrentEvent(pool[Math.floor(Math.random() * pool.length)]);
        setScreen("event");
        return;
      }
    }
    advanceTurn(G);
  };

  const handleEventChoice = (choiceIdx) => {
    const choice = currentEvent.choices[choiceIdx];
    const mult = G.mode === "fast" ? 1.8 : 1;
    let ns = { ...G.stats };
    let nStress = G.stress;

    const r = applyEffects(ns, nStress, choice.eff, choice.stress||0, mult);
    ns = r.stats; nStress = r.stress;

    if (choice.bestStat) {
      const topK = SK.reduce((a,b)=>ns[a]>=ns[b]?a:b);
      ns[topK] = clamp(ns[topK] + Math.round(choice.bestStat * mult));
    }

    const ng = { ...G, stats:ns, stress:nStress, seenEvents:[...G.seenEvents, currentEvent.id], eventCount:(G.eventCount||0)+1, maxStress:Math.max(G.maxStress||0, nStress) };
    setG(ng);
    setCurrentEvent(null);
    advanceTurn(ng);
  };

  const handleBurnout = () => {
    const ns = { ...G.stats };
    for (const k of SK) ns[k] = clamp(ns[k] - 3);
    const ng = { ...G, stats:ns, stress:clamp(G.stress - 30), burnouts:(G.burnouts||0)+1 };
    setG(ng);
    advanceTurn(ng);
  };

  const advanceTurn = (gameState) => {
    const gs = gameState || G;
    const maxTurns = gs.mode === "fast" ? 24 : 48;
    const turnInfo = getTurnInfo(gs.turn, gs.mode);
    const nextTurn = gs.turn + 1;
    const nextInfo = nextTurn < maxTurns ? getTurnInfo(nextTurn, gs.mode) : null;
    const schoolChanged = nextInfo && nextInfo.school !== turnInfo.school;
    const gameEnd = nextTurn >= maxTurns;

    let tsc = gs.topStatChanged;
    if (gameEnd && gs.topStatElementary) {
      const topK = SK.reduce((a,b)=>gs.stats[a]>=gs.stats[b]?a:b);
      if (topK !== gs.topStatElementary) tsc = true;
    }

    const ng = { ...gs, turn: nextTurn, topStatChanged: tsc };
    setG(ng);
    saveCurrentGame(ng);

    if (gameEnd) {
      const job = calcJob(ng.stats);
      const titles = calcTitles(ng.stats, ng);
      const newCol = { ...collection };
      if (!newCol.jobs.includes(job.name) && job.name !== "프리랜서") newCol.jobs = [...newCol.jobs, job.name];
      for (const t of titles) if (!newCol.titles.includes(t.name)) newCol.titles = [...newCol.titles, t.name];
      setCollection(newCol);
      storageSet("dreamclass:collection", newCol);
      setEndingData({ job, titles });
      setScreen("ending");
    } else if (schoolChanged) {
      setMilestoneSchool(turnInfo.school);
      setScreen("milestone");
    } else {
      setScreen("schedule");
    }
  };

  const handleMilestoneContinue = () => { setMilestoneSchool(null); setScreen("schedule"); };

  const handleGoTitle = () => {
    if (G && G.slot != null) {
      storageSet(`dreamclass:save${G.slot}`, null);
      setSaves(prev => { const n=[...prev]; n[G.slot] = null; return n; });
    }
    setG(null); setEndingData(null); setScreen("title");
  };

  const turnInfo = G ? getTurnInfo(G.turn, G.mode) : null;
  const mult = G?.mode === "fast" ? 1.8 : 1;

  return (
    <div style={{ background:P.bg, color:P.text, minHeight:"100vh", padding:"20px 16px", maxWidth:480, margin:"0 auto" }}>
      {screen === "title" && <TitleScreen onNew={handleNew} saves={saves} onLoad={handleLoad} onCollection={()=>setScreen("collection")} />}
      {screen === "setup" && <SetupScreen onStart={handleStart} />}
      {screen === "schedule" && G && <ScheduleScreen G={G} turnInfo={turnInfo} onConfirm={handleConfirm} />}
      {screen === "result" && <ResultScreen changes={turnChanges} turnInfo={turnInfo} onContinue={handleResultContinue} />}
      {screen === "event" && currentEvent && <EventScreen event={currentEvent} onChoice={handleEventChoice} mult={mult} />}
      {screen === "burnout" && G && <BurnoutScreen name={G.name} onContinue={handleBurnout} />}
      {screen === "milestone" && G && <MilestoneScreen school={milestoneSchool} name={G.name} stats={G.stats} onContinue={handleMilestoneContinue} />}
      {screen === "ending" && G && endingData && <EndingScreen G={G} job={endingData.job} titles={endingData.titles} collection={collection} onTitle={handleGoTitle} />}
      {screen === "collection" && <CollectionScreen collection={collection} onBack={()=>setScreen("title")} />}
    </div>
  );
}
