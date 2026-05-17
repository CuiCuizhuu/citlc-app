// ============================================================
//  dates.js — 动态生成未来 7 天的日期，根据系统真实日期
// ============================================================

const WEEKDAYS = {
  zh: ['周日','周一','周二','周三','周四','周五','周六'],
  en: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
  de: ['So','Mo','Di','Mi','Do','Fr','Sa'],
  fr: ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'],
};

const TODAY_LABEL = {
  zh: '今天', en: 'Today', de: 'Heute', fr: "Aujourd'hui",
};
const TOMORROW_LABEL = {
  zh: '明天', en: 'Tomorrow', de: 'Morgen', fr: 'Demain',
};

export function getDates(lang = 'zh') {
  const days   = WEEKDAYS[lang] || WEEKDAYS.en;
  const today  = TODAY_LABEL[lang]    || 'Today';
  const tmrw   = TOMORROW_LABEL[lang] || 'Tomorrow';
  const result = [];

  for (let i = 0; i < 7; i++) {
    const d     = new Date();
    d.setDate(d.getDate() + i);

    const dd    = String(d.getDate()).padStart(2, '0');
    const mm    = String(d.getMonth() + 1).padStart(2, '0');
    const full  = `${mm}/${dd}`;
    const short = days[d.getDay()];
    const day   = i === 0 ? today : i === 1 ? tmrw : '';

    result.push({ day, short, num: dd, full });
  }

  return result;
}
