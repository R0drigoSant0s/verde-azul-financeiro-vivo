
import { Link, useLocation } from "wouter";
import { LayoutDashboard, ReceiptText, PieChart, LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick?: () => void;
}

function NavItem({ href, icon, label, isActive, onClick }: NavItemProps) {
  return (
    <Link href={href}>
      <a
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-gray-100 dark:hover:bg-gray-800",
          isActive ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50" : "text-gray-500 dark:text-gray-400"
        )}
        onClick={onClick}
      >
        {icon}
        {label}
      </a>
    </Link>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Mobile header */}
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static md:px-6 lg:hidden">
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </Button>
        <div className="flex-1">
          <h1 className="text-lg font-semibold">Minhas Finanças</h1>
        </div>
      </header>
      
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-20 flex w-64 flex-col border-r bg-background transition-transform lg:static lg:translate-x-0",
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="border-b px-6 py-4 hidden lg:flex">
            <h1 className="text-lg font-semibold">Minhas Finanças</h1>
          </div>
          <nav className="flex-1 overflow-auto py-6 px-4">
            <div className="space-y-1">
              <NavItem 
                href="/" 
                icon={<LayoutDashboard className="h-5 w-5" />} 
                label="Dashboard" 
                isActive={location === "/"} 
                onClick={closeMobileMenu} 
              />
              <NavItem 
                href="/transactions" 
                icon={<ReceiptText className="h-5 w-5" />} 
                label="Transações" 
                isActive={location === "/transactions"} 
                onClick={closeMobileMenu} 
              />
              <NavItem 
                href="/budget" 
                icon={<PieChart className="h-5 w-5" />} 
                label="Orçamentos" 
                isActive={location === "/budget"} 
                onClick={closeMobileMenu} 
              />
            </div>
          </nav>
          <div className="border-t p-4">
            <Button variant="outline" className="w-full justify-start">
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </aside>
        
        {/* Overlay for mobile */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 z-10 bg-black/50 lg:hidden" 
            onClick={closeMobileMenu}
          />
        )}
        
        {/* Main content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
