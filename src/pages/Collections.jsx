import { useEffect, useState } from 'react'
import { collectionsAPI } from '../api/services'
import { useNavigate } from 'react-router-dom'

export default function Collections() {

    const navigate = useNavigate()

    const [collections, setCollections] = useState([])
    const [loading, setLoading] = useState(true)
    const [paymentMode, setPaymentMode] = useState('')
    const [page, setPage] = useState(1)
    const [meta, setMeta] = useState(null)

    const fetchCollections = async (params = {}) => {
        setLoading(true)
        try {
            const res = await collectionsAPI.list({ payment_mode: paymentMode, page, per_page: 10, ...params })
            setCollections(res.data.data.data)
            setMeta(res.data.data)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchCollections() }, [])

    const handleFilter = (e) => {
        e.preventDefault()
        setPage(1)
        fetchCollections({ page: 1 })
    }

    const handlePage = (p) => {
        setPage(p)
        fetchCollections({ page: p })
    }

    const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    })

    return (
        <div style={{ padding: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ margin: 0 }}>Collections</h2>
                <button
                    onClick={() => navigate('/collections/new')}
                    style={{ padding: '8px 18px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}
                >
                    + Add Collection
                </button>
            </div>
            {/* Filter */}
            <form onSubmit={handleFilter} style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                <select
                    value={paymentMode}
                    onChange={e => setPaymentMode(e.target.value)}
                    style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14 }}
                >
                    <option value="">All Modes</option>
                    <option value="cash">Cash</option>
                    <option value="upi">UPI</option>
                    <option value="card">Card</option>
                </select>
                <button
                    type="submit"
                    style={{ padding: '8px 18px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14 }}
                >
                    Filter
                </button>
                <button
                    type="button"
                    onClick={() => { setPaymentMode(''); fetchCollections({ payment_mode: '', page: 1 }) }}
                    style={{ padding: '8px 14px', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: 6, cursor: 'pointer', fontSize: 14 }}
                >
                    Clear
                </button>
            </form>

            {/* Table */}
            <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 1px 4px rgba(0,0,0,.07)', overflow: 'hidden' }}>
                {loading ? <div style={{ padding: 32, textAlign: 'center' }}>Loading...</div> : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                        <thead>
                            <tr style={{ background: '#f8fafc' }}>
                                {['Date', 'Loan No', 'Customer', 'Amount', 'Mode', 'Location'].map(h => (
                                    <th key={h} style={{ padding: '12px 14px', textAlign: 'left', color: '#6b7280', fontWeight: 600, fontSize: 12, borderBottom: '1px solid #e5e7eb' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {collections.length === 0 && (
                                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: '#9ca3af' }}>No collections found.</td></tr>
                            )}
                            {collections.map((c, i) => (
                                <tr key={c.id} style={{ borderBottom: '1px solid #f3f4f6', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                                    <td style={{ padding: '11px 14px', color: '#374151' }}>{formatDate(c.collected_at)}</td>
                                    <td style={{ padding: '11px 14px', color: '#2563eb', fontWeight: 600 }}>{c.loan?.loan_no || '-'}</td>
                                    <td style={{ padding: '11px 14px' }}>{c.loan?.customer_name || '-'}</td>
                                    <td style={{ padding: '11px 14px', color: '#059669', fontWeight: 600 }}>₹{c.amount_paid}</td>
                                    <td style={{ padding: '11px 14px' }}>
                                        <span style={{
                                            padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                                            background: c.payment_mode === 'cash' ? '#fef3c7' : c.payment_mode === 'upi' ? '#ede9fe' : '#e0f2fe',
                                            color: c.payment_mode === 'cash' ? '#92400e' : c.payment_mode === 'upi' ? '#6d28d9' : '#0369a1',
                                        }}>
                                            {c.payment_mode}
                                        </span>
                                    </td>
                                    <td style={{ padding: '11px 14px', color: '#6b7280' }}>{c.location || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {/* Pagination */}
                {meta && meta.last_page > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: 16 }}>
                        <button disabled={page === 1} onClick={() => handlePage(page - 1)}
                            style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid #d1d5db', cursor: page === 1 ? 'not-allowed' : 'pointer' }}>
                            Prev
                        </button>
                        <span style={{ padding: '6px 12px', fontSize: 13, color: '#6b7280' }}>Page {page} of {meta.last_page}</span>
                        <button disabled={page === meta.last_page} onClick={() => handlePage(page + 1)}
                            style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid #d1d5db', cursor: page === meta.last_page ? 'not-allowed' : 'pointer' }}>
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}