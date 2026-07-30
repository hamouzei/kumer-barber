"use client";

import { Bell, LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";
import { useNotifications } from "@/hooks/use-notifications";
import { Sidebar } from "./sidebar";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

export function DashboardHeader() {
  const { logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotifications();

  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur-sm">
      {/* Mobile sidebar trigger */}
      <Sheet>
        <SheetTrigger
          className="md:hidden"
          render={<Button variant="ghost" size="icon" aria-label="Open sidebar" />}
        >
          <Menu className="h-5 w-5" />
        </SheetTrigger>
        <SheetContent side="left" className="w-60 p-0 bg-night border-none">
          <Sidebar />
        </SheetContent>
      </Sheet>

      <div className="hidden md:block" />

      {/* Right side actions */}
      <div className="flex items-center gap-1">
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                aria-label="Notifications"
              />
            }
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brass px-1 text-[10px] font-bold text-night">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs font-normal text-brass hover:text-brass-light transition-colors"
                  >
                    Mark all as read
                  </button>
                )}
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <ScrollArea className="max-h-72">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  No notifications
                </div>
              ) : (
                <DropdownMenuGroup>
                  {notifications.slice(0, 10).map((notification) => (
                    <DropdownMenuItem
                      key={notification.notificationId}
                      className={cn(
                        "flex flex-col items-start gap-1 p-3 cursor-pointer",
                        !notification.isRead && "bg-brass/5"
                      )}
                      onClick={() => {
                        if (!notification.isRead) {
                          markAsRead(notification.notificationId);
                        }
                      }}
                    >
                      <div className="flex w-full items-center justify-between gap-2">
                        <span className="text-sm font-medium">
                          {notification.title}
                        </span>
                        {!notification.isRead && (
                          <Badge
                            variant="secondary"
                            className="h-1.5 w-1.5 rounded-full bg-brass p-0"
                          />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {notification.message}
                      </p>
                      <span className="text-[10px] text-muted-foreground/60">
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              )}
            </ScrollArea>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Logout */}
        <Button
          variant="ghost"
          size="icon"
          onClick={logout}
          aria-label="Log out"
          className="text-muted-foreground hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
