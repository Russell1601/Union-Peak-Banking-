import { useState } from 'react'
import { IconX, IconLoader2 } from '@tabler/icons-react'
import { UserAccount } from '../lib/types'
import { updateUser, generateId } from '../lib/storage'

interface JointRequest {
  id: string
  fullName: string
  email: string
  phone: string
  relationship: string
  ssnLast4: string
  address: string
  status: 'Submitted' | 'Pending' | 'Completed' | 'Rejected'
}

interface Props {
  user: UserAccount
  onClose: () => void
  onUpdate: (u: UserAccount) => void
}

export default function JointAccountsModal({ user, onClose, onUpdate }: Props) {
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', relationship: '', ssnLast4: '', address: '' })
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const requests: JointRequest[] = (user as any).jointRequests || []

  const submit = () => {
    if (!form.fullName || !form.email || !form.phone || !form.relationship || !form.ssnLast4 || !form.address) {
      alert('Please fill all fields')
      return
    }
    setLoading(true)
    setTimeout(() => {
      const req: JointRequest = { id: generateId('joint'), ...form, status: 'Submitted' }
      const updated = { ...user, jointRequests: [...requests, req] } as any
      updateUser(user.id, updated)
      onUpdate(updated)
      setLoading(false)
      setShowForm(false)
    }, 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 p-0 sm:p-4">
      <div className="glass-card rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b border-white/10">
          <h3 className="font-semibold">Joint Accounts & Authorized Users</h3>
          <button onClick={onClose}><IconX size={20} /></button>
        </div>
        <div className="p-4 space-y-3">
          {requests.map(r => (
            <div key={r.id} className="p-3 rounded-xl bg-white/5">
              <div className="font-medium">{r.fullName}</div>
              <div className="text-xs text-gray-400">{r.relationship} · {r.status}</div>
            </div>
          ))}
          {showForm ? (
            <div className="space-y-3">
              {(['fullName', 'email', 'phone', 'relationship', 'ssnLast4', 'address'] as const).map(key => (
                <input
                  key={key}
                  className="w-full px-4 py-2.5 rounded-xl bg-navy-800 border border-white/10"
                  placeholder={key === 'ssnLast4' ? 'SSN Last 4' : key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
                  value={form[key]}
                  onChange={e => setForm({ ...form, [key]: e.target.value })}
                  maxLength={key === 'ssnLast4' ? 4 : undefined}
                />
              ))}
              <button onClick={submit} disabled={loading} className="w-full py-3 rounded-xl bg-blue-600 flex items-center justify-center gap-2 disabled:opacity-60">
                {loading && <IconLoader2 className="animate-spin" size={18} />}
                Submit Request
              </button>
              <button onClick={() => setShowForm(false)} className="w-full py-2 text-sm text-gray-400">Cancel</button>
            </div>
          ) : (
            <button onClick={() => setShowForm(true)} className="w-full py-3 rounded-xl bg-blue-600">Request Joint / Authorized User</button>
          )}
        </div>
      </div>
    </div>
  )
}
