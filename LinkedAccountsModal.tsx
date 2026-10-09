import { useState } from 'react'
import { IconX, IconLoader2, IconBuildingBank } from '@tabler/icons-react'
import { UserAccount } from '../lib/types'
import { updateUser, generateId } from '../lib/storage'

interface LinkedAccount {
  id: string
  bankName: string
  accountNumber: string
  routingNumber: string
  status: 'Submitted' | 'Pending' | 'Completed' | 'Rejected'
}

interface Props {
  user: UserAccount
  onClose: () => void
  onUpdate: (u: UserAccount) => void
}

export default function LinkedAccountsModal({ user, onClose, onUpdate }: Props) {
  const [bankName, setBankName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [routingNumber, setRoutingNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)

  // Store linked accounts in a simple extension of user (using a custom field via any for simplicity)
  const linked: LinkedAccount[] = (user as any).linkedAccounts || []

  const submit = () => {
    if (!bankName || !accountNumber || !routingNumber) {
      alert('Please fill all fields')
      return
    }
    setLoading(true)
    setTimeout(() => {
      const newAcc: LinkedAccount = {
        id: generateId('link'),
        bankName,
        accountNumber,
        routingNumber,
        status: 'Submitted',
      }
      const updated = { ...user, linkedAccounts: [...linked, newAcc] } as any
      updateUser(user.id, updated)
      onUpdate(updated)
      setLoading(false)
      setShowForm(false)
      setBankName('')
      setAccountNumber('')
      setRoutingNumber('')
    }, 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 p-0 sm:p-4">
      <div className="glass-card rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b border-white/10">
          <h3 className="font-semibold">External Linked Accounts</h3>
          <button onClick={onClose}><IconX size={20} /></button>
        </div>
        <div className="p-4 space-y-3">
          {linked.length === 0 && !showForm && (
            <p className="text-sm text-gray-400 text-center py-6">No linked accounts yet.</p>
          )}
          {linked.map(a => (
            <div key={a.id} className="p-3 rounded-xl bg-white/5">
              <div className="font-medium">{a.bankName}</div>
              <div className="text-xs text-gray-400">••••{a.accountNumber.slice(-4)} · {a.status}</div>
            </div>
          ))}
          {showForm ? (
            <div className="space-y-3 pt-2">
              <input className="w-full px-4 py-2.5 rounded-xl bg-navy-800 border border-white/10" placeholder="Bank Name" value={bankName} onChange={e => setBankName(e.target.value)} />
              <input className="w-full px-4 py-2.5 rounded-xl bg-navy-800 border border-white/10" placeholder="Account Number" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} />
              <input className="w-full px-4 py-2.5 rounded-xl bg-navy-800 border border-white/10" placeholder="Routing Number" value={routingNumber} onChange={e => setRoutingNumber(e.target.value)} />
              <button onClick={submit} disabled={loading} className="w-full py-3 rounded-xl bg-blue-600 flex items-center justify-center gap-2 disabled:opacity-60">
                {loading && <IconLoader2 className="animate-spin" size={18} />}
                {loading ? 'Submitting...' : 'Submit Request'}
              </button>
              <button onClick={() => setShowForm(false)} className="w-full py-2 text-sm text-gray-400">Cancel</button>
            </div>
          ) : (
            <button onClick={() => setShowForm(true)} className="w-full py-3 rounded-xl bg-blue-600">
              Request to Link Account
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
