import Link from "next/link";

export default function FooterSection() {
  return (
    <footer className="bg-black border-t border-white/10 py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Brand */}
          <div className="text-center md:text-left">
            <p className="font-serif text-white text-xl mb-1">Snaptastic</p>
            <p className="font-sans text-gray-500 text-sm">
              © {new Date().getFullYear()} All rights reserved
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-sans">
            <Link
              href="/pricing"
              className="text-gray-400 hover:text-white transition-colors duration-200"
            >
              Pricing
            </Link>
            <Link
              href="/privacy-policy"
              className="text-gray-400 hover:text-white transition-colors duration-200"
            >
              Privacy
            </Link>
            <Link
              href="/terms-of-service"
              className="text-gray-400 hover:text-white transition-colors duration-200"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
