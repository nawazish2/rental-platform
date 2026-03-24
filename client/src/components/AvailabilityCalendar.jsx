import { useState } from 'react';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function AvailabilityCalendar({ availableFrom, blockedDates = [] }) {
  const today = new Date();
  const [current, setCurrent] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const available = availableFrom ? new Date(availableFrom) : today;
  const blocked = blockedDates.map((d) => new Date(d).toDateString());

  const prevMonth = () => setCurrent(new Date(current.getFullYear(), current.getMonth() - 1, 1));
  const nextMonth = () => setCurrent(new Date(current.getFullYear(), current.getMonth() + 1, 1));

  const year = current.getFullYear();
  const month = current.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const getStatus = (day) => {
    const date = new Date(year, month, day);
    if (date < today) return 'past';
    if (date < available) return 'unavailable';
    if (blocked.includes(date.toDateString())) return 'blocked';
    return 'available';
  };

  const STATUS_STYLE = {
    past: 'text-gray-300 cursor-default',
    unavailable: 'bg-red-50 text-red-300 cursor-default',
    blocked: 'bg-orange-100 text-orange-400 cursor-default',
    available: 'bg-green-50 text-green-700 font-semibold hover:bg-green-100 cursor-pointer',
  };

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors">‹</button>
        <h3 className="font-bold text-gray-800">{MONTHS[month]} {year}</h3>
        <button onClick={nextMonth} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors">›</button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 mb-2">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">{d}</div>
        ))}
      </div>

      {/* Cells */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => (
          <div key={i} className={`h-8 w-full flex items-center justify-center rounded-lg text-sm transition-colors ${day ? STATUS_STYLE[getStatus(day)] : ''}`}>
            {day || ''}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-4 flex-wrap">
        {[
          ['bg-green-100', 'text-green-700', 'Available'],
          ['bg-red-50', 'text-red-400', 'Not Available'],
          ['bg-orange-100', 'text-orange-400', 'Blocked'],
        ].map(([bg, text, label]) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded ${bg}`} />
            <span className={`text-xs ${text}`}>{label}</span>
          </div>
        ))}
      </div>

      {availableFrom && (
        <p className="text-xs text-gray-400 mt-3">
          🗓️ Available from <span className="font-semibold text-gray-600">{new Date(availableFrom).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </p>
      )}
    </div>
  );
}
