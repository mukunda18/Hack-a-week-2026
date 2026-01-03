import Link from 'next/link';

export default function Navbar() {
    return (
        <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-white/70 backdrop-blur-md dark:bg-slate-900/70">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Logo / Brand */}
                <div className="flex items-center">
                    <Link href="/" className="group flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white transition-transform group-hover:rotate-12">
                            <span className="text-lg font-bold">GH</span>
                        </div>
                        <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                            Ghus<span className="text-indigo-600">Meter</span>
                        </span>
                    </Link>
                </div>

                {/* Navigation Links */}
                <div className="hidden md:block">
                    <ul className="flex items-center gap-8">
                        <li>
                            <Link href="/" className="text-sm font-medium text-slate-600 transition-colors hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400">
                                Home
                            </Link>
                        </li>
                        <li>
                            <Link href="/about" className="text-sm font-medium text-slate-600 transition-colors hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400">
                                About
                            </Link>
                        </li>
                        <li>
                            <Link href="/contact" className="text-sm font-medium text-slate-600 transition-colors hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400">
                                Contact
                            </Link>
                        </li>
                        <li>
                            <Link href="/report" className="text-sm font-medium text-slate-600 transition-colors hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400">
                                Report
                            </Link>
                        </li>
                    </ul>
                </div>

                {/* CTA Button */}
                <div className="flex items-center gap-4">
                    <Link
                        href="/login"
                        className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-slate-800 hover:shadow-lg active:scale-95 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                    >
                        Sign In
                    </Link>
                </div>
            </div>
        </nav>
    );
}
