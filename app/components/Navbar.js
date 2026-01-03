import Link from 'next/link';

export default function Navbar() {
    return (
        <nav className="p-4 bg-gray-100">
            <ul className="flex gap-4">
                <li>
                    <Link href="/">Home</Link>
                </li>
                <li>
                    <Link href="/about">About</Link>
                </li>
                <li>
                    <Link href="/contact">Contact</Link>
                </li>
                <li>
                    <Link href="/report">Report</Link>
                </li>
            </ul>
        </nav>
    );
}