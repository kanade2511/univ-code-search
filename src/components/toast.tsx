'use client'

import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react'

type ToastData = { id: number; message: string; leaving: boolean }
type ToastCtx = { show: (message: string) => void }

const ToastContext = createContext<ToastCtx>({ show: () => {} })

export function useToast() {
    return useContext(ToastContext)
}

let nextId = 0

function ToastItem({ toast, onDone }: { toast: ToastData; onDone: (id: number) => void }) {
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const timer = setTimeout(() => {
            onDone(toast.id)
        }, 2200)
        return () => clearTimeout(timer)
    }, [])

    return (
        <div
            ref={ref}
            className={`pointer-events-auto bg-foreground text-background text-sm px-5 py-2.5 rounded-full shadow-lg whitespace-nowrap ${
                toast.leaving ? 'animate-toast-out' : 'animate-toast-in'
            }`}
        >
            {toast.message}
        </div>
    )
}

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastData[]>([])

    const show = useCallback((message: string) => {
        const id = ++nextId
        setToasts((prev) => [...prev, { id, message, leaving: false }])
    }, [])

    const startLeave = useCallback((id: number) => {
        setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)))
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id))
        }, 250)
    }, [])

    return (
        <ToastContext.Provider value={{ show }}>
            {children}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2 pointer-events-none">
                {toasts.map((t) => (
                    <ToastItem key={t.id} toast={t} onDone={startLeave} />
                ))}
            </div>
        </ToastContext.Provider>
    )
}
