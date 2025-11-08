import { Link, useLocation } from 'react-router';
import { Users, Tag, Image, LayoutDashboard, LogOut, Bell } from 'lucide-react';
import { Button } from '@ui/common/button';
import { useAuthStore } from 'infrastructure/store/auth';

const sidebarItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Users',
    href: '/users',
    icon: Users,
  },
  {
    title: 'Brands',
    href: '/brands',
    icon: Tag,
  },
  {
    title: 'Banners',
    href: '/banners',
    icon: Image,
  },
  {
    title: 'Notifications',
    href: '/notifications',
    icon: Bell,
  },
];

export function Sidebar() {
  const location = useLocation();
  const { logout } = useAuthStore();

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-primary text-white">
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center justify-center border-b border-white">
          <h2 className="text-xl font-bold">Stars Group CMS</h2>
        </div>

        <nav className="flex-1 space-y-2 p-4">
          {sidebarItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-white text-primary'
                    : 'text-white/80 hover:bg-white/90 hover:text-primary'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white p-4">
          <Button
            variant="ghost"
            onClick={logout}
            className="w-full justify-start text-white/80 hover:bg-white/80 hover:text-primary"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
