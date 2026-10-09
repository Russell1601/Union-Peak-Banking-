import { useState } from 'react'
import { IconX, IconCamera, IconLoader2 } from '@tabler/icons-react'
import { UserAccount, CheckDeposit } from '../lib/types'
import { updateUser, generateId } from '../lib/storage'

interface Props {
  user: UserAccount
  onClose: () => void
  onUpdate: (u: UserAccount) => void
}

export default function CheckDepositModal({ user, onClose, onUpdate }: Props) {
  const [amount, setAmount] = useState('')
  const [front, setFront] = useState<string | null>(null)
  const [back, setBack] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleImage = (side: 'front' | 'back', file: File | null) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      if (side === 'front') setFront(reader.result as string)
      else setBack(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const submit = () => {
    if (!amount || !front || !back) {
      alert('Please enter amount and upload both sides of the check')
      return
    }
    setLoading(true)
    setTimeout(() => {
      const deposit: CheckDeposit = {
        id: generateId('chk'),
        amount: parseFloat(amount),
        frontImage: front,
        backImage: back,
        status: 'Submitted',
        date: new Date().toISOString(),
      }
      const updated = {
        ...user,
        checkDeposits: [deposit, ...user.checkDeposits],
      }
      updateUser(user.id, updated)
      onUpdate(updated)
      setLoading(false)
      setDone(true)
    }, 2500)
  }

  if (done) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
        <div className="glass-card rounded-2xl p-6 w-full max-w-sm text-center">
          <div className="text-green-400 text-4xl mb-3">✓</div>
          <h3 className="font-semibold text-lg mb-2">Check Submitted</h3>
          <p className="text-sm text-gray-400 mb-6">Status: Submitted. Funds will appear after review.</p>
          <button onClick={onClose} className="w-full py-3 rounded-xl bg-blue-600">Done</button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 p-0 sm:p-4">
      <div className="glass-card rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b border-white/10">
          <h3 className="font-semibold">Mobile Check Deposit</h3>
          <button onClick={onClose}><IconX size={20} /></button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Amount</label>
            <input
              type="number"
              className="w-full px-4 py-2.5 rounded-xl bg-navy-800 border border-white/10 outline-none focus:border-blue-500"
              placeholder="0.00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">Front of Check</label>
            <label className="flex flex-col items-center justify-center h-28 rounded-xl border border-dashed border-white/20 cursor-pointer hover:bg-white/5">
              {front ? <img src={front} alt="Front" className="h-full object-contain rounded-lg" /> : (
                <><IconCamera size={24} className="text-gray-400 mb-1" /><span className="text-xs text-gray-400">Upload Front</span></>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={e => handleImage('front', e.target.files?.[0] || null)} />
            </label>
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">Back of Check</label>
            <label className="flex flex-col items-center justify-center h-28 rounded-xl border border-dashed border-white/20 cursor-pointer hover:bg-white/5">
              {back ? <img src={back} alt="Back" className="h-full object-contain rounded-lg" /> : (
                <><IconCamera size={24} className="text-gray-400 mb-1" /><span className="text-xs text-gray-400">Upload Back</span></>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={e => handleImage('back', e.target.files?.[0] || null)} />
            </label>
          </div>

          <button
            onClick={submit}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading && <IconLoader2 className="animate-spin" size={18} />}
            {loading ? 'Submitting...' : 'Submit Check'}
          </button>
        </div>
      </div>
    </div>
  )
}
