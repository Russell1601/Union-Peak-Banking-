import { useState, useEffect, useRef } from 'react'
import { IconX, IconSend, IconPhoto } from '@tabler/icons-react'
import { generateId } from '../lib/storage'

interface Message {
  id: string
  from: 'customer' | 'admin'
  text: string
  image?: string
  date: string
}

interface Props {
  userId: string
  userName: string
  onClose: () => void
  isAdmin?: boolean
}

const CHAT_KEY = 'union_peak_support_chats'

function getChats(): Record<string, Message[]> {
  try {
    return JSON.parse(localStorage.getItem(CHAT_KEY) || '{}')
  } catch {
    return {}
  }
}

function saveChat(userId: string, messages: Message[]) {
  const all = getChats()
  all[userId] = messages
  localStorage.setItem(CHAT_KEY, JSON.stringify(all))
  window.dispatchEvent(new CustomEvent('union_peak_db_changed'))
}

export default function SupportChat({ userId, userName, onClose, isAdmin = false }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMessages(getChats()[userId] || [])
    const handler = () => setMessages(getChats()[userId] || [])
    window.addEventListener('union_peak_db_changed', handler)
    return () => window.removeEventListener('union_peak_db_changed', handler)
  }, [userId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = (image?: string) => {
    if (!text.trim() && !image) return
    const msg: Message = {
      id: generateId('msg'),
      from: isAdmin ? 'admin' : 'customer',
      text: text.trim(),
      image,
      date: new Date().toISOString(),
    }
    const updated = [...messages, msg]
    setMessages(updated)
    saveChat(userId, updated)
    setText('')
  }

  const handleImage = (file: File | null) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => send(reader.result as string)
    reader.readAsDataURL(file)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 p-0 sm:p-4">
      <div className="glass-card rounded-t-2xl sm:rounded-2xl w-full max-w-md h-[80vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-white/10">
          <div>
            <h3 className="font-semibold">Support Chat</h3>
            <p className="text-xs text-gray-400">{isAdmin ? userName : 'Union Peak Support'}</p>
          </div>
          <button onClick={onClose}><IconX size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <p className="text-center text-gray-500 text-sm mt-10">No messages yet. Start the conversation.</p>
          )}
          {messages.map(m => (
            <div key={m.id} className={`flex ${m.from === (isAdmin ? 'admin' : 'customer') ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                m.from === (isAdmin ? 'admin' : 'customer')
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/10'
              }`}>
                {m.image && <img src={m.image} alt="" className="rounded-lg mb-2 max-h-40" />}
                {m.text && <p>{m.text}</p>}
                <p className="text-[10px] opacity-60 mt-1">{new Date(m.date).toLocaleTimeString()}</p>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <div className="p-3 border-t border-white/10 flex gap-2">
          <label className="p-2 rounded-lg bg-white/5 cursor-pointer">
            <IconPhoto size={20} />
            <input type="file" accept="image/*" className="hidden" onChange={e => handleImage(e.target.files?.[0] || null)} />
          </label>
          <input
            className="flex-1 px-4 py-2 rounded-xl bg-navy-800 border border-white/10 outline-none focus:border-blue-500 text-sm"
            placeholder="Type a message..."
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
          />
          <button onClick={() => send()} className="p-2 rounded-lg bg-blue-600">
            <IconSend size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}
