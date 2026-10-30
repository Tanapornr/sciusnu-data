(function (root) {
  'use strict';
  const clean = value => String(value ?? '').trim();
  const present = value => clean(value) !== '' && !/^[-–—]+$/.test(clean(value));
  const nameKey = value => clean(value).normalize('NFKC').replace(/[\s\u200B-\u200D\uFEFF.]/g, '').toLowerCase();
  function status(value) {
    const text = clean(value).toLowerCase();
    if (value === true || ['true', 'ว่าง', 'พร้อม', '1'].includes(text)) return 'available';
    if (value === false || ['false', 'ไม่ว่าง', '0'].includes(text)) return 'unavailable';
    return 'unknown';
  }
  function normalize(payload) {
    if (!Array.isArray(payload.data) || !Array.isArray(payload.schedule)) throw new Error('รูปแบบข้อมูลไม่ถูกต้อง');
    const rows = payload.schedule;
    const headerIndex = rows.findIndex(row => nameKey(row[0]) === nameKey('ชื่อ-สกุล'));
    if (headerIndex < 0) throw new Error('ไม่พบหัวตารางเวลา');
    const headers = rows[headerIndex];
    const scheduleMap = new Map();
    for (const row of rows.slice(headerIndex + 1)) {
      if (!present(row[0])) continue;
      const key = nameKey(row[0]);
      if (scheduleMap.has(key)) scheduleMap.set(key, null); // Ambiguous names must not borrow a schedule.
      else scheduleMap.set(key, row);
    }
    const advisors = payload.data.slice(1).flatMap((row, index) => {
      if (!present(row[0])) return [];
      const matched = scheduleMap.get(nameKey(row[0]));
      const projects = [7, 9, 11].flatMap(i => present(row[i]) || present(row[i + 1]) ? [{th: present(row[i]) ? clean(row[i]) : '', en: present(row[i+1]) ? clean(row[i+1]) : ''}] : []);
      const emails = clean(row[6]).split(/[,;\s]+/).filter(v => /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(v));
      return [{id: String(index + 2), name: clean(row[0]), branch: clean(row[1]) || 'ไม่ระบุสาขา', expertise: row.slice(2, 6).filter(present).map(clean), emails, projects,
        schedule: headers.slice(1).flatMap((label, i) => {
          if (!present(label)) return [];
          if (/วันอื่น/.test(label)) return [{label: clean(label), note: matched && present(matched[i+1]) ? clean(matched[i+1]) : '', other: true}];
          return [{label: clean(label), status: matched ? status(matched[i+1]) : 'unknown'}];
        }), scheduleMatched: !!matched}];
    });
    return {advisors, branches: [...new Set(advisors.map(a => a.branch))], scheduleTitle: clean(rows[0]?.[0]), fetchedAt: payload.fetchedAt || ''};
  }
  function mailto(advisor, fields) {
    if (!advisor.emails.length) return '';
    const subject = 'ขอนัดหมายปรึกษาโครงงาน: ' + clean(fields.topic);
    const body = ['เรียน ' + advisor.name, '', 'ข้าพเจ้า ' + clean(fields.name), 'โรงเรียน / ชั้นเรียน: ' + clean(fields.school), 'อีเมลติดต่อกลับ: ' + clean(fields.email), '', 'มีความประสงค์ขอนัดหมายเพื่อปรึกษาโครงงาน', 'หัวข้อ: ' + clean(fields.topic), 'วันและเวลาที่ต้องการ: ' + clean(fields.slot), '', clean(fields.message), '', 'กรุณายืนยันวันและเวลาที่สะดวกอีกครั้ง', 'ขอแสดงความนับถือ', clean(fields.name)].join('\r\n');
    return 'mailto:' + advisor.emails.map(encodeURIComponent).join(',') + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  }
  root.AdvisorCore = {normalize, nameKey, status, mailto};
  if (typeof module !== 'undefined') module.exports = root.AdvisorCore;
})(typeof window !== 'undefined' ? window : globalThis);
