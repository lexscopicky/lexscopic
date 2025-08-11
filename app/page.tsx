'use client'

import { useMemo, useState, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Clock, MapPin, Ticket, Star, Search, Filter, PlusCircle, ArrowUpRight, Heart, Leaf, Music, Bike } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal'
import SidebarWidgets from '@/components/SidebarWidgets'
import eventsData from '@/data/events.json'

type EventItem = {
  id: string; title: string; date: string; startTime: string; endTime: string;
  venue: string; neighborhood?: string; price: number; tags?: string[];
  description: string; url: string; image?: string; sponsored?: boolean;
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
  const date = new Date(d); const now = new Date()
  const saturday = new Date(now); saturday.setDate(now.getDate() + ((6 - now.getDay() + 7) % 7))
  const sunday = new Date(saturday); sunday.setDate(saturday.getDate() + 1)
  return +date >= +new Date(saturday.setHours(0,0,0,0)) && +date <= +new Date(sunday.setHours(23,59,59,999))
}

function TagPill({ tag }: { tag: string }) {
  const meta = TAG_META[tag] || { icon: <Star className="w-4 h-4" />, label: tag }
  return <Badge className="gap-1 px-2 py-1 rounded-full text-xs">{meta.icon}<span>{meta.label}</span></Badge>
}

function EventCard({ evt, large = false }: { evt: EventItem; large?: boolean }) {
  const priceText = formatMoney(evt.price)
  const weekend = isThisWeekend(evt.date)
  const gcalLink = (() => {
    const start = new Date(`${evt.date} ${evt.startTime}`).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    const end = new Date(`${evt.date} ${evt.endTime}`).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    const text = encodeURIComponent(evt.title)
    const details = encodeURIComponent(`${evt.description} \n${evt.url}`)
    const location = encodeURIComponent(`${evt.venue}, Lexington KY`)
    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${start}%2F${end}&details=${details}&location=${location}`
  })()

  return (
    <motion.div layout>
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        {evt.image && (
          <div className={large ? 'relative h-64 w-full overflow-hidden' : 'relative h-40 w-full overflow-hidden'}>
            <img src={evt.image} alt="event" className="h-full w-full object-cover" />
            <div className="absolute top-2 left-2 flex items-center gap-2">
              {evt.sponsored && <Badge className="bg-yellow-400 text-black">Sponsored</Badge>}
              {weekend && <Badge>This Weekend</Badge>}
            </div>
          </div>
        )}
        <CardHeader className="pb-2">
          <CardTitle className={large ? 'text-2xl' : 'text-lg'}>
            <div className="flex items-start justify-between gap-2">
              <span>{evt.title}</span>
              <a href={evt.url} target="_blank" rel="noreferrer" className="inline-flex items-center text-sm text-brand-600 hover:underline">
                Details <ArrowUpRight className="w-4 h-4 ml-1" />
              </a>
            </div>
          </CardTitle>
          <div className="flex flex-wrap gap-1 mt-1">
            {evt.tags?.slice(0, 4).map((t) => <TagPill key={t} tag={t} />)}
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-slate-600">
            <Calendar className="w-4 h-4" />
            <span>{new Date(evt.date).toLocaleDateString(undefined, { weekday:'short', month:'short', day:'numeric' })}</span>
            <Clock className="w-4 h-4 ml-3" />
            <span>{evt.startTime} – {evt.endTime}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <MapPin className="w-4 h-4" />
            <span>{evt.venue}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Ticket className="w-4 h-4" />
            <span>{priceText}</span>
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <a href={gcalLink} target="_blank" rel="noreferrer">
            <Button size="sm" variant="outline">Add to Google Calendar</Button>
          </a>
          <Button size="sm">Save</Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

export default function Page() {
  const [query, setQuery] = useState('')
  const [maxPrice, setMaxPrice] = useState<number>(999)
  const [dateFilter, setDateFilter] = useState<'any' | 'today' | 'weekend' | 'pick'>('any')
  const [pickDate, setPickDate] = useState<string>(todayISO())
  const [tagFilters, setTagFilters] = useState<Set<string>>(new Set())
  const [events, setEvents] = useState<EventItem[]>((eventsData as unknown) as EventItem[])
  const [openSubmit, setOpenSubmit] = useState(false)

  const filtered = useMemo(() => {
    return events.filter((e) => {
      const q = query.trim().toLowerCase()
      if (q && !(`${e.title} ${e.description} ${e.venue} ${e.neighborhood || ''}`.toLowerCase().includes(q))) return false
      if (e.price > maxPrice) return false
      if (dateFilter === 'today' && e.date !== todayISO()) return false
      if (dateFilter === 'weekend' && !isThisWeekend(e.date)) return false
      if (dateFilter === 'pick' && e.date !== pickDate) return false
      if (tagFilters.size) for (const t of tagFilters) { if (!e.tags || !e.tags.includes(t)) return false }
      return true
    }).sort((a, b) => +new Date(a.date) - +new Date(b.date))
  }, [events, query, maxPrice, dateFilter, pickDate, tagFilters])

  const toggleTag = (t: string) => setTagFilters(prev => {
    const n = new Set(prev); n.has(t) ? n.delete(t) : n.add(t); return n
  })
  const quickTags = ['family','outdoors','music','arts','kids']

  const [form, setForm] = useState<EventItem>({
    id:'', title:'', date: todayISO(), startTime:'6:00 PM', endTime:'8:00 PM',
    venue:'', neighborhood:'', price:0, tags:[], description:'', url:'', image:''
  })

  const featured = filtered[0]
  const rest = filtered.slice(1)

  const handleSubmit = () => {
    const clean = { ...form, id: String(Date.now()), tags: (form.tags || []).map(t => t.toString().toLowerCase()) }
    setEvents(prev => [clean, ...prev]); setOpenSubmit(false)
    setForm({ ...form, title:'', venue:'', neighborhood:'', description:'', url:'', image:'' })
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 backdrop-blur bg-white/70 border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-grid place-items-center w-9 h-9 rounded-xl bg-brand-700 text-white font-bold">LX</span>
            <div className="leading-tight">
              <h1 className="text-xl font-extrabold">LexScopic</h1>
              <p className="text-xs text-slate-500">Free & affordable things to do in Lexington</p>
            </div>
          </div>
          <div className="flex-1" />
          <Button variant="outline" onClick={() => setOpenSubmit(true)} className="gap-2"><PlusCircle className="w-4 h-4" /> Submit Event</Button>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-4 pt-6">
        <Card>
          <CardContent className="pt-4 space-y-3">
            <div className="flex flex-col md:flex-row gap-2">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <Input className="pl-9" placeholder="Search events, venues, neighborhoods" value={query} onChange={(e)=>setQuery(e.target.value)} />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                <select className="border rounded-xl px-3 py-2 text-sm" value={dateFilter} onChange={e=>setDateFilter(e.target.value as any)}>
                  <option value="any">Any date</option>
                  <option value="today">Today</option>
                  <option value="weekend">This weekend</option>
                  <option value="pick">Pick a date</option>
                </select>
                {dateFilter === 'pick' && <Input type="date" value={pickDate} onChange={e=>setPickDate(e.target.value)} />}
                <select className="border rounded-xl px-3 py-2 text-sm" value={maxPrice} onChange={e=>setMaxPrice(Number(e.target.value))}>
                  <option value={999}>Any price</option>
                  <option value={0}>Free only</option>
                  <option value={10}>Under $10</option>
                  <option value={20}>Under $20</option>
                </select>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-500">Quick filters:</span>
              {quickTags.map(t => (
                <Button key={t} size="sm" variant={tagFilters.has(t) ? 'default' : 'outline'} className="rounded-full px-3" onClick={()=>toggleTag(t)}>
                  <span className="capitalize">{t}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-6 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {featured && <EventCard evt={featured} large />}
          <div className="grid md:grid-cols-2 gap-4">
            <AnimatePresence>{rest.map(evt => <EventCard key={evt.id} evt={evt} />)}</AnimatePresence>
          </div>
        </div>

        <aside className="space-y-4">
          <SidebarWidgets />

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Get the weekly list</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <Input placeholder="Email address" />
              <Button className="w-full">Subscribe</Button>
              <p className="text-xs text-slate-500">No spam. Just the best free and low-cost picks each week.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Sponsor</CardTitle></CardHeader>
            <CardContent>
              <div className="w-full h-28 rounded-2xl border border-dashed grid place-items-center text-sm text-slate-500">Ad / Partner</div>
            </CardContent>
          </Card>
        </aside>
      </section>

      <footer className="border-t">
        <div className="max-w-6xl mx-auto px-4 py-8 text-sm text-slate-600 flex items-center justify-between">
          <p>© {new Date().getFullYear()} LexScopic. Curated in Lexington, KY.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:underline">About</a>
            <a href="#" className="hover:underline">Submit</a>
            <a href="#" className="hover:underline">Privacy</a>
          </div>
        </div>
      </footer>

      <Modal open={openSubmit} onClose={() => setOpenSubmit(false)} title="Submit an Event">
        <iframe
          src="https://form.jotform.com/YOUR_FORM_ID"
          className="w-full h-[75vh] md:h-[80vh] rounded-xl border"
          allow="geolocation; microphone; camera"
        />
      </Modal>
    </div>
  )
}
