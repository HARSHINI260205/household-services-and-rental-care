import React, { useState } from 'react';
import { Tool, ToolRental } from '../types';
import { Search, Filter, ShieldCheck, Zap, Calendar, ArrowRight, Check, X, Info } from 'lucide-react';
import { ImageWithFallback } from './ImageWithFallback';

interface ToolsCatalogProps {
  tools: Tool[];
  onRentTool: (rentalData: {
    tool: Tool;
    startDate: string;
    endDate: string;
    rentalDays: number;
    paymentMethod: 'UPI' | 'CARD' | 'CASH';
  }) => void;
  onOpenDepositCalculator: (tool?: Tool) => void;
}

export const ToolsCatalog: React.FC<ToolsCatalogProps> = ({
  tools,
  onRentTool,
  onOpenDepositCalculator
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeRentalModalTool, setActiveRentalModalTool] = useState<Tool | null>(null);

  // Modal Rental Form State
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0];
  const [startDate, setStartDate] = useState<string>(today);
  const [endDate, setEndDate] = useState<string>(tomorrow);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'CASH'>('UPI');
  const [promoCode, setPromoCode] = useState<string>('FESTIVE25');
  const [promoApplied, setPromoApplied] = useState<boolean>(true);
  const [bookingSuccess, setBookingSuccess] = useState<boolean>(false);

  const categories = [
    'ALL',
    'Power Drills & Drivers',
    'Surface & Pressure Cleaners',
    'Measuring & Layout',
    'Saws & Cutting',
    'Garden & Landscaping',
    'Generators & Power Units'
  ];

  const filteredTools = tools.filter(tool => {
    const matchesCategory = selectedCategory === 'ALL' || tool.category === selectedCategory;
    const matchesQuery =
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  // Calculate rental duration in days
  const startD = new Date(startDate);
  const endD = new Date(endDate);
  const diffTime = Math.max(0, endD.getTime() - startD.getTime());
  const calculatedDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);

  const handleOpenRental = (tool: Tool) => {
    setActiveRentalModalTool(tool);
    setBookingSuccess(false);
  };

  const handleConfirmRental = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRentalModalTool) return;

    onRentTool({
      tool: activeRentalModalTool,
      startDate,
      endDate,
      rentalDays: calculatedDays,
      paymentMethod
    });

    setBookingSuccess(true);
    setTimeout(() => {
      setActiveRentalModalTool(null);
      setBookingSuccess(false);
    }, 1600);
  };

  return (
    <div className="space-y-8">
      {/* Catalog Header & Controls */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="text-xs font-bold text-amber-600 uppercase tracking-wider">
              Tool & Heavy Equipment Fleet
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              Available For Rent Today
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Industrial grade tools with fully refundable security deposits upon timely return.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[280px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search drills, washers, mowers, saws..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-slate-800"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Categories Segmented Bar */}
        <div className="pt-4 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 text-xs font-semibold mr-1 flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" />
            Category:
          </span>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-white shadow-sm font-semibold'
                  : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
              }`}
            >
              {cat === 'ALL' ? 'All Equipment' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTools.map(tool => (
          <div
            key={tool.id}
            className="group bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
          >
            {/* Tool Image Container */}
            <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
              <ImageWithFallback
                src={tool.imageUrl}
                alt={tool.name}
                fallbackCategory="tool"
                className="w-full h-full group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

              {/* Stock Status Label */}
              <div className="absolute top-3 left-3 text-[11px] font-bold px-2.5 py-1 rounded-md backdrop-blur-md text-white bg-slate-900/80">
                {tool.availableQuantity > 0 ? (
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>{tool.availableQuantity} In Stock</span>
                  </span>
                ) : (
                  <span className="text-amber-300">Out of Stock</span>
                )}
              </div>

              {/* Category overlay */}
              <div className="absolute bottom-2.5 left-3 text-[11px] font-semibold text-slate-200">
                {tool.powerSource}
              </div>
            </div>

            {/* Tool Body */}
            <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <div className="text-[11px] font-bold text-amber-600 uppercase tracking-wider mb-1">
                  {tool.category}
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-1">
                  {tool.name}
                </h3>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                  {tool.description}
                </p>

                {/* Key Specs tags */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {tool.specs.slice(0, 2).map((sp, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded"
                    >
                      {sp}
                    </span>
                  ))}
                </div>
              </div>

              {/* Pricing & Actions */}
              <div className="pt-3 border-t border-slate-100">
                <div className="flex items-baseline justify-between mb-3">
                  <div>
                    <span className="text-xl font-extrabold text-slate-900 font-num">
                      ₹{tool.dailyRate}
                    </span>
                    <span className="text-xs text-slate-600"> / day</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-600 block">Security Deposit</span>
                    <span className="text-xs font-bold text-slate-700 font-num">
                      ₹{tool.securityDeposit} <span className="text-emerald-700 font-normal">· Refundable</span>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onOpenDepositCalculator(tool)}
                    className="px-2.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    <Info className="w-3.5 h-3.5" />
                    <span>Calc Fees</span>
                  </button>

                  <button
                    onClick={() => handleOpenRental(tool)}
                    disabled={tool.availableQuantity <= 0}
                    className={`px-3 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                      tool.availableQuantity > 0
                        ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm shadow-amber-500/20 active:scale-95'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <span>Rent Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTools.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto">
          <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-slate-900">No tools found</h4>
          <p className="text-xs text-slate-500 mt-1">
            Try adjusting your search query or selecting a different equipment category.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('ALL');
              setSearchQuery('');
            }}
            className="mt-4 px-4 py-1.5 text-xs font-semibold text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* RENTAL CHECKOUT MODAL */}
      {activeRentalModalTool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                  Equipment Lease Agreement
                </span>
                <h3 className="text-base font-bold text-white line-clamp-1">
                  Rent: {activeRentalModalTool.name}
                </h3>
              </div>
              <button
                onClick={() => setActiveRentalModalTool(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {bookingSuccess ? (
              <div className="p-8 text-center space-y-3">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-extrabold text-slate-900">
                  Rental Booking Confirmed!
                </h4>
                <p className="text-xs text-slate-600 max-w-xs mx-auto">
                  Your reservation for <span className="font-semibold">{activeRentalModalTool.name}</span> has been confirmed. Stock was decremented and receipt generated.
                </p>
              </div>
            ) : (
              <form onSubmit={handleConfirmRental} className="p-6 space-y-5">
                
                {/* Tool Brief */}
                <div className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <ImageWithFallback
                    src={activeRentalModalTool.imageUrl}
                    alt={activeRentalModalTool.name}
                    fallbackCategory="tool"
                    className="w-14 h-14 rounded-lg shrink-0 border border-slate-200"
                  />
                  <div className="text-xs">
                    <div className="font-bold text-slate-900">{activeRentalModalTool.name}</div>
                    <div className="text-slate-600 font-num mt-0.5">
                      Rate: ₹{activeRentalModalTool.dailyRate}/day · Deposit: ₹{activeRentalModalTool.securityDeposit}
                    </div>
                  </div>
                </div>

                {/* Rental Dates */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      min={today}
                      onChange={e => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      min={startDate}
                      onChange={e => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                      required
                    />
                  </div>
                </div>

                {/* Payment Method */}
                <div className="text-xs">
                  <label className="font-semibold text-slate-700 block mb-1.5">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['UPI', 'CARD', 'CASH'] as const).map(method => (
                      <button
                        type="button"
                        key={method}
                        onClick={() => setPaymentMethod(method)}
                        className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${
                          paymentMethod === method
                            ? 'border-amber-500 bg-amber-50/50 text-amber-700'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {method === 'UPI' && 'UPI / QR'}
                        {method === 'CARD' && 'Credit / Debit'}
                        {method === 'CASH' && 'Cash on Pickup'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Festive Coupon Input */}
                <div className="text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-700">
                      Promo / Festive Code
                    </label>
                    {promoApplied && (
                      <span className="text-emerald-700 font-bold text-[11px]">
                        ✓ FESTIVE25 Applied (25% OFF)
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={e => setPromoCode(e.target.value.toUpperCase())}
                      placeholder="Enter promo code (e.g. FESTIVE25)"
                      className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-num font-bold uppercase bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    />
                    <button
                      type="button"
                      onClick={() => setPromoApplied(promoCode.trim() === 'FESTIVE25')}
                      className="px-3 py-1.5 text-xs font-bold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      {promoApplied ? 'Remove' : 'Apply'}
                    </button>
                  </div>
                </div>

                {/* Transparent Calculation Breakdown */}
                {(() => {
                  const baseRent = calculatedDays * activeRentalModalTool.dailyRate;
                  const discount = promoApplied ? Math.round(baseRent * 0.25) : 0;
                  const finalRent = baseRent - discount;
                  const finalPayable = finalRent + activeRentalModalTool.securityDeposit;

                  return (
                    <div className="bg-slate-900 text-slate-200 p-4 rounded-xl text-xs space-y-2">
                      <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                        Transparent Price Breakdown
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>
                          Rental Duration ({calculatedDays} {calculatedDays === 1 ? 'day' : 'days'})
                        </span>
                        <span className="font-num text-white">
                          ₹{baseRent}
                        </span>
                      </div>
                      {promoApplied && (
                        <div className="flex justify-between text-yellow-300 font-semibold">
                          <span>Festive Discount (25% OFF)</span>
                          <span className="font-num">- ₹{discount}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-slate-300">
                        <span>Refundable Security Deposit</span>
                        <span className="font-num text-emerald-400">
                          ₹{activeRentalModalTool.securityDeposit}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline font-bold text-white text-sm">
                        <span>Total Initial Payable</span>
                        <span className="font-num text-amber-400 text-base">
                          ₹{finalPayable}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 pt-1">
                        * Full ₹{activeRentalModalTool.securityDeposit} deposit is credited back upon equipment return.
                      </div>
                    </div>
                  );
                })()}

                {/* Submit button */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveRentalModalTool(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 rounded-lg shadow-sm active:scale-95 transition-all"
                  >
                    Confirm & Lease Equipment
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}
    </div>
  );
};
