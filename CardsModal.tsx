import { useState } from 'react'
import { IconX, IconSnowflake, IconSnowflakeOff, IconPlus, IconCreditCard } from '@tabler/icons-react'
import { UserAccount, BankCard } from '../lib/types'
import { updateUser, generateId } from '../lib/storage'

interface Props {
  user: UserAccount
  onClose: () => void
  onUpdate: (u: UserAccount) => void
}

export default function CardsModal({ user, onClose, onUpdate }: Props) {
  const [requesting, setRequesting] = useState(false)

  const toggleFreeze = (cardId: string) => {
    const cards = user.cards.map(c =>
      c.id === cardId ? { ...c, status: c.status === 'active' ? 'frozen' as const : 'active' as const } : c
    )
    const updated = { ...user, cards }
    updateUser(user.id, updated)
    onUpdate(updated)
  }

  const requestNewCard = () => {
    setRequesting(true)
    setTimeout(() => {
      const newCard: BankCard = {
        id: generateId('card'),
        type: 'debit',
        last4: String(Math.floor(1000 + Math.random() * 9000)),
        expiry: '12/29',
        status: 'active',
        spendingLimit: 3000,
        pin: '0000',
      }
      // In real flow this would be "Submitted" until admin approves
      const updated = { ...user, cards: [...user.cards, newCard] }
      updateUser(user.id, updated)
      onUpdate(updated)
      setRequesting(false)
      alert('Card request submitted. Status: Submitted')
    }, 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 p-0 sm:p-4">
      <div className="glass-card rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b border-white/10">
          <h3 className="font-semibold">Cards</h3>
          <button onClick={onClose}><IconX size={20} /></button>
        </div>

        <div className="p-4 space-y-3">
          {user.cards.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <IconCreditCard size={40} className="mx-auto mb-3 opacity-50" />
              <p>No cards yet</p>
            </div>
          ) : (
            user.cards.map(card => (
              <div key={card.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="text-xs text-gray-400 uppercase">{card.type} Card</div>
                    <div className="font-mono text-lg tracking-wider">•••• •••• •••• {card.last4}</div>
                    <div className="text-xs text-gray-400 mt-1">Expires {card.expiry}</div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded ${card.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {card.status === 'active' ? 'Active' : 'Frozen'}
                  </span>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => toggleFreeze(card.id)}
                    className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-white/5 text-sm"
                  >
                    {card.status === 'active' ? <><IconSnowflake size={16} /> Freeze</> : <><IconSnowflakeOff size={16} /> Unfreeze</>}
                  </button>
                </div>
              </div>
            ))
          )}

          <button
            onClick={requestNewCard}
            disabled={requesting}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <IconPlus size={18} />
            {requesting ? 'Submitting...' : 'Request New Card'}
          </button>
        </div>
      </div>
    </div>
  )
}
