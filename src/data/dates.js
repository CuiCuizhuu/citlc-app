// ============================================================
//  dates.js — 动态生成未来 7 天的日期
// ============================================================

const WEEKDAYS = {
  zh: ['周日','周一','周二','周三','周四','周五','周六'],
  en: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
  de: ['So','Mo','Di','Mi','Do','Fr','Sa'],
  fr: ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'],
};

const TODAY_LABEL    = { zh:'今天', en:'Today',    de:'Heute', fr:"Aujourd'hui" };
const TOMORROW_LABEL = { zh:'明天', en:'Tomorrow', de:'Morgen', fr:'Demain'     };

export function getDates(lang = 'zh') {
  const days = WEEKDAYS[lang] || WEEKDAYS.en;
  const result = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + i);

    const dd   = String(d.getDate()).padStart(2, '0');
    const mm   = String(d.getMonth() + 1).padStart(2, '0');
    const full = `${mm}/${dd}`;           // 月/日，例如 05/17
    const short = days[d.getDay()];
    const day   = i === 0 ? TODAY_LABEL[lang]
                : i === 1 ? TOMORROW_LABEL[lang]
                : '';

    result.push({ day, short, num: dd, full });
  }

  return result;
}

// 今天的 full 值，用于判断"已完成"vs"即将开始"
export function getToday() {
  const d  = new Date();
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${mm}/${dd}`;
}
