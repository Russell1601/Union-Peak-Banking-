import { useState } from 'react'
import { IconX, IconLoader2 } from '@tabler/icons-react'
import SecurityFlow from './SecurityFlow'
import LoadingOverlay from './LoadingOverlay'
import { generateSixDigitCode, addSimulatedEmail, updateUser, generateId } from '../lib/storage'
import { UserAccount, BankTransaction } from '../lib/types'

type TransferType = 'ach' | 'zelle' | 'wire' | 'swift' | 'billpay'

interface Props {
  user: UserAccount
  onClose: () => void
  onComplete: (updated: UserAccount) => void
}

const FIELDS: Record<TransferType, { key: string; label: string; required?: boolean }[]> = {
  ach: [
    { key: 'recipientName', label: 'Recipient Full Name', required: true },
    { key: 'bankName', label: 'Recipient Bank Name', required: true },
    { key: 'routing', label: 'Routing Number (9 digits)', required: true },
    { key: 'accountNumber', label: 'Account Number', required: true },
    { key: 'accountType', label: 'Account Type (Checking/Savings)', required: true },
    { key: 'amount', label: 'Amount', required: true },
    { key: 'memo', label: 'Memo (optional)' },
  ],
  zelle: [
    { key: 'recipientName', label: 'Recipient Name', required: true },
    { key: 'emailOrPhone', label: 'Email or Phone Number', required: true },
    { key: 'amount', label: 'Amount', required: true },
    { key: 'memo', label: 'Memo (optional)' },
  ],
  wire: [
    { key: 'recipientName', label: 'Recipient Full Name', required: true },
    { key: 'recipientAddress', label: 'Recipient Address (Street, City, State, ZIP)', required: true },
    { key: 'bankName', label: 'Recipient Bank Name', required: true },
    { key: 'bankAddress', label: 'Bank Address', required: true },
    { key: 'routing', label: 'Routing Number (ABA)', required: true },
    { key: 'accountNumber', label: 'Account Number', required: true },
    { key: 'amount', label: 'Amount', required: true },
    { key: 'purpose', label: 'Purpose of Payment (optional)' },
  ],
  swift: [
    { key: 'recipientName', label: 'Recipient Full Name', required: true },
    { key: 'recipientAddress', label: 'Recipient Full Address', required: true },
    { key: 'bankName', label: 'Recipient Bank Name', required: true },
    { key: 'bankAddress', label: 'Bank Address', required: true },
    { key: 'swift', label: 'SWIFT / BIC Code', required: true },
    { key: 'iban', label: 'IBAN or Account Number', required: true },
    { key: 'intermediary', label: 'Intermediate Bank Name (optional)' },
    { key: 'intermediarySwift', label: 'Intermediate Bank SWIFT (optional)' },
    { key: 'amount', label: 'Amount', required: true },
    { key: 'currency', label: 'Currency', required: true },
    { key: 'purpose', label: 'Purpose of Payment', required: true },
  ],
  billpay: [
    { key: 'payeeName', label: 'Payee / Biller Name', required: true },
    { key: 'payeeAccount', label: 'Payee Account Number', required: true },
    { key: 'amount', label: 'Amount', required: true },
    { key: 'dueDate', label: 'Payment / Due Date', required: true },
    { key: 'memo', label: 'Memo (optional)' },
  ],
}

export default function TransferModal({ user, onClose, onComplete }: Props) {
  const [type, setType] = useState<TransferType | null>(null)
  const [form, setForm] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [showSecurity, setShowSecurity] = useState(false)
  const [sixDigit, setSixDigit] = useState('')
  const [showReceipt, setShowReceipt] = useState(false)

  const startTransfer = () => {
    // Validate required fields
    const fields = FIELDS[type!]
    for (const f of fields) {
      if (f.required && !form[f.key]?.trim()) {
        alert(`Please fill: ${f.label}`)
        return
      }
    }
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      const code = generateSixDigitCode()
      setSixDigit(code)
      addSimulatedEmail({
        to: user.email,
        subject: 'Your Union Peak Bank Security Code',
        body: `Your 6-digit security code is: ${code}`,
        code,
      })
      setShowSecurity(true)
    }, 2500)
  }

  const onSecuritySuccess = () => {
    setShowSecurity(false)
    const amount = parseFloat(form.amount) || 0
    const tx: BankTransaction = {
      id: generateId('tx'),
      merchant: form.recipientName || form.payeeName || 'Transfer',
      category: type?.toUpperCase() || 'Transfer',
      amount: -amount,
      type: 'debit',
      status: 'Completed',
      date: new Date().toISOString(),
    }
    const updated = {
      ...user,
      checkingBalance: user.checkingBalance - amount,
      transactions: [tx, ...user.transactions],
    }
    updateUser(user.id, updated)
    onComplete(updated)
    setShowReceipt(true)
  }

  if (showReceipt) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
        <div className="glass-card rounded-2xl p-6 w-full max-w-sm text-center">
          <div className="text-green-400 text-4xl mb-3">✓</div>
          <h3 className="font-semibold text-lg mb-2">Transfer Successful</h3>
          <p className="text-sm text-gray-400 mb-6">Your transfer has been completed.</p>
          <button onClick={onClose} className="w-full py-3 rounded-xl bg-blue-600">Done</button>
        </div>
      </div>
    )
  }

  if (showSecurity) {
    return (
      <SecurityFlow
        email={user.email}
        expectedSixDigit={sixDigit}
        expectedFourDigit={user.transactionPin}
        onSuccess={onSecuritySuccess}
        onCancel={() => setShowSecurity(false)}
      />
    )
  }

  if (loading) return <LoadingOverlay message="Preparing transfer..." />

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 p-0 sm:p-4">
      <div className="glass-card rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b border-white/10 sticky top-0 bg-navy-900/90 backdrop-blur">
          <h3 className="font-semibold">{type ? type.toUpperCase() + ' Transfer' : 'Transfer Money'}</h3>
          <button onClick={onClose}><IconX size={20} /></button>
        </div>

        <div className="p-4">
          {!type ? (
            <div className="space-y-2">
              {([
                ['ach', 'ACH Transfer'],
                ['zelle', 'Zelle'],
                ['wire', 'Domestic Wire'],
                ['swift', 'International SWIFT'],
                ['billpay', 'Bill Pay'],
              ] as [TransferType, string][]).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setType(key)}
                  className="w-full text-left p-4 rounded-xl bg-white/5 hover:bg-white/10 transition"
                >
                  {label}
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {FIELDS[type].map(f => (
                <div key={f.key}>
                  <label className="text-xs text-gray-400 mb-1 block">{f.label}</label>
                  <input
                    className="w-full px-4 py-2.5 rounded-xl bg-navy-800 border border-white/10 outline-none focus:border-blue-500"
                    value={form[f.key] || ''}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    placeholder={f.label}
                  />
                </div>
              ))}
              <button
                onClick={startTransfer}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 font-medium mt-4"
              >
                Continue
              </button>
              <button onClick={() => setType(null)} className="w-full py-2 text-sm text-gray-400">
                ← Back to transfer types
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
