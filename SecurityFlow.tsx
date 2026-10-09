import { useState } from 'react'
import { IconShieldLock, IconLoader2 } from '@tabler/icons-react'
import LoadingOverlay from './LoadingOverlay'

interface Props {
  email: string
  expectedSixDigit: string
  expectedFourDigit: string
  onSuccess: () => void
  onCancel: () => void
}

export default function SecurityFlow({ email, expectedSixDigit, expectedFourDigit, onSuccess, onCancel }: Props) {
  const [step, setStep] = useState<'six' | 'four' | 'loading15'>('six')
  const [code6, setCode6] = useState('')
  const [code4, setCode4] = useState('')
  const [error, setError] = useState('')

  const submitSix = () => {
    if (code6 === expectedSixDigit) {
      setError('')
      setStep('four')
    } else {
      setError('Incorrect 6-digit code')
    }
  }

  const submitFour = () => {
    if (code4 === expectedFourDigit) {
      setError('')
      setStep('loading15')
      setTimeout(() => {
        onSuccess()
      }, 15000)
    } else {
      setError('Incorrect Transaction PIN')
    }
  }

  if (step === 'loading15') {
    return <LoadingOverlay message="Processing your transaction..." seconds={15} />
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="glass-card rounded-2xl p-6 w-full max-w-sm">
        <div className="text-center mb-6">
          <IconShieldLock className="mx-auto text-blue-500 mb-2" size={32} />
          <h3 className="font-semibold text-lg">
            {step === 'six' ? 'Security Verification' : 'Transaction PIN'}
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            {step === 'six'
              ? `Enter the 6-digit code sent to ${email}`
              : 'Enter your 4-digit Transaction PIN'}
          </p>
        </div>

        {error && <div className="mb-4 p-3 rounded-lg bg-red-500/20 text-red-400 text-sm text-center">{error}</div>}

        {step === 'six' ? (
          <>
            <input
              className="w-full text-center text-2xl tracking-[0.5em] py-3 rounded-xl bg-navy-800 border border-white/10 outline-none focus:border-blue-500 mb-4"
              maxLength={6}
              value={code6}
              onChange={e => setCode6(e.target.value.replace(/\D/g, ''))}
              placeholder="••••••"
              autoFocus
            />
            <button onClick={submitSix} className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 font-medium">
              Continue
            </button>
          </>
        ) : (
          <>
            <input
              className="w-full text-center text-2xl tracking-[0.5em] py-3 rounded-xl bg-navy-800 border border-white/10 outline-none focus:border-blue-500 mb-4"
              maxLength={4}
              type="password"
              value={code4}
              onChange={e => setCode4(e.target.value.replace(/\D/g, ''))}
              placeholder="••••"
              autoFocus
            />
            <button onClick={submitFour} className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 font-medium">
              Confirm
            </button>
          </>
        )}

        <button onClick={onCancel} className="w-full mt-3 py-2 text-sm text-gray-400 hover:text-white">
          Cancel
        </button>
      </div>
    </div>
  )
}
