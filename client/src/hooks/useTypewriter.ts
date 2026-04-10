import { useState, useEffect } from 'react'

const phrases = [
  "Untold stories by her Parents and siblings"
]

export const useTypewriter = () => {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0)
  const [currentText, setCurrentText] = useState('')
  const [isTyping, setIsTyping] = useState(true)

  useEffect(() => {
    const currentPhrase = phrases[currentPhraseIndex]
    
    if (isTyping) {
      if (currentText.length < currentPhrase.length) {
        const timeout = setTimeout(() => {
          setCurrentText(currentPhrase.slice(0, currentText.length + 1))
        }, 50)
        return () => clearTimeout(timeout)
      } else {
        const timeout = setTimeout(() => {
          setIsTyping(false)
        }, 2000)
        return () => clearTimeout(timeout)
      }
    } else {
      if (currentText.length > 0) {
        const timeout = setTimeout(() => {
          setCurrentText(currentText.slice(0, -1))
        }, 30)
        return () => clearTimeout(timeout)
      } else {
        setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length)
        setIsTyping(true)
      }
    }
  }, [currentText, isTyping, currentPhraseIndex])

  return currentText
}