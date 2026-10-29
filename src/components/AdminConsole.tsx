import React, { useState } from 'react';
import { Tool, HouseholdService, Technician, ToolRental, ServiceBooking, GrievanceComplaint } from '../types';
import { ShieldCheck, Users, Wrench, CheckCircle, XCircle, AlertTriangle, ArrowRight, PlusCircle, RefreshCw, DollarSign } from 'lucide-react';

interface AdminConsoleProps {
  tools: Tool[];
  services: HouseholdService[];
  technicians: Technician[];
  rentals: ToolRental[];
  bookings: ServiceBooking[];
  complaints: GrievanceComplaint[];
  onApproveTechnician: (techId: number, status: 'APPROVED' | 'REJECTED') => void;
  onProcessToolReturn: (rentalId: number, damageCharge: number, adminNotes: string) => void;
  onAddTool: (newTool: Omit<Tool, 'id'>) => void;
  onAddService: (newService: Omit<HouseholdService, 'id'>) => void;
  onResolveComplaint: (complaintId: number, response: string) => void;
}

export const AdminConsole: React.FC<AdminConsoleProps> = ({
  tools,
  services,
  technicians,
  rentals,
  bookings,
  complaints,
  onApproveTechnician,
  onProcessToolReturn,
  onAddTool,
  onAddService,
  onResolveComplaint
}) => {
  const [adminTab, setAdminTab] = useState<'METRICS' | 'RETURNS' | 'TECHNICIANS' | 'CATALOG'>('METRICS');

  // Return Processing Modal/State
  const [inspectRental, setInspectRental] = useState<ToolRental | null>(null);
  const [damageCharge, setDamageCharge] = useState<number>(0);
  const [adminNotes, setAdminNotes] = useState<string>('Tool inspected, fully functional and cleaned.');

  // New Tool Form
  const [showAddToolModal, setShowAddToolModal] = useState<boolean>(false);
  const [newToolName, setNewToolName] = useState<string>('');
  const [newToolCategory, setNewToolCategory] = useState<string>('Power Drills & Drivers');
  const [newToolDailyRate, setNewToolDailyRate] = useState<number>(120);
  const [newToolDeposit, setNewToolDeposit] = useState<number>(350);
  const [newToolQty, setNewToolQty] = useState<number>(2);

  // Financial Metrics Aggregations
  const serviceRevenue = bookings
    .filter(b => b.paymentStatus === 'PAID')
    .reduce((sum, b) => sum + b.estimatedAmount, 0);

  const rentalRevenue = rentals
    .filter(r => r.paymentStatus === 'PAID')
    .reduce((sum, r) => sum + r.rentalAmount + (r.lateFee || 0), 0);

  const activeDepositsHeld = rentals
    .filter(r => r.status === 'ACTIVE' || r.status === 'RETURN_REQUESTED')
    .reduce((sum, r) => sum + r.securityDeposit, 0);

  const totalGMV = serviceRevenue + rentalRevenue;

  const totalAvailableStock = tools.reduce((sum, t) => sum + t.availableQuantity, 0);
  const pendingRentalsToInspect = rentals.filter(r => r.status === 'RETURN_REQUESTED');
  const pendingTechApprovals = technicians.filter(t => t.verificationStatus === 'PENDING');

  const handleReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectRental) return;
    onProcessToolReturn(inspectRental.id, damageCharge, adminNotes);
    setInspectRental(null);
    setDamageCharge(0);
  };

  const handleCreateTool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newToolName.trim()) return;

    onAddTool({
      name: newToolName,
      category: newToolCategory,
      description: 'Commercial contractor grade tool tested and verified for rental.',
      dailyRate: newToolDailyRate,
      securityDeposit: newToolDeposit,
      availableQuantity: newToolQty,
      totalQuantity: newToolQty,
      status: 'AVAILABLE',
      imageUrl: '/src/assets/images/hero_craftsman_tools_1793286054079.jpg',
      specs: ['Commercial Spec', 'Certified Safe'],
      powerSource: '230V Standard',
      rating: 5.0,
      reviewCount: 1
    });

    setNewToolName('');
    setShowAddToolModal(false);
  };

  return (
    <div className="space-y-8">
      {/* Admin Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span>Platform Administration & Compliance Console</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight mt-1">
              Executive System Control
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Real-time audit log, escrow settlement, technician verification, and equipment inventory.
            </p>
          </div>

          {/* Sub Navigation */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700 text-xs font-semibold">
            <button
              onClick={() => setAdminTab('METRICS')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                adminTab === 'METRICS' ? 'bg-purple-600 text-white shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              Summary & Financials
            </button>
            <button
              onClick={() => setAdminTab('RETURNS')}
              className={`px-3 py-1.5 rounded-lg transition-colors relative ${
                adminTab === 'RETURNS' ? 'bg-purple-600 text-white shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              Tool Return Inspector
              {pendingRentalsToInspect.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 bg-amber-500 text-slate-950 font-bold rounded-full font-num text-[10px]">
                  {pendingRentalsToInspect.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setAdminTab('TECHNICIANS')}
              className={`px-3 py-1.5 rounded-lg transition-colors relative ${
                adminTab === 'TECHNICIANS' ? 'bg-purple-600 text-white shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              Tech Approvals
              {pendingTechApprovals.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 bg-purple-400 text-slate-950 font-bold rounded-full font-num text-[10px]">
                  {pendingTechApprovals.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setAdminTab('CATALOG')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                adminTab === 'CATALOG' ? 'bg-purple-600 text-white shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              Inventory Management
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: FINANCIALS & SYSTEM METRICS */}
      {adminTab === 'METRICS' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Service Revenue
              </span>
              <div className="text-2xl font-black text-slate-900 font-num mt-1">
                ₹{serviceRevenue.toLocaleString()}
              </div>
              <span className="text-[11px] text-emerald-600 font-medium">
                {bookings.filter(b => b.paymentStatus === 'PAID').length} Settled Bookings
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Tool Rental Usage Fees
              </span>
              <div className="text-2xl font-black text-slate-900 font-num mt-1">
                ₹{rentalRevenue.toLocaleString()}
              </div>
              <span className="text-[11px] text-amber-600 font-medium">
                {rentals.length} Tool Leases Recorded
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Escrow Deposits In Custody
              </span>
              <div className="text-2xl font-black text-emerald-600 font-num mt-1">
                ₹{activeDepositsHeld.toLocaleString()}
              </div>
              <span className="text-[11px] text-slate-500">
                100% Refundable Pending Return
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Available Tool Stock
              </span>
              <div className="text-2xl font-black text-purple-700 font-num mt-1">
                {totalAvailableStock} Units
              </div>
              <span className="text-[11px] text-slate-500">
                Across {tools.length} Equipment Varieties
              </span>
            </div>

          </div>

          {/* Recent Orders Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 mb-3">
                Latest Service Appointments
              </h3>
              <div className="divide-y divide-slate-100 text-xs">
                {bookings.slice(0, 4).map(b => (
                  <div key={b.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-800">{b.serviceName}</div>
                      <div className="text-slate-500">Customer: {b.customerName} · Pro: {b.technicianName}</div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold font-num text-slate-900 block">₹{b.estimatedAmount}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                        {b.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 mb-3">
                Active Tool Leases & Status
              </h3>
              <div className="divide-y divide-slate-100 text-xs">
                {rentals.slice(0, 4).map(r => (
                  <div key={r.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-800">{r.toolName}</div>
                      <div className="text-slate-500">{r.startDate} to {r.endDate} ({r.customerName})</div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold font-num text-slate-900 block">Deposit: ₹{r.securityDeposit}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold">
                        {r.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* VIEW 2: TOOL RETURN INSPECTOR & SETTLEMENT */}
      {adminTab === 'RETURNS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Tool Equipment Return & Deposit Settlement
              </h3>
              <p className="text-xs text-slate-500">
                Inspect equipment, calculate overdue late fees (1.5x daily rate), assess damage, and restock inventory.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {rentals
              .filter(r => r.status === 'RETURN_REQUESTED' || r.status === 'ACTIVE')
              .map(r => (
                <div
                  key={r.id}
                  className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{r.toolName}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          r.status === 'RETURN_REQUESTED'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {r.status === 'RETURN_REQUESTED' ? 'Ready For Inspection' : 'Lease Active'}
                      </span>
                    </div>
                    <div className="text-slate-500">
                      Rented by: <strong className="text-slate-700">{r.customerName}</strong> ({r.customerPhone})
                    </div>
                    <div className="text-slate-600 font-num">
                      Rental Period: {r.startDate} to {r.endDate} ({r.rentalDays} days) · Daily Rate: ₹{r.dailyRate}
                    </div>
                    <div className="text-emerald-700 font-bold font-num">
                      Held Deposit: ₹{r.securityDeposit}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setInspectRental(r);
                      setDamageCharge(0);
                    }}
                    className="px-4 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-lg shadow-sm transition-all self-end md:self-auto"
                  >
                    Inspect & Settle Return
                  </button>
                </div>
              ))}

            {rentals.filter(r => r.status === 'RETURN_REQUESTED' || r.status === 'ACTIVE').length === 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-500">
                No active or requested returns pending inspection.
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 3: TECHNICIAN VERIFICATION */}
      {adminTab === 'TECHNICIANS' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Technician Verification & Governance
            </h3>
            <p className="text-xs text-slate-500">
              Approve trade licenses and background screening before technicians appear in matching results.
            </p>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {technicians.map(tech => (
              <div key={tech.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{tech.name}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        tech.verificationStatus === 'APPROVED'
                          ? 'bg-emerald-50 text-emerald-700'
                          : tech.verificationStatus === 'PENDING'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {tech.verificationStatus}
                    </span>
                  </div>
                  <div className="text-slate-500">
                    {tech.city} · {tech.phone} · {tech.email} · {tech.experienceYears} yrs experience
                  </div>
                  <div className="text-slate-600">
                    Trade Skills: {tech.services.join(', ')}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {tech.verificationStatus === 'PENDING' ? (
                    <>
                      <button
                        onClick={() => onApproveTechnician(tech.id, 'APPROVED')}
                        className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
                      >
                        Approve License
                      </button>
                      <button
                        onClick={() => onApproveTechnician(tech.id, 'REJECTED')}
                        className="px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 rounded-lg"
                      >
                        Reject
                      </button>
                    </>
                  ) : (
                    <span className="text-slate-400 font-medium">Verified & Active</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 4: CATALOG & INVENTORY MANAGEMENT */}
      {adminTab === 'CATALOG' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Equipment Inventory & Stock Restock
              </h3>
              <p className="text-xs text-slate-500">
                Manage tool rental fleet, daily lease tariffs, and safety deposits.
              </p>
            </div>

            <button
              onClick={() => setShowAddToolModal(true)}
              className="px-4 py-2 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-lg shadow-sm flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add New Equipment</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tools.map(tool => (
              <div
                key={tool.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm flex items-start gap-3.5"
              >
                <img
                  src={tool.imageUrl}
                  alt={tool.name}
                  className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                />
                <div className="text-xs space-y-1 flex-1">
                  <span className="font-bold text-slate-900 block text-sm">{tool.name}</span>
                  <div className="text-slate-500">{tool.category}</div>
                  <div className="text-slate-700 font-num">
                    Rate: <strong>₹{tool.dailyRate}</strong> · Deposit: <strong>₹{tool.securityDeposit}</strong>
                  </div>
                  <div className="text-xs font-bold text-emerald-700 font-num pt-1">
                    Available Stock: {tool.availableQuantity} / {tool.totalQuantity} Units
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* INSPECT & RETURN MODAL */}
      {inspectRental && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider block">
                  Return Inspection & Escrow Settle
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Tool: {inspectRental.toolName}
                </h3>
              </div>
              <button
                onClick={() => setInspectRental(null)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleReturnSubmit} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="text-slate-500">
                  Customer: <strong className="text-slate-800">{inspectRental.customerName}</strong>
                </div>
                <div className="text-slate-700 font-num">
                  Held Security Deposit: <strong className="text-emerald-700">₹{inspectRental.securityDeposit}</strong>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Equipment Damage / Cleaning Deduction (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  max={inspectRental.securityDeposit}
                  value={damageCharge}
                  onChange={e => setDamageCharge(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 font-num text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Inspection Notes & Certification
                </label>
                <textarea
                  rows={2}
                  value={adminNotes}
                  onChange={e => setAdminNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              {/* Refund calculation preview */}
              <div className="p-3 bg-purple-50 text-purple-950 rounded-xl border border-purple-200 flex items-center justify-between font-num">
                <span>Calculated Refund to Customer:</span>
                <span className="text-base font-extrabold text-purple-800">
                  ₹{Math.max(0, inspectRental.securityDeposit - damageCharge)}
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setInspectRental(null)}
                  className="px-3.5 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg font-bold text-white bg-purple-700 hover:bg-purple-800 shadow-sm"
                >
                  Settle Deposit & Restock Equipment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD TOOL MODAL */}
      {showAddToolModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Add New Tool to Rental Fleet
              </h3>
              <button
                onClick={() => setShowAddToolModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTool} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Equipment Model Name
                </label>
                <input
                  type="text"
                  value={newToolName}
                  onChange={e => setNewToolName(e.target.value)}
                  placeholder="e.g. DeWalt 54V Cordless Concrete Breaker"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Equipment Category
                </label>
                <select
                  value={newToolCategory}
                  onChange={e => setNewToolCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                >
                  <option value="Power Drills & Drivers">Power Drills & Drivers</option>
                  <option value="Surface & Pressure Cleaners">Surface & Pressure Cleaners</option>
                  <option value="Measuring & Layout">Measuring & Layout</option>
                  <option value="Saws & Cutting">Saws & Cutting</option>
                  <option value="Garden & Landscaping">Garden & Landscaping</option>
                  <option value="Generators & Power Units">Generators & Power Units</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Daily Rate (₹)
                  </label>
                  <input
                    type="number"
                    min="50"
                    value={newToolDailyRate}
                    onChange={e => setNewToolDailyRate(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 font-num"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Security Deposit (₹)
                  </label>
                  <input
                    type="number"
                    min="100"
                    value={newToolDeposit}
                    onChange={e => setNewToolDeposit(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 font-num"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Initial Stock Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={newToolQty}
                  onChange={e => setNewToolQty(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 font-num"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddToolModal(false)}
                  className="px-3.5 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg font-bold text-white bg-purple-700 hover:bg-purple-800 shadow-sm"
                >
                  Publish To Fleet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
