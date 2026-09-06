const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const elements=new Map();
const listeners={};
const element=key=>{
  if(!elements.has(key)) elements.set(key,{innerHTML:'',textContent:'',value:'1',hidden:false,dataset:{},style:{setProperty(){}},classList:{add(){},remove(){}},addEventListener(event,handler){listeners[`${key}:${event}`]=handler;},setAttribute(){},focus(){}});
  return elements.get(key);
};
const documentHandlers={};
const sources={
  'assignments.json':fs.readFileSync('public/assignments.json','utf8'),
  'announcements.json':fs.readFileSync('public/announcements.json','utf8')
};
const ctx=vm.createContext({URL,console,Date,AbortController,setTimeout,clearTimeout,setInterval(){},localStorage:{getItem(){return null;},setItem(){}},window:{courses:null,addEventListener(){}},fetch:async url=>({ok:true,text:async()=>sources[url]}),document:{hidden:false,querySelector:element,querySelectorAll:()=>[],addEventListener(event,handler){(documentHandlers[event]||=[]).push(handler);},body:element('body')}});
for(const file of ['data.js','assignments.js','announcements.js','app.js']) vm.runInContext(fs.readFileSync(`public/${file}`,'utf8'),ctx);
(async()=>{
  for(const handler of documentHandlers.DOMContentLoaded) await handler();
  assert.equal(ctx.announcementItems(1).length,2);
  const next=ctx.nextAnnouncementDeadline(1,Date.parse('2026-09-07T00:00:00+08:00'));
  assert.equal(next.id,'moodle-discussion-1045303');
  assert.equal(next.keyDate.at,'2026-09-12T23:59:00+08:00');
  ctx.renderUrgentAssignment(1,Date.parse('2026-09-07T00:00:00+08:00'));
  assert.equal(element('#urgentTitle').textContent,'Practical 1 报名截止');
  assert.equal(element('#urgentAction').dataset.announcementId,'moodle-discussion-1045303');
  ctx.openAnnouncement(next.id,element('trigger'));
  assert.match(element('#detailContent').innerHTML,/d=1045303/);
  assert.doesNotMatch(element('#detailContent').innerHTML,/@connect\.hku\.hk/);
  const unsafe=JSON.parse(sources['announcements.json']);
  unsafe.items[0].url='https://evil.example/discuss.php?d=1045303';
  assert.throws(()=>ctx.parseAnnouncementSnapshot(JSON.stringify(unsafe)));
  console.log('PASS: 2 public announcements, forum URL validation, priority deadline banner, no contact details.');
})().catch(error=>{console.error(error);process.exitCode=1;});
