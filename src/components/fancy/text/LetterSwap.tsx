/**
 * LetterSwap Component
 * 
 * Original Author: Daniel Petho <https://www.danielpetho.com>
 * Source: Fancy Components (https://fancycomponents.dev)
 * License: MIT
 * 
 * Adapted for Mohammed Atif Portfolio with:
 * - Native framer-motion v14 integration
 * - Zero-dependency internal debounce
 * - prefers-reduced-motion detection
 * - Accessible sr-only text + aria-hidden character spans
 * - Keyboard focus & touch compatibility
 */

import { useState, useCallback, useMemo, useEffect } from 'react'
import { motion, stagger, useAnimate, type AnimationOptions } from 'framer-motion'
import { debounce } from '../utils/debounce'

export interface LetterSwapProps extends React.HTMLAttributes<HTMLSpanElement> {
  label: string
  reverse?: boolean
  mode?: 'pingpong' | 'forward'
  transition?: AnimationOptions
  staggerDuration?: number
  staggerFrom?: 'first' | 'last' | 'center' | number
  className?: string
  onClick?: () => void
}

export function LetterSwap({
  label,
  reverse = true,
  mode = 'pingpong',
  transition = {
    type: 'spring',
    stiffness: 280,
    damping: 24,
    duration: 0.6,
  },
  staggerDuration = 0.025,
  staggerFrom = 'first',
  className = '',
  onClick,
  ...props
}: LetterSwapProps) {
  const [scope, animate] = useAnimate()
  const [isHovered, setIsHovered] = useState(false)
  const [blocked, setBlocked] = useState(false)

  const isReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const mergeTransition = useCallback(
    (baseTransition: AnimationOptions) => ({
      ...baseTransition,
      delay: stagger(staggerDuration, {
        from: staggerFrom,
      }),
    }),
    [staggerDuration, staggerFrom]
  )

  const handleStart = useMemo(
    () =>
      debounce(
        () => {
          if (isReducedMotion) return

          if (mode === 'forward') {
            if (blocked) return
            setBlocked(true)

            animate('.letter-primary', { y: reverse ? '100%' : '-100%' }, mergeTransition(transition)).then(() => {
              animate('.letter-primary', { y: 0 }, { duration: 0 }).then(() => {
                setBlocked(false)
              })
            })

            animate('.letter-secondary', { top: '0%' }, mergeTransition(transition)).then(() => {
              animate('.letter-secondary', { top: reverse ? '-100%' : '100%' }, { duration: 0 })
            })
          } else {
            // Ping-pong mode
            if (isHovered) return
            setIsHovered(true)

            animate('.letter-primary', { y: reverse ? '100%' : '-100%' }, mergeTransition(transition))
            animate('.letter-secondary', { top: '0%' }, mergeTransition(transition))
          }
        },
        80,
        { leading: true, trailing: false }
      ),
    [isReducedMotion, mode, blocked, animate, reverse, mergeTransition, transition, isHovered]
  )

  const handleEnd = useMemo(
    () =>
      debounce(
        () => {
          if (isReducedMotion || mode === 'forward') return
          setIsHovered(false)

          animate('.letter-primary', { y: 0 }, mergeTransition(transition))
          animate('.letter-secondary', { top: reverse ? '-100%' : '100%' }, mergeTransition(transition))
        },
        80,
        { leading: true, trailing: true }
      ),
    [isReducedMotion, mode, animate, mergeTransition, transition, reverse]
  )

  useEffect(() => {
    return () => {
      handleStart.cancel()
      handleEnd.cancel()
    }
  }, [handleStart, handleEnd])

  return (
    <span
      ref={scope}
      onMouseEnter={handleStart}
      onMouseLeave={handleEnd}
      onFocus={handleStart}
      onBlur={handleEnd}
      onClick={onClick}
      className={`inline-flex items-center relative overflow-hidden select-none cursor-pointer ${className}`}
      {...props}
    >
      <span className="sr-only">{label}</span>

      {label.split('').map((char: string, i: number) => {
        return (
          <span
            key={`${char}-${i}`}
            className="whitespace-pre relative inline-flex overflow-hidden"
            aria-hidden="true"
          >
            <motion.span className="relative letter-primary" style={{ top: 0 }}>
              {char}
            </motion.span>
            <motion.span
              className="absolute letter-secondary"
              style={{ top: reverse ? '-100%' : '100%' }}
            >
              {char}
            </motion.span>
          </span>
        )
      })}
    </span>
  )
}

export default LetterSwap
