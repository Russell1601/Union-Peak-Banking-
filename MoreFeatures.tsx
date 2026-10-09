import { useState } from 'react'
import { IconX, IconCurrencyDollar, IconFileText, IconChartBar, IconShield, IconBuildingBank } from '@tabler/icons-react'
import { UserAccount, CurrencyCode } from '../lib/types'
import { updateUser, formatMoney, convertAmount, DEFAULT_RATES } from '../lib/storage'
import LinkedAccountsModal from './LinkedAccountsModal'
import ScheduledTransfersModal from './ScheduledTransfersModal'
import JointAccountsModal from './JointAccountsModal'
import AlertsModal from './AlertsModal'

interface Props {
  user: UserAccount
  onClose: () => void
  onUpdate: (u: UserAccount) => void
  onOpenSupport: () => void
  onOpenBeneficiary: () => void
  onOpenCheckDeposit: () => void
  onOpenProfile: () => void
}

export default function MoreFeatures({ user, onClose, onUpdate, onOpenSupport, onOpenBeneficiary, onOpenCheckDeposit, onOpenProfile }: Props) {
  const [section, setSection] = useState<'menu' | 'currency' | 'account' | 'statements' | 'credit' | 'overdraft'>('menu')
  const [showLinked, setShowLinked] = useState(false)
  const [showScheduled, setShowScheduled] = useState(false)
  const [showJoint, setShowJoint] = useState(false)
  const [showAlerts, setShowAlerts] = useState(false)

  const changeCurrency = (c: CurrencyCode) => {
    updateUser(user.id, { currency: c })
    onUpdate({ ...user, currency: c })
  }

  const toggleOverdraft = () => {
    const updated = { ...user, overdraftEnabled: !user.overdraftEnabled }
    updateUser(user.id, updated)
    onUpdate(updated)
  }

  if (section === 'currency') {
    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 p-0 sm:p-4">
        <div className="glass-card rounded-t-2xl sm:rounded-2xl w-full max-w-md p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Currency</h3>
            <button onClick={() => setSection('menu')}><IconX size={20} /></button>
          </div>
          <p className="text-sm text-gray-400 mb-4">Balances update in real time when you change currency.</p>
          <div className="space-y-2">
            {(Object.keys(DEFAULT_RATES) as CurrencyCode[]).map(c => (
              <button
                key={c}
                onClick={() => changeCurrency(c)}
                className={`w-full text-left p-4 rounded-xl flex justify-between ${user.currency === c ? 'bg-blue-600/20 border border-blue-500' : 'bg-white/5'}`}
              >
                <span>{c}</span>
                {user.currency === c && <span className="text-blue-400 text-sm">Active</span>}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (section === 'account') {
    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 p-0 sm:p-4">
        <div className="glass-card rounded-t-2xl sm:rounded-2xl w-full max-w-md p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Account & Routing</h3>
            <button onClick={() => setSection('menu')}><IconX size={20} /></button>
          </div>
          <div className="p-4 rounded-xl bg-blue-500/10 text-blue-300 text-sm">
            Funding instructions with your bank account details have been sent to your email {user.email}.
          </div>
        </div>
      </div>
    )
  }

  if (section === 'statements') {
    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 p-0 sm:p-4">
        <div className="glass-card rounded-t-2xl sm:rounded-2xl w-full max-w-md p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Statements & Documents</h3>
            <button onClick={() => setSection('menu')}><IconX size={20} /></button>
          </div>
          <div className="space-y-2">
            {['January 2026 Statement', 'February 2026 Statement', 'March 2026 Statement', '1099-INT Tax Document'].map(doc => (
              <div key={doc} className="p-4 rounded-xl bg-white/5 flex justify-between items-center">
                <span className="text-sm">{doc}</span>
                <button className="text-xs text-blue-400">View</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (section === 'credit') {
    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 p-0 sm:p-4">
        <div className="glass-card rounded-t-2xl sm:rounded-2xl w-full max-w-md p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Credit Score</h3>
            <button onClick={() => setSection('menu')}><IconX size={20} /></button>
          </div>
          <div className="text-center py-6">
            <div className="text-5xl font-bold text-blue-400 mb-2">{user.creditScore}</div>
            <div className="text-sm text-gray-400 mb-4">FICO Score Range: 300 – 850</div>
            <div className="text-xs text-gray-500">
              Payment History · Credit Utilization · Length of History · New Credit · Credit Mix
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (section === 'overdraft') {
    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 p-0 sm:p-4">
        <div className="glass-card rounded-t-2xl sm:rounded-2xl w-full max-w-md p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Overdraft Protection</h3>
            <button onClick={() => setSection('menu')}><IconX size={20} /></button>
          </div>
          <div className="flex justify-between items-center p-4 rounded-xl bg-white/5 mb-4">
            <span>Overdraft Protection</span>
            <button
              onClick={toggleOverdraft}
              className={`w-12 h-6 rounded-full relative transition ${user.overdraftEnabled ? 'bg-blue-600' : 'bg-gray-600'}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition ${user.overdraftEnabled ? 'left-6' : 'left-0.5'}`} />
            </button>
          </div>
          <p className="text-xs text-gray-400">
            Limit: {formatMoney(user.overdraftLimit)} · Links your Savings to cover Checking overdrafts.
          </p>
        </div>
      </div>
    )
  }

  if (showLinked) return <LinkedAccountsModal user={user} onClose={() => setShowLinked(false)} onUpdate={onUpdate} />
  if (showScheduled) return <ScheduledTransfersModal user={user} onClose={() => setShowScheduled(false)} onUpdate={onUpdate} />
  if (showJoint) return <JointAccountsModal user={user} onClose={() => setShowJoint(false)} onUpdate={onUpdate} />
  if (showAlerts) return <AlertsModal user={user} onClose={() => setShowAlerts(false)} onUpdate={onUpdate} />

  // Main menu
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 p-0 sm:p-4">
      <div className="glass-card rounded-t-2xl sm:rounded-2xl w-full max-w-md p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">More</h3>
          <button onClick={onClose}><IconX size={20} /></button>
        </div>
        <div className="space-y-1">
          {[
            { label: 'Currency', icon: IconCurrencyDollar, action: () => setSection('currency') },
            { label: 'Account & Routing', icon: IconBuildingBank, action: () => setSection('account') },
            { label: 'Statements & Documents', icon: IconFileText, action: () => setSection('statements') },
            { label: 'Credit Score', icon: IconChartBar, action: () => setSection('credit') },
            { label: 'Overdraft Protection', icon: IconShield, action: () => setSection('overdraft') },
            { label: 'Linked Accounts', icon: IconBuildingBank, action: () => setShowLinked(true) },
            { label: 'Scheduled Transfers', icon: IconFileText, action: () => setShowScheduled(true) },
            { label: 'Joint / Authorized Users', icon: IconFileText, action: () => setShowJoint(true) },
            { label: 'Alerts & Notifications', icon: IconFileText, action: () => setShowAlerts(true) },
            { label: 'Check Deposit', icon: IconFileText, action: () => { onClose(); onOpenCheckDeposit() } },
            { label: 'Add Beneficiary', icon: IconFileText, action: () => { onClose(); onOpenBeneficiary() } },
            { label: 'Support Chat', icon: IconFileText, action: () => { onClose(); onOpenSupport() } },
            { label: 'Profile & Security', icon: IconFileText, action: () => { onClose(); onOpenProfile() } },
          ].map(item => (
            <button key={item.label} onClick={item.action} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-left">
              <item.icon size={18} className="text-blue-400" />
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
