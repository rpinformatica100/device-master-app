import { Sidebar } from "./Sidebar";
import { MobileBottomNav } from "./MobileBottomNav";
import { MobileHeader } from "./MobileHeader";
import { motion, MotionConfig } from "framer-motion";
import { useUiPrefs } from "@/lib/uiPrefs";
import { useBreakpoint } from "@/hooks/use-mobile";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { isDesktop } = useBreakpoint();
  const { animations, sidebarCompact } = useUiPrefs();

  return (
    <MotionConfig reducedMotion={animations ? "never" : "always"}>
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar - only on lg and above */}
      {isDesktop && <Sidebar />}
      
      {/* Mobile/Tablet Header */}
      {!isDesktop && <MobileHeader />}
      
      {/* Main Content */}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={`min-h-screen ${isDesktop ? (sidebarCompact ? 'ml-[80px]' : 'ml-[260px]') : 'pt-14 pb-20'} transition-[margin] duration-300`}
      >
        {children}
      </motion.main>
      
      {/* Mobile/Tablet Bottom Navigation */}
      {!isDesktop && <MobileBottomNav />}
    </div>
    </MotionConfig>
  );
}
