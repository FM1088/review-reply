"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MessageSquareReply, LayoutDashboard, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavbarProps {
  user?: { email?: string } | null;
  onSignOut?: () => void;
}

export function Navbar({ user, onSignOut }: NavbarProps) {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 glass border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <MessageSquareReply className="h-6 w-6 text-primary" />
            <span className="gradient-text">ReviewReply.ai</span>
          </Link>

          <div className="flex items-center gap-1">
            {user ? (
              <>
                <Link href="/dashboard">
                  <Button variant={pathname === "/dashboard" ? "secondary" : "ghost"} size="sm">
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <Link href="/settings">
                  <Button variant={pathname === "/settings" ? "secondary" : "ghost"} size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={onSignOut} className="text-muted-foreground">
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Link href="/pricing">
                  <Button variant="ghost" size="sm">Pricing</Button>
                </Link>
                <Link href="/auth">
                  <Button size="sm">Sign In</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
