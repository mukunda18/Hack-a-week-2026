import Link from 'next/link';

export default function Navbar() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Logo / Brand */}
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
                            <span className="text-white font-bold">G</span>
                        </div>
                        <span className="font-bold text-xl tracking-tight text-gray-900">
                            Ghus<span className="text-red-600">Meter</span>
                        </span>
                    </Link>
                </div>

                {/* Navigation Links */}
                <div className="hidden md:block">
                    <ul className="flex items-center gap-8">
                        <li>
                            <Link href="/" className="text-sm font-medium text-gray-600 hover:text-red-600 transition-colors">
                                Home
                            </Link>
                        </li>
                        <li>
                            <Link href="/about" className="text-sm font-medium text-gray-600 hover:text-red-600 transition-colors">
                                About
                            </Link>
                        </li>
                        <li>
                            <Link href="/contact" className="text-sm font-medium text-gray-600 hover:text-red-600 transition-colors">
                                Contact
                            </Link>
                        </li>
                    </ul>
                </div>

                {/* CTA Button */}
                <div className="flex items-center gap-4">
                    <Link
                        href="/report"
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-full transition-all shadow-lg shadow-red-600/20 active:scale-95"
                    >
                        Report Corruption
                    </Link>
                </div>
            </div>
        </header>
    );
}
