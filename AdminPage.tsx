import { useState, useEffect } from 'react'
import {
  IconShield, IconUsers, IconLogout, IconSearch, IconEdit,
  IconCurrencyBitcoin, IconLock, IconCreditCard, IconCamera,
  IconKey, IconUserPlus, IconSettings
} from '@tabler/icons-react'
import {
  getUsers, updateUser, getAdminSession, setAdminSession,
  SUPER_ADMIN, getSubAdmins, saveSubAdmins, generateId,
  formatMoney, formatBTC, generateSixDigitCode, addSimulatedEmail
} from '../lib/storage'
import { UserAccount, SubAdmin, CheckDeposit, Beneficiary } from '../lib/types'

type AdminTab = 'users' | 'userdetail' | 'subadmins'

export default function AdminPage() {
  const [session, setSession] = useState(getAdminSession())
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [users, setUsers] = useState<UserAccount[]>([])
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<UserAccount | null>(null)
  const [tab, setTab] = useState<AdminTab>('users')
  const [subAdmins, setSubAdminsState] = useState<SubAdmin[]>([])
  const [newSubUser, setNewSubUser] = useState('')
  const [newSubPass, setNewSubPass] = useState('')
  const [newSubAssign, setNewSubAssign] = useState('')
  const [sixDigitCodes, setSixDigitCodes] = useState<Record<string, string>>({})

  useEffect(() => {
    refresh()
    const handler = () => refresh()
    window.addEventListener('union_peak_db_changed', handler)
    return () => window.removeEventListener('union_peak_db_changed', handler)
  }, [])

  const refresh = () => {
    setUsers(getUsers())
    setSubAdminsState(getSubAdmins())
  }

  const handleLogin = () => {
    if (username === SUPER_ADMIN.username && password === SUPER_ADMIN.password) {
      const s = { type: 'super' as const, username }
      setAdminSession(s)
      setSession(s)
      setError('')
    } else {
      const subs = getSubAdmins()
      const sub = subs.find(s => s.username === username && s.password === password && s.active)
      if (sub) {
        const s = { type: 'sub' as const, username, assignedUserId: sub.assignedUserId }
        setAdminSession(s)
        setSession(s)
        setError('')
      } else {
        setError('Invalid credentials')
      }
    }
  }

  const logout = () => {
    setAdminSession(null)
    setSession(null)
  }

  const saveUser = (patch: Partial<UserAccount>) => {
    if (!selected) return
    updateUser(selected.id, patch)
    const updated = { ...selected, ...patch }
    setSelected(updated)
    refresh()
  }

  const generateCodeForUser = (userId: string, email: string) => {
    const code = generateSixDigitCode()
    setSixDigitCodes(prev => ({ ...prev, [userId]: code }))
    addSimulatedEmail({
      to: email,
      subject: 'Your Union Peak Bank Security Code',
      body: \`Your 6-digit security code is: \${code}\`,
      code,
    })
    alert(\`6-digit code generated for \${email}: \${code}\`)
  }

  const approveCheck = (deposit: CheckDeposit) => {
    if (!selected) return
    const deposits = selected.checkDeposits.map(d =>
      d.id === deposit.id ? { ...d, status: 'Completed' as const } : d
    )
    const newBalance = selected.checkingBalance + deposit.amount
    saveUser({ checkDeposits: deposits, checkingBalance: newBalance })
  }

  const rejectCheck = (deposit: CheckDeposit) => {
    if (!selected) return
    const deposits = selected.checkDeposits.map(d =>
      d.id === deposit.id ? { ...d, status: 'Rejected' as const } : d
    )
    saveUser({ checkDeposits: deposits })
  }

  const approveBeneficiary = (b: Beneficiary) => {
    if (!selected) return
    const list = selected.beneficiaries.map(x =>
      x.id === b.id ? { ...x, status: 'Completed' as const } : x
    )
    saveUser({ beneficiaries: list })
  }

  const createSubAdmin = () => {
    if (!newSubUser || !newSubPass || !newSubAssign) {
      alert('Fill all fields')
      return
    }
    const sub: SubAdmin = {
      id: generateId('sub'),
      username: newSubUser,
      password: newSubPass,
      assignedUserId: newSubAssign,
      active: true,
    }
    const list = [...getSubAdmins(), sub]
    saveSubAdmins(list)
    setSubAdminsState(list)
    setNewSubUser('')
    setNewSubPass('')
    setNewSubAssign('')
    alert('Sub-admin created')
  }

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  const visibleUsers = session?.type === 'sub'
    ? users.filter(u => u.id === session.assignedUserId)
    : filteredUsers

  if (!session) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center p-4">
        <div className="w-full max-w-sm glass-card rounded-2xl p-8">
          <div className="text-center mb-8">
            <IconShield size={40} className="mx-auto text-blue-500 mb-3" />
            <h1 className="text-xl font-bold">Union Peak Bank</h1>
            <p className="text-sm text-gray-400">Admin Portal</p>
          </div>
          {error && <div className="mb-4 p-3 rounded-lg bg-red-500/20 text-red-400 text-sm">{error}</div>}
          <input className="w-full mb-3 px-4 py-3 rounded-xl bg-navy-800 border border-white/10 outline-none focus:border-blue-500" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
          <input className="w-full mb-6 px-4 py-3 rounded-xl bg-navy-800 border border-white/10 outline-none focus:border-blue-500" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
          <button onClick={handleLogin} className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 font-medium">Sign In</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-navy-900 text-white flex">
      <aside className="w-60 min-h-screen bg-navy-800 border-r border-white/10 p-4 flex flex-col">
        <div className="font-bold text-lg mb-8 flex items-center gap-2">
          <IconShield className="text-blue-500" /> Admin
        </div>
        <nav className="space-y-1 flex-1">
          <button onClick={() => { setTab('users'); setSelected(null) }} className={\`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm \${tab === 'users' || tab === 'userdetail' ? 'bg-blue-600/20 text-blue-400' : 'hover:bg-white/5'}\`}>
            <IconUsers size={18} /> Users
          </button>
          {session.type === 'super' && (
            <button onClick={() => setTab('subadmins')} className={\`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm \${tab === 'subadmins' ? 'bg-blue-600/20 text-blue-400' : 'hover:bg-white/5'}\`}>
              <IconUserPlus size={18} /> Sub-Admins
            </button>
          )}
        </nav>
        <div className="text-xs text-gray-500 mb-2">
          {session.username} {session.type === 'super' && <span className="text-blue-400">(Super)</span>}
        </div>
        <button onClick={logout} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white">
          <IconLogout size={18} /> Logout
        </button>
      </aside>

      <main className="flex-1 p-6 overflow-y-auto">
        {tab === 'users' && (
          <>
            <h1 className="text-2xl font-bold mb-4">Users</h1>
            <div className="mb-4 relative max-w-md">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy-800 border border-white/10 outline-none focus:border-blue-500" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="overflow-x-auto rounded-xl border border-white/10">
              <table className="w-full text-sm">
                <thead className="bg-navy-800 text-gray-400">
                  <tr>
                    <th className="text-left p-3">Name</th>
                    <th className="text-left p-3">Email</th>
                    <th className="text-right p-3">Checking</th>
                    <th className="text-right p-3">Savings</th>
                    <th className="text-right p-3">BTC</th>
                    <th className="text-center p-3">Status</th>
                    <th className="text-center p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleUsers.map(u => (
                    <tr key={u.id} className="border-t border-white/5 hover:bg-white/5">
                      <td className="p-3 font-medium">{u.name}</td>
                      <td className="p-3 text-gray-400">{u.email}</td>
                      <td className="p-3 text-right">{formatMoney(u.checkingBalance)}</td>
                      <td className="p-3 text-right">{formatMoney(u.savingsBalance)}</td>
                      <td className="p-3 text-right">{formatBTC(u.bitcoinBalance)}</td>
                      <td className="p-3 text-center">
                        <span className={\`px-2 py-0.5 rounded text-xs \${u.isFrozen ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}\`}>
                          {u.isFrozen ? 'Frozen' : 'Active'}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button onClick={() => { setSelected(u); setTab('userdetail') }} className="p-1.5 rounded hover:bg-white/10">
                          <IconEdit size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {tab === 'userdetail' && selected && (
          <div className="max-w-3xl space-y-6">
            <div className="flex items-center gap-3">
              <button onClick={() => setTab('users')} className="text-sm text-gray-400 hover:text-white">← Back</button>
              <h1 className="text-2xl font-bold">{selected.name}</h1>
              <span className="text-sm text-gray-400">{selected.email}</span>
            </div>

            <div className="glass-card rounded-xl p-5 space-y-4">
              <h2 className="font-semibold flex items-center gap-2"><IconCurrencyBitcoin size={18} /> Balances & Bitcoin Address</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-gray-400">Checking (USD)</label>
                  <input type="number" className="w-full mt-1 px-3 py-2 rounded-lg bg-navy-800 border border-white/10" value={selected.checkingBalance}
                    onChange={e => setSelected({ ...selected, checkingBalance: parseFloat(e.target.value) || 0 })} />
                </div>
                <div>
                  <label className="text-xs text-gray-400">Savings (USD)</label>
                  <input type="number" className="w-full mt-1 px-3 py-2 rounded-lg bg-navy-800 border border-white/10" value={selected.savingsBalance}
                    onChange={e => setSelected({ ...selected, savingsBalance: parseFloat(e.target.value) || 0 })} />
                </div>
                <div>
                  <label className="text-xs text-gray-400">Bitcoin (BTC)</label>
                  <input type="number" step="0.0001" className="w-full mt-1 px-3 py-2 rounded-lg bg-navy-800 border border-white/10" value={selected.bitcoinBalance}
                    onChange={e => setSelected({ ...selected, bitcoinBalance: parseFloat(e.target.value) || 0 })} />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400">Bitcoin Deposit Address</label>
                <input className="w-full mt-1 px-3 py-2 rounded-lg bg-navy-800 border border-white/10 font-mono text-sm" value={selected.bitcoinAddress}
                  onChange={e => setSelected({ ...selected, bitcoinAddress: e.target.value })} />
              </div>
              <button onClick={() => saveUser({
                checkingBalance: selected.checkingBalance,
                savingsBalance: selected.savingsBalance,
                bitcoinBalance: selected.bitcoinBalance,
                bitcoinAddress: selected.bitcoinAddress,
              })} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm">Save Balances</button>
            </div>

            <div className="glass-card rounded-xl p-5">
              <h2 className="font-semibold flex items-center gap-2 mb-3"><IconKey size={18} /> Security Code</h2>
              <p className="text-sm text-gray-400 mb-3">Generate a 6-digit code for the customer to use during transfers.</p>
              <div className="flex items-center gap-3">
                <button onClick={() => generateCodeForUser(selected.id, selected.email)} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm">
                  Generate 6-digit Code
                </button>
                {sixDigitCodes[selected.id] && (
                  <span className="font-mono text-lg text-green-400">{sixDigitCodes[selected.id]}</span>
                )}
              </div>
            </div>

            <div className="glass-card rounded-xl p-5">
              <h2 className="font-semibold flex items-center gap-2 mb-3"><IconLock size={18} /> Account Status</h2>
              <div className="flex items-center gap-3 mb-3">
                <span className={\`px-3 py-1 rounded text-sm \${selected.isFrozen ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}\`}>
                  {selected.isFrozen ? 'Frozen' : 'Active'}
                </span>
                <button
                  onClick={() => saveUser({ isFrozen: !selected.isFrozen, freezeMessage: selected.isFrozen ? undefined : 'Your account has been temporarily restricted. Please contact support.' })}
                  className="px-4 py-2 rounded-lg bg-white/10 text-sm"
                >
                  {selected.isFrozen ? 'Unfreeze Account' : 'Freeze Account'}
                </button>
              </div>
            </div>

            <div className="glass-card rounded-xl p-5">
              <h2 className="font-semibold flex items-center gap-2 mb-3"><IconSettings size={18} /> Feature Controls</h2>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(selected.features).map(([key, val]) => (
                  <label key={key} className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 cursor-pointer">
                    <input type="checkbox" checked={val}
                      onChange={e => {
                        const features = { ...selected.features, [key]: e.target.checked }
                        setSelected({ ...selected, features })
                        saveUser({ features })
                      }} />
                    <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                  </label>
                ))}
                <label className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 cursor-pointer">
                  <input type="checkbox" checked={selected.allowBeneficiaryRequest}
                    onChange={e => {
                      setSelected({ ...selected, allowBeneficiaryRequest: e.target.checked })
                      saveUser({ allowBeneficiaryRequest: e.target.checked })
                    }} />
                  Allow Beneficiary Request
                </label>
              </div>
            </div>

            <div className="glass-card rounded-xl p-5">
              <h2 className="font-semibold flex items-center gap-2 mb-3"><IconCamera size={18} /> Check Deposits</h2>
              {selected.checkDeposits.length === 0 ? (
                <p className="text-sm text-gray-400">No check deposits</p>
              ) : (
                <div className="space-y-3">
                  {selected.checkDeposits.map(d => (
                    <div key={d.id} className="p-3 rounded-lg bg-white/5 flex justify-between items-center">
                      <div>
                        <div className="font-medium">{formatMoney(d.amount)}</div>
                        <div className="text-xs text-gray-400">{d.status} · {new Date(d.date).toLocaleDateString()}</div>
                      </div>
                      {(d.status === 'Submitted' || d.status === 'Pending') && (
                        <div className="flex gap-2">
                          <button onClick={() => approveCheck(d)} className="px-3 py-1 rounded bg-green-600/20 text-green-400 text-xs">Approve</button>
                          <button onClick={() => rejectCheck(d)} className="px-3 py-1 rounded bg-red-600/20 text-red-400 text-xs">Reject</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="glass-card rounded-xl p-5">
              <h2 className="font-semibold mb-3">Beneficiaries</h2>
              {selected.beneficiaries.length === 0 ? (
                <p className="text-sm text-gray-400">No beneficiaries</p>
              ) : (
                <div className="space-y-2">
                  {selected.beneficiaries.map(b => (
                    <div key={b.id} className="p-3 rounded-lg bg-white/5 flex justify-between items-center">
                      <div>
                        <div className="font-medium">{b.fullName}</div>
                        <div className="text-xs text-gray-400">{b.email} · {b.status}</div>
                      </div>
                      {(b.status === 'Submitted' || b.status === 'Pending') && (
                        <button onClick={() => approveBeneficiary(b)} className="px-3 py-1 rounded bg-green-600/20 text-green-400 text-xs">Approve</button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="glass-card rounded-xl p-5">
              <h2 className="font-semibold flex items-center gap-2 mb-3"><IconCreditCard size={18} /> Cards</h2>
              {selected.cards.map(c => (
                <div key={c.id} className="p-3 rounded-lg bg-white/5 mb-2 flex justify-between">
                  <div>
                    <div className="font-mono">•••• {c.last4}</div>
                    <div className="text-xs text-gray-400">{c.type} · {c.status}</div>
                  </div>
                  <button
                    onClick={() => {
                      const cards = selected.cards.map(card =>
                        card.id === c.id ? { ...card, status: card.status === 'active' ? 'frozen' as const : 'active' as const } : card
                      )
                      saveUser({ cards })
                    }}
                    className="text-xs px-3 py-1 rounded bg-white/10"
                  >
                    {c.status === 'active' ? 'Freeze' : 'Unfreeze'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'subadmins' && session.type === 'super' && (
          <div className="max-w-2xl space-y-6">
            <h1 className="text-2xl font-bold">Sub-Admins</h1>
            <div className="glass-card rounded-xl p-5 space-y-3">
              <h2 className="font-semibold">Create New Sub-Admin</h2>
              <input className="w-full px-3 py-2 rounded-lg bg-navy-800 border border-white/10" placeholder="Username" value={newSubUser} onChange={e => setNewSubUser(e.target.value)} />
              <input className="w-full px-3 py-2 rounded-lg bg-navy-800 border border-white/10" type="password" placeholder="Password" value={newSubPass} onChange={e => setNewSubPass(e.target.value)} />
              <select className="w-full px-3 py-2 rounded-lg bg-navy-800 border border-white/10" value={newSubAssign} onChange={e => setNewSubAssign(e.target.value)}>
                <option value="">Assign to customer...</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
              </select>
              <button onClick={createSubAdmin} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm">Create Sub-Admin</button>
            </div>
            <div className="space-y-2">
              {subAdmins.map(s => (
                <div key={s.id} className="p-4 rounded-xl bg-white/5 flex justify-between items-center">
                  <div>
                    <div className="font-medium">{s.username}</div>
                    <div className="text-xs text-gray-400">
                      Assigned: {users.find(u => u.id === s.assignedUserId)?.name || s.assignedUserId} · {s.active ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const list = subAdmins.map(x => x.id === s.id ? { ...x, active: !x.active } : x)
                      saveSubAdmins(list)
                      setSubAdminsState(list)
                    }}
                    className="text-xs px-3 py-1 rounded bg-white/10"
                  >
                    {s.active ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
