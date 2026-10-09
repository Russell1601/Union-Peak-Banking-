import { IconLoader2 } from '@tabler/icons-react'

interface Props {
  message?: string
  seconds?: number
}

export default function LoadingOverlay({ message = 'Processing...', seconds }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="glass-card rounded-2xl p-8 text-center max-w-xs mx-4">
        <IconLoader2 className="animate-spin mx-auto text-blue-500 mb-4" size={40} />
        <p className="font-medium">{message}</p>
        {seconds && <p className="text-sm text-gray-400 mt-2">This may take up to {seconds} seconds</p>}
      </div>
    </div>
  )
}
