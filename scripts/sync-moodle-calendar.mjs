import fs from 'node:fs/promises';
import {pathToFileURL} from 'node:url';

const courses = {
  '_CMED6100_2026': {code:'MSPH7901',url:'https://moodle.hku.hk/course/view.php?id=145150',name:'CMED6100 Introduction to Biostatistics [2026]（用户指定对应 MSPH7901）'},
  'PAED7902_1A_2026': {code:'PAED7902',url:'https://moodle.hku.hk/course/view.php?id=143575'},
  '_SBMS7201_MSBS7101_2026': {code:'MSBS7101',url:'https://moodle.hku.hk/course/view.php?id=145435'},
  '_SBMS7202_MSBS7102_2026': {code:'MSBS7102',url:'https://moodle.hku.hk/course/view.php?id=145436'},
  '_PATH7904_PATH6600_1A_2026': {code:'PATH7904',url:'https://moodle.hku.hk/course/view.php?id=147175'}
};

function decodeText(value='') {
  return value.replace(/\\[nN]/g,'\n').replace(/\\,/g,',').replace(/\\;/g,';').replace(/\\\\/g,'\\').trim();
}

export function parseCalendar(text) {
  if(typeof text!=='string' || text.length>2_000_000 || !text.includes('BEGIN:VCALENDAR')) throw new Error('返回内容不是有效的 Moodle 日历。');
  const lines=text.replace(/\r?\n[ \t]/g,'').split(/\r?\n/);
  const events=[];
  let event=null;
  for(const line of lines) {
    if(line==='BEGIN:VEVENT') { event={}; continue; }
    if(line==='END:VEVENT') {
      if(event?.UID && event.SUMMARY && event.DTSTART && event.CATEGORIES) events.push(event);
      event=null;
      if(events.length>1000) throw new Error('日历事件数量异常。');
      continue;
    }
    if(!event) continue;
    const colon=line.indexOf(':');
    if(colon<1) continue;
    const field=line.slice(0,colon).split(';')[0];
    if(['UID','SUMMARY','DESCRIPTION','DTSTART','CATEGORIES'].includes(field)) event[field]=line.slice(colon+1);
  }
  return events;
}

function hongKongDate(value) {
  const match=value.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z)?)?$/);
  if(!match) throw new Error(`无法识别日历日期：${value}`);
  const [,year,month,day,hour='00',minute='00',second='00',utc]=match;
  if(!utc) return `${year}-${month}-${day}T${hour}:${minute}:${second}+08:00`;
  const date=new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}Z`);
  const parts=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Hong_Kong',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(date).map(part=>[part.type,part.value]));
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}+08:00`;
}

function baseTitle(title) {
  return decodeText(title).replace(/\s+(?:is due|closes|should be completed)$/i,'').trim();
}

function comparable(title) {
  return baseTitle(title).toLowerCase().replace(/[^a-z0-9]+/g,'');
}

function matchTask(tasks,courseCode,title,uid) {
  const byUid=tasks.find(task=>task.calendarUid===uid);
  if(byUid) return byUid;
  const key=comparable(title);
  return tasks.find(task=>task.courseCode===courseCode && (comparable(task.title).startsWith(key) || key.startsWith(comparable(task.title))));
}

export function mergeCalendar(snapshot,events,now=new Date()) {
  const tasks=snapshot.tasks.map(task=>({...task,status:'个人提交状态请在 Moodle 查看'}));
  const ignored={};
  let accepted=0,added=0,updated=0;
  for(const event of events) {
    const category=decodeText(event.CATEGORIES);
    const course=courses[category];
    if(!course) { ignored[category]=(ignored[category]||0)+1; continue; }
    accepted++;
    const uid=decodeText(event.UID);
    const title=baseTitle(event.SUMMARY);
    const due=hongKongDate(event.DTSTART);
    const existing=matchTask(tasks,course.code,title,uid);
    if(existing) {
      if(existing.due!==due) updated++;
      existing.due=due;
      existing.calendarUid=uid;
      existing.status='个人提交状态请在 Moodle 查看';
      continue;
    }
    const description=decodeText(event.DESCRIPTION).replace(/\s+/g,' ').slice(0,3000);
    tasks.push({id:`moodle-calendar-${uid.replace(/@.*$/,'').replace(/[^a-zA-Z0-9_-]/g,'')}`,calendarUid:uid,courseCode:course.code,title,due,url:course.url,note:description || '来自 Moodle 课程日历；详细要求请查看课程页面。',sourceName:course.name || '',status:'个人提交状态请在 Moodle 查看'});
    added++;
  }
  const checkedAt=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Hong_Kong',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).format(now).replace(', ','T')+'+08:00';
  const ignoredCount=Object.values(ignored).reduce((sum,count)=>sum+count,0);
  const coverage=`Moodle 动态日历已同步 ${accepted} 项所选课程事件${ignoredCount?`，并排除 ${ignoredCount} 项非课表项目事件`:''}。日历未提供截止日期的测验、普通课程章节及附件要求沿用浏览器核对结果；后续变更以 Moodle 为准。`;
  return {snapshot:{version:1,checkedAt,coverage,tasks},report:{events:events.length,accepted,ignored:ignoredCount,added,updated,preserved:tasks.length-accepted-added+updated}};
}

async function main() {
  const dryRun=process.argv.includes('--dry-run');
  const write=process.argv.includes('--write');
  if(dryRun===write) throw new Error('请指定 --dry-run 或 --write。');
  const source=process.env.MOODLE_CALENDAR_URL;
  if(!source) throw new Error('缺少 MOODLE_CALENDAR_URL。');
  const url=new URL(source);
  if(url.origin!=='https://moodle.hku.hk' || url.pathname!=='/calendar/export_execute.php') throw new Error('MOODLE_CALENDAR_URL 不是 HKU Moodle 日历导出地址。');
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),20_000);
  let response;
  try { response=await fetch(url,{signal:controller.signal,redirect:'error'}); }
  finally { clearTimeout(timer); }
  if(!response.ok) throw new Error(`Moodle 日历请求失败（HTTP ${response.status}）。`);
  const text=await response.text();
  const current=JSON.parse(await fs.readFile('public/assignments.json','utf8'));
  const {snapshot,report}=mergeCalendar(current,parseCalendar(text));
  const output=JSON.stringify(snapshot,null,2)+'\n';
  const target=write?'public/assignments.json':'work/assignments.preview.json';
  await fs.mkdir('work',{recursive:true});
  await fs.writeFile(target,output,'utf8');
  console.log(JSON.stringify({...report,mode:write?'write':'dry-run',output:target}));
}

if(import.meta.url===pathToFileURL(process.argv[1]).href) main().catch(error=>{console.error(error.message);process.exitCode=1;});
