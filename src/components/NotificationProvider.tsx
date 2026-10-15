import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

type NotificationType = 'success' | 'failure' | 'system'
type Notify = (type: NotificationType, message: string) => void
interface NotificationItem {
  id: number
  type: NotificationType
  message: string
}

const NotificationContext = createContext<Notify>(() => {})
const notificationTypes: Record<NotificationType, { label: string; icon: string }> = {
  success: { label: 'สำเร็จ', icon: '✓' },
  failure: { label: 'ไม่สำเร็จ', icon: '!' },
  system: { label: 'แจ้งเตือนระบบ', icon: 'i' },
}

export function useNotification(): Notify {
  return useContext(NotificationContext)
}

export default function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const timers = useRef(new Map<number, number>())
  const nextId = useRef(0)

  const dismiss = useCallback((id: number) => {
    window.clearTimeout(timers.current.get(id))
    timers.current.delete(id)
    setNotifications(current => current.filter(notification => notification.id !== id))
  }, [])

  const notify = useCallback<Notify>((type, message) => {
    const safeType = type in notificationTypes ? type : 'system'
    const id = ++nextId.current
    setNotifications(current => [...current.slice(-2), { id, type: safeType, message }])
    timers.current.set(id, window.setTimeout(() => dismiss(id), 5000))
  }, [dismiss])

  useEffect(() => () => {
    timers.current.forEach(timer => window.clearTimeout(timer))
    timers.current.clear()
  }, [])

  return <NotificationContext.Provider value={notify}>
    {children}
    <div className="notification-stack" aria-live="polite" aria-relevant="additions">
      {notifications.map(notification => <article className={`notification-toast notification-toast-${notification.type}`} key={notification.id} role={notification.type === 'failure' ? 'alert' : 'status'}>
        <span className="notification-toast-icon" aria-hidden="true">{notificationTypes[notification.type].icon}</span>
        <div className="notification-toast-copy"><strong>{notificationTypes[notification.type].label}</strong><p>{notification.message}</p></div>
        <button type="button" className="notification-toast-close" aria-label="ปิดการแจ้งเตือน" onClick={() => dismiss(notification.id)}>×</button>
        <span className="notification-toast-progress" aria-hidden="true" />
      </article>)}
    </div>
  </NotificationContext.Provider>
}
