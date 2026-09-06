const assignmentStorageKey = 'hku-moodle-snapshot-v1';
let assignmentSnapshot = null;
let assignmentStorageError = '';

function parseAssignmentSnapshot(text) {
  const snapshot = JSON.parse(text);
  const validDate = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:00\+08:00$/.test(value) && Number.isFinite(Date.parse(value));
  if(snapshot.version !== 1 || !validDate(snapshot.checkedAt) || !Array.isArray(snapshot.tasks) || snapshot.tasks.length > 500) throw new Error('快照格式无效。');
  const ids = new Set();
  snapshot.tasks = snapshot.tasks.map(task => {
    const source = new URL(task.url);
    if(!task.id || ids.has(task.id) || !window.courses.some(c=>c.code===task.courseCode) || typeof task.title !== 'string' || !task.title.trim() ||
      source.origin !== 'https://moodle.hku.hk' || !['/mod/assign/view.php','/mod/quiz/view.php','/course/section.php','/course/view.php'].includes(source.pathname) ||
      [...source.searchParams.keys()].some(key=>key!=='id') || !/^\d+$/.test(source.searchParams.get('id') || '') ||
      (task.due !== null && !validDate(task.due)) || (task.opens && !validDate(task.opens))) throw new Error('作业字段、日期或 Moodle 来源链接无效。');
    ids.add(task.id);
    return {id:String(task.id),courseCode:task.courseCode,title:task.title,due:task.due,opens:task.opens || null,url:source.href,
      note:String(task.note || ''),sourceName:String(task.sourceName || ''),status:String(task.status || '未核对提交状态')};
  });
  return {version:1,checkedAt:snapshot.checkedAt,tasks:snapshot.tasks,coverage:String(snapshot.coverage || '')};
}

try {
  const stored = localStorage.getItem(assignmentStorageKey);
  if(stored) assignmentSnapshot = parseAssignmentSnapshot(stored);
} catch { assignmentStorageError = '本地缓存无法读取，将尝试获取公开快照。'; }

function assignmentItems(term) {
  return (assignmentSnapshot?.tasks || []).filter(task=>window.courses.find(c=>c.code===task.courseCode)?.semester===term)
    .sort((a,b)=>(a.due || '9999').localeCompare(b.due || '9999'));
}

function assignmentDate(value) {
  if(!value) return '截止时间未公布';
  return `${value.slice(0,10)} ${value.slice(11,16)}${value.slice(11,16)==='00:00'?'（当天开始，前一晚需完成）':''}`;
}

function assignmentTiming(task) {
  if(!task.due) return '待确认截止时间';
  const remaining = Date.parse(task.due)-Date.now();
  if(remaining <= 0) return '截止时间已过 · 请核对提交状态';
  if(task.opens && Date.parse(task.opens)>Date.now()) return '尚未开放';
  return remaining < 86400000 ? `距截止不足 ${Math.max(1,Math.ceil(remaining/3600000))} 小时` : `距截止 ${Math.ceil(remaining/86400000)} 天`;
}

function assignmentCalendar(date,term) {
  return assignmentItems(term).filter(task=>task.due?.startsWith(date)).map(task=>{
    const course = window.courses.find(c=>c.code===task.courseCode);
    return `<button class="calendar-event is-deadline" style="--course:${course.color}" data-assignment-id="${esc(task.id)}"><div><span>${esc(task.due.slice(11,16))} 截止</span><strong>${esc(task.courseCode)}</strong></div><p>${esc(task.title)}</p></button>`;
  }).join('');
}

function renderAssignments(term) {
  const list = assignmentItems(term);
  const stale = assignmentSnapshot && Date.now()-Date.parse(assignmentSnapshot.checkedAt)>24*3600000;
  document.querySelector('#assignmentSummary').textContent = assignmentSnapshot ? `${list.length} 项作业／测验 · 最近核对 ${assignmentDate(assignmentSnapshot.checkedAt)} 香港时间${stale?' · 超过 24 小时未核对，请查看 Moodle':''}` : '正在获取公开作业快照。';
  document.querySelector('#assignmentList').innerHTML = `${assignmentSnapshot?.coverage?`<p class="assignment-coverage">${esc(assignmentSnapshot.coverage)}</p>`:''}${assignmentStorageError?`<p>${esc(assignmentStorageError)}</p>`:''}${list.length ? list.map(task=>{
    const course = window.courses.find(c=>c.code===task.courseCode);
    return `<article class="assignment-card" style="--course:${course.color}"><div><span>${esc(task.courseCode)}</span><h2>${esc(task.title)}</h2><p>${esc(assignmentDate(task.due))} · 香港时间</p><p>${esc(assignmentTiming(task))}</p></div><button data-assignment-id="${esc(task.id)}">查看详情</button></article>`;
  }).join('') : '<p class="assignment-empty">当前学期暂无快照作业记录。这不代表 Moodle 中没有待办事项。</p>'}`;
}

function openAssignment(id,trigger) {
  const task = assignmentSnapshot?.tasks.find(task=>task.id===id);
  if(!task) return;
  const course = window.courses.find(c=>c.code===task.courseCode);
  lastDetailTrigger = trigger;
  document.querySelector('#detailContent').innerHTML = `<div class="detail-accent" style="--course:${course.color}"></div><div class="detail-kicker"><span>${esc(task.courseCode)}</span><b>作业／测验</b></div><h2 id="detailTitle">${esc(task.title)}</h2><div class="detail-tags"><span>${esc(assignmentTiming(task))}</span></div><dl><div><dt>截止</dt><dd>${esc(assignmentDate(task.due))}</dd></div><div><dt>开放</dt><dd>${task.opens?esc(assignmentDate(task.opens)):'页面未显示'}</dd></div><div><dt>时区</dt><dd>香港时间（UTC+8）</dd></div><div><dt>状态</dt><dd>${esc(task.status)}（核对时）</dd></div><div><dt>来源</dt><dd>${esc(task.sourceName || course.title)}</dd></div></dl><section class="detail-course" style="--course:${course.color}"><small>要求与备注</small><p>${esc(task.note || '请查看 Moodle 原页面。')}</p><a class="moodle-link" href="${esc(task.url)}" target="_blank" rel="noopener noreferrer">查看 Moodle 原页面 ↗</a><p>核对于 ${esc(assignmentDate(assignmentSnapshot.checkedAt))}；后续变更以 Moodle 为准。</p></section>`;
  document.querySelector('#detailBackdrop').hidden=false;
  document.querySelector('#detailPanel').classList.add('is-open');
  document.querySelector('#detailPanel').setAttribute('aria-hidden','false');
  document.querySelector('#detailPanel').scrollTop=0;
  document.querySelector('#closeDetails').focus();
}

document.querySelector('#assignmentList').addEventListener('click',event=>{
  const button=event.target.closest('[data-assignment-id]');
  if(button) openAssignment(button.dataset.assignmentId,button);
});

function importAssignmentText(text) {
  const status=document.querySelector('#assignmentImportStatus');
  try {
    const next=parseAssignmentSnapshot(text);
    if(assignmentSnapshot && Date.parse(next.checkedAt)<Date.parse(assignmentSnapshot.checkedAt)) {
      status.textContent='未更新：此快照早于当前数据，请使用最新快照。';
      return;
    }
    localStorage.setItem(assignmentStorageKey,JSON.stringify(next));
    assignmentSnapshot=next;
    assignmentStorageError='';
    document.querySelector('#assignmentSyncStatus').textContent='当前显示手动导入的数据；下次同步将以公开快照为准。';
    closeDetails();
    render();
    document.querySelector('#assignmentInput').value='';
    status.textContent=`已保存 ${next.tasks.length} 项。本次快照仅保存在此浏览器。`;
  } catch { status.textContent='导入失败：请检查 JSON 格式、课程代码、UTC+8 日期和 Moodle 链接，并确认浏览器允许本地存储。旧快照未替换。'; }
}
document.querySelector('#importAssignments').addEventListener('click',()=>importAssignmentText(document.querySelector('#assignmentInput').value));
document.querySelector('#assignmentFile').addEventListener('change',async event=>{
  const file=event.target.files[0];
  if(!file) return;
  try { importAssignmentText(await file.text()); }
  catch { document.querySelector('#assignmentImportStatus').textContent='文件读取失败，请重试。'; }
  event.target.value='';
});

// Share cached snapshots between open planner tabs.
window.addEventListener('storage',event=>{
  if(event.key!==assignmentStorageKey || !event.newValue) return;
  try {
    const next=parseAssignmentSnapshot(event.newValue);
    if(assignmentSnapshot && Date.parse(next.checkedAt)<Date.parse(assignmentSnapshot.checkedAt)) return;
    assignmentSnapshot=next;
    assignmentStorageError='';
    closeDetails();
    render();
  } catch { document.querySelector('#assignmentImportStatus').textContent='自动更新数据无效，已保留当前显示。'; }
});
setInterval(()=>renderAssignments(Number(document.querySelector('#semester').value)),60000);

let assignmentRefreshPending = false;
async function refreshPublicAssignments() {
  if(assignmentRefreshPending) return;
  assignmentRefreshPending=true;
  const status=document.querySelector('#assignmentSyncStatus');
  const button=document.querySelector('#refreshAssignments');
  button.disabled=true;
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),15000);
  try {
    const response=await fetch('assignments.json',{cache:'no-store',signal:controller.signal});
    if(!response.ok) throw new Error('无法获取公开快照');
    const next=parseAssignmentSnapshot(await response.text());
    const changed=JSON.stringify(next)!==JSON.stringify(assignmentSnapshot);
    assignmentSnapshot=next;
    assignmentStorageError='';
    try { localStorage.setItem(assignmentStorageKey,JSON.stringify(next)); }
    catch { assignmentStorageError='当前浏览器无法缓存；在线数据仍正常显示。'; }
    if(changed) { closeDetails();render(); }
    else renderAssignments(Number(document.querySelector('#semester').value));
    status.textContent='已读取公开快照 · 页面每 5 分钟检查网站更新。Moodle 最近核对时间见上方。';
  } catch {
    status.textContent=assignmentSnapshot?'公开快照暂时无法更新，已保留当前数据；稍后自动重试。':'公开快照暂时无法加载，请稍后重试或导入备用快照。';
  } finally {
    clearTimeout(timeout);
    assignmentRefreshPending=false;
    button.disabled=false;
  }
}
document.querySelector('#refreshAssignments').addEventListener('click',refreshPublicAssignments);
document.addEventListener('visibilitychange',()=>{if(!document.hidden) refreshPublicAssignments();});
setInterval(()=>{if(!document.hidden) refreshPublicAssignments();},5*60000);
document.addEventListener('DOMContentLoaded',refreshPublicAssignments);
