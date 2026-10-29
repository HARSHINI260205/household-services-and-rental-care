import React from 'react';
import { Wrench, Shield, CheckCircle2, Phone, Mail, MapPin } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white">
                <Wrench className="w-4 h-4" />
              </div>
              <span className="text-base font-extrabold tracking-tight">
                Craft<span className="text-amber-500">&</span>Care
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Full-service tool and commercial equipment rental combined with on-demand certified household technician matching.
            </p>
            <div className="text-[11px] text-slate-500 pt-1">
              Operated across Madurai, Bengaluru & Chennai metropolitan regions.
            </div>
          </div>

          {/* Quick links */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Tool & Equipment Fleet
            </h4>
            <ul className="space-y-1.5 text-slate-400">
              <li>
                <button onClick={() => onNavigate('tools')} className="hover:text-amber-400 transition-colors">
                  Cordless Rotary Drills & Hammers
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('tools')} className="hover:text-amber-400 transition-colors">
                  3000 PSI Pressure Washers
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('tools')} className="hover:text-amber-400 transition-colors">
                  Green Beam 360° Laser Levels
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('tools')} className="hover:text-amber-400 transition-colors">
                  5kVA Silent Inverter Generators
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('calculator')} className="hover:text-amber-400 transition-colors">
                  Security Deposit Refund Calculator
                </button>
              </li>
            </ul>
          </div>

          {/* Household Services */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Specialized Trades
            </h4>
            <ul className="space-y-1.5 text-slate-400">
              <li>
                <button onClick={() => onNavigate('services')} className="hover:text-amber-400 transition-colors">
                  Certified Electrician Diagnostics
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('services')} className="hover:text-amber-400 transition-colors">
                  AC Deep Chemical Jet Wash & Gas
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('services')} className="hover:text-amber-400 transition-colors">
                  Acoustic Pipeline Leak Detection
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('services')} className="hover:text-amber-400 transition-colors">
                  Mechanized Deep Home Sanitization
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('matcher')} className="hover:text-amber-400 transition-colors">
                  Rule-Based Pro Distance Matcher
                </button>
              </li>
            </ul>
          </div>

          {/* Escrow Guarantee */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Customer Guarantees
            </h4>
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 space-y-1.5">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
                <Shield className="w-4 h-4" />
                <span>100% Escrow Protection</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-normal">
                All tool security deposits are held in automated escrow and refunded immediately upon inspection.
              </p>
            </div>
            <div className="text-[11px] text-slate-500">
              Support Desk: support@craftandcare.com · Mon–Sat 8:00 AM – 8:00 PM
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} Craft & Care Platforms. All rights reserved.
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Terms of Equipment Lease</span>
            <span>·</span>
            <span>Late Fee Policies</span>
            <span>·</span>
            <span>Trade Verification Standards</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
