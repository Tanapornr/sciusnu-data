const assert = require('node:assert/strict');
const {normalize,mailto,status} = require('./core.js');
const fs = require('node:fs');
const fixture = {data:[['ชื่อ-สกุล'],['ดร.เอ','สาขา A','C','','E',null,'a@example.com, b@example.com','โครงงานไทย','English',null,null,'โครงงานสาม','Third'],['ดร.บี','สาขา B',null,null,null,null,'b@example.com','-']],schedule:[['วันพฤหัสบดี เวลา 13.00 - 16.00 น.'],[],['ชื่อ-สกุล','3 ธันวาคม 2569','17 ธันวาคม 2569','วันอื่น ๆ'],['ดร.บี','FALSE','TRUE','21/11/2025'],['ดร.เอ','TRUE','FALSE']]};
const result=normalize(fixture);
assert.deepEqual(result.advisors[0].expertise,['C','E']);
assert.equal(result.advisors[0].projects.length,2);
assert.equal(result.advisors[0].projects[1].en,'Third');
assert.equal(result.advisors[1].projects.length,0);
assert.equal(result.advisors[0].schedule[0].status,'available');
assert.equal(result.advisors[1].schedule[0].status,'unavailable');
assert.equal(result.advisors[1].schedule[2].note,'21/11/2025');
assert.equal(status(''),'unknown');
const url=mailto(result.advisors[0],{name:'นักเรียน & ทดสอบ',school:'โรงเรียน',email:'test@example.com',topic:'AI & Biology?',slot:'3 ธันวาคม 2569',message:'a+b%#'});
const params=new URLSearchParams(url.split('?')[1]);
assert.equal(params.get('subject'),'ขอนัดหมายปรึกษาโครงงาน: AI & Biology?');
assert.ok(params.get('body').includes('a+b%#'));
assert.ok(url.startsWith('mailto:a%40example.com,b%40example.com?'));
const missing=normalize({...fixture,schedule:[fixture.schedule[0],[],fixture.schedule[2]]});
assert.equal(missing.advisors[0].schedule[0].status,'unknown');
assert.equal(missing.advisors[0].scheduleMatched,false);
if(fs.existsSync('./data.json')){
  const real=normalize(JSON.parse(fs.readFileSync('./data.json','utf8')));
  assert.equal(real.advisors.length,36);assert.equal(real.branches.length,8);
  assert.ok(real.advisors.every(a=>a.scheduleMatched));
  assert.ok(real.advisors.every(a=>a.expertise.every(t=>t.trim())));
  console.log('Real sheet: 36 advisors, 8 branches, all schedules matched by name.');
}
console.log('Data mapping, sparse expertise, bilingual projects, schedule matching, missing values and mail encoding passed.');
