import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collectionsAPI, loansAPI } from '../api/services'


const inputStyle = {
  width: '100%', padding: '8px 12px', borderRadius: 6,
  border: '1px solid #d1d5db', fontSize: 14, boxSizing: 'border-box',
}

export default function CollectionForm() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    loan_id: '', amount_paid: '', payment_mode: 'cash',
    location: '', transaction_ref: '', collected_at: '', remarks: '',
  })

  const [loanInfo, setLoanInfo]   = useState(null)
  const [loanError, setLoanError] = useState('')
  const [errors, setErrors]       = useState({})
  const [loading, setLoading]     = useState(false)
  const [apiError, setApiError]   = useState('')
  const [lookingUp, setLookingUp] = useState(false)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  // lookup loan by loan_no to show pending amount
  const lookupLoan = async () => {
    if (!form.loan_id.trim()) return
    setLookingUp(true)
    setLoanError('')
    setLoanInfo(null)
    try {
      const res = await loansAPI.list({ search: form.loan_id, per_page: 1 })
      const found = res.data.data.data?.find(l => l.loan_no === form.loan_id || l.id == form.loan_id)
      if (found) {
        setLoanInfo(found)
        setForm(f => ({ ...f, loan_id: found.id }))
      } else {
        setLoanError('Loan not found')
      }
    } catch {
      setLoanError('Could not look up loan')
    } finally {
      setLookingUp(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setApiError('')
    setErrors({})
    setLoading(true)
    try {
      await collectionsAPI.create(form)
      navigate('/collections')
    } catch (err) {
      const data = err.response?.data
      if (data?.errors) setErrors(data.errors)
      else setApiError(data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 28, maxWidth: 600 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>←</button>
        <h2 style={{ margin: 0 }}>Add Collection</h2>
      </div>

      <div style={{ background: '#fff', borderRadius: 10, padding: 28, boxShadow: '0 1px 4px rgba(0,0,0,.07)' }}>

        {apiError && <div style={{ color: 'red', marginBottom: 16, fontSize: 13 }}>{apiError}</div>}

        <form onSubmit={handleSubmit}>

          {/* Loan lookup */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 5, fontSize: 13, fontWeight: 600 }}>Loan No *</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                style={inputStyle}
                value={form.loan_id}
                onChange={set('loan_id')}
                placeholder="Enter loan number e.g. LN-202501-00001"
              />
              <button
                type="button"
                onClick={lookupLoan}
                style={{ padding: '8px 14px', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: 6, cursor: 'pointer', fontSize: 13, whiteSpace: 'nowrap' }}
              >
                {lookingUp ? '...' : 'Lookup'}
              </button>
            </div>
            {loanError && <div style={{ color: 'red', fontSize: 12, marginTop: 4 }}>{loanError}</div>}
            {errors.loan_id && <div style={{ color: 'red', fontSize: 12, marginTop: 4 }}>{errors.loan_id[0]}</div>}
          </div>

          {/* Loan info */}
          {loanInfo && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '12px 16px', marginBottom: 16, fontSize: 13 }}>
              <div style={{ fontWeight: 700, color: '#166534', marginBottom: 6 }}>{loanInfo.customer_name} — {loanInfo.loan_no}</div>
              <div style={{ display: 'flex', gap: 20, color: '#374151' }}>
                <span>Loan: <strong>₹{loanInfo.loan_amount}</strong></span>
                <span>Pending: <strong style={{ color: '#dc2626' }}>₹{loanInfo.loan_amount - (loanInfo.total_collected || 0)}</strong></span>
              </div>
            </div>
          )}

          {/* Amount and Mode */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 5, fontSize: 13, fontWeight: 600 }}>Amount Paid (₹) *</label>
              <input style={inputStyle} type="number" value={form.amount_paid} onChange={set('amount_paid')} placeholder="5000" />
              {errors.amount_paid && <div style={{ color: 'red', fontSize: 12, marginTop: 4 }}>{errors.amount_paid[0]}</div>}
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 5, fontSize: 13, fontWeight: 600 }}>Payment Mode *</label>
              <select style={inputStyle} value={form.payment_mode} onChange={set('payment_mode')}>
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="card">Card</option>
              </select>
              {errors.payment_mode && <div style={{ color: 'red', fontSize: 12, marginTop: 4 }}>{errors.payment_mode[0]}</div>}
            </div>
          </div>

          {/* Transaction ref and date */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 5, fontSize: 13, fontWeight: 600 }}>Transaction Ref</label>
              <input style={inputStyle} value={form.transaction_ref} onChange={set('transaction_ref')} placeholder="UPI ref / card txn id" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 5, fontSize: 13, fontWeight: 600 }}>Collection Date & Time</label>
              <input style={inputStyle} type="datetime-local" value={form.collected_at} onChange={set('collected_at')} />
            </div>
          </div>

          {/* Location */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 5, fontSize: 13, fontWeight: 600 }}>Location (optional)</label>
            <input style={inputStyle} value={form.location} onChange={set('location')} placeholder="e.g. Near City Mall, Andheri" />
          </div>

          {/* Remarks */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', marginBottom: 5, fontSize: 13, fontWeight: 600 }}>Remarks</label>
            <textarea style={{ ...inputStyle, height: 60, resize: 'vertical' }} value={form.remarks} onChange={set('remarks')} placeholder="Optional remarks" />
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              type="submit"
              disabled={loading}
              style={{ padding: '9px 24px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}
            >
              {loading ? 'Saving...' : 'Save Collection'}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              style={{ padding: '9px 18px', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: 6, cursor: 'pointer', fontSize: 14 }}
            >
              Cancel
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}