'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar as CalendarIcon, CloudSun, Clock } from 'lucide-react'

function useNow() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return now
}

function MonthMiniCalendar() {
  const now = useNow()
  const year = now.getFullYear()
  const month = now.getMonth()
  const firstDay = new Date(year, month, 1)
  const start = new Date(year, month, 1 - firstDay.getDay())
  const days = useMemo(() => {
    const arr: Date[] = []
    for (let i = 0; i < 42; i++) {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      arr.push(d)
    }
    return arr
  }, [year, month])

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()

  return (
    <div className="select-none">
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold">{now.toLocaleString(undefined, { month: 'long', year: 'numeric' })}</div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-xs text-slate-500 mb-1">
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <div key={d} className="text-center">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((d, i) => {
          const muted = d.getMonth() !== month
          const today = isSameDay(d, now)
          return (
            <div
              key={i}
              className={[
                'h-8 rounded-lg grid place-items-center text-sm',
                muted ? 'text-slate-400' : 'text-slate-700',
                today ? 'bg-brand-600 text-white font-semibold' : 'hover:bg-slate-100'
              ].join(' ')}
              title={d.toDateString()}
            >
              {d.getDate()}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function TodayWidget() {
  const now = useNow()
  const [weather, setWeather] = useState<string>('…')

  useEffect(() => {
    fetch('https://api.open-meteo.com/v1/forecast?latitude=38.0406&longitude=-84.5037&current=temperature_2m,weather_code&temperature_unit=fahrenheit')
      .then(r => r.json())
      .then(d => {
        const t = Math.round(d?.current?.temperature_2m ?? 0)
        setWeather(`${t}°F`)
      })
      .catch(() => setWeather('N/A'))
  }, [])

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <Clock className="w-4 h-4" />
        <span>{now.toLocaleString(undefined, { weekday:'long', month:'short', day:'numeric' })}</span>
      </div>
      <div className="text-2xl font-bold tabular-nums">{now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</div>
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <CloudSun className="w-4 h-4" />
        <span>Lexington: {weather}</span>
      </div>
    </div>
  )
}

export default function SidebarWidgets() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" /> Calendar
          </CardTitle>
        </CardHeader>
        <CardContent><MonthMiniCalendar /></CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Today</CardTitle>
        </CardHeader>
        <CardContent><TodayWidget /></CardContent>
      </Card>
    </div>
  )
}
