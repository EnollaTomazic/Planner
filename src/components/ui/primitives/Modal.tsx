'use client'

import * as React from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { useDialogTrap } from '../hooks/useDialogTrap'

export interface ModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: React.ReactNode
  actions: React.ReactNode
}

export function Modal({ open, onOpenChange, title, description, children, actions }: ModalProps) {
  const contentRef = React.useRef<HTMLDivElement>(null)

  const handleClose = React.useCallback(() => {
    onOpenChange(false)
  }, [onOpenChange])

  useDialogTrap({ open, onClose: handleClose, ref: contentRef })

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur" />
        <Dialog.Content
          ref={contentRef}
          className="fixed top-1/2 left-1/2 w-full max-w-[24rem] -translate-x-1/2 -translate-y-1/2 rounded-[var(--radius-lg)] bg-card p-[var(--space-6)] shadow-neo"
        >
          <Dialog.Title className="text-title font-semibold">{title}</Dialog.Title>
          {description && (
            <Dialog.Description className="mt-[var(--space-1)] text-muted-foreground">
              {description}
            </Dialog.Description>
          )}
          <div className="mt-[var(--space-4)]">{children}</div>
          <div className="mt-[var(--space-6)] flex justify-end gap-[var(--space-2)]">{actions}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
