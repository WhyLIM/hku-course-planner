'use client';

import { useMemo, useState } from 'react';
import { CalendarDays, Clock3, GraduationCap, MapPin, Sparkles } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { courses, type Course, type Session } from './course-data';

type CalendarItem = Session & { course: Course };
const weekdays = ['周日','周一','周二','周三','周四','周五','周六'];

function zhDate(iso: string) {
  const date = new Date(`${iso}T12:00:00`);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

function duration(item: Session) {
  const [sh, sm] = item.start.split(':').map(Number);
  const [eh, em] = item.end.split(':').map(Number);
  return (eh * 60 + em - sh * 60 - sm) / 60;
}

function Timeline({ items }: { items: CalendarItem[] }) {
  const grouped = items.reduce<Record<string, CalendarItem[]>>((acc, item) => {
    (acc[item.date] ??= []).push(item);
    return acc;
  }, {});
  return (
    <div className="timeline">
      {Object.entries(grouped).map(([date, dayItems]) => {
        const d = new Date(`${date}T12:00:00`);
        return (
          <section className="day-row" key={date}>
            <div className="date-stamp"><strong>{zhDate(date)}</strong><span>{weekdays[d.getDay()]}</span><small>{d.getFullYear()}</small></div>
            <div className="day-events">
              {dayItems.map((item, index) => (
                <article className={`event-card ${item.kind === 'exam' ? 'is-exam' : ''}`} key={`${item.course.code}-${date}-${item.start}-${index}`} style={{'--course': item.course.color} as React.CSSProperties}>
                  <div className="event-time"><Clock3 size={15}/>{item.start}–{item.end}</div>
                  <div className="event-copy">
                    <div className="event-meta"><span className="course-dot"/>{item.course.code}{item.optional && <em>可选班次</em>}{item.kind === 'exam' && <em>考试</em>}</div>
                    <h3>{item.title}</h3>
                    <p>{[item.venue, item.teacher].filter(Boolean).join(' · ') || '地点待定'}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function WeeklyLoad({ items }: { items: CalendarItem[] }) {
  const data = weekdays.map((day, index) => {
    const sessions = items.filter(x => new Date(`${x.date}T12:00:00`).getDay() === index && !x.optional);
    return { day, sessions: sessions.length, hours: sessions.reduce((n, x) => n + duration(x), 0) };
  }).filter(x => x.sessions);
  const max = Math.max(...data.map(x => x.hours), 1);
  return <div className="load-panel">
    <div className="load-intro"><span>按固定课次统计</span><strong>星期负荷</strong><p>可选 practical/tutorial 班次未计入，避免重复。</p></div>
    <div className="bars">{data.map(x => <div className="bar-row" key={x.day}>
      <span>{x.day}</span><div className="bar-track"><i style={{width:`${Math.max(7, x.hours / max * 100)}%`}}/></div><strong>{x.hours}h</strong><small>{x.sessions} 次</small>
    </div>)}</div>
  </div>;
}

function CourseGrid({ list }: { list: Course[] }) {
  return <div className="course-grid">{list.map(course => {
    const fixed = course.sessions.filter(x => !x.optional);
    const hours = fixed.reduce((n, x) => n + duration(x), 0);
    return <article className="course-card" key={course.code} style={{'--course': course.color} as React.CSSProperties}>
      <div className="course-top"><span>{course.code}</span><b>SEM {course.semester}</b></div>
      <h3>{course.title}</h3>
      <div className="metric-line"><strong>{fixed.length}</strong><span>固定课次</span><strong>{hours}h</strong><span>课表时长</span></div>
      <dl>
        <div><dt>负责人</dt><dd>{course.coordinator}</dd></div>
        <div><dt>形式</dt><dd>{course.mode}</dd></div>
        <div><dt>地点</dt><dd>{course.venue}</dd></div>
        {course.assessment && <div><dt>考核</dt><dd>{course.assessment}</dd></div>}
      </dl>
      {course.note && <p className="source-note">{course.note}</p>}
    </article>;
  })}</div>;
}

export default function Home() {
  const [semester, setSemester] = useState('1');
  const selected = courses.filter(c => c.semester === Number(semester));
  const items = useMemo(() => selected.flatMap(course => course.sessions.map(session => ({...session, course}))).sort((a,b) => `${a.date}${a.start}`.localeCompare(`${b.date}${b.start}`)), [semester]);
  const fixedItems = items.filter(x => !x.optional);
  const hours = fixedItems.reduce((n, x) => n + duration(x), 0);
  const exams = fixedItems.filter(x => x.kind === 'exam').length;

  return <main>
    <header className="masthead">
      <div className="brand"><span>HKU</span><div><strong>课程时间表</strong><small>2026—2027</small></div></div>
      <div className="term-control"><label>当前学期</label><Select value={semester} onValueChange={(v) => setSemester(String(v))}>
        <SelectTrigger aria-label="选择学期"><SelectValue/></SelectTrigger>
        <SelectContent><SelectItem value="1">第一学期 · 2026 秋</SelectItem><SelectItem value="2">第二学期 · 2027 春</SelectItem></SelectContent>
      </Select></div>
    </header>

    <section className="overview">
      <div className="overview-title"><span><Sparkles size={15}/>MY STUDY MAP</span><h1>{semester === '1' ? '秋季课表，一眼掌握' : '春季课表，循序展开'}</h1><p>将已选课程的课堂、实践、复习与考试统一到一条清晰时间线上。</p></div>
      <div className="stat"><GraduationCap/><strong>{selected.length}</strong><span>门课程</span></div>
      <div className="stat"><CalendarDays/><strong>{fixedItems.length}</strong><span>固定课次</span></div>
      <div className="stat"><Clock3/><strong>{hours}</strong><span>总小时</span></div>
      <div className="stat"><MapPin/><strong>{exams}</strong><span>场考试</span></div>
    </section>

    <Tabs defaultValue="timeline" className="content-tabs">
      <TabsList variant="line" aria-label="课表视图">
        <TabsTrigger value="timeline">时间轴</TabsTrigger>
        <TabsTrigger value="load">星期负荷</TabsTrigger>
        <TabsTrigger value="courses">课程详情</TabsTrigger>
      </TabsList>
      <TabsContent value="timeline"><Timeline items={items}/></TabsContent>
      <TabsContent value="load"><WeeklyLoad items={items}/></TabsContent>
      <TabsContent value="courses"><CourseGrid list={selected}/></TabsContent>
    </Tabs>

    <footer><span>整理自所提供的 6 份课程附件</span><span>更新基准 · 2026-09-03</span></footer>
  </main>;
}
