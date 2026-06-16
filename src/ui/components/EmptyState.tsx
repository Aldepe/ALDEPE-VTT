import type { ReactNode } from 'react'
import { LineIcon } from './LineIcon'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  message: string
}

export function EmptyState({ icon, message, title }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-icon" aria-hidden="true">
        {icon ?? <LineIcon className="empty-rune" label="" name="spark" />}
      </div>
      <h2>{title}</h2>
      <p>{message}</p>
    </div>
  )
}
