import React, { useEffect, useState } from 'react';
import './styles.module.css'; // 导入 CSS 文件

const meetings = [
    {
        day: 3, month: 11, year: 2024, details: {
            title: 'Compiler SIG 双周例会',
            time: '10:00 - 11:30',
            group: 'SIG组: Compiler',
            description: '进展update 欢迎继续申报议题～',
            organizer: '小助手',
            platform: 'Zoom',
            id: '84014255420',
            link: 'https://us06web.zoom.us/j/84014255420?pwd=laSH6RPlL1O3CiL4T4s0jEBmBL2eWk.1',
            etherpad: 'https://etherpad.openeuler.org/p/Compiler-meetings',
            replay: 'https://www.bilibili.com/video/BV1V5z2YtEHS'
        }
    },
    {
        day: 15, month: 11, year: 2024, details: {
            title: '社区技术分享会',
            time: '14:00 - 16:00',
            group: '社区活动',
            description: '分享最新技术趋势和项目进展',
            organizer: '社区团队',
            platform: '腾讯会议',
            id: '123456789',
            link: 'https://meeting.tencent.com/s/123456789',
            etherpad: 'https://etherpad.openeuler.org/p/Community-Sharing',
            replay: 'https://www.bilibili.com/video/BV1V5z2YtEHS'
        }
    },
    // Add more meetings as needed
];

function generateCalendar(year: number, monthIndex: number) {
    const firstDay = new Date(year, monthIndex, 1);
    const lastDay = new Date(year, monthIndex + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDay = firstDay.getDay();

    const calendarDays = [];

    // Add empty cells for the days before the first day of the month
    for (let i = 0; i < startDay; i++) {
        calendarDays.push(<div key={`empty-${i}`} className="day"></div>);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const hasMeeting = checkForMeeting(day, monthIndex, year);
        calendarDays.push(
            <div
                key={day}
                className={`day ${hasMeeting ? 'has-meeting' : ''}`}
                onClick={() => showMeetingDialog(day, monthIndex, year)}
            >
                {day}
            </div>
        );
    }

    // Add empty cells for the days after the last day of the month
    const remainingDays = 42 - (startDay + daysInMonth);
    for (let i = 0; i < remainingDays; i++) {
        calendarDays.push(<div key={`empty-after-${i}`} className="day"></div>);
    }

    return calendarDays;
}

function checkForMeeting(day: number, month: number, year: number) {
    return meetings.some(meeting => meeting.day === day && meeting.month === month && meeting.year === year);
}

function showMeetingDialog(day: number, month: number, year: number) {
    const meeting = meetings.find(m => m.day === day && m.month === month && m.year === year);
    if (meeting) {
        const { details } = meeting;
        const dialog = document.getElementById('meeting-dialog');
        const meetingInfo = document.getElementById('meeting-info');
        meetingInfo.innerHTML = `
            <div>${details.title}</div>
            <div>${details.time}</div>
            <div>${details.group}</div>
            <div>会议详情: ${details.description}</div>
            <div>发起人: ${details.organizer}</div>
            <div>会议时间: ${details.time}</div>
            <div>会议平台: ${details.platform}</div>
            <div>会议ID: ${details.id}</div>
            <div>会议链接: <a href="${details.link}" target="_blank">点击加入</a></div>
            <div>Etherpad链接: <a href="${details.etherpad}" target="_blank">Etherpad</a></div>
            <div>回放链接: <a href="${details.replay}" target="_blank">Bilibili</a></div>
        `;
        dialog.showModal();
    }
}

const MeetingCalendar: React.FC = () => {
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [currentMonthIndex, setCurrentMonthIndex] = useState(new Date().getMonth());

    useEffect(() => {
        const closeDialogBtn = document.getElementById('close-dialog');
        closeDialogBtn.addEventListener('click', () => {
            const dialog = document.getElementById('meeting-dialog');
            dialog.close();
        });
    }, []);

    return (
        <div>
            <h1>会议日历</h1>
            <div className="calendar-container">
                <div className="calendar-header">
                    <button className="prev-month" onClick={() => {
                        setCurrentMonthIndex((currentMonthIndex - 1 + 12) % 12);
                    }}>❮</button>
                    <span className="current-month">{`${currentYear} 年 ${currentMonthIndex + 1} 月`}</span>
                    <button className="next-month" onClick={() => {
                        setCurrentMonthIndex((currentMonthIndex + 1) % 12);
                    }}>❯</button>
                    <select
                        id="year-select"
                        value={currentYear}
                        onChange={(e) => setCurrentYear(parseInt(e.target.value, 10))}
                    >
                        {[...Array(6)].map((_, i) => (
                            <option key={i} value={currentYear - 2 + i}>
                                {currentYear - 2 + i}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="calendar-body">
                    <div className="calendar-weekdays">
                        <div>日</div>
                        <div>一</div>
                        <div>二</div>
                        <div>三</div>
                        <div>四</div>
                        <div>五</div>
                        <div>六</div>
                    </div>
                    <div className="calendar-days">
                        {generateCalendar(currentYear, currentMonthIndex)}
                    </div>
                </div>
            </div>

            {/* Dialog for meeting details */}
            <dialog id="meeting-dialog">
                <div id="meeting-info"></div>
                <button id="close-dialog">关闭</button>
            </dialog>
        </div>
    );
};

export default MeetingCalendar;