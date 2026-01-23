import * as React from "react";

const MOBILE_BREAKPOINT = 640;  // sm
const TABLET_BREAKPOINT = 1024; // lg

type Breakpoint = 'mobile' | 'tablet' | 'desktop';

interface BreakpointState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  breakpoint: Breakpoint;
}

export function useBreakpoint(): BreakpointState {
  const [state, setState] = React.useState<BreakpointState>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    breakpoint: 'desktop',
  });

  React.useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      
      if (width < MOBILE_BREAKPOINT) {
        setState({
          isMobile: true,
          isTablet: false,
          isDesktop: false,
          breakpoint: 'mobile',
        });
      } else if (width < TABLET_BREAKPOINT) {
        setState({
          isMobile: false,
          isTablet: true,
          isDesktop: false,
          breakpoint: 'tablet',
        });
      } else {
        setState({
          isMobile: false,
          isTablet: false,
          isDesktop: true,
          breakpoint: 'desktop',
        });
      }
    };

    // Set initial value
    updateBreakpoint();

    // Listen for resize events
    window.addEventListener("resize", updateBreakpoint);
    return () => window.removeEventListener("resize", updateBreakpoint);
  }, []);

  return state;
}

// Legacy hook for backwards compatibility
export function useIsMobile() {
  const { isMobile, isTablet } = useBreakpoint();
  // Treat tablet as mobile for UI purposes
  return isMobile || isTablet;
}
