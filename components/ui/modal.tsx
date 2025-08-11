import * as React from 'react'
import { cn } from '@/lib/utils'

export interface ModalProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  className?: string
  title?: string
}

export function Modal({ open, onClose, children, className, title }: ModalProps) {
  if (!open) return null
  return (
    <div className='fixed inset-0 z-50'>
      <div className='absolute inset-0 bg-black/40' onClick={onClose} />
      <div className='relative mx-auto mt-20 w-full max-w-2xl rounded-2xl bg-white shadow-lg'>
        <div className='flex items-center justify-between p-4 border-b'>
          <h3 className='text-lg font-semibold'>{title}</h3>
          <button onClick={onClose} className='rounded-full p-2 hover:bg-slate-100'>
            <span aria-hidden>✕</span>
          </button>
        </div>
        <div className={cn('p-4', className)}>{children}</div>
      </div>
    </div>
  )
}
