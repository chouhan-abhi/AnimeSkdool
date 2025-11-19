import { useEffect, useState, useRef } from "react";

const useResponsive = (breakpoint = 1024) => {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth <= breakpoint;
    }
    return false;
  });
  
  const isMountedRef = useRef(true);
  
  useEffect(() => {
    isMountedRef.current = true;
    
    const onResize = () => {
      if (isMountedRef.current) {
        setIsMobile(window.innerWidth <= breakpoint);
      }
    };
    
    window.addEventListener("resize", onResize, { passive: true });
    
    return () => {
      isMountedRef.current = false;
      window.removeEventListener("resize", onResize);
    };
  }, [breakpoint]);
  
  return isMobile;
};

export default useResponsive;