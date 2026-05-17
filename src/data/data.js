// ============================================================
//  data.js — 球场、会员、预约数据（日期动态生成）
// ============================================================

export const COURTS = [
  { id: 1, name: 'Court 1', surfaceKey: 'hard',   typeKey: 'outdoor' },
  { id: 2, name: 'Court 2', surfaceKey: 'clay',   typeKey: 'outdoor' },
  { id: 3, name: 'Court 3', surfaceKey: 'indoor', typeKey: 'indoor'  },
  { id: 4, name: 'Court 4', surfaceKey: 'grass',  typeKey: 'indoor'  },
];

export const MEMBERS = {
  '李雷':   { level: 'senior',   phone: '138****8801', color: '#F7C1C1', text: '#7A1F1F' },
  '王芳':   { level: 'regular',  phone: '139****2234', color: '#FAC775', text: '#633806' },
  '陈志远': { level: 'senior',   phone: '135****6612', color: '#B5D4F4', text: '#0C447C' },
  '孙静':   { level: 'regular',  phone: '137****0091', color: '#F4C0D1', text: '#72243E' },
  '赵磊':   { level: 'diamond',  phone: '186****3345', color: '#C0DD97', text: '#27500A' },
};

export const TIME_SLOTS = [
  '08:00','09:00','10:00','11:00','12:00',
  '13:00','14:00','15:00','16:00','17:00','18:00','19:00',
];

// 动态日期工具
function getDate(daysFromNow) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${mm}/${dd}`;
}

// 初始预约数据 — 日期跟着真实日历走
export const INITIAL_BOOKINGS = [
  { court: 1, date: getDate(0), time: '09:00', dur: '1h', people: 2, modeKey: 'casual',   member: '李雷' },
  { court: 1, date: getDate(0), time: '11:00', dur: '2h', people: 4, modeKey: 'match',    member: '赵磊' },
  { court: 1, date: getDate(0), time: '17:00', dur: '1h', people: 2, modeKey: 'training', member: '王芳' },
  { court: 2, date: getDate(0), time: '08:00', dur: '2h', people: 4, modeKey: 'match',    member: '陈志远' },
  { court: 2, date: getDate(0), time: '10:00', dur: '1h', people: 2, modeKey: 'casual',   member: '孙静' },
  { court: 3, date: getDate(0), time: '09:00', dur: '1h', people: 2, modeKey: 'casual',   member: '王芳' },
  { court: 3, date: getDate(0), time: '13:00', dur: '2h', people: 4, modeKey: 'match',    member: '李雷' },
  { court: 4, date: getDate(0), time: '10:00', dur: '1h', people: 2, modeKey: 'casual',   member: '孙静' },
  { court: 4, date: getDate(0), time: '16:00', dur: '2h', people: 4, modeKey: 'match',    member: '陈志远' },
  { court: 2, date: getDate(1), time: '09:00', dur: '1h', people: 2, modeKey: 'training', member: '李雷' },
  { court: 3, date: getDate(1), time: '14:00', dur: '2h', people: 4, modeKey: 'match',    member: '王芳' },
];
