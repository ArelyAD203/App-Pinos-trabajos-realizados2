import React, { useEffect, useRef } from 'react';
interface Props { isOpen: boolean; onClose: () => void; onConfirm: () => void; title: string; message: string; busy?: boolean }
export default function ConfirmationModal({ isOpen, onClose, onConfirm, title, message, busy }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { if (isOpen && !ref.current?.open) ref.current?.showModal(); else if (!isOpen) ref.current?.close(); }, [isOpen]);
  return <dialog ref={ref} aria-labelledby="confirm-title" onCancel={event => { event.preventDefault(); if (!busy) onClose(); }} className="m-auto w-full max-w-md p-6 rounded-2xl shadow-xl bg-white dark:bg-slate-800 dark:text-white backdrop:bg-black/50">
    <h2 id="confirm-title" className="text-xl font-bold mb-4">{title}</h2><p className="mb-6">{message}</p>
    <div className="flex justify-end gap-3"><button type="button" autoFocus disabled={busy} onClick={onClose} className="p-3 rounded-lg bg-slate-100 dark:bg-slate-700 disabled:opacity-50">Cancelar</button><button type="button" disabled={busy} onClick={onConfirm} className="p-3 rounded-lg bg-red-600 text-white disabled:opacity-50">{busy ? 'Eliminando…' : 'Sí, eliminar'}</button></div>
  </dialog>;
}
