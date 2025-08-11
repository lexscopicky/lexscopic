'use client'

import { useMemo, useState, useEffect, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar, Clock, MapPin, Ticket, Star, Search, Filter, PlusCircle,
  ArrowUpRight, Heart, Leaf, Music, Bike
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal'
import eventsData from '@/data/events.json'

type EventItem = {
  id: string
  title: string
  date: string
  startTime: string
  endTime: string
  venue: string
  neighborhood?: string
  price: number
  tags?: string[]
  description: string
  url: string
  image?: string
  sponsored?: boolean
  featured?: boolean
}

const TAG_META: Record<string, { label: string; icon: ReactNode }> = {
  music: { icon: <Music className="w-4 h-4" />, label: 'Music' },
  outdoors: { icon: <Leaf className="w-4 h-4" />, label: 'Outdoors' },
  fitness: { icon: <Bike className="w-4 h-4" />, label: 'Fitness' },
  family: { icon: <Heart className="w-4 h-4" />, label: 'Family' },
  arts: { icon: <Star className="w-4 h-4" />, label: 'Arts' },
  kids: { icon: <Star className="w-4 h-4" />, label: 'Kids' },
  education: { icon: <Star className="w-4 h-4" />, label: 'Education' },
  night: { icon: <Star className="w-4 h-4" />, label: 'Night' },
  'spoken word': { icon: <Star className="w-4 h-4" />, label: 'Spoken Word' },
}

const formatMoney = (n: number) => (n === 0 ? 'Free' : n < 1 ? '$0–$1' : `$${n.toFixed(0)}`)
const todayISO = () => new Date().toISOString().slice(0, 10)
const isThisWeekend = (d: string) => {
  const date = new Date(d)
  const now = new Date()
  const saturday = new Date(now)
  saturday.setDate(now.getDate() + ((6 - now.getDay() + 7) % 7))
  const sunday = new Date(saturday)
  sunday.setDate(saturday.getDate() + 1)
  return +date >= +new Date(saturday.setHours(0,0,0,0)) && +date <= +new Date(sunday.setHours(23,59,59,999))
}

/* -------- Sidebar widgets -------- */
function TodayWidget() {
  const [now, setNow] = useState(new Date())
  useEffect(() => { const t = setInterval(()=>setNow(new Date()), 1000); return ()=>clearInterval(t) }, [])
  const date = now.toLocaleDateString(undefined, { weekday:'long', month:'long', day:'numeric' })
  const time = now.toLocaleTimeString([], { hour:'numeric', minute:'2-digit' })
  return (
    <Card>
      <CardHeader className="pb-2"><CardTitle className="text-base">Today</CardTitle></CardHeader>
      <CardContent className="text-sm text-slate-600">
        <div className="flex items-center justify-between">
          <span>{date}</span>
          <span className="font-semibold">{time}</span>
        </div>
      </CardContent>
    </Card>
  )
}

function WeatherWidget() {
  const [wx, setWx] = useState<{temp?: number; hi?: number; lo?: number; code?: number}>({})
  useEffect(() => {
    // Lexington, KY: 38.0406, -84.5037
    fetch('https://api.open-meteo.com/v1/forecast?latitude=38.0406&longitude=-84.5037&current=temperature_2m,weather_code&daily=temperature_2_
