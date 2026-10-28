/**
 * ScrambleHover Component
 * 
 * Original Author: Daniel Petho <https://www.danielpetho.com>
 * Source: Fancy Components (https://fancycomponents.dev)
 * License: MIT
 * 
 * Adapted for Mohammed Atif Portfolio with:
 * - Native framer-motion v14 integration
 * - Technical editorial glyph set defaults (0123456789ABCDEF!<>-_/[]{}*+=~)
 * - prefers-reduced-motion bypass
 * - Accessible sr-only text + aria-hidden character spans
 * - Keyboard focus & touch compatibility
 */

import { useEffect, useState, useRef, useCallback } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'

export interface ScrambleHoverProps extends Omit<HTMLMotionProps<'span'>, 'children'> {
  text: string
  scrambleSpeed?: number
  maxIterations?: number
  sequential?: boolean
  revealDirection?: 'start' | 'end' | 'center'
  useOriginalCharsOnly?: boolean
  characters?: string
  className?: string
  scrambledClassName?: string
}

export function ScrambleHover({
  text,
  scrambleSpeed = 45,
  maxIterations = 8,
  useOriginalCharsOnly = false,
  characters = '0123456789ABCDEF!<>-_/[]{}*+=~',
  className = '',
  scrambledClassName = 'text-zinc-500 font-mono-code',
  sequential = false,
  revealDirection = 'start',
  ...props
}: ScrambleHoverProps) {
  const [displayText, setDisplayText] = useState(text)
  const [isHovering, setIsHovering] = useState(false)
  const [isScrambling, setIsScrambling] = useState(false)
  const [activeRevealed, setActiveRevealed] = useState<number[]>([])

  const revealedIndicesRef = useRef<Set<number>>(new Set())
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const isReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const handleHoverStart = useCallback(() => {
    if (isReducedMotion) return
    setIsHovering(true)
    setIsScrambling(true)
  }, [isReducedMotion])

  const handleHoverEnd = useCallback(() => {
    setIsHovering(false)
    clearTimer()
    setDisplayText(text)
    setIsScrambling(false)
    revealedIndicesRef.current.clear()
    setActiveRevealed([])
  }, [clearTimer, text])

  useEffect(() => {
    if (!isHovering || isReducedMotion) {
      return
    }

    let currentIteration = 0
    clearTimer()

    const availableChars = useOriginalCharsOnly
      ? Array.from(new Set(text.split(''))).filter((char) => char !== ' ')
      : characters.split('')

    const getNextIndex = (revealed: Set<number>) => {
      const textLength = text.length
      switch (revealDirection) {
        case 'start':
          return revealed.size
        case 'end':
          return textLength - 1 - revealed.size
        case 'center': {
          const middle = Math.floor(textLength / 2)
          const offset = Math.floor(revealed.size / 2)
          const nextIndex =
            revealed.size % 2 === 0 ? middle + offset : middle - offset - 1

          if (nextIndex >= 0 && nextIndex < textLength && !revealed.has(nextIndex)) {
            return nextIndex
          }

          for (let i = 0; i < textLength; i++) {
            if (!revealed.has(i)) return i
          }
          return 0
        }
        default:
          return revealed.size
      }
    }

    const shuffleText = (source: string, revealed: Set<number>) => {
      return source
        .split('')
        .map((char, i) => {
          if (char === ' ') return ' '
          if (revealed.has(i)) return source[i]
          return availableChars[Math.floor(Math.random() * availableChars.length)]
        })
        .join('')
    }

    intervalRef.current = setInterval(() => {
      const revealed = revealedIndicesRef.current

      if (sequential) {
        if (revealed.size < text.length) {
          const nextIndex = getNextIndex(revealed)
          revealed.add(nextIndex)
          setActiveRevealed(Array.from(revealed))
          setDisplayText(shuffleText(text, revealed))
        } else {
          clearTimer()
          setIsScrambling(false)
          setDisplayText(text)
        }
      } else {
        setDisplayText(shuffleText(text, revealed))
        currentIteration++
        if (currentIteration >= maxIterations) {
          clearTimer()
          setIsScrambling(false)
          setDisplayText(text)
        }
      }
    }, scrambleSpeed)

    return () => {
      clearTimer()
    }
  }, [
    isHovering,
    text,
    characters,
    scrambleSpeed,
    useOriginalCharsOnly,
    sequential,
    revealDirection,
    maxIterations,
    isReducedMotion,
    clearTimer,
  ])

  const revealedSet = new Set(activeRevealed)

  return (
    <motion.span
      onHoverStart={handleHoverStart}
      onHoverEnd={handleHoverEnd}
      onFocus={handleHoverStart}
      onBlur={handleHoverEnd}
      className={`inline-block select-none cursor-default ${className}`}
      {...props}
    >
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {displayText.split('').map((char, index) => {
          const isScrambled = isScrambling && isHovering && !revealedSet.has(index)
          return (
            <span
              key={index}
              className={isScrambled ? scrambledClassName : undefined}
            >
              {char}
            </span>
          )
        })}
      </span>
    </motion.span>
  )
}

export default ScrambleHover
