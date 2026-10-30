(function (root) {
  'use strict';
  const clean = value => String(value ?? '').trim();
  const present = value => clean(value) !== '' && !/^[-–—]+$/.test(clean(value));
  const nameKey = value => clean(value).normalize('NFKC').replace(/[\s\u200B-\u200D\uFEFF.]/g, '').toLowerCase();
  const branchSlugs = {
    'Biology and Biotechnology': 'biology-biotechnology',
    'Chemistry/Health Science and Medicine': 'chemistry-health-medicine',
    'Digital and Computer Technology': 'digital-computer-technology',
    'Health Science and Medicine': 'health-science-medicine',
    'Materials Science': 'materials-science',
    'Mathematics and Statistics': 'mathematics-statistics',
    'Physics, Energy, and Astronomy': 'physics-energy-astronomy',
    'STEM and Engineering': 'stem-engineering'
  };
  function branchSlug(branch) {
    if (Object.hasOwn(branchSlugs, branch)) return branchSlugs[branch];
    const value = clean(branch);
    const stem = value.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'field';
    let hash = 2166136261;
    for (const character of value) hash = Math.imul(hash ^ character.codePointAt(0), 16777619) >>> 0;
    return stem + '-' + hash.toString(36);
  }
  const branchAliases = {
    'Biology and Biotechnology': 'ชีวะ ชีววิทยา ชีวภาพ ไบโอ bio biotech',
    'Chemistry/Health Science and Medicine': 'เคมี สุขภาพ แพทย์ chem chemistry medicine',
    'Digital and Computer Technology': 'คอม คอมพ์ คอมพิวเตอร์ ดิจิทัล ไอที computer computing IT digital',
    'Health Science and Medicine': 'สุขภาพ แพทย์ การแพทย์ หมอ health medicine medical',
    'Materials Science': 'วัสดุ วัสดุศาสตร์ materials',
    'Mathematics and Statistics': 'คณิต คณิตศาสตร์ สถิติ math maths stats statistics',
    'Physics, Energy, and Astronomy': 'ฟิสิกส์ พลังงาน ดาราศาสตร์ physics energy astronomy',
    'STEM and Engineering': 'สะเต็ม สเต็ม วิศวะ วิศวกรรม stem engineering'
  };
  const searchKey = value => clean(value).normalize('NFKC').toLowerCase()
    .replace(/[\u200B-\u200D\uFEFF]/g, '').replace(/[^\p{L}\p{M}\p{N}]+/gu, ' ').trim();
  function searchDirectory(directory, query, branchLabels = {}) {
    const tokens = searchKey(query).split(/\s+/).filter(Boolean);
    const matches = text => {
      const compact = searchKey(text).replace(/\s/g, '');
      return tokens.every(token => compact.includes(token));
    };
    const branchText = branch => [branch, branchLabels[branch] || '', branchAliases[branch] || ''].join(' ');
    return {
      active: tokens.length > 0,
      branches: directory.branches.filter(branch => matches(branchText(branch))),
      advisors: directory.advisors.filter(advisor => matches([
        'อาจารย์', advisor.name, branchText(advisor.branch), ...advisor.expertise
      ].join(' ')))
    };
  }
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
  function outlookCompose(advisor) {
    if (!advisor.emails.length) return '';
    return 'https://outlook.cloud.microsoft/mail/deeplink/compose?to=' + encodeURIComponent(advisor.emails.join(';'));
  }
  root.AdvisorCore = {normalize, nameKey, status, outlookCompose, branchSlug, searchDirectory};
  if (typeof module !== 'undefined') module.exports = root.AdvisorCore;
})(typeof window !== 'undefined' ? window : globalThis);
