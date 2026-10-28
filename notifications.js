/* Shared, top-layer notifications. No data or network access. */
'use strict';
window.TA_NOTIFY=(()=>{
  let dialog, current=null, timer=0; const queue=[];
  const labels={success:'ดำเนินการเรียบร้อย',error:'ดำเนินการไม่สำเร็จ',warning:'กรุณาตรวจสอบ',info:'แจ้งให้ทราบ',loading:'กำลังดำเนินการ',confirm:'ยืนยันการดำเนินการ'};
  function ensure(){
    if(dialog)return;
    dialog=document.createElement('dialog');dialog.id='ta-notification';dialog.className='ta-notification';
    dialog.setAttribute('aria-labelledby','ta-notification-title');dialog.setAttribute('aria-describedby','ta-notification-message');
    dialog.innerHTML='<div class="ta-notification-symbol" aria-hidden="true"></div><h2 id="ta-notification-title"></h2><p id="ta-notification-message"></p><div class="ta-notification-actions"><button type="button" class="btn ta-notification-cancel">ยกเลิก</button><button type="button" class="btn primary ta-notification-ok">ตกลง</button></div><small class="ta-notification-hint"></small>';
    document.body.appendChild(dialog);
    dialog.querySelector('.ta-notification-ok').addEventListener('click',()=>finish(true));
    dialog.querySelector('.ta-notification-cancel').addEventListener('click',()=>finish(false));
    dialog.addEventListener('cancel',e=>{e.preventDefault();e.stopPropagation();finish(false);});
    dialog.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();finish(false);}else if(e.key==='Tab'){const buttons=[...dialog.querySelectorAll('button')].filter(b=>!b.hidden);const first=buttons[0],last=buttons[buttons.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});
    // Keep enough reading time after any deliberate interaction.
    ['pointerenter','pointerdown','keydown'].forEach(type=>dialog.addEventListener(type,()=>clearTimeout(timer)));
    dialog.addEventListener('click',e=>e.stopPropagation());
  }
  function finish(answer){
    if(!current)return;clearTimeout(timer);const item=current;current=null;dialog.close();
    if(item.focus?.isConnected)item.focus.focus({preventScroll:true});
    item.resolve(item.type==='confirm'?!!answer:true);
    if(queue.length)show(queue.shift());
  }
  function show(item){
    ensure();current=item;item.focus=item.focus||document.activeElement;
    dialog.dataset.type=item.type;dialog.setAttribute('role',item.type==='error'||item.type==='confirm'?'alertdialog':'dialog');
    dialog.querySelector('h2').textContent=item.title||labels[item.type]||labels.info;
    dialog.querySelector('p').textContent=item.message;
    dialog.querySelector('.ta-notification-symbol').textContent=({success:'✓',error:'!',warning:'!',loading:'↻',confirm:'?',info:'i'})[item.type];
    const cancel=dialog.querySelector('.ta-notification-cancel'),ok=dialog.querySelector('.ta-notification-ok');
    cancel.hidden=item.type!=='confirm';ok.textContent=item.type==='confirm'?'ยืนยัน':item.type==='loading'?'ซ่อนข้อความ':'ตกลง';
    dialog.querySelector('small').textContent=item.type==='success'?'ปิดอัตโนมัติใน 5 วินาที · กดตกลงเพื่อปิดทันที':item.type==='loading'?'กรุณารอผลการดำเนินการ การซ่อนข้อความไม่ยกเลิกงาน':'';
    if(!dialog.open)dialog.showModal();(item.type==='confirm'?cancel:ok).focus({preventScroll:true});
    if(item.type==='success')timer=setTimeout(()=>{if(current===item)finish(true);},5000);
  }
  function notify(message,options={}){
    const type=options.type||(/ไม่สำเร็จ|ไม่สามารถ|ไม่ได้|ข้อผิดพลาด/.test(message)?'error':/^กำลัง/.test(message)?'loading':/สำเร็จ|เรียบร้อย|แล้ว/.test(message)?'success':'info');
    return new Promise(resolve=>{const item={message:String(message),...options,type,resolve};
      if(current){
        // A confirmation or error must be acknowledged, never silently overwritten.
        if(['confirm','error','warning'].includes(current.type)){queue.push(item);return;}
        clearTimeout(timer);const previous=current;current=null;item.focus=previous.focus;previous.resolve(true);
      }
      show(item);
    });
  }
  return {show:notify,confirm:message=>notify(message,{type:'confirm'})};
})();
