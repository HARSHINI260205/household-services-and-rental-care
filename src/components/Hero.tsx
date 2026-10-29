import React, { useState } from 'react';
import { Wrench, Shield, CheckCircle2, Star, ArrowRight, Clock, Zap, Sparkles, Tag, Copy, Check, Gift, X } from 'lucide-react';
import { ImageWithFallback } from './ImageWithFallback';

interface HeroProps {
  onExploreTools: () => void;
  onExploreServices: () => void;
  onOpenMatcher: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onExploreTools,
  onExploreServices,
  onOpenMatcher
}) => {
  const [bannerVisible, setBannerVisible] = useState<boolean>(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white pb-14 border-b border-slate-800">
      
      {/* VIBRANT FULL-WIDTH FESTIVE PROMOTIONAL BANNER */}
      {bannerVisible && (
        <aside aria-label="Festive promotion" className="relative z-30 w-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 text-white shadow-lg shadow-orange-500/20 border-b border-amber-400/40 animate-in fade-in duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-3.5">
            <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
              
              {/* Left Highlight */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 text-center md:text-left">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/20 backdrop-blur-md font-extrabold uppercase text-[11px] tracking-wider text-white shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-200 animate-spin-slow" />
                  <span>Festive Mega Carnival</span>
                </span>
                <span className="font-bold text-white text-xs sm:text-sm">
                  Flat 25% OFF On All Tool Leases + ₹150 OFF Service Visits!
                </span>
                <span className="hidden lg:inline text-orange-200">·</span>
                <span className="hidden lg:inline text-white/90">
                  Free safety gloves & on-site delivery on rentals ≥ 3 days.
                </span>
              </div>

              {/* Right Coupon & Actions */}
              <div className="flex items-center gap-2.5 shrink-0">
                {/* Promo Code Box */}
                <div className="flex items-center bg-slate-950/40 backdrop-blur-md rounded-lg p-1 border border-white/25">
                  <span className="px-2 py-0.5 font-num font-bold text-yellow-300 text-xs tracking-wider">
                    FESTIVE25
                  </span>
                  <button
                    onClick={() => handleCopyCode('FESTIVE25')}
                    className="px-2 py-0.5 rounded bg-white text-slate-950 font-bold hover:bg-yellow-200 transition-colors flex items-center gap-1 text-[11px]"
                    title="Copy promo code"
                  >
                    {copiedCode === 'FESTIVE25' ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Primary Banner CTA */}
                <button
                  onClick={onExploreTools}
                  className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-900 text-white font-bold transition-all shadow-xs flex items-center gap-1 active:scale-95 text-[11px] whitespace-nowrap"
                >
                  <span>Claim Discount</span>
                  <ArrowRight className="w-3 h-3" />
                </button>

                {/* Close Button */}
                <button
                  onClick={() => setBannerVisible(false)}
                  className="p-1 rounded-md text-white/80 hover:text-white hover:bg-black/20 transition-colors ml-1"
                  title="Dismiss banner"
                  aria-label="Dismiss banner"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>
        </aside>
      )}

      {/* Subtle atmospheric workshop radial gradient */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-8 sm:pt-10">
        
        {/* Split Hero: Left Content, Right Visual */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-6">
            
            {/* Catchy Domain Kicker (unboxed clean text) */}
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 tracking-wide">
              <span className="flex items-center gap-1.5 uppercase font-bold text-amber-300">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Next-Gen Home & Workshop Ecosystem
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-300">Fast 60-Min Dispatch</span>
            </div>

            {/* Display Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight lg:leading-tight">
              Industrial Grade Tools To Rent.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200">
                Certified Pros
              </span>{' '}
              For Any Household Fix.
            </h1>

            {/* Subtitle */}
            <p className="text-slate-300 text-base sm:text-lg max-w-2xl leading-relaxed">
              Equip your DIY projects with commercial rotary hammers, pressure cleaners, and generators—or instantly book verified electricians, plumbers, and technicians with transparent pricing and 100% refundable deposits.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onExploreTools}
                className="px-5 py-3 text-sm font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-orange-500 rounded-lg hover:from-amber-300 hover:to-orange-400 transition-all shadow-md shadow-orange-500/20 flex items-center gap-2 active:scale-95"
              >
                <Wrench className="w-4 h-4 text-slate-950" />
                <span>Explore Tool Catalog</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </button>

              <button
                onClick={onExploreServices}
                className="px-5 py-3 text-sm font-semibold text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors flex items-center gap-2 active:scale-95"
              >
                <span>Book Household Service</span>
              </button>

              <button
                onClick={onOpenMatcher}
                className="px-4 py-3 text-xs font-semibold text-amber-300 hover:text-amber-200 hover:underline flex items-center gap-1.5"
              >
                <span>Find Nearby Mechanic</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Trust indicators */}
            <div className="pt-2 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Zero Hidden Fees</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-amber-400" />
                <span>100% Safe Deposit Escrow</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-sky-400" />
                <span>Same-Day Equipment Pickup</span>
              </div>
            </div>
          </div>

          {/* Right Visual Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl bg-slate-800/60 group">
              <ImageWithFallback
                src="https://upload.wikimedia.org/wikipedia/commons/4/43/Woodworker_using_sliding_mitre_saw.jpg"
                alt="Professional woodwork and power tools in workshop"
                fallbackCategory="workshop"
                className="w-full h-80 sm:h-96 group-hover:scale-102 transition-transform duration-500"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent pointer-events-none" />

              {/* Floating Highlight Card */}
              <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-3.5 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-bold text-white">Live Inventory Available</span>
                  </div>
                  <span className="font-num text-amber-400 font-bold">From ₹110/day</span>
                </div>
                <div className="mt-2 text-slate-300 flex items-center justify-between text-[11px]">
                  <span>Rotary Drills · Pressure Washers · Tile Cutters</span>
                  <button
                    onClick={onExploreTools}
                    className="text-amber-400 hover:text-amber-300 font-semibold underline ml-2 shrink-0"
                  >
                    View Stock
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4-Column KPI strip in full-width row below split */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-num">4.92★</div>
            <div className="text-xs text-slate-400 mt-1">Verified Customer Rating</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-num">₹0 Loss</div>
            <div className="text-xs text-slate-400 mt-1">Instant Deposit Refund Policy</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-num">45+ Models</div>
            <div className="text-xs text-slate-400 mt-1">Commercial Tool Inventory</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-orange-400 font-num">1,240+</div>
            <div className="text-xs text-slate-400 mt-1">Household Repairs Completed</div>
          </div>
        </div>

      </div>
    </section>
  );
};
