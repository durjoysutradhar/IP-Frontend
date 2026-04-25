import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  LogOut,
  User,
  BookMarked,
  AlertCircle,
  FolderOpen,
  BarChart3,
  Menu,
  X,
  GraduationCap
} from 'lucide-react';

const StudentLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isTeacher = user?.role === 'teacher';
  const basePath = isTeacher ? '/teacher' : '/student';
  const portalLabel = isTeacher ? 'Teacher' : 'Student';

  const navigation = [
    { name: 'Dashboard', href: `${basePath}`, icon: LayoutDashboard },
    { name: 'Browse Books', href: `${basePath}/books`, icon: BookOpen },
    { name: 'My Borrows', href: `${basePath}/my-borrows`, icon: BookMarked },
    { name: 'My Fines', href: `${basePath}/fines`, icon: AlertCircle },
    { name: 'Resources', href: `${basePath}/resources`, icon: FolderOpen },
    ...(isTeacher
      ? [{ name: 'Upload Materials', href: `${basePath}/upload-materials`, icon: FileText }]
      : []),
    { name: 'Analytics', href: `${basePath}/analytics`, icon: BarChart3 },
    { name: 'My Notes', href: `${basePath}/my-notes`, icon: FileText },
    { name: 'My Profile', href: `${basePath}/profile`, icon: User }
  ];

  const isActive = (path) => location.pathname === path;

  const getNavClass = (path) => {
    const base = 'flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all';
    return isActive(path)
      ? `${base} bg-primary-600 text-white shadow-md`
      : `${base} text-slate-300 hover:bg-slate-800 hover:text-white`;
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur md:hidden">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white">
              <GraduationCap className="h-5 w-5" />
            </div>
            <h1 className="text-lg font-semibold text-slate-900">{`EduLibrary ${portalLabel}`}</h1>
          </div>
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg border border-slate-200 p-2 text-slate-700"
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <button
            className="flex-1 bg-black/40"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close navigation overlay"
          />
          <aside className="w-72 border-l border-slate-700 bg-slate-900 text-white">
            <div className="flex h-16 items-center justify-between border-b border-slate-700 px-4">
              <h2 className="text-lg font-semibold">Menu</h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="rounded-lg p-1 text-slate-300 hover:bg-slate-800"
                aria-label="Close navigation"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="space-y-2 p-4">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={getNavClass(item.href)}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
            <div className="border-t border-slate-700 p-4">
              <div className="mb-3 flex items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-700">
                  <User className="h-5 w-5 text-slate-200" />
                </div>
                <div className="ml-3 min-w-0">
                  <p className="truncate text-sm font-medium text-white">{user?.name}</p>
                  <p className="truncate text-xs text-slate-400">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex w-full items-center rounded-xl px-3 py-2 text-sm font-medium text-red-300 hover:bg-red-500/10"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </button>
            </div>
          </aside>
        </div>
      )}

      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-800 bg-slate-900 text-white md:block">
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center gap-2 border-b border-slate-800 px-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white">
              <GraduationCap className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-semibold">{`EduLibrary ${portalLabel}`}</h1>
          </div>

          <nav className="custom-scrollbar flex-1 space-y-2 overflow-y-auto px-4 py-6">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.name} to={item.href} className={getNavClass(item.href)}>
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-slate-800 p-4">
            <div className="mb-3 flex items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800">
                <User className="h-5 w-5 text-slate-200" />
              </div>
              <div className="ml-3 min-w-0">
                <p className="truncate text-sm font-medium text-white">{user?.name}</p>
                <p className="truncate text-xs text-slate-400">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex w-full items-center rounded-xl px-3 py-2 text-sm font-medium text-red-300 hover:bg-red-500/10"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      <div className="md:pl-64">
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
};

export default StudentLayout;
