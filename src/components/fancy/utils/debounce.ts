/**
 * Lightweight, zero-dependency debounce utility.
 * Adapted for Fancy Components micro-interactions in Mohammed Atif's portfolio.
 */
export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number,
  options: { leading?: boolean; trailing?: boolean } = { leading: true, trailing: true }
): ((...args: Parameters<T>) => void) & { cancel: () => void } {
  let timeout: ReturnType<typeof setTimeout> | null = null
  let lastArgs: Parameters<T> | null = null

  const debounced = (...args: Parameters<T>) => {
    lastArgs = args
    const callNow = options.leading && !timeout

    if (timeout) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(() => {
      timeout = null
      if (options.trailing && lastArgs) {
        func(...lastArgs)
        lastArgs = null
      }
    }, wait)

    if (callNow) {
      func(...args)
    }
  }

  debounced.cancel = () => {
    if (timeout) {
      clearTimeout(timeout)
      timeout = null
    }
    lastArgs = null
  }

  return debounced
}
