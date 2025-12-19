import Link from "next/link";
import { Sparkles, Github, Twitter, Linkedin } from "lucide-react";

export const Footer = () => {
    return (
        <footer className="bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">
                    {/* Brand Section */}
                    <div className="md:col-span-4 space-y-6">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="bg-indigo-600 p-1.5 rounded-lg">
                                <Sparkles className="h-5 w-5 text-white" />
                            </div>
                            <span className="font-bold text-xl tracking-tight">
                                Content<span className="text-indigo-600">Forge</span>
                            </span>
                        </Link>
                        <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed max-w-sm">
                            The intelligent content workspace powered by Gemini. Transform documents,
                            videos, and audio into high-impact content for every platform.
                        </p>
                        <div className="flex items-center gap-4">
                            <Link href="#" className="text-zinc-400 hover:text-indigo-600 transition-colors">
                                <Twitter className="h-5 w-5" />
                            </Link>
                            <Link href="#" className="text-zinc-400 hover:text-indigo-600 transition-colors">
                                <Github className="h-5 w-5" />
                            </Link>
                            <Link href="#" className="text-zinc-400 hover:text-indigo-600 transition-colors">
                                <Linkedin className="h-5 w-5" />
                            </Link>
                        </div>
                    </div>

                    {/* Links Sections */}
                    <div className="md:col-span-2 space-y-4">
                        <h4 className="font-semibold text-sm uppercase tracking-wider text-zinc-900 dark:text-white">Product</h4>
                        <ul className="space-y-2">
                            <li><Link href="#features" className="text-zinc-500 hover:text-indigo-600 text-sm transition-colors">Features</Link></li>
                            <li><Link href="#pricing" className="text-zinc-500 hover:text-indigo-600 text-sm transition-colors">Pricing</Link></li>
                            <li><Link href="/dashboard" className="text-zinc-500 hover:text-indigo-600 text-sm transition-colors">Dashboard</Link></li>
                            <li><Link href="#" className="text-zinc-500 hover:text-indigo-600 text-sm transition-colors">API Docs</Link></li>
                        </ul>
                    </div>

                    <div className="md:col-span-2 space-y-4">
                        <h4 className="font-semibold text-sm uppercase tracking-wider text-zinc-900 dark:text-white">Resources</h4>
                        <ul className="space-y-2">
                            <li><Link href="#" className="text-zinc-500 hover:text-indigo-600 text-sm transition-colors">Blog</Link></li>
                            <li><Link href="#" className="text-zinc-500 hover:text-indigo-600 text-sm transition-colors">Case Studies</Link></li>
                            <li><Link href="#" className="text-zinc-500 hover:text-indigo-600 text-sm transition-colors">Guides</Link></li>
                            <li><Link href="#" className="text-zinc-500 hover:text-indigo-600 text-sm transition-colors">Templates</Link></li>
                        </ul>
                    </div>

                    <div className="md:col-span-2 space-y-4">
                        <h4 className="font-semibold text-sm uppercase tracking-wider text-zinc-900 dark:text-white">Company</h4>
                        <ul className="space-y-2">
                            <li><Link href="#" className="text-zinc-500 hover:text-indigo-600 text-sm transition-colors">About Us</Link></li>
                            <li><Link href="#" className="text-zinc-500 hover:text-indigo-600 text-sm transition-colors">Careers</Link></li>
                            <li><Link href="#" className="text-zinc-500 hover:text-indigo-600 text-sm transition-colors">Partner Program</Link></li>
                            <li><Link href="#" className="text-zinc-500 hover:text-indigo-600 text-sm transition-colors">Contact</Link></li>
                        </ul>
                    </div>

                    <div className="md:col-span-2 space-y-4">
                        <h4 className="font-semibold text-sm uppercase tracking-wider text-zinc-900 dark:text-white">Legal</h4>
                        <ul className="space-y-2">
                            <li><Link href="#" className="text-zinc-500 hover:text-indigo-600 text-sm transition-colors">Privacy Policy</Link></li>
                            <li><Link href="#" className="text-zinc-500 hover:text-indigo-600 text-sm transition-colors">Terms of Service</Link></li>
                            <li><Link href="#" className="text-zinc-500 hover:text-indigo-600 text-sm transition-colors">Cookie Policy</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-16 pt-8 border-t border-zinc-200 dark:border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-zinc-400 text-xs">
                        © {new Date().getFullYear()} ContentForge AI. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        <span className="text-zinc-400 text-xs flex items-center gap-1.5">
                            Built with <span className="text-red-500 animate-pulse">❤️</span> and Gemini
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
};
