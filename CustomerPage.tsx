import { useState, useEffect } from 'react'
import {
  IconHome, IconCreditCard, IconArrowsExchange, IconPlus,
  IconBell, IconSun, IconMoon, IconEye, IconEyeOff,
  IconCopy, IconCheck, IconLoader2, IconShieldCheck, IconX
} from '@tabler/icons-react'
import {
  getUsers, getActiveUserId, setActiveUserId, getTheme, setTheme,
  createUser, getUserById, updateUser, formatMoney, formatBTC,
  convertAmount, DEFAULT_RATES, BTC_USD, generateSixDigitCode,
  addSimulatedEmail, getDeviceId
} from '../lib/storage'
import { UserAccount, CurrencyCode } from '../lib/types'
import TransferModal from '../components/TransferModal'
import CardsModal from '../components/CardsModal'
import CheckDepositModal from '../components/CheckDepositModal'
import SupportChat from '../components/SupportChat'
import BeneficiaryModal from '../components/BeneficiaryModal'
import ProfileModal from '../components/ProfileModal'
import MoreFeatures from '../components/MoreFeatures'
import LoadingOverlay from '../components/LoadingOverlay'

export default function CustomerPage() {
  const [user, setUser] = useState<UserAccount | null>(null)
  const [theme, setThemeState] = useState<'dark' | 'light'>(getTheme())
  const [cardIndex, setCardIndex] = useState(0) // 0=Checking, 1=Savings, 2=Bitcoin
  const [showBalance, setShowBalance] = useState(true)
  const [showAuth, setShowAuth] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showTransfer, setShowTransfer] = useState(false)
  const [showAddMoney, setShowAddMoney] = useState(false)
  const [showCards, setShowCards] = useState(false)
  const [showCheckDeposit, setShowCheckDeposit] = useState(false)
  const [showSupport, setShowSupport] = useState(false)
  const [showBeneficiary, setShowBeneficiary] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showMore, setShowMore] = useState(false)
  const [addMoneyMsg, setAddMoneyMsg] = useState('')

  // Auth form
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [txPin, setTxPin] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const id = getActiveUserId()
    if (id) {
      const u = getUserById(id)
      if (u) setUser(u)
      else setShowAuth(true)
    } else {
      setShowAuth(true)
    }

    const handler = () => {
      const id = getActiveUserId()
      if (id) setUser(getUserById(id) || null)
    }
    window.addEventListener('union_peak_db_changed', handler)
    return () => window.removeEventListener('union_peak_db_changed', handler)
  }, [])

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    setThemeState(next)
  }

  const handleSignup = () => {
    if (!name || !email || !password || confirmPin.length !== 6 || txPin.length !== 4) {
      setError('Please fill all fields. Confirmation PIN = 6 digits, Transaction PIN = 4 digits.')
      return
    }
    setLoading(true)
    setTimeout(() => {
      const newUser = createUser({ name, email, phone, password, confirmationPin: confirmPin, transactionPin: txPin })
      setActiveUserId(newUser.id)
      setUser(newUser)
      setShowAuth(false)
      setLoading(false)
      setError('')
    }, 2500)
  }

  const handleLogin = () => {
    const users = getUsers()
    const found = users.find(u => u.email === email && u.password === password)
    if (!found) {
      setError('Invalid email or password')
      return
    }
    setLoading(true)
    setTimeout(() => {
      // Simulate new device check
      const deviceId = getDeviceId()
      if (!found.devices.includes(deviceId)) {
        // Would normally ask for 6-digit Confirmation PIN here
        updateUser(found.id, { devices: [...found.devices, deviceId] })
      }
      setActiveUserId(found.id)
      setUser(found)
      setShowAuth(false)
      setLoading(false)
      setError('')
    }, 2500)
  }

  const copyAddress = () => {
    if (user?.bitcoinAddress) {
      navigator.clipboard.writeText(user.bitcoinAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const changeCurrency = (c: CurrencyCode) => {
    if (!user) return
    updateUser(user.id, { currency: c })
    setUser({ ...user, currency: c })
  }

  if (showAuth) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${theme === 'dark' ? 'bg-navy-900' : 'bg-gray-100'}`}>
        <div className={`w-full max-w-md rounded-2xl p-8 shadow-2xl ${theme === 'dark' ? 'glass-card' : 'bg-white border'}`}>
          <div className="text-center mb-8">
            <div className="text-3xl font-bold tracking-tight mb-1">
              <span className="text-blue-500">UNION</span> PEAK
            </div>
            <div className="text-xs tracking-widest text-gray-400">BANK</div>
          </div>

          <h2 className="text-xl font-semibold mb-6 text-center">
            {authMode === 'login' ? 'Welcome Back' : 'Create Your Account'}
          </h2>

          {error && <div className="mb-4 p-3 rounded-lg bg-red-500/20 text-red-400 text-sm">{error}</div>}

          {authMode === 'signup' && (
            <>
              <input className="input-field mb-3" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} />
              <input className="input-field mb-3" placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} />
            </>
          )}
          <input className="input-field mb-3" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
          <input className="input-field mb-3" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />

          {authMode === 'signup' && (
            <>
              <div className="text-xs text-gray-400 mb-1 mt-2">CREATE 6-DIGIT CONFIRMATION PIN</div>
              <input className="input-field mb-3" maxLength={6} placeholder="••••••" value={confirmPin} onChange={e => setConfirmPin(e.target.value.replace(/\D/g, ''))} />
              <div className="text-xs text-gray-400 mb-1">CREATE 4-DIGIT TRANSACTION PIN</div>
              <input className="input-field mb-4" maxLength={4} placeholder="••••" value={txPin} onChange={e => setTxPin(e.target.value.replace(/\D/g, ''))} />
            </>
          )}

          <button
            onClick={authMode === 'login' ? handleLogin : handleSignup}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 font-medium flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? <IconLoader2 className="animate-spin" size={20} /> : null}
            {authMode === 'login' ? 'Sign In' : 'Create Account'}
          </button>

          <p className="text-center text-sm text-gray-400 mt-6">
            {authMode === 'login' ? (
              <>Don't have an account? <button className="text-blue-400" onClick={() => { setAuthMode('signup'); setError('') }}>Sign Up</button></>
            ) : (
              <>Already have an account? <button className="text-blue-400" onClick={() => { setAuthMode('login'); setError('') }}>Sign In</button></>
            )}
          </p>
        </div>

        <style>{`
          .input-field {
            width: 100%;
            padding: 12px 16px;
            border-radius: 12px;
            background: ${theme === 'dark' ? 'rgba(30,41,59,0.8)' : '#f1f5f9'};
            border: 1px solid ${theme === 'dark' ? 'rgba(59,130,246,0.2)' : '#e2e8f0'};
            color: inherit;
            outline: none;
          }
          .input-field:focus {
            border-color: #3b82f6;
          }
        `}</style>
      </div>
    )
  }

  if (!user) return null

  const currency = user.currency
  const checkingDisplay = showBalance ? formatMoney(convertAmount(user.checkingBalance, currency), currency) : '••••••'
  const savingsDisplay = showBalance ? formatMoney(convertAmount(user.savingsBalance, currency), currency) : '••••••'
  const btcUsd = user.bitcoinBalance * BTC_USD
  const btcDisplay = showBalance ? formatBTC(user.bitcoinBalance) : '••••'
  const btcFiat = showBalance ? formatMoney(convertAmount(btcUsd, currency), currency) : '••••••'

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-navy-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      {/* Phone Frame Container */}
      <div className="max-w-md mx-auto min-h-screen relative shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 pt-12 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-sm">
              {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</button>
            </div>
            <div>
              <div className="text-xs text-gray-400">Good morning,</div>
              <div className="font-semibold">{user.name}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-white/10">
              {theme === 'dark' ? <IconSun size={20} /> : <IconMoon size={20} />}
            </button>
            <button onClick={() => setShowSupport(true)} className="p-2 rounded-full hover:bg-white/10 relative" title="Support">
              <IconBell size={20} />
            </button>
            <div className="text-[10px] px-2 py-1 rounded-full bg-green-500/20 text-green-400 flex items-center gap-1">
              <IconShieldCheck size={12} /> FDIC
            </div>
          </div>
        </div>

        {/* Balance Cards - Swipeable */}
        <div className="px-5 mb-6">
          <div className="relative overflow-hidden rounded-2xl">
            {/* Card 0 - Checking */}
            {cardIndex === 0 && (
              <div className={`p-6 rounded-2xl ${theme === 'dark' ? 'glass-card shadow-glow' : 'bg-white shadow-lg border'}`}>
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs tracking-wider text-blue-400 font-medium">CHECKING</span>
                  <button onClick={() => setShowBalance(!showBalance)}>
                    {showBalance ? <IconEye size={18} className="text-gray-400" /> : <IconEyeOff size={18} className="text-gray-400" />}
                  </button>
                </div>
                <div className="text-3xl font-bold mb-2">{checkingDisplay}</div>
                <div className="text-sm text-gray-400 mb-4">•••• {user.checkingLast4}</div>
                <div className="flex justify-between items-end">
                  <span className="text-xs text-gray-500">Swipe to Savings →</span>
                  <span className="text-blue-500 font-bold tracking-wider">VISA</span>
                </div>
              </div>
            )}

            {/* Card 1 - Savings */}
            {cardIndex === 1 && (
              <div className={`p-6 rounded-2xl ${theme === 'dark' ? 'glass-card shadow-glow' : 'bg-white shadow-lg border'}`}>
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs tracking-wider text-blue-400 font-medium">HIGH-YIELD SAVINGS</span>
                  <button onClick={() => setShowBalance(!showBalance)}>
                    {showBalance ? <IconEye size={18} className="text-gray-400" /> : <IconEyeOff size={18} className="text-gray-400" />}
                  </button>
                </div>
                <div className="text-3xl font-bold mb-2">{savingsDisplay}</div>
                <div className="text-sm text-gray-400 mb-4">•••• {user.savingsLast4}</div>
                <div className="flex justify-between items-end text-xs text-gray-500">
                  <span>← Swipe to Checking</span>
                  <span>Swipe to Bitcoin →</span>
                </div>
              </div>
            )}

            {/* Card 2 - Bitcoin */}
            {cardIndex === 2 && (
              <div className={`p-6 rounded-2xl ${theme === 'dark' ? 'glass-card shadow-glow-gold border-amber-500/20' : 'bg-white shadow-lg border'}`}>
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs tracking-wider text-amber-400 font-medium">BITCOIN</span>
                  <button onClick={() => setShowBalance(!showBalance)}>
                    {showBalance ? <IconEye size={18} className="text-gray-400" /> : <IconEyeOff size={18} className="text-gray-400" />}
                  </button>
                </div>
                <div className="text-3xl font-bold mb-1">{btcDisplay}</div>
                <div className="text-sm text-gray-400 mb-4">≈ {btcFiat}</div>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-black/20 text-xs mb-3">
                  <span className="truncate flex-1 font-mono">{user.bitcoinAddress}</span>
                  <button onClick={copyAddress} className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                    {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                  </button>
                </div>
                <div className="text-xs text-gray-500">← Swipe to Savings</div>
              </div>
            )}
          </div>

          {/* Card indicators + swipe buttons */}
          <div className="flex justify-center gap-2 mt-4">
            {[0, 1, 2].map(i => (
              <button
                key={i}
                onClick={() => setCardIndex(i)}
                className={`w-2 h-2 rounded-full transition ${cardIndex === i ? 'bg-blue-500 w-6' : 'bg-gray-600'}`}
              />
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="px-5 mb-6">
          <div className="grid grid-cols-4 gap-3">
            <button onClick={() => setShowAddMoney(true)} className="flex flex-col items-center gap-2">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-blue-600/20 text-blue-400 shadow-glow' : 'bg-blue-100 text-blue-600'}`}>
                <IconPlus size={22} />
              </div>
              <span className="text-xs">Add Money</span>
            </button>
            <button onClick={() => setShowTransfer(true)} className="flex flex-col items-center gap-2">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-blue-600/20 text-blue-400 shadow-glow' : 'bg-blue-100 text-blue-600'}`}>
                <IconArrowsExchange size={22} />
              </div>
              <span className="text-xs">Transfer</span>
            </button>
            <button onClick={() => setShowTransfer(true)} className="flex flex-col items-center gap-2">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-blue-600/20 text-blue-400 shadow-glow' : 'bg-blue-100 text-blue-600'}`}>
                <IconCreditCard size={22} />
              </div>
              <span className="text-xs">Pay Bills</span>
            </button>
            <button className="flex flex-col items-center gap-2">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-blue-600/20 text-blue-400 shadow-glow' : 'bg-blue-100 text-blue-600'}`}>
                <IconPlus size={22} />
              </div>
              <span className="text-xs">More</span>
            </button>
          </div>
        </div>

        {/* Transfer Modal */}
        {showTransfer && user && (
          <TransferModal
            user={user}
            onClose={() => setShowTransfer(false)}
            onComplete={(updated) => { setUser(updated); setShowTransfer(false) }}
          />
        )}

        {/* Add Money Sheet */}
        {showAddMoney && user && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70">
            <div className="glass-card rounded-t-2xl w-full max-w-md p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg">Add money</h3>
                <button onClick={() => { setShowAddMoney(false); setAddMoneyMsg('') }}><IconX size={20} /></button>
              </div>
              <p className="text-sm text-gray-400 mb-4">Choose how you'd like to add funds.</p>

              {addMoneyMsg ? (
                <div className="p-4 rounded-xl bg-blue-500/10 text-blue-300 text-sm mb-4">
                  {addMoneyMsg}
                </div>
              ) : (
                <div className="space-y-2">
                  {['Bank transfer', 'Debit card', 'Instant transfer'].map(opt => (
                    <button
                      key={opt}
                      onClick={() => setAddMoneyMsg(`Funding instructions have been sent to your email ${user.email}.`)}
                      className="w-full text-left p-4 rounded-xl bg-white/5 hover:bg-white/10"
                    >
                      {opt}
                    </button>
                  ))}
                  <div className="p-4 rounded-xl bg-white/5">
                    <div className="font-medium mb-1">Bitcoin</div>
                    <div className="text-xs text-gray-400 mb-2">Send BTC to your wallet address</div>
                    <div className="flex items-center gap-2 text-xs font-mono bg-black/30 p-2 rounded-lg">
                      <span className="truncate flex-1">{user.bitcoinAddress}</span>
                      <button onClick={copyAddress} className="text-amber-400">
                        {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="px-5 pb-24">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Recent Activity</h3>
            <span className="text-xs text-blue-400">View all</span>
          </div>
          <div className="space-y-3">
            {user.transactions.slice(0, 6).map(tx => (
              <div key={tx.id} className={`flex items-center gap-3 p-3 rounded-xl ${theme === 'dark' ? 'bg-white/5' : 'bg-white shadow-sm'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm ${tx.amount > 0 ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                  {tx.merchant[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{tx.merchant}</div>
                  <div className="text-xs text-gray-400">{tx.category} · {tx.status}</div>
                </div>
                <div className={`font-medium text-sm ${tx.amount > 0 ? 'text-green-400' : ''}`}>
                  {tx.amount > 0 ? '+' : ''}{formatMoney(convertAmount(Math.abs(tx.amount), currency), currency)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Nav */}
        <div className={`fixed bottom-0 left-0 right-0 max-w-md mx-auto border-t ${theme === 'dark' ? 'bg-navy-900/95 border-white/10' : 'bg-white border-gray-200'} backdrop-blur-lg`}>
          <div className="flex justify-around py-3">
            <button className="flex flex-col items-center gap-1 text-xs text-blue-400">
              <IconHome size={22} /> Home
            </button>
            <button onClick={() => setShowCards(true)} className="flex flex-col items-center gap-1 text-xs text-gray-400 hover:text-blue-400">
              <IconCreditCard size={22} /> Cards
            </button>
            <button onClick={() => setShowTransfer(true)} className="flex flex-col items-center gap-1 text-xs text-gray-400 hover:text-blue-400">
              <IconArrowsExchange size={22} /> Pay
            </button>
            <button onClick={() => setShowMore(true)} className="flex flex-col items-center gap-1 text-xs text-gray-400 hover:text-blue-400">
              <IconPlus size={22} /> More
            </button>
          </div>
        </div>

        {/* Cards Modal */}
        {showCards && user && (
          <CardsModal
            user={user}
            onClose={() => setShowCards(false)}
            onUpdate={setUser}
          />
        )}

        {/* Check Deposit Modal */}
        {showCheckDeposit && user && (
          <CheckDepositModal
            user={user}
            onClose={() => setShowCheckDeposit(false)}\n
        {/* Account Frozen Popup */}
        {user?.isFrozen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4">
            <div className="glass-card rounded-2xl p-6 w-full max-w-sm text-center">
              <div className="text-red-400 text-4xl mb-3">🔒</div>
              <h3 className="font-semibold text-lg mb-2">Account Restricted</h3>
              <p className="text-sm text-gray-400 mb-6">{user.freezeMessage || "Your account has been temporarily restricted. Please contact support."}</p>
              <button onClick={() => setShowSupport(true)} className="w-full py-3 rounded-xl bg-blue-600">Contact Support</button>
            </div>
          </div>
        )}

        {/* Support Chat */}
        {showSupport && user && (
          <SupportChat userId={user.id} userName={user.name} onClose={() => setShowSupport(false)} />
        )}

        {/* Beneficiary */}
        {showBeneficiary && user && (
          <BeneficiaryModal user={user} onClose={() => setShowBeneficiary(false)} onUpdate={setUser} />
        )}

        {/* Profile */}

        {showMore && user && (
          <MoreFeatures
            user={user}
            onClose={() => setShowMore(false)}
            onUpdate={setUser}
            onOpenSupport={() => setShowSupport(true)}
            onOpenBeneficiary={() => setShowBeneficiary(true)}
            onOpenCheckDeposit={() => setShowCheckDeposit(true)}
            onOpenProfile={() => setShowProfile(true)}
          />
        )}

        {showProfile && user && (
          <ProfileModal user={user} onClose={() => setShowProfile(false)} onUpdate={setUser} />
        )}

            onUpdate={setUser}
          />
        )}
      </div>
    </div>
  )
}
