const announcementStorageKey='hku-moodle-announcements-v1';
let announcementSnapshot=null;
let announcementSyncPending=false;

function parseAnnouncementSnapshot(text) {
  const snapshot=JSON.parse(text);
  const validDate=value=>typeof value==='string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:00\+08:00$/.test(value) && Number.isFinite(Date.parse(value));
  if(snapshot.version!==1 || !validDate(snapshot.checkedAt) || !Array.isArray(snapshot.items) || snapshot.items.length>500) throw new Error('公告快照格式无效。');
  const ids=new Set();
  const items=snapshot.items.map(item=>{
    const source=new URL(item.url);
    if(!item.id || ids.has(item.id) || !window.courses.some(course=>course.code===item.courseCode) || typeof item.title!=='string' || !item.title.trim() || typeof item.body!=='string' || !item.body.trim() ||
      !validDate(item.publishedAt) || source.origin!=='https://moodle.hku.hk' || source.pathname!=='/mod/forum/discuss.php' || [...source.searchParams.keys()].some(key=>key!=='d') || !/^\d+$/.test(source.searchParams.get('d')||'') ||
      !['normal','important'].includes(item.priority) || !Array.isArray(item.keyDates) || item.keyDates.length>20) throw new Error('公告字段、日期或来源链接无效。');
    const keyDates=item.keyDates.map(date=>{
      if(typeof date.label!=='string' || !date.label.trim() || !validDate(date.at) || !['deadline','event'].includes(date.kind)) throw new Error('公告关键日期无效。');
      return {label:date.label,at:date.at,kind:date.kind};
    });
    ids.add(item.id);
    return {id:String(item.id),courseCode:item.courseCode,title:item.title,publishedAt:item.publishedAt,url:source.href,body:item.body,priority:item.priority,keyDates};
  });
  return {version:1,checkedAt:snapshot.checkedAt,coverage:String(snapshot.coverage||''),items};
}

try {
  const stored=localStorage.getItem(announcementStorageKey);
  if(stored) announcementSnapshot=parseAnnouncementSnapshot(stored);
} catch {}

function announcementItems(term) {
  return (announcementSnapshot?.items||[]).filter(item=>window.courses.find(course=>course.code===item.courseCode)?.semester===term)
    .sort((a,b)=>b.publishedAt.localeCompare(a.publishedAt));
}

function nextAnnouncementDeadline(term,now=Date.now()) {
  return announcementItems(term).flatMap(item=>item.keyDates.filter(date=>date.kind==='deadline' && Date.parse(date.at)>now).map(keyDate=>({...item,keyDate})))
    .sort((a,b)=>Date.parse(a.keyDate.at)-Date.parse(b.keyDate.at))[0]||null;
}

function renderAnnouncements(term) {
  const list=announcementItems(term);
  document.querySelector('#announcementSummary').textContent=announcementSnapshot?`${list.length} 则公告 · 最近核对 ${assignmentDate(announcementSnapshot.checkedAt)} 香港时间`:'正在获取课程公告。';
  document.querySelector('#announcementList').innerHTML=`${announcementSnapshot?.coverage?`<p class="assignment-coverage">${esc(announcementSnapshot.coverage)}</p>`:''}${list.length?list.map(item=>{
    const course=window.courses.find(course=>course.code===item.courseCode);
    const keyDate=item.keyDates.find(date=>date.kind==='deadline');
    return `<article class="assignment-card announcement-card" style="--course:${course.color}"><div><span>${esc(item.courseCode)}${item.priority==='important'?' · 重要':''}</span><h2>${esc(item.title)}</h2><p>${esc(assignmentDate(item.publishedAt))} 发布</p><p class="announcement-body">${esc(item.body)}</p>${keyDate?`<p class="announcement-deadline">${esc(keyDate.label)} · ${esc(assignmentDate(keyDate.at))}</p>`:''}</div><button data-announcement-id="${esc(item.id)}">查看详情</button></article>`;
  }).join(''):'<p class="assignment-empty">当前学期暂无已采集的课程公告。</p>'}`;
}

function openAnnouncement(id,trigger) {
  const item=announcementSnapshot?.items.find(item=>item.id===id);
  if(!item) return;
  const course=window.courses.find(course=>course.code===item.courseCode);
  lastDetailTrigger=trigger;
  document.querySelector('#detailContent').innerHTML=`<div class="detail-accent" style="--course:${course.color}"></div><div class="detail-kicker"><span>${esc(item.courseCode)}</span><b>课程公告</b></div><h2 id="detailTitle">${esc(item.title)}</h2><div class="detail-tags"><span>${item.priority==='important'?'重要通知':'一般通知'}</span></div><dl><div><dt>发布</dt><dd>${esc(assignmentDate(item.publishedAt))} · 香港时间</dd></div><div><dt>课程</dt><dd>${esc(course.title)}</dd></div>${item.keyDates.map(date=>`<div><dt>时间</dt><dd>${esc(date.label)} · ${esc(assignmentDate(date.at))}</dd></div>`).join('')}</dl><section class="detail-course announcement-detail" style="--course:${course.color}"><small>公告摘要</small><p>${esc(item.body)}</p><a class="moodle-link" href="${esc(item.url)}" target="_blank" rel="noopener noreferrer">查看 Moodle 原公告 ↗</a><p>核对于 ${esc(assignmentDate(announcementSnapshot.checkedAt))}；后续修改以 Moodle 为准。</p></section>`;
  document.querySelector('#detailBackdrop').hidden=false;
  document.querySelector('#detailPanel').classList.add('is-open');
  document.querySelector('#detailPanel').setAttribute('aria-hidden','false');
  document.body.classList.add('details-open');
  document.querySelector('#closeDetails').focus();
}

document.querySelector('#announcementList').addEventListener('click',event=>{
  const button=event.target.closest('[data-announcement-id]');
  if(button) openAnnouncement(button.dataset.announcementId,button);
});

async function refreshAnnouncements() {
  if(announcementSyncPending) return;
  announcementSyncPending=true;
  try {
    const response=await fetch('announcements.json',{cache:'no-store'});
    if(!response.ok) throw new Error('公告快照无法获取。');
    const next=parseAnnouncementSnapshot(await response.text());
    announcementSnapshot=next;
    try { localStorage.setItem(announcementStorageKey,JSON.stringify(next)); } catch {}
    renderAnnouncements(Number(document.querySelector('#semester').value));
    renderUrgentAssignment(Number(document.querySelector('#semester').value));
  } catch {
    document.querySelector('#announcementSummary').textContent=announcementSnapshot?'公告更新暂时不可用，已保留当前数据。':'课程公告暂时无法加载。';
  } finally { announcementSyncPending=false; }
}
document.addEventListener('visibilitychange',()=>{if(!document.hidden) refreshAnnouncements();});
setInterval(()=>{if(!document.hidden) refreshAnnouncements();},5*60000);
document.addEventListener('DOMContentLoaded',refreshAnnouncements);
