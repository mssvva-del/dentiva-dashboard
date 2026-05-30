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

export function Topbar() {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-gray-200 bg-white px-4 backdrop-blur-sm md:px-8">
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
      </div>

      <div className="flex items-center gap-3">
        {/* AI Status pill */}
        <div
          className="hidden items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold sm:inline-flex"
          style={{ background: "#C6F6D5", color: "#2F855A" }}
        >
          <span
            className="h-[7px] w-[7px] rounded-full pulse-ring"
            style={{ background: "#2F855A" }}
            aria-hidden
          />
          AI Online
        </div>
        <UserButton
          afterSignOutUrl="/login"
          appearance={{ elements: { avatarBox: "h-8 w-8" } }}
        />
      </div>
    </header>
  );
}
