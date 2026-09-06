import assert from 'node:assert/strict';
import {mergeCalendar,parseCalendar} from '../scripts/sync-moodle-calendar.mjs';

const calendar=`BEGIN:VCALENDAR\r
BEGIN:VEVENT\r
UID:one@moodle.hku.hk\r
SUMMARY:Bonus Assignment is due\r
DESCRIPTION:Do task 1\\, then upload.\r
DTSTART:20260916T130000Z\r
CATEGORIES:_CMED6100_2026\r
END:VEVENT\r
BEGIN:VEVENT\r
UID:two@moodle.hku.hk\r
SUMMARY:New Assignment closes\r
DESCRIPTION:Read the instructions.\r
DTSTART:20260920T160000Z\r
CATEGORIES:_SBMS7201_MSBS7101_2026\r
END:VEVENT\r
BEGIN:VEVENT\r
UID:ignored@moodle.hku.hk\r
SUMMARY:Programme form is due\r
DTSTART:20260930T153000Z\r
CATEGORIES:_MMEDSC_2026\r
END:VEVENT\r
END:VCALENDAR`;
const current={version:1,checkedAt:'2026-09-06T10:26:00+08:00',coverage:'old',tasks:[{id:'bonus',courseCode:'MSPH7901',title:'Bonus Assignment',due:'2026-09-15T21:00:00+08:00',url:'https://moodle.hku.hk/mod/assign/view.php?id=4207273',note:'curated',status:'private status'}]};
const events=parseCalendar(calendar);
assert.equal(events.length,3);
const {snapshot,report}=mergeCalendar(current,events,new Date('2026-09-06T12:34:56Z'));
assert.equal(report.accepted,2);
assert.equal(report.ignored,1);
assert.equal(report.added,1);
assert.equal(report.updated,1);
assert.equal(snapshot.checkedAt,'2026-09-06T20:34:56+08:00');
assert.equal(snapshot.tasks[0].due,'2026-09-16T21:00:00+08:00');
assert.equal(snapshot.tasks[0].url,current.tasks[0].url);
assert.equal(snapshot.tasks[0].note,'curated');
assert.equal(snapshot.tasks[1].due,'2026-09-21T00:00:00+08:00');
assert.equal(snapshot.tasks[1].url,'https://moodle.hku.hk/course/view.php?id=145435');
assert.ok(snapshot.tasks.every(task=>task.status==='个人提交状态请在 Moodle 查看'));
console.log('PASS: ICS parsing, UTC+8 conversion, whitelist, stable merge, privacy-safe status.');
