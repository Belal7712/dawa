import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { ChevronDown, LayoutDashboard, LogOut, Shield, Loader2, User } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type AccountMenuProps = {
  /** Compact trigger for tight headers */
  compact?: boolean;
};

export default function AccountMenu({ compact = false }: AccountMenuProps) {
  const { user, profile, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);

  const displayName = profile?.full_name?.trim() || user?.email || 'حسابي';

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await signOut();
      toast.success('تم تسجيل الخروج');
      navigate('/', { replace: true });
    } catch {
      toast.error('فشل تسجيل الخروج');
      setSigningOut(false);
    }
  }

  return (
    <DropdownMenu dir="rtl">
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={
            compact
              ? 'inline-flex items-center gap-2 rounded-full border border-gold-200 bg-white/80 px-3 py-2 text-sm font-bold text-ink hover:border-gold-400 transition-colors'
              : 'inline-flex items-center gap-2 rounded-full border border-gold-200 bg-white/70 px-4 py-2.5 text-sm font-bold text-ink hover:border-gold-400 transition-colors'
          }
        >
          <span className="grid place-items-center w-7 h-7 rounded-full gold-grad text-white">
            <User className="w-3.5 h-3.5" />
          </span>
          <span className="max-w-[140px] truncate">{displayName}</span>
          <ChevronDown className="w-4 h-4 text-ink/40" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[200px] rounded-2xl border-gold-200 p-1.5">
        <DropdownMenuLabel className="px-3 py-2">
          <p className="text-sm font-black text-ink truncate">{displayName}</p>
          {user?.email && (
            <p className="text-xs font-medium text-ink/45 mt-0.5 truncate" dir="ltr">
              {user.email}
            </p>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gold-100" />
        <DropdownMenuItem asChild className="rounded-xl cursor-pointer font-bold">
          <Link to="/dashboard">
            <LayoutDashboard className="w-4 h-4 ml-2" />
            لوحة التحكم
          </Link>
        </DropdownMenuItem>
        {isAdmin && (
          <DropdownMenuItem asChild className="rounded-xl cursor-pointer font-bold">
            <Link to="/admin">
              <Shield className="w-4 h-4 ml-2" />
              لوحة الأدمن
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator className="bg-gold-100" />
        <DropdownMenuItem
          disabled={signingOut}
          onSelect={(e) => {
            e.preventDefault();
            void handleSignOut();
          }}
          className="rounded-xl cursor-pointer font-bold text-maroon-700 focus:text-maroon-800"
        >
          {signingOut ? (
            <Loader2 className="w-4 h-4 ml-2 animate-spin" />
          ) : (
            <LogOut className="w-4 h-4 ml-2" />
          )}
          تسجيل الخروج
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
