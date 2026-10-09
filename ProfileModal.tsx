import { useState } from 'react'
import { IconX, IconLoader2 } from '@tabler/icons-react'
import { UserAccount } from '../lib/types'
import { updateUser } from '../lib/storage'

interface Props {
  user: UserAccount
  onClose: () => void
  onUpdate: (u: UserAccount) => void
}

export default function ProfileModal({ user, onClose, onUpdate }: Props) {
  const [name, setName] = useState(user.name)
  const [phone, setPhone] = useState(user.phone)
  const [newConfirmPin, setNewConfirmPin] = useState('')
  const [newTxPin, setNewTxPin] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  const save = () => {
    setLoading(true)
    setTimeout(() => {
      const patch: Partial<UserAccount> = { name, phone }
      if (newConfirmPin.length === 6) patch.confirmationPin = newConfirmPin
      if (newTxPin.length === 4) patch.transactionPin = newTxPin
      updateUser(user.id, patch)
      onUpdate({ ...user, ...patch })
      setLoading(false)
      setMsg('Profile updated successfully')
      setNewConfirmPin('')
      setNewTxPin('')
    }, 1500)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 p-0 sm:p-4">
      <div className="glass-card rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b border-white/10">
          <h3 className="font-semibold">Profile & Security</h3>
          <button onClick={onClose}><IconX size={20} /></button>
        </div>

        <div className="p-4 space-y-4">
          {msg && <div className="p-3 rounded-lg bg-green-500/20 text-green-400 text-sm">{msg}</div>}

          <div>
            <label className="text-xs text-gray-400 mb-1 block">Full Name</label>
            <input className="w-full px-4 py-2.5 rounded-xl bg-navy-800 border border-white/10 outline-none focus:border-blue-500" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Phone</label>
            <input className="w-full px-4 py-2.5 rounded-xl bg-navy-800 border border-white/10 outline-none focus:border-blue-500" value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Email (cannot change)</label>
            <input className="w-full px-4 py-2.5 rounded-xl bg-navy-800 border border-white/10 opacity-60" value={user.email} disabled />
          </div>

          <div className="border-t border-white/10 pt-4">
            <h4 className="text-sm font-medium mb-3">Change PINs</h4>
            <div className="mb-3">
              <label className="text-xs text-gray-400 mb-1 block">New 6-digit Confirmation PIN</label>
              <input className="w-full px-4 py-2.5 rounded-xl bg-navy-800 border border-white/10 outline-none focus:border-blue-500" maxLength={6} value={newConfirmPin} onChange={e => setNewConfirmPin(e.target.value.replace(/\D/g, ''))} placeholder="Leave blank to keep current" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">New 4-digit Transaction PIN</label>
              <input className="w-full px-4 py-2.5 rounded-xl bg-navy-800 border border-white/10 outline-none focus:border-blue-500" maxLength={4} value={newTxPin} onChange={e => setNewTxPin(e.target.value.replace(/\D/g, ''))} placeholder="Leave blank to keep current" />
            </div>
          </div>

          <button
            onClick={save}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading && <IconLoader2 className="animate-spin" size={18} />}
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
