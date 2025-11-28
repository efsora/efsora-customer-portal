import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(() => {
    // Initialize with correct value if window is available (client-side)
    if (typeof window !== "undefined") {
      return window.innerWidth < MOBILE_BREAKPOINT
    }
    return false
  })

  React.useEffect(() => {
    // Function to check and update mobile state
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }

    // Use both matchMedia and resize for reliability
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)

    // Handler for matchMedia change
    const onMediaChange = () => {
      checkIsMobile()
    }

    // Handler for resize (backup, debounced)
    let resizeTimeout: ReturnType<typeof setTimeout>
    const onResize = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(checkIsMobile, 100)
    }

    // Set initial value
    checkIsMobile()

    // Listen to both events
    mql.addEventListener("change", onMediaChange)
    window.addEventListener("resize", onResize)

    return () => {
      mql.removeEventListener("change", onMediaChange)
      window.removeEventListener("resize", onResize)
      clearTimeout(resizeTimeout)
    }
  }, [])

  return isMobile
}
