'use client'

interface Props {
  message: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({ message, onConfirm, onCancel }: Props) {
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]"
      onClick={onCancel}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        className="bg-bg border border-border-prominent rounded-[8px] p-6 max-w-sm w-full mx-4"
        onClick={e => e.stopPropagation()}
      >
        <p className="text-text-primary mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="bg-transparent text-text-primary border border-border-base rounded-[6px] px-4 py-2 text-[14px] hover:border-border-prominent transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="bg-bg-deep text-[hsl(348,75%,58%)] border border-[hsl(348,75%,58%)] rounded-pill px-8 py-2 text-[14px] font-medium hover:opacity-80 transition-opacity"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}