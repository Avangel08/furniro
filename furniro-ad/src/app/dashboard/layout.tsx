"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { DashboardHeader } from "@/components/layout/DashboardHeader";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check authentication on mount
    const checkAuth = async () => {
      const token = localStorage.getItem('adminAccessToken');
      const storedUser = localStorage.getItem('adminUser');

      if (!token || !storedUser) {
        router.push("/login");
        return;
      }

      try {
        // Verify token with backend
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.data.user);
        } else {
          // Token invalid, redirect to login
          localStorage.removeItem('adminAccessToken');
          localStorage.removeItem('adminUser');
          router.push("/login");
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('adminAccessToken');
        localStorage.removeItem('adminUser');
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    try {
      // Call logout API
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage and redirect
      localStorage.removeItem('adminAccessToken');
      localStorage.removeItem('adminUser');
      router.push("/login");
    }
  };

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect if no user (shouldn't happen due to useEffect, but safety check)
  if (!user) {
    return null;
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-gradient-subtle">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          <DashboardHeader user={user} onLogout={handleLogout} />
          
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
