// ============================================================
//  club.js — 俱乐部信息，修改这里自定义你的球场
// ============================================================

export const CLUB_INFO = {
  name:    'Crazy in Love Tennis Club',
  short:   'CITLC',
  address: '地址填写这里，例如：上海市静安区某某路123号',
  phone:   '+86 138 0000 0000',
  email:   'contact@citlc.com',
  hours:   '每天 08:00 – 21:00',
  website: 'https://citlc-app.vercel.app',
};

// 球场安排 — 修改这里自定义球场信息
export const COURTS_INFO = [
  {
    id: 1,
    name: 'Court 1',
    surfaceKey: 'hard',
    typeKey: 'outdoor',
    features: ['灯光设施', '更衣室'],
    maxPeople: 4,
  },
  {
    id: 2,
    name: 'Court 2',
    surfaceKey: 'clay',
    typeKey: 'outdoor',
    features: ['灯光设施'],
    maxPeople: 4,
  },
  {
    id: 3,
    name: 'Court 3',
    surfaceKey: 'indoor',
    typeKey: 'indoor',
    features: ['空调', '灯光设施', '更衣室'],
    maxPeople: 4,
  },
  {
    id: 4,
    name: 'Court 4',
    surfaceKey: 'grass',
    typeKey: 'indoor',
    features: ['空调'],
    maxPeople: 4,
  },
];
