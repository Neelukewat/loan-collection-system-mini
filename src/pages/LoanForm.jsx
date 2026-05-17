import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loansAPI } from '../api/services'

const inputStyle = {
  width: '100%', padding: '8px 12px', borderRadius: 6,
  border: '1px solid #d1d5db', fontSize: 14, boxSizing: 'border-box',
}

export default function LoanForm() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    customer_name: '', mobile: '', address: '',
    loan_amount: '', emi_amount: '', tenure_months: '',
    disbursed_at: '', first_emi_date: '', notes: '',
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setApiError('')
    setErrors({})
    setLoading(true)
    try {
      await loansAPI.create(form)
      navigate('/loans')
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
        <h2 style={{ margin: 0 }}>Create New Loan</h2>
      </div>

      <div style={{ background: '#fff', borderRadius: 10, padding: 28, boxShadow: '0 1px 4px rgba(0,0,0,.07)' }}>

        {apiError && <div style={{ color: 'red', marginBottom: 16, fontSize: 13 }}>{apiError}</div>}

        <form onSubmit={handleSubmit}>

          {/* Customer Name */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 5, fontSize: 13, fontWeight: 600 }}>Customer Name *</label>
            <input style={inputStyle} value={form.customer_name} onChange={set('customer_name')} placeholder="Full name" />
            {errors.customer_name && <div style={{ color: 'red', fontSize: 12, marginTop: 4 }}>{errors.customer_name[0]}</div>}
          </div>

          {/* Mobile */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 5, fontSize: 13, fontWeight: 600 }}>Mobile *</label>
            <input style={inputStyle} value={form.mobile} onChange={set('mobile')} placeholder="10-digit mobile number" maxLength={10} />
            {errors.mobile && <div style={{ color: 'red', fontSize: 12, marginTop: 4 }}>{errors.mobile[0]}</div>}
          </div>

          {/* Address */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 5, fontSize: 13, fontWeight: 600 }}>Address *</label>
            <textarea style={{ ...inputStyle, height: 80, resize: 'vertical' }} value={form.address} onChange={set('address')} placeholder="Full address" />
            {errors.address && <div style={{ color: 'red', fontSize: 12, marginTop: 4 }}>{errors.address[0]}</div>}
          </div>

          {/* Loan Amount and EMI */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 5, fontSize: 13, fontWeight: 600 }}>Loan Amount (₹) *</label>
              <input style={inputStyle} type="number" value={form.loan_amount} onChange={set('loan_amount')} placeholder="50000" />
              {errors.loan_amount && <div style={{ color: 'red', fontSize: 12, marginTop: 4 }}>{errors.loan_amount[0]}</div>}
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 5, fontSize: 13, fontWeight: 600 }}>EMI Amount (₹) *</label>
              <input style={inputStyle} type="number" value={form.emi_amount} onChange={set('emi_amount')} placeholder="5000" />
              {errors.emi_amount && <div style={{ color: 'red', fontSize: 12, marginTop: 4 }}>{errors.emi_amount[0]}</div>}
            </div>
          </div>

          {/* Tenure */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 5, fontSize: 13, fontWeight: 600 }}>Tenure (months) *</label>
            <input style={inputStyle} type="number" value={form.tenure_months} onChange={set('tenure_months')} placeholder="12" />
            {errors.tenure_months && <div style={{ color: 'red', fontSize: 12, marginTop: 4 }}>{errors.tenure_months[0]}</div>}
          </div>

          {/* Dates */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 5, fontSize: 13, fontWeight: 600 }}>Disbursement Date *</label>
              <input style={inputStyle} type="date" value={form.disbursed_at} onChange={set('disbursed_at')} />
              {errors.disbursed_at && <div style={{ color: 'red', fontSize: 12, marginTop: 4 }}>{errors.disbursed_at[0]}</div>}
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 5, fontSize: 13, fontWeight: 600 }}>First EMI Date *</label>
              <input style={inputStyle} type="date" value={form.first_emi_date} onChange={set('first_emi_date')} />
              {errors.first_emi_date && <div style={{ color: 'red', fontSize: 12, marginTop: 4 }}>{errors.first_emi_date[0]}</div>}
            </div>
          </div>

          {/* Notes */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', marginBottom: 5, fontSize: 13, fontWeight: 600 }}>Notes</label>
            <textarea style={{ ...inputStyle, height: 60, resize: 'vertical' }} value={form.notes} onChange={set('notes')} placeholder="Optional notes" />
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              type="submit"
              disabled={loading}
              style={{ padding: '9px 24px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}
            >
              {loading ? 'Creating...' : 'Create Loan'}
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