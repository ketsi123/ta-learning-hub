/* Google Sheets connection. The endpoint and spreadsheet id are not passwords. */
window.TA_CLOUD={enabled:!!window.TA_CONFIG?.requireCloud};
if(TA_CLOUD.enabled){

 async function call(action,payload,requestId){const url=window.TA_CONFIG.apiUrl;if(!/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(url||''))throw Error('ยังไม่ได้ตั้งค่า URL ของ Apps Script ใน config.js');const body={action,payload,requestId:requestId||TA_UID()};
 let response;try{response=await fetch(url,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(body),redirect:'follow',credentials:'omit'});}catch(e){throw Error('เชื่อมต่อ Apps Script ไม่สำเร็จ โปรดตรวจ deployment และการอนุญาตเข้าถึง หากเพิ่งบันทึกให้กดอ่านข้อมูลล่าสุดก่อนลองซ้ำ');}if(!response.ok)throw Error('Apps Script ตอบกลับ HTTP '+response.status);let r;try{r=await response.json();}catch(e){throw Error('Apps Script ไม่ได้ตอบกลับเป็น JSON โปรดตรวจ URL ลงท้าย /exec และตั้ง Web app ให้เรียก endpoint ได้');}if(!r.ok)throw Error(r.error||'บันทึกไม่สำเร็จ');return r.data;}

 window.TA_DB={open:async()=>{},seed:async()=>{},load:()=>call('load'),all:async name=>(await call('load'))[name],save:(person,core,up)=>call('save',{person,core,up},'save-'+TA_UID()),addBU:name=>call('addBU',{name}),backup:async()=>({format:'TA_PULSE_DATABASE',version:1,exportedAt:new Date().toISOString(),...await call('load')}),restore:async()=>{throw Error('การกู้คืนฐานกลางให้ผู้ดูแลดำเนินการใน Google Sheets เพื่อรักษาประวัติ')},replaceDataset:async()=>{throw Error('โหมดฐานกลาง: เพิ่มหรือแก้ไขผ่านเมนู Input การนำเข้าใหม่ให้ผู้ดูแลทบทวนใน Google Sheets ก่อน')}};
}
