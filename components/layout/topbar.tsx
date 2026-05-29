"use client";

import * as React from "react";
import { Menu } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SidebarNav, SidebarBrand } from "./sidebar";
import { usePracticeMe } from "@/lib/hooks/use-dashboard";
import { APP_NAME } from "@/lib/constants";

export function Topbar() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const { data: practice } = usePracticeMe();

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b bg-white px-4 md:px-6">
      <div className="flex items-center gap-3">
        {/* Mobile nav trigger */}
        <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="left-0 top-0 h-full max-w-[16rem] translate-x-0 translate-y-0 rounded-none border-r bg-navy p-0">
            <DialogTitle className="sr-only">Navigation</DialogTitle>
            <SidebarBrand />
            <SidebarNav onNavigate={() => setMobileOpen(false)} />
          </DialogContent>
        </Dialog>

        <div>
          <p className="text-sm font-medium text-navy">
            {practice?.name ?? APP_NAME}
          </p>
          <p className="text-xs text-muted-foreground">
            AI Receptionist
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <UserButton
          afterSignOutUrl="/login"
          appearance={{ elements: { avatarBox: "h-8 w-8" } }}
        />
      </div>
    </header>
  );
}
