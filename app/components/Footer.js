import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-gray-900 border-t border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold">N</span>
                            </div>
                            <span className="font-bold text-xl tracking-tight text-white">
                                Ghus<span className="text-red-500">Meter</span>
                            </span>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Empowering citizens to fight corruption through transparency, data visualization, and anonymous reporting.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Platform</h3>
                        <ul className="space-y-3">
                            <li><Link href="/" className="text-gray-400 hover:text-white transition-colors text-sm">Home</Link></li>
                            <li><Link href="/report" className="text-gray-400 hover:text-white transition-colors text-sm">Report Incident</Link></li>
                            <li><Link href="/map" className="text-gray-400 hover:text-white transition-colors text-sm">Live Map</Link></li>
                            <li><Link href="/statistics" className="text-gray-400 hover:text-white transition-colors text-sm">Statistics</Link></li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Resources</h3>
                        <ul className="space-y-3">
                            <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors text-sm">About Us</Link></li>
                            <li><Link href="/faq" className="text-gray-400 hover:text-white transition-colors text-sm">FAQ</Link></li>
                            <li><Link href="/privacy" className="text-gray-400 hover:text-white transition-colors text-sm">Privacy Policy</Link></li>
                            <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors text-sm">Contact</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Connect</h3>
                        <p className="text-gray-400 text-sm mb-2">Kathmandu, Nepal</p>
                        <p className="text-gray-400 text-sm mb-4">info@ghusmeter.com</p>
                        <div className="flex gap-4">
                            {/* Social Icons Placeholder */}
                            <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:bg-red-600 hover:text-white transition-colors cursor-pointer">
                                🐦
                            </div>
                            <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:bg-blue-600 hover:text-white transition-colors cursor-pointer">
                                📘
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-12 pt-8 text-center md:text-left flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
                    <p>© 2026 GhusMeter. All rights reserved.</p>
                    <p className="mt-2 md:mt-0">Built for a corruption-free Nepal 🇳🇵</p>
                </div>
            </div>
        </footer>
    );
}
