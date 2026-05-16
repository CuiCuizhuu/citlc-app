// ============================================================
//  teamup.js — 组队功能的模拟数据
// ============================================================

// 组队帖子：发布自己有空的时间，等待他人申请
export const INITIAL_POSTS = [
  {
    id: 'p1',
    author: '李雷',
    date: '05/03',
    timeFrom: '15:00',
    timeTo: '17:00',
    level: 'senior',
    type: 'singles',      // singles | doubles
    note: '找一个水平相当的单打对手，轻松练习为主',
    status: 'open',       // open | matched | closed
    applicants: [],
  },
  {
    id: 'p2',
    author: '王芳',
    date: '05/04',
    timeFrom: '10:00',
    timeTo: '12:00',
    level: 'regular',
    type: 'doubles',
    note: '双打组队，已有一名队友，再找两人凑齐四人',
    status: 'open',
    applicants: [],
  },
  {
    id: 'p3',
    author: '赵磊',
    date: '05/05',
    timeFrom: '14:00',
    timeTo: '16:00',
    level: 'diamond',
    type: 'singles',
    note: '正式比赛练习，希望对手有一定竞技水平',
    status: 'open',
    applicants: [],
  },
];

// 私信记录：{ id, participants:[A,B], messages:[{from, text, time}] }
export const INITIAL_CHATS = [
  {
    id: 'c1',
    participants: ['李雷', '陈志远'],
    postId: null,
    messages: [
      { from:'李雷',   text:'你好，我看你之前发过组队帖，周末有空吗？', time:'09:15' },
      { from:'陈志远', text:'有的！周六下午3点怎么样？', time:'09:18' },
      { from:'李雷',   text:'可以，那我们约 Court 1 吧', time:'09:20' },
    ],
  },
];
