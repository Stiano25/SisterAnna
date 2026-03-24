import { useState, useEffect } from 'react'

const phrases = [
  "What do you want to know about Sister Anna Ali today?",
  "Her visions. Her life. Her miracles.",
  "She wept tears of blood every Thursday for 25 years.",
  "She was born Hadija. She became a saint in waiting.",
  "Burnt Forest has known peace since the day she died."
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