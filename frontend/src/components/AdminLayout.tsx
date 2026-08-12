import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Settings, 
  LogOut,
  Shield,
  Menu,
  X,
  ChevronDown,
  UserPlus,
  UserCog,
  Mail
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { clearTokens } from "@/lib/api";

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

const AdminLayout = ({ children, title, subtitle }: AdminLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    clearTokens();
    navigate('/login');
  };

  // Get current user info from localStorage (set on login / session restore)
  const adminRole = localStorage.getItem('adminRole') || 'main';
  const adminEmail = localStorage.getItem('adminEmail') || '';

  const roleLabels: Record<string, string> = {
    main: "Bosh admin",
    qabul: "Qabul",
    payment: "To'lovlar",
    registrants: "Ro'yxatdan o'tganlar",
  };

  const initials = adminEmail
    ? adminEmail.slice(0, 2).toUpperCase()
    : adminRole.slice(0, 2).toUpperCase();

  const allNavItems = [
    { icon: LayoutDashboard, label: "Boshqaruv paneli", path: "/admin/main", roles: ["main"] },
    { icon: UserPlus, label: "Qabul", path: "/admin/qabul", roles: ["main", "qabul"] },
    { icon: FileText, label: "To'lovlar", path: "/admin/payment", roles: ["main", "payment"] },
    { icon: Users, label: "Ro'yxatdan o'tganlar", path: "/admin/registrants", roles: ["main", "registrants"] },
    { icon: UserCog, label: "Foydalanuvchilar", path: "/admin/users", roles: ["main"] },
  ];

  // Filter nav items based on role
  const mainNavItems = allNavItems.filter(item => item.roles.includes(adminRole));

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-foreground/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 flex flex-col bg-sidebar text-sidebar-foreground transition-all duration-300",
        sidebarOpen ? "w-64" : "w-20",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-sidebar-primary-foreground" />
            </div>
            {sidebarOpen && (
              <span className="font-display font-bold text-lg">SanEpi</span>
            )}
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:block p-2 rounded-lg hover:bg-sidebar-accent transition-colors"
          >
            <ChevronDown className={cn(
              "w-4 h-4 transition-transform",
              sidebarOpen ? "rotate-90" : "-rotate-90"
            )} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {mainNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                isActive(item.path) 
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md" 
                  : "hover:bg-sidebar-accent text-sidebar-foreground/70 hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {sidebarOpen && <span className="font-medium">{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border space-y-2">
          <Link
            to="/admin/settings"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
              isActive("/admin/settings")
                ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                : "hover:bg-sidebar-accent text-sidebar-foreground/70 hover:text-sidebar-foreground"
            )}
          >
            <Settings className="w-5 h-5 shrink-0" />
            {sidebarOpen && <span className="font-medium">Sozlamalar</span>}
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 hover:bg-destructive/10 text-sidebar-foreground/70 hover:text-destructive"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {sidebarOpen && <span className="font-medium">Chiqish</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div>
              <h1 className="font-display font-bold text-xl text-foreground">{title}</h1>
              {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Mail className="w-5 h-5" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <div className="p-4 border-b border-border">
                  <h3 className="font-semibold text-foreground">Xabarlar</h3>
                  <p className="text-sm text-muted-foreground">Sizda 3 ta yangi xabar bor</p>
                </div>
                <div className="max-h-80 overflow-auto">
                  <div className="p-3 hover:bg-muted/50 cursor-pointer border-b border-border">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-xs font-semibold text-primary">AB</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">Abdullayev Bobur</p>
                        <p className="text-xs text-muted-foreground truncate">Yangi mijoz ro'yxatdan o'tdi...</p>
                        <p className="text-xs text-muted-foreground mt-1">5 daqiqa oldin</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 hover:bg-muted/50 cursor-pointer border-b border-border">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                        <span className="text-xs font-semibold text-accent-foreground">KS</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">Karimov Sardor</p>
                        <p className="text-xs text-muted-foreground truncate">To'lov tasdiqlandi...</p>
                        <p className="text-xs text-muted-foreground mt-1">15 daqiqa oldin</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 hover:bg-muted/50 cursor-pointer">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center shrink-0">
                        <span className="text-xs font-semibold text-secondary-foreground">TM</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">Tizim xabari</p>
                        <p className="text-xs text-muted-foreground truncate">Yangi versiya chiqdi...</p>
                        <p className="text-xs text-muted-foreground mt-1">1 soat oldin</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-3 border-t border-border">
                  <Button variant="ghost" className="w-full text-sm">
                    Barcha xabarlarni ko'rish
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <button className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors cursor-pointer">
                  <span className="text-sm font-semibold text-primary">{initials}</span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2" align="end">
                <div className="px-3 py-2 border-b border-border mb-1">
                  <p className="text-sm font-medium text-foreground truncate">{adminEmail || "Foydalanuvchi"}</p>
                  <p className="text-xs text-muted-foreground">{roleLabels[adminRole] || adminRole}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Chiqish</span>
                </button>
              </PopoverContent>
            </Popover>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;