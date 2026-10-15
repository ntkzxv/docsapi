import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { Dispatch, ReactNode, SetStateAction } from 'react'
import { translate } from './translate'
import type { Language } from './translate'

const LANGUAGE_KEY = 'docsapi-language'

interface LanguageContextValue {
  language: Language
  setLanguage: Dispatch<SetStateAction<Language>>
  t: (text: string) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => localStorage.getItem(LANGUAGE_KEY) === 'th' ? 'th' : 'en')
  useEffect(() => { document.documentElement.lang = language }, [language])
  const value = useMemo<LanguageContextValue>(() => ({
    language,
    setLanguage: next => {
      setLanguage(current => {
        const resolved = typeof next === 'function' ? next(current) : next
        localStorage.setItem(LANGUAGE_KEY, resolved)
        document.documentElement.lang = resolved
        return resolved
      })
    },
    t: text => translate(text, language),
  }), [language])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) throw new Error('useLanguage must be used inside LanguageProvider')
  return context
}
