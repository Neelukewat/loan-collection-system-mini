import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loansAPI } from '../api/services'
import { useAuth } from '../hooks/useAuth'

export default function Loans() {
    const { user } = useAuth()
    const navigate = useNavigate()
    
    const [loans, setLoans] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [status, setStatus] = useState('')
    const [page, setPage] = useState(1)
    const [meta, setMeta] = useState(null)
    

    const fetchLoans = async (params = {}) => {
        setLoading(true)
        try {
            const res = await loansAPI.list({ search, status, page, per_page: 10, ...params })
            setLoans(res.data.data.data)
            setMeta(res.data.data)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchLoans() }, [])

    const handleSearch = (e) => {
        e.preventDefault()
        setPage(1)
        fetchLoans({ page: 1 })
    }

    const handlePage = (p) => {
        setPage(p)
        fetchLoans({ page: p })
    }

    return (
        <div style={{ padding: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ margin: 0 }}>Loans</h2>
                {user?.role === 'admin' && (
                    <button
                        onClick={() => navigate('/loans/new')}
                        style={{ padding: '8px 18px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}
                    >
                        + Create Loan
                    </button>
                )}
            </div>
            {/* Filters */}
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                <input
                    placeholder="Search name / mobile / loan no"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14, width: 260 }}
                />
                <select
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                    style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14 }}
                >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="closed">Closed</option>
                    <option value="defaulted">Defaulted</option>
                </select>
                <button
                    type="submit"
                    style={{ padding: '8px 18px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14 }}
                >
                    Search
                </button>
                <button
                    type="button"
                    onClick={() => { setSearch(''); setStatus(''); fetchLoans({ search: '', status: '', page: 1 }) }}
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
                                {['Loan No', 'Customer', 'Mobile', 'Loan Amount', 'EMI', 'Status'].map(h => (
                                    <th key={h} style={{ padding: '12px 14px', textAlign: 'left', color: '#6b7280', fontWeight: 600, fontSize: 12, borderBottom: '1px solid #e5e7eb' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loans.length === 0 && (
                                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: '#9ca3af' }}>No loans found.</td></tr>
                            )}
                            {loans.map((loan, i) => (
                                <tr key={loan.id} style={{ borderBottom: '1px solid #f3f4f6', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                                    <td style={{ padding: '11px 14px', color: '#2563eb', fontWeight: 600 }}>{loan.loan_no}</td>
                                    <td style={{ padding: '11px 14px' }}>{loan.customer_name}</td>
                                    <td style={{ padding: '11px 14px' }}>{loan.mobile}</td>
                                    <td style={{ padding: '11px 14px' }}>₹{loan.loan_amount}</td>
                                    <td style={{ padding: '11px 14px' }}>₹{loan.emi_amount}</td>
                                    <td style={{ padding: '11px 14px' }}>
                                        <span style={{
                                            padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                                            background: loan.status === 'active' ? '#dcfce7' : loan.status === 'closed' ? '#dbeafe' : '#fee2e2',
                                            color: loan.status === 'active' ? '#16a34a' : loan.status === 'closed' ? '#1d4ed8' : '#dc2626',
                                        }}>
                                            {loan.status}
                                        </span>
                                    </td>
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