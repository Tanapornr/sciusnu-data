(function(){
'use strict';
const $=s=>document.querySelector(s), esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const drawings={search:'<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/>',leaf:'<path d="M20 3C7 1 2 9 7 17s16 0 13-14ZM5 22 16 8M10 15v-5m0 5h5"/>',flask:'<path d="M9 2h6m-5 0v8L4 21h16l-6-11V2M7 15h10"/>',computer:'<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 22h8m-4-5v5m-5-12 3-3-3-3m6 6h4"/>',heart:'<path d="M12 21 3 12C-3 4 7-2 12 6c5-8 15-2 9 6ZM5 12h4l2-4 2 8 2-4h4"/>',cube:'<path d="m12 2 9 5v10l-9 5-9-5V7Zm0 10 9-5M3 7l9 5v10M7 5l10 5"/>',math:'<path d="M5 3h14M5 21h14M17 3 7 12l10 9M2 8h5m-2-2v4m13 5h4m-4 4h4"/>',atom:'<ellipse cx="12" cy="12" rx="10" ry="4"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)"/>',gear:'<path d="m9 2 1 4h4l1-4 4 3-2 3 2 3 3 1v4l-4 1-1 3-4-1-3 3-2-4H5l-1-4-2-1v-4l4-1 1-3-1-2Z"/><circle cx="12" cy="12" r="3"/>',doc:'<path d="M14 2H5v20h14V7Zm0 0v6h5M8 12h8m-8 4h8"/>',calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 2v6m10-6v6M3 11h18m-14 4h2m3 0h2"/>',mail:'<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m3 6 9 7 9-7"/>'};
const icon=k=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(drawings[k]||drawings.atom)+'</svg>';
const metadata={
'Biology and Biotechnology':['ชีววิทยาและเทคโนโลยีชีวภาพ','leaf','#e4f5ed','#258762'],
'Chemistry/Health Science and Medicine':['เคมีและวิทยาศาสตร์สุขภาพ','flask','#fff1e2','#cc8540'],
'Digital and Computer Technology':['ดิจิทัลและเทคโนโลยีคอมพิวเตอร์','computer','#e8f0ff','#3777dd'],
'Health Science and Medicine':['วิทยาศาสตร์สุขภาพและการแพทย์','heart','#fdebee','#c8637a'],
'Materials Science':['วัสดุศาสตร์','cube','#f0eafa','#8865bb'],
'Mathematics and Statistics':['คณิตศาสตร์และสถิติ','math','#e4f4f7','#3896a7'],
'Physics, Energy, and Astronomy':['ฟิสิกส์ พลังงาน และดาราศาสตร์','atom','#fff6d9','#bc9230'],
'STEM and Engineering':['สะเต็มศึกษาและวิศวกรรมศาสตร์','gear','#e6eeef','#527f86']};
const meta=b=>metadata[b]||[b,'atom','#e8f0ff','#3777dd'];
const box=b=>{const m=meta(b);return '<span class="icon-box" style="--tint:'+m[2]+';--accent:'+m[3]+'">'+icon(m[1])+'</span>';};
const branchHref=b=>'/branches/'+AdvisorCore.branchSlug(b), profileHref=a=>'/advisors/'+encodeURIComponent(a.id);
const tags=a=>a.expertise.length?'<div class="tags">'+a.expertise.map(t=>'<span class="tag">'+esc(t)+'</span>').join('')+'</div>':'<p class="muted">ยังไม่ได้ระบุความเชี่ยวชาญ</p>';
const avatar=a=>'<div class="avatar" aria-hidden="true">'+esc(Array.from(a.name.replace(/^(?:รศ\.|ผศ\.|ศ\.|ดร\.|ทพญ\.|ทนพ\.|ภญ\.|นสพ\.|เภสัชกรหญิง)+/g,'').trim()).slice(0,2).join(''))+'</div>';
let model,mode='live',refreshed='';
function toast(t){$('#toast').textContent=t;$('#toast').classList.add('visible');clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),5000);}
const campus='<svg class="hero-art" viewBox="0 0 760 460" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="sky" x2="0" y2="1"><stop stop-color="#d6e8fc"/><stop offset="1" stop-color="#f0f6fb"/></linearGradient><linearGradient id="glass" x2="1" y2="1"><stop stop-color="#b7d2e5"/><stop offset="1" stop-color="#6893ad"/></linearGradient><pattern id="windows" width="43" height="47" patternUnits="userSpaceOnUse"><rect width="30" height="33" x="5" y="6" fill="url(#glass)"/><path d="M20 6v33" stroke="#e4edf2" stroke-width="2"/></pattern></defs><rect width="760" height="460" fill="url(#sky)"/><circle cx="568" cy="70" r="51" fill="#ffffff80"/><path d="M60 400 760 320v140H0Z" fill="#d0e3d7"/><path d="m245 200 434-93 102 46v236l-536 24Z" fill="#e1e8e9"/><path d="m256 215 414-85v234l-414 29Z" fill="url(#windows)"/><path d="m670 130 102 39v217l-102-22Z" fill="#cbd9df"/><g stroke="#edf3f7" stroke-width="11"><path d="m245 208 425-88m-425 150 425-78m-425 135 425-65m-425 123 425-50"/></g><path d="m230 199 440-98 111 48v17l-112-43-439 95Z" fill="#f6f9fb"/><path d="m220 395 560-23v16l-560 29Z" fill="#bdced5"/><path d="m0 440 760-22" stroke="#f8faf6" stroke-width="26"/><g fill="#7fa88e"><circle cx="160" cy="340" r="49"/><circle cx="113" cy="363" r="42"/><circle cx="207" cy="365" r="44"/><circle cx="723" cy="335" r="54"/><circle cx="670" cy="360" r="38"/></g><g stroke="#799686" stroke-width="7"><path d="M157 347v73m560-84v63"/></g><g fill="#9cbaa0"><circle cx="65" cy="405" r="26"/><circle cx="290" cy="407" r="24"/><circle cx="585" cy="396" r="22"/></g></svg>';
function home(){
$('#main').innerHTML='<section class="hero">'+campus+'<div class="container hero-inner"><div class="eyebrow">FIND YOUR PROJECT ADVISOR</div><h1>ทุกโครงงานที่ดี<br>เริ่มจาก<em>ที่ปรึกษาที่ใช่</em></h1><p>ค้นหาอาจารย์ที่มีความเชี่ยวชาญตรงกับความสนใจ<br>แล้วก้าวแรกของโครงงานคุณจะง่ายขึ้น</p><form class="search" id="branch-search">'+icon('search')+'<input id="search-branch" type="search" aria-label="ค้นหาสาขาโครงงาน" placeholder="คุณสนใจสาขาโครงงานอะไร?" autocomplete="off"><button class="btn">ค้นหา</button></form><div class="stats"><div class="stat"><strong>'+model.branches.length+'</strong><span>กลุ่มสาขา</span></div><div class="stat"><strong>'+model.advisors.length+'</strong><span>รายการอาจารย์</span></div><div class="stat"><strong>3</strong><span>ขั้นตอนง่าย ๆ</span></div></div></div></section><section class="section container"><div class="section-head"><div><h2>เลือกสาขาโครงงาน</h2><p>เลือกสิ่งที่คุณสนใจ เพื่อค้นหาอาจารย์ที่ปรึกษา</p></div><span class="step-label">01 / EXPLORE FIELDS</span></div><div class="branch-grid" id="branches"></div><p id="branch-result" class="source-meta" aria-live="polite" style="margin-top:1.25rem"></p></section>';
function filter(){const q=$('#search-branch').value.toLocaleLowerCase('th').trim(),bs=model.branches.filter(b=>(b+' '+meta(b)[0]).toLocaleLowerCase('th').includes(q));$('#branches').innerHTML=bs.length?bs.map(b=>'<a class="branch-card" href="'+branchHref(b)+'">'+box(b)+'<h3>'+esc(meta(b)[0])+'</h3><span class="english">'+esc(b)+'</span><span class="branch-bottom"><span>'+model.advisors.filter(a=>a.branch===b).length+' รายการอาจารย์</span><span class="arrow" aria-hidden="true">↗</span></span></a>').join(''):'<div class="empty" style="grid-column:1/-1"><h3>ไม่พบสาขาที่ค้นหา</h3><p>ลองใช้ชื่อสาขาภาษาไทยหรือภาษาอังกฤษ</p></div>';$('#branch-result').textContent=q?'พบ '+bs.length+' สาขา จาก '+model.branches.length+' สาขา':'';}
filter();$('#search-branch').addEventListener('input',filter);$('#branch-search').addEventListener('submit',e=>{e.preventDefault();$('#branches').scrollIntoView({behavior:'smooth',block:'start'});});}
const crumbs=(b,n)=>'<nav class="container breadcrumbs" aria-label="เส้นทางนำทาง"><a class="home-crumb" href="/" aria-label="กลับหน้าหลัก"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m3 10 9-7 9 7v11h-6v-7H9v7H3Z"/></svg></a><span aria-hidden="true">›</span>'+(n?'<a href="'+branchHref(b)+'">'+esc(meta(b)[0])+'</a><span aria-hidden="true">›</span><span aria-current="page">'+esc(n)+'</span>':'<span aria-current="page">'+esc(meta(b)[0])+'</span>')+'</nav>';
function branchPage(b){if(!model.branches.includes(b))return notFound();const advisors=model.advisors.filter(a=>a.branch===b);$('#main').innerHTML=crumbs(b)+'<section class="container"><div class="page-heading">'+box(b)+'<div><div class="eyebrow" style="margin-bottom:0.4375rem">02 / MEET YOUR ADVISOR</div><h1>'+esc(meta(b)[0])+'</h1><p>'+esc(b)+'</p></div></div><div class="results-tools"><form class="search" id="advisor-search">'+icon('search')+'<input type="search" id="search-advisor" aria-label="ค้นหาอาจารย์หรือความเชี่ยวชาญ" placeholder="ค้นหาชื่ออาจารย์ หรือความเชี่ยวชาญ…" autocomplete="off"></form><span class="count" id="advisor-count" aria-live="polite"></span></div><div class="advisor-list" id="advisors"></div></section>';function filter(){const q=$('#search-advisor').value.toLocaleLowerCase('th').trim(),result=advisors.filter(a=>(a.name+' '+a.expertise.join(' ')).toLocaleLowerCase('th').includes(q));$('#advisor-count').textContent='พบ '+result.length+' รายการอาจารย์';$('#advisors').innerHTML=result.length?result.map(a=>'<article class="advisor-card">'+avatar(a)+'<div class="body"><h2><a href="'+profileHref(a)+'">'+esc(a.name)+'</a></h2><p class="branch-label">'+esc(meta(a.branch)[0])+'</p>'+tags(a)+'</div><a class="btn" href="'+profileHref(a)+'">ดูข้อมูลเพิ่มเติม <span aria-hidden="true">→</span></a></article>').join(''):'<div class="empty"><h3>ไม่พบอาจารย์ที่ตรงกับคำค้น</h3><p>ลองค้นหาด้วยชื่อหรือความเชี่ยวชาญอื่น</p></div>';}
filter();$('#search-advisor').addEventListener('input',filter);$('#advisor-search').addEventListener('submit',e=>e.preventDefault());}
function profilePage(id){
  const a=model.advisors.find(x=>x.id===id);if(!a)return notFound();
  const slots=a.schedule.filter(s=>!s.other),outlook=AdvisorCore.outlookCompose(a);
  const projects=a.projects.length?a.projects.map((p,i)=>'<article class="project"><span class="project-no">0'+(i+1)+'</span><div>'+(p.th?'<p><span class="language">TH</span>'+esc(p.th)+'</p>':'')+(p.en?'<p class="en"><span class="language">EN</span>'+esc(p.en)+'</p>':'')+'</div></article>').join(''):'<p class="muted">ยังไม่มีข้อมูลโครงงานที่เคยดูแล</p>';
  const rows=slots.map(s=>'<tr><th scope="row">'+esc(s.label)+'</th><td class="'+s.status+'">'+(s.status==='available'?'● ว่าง':s.status==='unavailable'?'● ไม่ว่าง':'● ยังไม่ระบุ')+'</td></tr>').join('');
  const emailBar=outlook?'<a class="btn outlook-email-btn" id="outlook-appointment" href="'+esc(outlook)+'" target="_blank" rel="noopener noreferrer">'+icon('mail')+' ส่งอีเมลนัดหมาย</a>':'<p class="muted">ยังไม่มีอีเมลติดต่อของอาจารย์</p>';
  $('#main').innerHTML=crumbs(a.branch,a.name)+'<div class="container detail-grid"><div><section class="panel profile">'+avatar(a)+'<div><div class="eyebrow" style="margin-bottom:0.375rem">03 / CONNECT & CREATE</div><h1>'+esc(a.name)+'</h1><p class="muted">'+esc(meta(a.branch)[0])+'</p>'+a.emails.map(email=>'<a class="email" href="'+esc(AdvisorCore.outlookCompose({emails:[email]}))+'" target="_blank" rel="noopener noreferrer">✉ '+esc(email)+'</a>').join('')+'<h2 class="small-heading">ความเชี่ยวชาญและเรื่องที่สนใจ</h2>'+tags(a)+'</div></section><section class="panel"><div class="panel-title"><span class="icon-box">'+icon('doc')+'</span><div><h2>โครงงานที่เคยดูแล</h2><p class="muted">หัวข้อโครงงานภาษาไทยและภาษาอังกฤษ</p></div></div>'+projects+'</section><section class="panel"><div class="panel-title"><span class="icon-box">'+icon('calendar')+'</span><h2>ตารางเวลาที่สามารถนัดหมายได้</h2></div><p class="schedule-summary">'+esc(model.scheduleTitle)+'</p><div class="legend"><span><i class="dot available"></i>ว่าง</span><span><i class="dot unavailable"></i>ไม่ว่าง</span><span><i class="dot"></i>ยังไม่ระบุ</span></div>'+(!a.scheduleMatched?'<p class="muted">ไม่พบตารางเวลาที่จับคู่กับชื่ออาจารย์ได้ กรุณาสอบถามทางอีเมล</p>':'')+'<div class="schedule-wrap"><table class="schedule-table"><caption class="skip">ตารางนัดหมายของ '+esc(a.name)+'</caption><thead><tr><th scope="col">วันที่</th><th scope="col">ความพร้อม</th></tr></thead><tbody>'+rows+'</tbody></table></div>'+a.schedule.filter(s=>s.other&&s.note).map(s=>'<p class="other-note">'+esc(s.label)+': '+esc(s.note)+'</p>').join('')+'</section>'+emailBar+'<a class="back-link profile-back" href="'+branchHref(a.branch)+'">← กลับไปรายชื่ออาจารย์ในสาขา</a></div></div>';
  
}
function notFound(){$('#main').innerHTML='<div class="container info-page"><h1>ไม่พบหน้าที่ต้องการ</h1><p>รายการอาจถูกเปลี่ยนแปลง กรุณาเลือกจากหน้าหลักอีกครั้ง</p><a class="btn" href="/">กลับหน้าหลัก</a></div>';}
function infoPage(type){$('#main').innerHTML='<div class="container info-page"><div class="eyebrow">SCiUS · NARESUAN UNIVERSITY</div><h1>'+(type==='about'?'รู้จัก Project Advisor':'ติดต่อและนัดหมายอาจารย์')+'</h1>'+(type==='about'?'<p>พื้นที่ค้นหาอาจารย์ที่ปรึกษาโครงงานสำหรับนักเรียนโครงการ วมว. มหาวิทยาลัยนเรศวร เริ่มจากเลือกสาขาที่สนใจ สำรวจความเชี่ยวชาญ แล้วติดต่ออาจารย์เพื่อพูดคุยเรื่องโครงงาน</p><p>ข้อมูลวิชาการและอีเมลมาจากชีต “ข้อมูล” ส่วนความพร้อมในการนัดหมายมาจากชีต “ตารางเวลา”</p><p>ภาพอาคารเป็นภาพกราฟิก และใช้ชื่อย่อแทนรูปอาจารย์เนื่องจากชีตไม่มีภาพถ่าย</p>':'<p>เลือกอาจารย์จากสาขาโครงงาน แล้วกรอกแบบฟอร์มในหน้าข้อมูลอาจารย์ ระบบจะเตรียมข้อความอีเมลให้คุณเปิด ตรวจสอบ และส่งจากบัญชีของคุณเอง</p><p>วันว่างในตารางเป็นข้อมูลประกอบการขอนัดหมาย กรุณารอการยืนยันจากอาจารย์ก่อนเข้าพบ ระบบไม่จองเวลาอัตโนมัติ</p>')+'<a href="/" class="btn">ค้นหาอาจารย์ที่ปรึกษา →</a></div>';}
function currentRoute(){
  const legacy=location.hash.startsWith('#/');
  let parts;try{parts=(legacy?location.hash.slice(2):location.pathname.replace(/^\/+|\/+$/g,'')).split('/').map(decodeURIComponent);}catch{return ['not-found'];}
  let route=parts,canonical;
  if(!parts[0]){route=[''];canonical='/';}
  else if((legacy&&parts[0]==='branch')||(!legacy&&parts[0]==='branches')){
    const branch=model.branches.find(b=>b===parts[1]||AdvisorCore.branchSlug(b)===parts[1]);
    if(!branch)return ['not-found'];route=['branch',branch];canonical=branchHref(branch);
  }else if((legacy&&parts[0]==='advisor')||(!legacy&&parts[0]==='advisors')){
    route=['advisor',parts[1]];canonical='/advisors/'+encodeURIComponent(parts[1]||'');
  }else if(['about','contact'].includes(parts[0]))canonical='/'+parts[0];
  else return ['not-found'];
  if(legacy||location.pathname!==canonical)history.replaceState(null,'',canonical+location.search);
  return route;
}
function render(){
  if(!model)return;
  const parts=currentRoute();
  if(!parts[0])home();else if(parts[0]==='branch')branchPage(parts[1]);else if(parts[0]==='advisor')profilePage(parts[1]);else if(['about','contact'].includes(parts[0]))infoPage(parts[0]);else notFound();
  const advisor=model.advisors.find(a=>a.id===parts[1]);
  document.title=(parts[0]==='advisor'&&advisor?advisor.name:parts[0]==='branch'?meta(parts[1])[0]:'ค้นหาอาจารย์ที่ปรึกษา')+' · Project Advisor';
}
function afterNavigation(){render();window.scrollTo(0,0);$('#main').focus({preventScroll:true});}
document.addEventListener('click',event=>{
  if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  const anchor=event.target.closest('a[href]');
  if(!anchor||anchor.hasAttribute('download')||(anchor.target&&anchor.target!=='_self'))return;
  const url=new URL(anchor.href,location.href);
  if(url.origin!==location.origin||url.hash)return;
  if(!/^\/(?:branches\/[^/]+|advisors\/[^/]+|about|contact)?\/?$/.test(url.pathname))return;
  event.preventDefault();
  if(url.pathname!==location.pathname||url.search!==location.search||location.hash)history.pushState(null,'',url.pathname+url.search);
  afterNavigation();
});
window.addEventListener('popstate',afterNavigation);
async function readJson(url){const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);try{const response=await fetch(url,{signal:controller.signal,cache:'no-store'});if(!response.ok)throw new Error('อ่านข้อมูลไม่สำเร็จ ('+response.status+')');return await response.json();}finally{clearTimeout(timer);}}
let queryCounter=0;
function readSheet(sheet){return new Promise((resolve,reject)=>{
  const callback='sheetData_'+Date.now()+'_'+queryCounter++,script=document.createElement('script');
  const cleanup=()=>{window[callback]=()=>{};script.remove();clearTimeout(timer);setTimeout(()=>delete window[callback],30000);};
  const timer=setTimeout(()=>{cleanup();reject(new Error('อ่านชีตไม่สำเร็จ'));},4000);
  window[callback]=response=>{cleanup();if(response.status==='error'||!response.table?.rows)return reject(new Error('ชีตยังไม่เปิดให้อ่านผ่านเว็บ'));resolve(response.table.rows.map(row=>(row.c||[]).map(cell=>cell?.f??cell?.v??'')));};
  script.onerror=()=>{cleanup();reject(new Error('ชีตยังไม่เปิดให้อ่านผ่านเว็บ'));};
  const config=window.ADVISOR_CONFIG,url=new URL('https://docs.google.com/spreadsheets/d/'+encodeURIComponent(config.spreadsheetId)+'/gviz/tq');
  url.searchParams.set('sheet',sheet);url.searchParams.set('headers','0');url.searchParams.set('tqx','out:json;responseHandler:'+callback);script.src=url.href;document.head.appendChild(script);
});}
function applyData(payload,source){model=AdvisorCore.normalize(payload);mode=source;refreshed=payload.fetchedAt?new Intl.DateTimeFormat('th-TH',{dateStyle:'medium',timeStyle:'short',timeZone:'Asia/Bangkok'}).format(new Date(payload.fetchedAt)):'ไม่ระบุ';}
async function syncLive(){const config=window.ADVISOR_CONFIG;if(!config.tryLiveSheet)return false;try{const [data,schedule]=await Promise.all([readSheet(config.dataSheet),readSheet(config.scheduleSheet)]);const header=data.findIndex(row=>AdvisorCore.nameKey(row[0])===AdvisorCore.nameKey('ชื่อ-สกุล'));if(header<0)throw new Error('ไม่พบหัวข้อมูล');const nonempty=schedule.findIndex(row=>row.some(value=>String(value).trim()));applyData({data:data.slice(header),schedule:schedule.slice(Math.max(0,nonempty)),fetchedAt:new Date().toISOString()},'live');return true;}catch{return false;}}
async function load(){applyData(await readJson(window.ADVISOR_CONFIG.snapshotUrl),'snapshot');}
window.addEventListener('hashchange',()=>{if(location.hash.startsWith('#/'))afterNavigation();});
load().then(()=>{render();syncLive().then(changed=>{if(changed)render();});}).catch(error=>{$('#main').innerHTML='<div class="container info-page"><h1>ยังโหลดข้อมูลไม่ได้</h1><p>'+esc(error.message)+'</p><p>กรุณาตรวจการเชื่อมต่อและไฟล์ข้อมูล</p><button class="btn" id="retry">ลองอีกครั้ง</button></div>';$('#retry').addEventListener('click',()=>location.reload());});
})();
