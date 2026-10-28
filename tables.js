/* Shared table tools and actionable development-plan summary. */
let followupView='people',followupPersonId='',followupPersonContext='';
function followupScopeKey(){return JSON.stringify([year,lab,pl,query,tab,sectionDomains.followup]);}
function clearFollowupPerson(){followupPersonId='';followupPersonContext='';}
function openFollowupPerson(id){
 const e=followupData().pending.find(p=>String(p.id)===String(id));if(!e)return;
 followupPersonId=String(e.id);followupPersonContext=followupScopeKey();followupView='gaps';renderContent();
}
function followupClickAttrs(e){return 'data-fu-open="'+esc(e.id)+'" role="button" tabindex="0" title="ดูสมรรถนะที่ยังขาด" aria-label="ดูสมรรถนะที่ยังขาดของ '+esc(e.firstName+' '+e.lastName)+'"';}
function followupData(){
 const people=selectData(),pending=people.filter(e=>evaluate(e).gap>0),na=people.filter(e=>!evaluate(e).total),gaps=[];
 for(const e of pending){const a=evaluate(e);for(const n of a.req)if(!done(e.cells[n-1]))gaps.push({e,i:n-1,planned:hubPlan(e.cells[n-1]),kind:a.must.includes(n)?'Must Have':'Should Have'});}
 return {people,pending,na,gaps,unplanned:gaps.filter(x=>!x.planned)};
}
function followupPage(){
 if(followupPersonId&&followupPersonContext!==followupScopeKey())clearFollowupPerson();
 const d=followupData(),cards=[
 ['people','บุคลากรที่ยังไม่ครบ',d.pending.length,'คน','คนที่ต้องพัฒนาต่อจากฐานติดตาม '+d.people.length+' คน','users'],
 ['gaps','สมรรถนะที่รอพัฒนา',d.gaps.length,'รายการ','ดูรายคน × สมรรถนะที่ยังขาด','target'],
 ['unplanned','ยังไม่ได้วางแผน',d.unplanned.length,'รายการ','รายการที่ยังต้องจัดแผนพัฒนา','edit'],
 ['na','ไม่มีเกณฑ์ประเมิน',d.na.length,'คน','แยกจากกลุ่มที่พัฒนาไม่ครบ','info']];
 const rows=followupView==='people'?d.pending:followupView==='na'?d.na:followupView==='gaps'?d.gaps:d.unplanned,detail=['gaps','unplanned'].includes(followupView);
 const heads=detail?['ชื่อ–นามสกุล','แล็บ / BU','PL','ตำแหน่ง','สมรรถนะที่ยังขาด','เกณฑ์','แผนพัฒนา']:['ชื่อ–นามสกุล','แล็บ / BU','PL','ตำแหน่ง','สำเร็จ / ตามเกณฑ์','ยังขาด','สถานะ'];
 const title=cards.find(c=>c[0]===followupView)[1];
 return '<div class="fu-cards">'+cards.map(([key,label,n,unit,note,ico],j)=>'<button class="fu-card fu-'+j+(key===followupView?' active':'')+'" data-fu-view="'+key+'" aria-pressed="'+(key===followupView)+'"><span class="fu-art">'+hubTopicGraphic(HUB_ART.followup[j])+'</span><span class="fu-copy"><strong>'+label+'</strong><span class="fu-number">'+n+' <small>'+unit+'</small></span><span class="fu-note">'+note+'</span></span><span class="fu-cta">'+(key===followupView?'✓ กำลังแสดง':'ดูรายการ ↗')+'</span></button>').join('')+'</div><section class="panel"><div class="panel-head"><div><h3>'+title+'</h3><p>สะสมถึงปี '+esc(year)+' · คลิกการ์ดด้านบนเพื่อเปลี่ยนรายการ</p></div></div><div class="table-wrap"><table data-fu-table data-fu-selected="'+esc(followupView==='gaps'?followupPersonId:'')+'"><thead><tr>'+heads.map(h=>'<th>'+h+'</th>').join('')+'</tr></thead><tbody>'+rows.map(x=>{const e=detail?x.e:x,a=evaluate(e);return '<tr data-fu-person-id="'+esc(e.id)+'"><td><button class="person-open" '+(followupView==='people'?'data-fu-open="'+esc(e.id)+'"':'data-hub-person="'+esc(e.id)+'"')+'>'+esc(e.firstName+' '+e.lastName)+'</button></td><td>'+esc(e.lab)+'</td><td>'+esc(e.pl)+'</td><td>'+esc(e.title)+'</td>'+(detail?'<td>'+esc(HUB_SKILLS[x.i])+'</td><td>'+x.kind+'</td><td><span class="fu-status '+(x.planned?'planned':'pending')+'">'+(x.planned?'มีแผน · '+esc(e.cells[x.i]):'ยังไม่มีแผน')+'</span></td>':'<td '+(a.gap?followupClickAttrs(e):'')+'>'+(a.total?(a.total-a.gap)+' / '+a.total:'N/A')+'</td><td '+(a.gap?followupClickAttrs(e):'')+'>'+a.gap+'</td><td><span '+(a.gap?followupClickAttrs(e):'')+' class="fu-status '+(a.total?'pending':'neutral')+'">'+(a.total?'ยังไม่ครบ':'ไม่มีเกณฑ์ประเมิน')+'</span></td>')+'</tr>';}).join('')+'</tbody></table></div></section>';
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
 return `<section class="panel up-linked-detail"><div class="panel-head"><div><h3>${label}</h3><p>${new Set(rows.map(x=>String(x.e.id))).size} คน · ${rows.length} รายการเรียน · สะสมถึงปี ${esc(year)}</p></div></div><div class="table-wrap"><table class="up-results-table"><colgroup><col style="width:18%"><col style="width:10%"><col style="width:6%"><col style="width:23%"><col style="width:24%"><col style="width:12%"><col style="width:7%"></colgroup><thead><tr>${['ชื่อ–นามสกุล','แล็บ / BU','PL','ตำแหน่ง','หลักสูตร Upskilling','สถานะ','ข้อมูลต้นฉบับ'].map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(x=>`<tr><td><button class="person-open" data-hub-person="${esc(x.e.id)}">${esc(x.e.firstName+' '+x.e.lastName)}</button></td><td>${esc(x.e.lab)}</td><td>${esc(x.e.pl)}</td><td>${esc(x.e.title)}</td><td><button class="text-link" data-hub-skill="${x.i}" data-domain="up">${esc(x.course)}</button></td><td><span class="status ${x.complete?'done':x.planned?'':'none'}">${x.complete?'สำเร็จ':x.planned?'มีแผน · ยังไม่สำเร็จ':'ยังไม่มีแผน'}</span></td><td>${esc(x.raw)}</td></tr>`).join('')}</tbody></table></div></section>`;
}
function upLinkedPage(report=false){const d=upLinkedData();return `<div class="up-linked-intro"><h2>${report?'รายงานผล Upskilling':'ติดตามแผน Upskilling'}</h2><p>นับเฉพาะผู้มีรายการเรียนในฐาน Upskilling · ช่องว่างไม่ถือว่าเรียนไม่ครบ · แยกจากเกณฑ์ Must / Should</p></div>${upLinkedCards(d)}${upLinkedTable(d)}${report?upCourseReport(d):''}`;}
function upCourseReport(d){return `<section class="panel"><div class="panel-head"><div><h3>ผล Upskilling รายหลักสูตร</h3><p>คลิกชื่อหลักสูตรเพื่อเจาะรายชื่อผ่าน Mind map</p></div></div><div class="table-wrap"><table><thead><tr>${['หลักสูตร','ผู้มีรายการเรียน (คน)','สำเร็จ (คน)','มีแผน (คน)','ยังไม่มีแผน (คน)','ความก้าวหน้า'].map(x=>`<th>${x}</th>`).join('')}</tr></thead><tbody>${d.courses.map(c=>`<tr><td><button class="text-link" data-hub-skill="${c.i}" data-domain="up">${esc(c.name)}</button></td><td>${c.eligible}</td><td>${c.complete}</td><td>${c.planned}</td><td>${c.unplanned}</td><td>${c.eligible?pct(c.pct)+'%':'—'}</td></tr>`).join('')}</tbody></table></div></section><section class="panel"><div class="panel-head"><h3>ผล Upskilling แยก BU</h3></div><div class="table-wrap"><table><thead><tr><th>BU</th><th>ผู้มีรายการเรียน (คน)</th><th>รายการเรียน</th><th>สำเร็จ</th><th>มีแผน</th><th>ยังไม่มีแผน</th></tr></thead><tbody>${[...new Set(d.rows.map(x=>x.e.lab))].sort().map(bu=>{const r=d.rows.filter(x=>x.e.lab===bu);return `<tr><td><button class="text-link" data-up-bu="${esc(bu)}">${esc(bu)}</button></td><td>${new Set(r.map(x=>String(x.e.id))).size}</td><td>${r.length}</td><td>${r.filter(x=>x.complete).length}</td><td>${r.filter(x=>x.planned).length}</td><td>${r.filter(x=>!x.complete&&!x.planned).length}</td></tr>`;}).join('')}</tbody></table></div></section>`;}
const overviewWithCore=hubOverview;
hubOverview=function(){const d=upLinkedData();return overviewWithCore()+`<section class="up-overview"><div class="hub-section-heading"><div><h2>Upskilling · หลักสูตรเสริมทักษะ</h2><p>${d.people} คน · ${d.rows.length} รายการเรียน · สำเร็จ ${d.done} · มีแผน ${d.planned} รายการ</p></div><div class="actions"><button class="btn primary" data-up-go="followup">ติดตามแผน Upskilling ↗</button><button class="btn" data-up-go="reports">รายงาน Upskilling ↗</button></div></div><div class="hub-skills-grid">${d.courses.map(c=>hubSkillCard(c.i,'up')).join('')}</div></section>`;};
const reportsWithCore=hubReports;
hubReports=function(){return sectionDomainTabs('reports')+(sectionDomains.reports==='up'?`<div class="hub-report-filters"><label class="report-pl-filter ${pl?'is-filtered':''}"><span>ระดับ PL</span> <select id="pl" aria-label="กรองระดับ PL">${options(ups.map(e=>e.pl),pl,'ทุก PL')}</select></label><button class="btn" data-hub="print">${icon('print')} พิมพ์ PDF</button></div>`+upLinkedPage(true):reportsWithCore().replaceAll('<div class="panel-head">','<div class="panel-head report-category-head">'));};
document.addEventListener('click',e=>{
 const domain=e.target.closest('[data-section-domain]');if(domain){sectionDomains[domain.dataset.sectionPage]=domain.dataset.sectionDomain;upCardView='all';renderContent();return;}
 const card=e.target.closest('[data-up-card]');if(card){upCardView=card.dataset.upCard;renderContent();return;}
 const go=e.target.closest('[data-up-go]');if(go){tab=go.dataset.upGo;sectionDomains[tab]='up';upCardView='all';shell();window.scrollTo(0,0);return;}
 const bu=e.target.closest('[data-up-bu]');if(bu){lab=bu.dataset.upBu;upCardView='all';shell();return;}
});

const sharedTableRender=renderContent;
renderContent=function(){closeUniversalFilter();if(tab!=='followup'||sectionDomains.followup!=='core')clearFollowupPerson();if(tab==='followup')$('#content').innerHTML=sectionDomainTabs('followup')+(sectionDomains.followup==='up'?upLinkedPage():followupPage());else sharedTableRender();enhanceTables();};
document.addEventListener('click',e=>{
 const person=e.target.closest('[data-fu-open]');if(person){openFollowupPerson(person.dataset.fuOpen);return;}
 const c=e.target.closest('[data-fu-view]');if(c){clearFollowupPerson();followupView=c.dataset.fuView;renderContent();return;}
 if(e.target.closest('[data-hub="reset"]')&&followupPersonId){clearFollowupPerson();renderContent();}
});
document.addEventListener('keydown',e=>{const p=e.target.closest?.('[data-fu-open]');if(p&&p.tagName!=='BUTTON'&&(e.key==='Enter'||e.key===' ')){e.preventDefault();openFollowupPerson(p.dataset.fuOpen);}});

const universalTables=new WeakMap();
let universalPopup=null;
function closeUniversalFilter(){if(universalPopup){universalPopup.trigger.setAttribute('aria-expanded','false');universalPopup.el.remove();universalPopup=null;}}
function tableCellText(cell){if(!cell)return '';const copy=cell.cloneNode(true);copy.querySelectorAll('.avatar,.icon,svg,.ut-filter').forEach(x=>x.remove());const matrix=copy.querySelector('.matrix-cell');if(matrix?.title)return matrix.title;return copy.textContent.replace(/\s+/g,' ').trim();}
function universalMatches(values,query,filters){return values.join(' ').toLocaleLowerCase('th').includes(query.toLocaleLowerCase('th'))&&filters.every((set,i)=>!set||set.has(values[i]));}
function universalVisible(s){return s.rows.filter(r=>(!s.personId||String(r.personId)===s.personId)&&universalMatches(r.values,s.query,s.filters));}
function applyUniversal(s){
 const visible=new Set(universalVisible(s));s.rows.forEach(r=>r.el.hidden=!visible.has(r));
 s.count.textContent='แสดง '+visible.size+' / '+s.rows.length+' รายการ';s.export.disabled=!visible.size;
 s.empty.hidden=!!visible.size;
 s.buttons.forEach((b,i)=>{const f=s.filters[i];b.classList.toggle('filtered',!!f);b.title=f?'กรองอยู่: '+[...f].join(' / '):'กรอง '+s.headers[i];b.setAttribute('aria-label','กรอง '+s.headers[i]+(f?' · เลือก '+f.size+' ค่า':''));});
}
function openUniversalFilter(s,i,trigger){
 if(universalPopup?.trigger===trigger){closeUniversalFilter();return;}closeUniversalFilter();
 const values=[...new Set(s.rows.map(r=>r.values[i]))].sort((a,b)=>a.localeCompare(b,'th'));let draft=new Set(s.filters[i]||values);
 const el=document.createElement('div');el.className='ut-popup';el.setAttribute('role','dialog');el.setAttribute('aria-label','กรอง '+s.headers[i]);el.innerHTML='<strong>'+esc(s.headers[i])+'</strong><input type="search" placeholder="ค้นหาค่าในคอลัมน์…" aria-label="ค้นหาค่าในคอลัมน์"><label class="ut-all"><input type="checkbox"> เลือกทั้งหมด</label><div class="ut-options"></div><div class="ut-popup-footer"><span></span><button type="button">ใช้ตัวกรอง</button></div>';
 (s.table.closest('dialog')||document.body).append(el);universalPopup={el,trigger};trigger.setAttribute('aria-expanded','true');
 const input=el.querySelector('input[type=search]'),all=el.querySelector('.ut-all input'),list=el.querySelector('.ut-options'),count=el.querySelector('.ut-popup-footer span');
 function draw(){const q=input.value.toLocaleLowerCase('th');list.replaceChildren();for(const value of values.filter(v=>v.toLocaleLowerCase('th').includes(q))){const label=document.createElement('label'),check=document.createElement('input');check.type='checkbox';check.checked=draft.has(value);label.append(check,document.createTextNode(value||'ไม่ระบุ'));check.addEventListener('change',()=>{check.checked?draft.add(value):draft.delete(value);update();});list.append(label);}if(!list.children.length)list.textContent='ไม่พบค่าที่ค้นหา';update();}
 function update(){all.checked=draft.size===values.length;all.indeterminate=draft.size>0&&draft.size<values.length;count.textContent='เลือก '+draft.size+' ค่า';}
 input.addEventListener('input',draw);all.addEventListener('change',()=>{draft=new Set(all.checked?values:[]);draw();});
 el.querySelector('button').addEventListener('click',()=>{s.filters[i]=draft.size===values.length?null:new Set(draft);applyUniversal(s);closeUniversalFilter();trigger.focus();});
 draw();const r=trigger.getBoundingClientRect(),w=Math.min(370,innerWidth-24),h=Math.min(500,innerHeight-24);el.style.cssText='width:'+w+'px;height:'+h+'px;left:'+Math.max(12,Math.min(r.left,innerWidth-w-12))+'px;top:'+Math.max(12,Math.min(r.bottom+6,innerHeight-h-12))+'px';input.focus();
}
function enhanceTables(){
 document.querySelectorAll('.hub-report-labs .report-number').forEach(b=>{const t=b.textContent.trim();b.dataset.zero=String(t==='0');b.dataset.low=String(t.endsWith('%')&&Number.parseFloat(t)<100);});
 document.querySelectorAll('#content table,#detail table').forEach(table=>{
 if(table.hasAttribute('data-batch-table')||table.closest('.lm-details')||universalTables.has(table)||!table.tHead||!table.tBodies.length)return;
 const headers=[...table.tHead.rows[0].cells].map(c=>tableCellText(c));
 const rows=[...table.tBodies[0].rows].filter(r=>r.cells.length===headers.length&&!r.querySelector('[colspan]')).map(el=>({el,personId:el.dataset.fuPersonId||'',values:[...el.cells].map(tableCellText)}));
 const bar=document.createElement('div');bar.className='ut-toolbar';bar.innerHTML='<label>'+icon('search')+'<input type="search" placeholder="ค้นหาในตารางทุกคอลัมน์…" aria-label="ค้นหาในตาราง"></label><span class="ut-count"></span><button class="ut-reset filter-reset"><span class="filter-reset-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="M3 10a9 9 0 1 1 2 8M3 4v6h6"/></svg></span><span>ล้างตัวกรองตาราง</span></button><button class="ut-export">'+icon('export')+' Export Excel</button>';
 const wrap=table.closest('.table-wrap')||table;wrap.before(bar);
 const empty=document.createElement('p');empty.className='ut-empty';empty.textContent='ไม่พบรายการตามตัวกรอง';wrap.after(empty);
 const personId=table.dataset.fuSelected||'',selected=personId?records.find(e=>String(e.id)===personId):null;
 const s={table,headers,rows,personId,query:selected?selected.firstName+' '+selected.lastName:'',filters:headers.map(()=>null),buttons:[],count:bar.querySelector('.ut-count'),export:bar.querySelector('.ut-export'),empty};
 universalTables.set(table,s);
 [...table.tHead.rows[0].cells].forEach((cell,i)=>{const b=document.createElement('button');b.type='button';b.className='ut-filter';b.setAttribute('aria-expanded','false');b.setAttribute('aria-haspopup','dialog');b.setAttribute('aria-label','กรอง '+(headers[i]||'การทำงาน'));b.addEventListener('click',()=>openUniversalFilter(s,i,b));const title=document.createElement('span');title.className='ut-heading-label';const notes=[...cell.children].filter(n=>n.tagName==='SMALL');[...cell.childNodes].filter(n=>!notes.includes(n)).forEach(n=>title.append(n));const arrow=document.createElement('span');arrow.className='ut-heading-arrow';arrow.setAttribute('aria-hidden','true');arrow.textContent='▾';b.append(title,arrow);cell.prepend(b);s.buttons.push(b);if(!headers[i])b.hidden=true;});
 bar.querySelector('input').value=s.query;
 bar.querySelector('input').addEventListener('input',e=>{if(s.personId){clearFollowupPerson();s.personId='';table.dataset.fuSelected='';}s.query=e.target.value;applyUniversal(s);});
 bar.querySelector('.ut-reset').addEventListener('click',()=>{if(s.personId){clearFollowupPerson();s.personId='';table.dataset.fuSelected='';}s.query='';s.filters=headers.map(()=>null);bar.querySelector('input').value='';closeUniversalFilter();applyUniversal(s);});
 s.export.addEventListener('click',()=>{const items=universalVisible(s).map(r=>Object.fromEntries(headers.map((h,i)=>[h||'การทำงาน',r.values[i]]).filter(([h])=>h!=='การทำงาน')));hubDownloadWorkbook([['รายการที่กรอง',items],['เงื่อนไข',[{'หน้า':hubTitle(),'ปีสะสม':year,'BU':lab||'ทั้งหมด','คำค้นหาตาราง':s.query,...(s.personId?{'รหัสบุคคลที่เลือก':s.personId}:{}),'จำนวนรายการ':items.length,...Object.fromEntries(headers.map((h,i)=>['กรอง '+h,s.filters[i]?[...s.filters[i]].join(' / '):'ทั้งหมด']))}]]],'TA_Table_'+year+'.xlsx');});
 const footer=wrap.parentElement.querySelector(':scope > .table-footer');if(footer)footer.hidden=true;
 applyUniversal(s);
 });
}
document.addEventListener('click',e=>{if(universalPopup&&!universalPopup.el.contains(e.target)&&!universalPopup.trigger.contains(e.target))closeUniversalFilter();});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeUniversalFilter();});
window.addEventListener('resize',closeUniversalFilter);
const tableObserver=new MutationObserver(()=>enhanceTables());tableObserver.observe(document.getElementById('detail'),{childList:true,subtree:true});
if(document.getElementById('content'))renderContent();
