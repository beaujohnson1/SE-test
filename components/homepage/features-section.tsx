"use client";

import { Check, Sparkles, Zap, Crown } from "lucide-react";
import Link from "next/link";

export default function FeaturesSection() {
  return (
    <section className="bg-black py-24 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="font-serif text-white text-4xl lg:text-5xl font-normal tracking-tight mb-4">
            Simple. Powerful. Affordable.
          </h2>
          <p className="font-sans text-gray-400 text-lg font-light max-w-2xl mx-auto">
            Restore your precious memories with credits that work the way you do
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {/* Feature 1 - Free Credits */}
          <div className="group bg-white/5 backdrop-blur-sm p-8 rounded-xl border border-white/10 hover:border-emerald-500/50 hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300">
            <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-500/20 transition-colors">
              <Sparkles className="w-7 h-7 text-emerald-400" />
            </div>
            <h3 className="font-serif text-white text-2xl font-normal mb-3">
              Start Free
            </h3>
            <p className="font-sans text-gray-400 text-base leading-relaxed mb-6">
              Get 3 free credits. No credit card. No commitment.
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-gray-300 text-sm font-sans">
                <Check className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>1 credit restores any photo</span>
              </li>
              <li className="flex items-start gap-3 text-gray-300 text-sm font-sans">
                <Check className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>1 credit exports upscaled</span>
              </li>
              <li className="flex items-start gap-3 text-gray-300 text-sm font-sans">
                <Check className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>Test before you buy</span>
              </li>
            </ul>
          </div>

          {/* Feature 2 - AI Upscaling */}
          <div className="group bg-white/5 backdrop-blur-sm p-8 rounded-xl border border-white/10 hover:border-blue-500/50 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300">
            <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-500/20 transition-colors">
              <Zap className="w-7 h-7 text-blue-400" />
            </div>
            <h3 className="font-serif text-white text-2xl font-normal mb-3">
              AI Upscaling
            </h3>
            <p className="font-sans text-gray-400 text-base leading-relaxed mb-6">
              AI-powered enhancement for stunning high-quality photos.
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-gray-300 text-sm font-sans">
                <Check className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <span>2x resolution boost</span>
              </li>
              <li className="flex items-start gap-3 text-gray-300 text-sm font-sans">
                <Check className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <span>High-quality output</span>
              </li>
              <li className="flex items-start gap-3 text-gray-300 text-sm font-sans">
                <Check className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <span>Smart detail recovery</span>
              </li>
            </ul>
          </div>

          {/* Feature 3 - Subscription */}
          <div className="group bg-gradient-to-br from-amber-500/10 to-orange-500/10 backdrop-blur-sm p-8 rounded-xl border border-amber-500/30 hover:border-amber-400/60 hover:-translate-y-2 hover:shadow-2xl hover:shadow-amber-500/20 transition-all duration-300">
            <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-amber-500/20 transition-colors">
              <Crown className="w-7 h-7 text-amber-400" />
            </div>
            <h3 className="font-serif text-white text-2xl font-normal mb-3">
              Credit Packs
            </h3>
            <p className="font-sans text-gray-400 text-base leading-relaxed mb-6">
              50 credits for $19.99/mo. Cancel anytime.
            </p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-3 text-gray-300 text-sm font-sans">
                <Check className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                <span>50 credits every month</span>
              </li>
              <li className="flex items-start gap-3 text-gray-300 text-sm font-sans">
                <Check className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                <span>Just $0.40 per photo</span>
              </li>
              <li className="flex items-start gap-3 text-gray-300 text-sm font-sans">
                <Check className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                <span>Cancel anytime</span>
              </li>
            </ul>
            <Link
              href="/pricing"
              className="block text-center bg-white text-gray-900 hover:bg-gray-100 font-sans font-medium px-4 py-3 rounded-lg transition-all duration-300"
            >
              View Pricing
            </Link>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-white/5 backdrop-blur-sm p-12 lg:p-16 rounded-2xl border border-white/10">
          <h3 className="font-serif text-white text-3xl lg:text-4xl font-normal mb-4">
            Ready to restore your memories?
          </h3>
          <p className="font-sans text-gray-400 text-lg font-light mb-8 max-w-2xl mx-auto">
            Start free. No credit card required.
          </p>
          <Link
            href="/sign-up"
            className="inline-block bg-white text-gray-900 font-sans font-medium px-8 py-4 rounded-lg text-base hover:bg-gray-100 hover:scale-105 hover:shadow-xl transition-all duration-300"
          >
            Get 3 Free Credits
          </Link>
        </div>
      </div>
    </section>
  );
}
