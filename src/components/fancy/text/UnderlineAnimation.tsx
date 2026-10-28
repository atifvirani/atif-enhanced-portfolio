/**
 * UnderlineAnimation Component
 * 
 * Original Author: Daniel Petho <https://www.danielpetho.com>
 * Source: Fancy Components (https://fancycomponents.dev)
 * License: MIT
 * 
 * Adapted for Mohammed Atif Portfolio with:
 * - Native framer-motion v14 integration
 * - 'comes-in-goes-out' and 'center' animation styles
 * - Seamless bg-current color inheritance
 * - prefers-reduced-motion bypass
 * - Accessible aria-hidden underline span
 * - Keyboard focus & touch compatibility
 */

import { type ElementType, useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { motion, useAnimationControls, type Transition } from 'framer-motion'

export interface UnderlineAnimationProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode
  as?: ElementType
  direction?: 'left' | 'right' | 'center'
  className?: string
  underlineHeightRatio?: number
  underlinePaddingRatio?: number
  transition?: Transition
}

export function UnderlineAnimation({
  children,
  as: Component = 'span',
  direction = 'left',
  className = '',
  underlineHeightRatio = 0.08,
  underlinePaddingRatio = 0.02,
  transition = {
    duration: 0.35,
    ease: [0.16, 1, 0.3, 1],
  },
  ...props
}: UnderlineAnimationProps) {
  const controls = useAnimationControls()
  const [blocked, setBlocked] = useState(false)
  const textRef = useRef<HTMLSpanElement>(null)

  const isReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    const updateUnderlineStyles = () => {
      if (textRef.current) {
        const fontSize = parseFloat(getComputedStyle(textRef.current).fontSize) || 16
        const underlineHeight = Math.max(1, fontSize * underlineHeightRatio)
        const underlinePadding = fontSize * underlinePaddingRatio
        textRef.current.style.setProperty('--underline-height', `${underlineHeight}px`)
        textRef.current.style.setProperty('--underline-padding', `${underlinePadding}px`)
      }
    }

    updateUnderlineStyles()
    window.addEventListener('resize', updateUnderlineStyles)
    return () => window.removeEventListener('resize', updateUnderlineStyles)
  }, [underlineHeightRatio, underlinePaddingRatio])

  const triggerAnimation = useCallback(async () => {
    if (isReducedMotion || blocked) return
    setBlocked(true)

    if (direction === 'center') {
      await controls.start({
        scaleX: 1,
        transition,
      })
    } else {
      await controls.start({
        width: '100%',
        transition,
        transitionEnd: {
          left: direction === 'left' ? 'auto' : 0,
          right: direction === 'left' ? 0 : 'auto',
        },
      })

      await controls.start({
        width: '0%',
        transition,
        transitionEnd: {
          left: direction === 'left' ? 0 : 'auto',
          right: direction === 'left' ? 'auto' : 0,
        },
      })
    }

    setBlocked(false)
  }, [blocked, controls, direction, isReducedMotion, transition])

  const handleMouseLeave = useCallback(async () => {
    if (direction === 'center' && !isReducedMotion) {
      await controls.start({
        scaleX: 0,
        transition,
      })
    }
  }, [controls, direction, isReducedMotion, transition])

  const underlineStyles = useMemo(() => {
    if (direction === 'center') {
      return {
        height: 'var(--underline-height, 1px)',
        bottom: 'calc(-1 * var(--underline-padding, 0px))',
        transformOrigin: 'center',
      }
    }
    return {
      height: 'var(--underline-height, 1px)',
      bottom: 'calc(-1 * var(--underline-padding, 0px))',
    }
  }, [direction])

  return (
    <Component
      ref={textRef}
      onMouseEnter={triggerAnimation}
      onMouseLeave={handleMouseLeave}
      onFocus={triggerAnimation}
      onBlur={handleMouseLeave}
      className={`relative inline-flex items-center cursor-pointer ${className}`}
      {...props}
    >
      <span>{children}</span>
      <motion.span
        className={`absolute bg-current ${
          direction === 'center'
            ? 'left-0 right-0 w-full'
            : direction === 'left'
            ? 'left-0 w-0'
            : 'right-0 w-0'
        }`}
        style={underlineStyles}
        initial={direction === 'center' ? { scaleX: 0 } : { width: '0%' }}
        animate={controls}
        aria-hidden="true"
      />
    </Component>
  )
}

export default UnderlineAnimation
