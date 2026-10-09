import { useState } from 'react'
import { IconX, IconLoader2, IconCalendar } from '@tabler/icons-react'
import { UserAccount } from '../lib/types'
import { updateUser, generateId } from '../lib/storage'

interface Scheduled {
  id: string
  type: 'one-time' | 'weekly' | 'monthly'
  amount: number
  recipient: string
  nextDate: string
  status: 'Active' | 'Cancelled'
}

interface Props {
  user: UserAccount
  onClose: () => void
  onUpdate: (u: UserAccount) => void
}

export default function ScheduledTransfersModal({ user, onClose, onUpdate }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState<'one-time' | 'weekly' | 'monthly'>('one-time')
  const [date, setDate] = useState('')
  const [loading, setLoading] = useState(false)

  const scheduled: Scheduled[] = (user as any).scheduledTransfers || []

  const submit = () => {
    if (!recipient || !amount || !date) {
      alert('Please fill all fields')
      return
    }
    setLoading(true)
    setTimeout(() => {
      const item: Scheduled = {
        id: generateId('sch'),
        type,
        amount: parseFloat(amount),
        recipient,
        nextDate: date,
        status: 'Active',
      }
      const updated = { ...user, scheduledTransfers: [...scheduled, item] } as any
      updateUser(user.id, updated)
      onUpdate(updated)
      setLoading(false)
      setShowForm(false)
    }, 2000)
  }

  const cancel = (id: string) => {
    const list = scheduled.map(s => s.id === id ? { ...s, status: 'Cancelled' as const } : s)
    const updated = { ...user, scheduledTransfers: list } as any
    updateUser(user.id, updated)
    onUpdate(updated)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 p-0 sm:p-4">
      <div className="glass-card rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b border-white/10">
          <h3 className="font-semibold">Scheduled & Recurring</h3>
          <button onClick={onClose}><IconX size={20} /></button>
        </div>
        <div className="p-4 space-y-3">
          {scheduled.filter(s => s.status === 'Active').map(s => (
            <div key={s.id} className="p-3 rounded-xl bg-white/5 flex justify-between items-center">
              <div>
                <div className="font-medium">{s.recipient}</div>
                <div className="text-xs text-gray-400">${s.amount.toFixed(2)} · {s.type} · {s.nextDate}</div>
              </div>
              <button onClick={() => cancel(s.id)} className="text-xs text-red-400">Cancel</button>
            </div>
          ))}
          {scheduled.filter(s => s.status === 'Active').length === 0 && !showForm && (
            <p className="text-sm text-gray-400 text-center py-6">No scheduled transfers.</p>
          )}
          {showForm ? (
            <div className="space-y-3">
              <input className="w-full px-4 py-2.5 rounded-xl bg-navy-800 border border-white/10" placeholder="Recipient Name" value={recipient} onChange={e => setRecipient(e.target.value)} />
              <input className="w-full px-4 py-2.5 rounded-xl bg-navy-800 border border-white/10" type="number" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} />
              <select className="w-full px-4 py-2.5 rounded-xl bg-navy-800 border border-white/10" value={type} onChange={e => setType(e.target.value as any)}>
                <option value="one-time">One-time</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
              <input className="w-full px-4 py-2.5 rounded-xl bg-navy-800 border border-white/10" type="date" value={date} onChange={e => setDate(e.target.value)} />
              <button onClick={submit} disabled={loading} className="w-full py-3 rounded-xl bg-blue-600 flex items-center justify-center gap-2 disabled:opacity-60">
                {loading && <IconLoader2 className="animate-spin" size={18} />}
                Schedule
              </button>
              <button onClick={() => setShowForm(false)} className="w-full py-2 text-sm text-gray-400">Cancel</button>
            </div>
          ) : (
            <button onClick={() => setShowForm(true)} className="w-full py-3 rounded-xl bg-blue-600">Schedule Transfer</button>
          )}
        </div>
      </div>
    </div>
  )
}
