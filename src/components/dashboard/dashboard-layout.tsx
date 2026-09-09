"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
    Sparkles,
    LayoutDashboard,
    FileText,
    Wand2,
    Brain,
    Settings,
    LogOut,
    Menu,
    ChevronRight,
} from "lucide-react";
import { signOut } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

const sidebarItems = [
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { title: "Documents", href: "/dashboard/documents", icon: FileText },
    { title: "Transform", href: "/dashboard/transform", icon: Wand2 },
    { title: "Knowledge Base", href: "/dashboard/knowledge", icon: Brain },
    { title: "Settings", href: "/dashboard/settings", icon: Settings },
];

interface DashboardLayoutProps {
    children: React.ReactNode;
    user?: {
        name?: string | null;
        email?: string | null;
        avatarUrl?: string | null;
    };
}

function SidebarContent({ pathname }: { pathname: string }) {
    return (
        <div className="flex h-full flex-col">
            {/* Logo */}
            <div className="flex h-16 items-center border-b border-border/40 px-6">
                <Link href="/dashboard" className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
                        <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-lg font-semibold">ContentForge</span>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 p-4">
                {sidebarItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.title}
                            {isActive && <ChevronRight className="ml-auto h-4 w-4" />}
                        </Link>
                    );
                })}
            </nav>

            {/* Usage indicator (placeholder) */}
            <div className="border-t border-border/40 p-4">
                <div className="rounded-lg bg-muted/50 p-4">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Transforms used</span>
                        <span className="font-medium">3 / 10</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                        <div className="h-full w-[30%] rounded-full bg-gradient-to-r from-indigo-500 to-purple-600" />
                    </div>
                    <Button size="sm" variant="outline" className="mt-3 w-full" asChild>
                        <Link href="/dashboard/settings/billing">Upgrade Plan</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
    const pathname = usePathname();

    return (
        <div className="flex min-h-screen">
            {/* Desktop Sidebar */}
            <aside className="hidden w-64 border-r border-border/40 bg-card/50 lg:block">
                <SidebarContent pathname={pathname} />
            </aside>

            {/* Main Content */}
            <div className="flex flex-1 flex-col">
                {/* Top Header */}
                <header className="flex h-16 items-center justify-between border-b border-border/40 bg-background/80 px-4 backdrop-blur-sm lg:px-6">
                    {/* Mobile Menu */}
                    <Sheet>
                        <SheetTrigger asChild className="lg:hidden">
                            <Button variant="ghost" size="icon">
                                <Menu className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-64 p-0">
                            <SidebarContent pathname={pathname} />
                        </SheetContent>
                    </Sheet>

                    {/* Breadcrumb placeholder */}
                    <div className="hidden lg:block">
                        <h1 className="text-lg font-semibold">
                            {sidebarItems.find((item) => item.href === pathname)?.title || "Dashboard"}
                        </h1>
                    </div>

                    {/* Empty div for mobile centering */}
                    <div className="lg:hidden" />

                    {/* Mobile logo */}
                    <Link href="/dashboard" className="flex items-center gap-2 lg:hidden">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
                            <Sparkles className="h-4 w-4 text-white" />
                        </div>
                    </Link>

                    {/* User Menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src={user?.avatarUrl || undefined} alt={user?.name || "User"} />
                                    <AvatarFallback>
                                        {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "U"}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end">
                            <DropdownMenuLabel>
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium">{user?.name || "User"}</p>
                                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href="/dashboard/settings">
                                    <Settings className="mr-2 h-4 w-4" />
                                    Settings
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => signOut()}
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                Sign out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-auto p-4 lg:p-6">{children}</main>
            </div>
        </div>
    );
}
