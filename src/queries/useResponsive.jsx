import { useEffect, useState, useRef } from "react";

const useResponsive = (breakpoint = 1024) => {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth <= breakpoint;
    }
    return false;
  });
  
  const isMountedRef = useRef(true);
  const resizeTimeoutRef = useRef(null);
  
  useEffect(() => {
    isMountedRef.current = true;
    
    // Debounced resize handler to prevent rapid state updates
    const onResize = () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      resizeTimeoutRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          setIsMobile(window.innerWidth <= breakpoint);
        }
      }, 150);
    };
    
    window.addEventListener("resize", onResize, { passive: true });
    
    return () => {
      isMountedRef.current = false;
      window.removeEventListener("resize", onResize);
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
        resizeTimeoutRef.current = null;
      }
    };
  }, [breakpoint]);
  
  return isMobile;
};

export default useResponsive;