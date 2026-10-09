import { useState } from 'react'
import { IconX, IconLock, IconLoader2 } from '@tabler/icons-react'
import { UserAccount, Beneficiary } from '../lib/types'
import { updateUser, generateId } from '../lib/storage'

interface Props {
  user: UserAccount
  onClose: () => void
  onUpdate: (u: UserAccount) => void
}

export default function BeneficiaryModal({ user, onClose, onUpdate }: Props) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const submit = () => {
    if (!fullName || !email || !phone || !address) {
      alert('Please fill all fields')
      return
    }
    setLoading(true)
    setTimeout(() => {
      const b: Beneficiary = {
        id: generateId('ben'),
        fullName,
        email,
        phone,
        address,
        status: 'Submitted',
      }
      const updated = {
        ...user,
        beneficiaries: [...user.beneficiaries, b],
      }
      updateUser(user.id, updated)
      onUpdate(updated)
      setLoading(false)
      setDone(true)
    }, 2000)
  }

  if (done) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
        <div className="glass-card rounded-2xl p-6 w-full max-w-sm text-center">
          <div className="text-green-400 text-4xl mb-3">✓</div>
          <h3 className="font-semibold text-lg mb-2">Request Submitted</h3>
          <p className="text-sm text-gray-400 mb-6">Status: Submitted</p>
          <button onClick={onClose} className="w-full py-3 rounded-xl bg-blue-600">Done</button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 p-0 sm:p-4">
      <div className="glass-card rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b border-white/10">
          <h3 className="font-semibold">Add Beneficiary</h3>
          <button onClick={onClose}><IconX size={20} /></button>
        </div>

        <div className="p-4">
          {!user.allowBeneficiaryRequest ? (
            <div className="text-center py-10">
              <IconLock size={40} className="mx-auto text-gray-500 mb-4" />
              <p className="text-gray-400 text-sm">
                Beneficiary requests are currently locked for your account.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Full Name</label>
                <input className="w-full px-4 py-2.5 rounded-xl bg-navy-800 border border-white/10 outline-none focus:border-blue-500" value={fullName} onChange={e => setFullName(e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Email</label>
                <input className="w-full px-4 py-2.5 rounded-xl bg-navy-800 border border-white/10 outline-none focus:border-blue-500" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Phone Number</label>
                <input className="w-full px-4 py-2.5 rounded-xl bg-navy-800 border border-white/10 outline-none focus:border-blue-500" value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Home Address</label>
                <input className="w-full px-4 py-2.5 rounded-xl bg-navy-800 border border-white/10 outline-none focus:border-blue-500" value={address} onChange={e => setAddress(e.target.value)} />
              </div>
              <button
                onClick={submit}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 flex items-center justify-center gap-2 disabled:opacity-60 mt-4"
              >
                {loading && <IconLoader2 className="animate-spin" size={18} />}
                {loading ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
