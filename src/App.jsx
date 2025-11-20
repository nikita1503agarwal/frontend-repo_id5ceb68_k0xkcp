import { useEffect, useState } from 'react'

const API = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function useAuth() {
  const [user, setUser] = useState(null)
  const [tokens, setTokens] = useState({ access: null, refresh: null })

  useEffect(() => {
    const saved = localStorage.getItem('cc_auth')
    if (saved) {
      const { user, tokens } = JSON.parse(saved)
      setUser(user)
      setTokens(tokens)
    }
  }, [])

  const save = (u, t) => {
    setUser(u)
    setTokens(t)
    localStorage.setItem('cc_auth', JSON.stringify({ user: u, tokens: t }))
  }
  const logout = () => {
    setUser(null)
    setTokens({ access: null, refresh: null })
    localStorage.removeItem('cc_auth')
  }
  return { user, tokens, save, logout }
}

function Header({ onNav }) {
  return (
    <header className="fixed top-0 inset-x-0 z-40 backdrop-blur bg-white/70 dark:bg-neutral-900/70 border-b border-neutral-200/60 dark:border-neutral-800">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#FF6B9D] flex items-center justify-center text-white font-bold">♀</div>
          <div className="font-semibold">CycleSync Pro</div>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <button onClick={() => onNav('landing')} className="hover:text-[#FF6B9D]">Home</button>
          <button onClick={() => onNav('dashboard')} className="hover:text-[#9C27B0]">Dashboard</button>
          <button onClick={() => onNav('tracking')} className="hover:text-[#2196F3]">Tracking</button>
          <button onClick={() => onNav('analytics')} className="hover:text-[#4CAF50]">Analytics</button>
          <button onClick={() => onNav('settings')} className="hover:text-neutral-900">Settings</button>
        </nav>
      </div>
    </header>
  )
}

function Landing({ onGetStarted }) {
  return (
    <section className="pt-24 bg-gradient-to-b from-rose-50 to-white dark:from-neutral-900 dark:to-neutral-950 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-16 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">Intelligent Cycle Tracking for Modern Women</h1>
          <p className="text-neutral-600 dark:text-neutral-300 mb-8">Track periods, symptoms, and fertility with confidence. Predictions, calendar sync, and powerful analytics—all in one secure platform.</p>
          <div className="flex gap-4">
            <button onClick={onGetStarted} className="px-5 py-3 rounded-lg bg-[#FF6B9D] text-white hover:opacity-90">Start free trial</button>
            <a href="#pricing" className="px-5 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700">See pricing</a>
          </div>
          <div id="pricing" className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { name: 'Free', price: '$0', perks: ['Basic tracking', 'Limited history'] },
              { name: 'Premium', price: '$9.99', perks: ['Advanced predictions', 'Google Calendar sync', 'Analytics'] },
              { name: 'Enterprise', price: '$29.99', perks: ['API access', 'White-labeling', 'Custom features'] },
            ].map((p) => (
              <div key={p.name} className="rounded-xl border p-6 bg-white dark:bg-neutral-900">
                <div className="font-semibold mb-2">{p.name}</div>
                <div className="text-3xl font-bold mb-4">{p.price}<span className="text-sm font-normal">/mo</span></div>
                <ul className="text-sm text-neutral-600 dark:text-neutral-300 space-y-1 mb-6">
                  {p.perks.map((x) => (<li key={x}>• {x}</li>))}
                </ul>
                <button className="w-full px-4 py-2 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900">Choose</button>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border bg-white dark:bg-neutral-900 p-6">
          <AuthCard />
        </div>
      </div>
    </section>
  )
}

function AuthCard() {
  const { save } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async () => {
    setLoading(true); setError('')
    try {
      const res = await fetch(`${API}/api/auth/${mode === 'login' ? 'login' : 'register'}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password })
      })
      if (!res.ok) throw new Error((await res.json()).detail || 'Failed')
      const data = await res.json()
      save(data.user, data.tokens)
    } catch (e) {
      setError(e.message)
    } finally { setLoading(false) }
  }

  return (
    <div>
      <div className="text-lg font-semibold mb-4">Welcome to CycleSync Pro</div>
      <div className="space-y-3">
        <input value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Email" className="w-full px-4 py-2 rounded-lg border" />
        <input value={password} onChange={(e)=>setPassword(e.target.value)} type="password" placeholder="Password" className="w-full px-4 py-2 rounded-lg border" />
        {error && <div className="text-sm text-rose-600">{error}</div>}
        <button onClick={submit} disabled={loading} className="w-full px-4 py-2 rounded-lg bg-[#9C27B0] text-white">{loading ? 'Please wait...' : (mode==='login'?'Login':'Create account')}</button>
        <button onClick={()=>setMode(mode==='login'?'register':'login')} className="w-full text-sm underline">{mode==='login'?'Create an account':'Have an account? Login'}</button>
      </div>
    </div>
  )
}

function Dashboard({ auth }) {
  const [prediction, setPrediction] = useState(null)
  useEffect(() => {
    const load = async () => {
      const res = await fetch(`${API}/api/predictions`, { headers: { Authorization: `Bearer ${auth.tokens.access}` }})
      const data = await res.json()
      setPrediction(data.prediction)
    }
    if (auth.tokens.access) load()
  }, [auth.tokens.access])

  return (
    <div className="max-w-6xl mx-auto px-4 py-24">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Your Predictions</h2>
        {!prediction && <div className="text-sm text-neutral-500">Add a cycle to see predictions.</div>}
      </div>
      {prediction && (
        <div className="grid md:grid-cols-3 gap-4">
          <Card title="Next Period" value={prediction.next_period_start} color="#FF6B9D" />
          <Card title="Ovulation" value={prediction.ovulation_date} color="#9C27B0" />
          <Card title="Fertile Window" value={`${prediction.fertile_window[0]} - ${prediction.fertile_window[4]}`} color="#2196F3" />
        </div>
      )}
    </div>
  )
}

function Card({ title, value, color }) {
  return (
    <div className="rounded-xl border p-6" style={{borderColor: color}}>
      <div className="text-sm text-neutral-500">{title}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  )
}

function Tracking({ auth }) {
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [flow, setFlow] = useState('medium')
  const [status, setStatus] = useState('')

  const submit = async () => {
    setStatus('Saving...')
    const res = await fetch(`${API}/api/cycles`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth.tokens.access}` },
      body: JSON.stringify({ start_date: start, end_date: end || null, flow })
    })
    if (res.ok) setStatus('Saved! Add more data to improve predictions.')
    else setStatus('Error saving')
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-24 space-y-3">
      <h2 className="text-2xl font-semibold">Log a period</h2>
      <input type="date" value={start} onChange={e=>setStart(e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
      <input type="date" value={end} onChange={e=>setEnd(e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
      <select value={flow} onChange={e=>setFlow(e.target.value)} className="w-full px-4 py-2 border rounded-lg">
        <option value="light">Light</option>
        <option value="medium">Medium</option>
        <option value="heavy">Heavy</option>
      </select>
      <button onClick={submit} className="px-4 py-2 rounded-lg bg-[#4CAF50] text-white">Save</button>
      {status && <div className="text-sm">{status}</div>}
    </div>
  )
}

function Settings({ auth }) {
  const [loading, setLoading] = useState(false)
  const subscribe = async (priceId) => {
    setLoading(true)
    try{
      const res = await fetch(`${API}/api/payments/subscribe`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth.tokens.access}` }, body: JSON.stringify({ price_id: priceId }) })
      const data = await res.json()
      if (data.checkoutUrl) window.location = data.checkoutUrl
    } finally{ setLoading(false) }
  }
  return (
    <div className="max-w-3xl mx-auto px-4 py-24">
      <h2 className="text-2xl font-semibold mb-4">Subscription</h2>
      <div className="grid sm:grid-cols-3 gap-4">
        <button onClick={()=>subscribe(import.meta.env.VITE_PRICE_PREMIUM)} className="px-4 py-2 rounded-lg border">Upgrade to Premium</button>
        <button onClick={()=>subscribe(import.meta.env.VITE_PRICE_ENTERPRISE)} className="px-4 py-2 rounded-lg border">Upgrade to Enterprise</button>
      </div>
      <div className="mt-8">
        <h3 className="font-semibold mb-2">Google Calendar</h3>
        <p className="text-sm text-neutral-600">Connect your Google account in the next step to push predicted events.</p>
      </div>
    </div>
  )
}

export default function App(){
  const auth = useAuth()
  const [view, setView] = useState('landing')

  useEffect(() => {
    if (auth.user && view==='landing') setView('dashboard')
  }, [auth.user])

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white">
      <Header onNav={setView} />
      {view==='landing' && <Landing onGetStarted={()=>setView('dashboard')} />}
      {view==='dashboard' && <Dashboard auth={auth} />}
      {view==='tracking' && <Tracking auth={auth} />}
      {view==='analytics' && <div className="pt-24 max-w-6xl mx-auto px-4">Analytics coming soon</div>}
      {view==='settings' && <Settings auth={auth} />}
    </div>
  )
}
