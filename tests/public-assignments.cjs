const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');

async function check(storageBlocked = false) {
  const indexSource = fs.readFileSync('public/index.html','utf8');
  const appSource = fs.readFileSync('public/app.js','utf8');
  assert.match(indexSource,/<h1 id="headline">秋季课表<\/h1>/);
  assert.doesNotMatch(indexSource,/星期负荷|data-tab="load"|id="load"/);
  assert.ok(appSource.includes("?'秋季课表':'春季课表'"));
  assert.doesNotMatch(appSource,/loadView|#load/);
  const elements = new Map();
  const element = key => {
    if(!elements.has(key)) elements.set(key,{innerHTML:'',textContent:'',value:'1',hidden:false,dataset:{},style:{setProperty(){}},classList:{add(){},remove(){}},addEventListener(){},setAttribute(){},focus(){}});
    return elements.get(key);
  };
  let source = fs.readFileSync('public/assignments.json','utf8');
  assert.ok(JSON.parse(source).tasks.every(task=>task.status==='个人提交状态请在 Moodle 查看'),'public snapshot excludes personal submission states');
  let fail = false;
  let calls = 0;
  const handlers = {};
  const ctx = vm.createContext({URL,console,AbortController,setTimeout,clearTimeout,setInterval(){},
    window:{addEventListener(){}},document:{querySelector:element,querySelectorAll:()=>[],addEventListener:(event,handler)=>handlers[event]=handler,body:element('body')},
    localStorage:{getItem(){return null;},setItem(){if(storageBlocked) throw new Error('blocked');}},
    fetch:async (url,options)=>{calls++;assert.equal(url,'assignments.json');assert.equal(options.cache,'no-store');if(fail) throw new Error('offline');return {ok:true,text:async()=>source};}
  });
  for(const file of ['data.js','assignments.js','app.js']) vm.runInContext(fs.readFileSync(`public/${file}`,'utf8'),ctx);
  await handlers.DOMContentLoaded();
  assert.equal(calls,1,'loads automatically without import');
  assert.equal(ctx.assignmentItems(1).length,7);
  assert.equal(ctx.nextAssignment(1,Date.parse('2026-09-06T12:00:00+08:00')).id,'msph7901-assign-4207273');
  ctx.renderUrgentAssignment(1,Date.parse('2026-09-06T12:00:00+08:00'));
  assert.equal(element('#urgentBanner').hidden,false);
  assert.equal(element('#urgentTitle').textContent,'Bonus Assignment');
  assert.equal(element('#urgentAction').dataset.assignmentId,'msph7901-assign-4207273');
  assert.equal(element('#sessionCount').textContent,61);
  assert.equal(element('#headline').textContent,'秋季课表');
  assert.match(element('#assignmentSyncStatus').textContent,/已读取公开/);
  const next=JSON.parse(source);
  next.tasks[0].due='2026-09-30T23:59:00+08:00';
  source=JSON.stringify(next);
  await ctx.refreshPublicAssignments();
  assert.match(ctx.assignmentCalendar('2026-09-30',1),/data-assignment-id/);
  fail=true;
  await ctx.refreshPublicAssignments();
  assert.equal(ctx.assignmentItems(1).length,7);
  assert.match(element('#assignmentSyncStatus').textContent,/保留/);
  fail=false;source='invalid';
  await ctx.refreshPublicAssignments();
  assert.equal(ctx.assignmentItems(1).length,7);
}
(async()=>{await check();await check(true);console.log('PASS: public startup load, refresh, calendar, offline/invalid fallback, storage disabled.');})().catch(error=>{console.error(error);process.exitCode=1;});
