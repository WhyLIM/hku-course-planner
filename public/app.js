const weekdays = ['周日','周一','周二','周三','周四','周五','周六'];
const esc = (value = '') => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const duration = item => { const [sh,sm]=item.start.split(':').map(Number); const [eh,em]=item.end.split(':').map(Number); return (eh*60+em-sh*60-sm)/60; };
const dateInfo = iso => { const d=new Date(`${iso}T12:00:00`); return {label:`${d.getMonth()+1}月${d.getDate()}日`, day:weekdays[d.getDay()], year:d.getFullYear(), index:d.getDay()}; };

let semester = '1';
const selected = () => window.courses.filter(c => c.semester === Number(semester));
const items = () => selected().flatMap(course => course.sessions.map(session => ({...session,course}))).sort((a,b) => `${a.date}${a.start}`.localeCompare(`${b.date}${b.start}`));

function timelineView(all) {
  const groups = all.reduce((acc,item) => ((acc[item.date] ??= []).push(item),acc),{});
  return `<div class="timeline">${Object.entries(groups).map(([date,list]) => { const info=dateInfo(date); return `<section class="day-row"><div class="date-stamp"><strong>${info.label}</strong><span>${info.day}</span><small>${info.year}</small></div><div class="day-events">${list.map(item => `<article class="event-card ${item.kind==='exam'?'is-exam':''}" style="--course:${item.course.color}"><div class="event-time">◷ ${item.start}–${item.end}</div><div class="event-copy"><div class="event-meta"><span class="course-dot"></span>${esc(item.course.code)}${item.optional?'<em>可选班次</em>':''}${item.kind==='exam'?'<em>考试</em>':''}</div><h3>${esc(item.title)}</h3><p>${esc([item.venue,item.teacher].filter(Boolean).join(' · ') || '地点待定')}</p></div></article>`).join('')}</div></section>`; }).join('')}</div>`;
}

function loadView(all) {
  const rows = weekdays.map((day,index) => { const list=all.filter(x => dateInfo(x.date).index===index && !x.optional); return {day,sessions:list.length,hours:list.reduce((n,x)=>n+duration(x),0)}; }).filter(x=>x.sessions);
  const max=Math.max(...rows.map(x=>x.hours),1);
  return `<div class="load-panel"><div class="load-intro"><span>按固定课次统计</span><strong>星期负荷</strong><p>可选 practical/tutorial 班次未计入，避免重复。</p></div><div class="bars">${rows.map(x=>`<div class="bar-row"><span>${x.day}</span><div class="bar-track"><i style="width:${Math.max(7,x.hours/max*100)}%"></i></div><strong>${x.hours}h</strong><small>${x.sessions} 次</small></div>`).join('')}</div></div>`;
}

function courseView(list) {
  return `<div class="course-grid">${list.map(course => { const fixed=course.sessions.filter(x=>!x.optional); const hours=fixed.reduce((n,x)=>n+duration(x),0); return `<article class="course-card" style="--course:${course.color}"><div class="course-top"><span>${esc(course.code)}</span><b>SEM ${course.semester}</b></div><h3>${esc(course.title)}</h3><div class="metric-line"><strong>${fixed.length}</strong><span>固定课次</span><strong>${hours}h</strong><span>课表时长</span></div><dl><div><dt>负责人</dt><dd>${esc(course.coordinator)}</dd></div><div><dt>形式</dt><dd>${esc(course.mode)}</dd></div><div><dt>地点</dt><dd>${esc(course.venue)}</dd></div>${course.assessment?`<div><dt>考核</dt><dd>${esc(course.assessment)}</dd></div>`:''}</dl>${course.note?`<p class="source-note">${esc(course.note)}</p>`:''}</article>`; }).join('')}</div>`;
}

function render() {
  const list=selected(), all=items(), fixed=all.filter(x=>!x.optional);
  document.querySelector('#headline').textContent=semester==='1'?'秋季课表，一眼掌握':'春季课表，循序展开';
  document.querySelector('#courseCount').textContent=list.length;
  document.querySelector('#sessionCount').textContent=fixed.length;
  document.querySelector('#hourCount').textContent=fixed.reduce((n,x)=>n+duration(x),0);
  document.querySelector('#examCount').textContent=fixed.filter(x=>x.kind==='exam').length;
  document.querySelector('#timeline').innerHTML=timelineView(all);
  document.querySelector('#load').innerHTML=loadView(all);
  document.querySelector('#courses').innerHTML=courseView(list);
}

document.querySelector('#semester').addEventListener('change', e => { semester=e.target.value; render(); });
document.querySelectorAll('.tabs button').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('.tabs button,.panel').forEach(el=>el.classList.remove('active'));
  button.classList.add('active'); document.querySelector(`#${button.dataset.tab}`).classList.add('active');
}));
render();
