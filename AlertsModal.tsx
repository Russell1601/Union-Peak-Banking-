import { useState } from 'react'
import { IconX } from '@tabler/icons-react'
import { UserAccount } from '../lib/types'
import { updateUser } from '../lib/storage'

interface Props {
  user: UserAccount
  onClose: () => void
  onUpdate: (u: UserAccount) => void
}

export default function AlertsModal({ user, onClose, onUpdate }: Props) {
  const alerts = (user as any).alerts || {
    lowBalance: true,
    largeTransaction: true,
    login: true,
    checkDeposit: true,
    email: true,
    sms: false,
  }

  const toggle = (key: string) => {
    const updatedAlerts = { ...alerts, [key]: !alerts[key] }
    const updated = { ...user, alerts: updatedAlerts } as any
    updateUser(user.id, updated)
    onUpdate(updated)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 p-0 sm:p-4">
      <div className="glass-card rounded-t-2xl sm:rounded-2xl w-full max-w-md p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">Alerts & Notifications</h3>
          <button onClick={onClose}><IconX size={20} /></button>
        </div>
        <div className="space-y-3">
          {[
            { key: 'lowBalance', label: 'Low Balance Alert' },
            { key: 'largeTransaction', label: 'Large Transaction Alert' },
            { key: 'login', label: 'Login Alert' },
            { key: 'checkDeposit', label: 'Check Deposit Status' },
            { key: 'email', label: 'Email Notifications' },
            { key: 'sms', label: 'SMS Notifications' },
          ].map(item => (
            <div key={item.key} className="flex justify-between items-center p-3 rounded-xl bg-white/5">
              <span className="text-sm">{item.label}</span>
              <button
                onClick={() => toggle(item.key)}
                className={`w-12 h-6 rounded-full relative transition ${alerts[item.key] ? 'bg-blue-600' : 'bg-gray-600'}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition ${alerts[item.key] ? 'left-6' : 'left-0.5'}`} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
