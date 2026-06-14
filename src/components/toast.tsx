'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

type Toast = { id: number; message: string }

type ToastCtx = {
    show: (message: string) => void
}

const ToastContext = createContext<ToastCtx>({ show: () => {} })

export function useToast() {
    return useContext(ToastContext)
}

let nextId = 0

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([])

    const show = useCallback((message: string) => {
        const id = ++nextId
        setToasts((prev) => [...prev, { id, message }])
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id))
        }, 2200)
    }, [])

    return (
        <ToastContext.Provider value={{ show }}>
            {children}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2 pointer-events-none">
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        className="pointer-events-auto bg-foreground text-background text-sm px-5 py-2.5 rounded-full shadow-lg whitespace-nowrap"
                    >
                        {t.message}
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    )
}
