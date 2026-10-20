import React from "react";
import { AvatarMenu } from "@/components/ui/AvatarMenu";
import { Logo } from "@/components/ui/Logo";

interface PageHeaderProps {
  title: string;
  description: string;
  user: {
    email: string;
    role: string;
  } | null;
  initials: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, user, initials, actions }: PageHeaderProps) {
  return (
    <header className="relative mb-6 bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/60 shadow-[0_2px_20px_rgb(0,0,0,0.02)] overflow-hidden group transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
      {/* Background elegant gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/40 via-transparent to-indigo-50/40 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        
        {/* Title and Description titulo y descripcion */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Logo compact title={title} />
          </div>
          <p className="text-slate-500 mt-1.5 text-sm font-medium">
            {description}
          </p>
        </div>

        {/* Actions and User Profile */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
          {actions && (
            <div className="flex w-full sm:w-auto flex-col sm:flex-row items-center gap-3">
              {actions}
            </div>
          )}
          
          {/* Divider hidden on small screens */}
          <div className="hidden sm:block h-10 w-px bg-slate-200 mx-2" />
          
          <div className="flex justify-end w-full sm:w-auto">
            <AvatarMenu 
              initials={initials} 
              email={user?.email ?? ""} 
              role={user?.role ?? ""} 
              onLogout={() => console.log("Logout")} 
            />
          </div>
        </div>
      </div>
    </header>
  );
}
