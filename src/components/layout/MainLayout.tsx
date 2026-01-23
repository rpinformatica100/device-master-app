import { Sidebar } from "./Sidebar";
import { MobileBottomNav } from "./MobileBottomNav";
import { MobileHeader } from "./MobileHeader";
import { motion } from "framer-motion";
import { useBreakpoint } from "@/hooks/use-mobile";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { isDesktop } = useBreakpoint();

  return (
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
        className={`min-h-screen ${isDesktop ? 'ml-[260px]' : 'pt-14 pb-20'}`}
      >
        {children}
      </motion.main>
      
      {/* Mobile/Tablet Bottom Navigation */}
      {!isDesktop && <MobileBottomNav />}
    </div>
  );
}
