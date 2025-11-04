"use client";

import Link from "next/link";

export default function HeroSection() {
  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Background Video */}
      <video
        className="absolute inset-0 w-full h-full object-cover z-0"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/beforeafterphotos/herovideo.mp4" type="video/mp4" />
      </video>

      {/* Video Overlay */}
      <div className="absolute inset-0 bg-black/20 z-0" />

      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/10 backdrop-blur-sm py-4 px-6">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          {/* Logo */}
          <div className="text-white font-serif text-xl">Snaptastic</div>

          {/* Navigation Links */}
          <div className="flex items-center gap-8 text-white/90 font-sans text-sm font-light">
            <Link
              href="#examples"
              className="hover:text-white hover:scale-105 transition-colors duration-300"
            >
              Examples
            </Link>
            <Link
              href="/pricing"
              className="hover:text-white hover:scale-105 transition-colors duration-300"
            >
              Pricing
            </Link>
            <Link
              href="/sign-in"
              className="hover:text-white hover:scale-105 transition-colors duration-300"
            >
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="relative z-10 flex items-center h-screen">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl fade-in">
            {/* Hero Heading */}
            <h1 className="font-serif text-white text-4xl lg:text-6xl font-normal tracking-tight mb-8">
              Bring grandpa back to life in <em>just one click</em>
            </h1>

            {/* Hero Subheading */}
            <p className="font-sans text-gray-200 text-lg lg:text-xl font-light leading-relaxed mb-12 max-w-xl">
              Transform your old, faded photos into stunning high-resolution memories with AI-powered restoration in seconds.
            </p>

            {/* Call to Action Button */}
            <Link
              href="/sign-up"
              className="inline-block bg-white text-gray-900 font-sans font-medium px-6 py-3 rounded-lg text-base hover:bg-gray-100 hover:scale-105 hover:shadow-lg transition-all duration-300"
            >
              Start Restoring Free
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 left-0 right-0 z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center">
            <p className="font-sans text-white/70 text-xs font-light">
              © 2025 Snaptastic. All rights reserved.
            </p>
            <p className="font-sans text-white/70 text-xs font-light">
              Powered by AI
            </p>
          </div>
        </div>
      </div>

      {/* CSS for fade-in animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .fade-in {
          animation: fadeIn 1s ease-out;
        }
      `}</style>
    </div>
  );
}
