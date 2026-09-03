import type { Metadata } from 'next';
import { Noto_Sans_SC, Space_Grotesk } from 'next/font/google';
import './globals.css';

const sans = Noto_Sans_SC({ variable: '--font-sans-cn', subsets: ['latin'], weight: ['400','500','600','700','800'] });
const display = Space_Grotesk({ variable: '--font-display', subsets: ['latin'], weight: ['500','600','700'] });

export const metadata: Metadata = {
  title: 'HKU 课程时间表 2026–2027',
  description: '已选课程的时间轴、星期负荷与课程详情。',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body className={`${sans.variable} ${display.variable}`}>{children}</body></html>;
}
