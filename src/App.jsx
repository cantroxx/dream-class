import { useState, useEffect, useCallback, useRef } from "react";

/* ═══════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════ */
const P = { bg:"#0f172a", card:"#1e293b", accent:"#38bdf8", gold:"#fbbf24", green:"#34d399", pink:"#f472b6", purple:"#a78bfa", orange:"#fb923c", red:"#f87171", text:"#f1f5f9", muted:"#94a3b8", border:"rgba(148,163,184,.15)" };

const STAT_META = {
  academic:  { name:"공부 실력", icon:"📖", color:"#38bdf8" },
  physical:  { name:"체력",      icon:"💪", color:"#34d399" },
  creativity:{ name:"창의력",    icon:"🎨", color:"#f472b6" },
  social:    { name:"친구 관계", icon:"🤝", color:"#fbbf24" },
  inquiry:   { name:"탐구력",    icon:"🔬", color:"#a78bfa" },
  tech:      { name:"컴퓨터 실력", icon:"💻", color:"#fb923c" },
  emotion:   { name:"따뜻한 마음", icon:"🎵", color:"#f87171" },
  grit:      { name:"끈기",      icon:"🔥", color:"#e879f9" },
};
const SK = Object.keys(STAT_META);
const initStats = ()=>Object.fromEntries(SK.map(k=>[k,10]));

const CLASSES = [
  { id:"c1", name:"국어와 글쓰기",  eff:{academic:3,emotion:1}, msgs:["독서 감상문에서 선생님이 칭찬해주셨어요!","오늘 토론에서 멋진 발표를 했어요.","새로운 책을 읽고 세상이 넓어진 기분이에요."] },
  { id:"c2", name:"창의 수학 교실",  eff:{academic:3,inquiry:2}, msgs:["어려운 문제를 풀었더니 뿌듯해요!","수학 공식이 머릿속에서 딱딱 맞아떨어져요.","오늘 배운 개념이 신기하고 재미있었어요."] },
  { id:"c3", name:"어린이 과학 실험실",  eff:{inquiry:3,tech:1}, msgs:["실험 결과가 예상과 딱 맞아서 신났어요!","현미경으로 새로운 세계를 봤어요.","가설을 세우고 검증하는 과정이 짜릿해요."] },
  { id:"c4", name:"사회 탐구",  eff:{academic:2,social:2}, msgs:["역사 속 인물의 이야기에 빠져들었어요.","사회 현상을 분석하는 눈이 생긴 것 같아요.","모둠 토론에서 다양한 의견을 들었어요."] },
  { id:"c5", name:"영어 회화",  eff:{academic:2,social:1}, msgs:["외국인 선생님과 자연스럽게 대화했어요!","영어 팝송 가사가 들리기 시작했어요.","영어로 자기소개를 멋지게 해냈어요."] },
  { id:"c6", name:"블록 코딩(엔트리)",  eff:{tech:3,inquiry:1}, school:"middle", msgs:["내가 만든 프로그램이 드디어 동작해요!","버그를 찾아서 고치는 게 퍼즐 같아요.","알고리즘이 점점 이해되기 시작했어요."] },
  { id:"c7", name:"뉴스포츠와 뜀틀",  eff:{physical:4,grit:1}, msgs:["체력 측정에서 기록이 쑥 올랐어요!","운동 후 땀 흘리니까 기분이 상쾌해요.","친구들과 팀으로 운동하니 더 재미있어요."] },
  { id:"c8", name:"음악과 미술 시간",  eff:{emotion:3,creativity:2}, msgs:["내가 그린 그림을 친구들이 좋아해줬어요!","새로운 악기 연주법을 배웠어요.","예술 작품을 감상하며 감동받았어요."] },
  { id:"c9", name:"생태와 환경 수업",  eff:{inquiry:3,emotion:1}, msgs:["학교 텃밭에서 방울토마토가 자라는 걸 보니 너무 신기해요!","분리배출을 열심히 해서 지구를 지키는 파수꾼이 될래요."] },
  { id:"c10", name:"어린이 역사 탐험",  eff:{academic:2,creativity:2}, msgs:["우리 고장의 옛날 이야기를 배우는 게 삼국지보다 재밌어요!","과거로 시간 여행을 다녀온 기분이에요."] },
];

const CLUBS = [
  { id:"cl1",  name:"축구부",     eff:{physical:4,social:2,grit:1}, msgs:["오늘 연습 경기에서 멋진 골을 넣었어요!","체력이 눈에 띄게 좋아지고 있어요.","팀워크의 중요성을 느낀 하루였어요."] },
  { id:"cl2",  name:"미술부",     eff:{creativity:4,emotion:2}, msgs:["수채화 기법을 새로 배웠어요!","전시회 출품작을 완성했어요.","색감에 대한 감각이 살아나는 것 같아요."] },
  { id:"cl3",  name:"과학반",     eff:{inquiry:4,academic:1}, msgs:["자유 주제 실험에서 흥미로운 결과를 얻었어요!","과학 잡지를 읽으며 새로운 아이디어가 떠올랐어요.","선배가 연구 방법을 친절하게 알려줬어요."] },
  { id:"cl4",  name:"밴드부",     eff:{emotion:4,social:2}, msgs:["합주가 점점 맞아가고 있어요!","새로운 곡 연습을 시작했어요.","공연 준비가 설레고 떨려요."] },
  { id:"cl5",  name:"레고 로봇 과학부", eff:{tech:4,inquiry:2}, school:"middle", msgs:["로봇이 드디어 정해진 경로를 따라 움직여요!","센서 프로그래밍이 점점 재미있어져요.","대회 출전을 목표로 열심히 준비 중이에요."] },
  { id:"cl6",  name:"독서토론반", eff:{academic:2,social:3}, msgs:["이번 달 추천 도서가 정말 재미있었어요!","토론에서 논리적으로 반박하는 법을 배웠어요.","다양한 관점으로 책을 읽는 눈이 생겼어요."] },
  { id:"cl7",  name:"전교 어린이회",     eff:{social:4,grit:2}, msgs:["학교 행사 기획안이 통과됐어요!","학생들의 의견을 모아 건의서를 제출했어요.","리더십에 대해 많이 배우는 시간이었어요."] },
  { id:"cl8",  name:"꼬마 요리사반",     eff:{creativity:3,emotion:2}, msgs:["오늘 만든 요리를 친구들이 맛있다고 했어요!","새로운 레시피에 도전해서 성공했어요.","재료를 창의적으로 조합하는 게 재미있어요."] },
  { id:"cl9",  name:"방송반",     eff:{tech:2,social:3,creativity:1}, msgs:["점심시간 교내 방송을 멋지게 진행했어요!","영상 편집 기술이 늘고 있어요.","인터뷰 촬영을 하면서 소통 능력이 늘었어요."] },
  { id:"cl10", name:"방송 댄스 동아리",     eff:{physical:3,emotion:3}, msgs:["새로운 안무를 완벽하게 소화했어요!","거울 앞에서 연습하니 동작이 깔끔해졌어요.","공연 무대에 대한 기대감이 커져요."] },
  { id:"cl11", name:"바둑과 보드게임반",     eff:{grit:3,creativity:2,inquiry:1}, msgs:["상대방의 수를 예측하며 바둑돌을 놓을 때 엄청 짜릿해요!","보드게임 규칙을 지키며 포기하지 않고 끝까지 이겼어요!"] },
  { id:"cl12", name:"어린이 연극 교실",     eff:{emotion:3,creativity:2,social:1}, msgs:["연극 무대에서 다른 주인공의 마음이 되어 대사를 해봤어요!","친구들과 몸으로 감정을 표현하는 게 정말 즐거워요!"] },
];

const VACATIONS = [
  { id:"v1", name:"방학 학원 특강",   eff:{academic:5}, stress:3, msgs:["문제집 한 권을 다 풀었어요!","선생님이 실력이 많이 늘었다고 했어요.","열심히 공부한 보람이 느껴져요."] },
  { id:"v2", name:"스포츠 캠프", eff:{physical:5,grit:2}, msgs:["캠프에서 새로운 운동 친구를 사귀었어요!","아침부터 저녁까지 운동하니 체력이 쑥 올랐어요.","힘들었지만 포기하지 않아서 뿌듯해요."] },
  { id:"v3", name:"해외 가족 여행",   eff:{social:4,creativity:2}, msgs:["다른 나라의 문화를 직접 체험하니 신기했어요!","외국 친구와 소통하면서 시야가 넓어졌어요.","새로운 음식과 풍경에 감동받았어요."] },
  { id:"v4", name:"하루 종일 자유 시간",   eff:{creativity:1}, stress:-5, msgs:["마음껏 쉬니까 에너지가 충전됐어요!","하고 싶은 것을 마음대로 하니 행복해요.","여유로운 시간이 창의력의 원천이에요."] },
  { id:"v5", name:"키자니아 직업 체험",   eff:{inquiry:3,social:2}, msgs:["다양한 직업의 세계를 엿볼 수 있었어요!","꿈에 한 발짝 다가간 기분이에요.","현장에서 일하는 분들의 이야기가 인상적이었어요."] },
  { id:"v6", name:"봉사활동",    eff:{social:3,emotion:2,grit:1}, msgs:["도움이 필요한 분들에게 보탬이 된 것 같아요.","봉사를 하면서 오히려 제가 더 많이 배웠어요.","따뜻한 마음을 나누는 시간이었어요."] },
  { id:"v7", name:"코딩 캠프",   eff:{tech:5,grit:1}, school:"middle", msgs:["해커톤에서 팀 프로젝트를 완성했어요!","새로운 프로그래밍 언어를 배웠어요.","멘토 개발자의 조언이 정말 도움됐어요."] },
  { id:"v8", name:"미술관/박물관 나들이", eff:{creativity:5,emotion:2}, msgs:["전문 작가에게 직접 지도받았어요!","영감이 샘솟는 시간이었어요.","나만의 작품을 완성해서 전시했어요."] },
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
  { name:"인공지능(AI) 개발자",emoji:"🤖",cat:"이공계",req:{tech:75,inquiry:70,academic:50} },
  { name:"약사",emoji:"💊",cat:"이공계",req:{academic:75,inquiry:55,grit:45} },
  { name:"건축가",emoji:"🏗️",cat:"이공계",req:{creativity:60,inquiry:55,tech:50} },
  { name:"동물병원 의사",emoji:"🐾",cat:"이공계",req:{inquiry:65,emotion:70,academic:50} },
  { name:"컴퓨터 프로그래머",emoji:"💻",cat:"IT",req:{tech:80,inquiry:50} },
  { name:"게임 개발자",emoji:"🎮",cat:"IT",req:{tech:70,creativity:65} },
  { name:"드론 엔지니어",emoji:"🚁",cat:"IT",req:{tech:70,inquiry:60,physical:30} },
  { name:"로봇 과학자",emoji:"🦾",cat:"IT",req:{tech:75,inquiry:70} },
  { name:"빅데이터 분석가",emoji:"📈",cat:"IT",req:{tech:60,academic:65,inquiry:50} },
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
  { name:"수학 전문가",emoji:"🧮",cat:"안정",req:{academic:75,grit:55,inquiry:40} },
  { name:"기업가",emoji:"🚀",cat:"안정",req:{social:75,grit:70,creativity:50} },
  { name:"간호사",emoji:"💉",cat:"안정",req:{academic:55,emotion:60,physical:50,social:45} },
  { name:"음식 연구원",emoji:"🧪",cat:"안정",req:{inquiry:60,creativity:55,emotion:45} },
];

const TITLES = [
  { name:"만능 천재",emoji:"🌟",check:(s,f)=>SK.every(k=>s[k]>=60) },
  { name:"한 우물 장인",emoji:"⛏️",check:(s)=>SK.some(k=>s[k]>=95) },
  { name:"덕후의 극치",emoji:"🔥",check:(s)=>SK.some(k=>s[k]>=95)&&SK.filter(k=>s[k]<=30).length>=6 },
  { name:"인싸 of 인싸",emoji:"🎉",check:(s)=>s.social>=95 },
  { name:"번아웃 생존자",emoji:"💪",check:(s,f)=>f.burnouts>=3 },
  { name:"자유영혼",emoji:"🦋",check:(s,f)=>f.neverRepeat },
  { name:"고집불통",emoji:"🪨",check:(s,f)=>f.maxConsecutiveClub>=10 },
  { name:"이벤트 헌터",emoji:"🎯",check:(s,f)=>f.eventCount>=12 },
  { name:"스트레스 제로",emoji:"😌",check:(s,f)=>f.maxStress<=30 },
  { name:"근성의 아이콘",emoji:"🏔️",check:(s,f)=>s.grit>=90&&f.burnouts>=1 },
  { name:"균형의 달인",emoji:"⚖️",check:(s)=>{const v=SK.map(k=>s[k]);return Math.max(...v)-Math.min(...v)<=15;} },
  { name:"늦깎이 대역전왕",emoji:"🔄",check:(s,f)=>f.topStatChanged },
  { name:"봉사왕",emoji:"🤲",check:(s,f)=>f.volunteerCount>=4 },
  { name:"체력 괴물",emoji:"🦁",check:(s)=>s.physical>=95 },
  { name:"숨겨진 재능",emoji:"💎",check:(s,f)=>f.hiddenEvents>=3 },
];

const CRITICAL_MSGS = [
  "오늘 컨디션이 최고예요!",
  "엄청난 집중력을 발휘했어요!",
  "모든 게 술술 풀리는 날이에요!",
  "숨겨진 재능이 빛을 발했어요!",
  "선생님도 깜짝 놀랄 정도의 실력이에요!",
  "기적 같은 하루였어요!",
  "노력이 빛나는 순간이에요!",
  "최고의 하루! 모든 게 완벽했어요!",
];

const FAIL_MSGS = [
  "오늘은 영 집중이 안 됐어요...",
  "컨디션이 별로인 하루였어요.",
  "뭔가 잘 안 풀리는 날이에요.",
  "피곤해서 효율이 떨어졌어요.",
  "잡념이 많아서 집중하기 어려웠어요.",
  "오늘은 좀 쉬어가야 할 것 같아요.",
  "실수가 잦은 하루였어요.",
  "기대만큼 결과가 나오지 않았어요.",
];

function getConditionMsg(stats, prevStats, stress, flags) {
  const msgs = [];
  for (const k of SK) {
    if (stats[k] >= 90 && prevStats[k] < 90) msgs.push(`${STAT_META[k].icon} ${STAT_META[k].name}의 달인이 되어가고 있어요!`);
    else if (stats[k] >= 70 && prevStats[k] < 70) msgs.push(`${STAT_META[k].icon} ${STAT_META[k].name} 실력이 눈에 띄게 늘었어요!`);
    else if (stats[k] >= 50 && prevStats[k] < 50) msgs.push(`${STAT_META[k].icon} ${STAT_META[k].name}이 부쩍 늘었어요! 이대로 쭉 가요!`);
  }
  if (stress >= 60) msgs.push("요즘 좀 지쳐 보여요... 쉬어가는 건 어때요?");
  else if (stress >= 40 && stress < 60) msgs.push("살짝 피곤한 기색이 보여요.");
  if (stress === 0 && (flags.turn||0) > 10) msgs.push("스트레스 관리를 정말 잘하고 있어요! 👏");
  if ((flags.burnouts||0) >= 2) msgs.push("또 무리하면 안 돼요... 건강이 최고예요.");
  if ((flags.currentConsecutiveClub||0) >= 5) msgs.push("꾸준히 같은 활동을 하니 점점 전문가가 되어가요!");
  return msgs.length > 0 ? msgs[Math.floor(Math.random() * msgs.length)] : null;
}

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

function calcJobProgress(stats) {
  const progressList = [];
  for (const j of JOBS) {
    const reqs = Object.entries(j.req);
    if (reqs.length === 0) continue;
    let totalReq = 0;
    let metReq = 0;
    const missing = [];
    for (const [k, reqVal] of reqs) {
      totalReq += reqVal;
      const currentVal = stats[k] || 10;
      metReq += Math.min(currentVal, reqVal);
      if (currentVal < reqVal) {
        missing.push({ key: k, amount: reqVal - currentVal });
      }
    }
    const percentage = Math.round((metReq / totalReq) * 100);
    progressList.push({
      name: j.name,
      emoji: j.emoji,
      cat: j.cat,
      percentage,
      missing,
    });
  }
  let upcoming = progressList.filter(p => p.percentage < 100);
  upcoming.sort((a, b) => b.percentage - a.percentage);
  if (upcoming.length === 0) {
    upcoming = progressList.sort((a, b) => b.percentage - a.percentage);
  }
  return upcoming.slice(0, 2);
}

function getPeerEvaluations(G) {
  const { stats, stress, hiddenEvents = 0, volunteerCount = 0, maxConsecutiveClub = 0 } = G;
  
  let teacher = "매사에 성실하고 학교 규칙을 잘 지킵니다. 앞으로 더 멋지게 성장할 것 같아요.";
  if (stress >= 75) {
    teacher = "요즘 공부 때문에 스트레스를 너무 많이 받는 것 같아요. 건강을 위해 조금 쉬어 가며 공부하길 권합니다.";
  } else if (stats.academic >= 80) {
    teacher = "공부를 아주 열심히 해서 시험을 매번 다 맞아요. 우리 반 친구들이 모두 본받고 싶어 하는 모범생이군요!";
  } else if (stats.academic >= 50) {
    teacher = "이해력이 빠르고 공부 실력이 우수해요. 집중해서 공부하는 모습이 예쁩니다.";
  } else if (stats.inquiry >= 55) {
    teacher = "자연 관찰 숙제나 탐구 활동을 할 때 집중력이 정말 뛰어나요. 과학적 재능이 돋보입니다.";
  } else if (stats.social >= 60) {
    teacher = "친구들과 사이좋게 잘 지내고 양보를 잘해요. 반 친구들이 모두 좋아하는 착한 어린이입니다.";
  } else if (stats.physical >= 70) {
    teacher = "몸이 튼튼하고 운동 신경이 뛰어나 체육 시간마다 적극적으로 참여합니다. 무척 건강해요.";
  } else if (stats.creativity >= 60) {
    teacher = "기발하고 재밌는 생각을 잘해서 미술이나 음악 시간에 나만의 멋진 작품을 만들어내요.";
  }
  
  let parent = "우리 아이가 건강하고 밝게만 자라주면 좋겠구나.";
  if (stress >= 80) {
    parent = "얘야, 얼굴이 반쪽이 되었구나... 공부도 좋지만 가끔은 놀이터에서 신나게 놀고 푹 쉬렴.";
  } else if (stress >= 50) {
    parent = "우리 아들/딸, 너무 피곤해 보여서 걱정이구나. 힘내라고 맛있는 간식 챙겨줄게.";
  } else if (stats.grit >= 75) {
    parent = "포기하지 않고 힘든 일도 끝까지 해내는 모습이 정말 대견하고 자랑스럽단다.";
  } else if (stats.emotion >= 60) {
    parent = "친구를 위로해 줄 줄 아는 예쁜 마음씨를 가졌구나. 우리 집의 보물이야!";
  } else if (stats.academic >= 70) {
    parent = "공부도 알아서 척척 하니 엄마 아빠는 걱정이 하나도 없단다. 최고야!";
  }
  
  let friend = "야! 매점 갈래? 이따 나랑 떡볶이 먹으러 가자!";
  if (stress >= 75) {
    friend = "너 요즘 피곤해 보여! 시험 끝나면 나랑 운동장에서 신나게 뛰어놀자!";
  } else if (stats.tech >= 60) {
    friend = "나중에 네가 갓겜(대박 게임) 만들면 나 테스터 꼭 시켜주라!";
  } else if (stats.physical >= 60) {
    friend = "너 달리기 진짜 빠르다! 이번 가을 운동회 이어달리기 주자는 무조건 너야!";
  } else if (stats.creativity >= 60) {
    friend = "너 기발한 생각 진짜 잘한다! 너랑 있으면 심심할 틈이 없어. 완전 상상력 천재야!";
  } else if (stats.social >= 70) {
    friend = "내 고민 잘 들어줘서 고마워. 너랑 단짝 친구가 되어서 정말 행복해!";
  } else if (stats.academic >= 75) {
    friend = "공부하다가 모르는 거 물어보면 쉽게 가르쳐줘서 고마워! 네 덕분에 이해가 쏙쏙 돼.";
  }
  
  let rumor = "옆 반 친구들: 걔는 매일 꾸준히 노력하는 성실한 친구래.";
  if (hiddenEvents >= 3) {
    rumor = `최근 모든 대회에서 1등 상장을 휩쓴 소년/소녀가 우리 학교에 다닌다는 소문이 돌아! 무려 ${hiddenEvents}번이나 대성공했대!`;
  } else if (stats.academic >= 85 && stats.physical >= 80) {
    rumor = "라이벌: 공부도 1등이고 운동도 잘하는 사기 캐릭터... 약점이 대체 뭐지?";
  } else if (SK.every(k => stats[k] >= 50)) {
    rumor = "학급 친구들: 걔는 공부, 미술, 운동까지 다 잘하는 만능 해결사야.";
  } else if (maxConsecutiveClub >= 6) {
    rumor = "동아리 친구들: 걔는 방과후 활동에 정말 진심이야. 없어서는 안 될 핵심 멤버야!";
  } else if (volunteerCount >= 3) {
    rumor = "선생님들 소문: OO이가 봉사활동을 정말 많이 다녀서 봉사상을 받을 후보 1순위라더라.";
  } else if (SK.some(k => stats[k] >= 90)) {
    const bestStatKey = SK.reduce((a, b) => stats[a] >= stats[b] ? a : b);
    rumor = `학생들 소문: 걔는 다른 건 몰라도 ${STAT_META[bestStatKey].name} 하나만큼은 학교 최고라 아무도 못 이긴대.`;
  }
  
  return { teacher, parent, friend, rumor };
}

function getCurrentStateLabel(G) {
  const { stats, stress } = G;
  if (stress >= 80) return "💥 많이 지쳤어요 (꼭 쉬어야 해요)";
  if (stress >= 50) return "😰 피로 누적 (쉬엄쉬엄 하세요)";
  if (stats.academic >= 70 && stats.inquiry >= 70) return "🔬 미래의 과학자 꿈나무";
  if (stats.academic >= 60 && stats.grit >= 60) return "🔥 끝까지 포기하지 않는 공부 벌레";
  if (stats.physical >= 75) return "🦁 운동장 골목대장 체력왕";
  if (stats.tech >= 75) return "💻 미래의 천재 프로그래머";
  if (stats.creativity >= 70 || stats.emotion >= 70) return "🎨 꿈꾸는 꼬마 예술가";
  if (stats.social >= 75) return "🎉 친구들 사이의 핵인싸";
  const vals = SK.map(k=>stats[k]);
  const diff = Math.max(...vals) - Math.min(...vals);
  if (diff <= 15 && SK.every(k => stats[k] >= 30)) return "⚖️ 뭐든지 다 잘하는 모범생";
  return "🌱 꿈이 쑥쑥 자라는 꿈나무";
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

const STAT_DESCS = {
  academic: {
    desc: "어려운 수학 문제나 국어 글쓰기를 척척 잘해내는 공부하고 생각하는 힘이에요.",
    jobs: "의사, 과학자, 변호사, 약사, 교사 등 전문직 분야"
  },
  physical: {
    desc: "오래 달리기나 운동회 때 지치지 않고 씩씩하게 활동하는 힘이에요.",
    jobs: "프로 운동선수, 소방관, 경찰/군인, 탐험가 등"
  },
  creativity: {
    desc: "새로운 그림을 그리거나 기발하고 재미있는 생각을 해내는 상상력이에요.",
    jobs: "디자이너, 웹툰 작가, 영화감독, 요리사 등 창작 분야"
  },
  social: {
    desc: "친구들과 사이좋게 양보하고, 대화를 잘 나누는 사교 실력이에요.",
    jobs: "외교관, 교사, 기업가, 유튜버, 기자 등 소통 분야"
  },
  inquiry: {
    desc: "식물이나 곤충을 자세히 관찰하고 신기한 현상에 질문을 던지는 태도예요.",
    jobs: "과학자, 인공지능(AI) 개발자, 동물병원 의사, 로봇 과학자 등"
  },
  tech: {
    desc: "타자 빠르게 치기, 컴퓨터 다루기 및 블록 코딩(엔트리/스크래치) 실력이에요.",
    jobs: "컴퓨터 프로그래머, 게임 개발자, 인공지능(AI) 개발자, 빅데이터 분석가 등"
  },
  emotion: {
    desc: "예술 작품에 감동하거나 친구가 속상할 때 위로해 주는 예쁜 마음씨예요.",
    jobs: "음악가, 동물병원 의사, 간호사, 요리사 등 따뜻한 마음 분야"
  },
  grit: {
    desc: "포기하지 않고 힘든 일도 끝까지 해내는 인내심이에요.",
    jobs: "e스포츠 선수, 변호사, 기업가, 웹툰 작가 등"
  }
};

const StatBars = ({ stats, stress, compact }) => {
  const [expanded, setExpanded] = useState(null);

  return (
    <div style={{ display:"grid", gridTemplateColumns: compact?"1fr 1fr":"1fr", gap: compact?6:8 }}>
      {SK.map(k=>{
        const isExp = expanded === k;
        return (
          <div key={k} style={{ fontSize:12 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:2 }}>
              <span 
                onClick={() => setExpanded(isExp ? null : k)} 
                style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontWeight: isExp ? 700 : 400, color: isExp ? STAT_META[k].color : P.text, transition: "all .2s" }}
              >
                {STAT_META[k].icon} {STAT_META[k].name}
                <span style={{ fontSize: 9, opacity: 0.5, marginLeft: 2 }}>{isExp ? "▲" : "▼"}</span>
              </span>
              <span style={{color:P.muted}}>{stats[k]}</span>
            </div>
            <div style={{ height:6, background:"rgba(255,255,255,.08)", borderRadius:3, overflow:"hidden", marginBottom: isExp ? 6 : 0 }}>
              <div style={{ width:`${stats[k]}%`, height:"100%", background:STAT_META[k].color, borderRadius:3, transition:"width .5s" }} />
            </div>
            {isExp && STAT_DESCS[k] && (
              <div style={{
                background: "rgba(255,255,255,0.03)",
                borderLeft: `3px solid ${STAT_META[k].color}`,
                borderRadius: "0 6px 6px 0",
                padding: "8px 10px",
                fontSize: "11px",
                color: P.muted,
                lineHeight: "1.4",
                marginBottom: 6,
                animation: "fadeIn 0.2s ease"
              }}>
                <div style={{ color: P.text, fontWeight: 600, marginBottom: 2 }}>{STAT_DESCS[k].desc}</div>
                <div>🎯 관련 진로: <span style={{ color: P.gold }}>{STAT_DESCS[k].jobs}</span></div>
              </div>
            )}
          </div>
        );
      })}
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
};

const GlassCard = ({ children, accent, onClick, selected, style:s }) => (
  <div onClick={onClick} style={{
    background: selected ? accent+"22" : "rgba(255,255,255,.04)", border:`1px solid ${selected?accent:P.border}`,
    borderRadius:12, padding:"12px 16px", cursor: onClick?"pointer":"default", transition:"all .2s", ...s,
  }}>{children}</div>
);

function StudentAvatar({ gender = "male", stats, stress, school, width = 120, height = 120 }) {
  const isHighAcademic = stats.academic >= 50 || stats.inquiry >= 50;
  const isHighPhysical = stats.physical >= 50;
  const isHighTech = stats.tech >= 50;
  const isHighArt = stats.creativity >= 50 || stats.emotion >= 50;
  const isHighGrit = stats.grit >= 50;

  // Determine image URL - แยกเป็น 3 ช่วงอารมณ์: happy (stress < 30), normal (30 <= stress < 60), sad (stress >= 60)
  let expr = "normal";
  if (stress < 30) expr = "happy";
  else if (stress >= 60) expr = "sad";
  
  const imgPath = `/assets/avatar/${gender}_${school}_${expr}.png`;

  return (
    <div style={{ position: "relative", width, height, borderRadius: "50%", overflow: "visible", display: "flex", justifyContent: "center", alignItems: "center" }}>
      {/* 1. Grit Flame Aura (behind) */}
      {isHighGrit && (
        <svg width={width * 1.3} height={height * 1.3} viewBox="0 0 120 120" style={{ position: "absolute", zIndex: 1, pointerEvents: "none", transform: "scale(1.25)" }}>
          <defs>
            <radialGradient id="gritFlame" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="gritFlameInner" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#facc15" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
            </radialGradient>
          </defs>
          <g opacity="0.8">
            <path d="M 20 80 Q 5 -10 60 10 Q 115 -10 100 80 Z" fill="url(#gritFlame)" opacity="0.6" />
            <path d="M 30 80 Q 20 15 60 25 Q 100 15 90 80 Z" fill="url(#gritFlameInner)" opacity="0.8" />
          </g>
        </svg>
      )}

      {/* 2. Base Character Image */}
      <img 
        src={imgPath} 
        alt="Student Avatar" 
        style={{ 
          width: "100%", 
          height: "100%", 
          objectFit: "cover", 
          borderRadius: "50%", 
          border: `2.5px solid ${stress >= 80 ? P.red : P.accent}`,
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          zIndex: 2,
          position: "relative"
        }} 
      />

      {/* 3. Stat Accessories Overlay (SVG) */}
      {(isHighAcademic || isHighPhysical || isHighTech || isHighArt) && (
        <svg width="100%" height="100%" viewBox="0 0 120 120" style={{ position: "absolute", top: 0, left: 0, zIndex: 3, pointerEvents: "none" }}>
          {/* A. Athletic Sweatband (Physical) */}
          {isHighPhysical && (
            <g transform="translate(0, 10)">
              <path d="M 33 37 Q 60 28 87 37 Q 88 41 87 45 Q 60 36 33 45 Z" fill="#ef4444" stroke="#dc2626" strokeWidth="1" />
              <path d="M 35 41 Q 60 32 85 41" stroke="#ffffff" strokeWidth="2.5" fill="none" />
            </g>
          )}

          {/* B. Smart Glasses (Academic / Inquiry) */}
          {isHighAcademic && (
            <g stroke="#334155" strokeWidth="3.5" fill="none" strokeLinecap="round" transform="translate(0, 5)">
              <circle cx="46" cy="58" r="11" fill="rgba(255,255,255,0.15)" stroke="#334155" />
              <circle cx="74" cy="58" r="11" fill="rgba(255,255,255,0.15)" stroke="#334155" />
              <path d="M 57 58 L 63 58" />
              <path d="M 35 58 Q 30 54 26 50" />
              <path d="M 85 58 Q 90 54 94 50" />
            </g>
          )}

          {/* C. Artist Beret (Creativity / Emotion) */}
          {isHighArt && (
            <g transform="translate(0, 2)">
              <path d="M 32 30 Q 18 12 60 8 Q 102 12 88 30 Q 75 22 60 23 Q 45 22 32 30" fill="#a78bfa" stroke="#8b5cf6" strokeWidth="1" />
              <path d="M 60 8 L 60 2" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round" />
            </g>
          )}

          {/* D. Programmer Headphones (Tech) */}
          {isHighTech && (
            <g transform="translate(0, 8)">
              <path d="M 32 45 Q 60 18 88 45" stroke="#06b6d4" strokeWidth="4" fill="none" />
              <rect x="21" y="45" width="9" height="20" rx="4" fill="#0891b2" />
              <rect x="18" y="48" width="4" height="14" rx="2" fill="#22d3ee" />
              <rect x="90" y="45" width="9" height="20" rx="4" fill="#0891b2" />
              <rect x="98" y="48" width="4" height="14" rx="2" fill="#22d3ee" />
            </g>
          )}
        </svg>
      )}
    </div>
  );
}

const SchoolBgDecor = ({ school }) => {
  if (school === "elementary") {
    return (
      <div style={{ width: "100%", height: 60, borderRadius: 12, overflow: "hidden", position: "relative", marginBottom: 12, background: "linear-gradient(to right, #38bdf8, #bae6fd)" }}>
        <svg width="100%" height="100%" viewBox="0 0 400 60" preserveAspectRatio="none" style={{ position: "absolute", bottom: 0, left: 0 }}>
          <circle cx="350" cy="15" r="10" fill="#fbbf24" opacity="0.8" />
          <path d="M -20 60 Q 80 40 180 55 Q 280 42 420 60 L 420 80 L -20 80 Z" fill="#4ade80" />
          <path d="M 100 60 Q 200 45 300 58 Q 380 48 440 60 L 440 80 L 100 80 Z" fill="#22c55e" opacity="0.7" />
          <path d="M 40 25 Q 50 15 60 25 Q 70 15 80 25 Q 90 25 80 32 L 40 32 Z" fill="#ffffff" opacity="0.6" />
          <path d="M 47 48 Q 44 40 40 40 Q 44 40 47 46" stroke="#facc15" strokeWidth="2" fill="none" />
          <path d="M 47 48 Q 50 38 54 39 Q 50 40 47 46" stroke="#facc15" strokeWidth="2" fill="none" />
          <text x="15" y="37" fill="#0f172a" fontWeight="800" fontSize="16" fontFamily="sans-serif">🎒 초등학교</text>
        </svg>
      </div>
    );
  }
  if (school === "middle") {
    return (
      <div style={{ width: "100%", height: 60, borderRadius: 12, overflow: "hidden", position: "relative", marginBottom: 12, background: "linear-gradient(to right, #6366f1, #a5b4fc)" }}>
        <svg width="100%" height="100%" viewBox="0 0 400 60" preserveAspectRatio="none" style={{ position: "absolute", bottom: 0, left: 0 }}>
          <path d="M 300 20 Q 310 10 320 20 Q 330 10 340 20 Q 350 20 340 27 L 300 27 Z" fill="#ffffff" opacity="0.5" />
          <rect x="20" y="30" width="80" height="30" fill="#cbd5e1" opacity="0.4" />
          <rect x="80" y="15" width="30" height="45" fill="#94a3b8" opacity="0.5" />
          <path d="M 80 15 L 95 2 L 110 15 Z" fill="#ef4444" />
          <circle cx="95" cy="10" r="3" fill="#ffffff" />
          <rect x="0" y="52" width="420" height="8" fill="#475569" />
          <text x="15" y="37" fill="#ffffff" fontWeight="800" fontSize="16" fontFamily="sans-serif">📘 중학교</text>
        </svg>
      </div>
    );
  }
  return (
    <div style={{ width: "100%", height: 60, borderRadius: 12, overflow: "hidden", position: "relative", marginBottom: 12, background: "linear-gradient(to right, #1e1b4b, #312e81)" }}>
      <svg width="100%" height="100%" viewBox="0 0 400 60" preserveAspectRatio="none" style={{ position: "absolute", bottom: 0, left: 0 }}>
        <circle cx="40" cy="15" r="1" fill="#ffffff" />
        <circle cx="120" cy="10" r="1.5" fill="#fef08a" />
        <circle cx="200" cy="22" r="1" fill="#ffffff" />
        <circle cx="340" cy="12" r="1.2" fill="#ffffff" opacity="0.8" />
        <circle cx="380" cy="25" r="1" fill="#ffffff" />
        <path d="M 280 8 Q 288 8 290 15 Q 284 19 278 14 Q 275 8 280 8 Z" fill="#fbbf24" opacity="0.9" />
        <rect x="50" y="25" width="90" height="35" fill="#475569" opacity="0.4" />
        <rect x="110" y="18" width="50" height="42" fill="#334155" opacity="0.6" />
        <rect x="120" y="25" width="6" height="6" fill="#fef08a" opacity="0.7" />
        <rect x="135" y="25" width="6" height="6" fill="#fef08a" opacity="0.7" />
        <rect x="120" y="37" width="6" height="6" fill="#ffffff" opacity="0.5" />
        <rect x="135" y="37" width="6" height="6" fill="#fef08a" opacity="0.7" />
        <circle cx="200" cy="45" r="12" fill="#ec4899" opacity="0.4" />
        <circle cx="212" cy="48" r="8" fill="#f43f5e" opacity="0.3" />
        <rect x="0" y="54" width="420" height="6" fill="#1e293b" />
        <text x="15" y="37" fill="#fef08a" fontWeight="800" fontSize="16" fontFamily="sans-serif">🎓 고등학교</text>
      </svg>
    </div>
  );
};

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
  const [gender, setGender] = useState("male");
  return (
    <div style={{ maxWidth:400, margin:"40px auto" }}>
      <h2 style={{ color:P.accent, fontSize:22, marginBottom:24 }}>🎒 새 게임 시작</h2>
      <div style={{ marginBottom:20 }}>
        <label style={{ fontSize:13, color:P.muted, display:"block", marginBottom:6 }}>이름을 입력하세요</label>
        <input value={name} onChange={e=>setName(e.target.value)} maxLength={8} placeholder="홍길동"
          style={{ width:"100%", padding:"12px 16px", borderRadius:10, border:`1px solid ${P.border}`, background:P.card, color:P.text, fontSize:16, outline:"none", boxSizing:"border-box" }} />
      </div>
      <div style={{ marginBottom:20 }}>
        <label style={{ fontSize:13, color:P.muted, display:"block", marginBottom:8 }}>성별 선택</label>
        <div style={{ display:"flex", gap:8 }}>
          {[{id:"male",label:"👦 남학생"},{id:"female",label:"👧 여학생"}].map(g=>(
            <GlassCard key={g.id} selected={gender===g.id} accent={P.accent} onClick={()=>setGender(g.id)} style={{flex:1,textAlign:"center"}}>
              <div style={{ fontWeight:700, fontSize:15, color: gender===g.id?P.accent:P.text }}>{g.label}</div>
            </GlassCard>
          ))}
        </div>
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
      <Btn onClick={()=>onStart(name||"학생",mode||"normal",slot,gender)} disabled={!mode} full color={P.gold}>
        🚀 입학하기!
      </Btn>
    </div>
  );
}

function ScheduleScreen({ G, turnInfo, onConfirm }) {
  const [cls, setCls] = useState(null);
  const [club, setClub] = useState(null);
  const [vac, setVac] = useState(null);
  const [activeTab, setActiveTab] = useState("schedule"); // "schedule" | "profile"
  const mult = G.mode === "fast" ? 1.8 : 1;

  const availClasses = CLASSES.filter(c => !c.school || (c.school==="middle" && turnInfo.year>=7));
  const availClubs = CLUBS.filter(c => !c.school || (c.school==="middle" && turnInfo.year>=7));
  const availVacs = VACATIONS.filter(v => !v.school || (v.school==="middle" && turnInfo.year>=7));

  const isVac = turnInfo.isVacation;

  const renderEff = (eff, stressD=0) => {
    const parts = [];
    for (const k of SK) if (eff[k]) {
      const val = Math.round(eff[k]*mult);
      parts.push(`${STAT_META[k].icon} ${STAT_META[k].name} ${val>0?"+":""}${val}`);
    }
    if (stressD) {
      parts.push(`😰 스트레스 ${stressD>0?"+":""}${stressD}`);
    }
    return (
      <span style={{ fontSize:10, color:P.muted, display:"flex", gap:"6px", flexWrap:"wrap", marginTop:"2px" }}>
        {parts.map((p, i) => (
          <span key={i} style={{ whiteSpace:"nowrap" }}>{p}</span>
        ))}
      </span>
    );
  };

  const peerQuotes = getPeerEvaluations(G);
  const careerProgress = calcJobProgress(G.stats);

  return (
    <div>
      {/* School Background Decoration */}
      <SchoolBgDecor school={turnInfo.school} />

      {/* Main Game Header Card */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16, background:"rgba(255,255,255,.02)", padding:"12px 16px", borderRadius:12, border:`1px solid ${P.border}` }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <StudentAvatar gender={G.gender} stats={G.stats} stress={G.stress} school={turnInfo.school} width={48} height={48} />
          <div>
            <div style={{ fontSize:12, color:P.muted }}>{turnInfo.label} {turnInfo.grade}학년 · {turnInfo.semLabel}</div>
            <div style={{ fontSize:15, fontWeight:700, color:P.gold }}>{G.name}</div>
          </div>
        </div>
        <div style={{ textAlign:"right" }}>
          <div style={{ fontSize:12, color:P.muted }}>턴 {G.turn+1}/{G.mode==="fast"?24:48}</div>
          <div style={{ fontSize:12, fontWeight:700, color:P.accent }}>{G.mode === "fast" ? "⚡ 빠른 모드" : "📚 기본 모드"}</div>
        </div>
      </div>

      {/* Tab Menu */}
      <div style={{ display:"flex", gap:8, marginBottom:16 }}>
        <button onClick={() => setActiveTab("schedule")} style={{
          flex: 1, padding: "10px 0", borderRadius: 10, border: "none",
          background: activeTab === "schedule" ? P.accent + "22" : "rgba(255,255,255,0.02)",
          color: activeTab === "schedule" ? P.accent : P.muted,
          fontWeight: 700, fontSize: 13, cursor: "pointer",
          borderBottom: `2px solid ${activeTab === "schedule" ? P.accent : "transparent"}`,
          transition: "all .2s"
        }}>📅 활동 계획</button>
        
        <button onClick={() => setActiveTab("profile")} style={{
          flex: 1, padding: "10px 0", borderRadius: 10, border: "none",
          background: activeTab === "profile" ? P.accent + "22" : "rgba(255,255,255,0.02)",
          color: activeTab === "profile" ? P.accent : P.muted,
          fontWeight: 700, fontSize: 13, cursor: "pointer",
          borderBottom: `2px solid ${activeTab === "profile" ? P.accent : "transparent"}`,
          transition: "all .2s"
        }}>👥 주변인 평가</button>
      </div>

      {activeTab === "schedule" ? (
        <div style={{ animation: "fadeIn .3s ease" }}>
          <div style={{ marginBottom:16 }}>
            <StatBars stats={G.stats} stress={G.stress} compact />
          </div>

          {!isVac ? (
            <>
              <h3 style={{ fontSize:14, color:P.accent, margin:"16px 0 8px" }}>📚 수업 선택</h3>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6, marginBottom:12 }}>
                {availClasses.map(c=>(
                  <GlassCard key={c.id} selected={cls===c.id} accent={P.accent} onClick={()=>setCls(c.id)}>
                    <div style={{ fontWeight:600, fontSize:13, color:cls===c.id?P.accent:P.text }}>{c.name}</div>
                    {renderEff(c.eff)}
                  </GlassCard>
                ))}
              </div>
              <h3 style={{ fontSize:14, color:P.green, margin:"16px 0 8px" }}>🎯 방과후 활동</h3>
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
              <h3 style={{ fontSize:14, color:P.gold, margin:"16px 0 8px" }}>🌴 방학 활동 선택</h3>
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
      ) : (
        <div style={{ animation: "fadeIn .3s ease" }}>
          {/* Large Avatar view */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "16px 0", background: "rgba(255,255,255,.02)", borderRadius: 12, border: `1px solid ${P.border}`, marginBottom: 16 }}>
            <StudentAvatar gender={G.gender} stats={G.stats} stress={G.stress} school={turnInfo.school} width={100} height={100} />
            <div style={{ fontSize: 18, fontWeight: 800, color: P.gold }}>{G.name}</div>
            <div style={{ fontSize: 13, background: P.card, padding: "4px 12px", borderRadius: 20, border: `1px solid ${P.border}`, color: G.stress >= 80 ? P.red : P.accent, fontWeight: 700 }}>
              {getCurrentStateLabel(G)}
            </div>
          </div>

          {/* Peer Quotes */}
          <h3 style={{ fontSize:14, color:P.accent, margin:"16px 0 8px" }}>💬 주변인들의 한마디</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
            {Object.entries(peerQuotes).map(([key, quote]) => {
              const titles = { teacher: "👩‍🏫 담임 선생님", parent: "🏠 부모님", friend: "🎒 단짝 친구", rumor: "📢 학교 소문" };
              const borderColors = { teacher: P.accent, parent: P.pink, friend: P.green, rumor: P.gold };
              return (
                <GlassCard key={key} accent={borderColors[key]} style={{ padding: "12px 14px" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: borderColors[key], marginBottom: 4 }}>{titles[key]}</div>
                  <div style={{ fontSize: 13, color: P.text, lineHeight: 1.5 }}>"{quote}"</div>
                </GlassCard>
              );
            })}
          </div>

          {/* Career recommendations */}
          <h3 style={{ fontSize:14, color:P.gold, margin:"16px 0 8px" }}>🎯 장래 희망 분석 (발전 가능성)</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
            {careerProgress.map((p, idx) => (
              <GlassCard key={idx} accent={P.gold} style={{ padding: "12px 14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: P.text }}>{p.emoji} {p.name} <span style={{ fontSize:10, color:P.muted, fontWeight:400 }}>({p.cat})</span></span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: P.gold }}>적합도 {p.percentage}%</span>
                </div>
                <div style={{ height: 6, background: "rgba(255,255,255,.08)", borderRadius: 3, overflow: "hidden", marginBottom: 8 }}>
                  <div style={{ width: `${p.percentage}%`, height: "100%", background: P.gold, borderRadius: 3 }} />
                </div>
                <div style={{ fontSize: 11, color: P.muted, lineHeight: 1.4 }}>
                  {p.missing.length > 0 ? (
                    <>
                      💡 성장 과제: {p.missing.map(m => `${STAT_META[m.key].icon}${STAT_META[m.key].name} +${m.amount}`).join(", ")}
                    </>
                  ) : (
                    "✨ 이미 장래 희망 요구 조건을 완벽히 달성했습니다!"
                  )}
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ResultScreen({ result, turnInfo, G, onContinue }) {
  const { changes, rollType, rollMsg, activityMsgs, conditionMsg } = result;
  const rollColors = { critical: P.gold, normal: P.accent, fail: P.orange };
  const rollLabels = { critical: "🌟 대성공!", normal: "📊 결과", fail: "😅 부진..." };

  return (
    <div style={{ textAlign:"center", paddingTop:20 }}>
      <div style={{ fontSize:14, color:P.muted, marginBottom:8 }}>{turnInfo.label} {turnInfo.grade}학년 · {turnInfo.semLabel}</div>
      <h2 style={{ fontSize:20, color:rollColors[rollType], margin:"0 0 12px", animation:rollType==="critical"?"pop .5s ease":undefined }}>{rollLabels[rollType]}</h2>

      {/* Dynamic Avatar display on turn result */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
        <StudentAvatar gender={G.gender} stats={G.stats} stress={G.stress} school={turnInfo.school} width={90} height={90} />
      </div>

      {rollMsg && (
        <div style={{ padding:"10px 16px", background:rollType==="critical"?P.gold+"18":P.orange+"18", borderRadius:10, border:`1px solid ${rollColors[rollType]}44`, marginBottom:12, fontSize:14, color:rollColors[rollType], fontWeight:600, animation:"fadeIn .5s ease" }}>
          {rollMsg}
        </div>
      )}

      {activityMsgs && activityMsgs.length > 0 && (
        <div style={{ marginBottom:16 }}>
          {activityMsgs.map((msg, i) => (
            <div key={i} style={{ fontSize:13, color:P.text, marginBottom:4, lineHeight:1.6, animation:`fadeIn ${0.3+i*0.2}s ease` }}>💬 {msg}</div>
          ))}
        </div>
      )}

      <div style={{ display:"flex", flexWrap:"wrap", gap:8, justifyContent:"center", marginBottom:16 }}>
        {Object.entries(changes).filter(([,v])=>v!==0).map(([k,v])=>(
          <div key={k} style={{ padding:"8px 14px", background:v>0?(rollType==="critical"?"rgba(251,191,36,.12)":"rgba(52,211,153,.12)"):"rgba(248,113,113,.12)", borderRadius:10, border:`1px solid ${v>0?(rollType==="critical"?P.gold:P.green):P.red}44` }}>
            <span style={{fontSize:13}}>{k==="stress"?"😰":STAT_META[k]?.icon} {k==="stress"?"스트레스":STAT_META[k]?.name}</span>
            <span style={{ marginLeft:6, fontWeight:700, color:v>0?(rollType==="critical"?P.gold:P.green):P.red }}>{v>0?"+":""}{v}{rollType==="critical"&&v>0&&k!=="stress"?" 🌟":""}</span>
          </div>
        ))}
      </div>

      {conditionMsg && (
        <div style={{ fontSize:13, color:P.muted, marginBottom:16, fontStyle:"italic", animation:"fadeIn .8s ease" }}>
          💡 {conditionMsg}
        </div>
      )}

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
            <div style={{ fontSize:11, color:P.muted, display:"flex", gap:"8px", flexWrap:"wrap", marginTop:"4px" }}>
              {Object.entries(c.eff).filter(([k])=>SK.includes(k)).map(([k,v])=>(
                <span key={k} style={{whiteSpace:"nowrap"}}>
                  {STAT_META[k].icon} {STAT_META[k].name} {v>0?"+":""}{Math.round(v*mult)}
                </span>
              ))}
              {c.stress ? (
                <span style={{whiteSpace:"nowrap"}}>
                  😰 스트레스 {c.stress>0?"+":""}{c.stress}
                </span>
              ) : null}
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
    <div style={{ textAlign:"center", paddingTop:20 }}>
      {phase === 0 && (
        <div><div style={{ fontSize:48, marginBottom:16 }}>🎓</div>
        <h2 style={{ fontSize:22, color:P.muted }}>졸업 후 10년...</h2></div>
      )}
      {phase >= 1 && (
        <div style={{ animation:"fadeIn .8s ease" }}>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <div style={{ fontSize:56 }}>{job.emoji}</div>
            <StudentAvatar gender={G.gender} stats={G.stats} stress={G.stress} school="high" width={90} height={90} />
          </div>
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
  const [turnResult, setTurnResult] = useState(null);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [milestoneSchool, setMilestoneSchool] = useState(null);
  const [endingData, setEndingData] = useState(null);

  const saveCurrentGame = useCallback((gameState) => {
    if (!gameState || gameState.slot == null) return;
    storageSet(`dreamclass:save${gameState.slot}`, gameState);
    setSaves(prev => { const n=[...prev]; n[gameState.slot] = gameState; return n; });
  }, []);

  const handleNew = () => setScreen("setup");

  const handleStart = (name, mode, slot, gender) => {
    const g = { name, mode, slot, gender, turn:0, stats:initStats(), stress:0, burnouts:0, seenEvents:[], volunteerCount:0, maxStress:0, eventCount:0, neverRepeat:true, lastActivity:null, maxConsecutiveClub:0, currentConsecutiveClub:0, lastClub:null, topStatElementary:null, topStatChanged:false, hiddenEvents:0 };
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
    const prevStats = { ...G.stats };
    let ns = { ...G.stats };
    let nStress = G.stress;

    // Roll type: 오늘의 운세 (턴당 1회) - 스트레스 수준에 따른 대성공(critical) 확률 변동
    let critChance = 0.10;
    if (G.stress < 30) critChance = 0.20; // 행복 상태 -> 20%
    else if (G.stress >= 80) critChance = 0.01; // 번아웃 위험 -> 1%
    else if (G.stress >= 60) critChance = 0.05; // 피곤 상태 -> 5%

    const roll = Math.random();
    const failChance = Math.max(0.02, 0.10 - (G.stats.grit || 10) * 0.001);
    let rollType = "normal";
    let variance;
    if (roll < critChance) { rollType = "critical"; variance = 1.5; }
    else if (roll > 1 - failChance) { rollType = "fail"; variance = 0.5; }
    else { variance = 0.7 + Math.random() * 0.6; } // 0.7 ~ 1.3

    const activityMsgs = [];

    if (clsId) {
      const cls = CLASSES.find(c=>c.id===clsId);
      const r = applyEffects(ns, nStress, cls.eff, 0, mult * variance);
      ns = r.stats; nStress = r.stress;
      if (cls.msgs) activityMsgs.push(cls.msgs[Math.floor(Math.random() * cls.msgs.length)]);
    }
    if (clubId) {
      const club = CLUBS.find(c=>c.id===clubId);
      const r = applyEffects(ns, nStress, club.eff, 0, mult * variance);
      ns = r.stats; nStress = r.stress;
      nStress = clamp(nStress + 1);
      if (club.msgs) activityMsgs.push(club.msgs[Math.floor(Math.random() * club.msgs.length)]);
    }
    if (vacId) {
      const vac = VACATIONS.find(v=>v.id===vacId);
      const r = applyEffects(ns, nStress, vac.eff, vac.stress||0, mult * variance);
      ns = r.stats; nStress = r.stress;
      if (vac.msgs) activityMsgs.push(vac.msgs[Math.floor(Math.random() * vac.msgs.length)]);
    }

    const changes = {};
    for (const k of SK) { const d = ns[k] - prevStats[k]; if (d) changes[k] = d; }
    const sd = nStress - G.stress; if (sd) changes.stress = sd;

    let rollMsg = null;
    if (rollType === "critical") rollMsg = CRITICAL_MSGS[Math.floor(Math.random() * CRITICAL_MSGS.length)];
    if (rollType === "fail") rollMsg = FAIL_MSGS[Math.floor(Math.random() * FAIL_MSGS.length)];

    const conditionMsg = getConditionMsg(ns, prevStats, nStress, G);

    let cc = G.currentConsecutiveClub||0, mc = G.maxConsecutiveClub||0;
    if (clubId && clubId === G.lastClub) { cc++; } else { cc = clubId ? 1 : 0; }
    mc = Math.max(mc, cc);

    let nr = G.neverRepeat;
    const actKey = clsId||vacId;
    if (actKey && actKey === G.lastActivity) nr = false;

    let vol = G.volunteerCount||0;
    if (vacId === "v6") vol++;

    let hid = G.hiddenEvents||0;
    if (rollType === "critical") hid++;

    const ng = { ...G, stats:ns, stress:nStress, maxStress:Math.max(G.maxStress||0, nStress), lastActivity:actKey, lastClub:clubId||G.lastClub, currentConsecutiveClub:cc, maxConsecutiveClub:mc, neverRepeat:nr, volunteerCount:vol, hiddenEvents:hid };

    const turnInfo = getTurnInfo(G.turn, G.mode);
    if (turnInfo.year === 6 && !G.topStatElementary) {
      ng.topStatElementary = SK.reduce((a,b)=>ns[a]>=ns[b]?a:b);
    }

    setG(ng);
    setTurnResult({ changes, rollType, rollMsg, activityMsgs, conditionMsg });
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
      {screen === "result" && G && <ResultScreen result={turnResult} turnInfo={turnInfo} G={G} onContinue={handleResultContinue} />}
      {screen === "event" && currentEvent && <EventScreen event={currentEvent} onChoice={handleEventChoice} mult={mult} />}
      {screen === "burnout" && G && <BurnoutScreen name={G.name} onContinue={handleBurnout} />}
      {screen === "milestone" && G && <MilestoneScreen school={milestoneSchool} name={G.name} stats={G.stats} onContinue={handleMilestoneContinue} />}
      {screen === "ending" && G && endingData && <EndingScreen G={G} job={endingData.job} titles={endingData.titles} collection={collection} onTitle={handleGoTitle} />}
      {screen === "collection" && <CollectionScreen collection={collection} onBack={()=>setScreen("title")} />}
    </div>
  );
}
