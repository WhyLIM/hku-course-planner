const weekdays = ['周日','周一','周二','周三','周四','周五','周六'];
const esc = (value = '') => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const duration = item => { const [sh,sm]=item.start.split(':').map(Number); const [eh,em]=item.end.split(':').map(Number); return (eh*60+em-sh*60-sm)/60; };
const dateInfo = iso => { const d=new Date(`${iso}T12:00:00`); return {label:`${d.getMonth()+1}月${d.getDate()}日`, day:weekdays[d.getDay()], year:d.getFullYear(), index:d.getDay()}; };

let semester = '1';
const selected = () => window.courses.filter(c => c.semester === Number(semester));
const items = () => selected().flatMap(course => course.sessions.map(session => ({...session,course}))).sort((a,b) => `${a.date}${a.start}`.localeCompare(`${b.date}${b.start}`));

function calendarView(all) {
  const months = [...new Set(all.map(item => item.date.slice(0,7)))];
  const today = new Date().toISOString().slice(0,10);
  const weekdayHeaders = ['一','二','三','四','五','六','日'];
  return `<div class="calendar-stack">${months.map(month => {
    const [year,monthNumber] = month.split('-').map(Number);
    const days = new Date(year,monthNumber,0).getDate();
    const offset = (new Date(year,monthNumber-1,1).getDay()+6)%7;
    const cells = Array.from({length:offset+days},(_,index) => {
      if(index<offset) return '<div class="calendar-day is-empty" aria-hidden="true"></div>';
      const day=index-offset+1;
      const iso=`${month}-${String(day).padStart(2,'0')}`;
      const dayItems=all.filter(item=>item.date===iso);
      return `<div class="calendar-day ${iso===today?'is-today':''} ${dayItems.length?'has-events':''}"><div class="day-number"><span>${day}</span>${iso===today?'<small>今天</small>':''}</div><div class="calendar-events">${dayItems.map(item => {
        const details=[item.title,item.venue,item.teacher].filter(Boolean).join(' · ');
        return `<article class="calendar-event ${item.optional?'is-optional':''} ${item.kind==='exam'?'is-exam':''}" style="--course:${item.course.color}" title="${esc(details)}"><div><span>${item.start}</span><strong>${esc(item.course.code)}</strong></div><p>${esc(item.title)}</p>${item.optional?'<em>可选</em>':''}${item.kind==='exam'?'<em>考试</em>':''}</article>`;
      }).join('')}</div></div>`;
    }).join('');
    return `<section class="month-card"><header><div><span>${year}</span><h2>${monthNumber}月</h2></div><strong>${all.filter(item=>item.date.startsWith(month)).length} 个安排</strong></header><div class="weekday-row">${weekdayHeaders.map(day=>`<span>${day}</span>`).join('')}</div><div class="month-grid">${cells}</div></section>`;
  }).join('')}</div>`;
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
  document.querySelector('#calendar').innerHTML=calendarView(all);
  document.querySelector('#load').innerHTML=loadView(all);
  document.querySelector('#courses').innerHTML=courseView(list);
}

document.querySelector('#semester').addEventListener('change', e => { semester=e.target.value; render(); });
document.querySelectorAll('.tabs button').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('.tabs button,.panel').forEach(el=>el.classList.remove('active'));
  button.classList.add('active'); document.querySelector(`#${button.dataset.tab}`).classList.add('active');
}));
render();
