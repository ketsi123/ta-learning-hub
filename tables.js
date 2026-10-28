/* Shared table tools and actionable development-plan summary. */
let followupView='people';
// Display-only explanations: counts continue to use evaluate(), done() and hubPlan().
function followupStatus(raw){
 const p=parseStatus(raw),y=p.year;
 if(done(raw))return {text:'สำเร็จ'+(y?' ปี '+y:' · ไม่ระบุปี'),tone:'done'};
 if(p.complete&&y>+year)return {text:'สำเร็จปี '+y+' · หลังปีที่เลือก '+year,tone:'future'};
 if(p.plan)return {text:'มีแผน'+(y?' ปี '+y:' · ไม่ระบุปี')+(y>+year?' · หลังปีที่เลือก '+year:''),tone:y>+year?'future':'planned'};
 return {text:p.raw?'ยังไม่มีแผน · ข้อมูลยังไม่ระบุผล':'ยังไม่มีแผน · ไม่พบข้อมูล',tone:'pending'};
}
function followupMissing(e){
 const a=evaluate(e);
 return a.req.filter(n=>!done(e.cells[n-1])).map(n=>({i:n-1,name:HUB_SKILLS[n-1],kind:a.must.includes(n)?'Must Have':'Should Have',raw:String(e.cells[n-1]||''),status:followupStatus(e.cells[n-1])}));
}
function followupSummary(items){
 const counts=new Map();for(const x of items)counts.set(x.status.text,(counts.get(x.status.text)||0)+1);
 return [...counts].map(([text,n])=>text+' ('+n+')').join(' · ');
}
function followupItemText(items){return items.map(x=>x.name+' — '+x.kind+' — '+x.status.text).join('; ');}
function followupButton(e,html,cls='',kind='core',label=''){
 return '<button type="button" class="'+cls+'" data-fu-person="'+esc(e.id)+'" data-fu-domain="'+kind+'"'+(label?' aria-label="'+esc(label)+'"':'')+'>'+html+'</button>';
}
function followupMissingList(e,items,kind='core'){
 return '<ul class="fu-missing-list">'+items.map(x=>'<li>'+followupButton(e,'<strong>'+esc(x.name)+'</strong><small class="fu-item-status '+x.status.tone+'">'+esc(x.status.text)+'</small>','fu-skill-open',kind,'ดูรายละเอียด '+x.name)+'</li>').join('')+'</ul>';
}
function followupDetail(id,kind='core'){
 const e=(kind==='up'?ups:records).find(p=>String(p.id)===String(id));if(!e)return;
 const a=evaluate(e),upItems=kind==='up'?upLinkedData().rows.filter(x=>String(x.e.id)===String(id)).map(x=>({i:x.i,name:x.course,kind:'Upskilling',raw:x.raw,status:followupStatus(x.raw)})):[],items=kind==='up'?upItems.filter(x=>!done(x.raw)):followupMissing(e);
 const total=kind==='up'?upItems.length:a.total,completed=kind==='up'?upItems.filter(x=>done(x.raw)).length:a.completed;
 const context=kind==='up'?'นับเฉพาะรายการ Upskilling ที่มีข้อมูลและอยู่ในปีสะสม · ไม่ใช้เกณฑ์ Must / Should':esc(e.pl)+' · Must Have '+a.must.length+' + Should Have '+a.should.length+' = '+a.total+' ทักษะตามเกณฑ์';
 const required=kind==='core'&&a.total?'<details class="fu-requirements"><summary>ดูเกณฑ์ทั้งหมดของ '+esc(e.pl)+'</summary><ul>'+a.req.map(n=>'<li><strong>'+esc(HUB_SKILLS[n-1])+'</strong> · '+(a.must.includes(n)?'Must Have':'Should Have')+' · '+esc(followupStatus(e.cells[n-1]).text)+'</li>').join('')+'</ul></details>':'';
 const dialog=$('#detail');dialog.classList.remove('personnel-editor');
 dialog.innerHTML='<div class="modal-head"><div><div class="eyebrow">'+(kind==='up'?'UPSKILLING':'REQUIRED SKILL GAPS')+'</div><h2>'+esc(e.firstName+' '+e.lastName)+'</h2><p>'+esc(e.lab)+' · '+esc(e.pl)+' · '+esc(e.title)+'</p></div><button class="close" data-action="close" aria-label="ปิดรายละเอียด">×</button></div><div class="modal-body fu-detail-body"><div class="fu-detail-context"><h3>'+(kind==='up'?'หลักสูตรที่ยังไม่สำเร็จ':'สมรรถนะที่ยังขาดตามเกณฑ์')+' · '+items.length+' รายการ</h3><p>สะสมถึงปี '+esc(year)+' · สำเร็จ '+completed+' / '+total+'</p><p>'+context+'</p></div>'+ (items.length?'<ul class="fu-detail-list">'+items.map(x=>'<li><div><strong>'+esc(x.name)+'</strong><span class="fu-requirement">'+x.kind+'</span></div><span class="fu-status '+x.status.tone+'">'+esc(x.status.text)+'</span><small class="fu-source">ข้อมูลต้นฉบับ: '+esc(x.raw||'ช่องว่าง — ยังไม่ระบุ')+'</small></li>').join('')+'</ul>':'<p class="modal-note">'+(kind==='core'&&!a.total?'ไม่มีเกณฑ์ประเมินสำหรับ PL นี้ จึงไม่จัดว่าขาดสมรรถนะ':'ไม่มีรายการที่ยังขาดในปีที่เลือก')+'</p>')+required+'<p class="modal-note">'+(kind==='core'?'แสดงเฉพาะ Must Have และ Should Have ตาม PL · สมรรถนะเสริมที่ไม่อยู่ในเกณฑ์ไม่นับว่าขาด':'ช่องว่างของหลักสูตร Upskilling ไม่ถือว่าเรียนไม่ครบ')+' · ผลสำเร็จหลังปีที่เลือกยังไม่นับในยอดสำเร็จของปีนี้</p><button type="button" class="btn" data-hub-person="'+esc(e.id)+'">เปิดโปรไฟล์การเรียนรู้ทั้งหมด ↗</button></div>';
 if(!dialog.open)dialog.showModal();
}
function followupData(){
 const people=selectData(),pending=people.filter(e=>evaluate(e).gap>0),na=people.filter(e=>!evaluate(e).total),gaps=[];
 for(const e of pending){const a=evaluate(e);for(const n of a.req)if(!done(e.cells[n-1]))gaps.push({e,i:n-1,planned:hubPlan(e.cells[n-1]),kind:a.must.includes(n)?'Must Have':'Should Have'});}
 return {people,pending,na,gaps,unplanned:gaps.filter(x=>!x.planned)};
}
function followupPage(){
 const d=followupData(),cards=[
 ['people','บุคลากรที่ยังไม่ครบ',d.pending.length,'คน','คนที่ต้องพัฒนาต่อจากฐานติดตาม '+d.people.length+' คน','users'],
 ['gaps','สมรรถนะที่รอพัฒนา',d.gaps.length,'รายการ','ดูรายคน × สมรรถนะที่ยังขาด','target'],
 ['unplanned','ยังไม่ได้วางแผน',d.unplanned.length,'รายการ','ไม่มีแผนที่นับได้ถึงปี '+year+' · รวมข้อมูลปีถัดไป','edit'],
 ['na','ไม่มีเกณฑ์ประเมิน',d.na.length,'คน','แยกจากกลุ่มที่พัฒนาไม่ครบ','info']];
 const rows=followupView==='people'?d.pending:followupView==='na'?d.na:followupView==='gaps'?d.gaps:d.unplanned,detail=['gaps','unplanned'].includes(followupView);
 const heads=detail?['ชื่อ–นามสกุล','แล็บ / BU','PL','ตำแหน่ง','สมรรถนะที่ยังขาด','เกณฑ์','สถานะ / ปี']:['ชื่อ–นามสกุล','แล็บ / BU','PL','ตำแหน่ง','สำเร็จ / ตามเกณฑ์','ยังขาด','สมรรถนะที่ยังขาด / สถานะ','สรุปสถานะ'];
 const title=cards.find(c=>c[0]===followupView)[1];
 return '<div class="fu-cards">'+cards.map(([key,label,n,unit,note,ico],j)=>'<button class="fu-card fu-'+j+(key===followupView?' active':'')+'" data-fu-view="'+key+'" aria-pressed="'+(key===followupView)+'"><span class="fu-art">'+hubTopicGraphic(HUB_ART.followup[j])+'</span><span class="fu-copy"><strong>'+label+'</strong><span class="fu-number">'+n+' <small>'+unit+'</small></span><span class="fu-note">'+note+'</span></span><span class="fu-cta">'+(key===followupView?'✓ กำลังแสดง':'ดูรายการ ↗')+'</span></button>').join('')+'</div><section class="panel"><div class="panel-head"><div><h3>'+title+'</h3><p>สะสมถึงปี '+esc(year)+' · คลิกชื่อ จำนวน หรือสถานะ เพื่อดูว่าขาดทักษะใดตามเกณฑ์ PL</p></div></div><div class="table-wrap"><table class="fu-results-table '+(detail?'fu-item-table':'fu-people-table')+'"><thead><tr>'+heads.map(h=>'<th>'+h+'</th>').join('')+'</tr></thead><tbody>'+rows.map(x=>{
  const e=detail?x.e:x,a=evaluate(e),items=followupMissing(e),summary=a.total?followupSummary(items):'ไม่มีเกณฑ์ประเมิน',s=detail?followupStatus(e.cells[x.i]):null;
  return '<tr><td>'+followupButton(e,esc(e.firstName+' '+e.lastName),'person-open')+'</td><td>'+esc(e.lab)+'</td><td>'+esc(e.pl)+'</td><td>'+esc(e.title)+'</td>'+(detail?'<td>'+followupButton(e,esc(HUB_SKILLS[x.i]),'text-link')+'</td><td>'+x.kind+'</td><td>'+followupButton(e,esc(s.text),'fu-status '+s.tone)+'</td>':'<td>'+followupButton(e,a.total?a.completed+' / '+a.total:'N/A','text-link')+'</td><td>'+followupButton(e,String(a.gap),'fu-gap-count','core','ดูสมรรถนะที่ยังขาด '+a.gap+' รายการ')+'</td><td data-table-value="'+esc(followupItemText(items)||'ไม่มีเกณฑ์ประเมิน')+'">'+(items.length?followupMissingList(e,items):'<span class="fu-no-rule">ไม่มีเกณฑ์ประเมิน — ไม่นับว่าขาด</span>')+'</td><td data-table-value="'+esc(summary)+'">'+followupButton(e,esc(summary),'fu-summary-open')+followupButton(e,'ดูรายละเอียด ↗','text-link fu-detail-open')+'</td>')+'</tr>';
 }).join('')+'</tbody></table></div></section>';
}
/* Upskilling is available in overview, development plans and reports. */
const sectionDomains={followup:'core',reports:'core'};
let upCardView='all';
function upLinkedData(){
 const courses=upNames().map((name,i)=>({name,i,...hubSkillSummary('up',i)}));
 const rows=courses.flatMap(c=>c.people.filter(x=>x.required).map(x=>({...x,i:c.i,course:c.name,raw:String(x.e.cells[c.i]||''),state:x.complete?'done':x.planned?'planned':'unplanned'})));
 return {courses,rows,people:new Set(rows.map(x=>String(x.e.id))).size,done:rows.filter(x=>x.complete).length,planned:rows.filter(x=>x.planned).length,unplanned:rows.filter(x=>!x.complete&&!x.planned).length};
}
function sectionDomainTabs(page){return `<div class="hub-domain-tabs" role="group" aria-label="เลือกกลุ่มการเรียนรู้">${[['core','สมรรถนะหลัก 6 ด้าน','layers'],['up','หลักสูตร Upskilling','book']].map(([key,label,ico])=>`<button class="${sectionDomains[page]===key?'active':''}" data-section-domain="${key}" data-section-page="${page}" aria-pressed="${sectionDomains[page]===key}">${icon(ico)} ${label}</button>`).join('')}</div>`;}
function upLinkedCards(d){
 const cards=[['all','ผู้มีรายการ Upskilling',d.people,'คน',`${d.rows.length} รายการเรียน · คนเดียวอาจเรียนหลายหลักสูตร`],['done','เรียนสำเร็จแล้ว',d.done,'รายการ','แสดงรายคน × หลักสูตรที่สำเร็จ'],['planned','มีแผน รอเรียนสำเร็จ',d.planned,'รายการ','ติดตามผู้ที่มีแผนเรียนอยู่'],['unplanned','ยังไม่สำเร็จและไม่มีแผน',d.unplanned,'รายการ','เฉพาะรายการเรียนที่มีข้อมูลอยู่']];
 return `<div class="fu-cards">${cards.map(([key,label,n,unit,note],j)=>`<button class="fu-card fu-${j} ${upCardView===key?'active':''}" data-up-card="${key}" aria-pressed="${upCardView===key}"><span class="fu-art">${hubTopicGraphic(HUB_ART.followup[j])}</span><span class="fu-copy"><strong>${label}</strong><span class="fu-number">${n} <small>${unit}</small></span><span class="fu-note">${note}</span></span><span class="fu-cta">${upCardView===key?'✓ กำลังแสดง':'ดูรายการ ↗'}</span></button>`).join('')}</div>`;
}
function upLinkedTable(d){
 const rows=d.rows.filter(x=>upCardView==='all'||x.state===upCardView),label={all:'รายการ Upskilling ทั้งหมด',done:'Upskilling ที่สำเร็จแล้ว',planned:'แผน Upskilling ที่รอเรียนสำเร็จ',unplanned:'Upskilling ที่ยังไม่สำเร็จและไม่มีแผน'}[upCardView];
 return `<section class="panel up-linked-detail"><div class="panel-head"><div><h3>${label}</h3><p>${new Set(rows.map(x=>String(x.e.id))).size} คน · ${rows.length} รายการเรียน · สะสมถึงปี ${esc(year)}</p></div></div><div class="table-wrap"><table class="up-results-table"><colgroup><col style="width:18%"><col style="width:10%"><col style="width:6%"><col style="width:23%"><col style="width:24%"><col style="width:12%"><col style="width:7%"></colgroup><thead><tr>${['ชื่อ–นามสกุล','แล็บ / BU','PL','ตำแหน่ง','หลักสูตร Upskilling','สถานะ','ข้อมูลต้นฉบับ'].map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(x=>`<tr><td><button class="person-open" data-fu-person="${esc(x.e.id)}" data-fu-domain="up">${esc(x.e.firstName+' '+x.e.lastName)}</button></td><td>${esc(x.e.lab)}</td><td>${esc(x.e.pl)}</td><td>${esc(x.e.title)}</td><td><button class="text-link" data-hub-skill="${x.i}" data-domain="up">${esc(x.course)}</button></td><td>${followupButton(x.e,esc(followupStatus(x.raw).text),'fu-status '+followupStatus(x.raw).tone,'up')}</td><td>${esc(x.raw)}</td></tr>`).join('')}</tbody></table></div></section>`;
}
function upLinkedPage(report=false){const d=upLinkedData();return `<div class="up-linked-intro"><h2>${report?'รายงานผล Upskilling':'ติดตามแผน Upskilling'}</h2><p>นับเฉพาะผู้มีรายการเรียนในฐาน Upskilling · ช่องว่างไม่ถือว่าเรียนไม่ครบ · แยกจากเกณฑ์ Must / Should</p></div>${upLinkedCards(d)}${upLinkedTable(d)}${report?upCourseReport(d):''}`;}
function upCourseReport(d){return `<section class="panel"><div class="panel-head"><div><h3>ผล Upskilling รายหลักสูตร</h3><p>คลิกชื่อหลักสูตรเพื่อเจาะรายชื่อผ่าน Mind map</p></div></div><div class="table-wrap"><table><thead><tr>${['หลักสูตร','ผู้มีรายการเรียน (คน)','สำเร็จ (คน)','มีแผน (คน)','ยังไม่มีแผน (คน)','ความก้าวหน้า'].map(x=>`<th>${x}</th>`).join('')}</tr></thead><tbody>${d.courses.map(c=>`<tr><td><button class="text-link" data-hub-skill="${c.i}" data-domain="up">${esc(c.name)}</button></td><td>${c.eligible}</td><td>${c.complete}</td><td>${c.planned}</td><td>${c.unplanned}</td><td>${c.eligible?pct(c.pct)+'%':'—'}</td></tr>`).join('')}</tbody></table></div></section><section class="panel"><div class="panel-head"><h3>ผล Upskilling แยก BU</h3></div><div class="table-wrap"><table><thead><tr><th>BU</th><th>ผู้มีรายการเรียน (คน)</th><th>รายการเรียน</th><th>สำเร็จ</th><th>มีแผน</th><th>ยังไม่มีแผน</th></tr></thead><tbody>${[...new Set(d.rows.map(x=>x.e.lab))].sort().map(bu=>{const r=d.rows.filter(x=>x.e.lab===bu);return `<tr><td><button class="text-link" data-up-bu="${esc(bu)}">${esc(bu)}</button></td><td>${new Set(r.map(x=>String(x.e.id))).size}</td><td>${r.length}</td><td>${r.filter(x=>x.complete).length}</td><td>${r.filter(x=>x.planned).length}</td><td>${r.filter(x=>!x.complete&&!x.planned).length}</td></tr>`;}).join('')}</tbody></table></div></section>`;}
const overviewWithCore=hubOverview;
hubOverview=function(){const d=upLinkedData();return overviewWithCore()+`<section class="up-overview"><div class="hub-section-heading"><div><h2>Upskilling · หลักสูตรเสริมทักษะ</h2><p>${d.people} คน · ${d.rows.length} รายการเรียน · สำเร็จ ${d.done} · มีแผน ${d.planned} รายการ</p></div><div class="actions"><button class="btn primary" data-up-go="followup">ติดตามแผน Upskilling ↗</button><button class="btn" data-up-go="reports">รายงาน Upskilling ↗</button></div></div><div class="hub-skills-grid">${d.courses.map(c=>hubSkillCard(c.i,'up')).join('')}</div></section>`;};
const reportsWithCore=hubReports;
hubReports=function(){return sectionDomainTabs('reports')+(sectionDomains.reports==='up'?`<div class="hub-report-filters"><label class="report-pl-filter ${pl?'is-filtered':''}"><span>ระดับ PL</span> <select id="pl" aria-label="กรองระดับ PL">${options(ups.map(e=>e.pl),pl,'ทุก PL')}</select></label><button class="btn" data-hub="print">${icon('print')} พิมพ์ PDF</button></div>`+upLinkedPage(true):reportsWithCore().replaceAll('<div class="panel-head">','<div class="panel-head report-category-head">'));};
document.addEventListener('click',e=>{
 const person=e.target.closest('[data-fu-person]');if(person){followupDetail(person.dataset.fuPerson,person.dataset.fuDomain||'core');return;}
 const domain=e.target.closest('[data-section-domain]');if(domain){sectionDomains[domain.dataset.sectionPage]=domain.dataset.sectionDomain;upCardView='all';renderContent();return;}
 const card=e.target.closest('[data-up-card]');if(card){upCardView=card.dataset.upCard;renderContent();return;}
 const go=e.target.closest('[data-up-go]');if(go){tab=go.dataset.upGo;sectionDomains[tab]='up';upCardView='all';shell();window.scrollTo(0,0);return;}
 const bu=e.target.closest('[data-up-bu]');if(bu){lab=bu.dataset.upBu;upCardView='all';shell();return;}
});

const sharedTableRender=renderContent;
renderContent=function(){closeUniversalFilter();if(tab==='followup')$('#content').innerHTML=sectionDomainTabs('followup')+(sectionDomains.followup==='up'?upLinkedPage():followupPage());else sharedTableRender();enhanceTables();};
document.addEventListener('click',e=>{const c=e.target.closest('[data-fu-view]');if(c){followupView=c.dataset.fuView;renderContent();}});

const universalTables=new WeakMap();
let universalPopup=null;
function closeUniversalFilter(){if(universalPopup){universalPopup.trigger.setAttribute('aria-expanded','false');universalPopup.el.remove();universalPopup=null;}}
function tableCellText(cell){if(!cell)return '';if(cell.dataset?.tableValue!==undefined)return cell.dataset.tableValue;const copy=cell.cloneNode(true);copy.querySelectorAll('.avatar,.icon,svg,.ut-filter').forEach(x=>x.remove());const matrix=copy.querySelector('.matrix-cell');if(matrix?.title)return matrix.title;return copy.textContent.replace(/\s+/g,' ').trim();}
function universalMatches(values,query,filters){return values.join(' ').toLocaleLowerCase('th').includes(query.toLocaleLowerCase('th'))&&filters.every((set,i)=>!set||set.has(values[i]));}
function universalVisible(s){return s.rows.filter(r=>universalMatches(r.values,s.query,s.filters));}
function universalSort(s,i,direction='asc'){
 const sign=direction==='desc'?-1:1;
 s.rows.sort((a,b)=>sign*a.values[i].localeCompare(b.values[i],'th',{numeric:true,sensitivity:'base'})||(a.order||0)-(b.order||0));
 s.sort={i,direction};s.rows.forEach(r=>s.table.tBodies[0].appendChild(r.el));applyUniversal(s);
}
function applyUniversal(s){
 const visible=new Set(universalVisible(s));s.rows.forEach(r=>r.el.hidden=!visible.has(r));
 s.count.textContent='แสดง '+visible.size+' / '+s.rows.length+' รายการ';s.export.disabled=!visible.size;
 s.empty.hidden=!!visible.size;
 [...s.table.tHead.rows[0].cells].forEach((cell,i)=>cell.setAttribute('aria-sort',s.sort?.i===i?(s.sort.direction==='asc'?'ascending':'descending'):'none'));
 s.buttons.forEach((b,i)=>{const f=s.filters[i];b.classList.toggle('filtered',!!f);b.title=f?'กรองอยู่: '+[...f].join(' / '):'กรอง '+s.headers[i];b.setAttribute('aria-label','กรอง '+s.headers[i]+(f?' · เลือก '+f.size+' ค่า':''));});
}
function openUniversalFilter(s,i,trigger){
 if(universalPopup?.trigger===trigger){closeUniversalFilter();return;}closeUniversalFilter();
 const values=[...new Set(s.rows.map(r=>r.values[i]))].sort((a,b)=>a.localeCompare(b,'th'));let draft=new Set(s.filters[i]||values);
 const el=document.createElement('div');el.className='ut-popup';el.setAttribute('role','dialog');el.setAttribute('aria-label','กรอง '+s.headers[i]);el.innerHTML='<strong>'+esc(s.headers[i])+'</strong><div class="ut-sort-actions"><button type="button" data-ut-sort="asc">เรียง ก → ฮ / A → Z</button><button type="button" data-ut-sort="desc">เรียง ฮ → ก / Z → A</button></div><input type="search" placeholder="ค้นหาค่าในคอลัมน์…" aria-label="ค้นหาค่าในคอลัมน์"><label class="ut-all"><input type="checkbox"> เลือกทั้งหมด</label><div class="ut-options"></div><div class="ut-popup-footer"><span></span><button type="button">ใช้ตัวกรอง</button></div>';
 (s.table.closest('dialog')||document.body).append(el);universalPopup={el,trigger};trigger.setAttribute('aria-expanded','true');
 const input=el.querySelector('input[type=search]'),all=el.querySelector('.ut-all input'),list=el.querySelector('.ut-options'),count=el.querySelector('.ut-popup-footer span');
 function draw(){const q=input.value.toLocaleLowerCase('th');list.replaceChildren();for(const value of values.filter(v=>v.toLocaleLowerCase('th').includes(q))){const label=document.createElement('label'),check=document.createElement('input');check.type='checkbox';check.checked=draft.has(value);label.append(check,document.createTextNode(value||'ไม่ระบุ'));check.addEventListener('change',()=>{check.checked?draft.add(value):draft.delete(value);update();});list.append(label);}if(!list.children.length)list.textContent='ไม่พบค่าที่ค้นหา';update();}
 function update(){all.checked=draft.size===values.length;all.indeterminate=draft.size>0&&draft.size<values.length;count.textContent='เลือก '+draft.size+' ค่า';}
 input.addEventListener('input',draw);all.addEventListener('change',()=>{draft=new Set(all.checked?values:[]);draw();});
 el.querySelectorAll('[data-ut-sort]').forEach(b=>b.addEventListener('click',()=>{universalSort(s,i,b.dataset.utSort);closeUniversalFilter();trigger.focus();}));
 el.querySelector('.ut-popup-footer button').addEventListener('click',()=>{s.filters[i]=draft.size===values.length?null:new Set(draft);applyUniversal(s);closeUniversalFilter();trigger.focus();});
 draw();const r=trigger.getBoundingClientRect(),w=Math.min(370,innerWidth-24),h=Math.min(500,innerHeight-24);el.style.cssText='width:'+w+'px;height:'+h+'px;left:'+Math.max(12,Math.min(r.left,innerWidth-w-12))+'px;top:'+Math.max(12,Math.min(r.bottom+6,innerHeight-h-12))+'px';input.focus();
}
function enhanceTables(){
 document.querySelectorAll('.hub-report-labs .report-number').forEach(b=>{const t=b.textContent.trim();b.dataset.zero=String(t==='0');b.dataset.low=String(t.endsWith('%')&&Number.parseFloat(t)<100);});
 document.querySelectorAll('#content table,#detail table').forEach(table=>{
 if(table.hasAttribute('data-batch-table')||table.closest('.lm-details')||universalTables.has(table)||!table.tHead||!table.tBodies.length)return;
 const headers=[...table.tHead.rows[0].cells].map(c=>tableCellText(c));
 const rows=[...table.tBodies[0].rows].filter(r=>r.cells.length===headers.length&&!r.querySelector('[colspan]')).map((el,order)=>({el,order,values:[...el.cells].map(tableCellText)}));
 const bar=document.createElement('div');bar.className='ut-toolbar';bar.innerHTML='<label>'+icon('search')+'<input type="search" placeholder="ค้นหาในตารางทุกคอลัมน์…" aria-label="ค้นหาในตาราง"></label><span class="ut-count"></span><button class="ut-reset filter-reset"><span class="filter-reset-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="M3 10a9 9 0 1 1 2 8M3 4v6h6"/></svg></span><span>ล้างตัวกรองตาราง</span></button><button class="ut-export">'+icon('export')+' Export Excel</button>';
 const wrap=table.closest('.table-wrap')||table;wrap.before(bar);
 const empty=document.createElement('p');empty.className='ut-empty';empty.textContent='ไม่พบรายการตามตัวกรอง';wrap.after(empty);
 const s={table,headers,rows,query:'',filters:headers.map(()=>null),buttons:[],count:bar.querySelector('.ut-count'),export:bar.querySelector('.ut-export'),empty};
 universalTables.set(table,s);
 [...table.tHead.rows[0].cells].forEach((cell,i)=>{const b=document.createElement('button');b.type='button';b.className='ut-filter';b.setAttribute('aria-expanded','false');b.setAttribute('aria-haspopup','dialog');b.setAttribute('aria-label','กรอง '+(headers[i]||'การทำงาน'));b.addEventListener('click',()=>openUniversalFilter(s,i,b));const title=document.createElement('span');title.className='ut-heading-label';const notes=[...cell.children].filter(n=>n.tagName==='SMALL');[...cell.childNodes].filter(n=>!notes.includes(n)).forEach(n=>title.append(n));const arrow=document.createElement('span');arrow.className='ut-heading-arrow';arrow.setAttribute('aria-hidden','true');arrow.textContent='▾';b.append(title,arrow);cell.prepend(b);s.buttons.push(b);if(!headers[i])b.hidden=true;});
 bar.querySelector('input').addEventListener('input',e=>{s.query=e.target.value;applyUniversal(s);});
 bar.querySelector('.ut-reset').addEventListener('click',()=>{s.query='';s.filters=headers.map(()=>null);s.sort=null;s.rows.sort((a,b)=>a.order-b.order).forEach(r=>s.table.tBodies[0].appendChild(r.el));bar.querySelector('input').value='';closeUniversalFilter();applyUniversal(s);});
 s.export.addEventListener('click',()=>{const items=universalVisible(s).map(r=>Object.fromEntries(headers.map((h,i)=>[h||'การทำงาน',r.values[i]]).filter(([h])=>h!=='การทำงาน')));hubDownloadWorkbook([['รายการที่กรอง',items],['เงื่อนไข',[{'หน้า':hubTitle(),'ปีสะสม':year,'BU':lab||'ทั้งหมด','คำค้นหาตาราง':s.query,'จำนวนรายการ':items.length,...Object.fromEntries(headers.map((h,i)=>['กรอง '+h,s.filters[i]?[...s.filters[i]].join(' / '):'ทั้งหมด']))}]]],'TA_Table_'+year+'.xlsx');});
 const footer=wrap.parentElement.querySelector(':scope > .table-footer');if(footer)footer.hidden=true;
 applyUniversal(s);
 });
}
document.addEventListener('click',e=>{if(universalPopup&&!universalPopup.el.contains(e.target)&&!universalPopup.trigger.contains(e.target))closeUniversalFilter();});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeUniversalFilter();});
window.addEventListener('resize',closeUniversalFilter);
const tableObserver=new MutationObserver(()=>enhanceTables());tableObserver.observe(document.getElementById('detail'),{childList:true,subtree:true});
if(document.getElementById('content'))renderContent();
