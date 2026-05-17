import { useEffect, useState } from 'react'
import { dashboardAPI } from '../api/services'

export default function Dashboard() {
  const [data, setData]         = useState(null)
  const [prediction, setPrediction] = useState(null)
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    // fetch dashboard summary and prediction together
    Promise.all([dashboardAPI.summary(), dashboardAPI.prediction()])
      .then(([summary, pred]) => {
        setData(summary.data.data)
        setPrediction(pred.data.data)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ padding: 32 }}>Loading...</div>
  if (!data)   return <div style={{ padding: 32 }}>Failed to load data.</div>

  return (
    <div style={{ padding: 28 }}>
      <h2 style={{ marginBottom: 24 }}>Dashboard</h2>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard label="Total Loans"      value={data.total_loans} />
        <StatCard label="Active Loans"     value={data.active_loans} />
        <StatCard label="Collected Today"  value={`₹${data.collected_today}`} />
        <StatCard label="Pending Amount"   value={`₹${data.pending_amount}`} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Collection by mode */}
        <div style={{ background: '#fff', borderRadius: 10, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,.07)' }}>
          <h3 style={{ marginBottom: 16, fontSize: 15 }}>Today by Payment Mode</h3>
          {['cash', 'upi', 'card'].map(mode => (
            <div key={mode} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
              <span style={{ textTransform: 'capitalize', color: '#374151' }}>{mode}</span>
              <span style={{ fontWeight: 600, color: '#2563eb' }}>₹{data.collection_by_mode[mode]}</span>
            </div>
          ))}
        </div>

        {/* Prediction */}
        {prediction && (
          <div style={{ background: '#1a2744', borderRadius: 10, padding: 20, color: '#fff' }}>
            <div style={{ fontSize: 12, color: '#8899bb', marginBottom: 8 }}>🔮 Best Collection Time</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#4f9cf9', marginBottom: 8 }}>
              {prediction.best_slot}
            </div>
            <div style={{ fontSize: 13, color: '#aab8cc', lineHeight: 1.6 }}>
              {prediction.insight}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// simple stat card component
function StatCard({ label, value }) {
  return (
    <div style={{ background: '#fff', borderRadius: 10, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,.07)' }}>
      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8, textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: '#111827' }}>{value}</div>
    </div>
  )
}