import React, { useState, useRef, useEffect } from 'react';
import {
  Wrench,
  Bell,
  User,
  ShieldCheck,
  HardHat,
  Search,
  X,
  ArrowRight,
  Sparkles,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { Role, Tool, HouseholdService } from '../types';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  activeRole: Role;
  setActiveRole: (role: Role) => void;
  unreadCount: number;
  onOpenNotifications: () => void;
  activeRentalsCount: number;
  tools: Tool[];
  services: HouseholdService[];
  onSelectToolFromSearch: (tool: Tool) => void;
  onSelectServiceFromSearch: (service: HouseholdService) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  activeRole,
  setActiveRole,
  unreadCount,
  onOpenNotifications,
  activeRentalsCount,
  tools,
  services,
  onSelectToolFromSearch,
  onSelectServiceFromSearch
}) => {
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileSearchExpanded, setIsMobileSearchExpanded] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut (press '/' or 'Ctrl+K' to focus search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key === 'k')) &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        setIsSearchOpen(true);
        const searchInput = document.getElementById('global-search-input');
        searchInput?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter matching tools & services
  const query = searchQuery.trim().toLowerCase();

  const matchingTools = query
    ? tools.filter(
        t =>
          t.name.toLowerCase().includes(query) ||
          t.category.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query) ||
          t.powerSource.toLowerCase().includes(query)
      )
    : [];

  const matchingServices = query
    ? services.filter(
        s =>
          s.name.toLowerCase().includes(query) ||
          s.category.toLowerCase().includes(query) ||
          s.description.toLowerCase().includes(query)
      )
    : [];

  const totalResults = matchingTools.length + matchingServices.length;

  const popularSuggestions = [
    { label: 'Cordless Rotary Drill', type: 'tool', query: 'Rotary Hammer' },
    { label: '3000 PSI Pressure Washer', type: 'tool', query: 'Pressure Washer' },
    { label: 'AC Foam Jet Wash & Gas', type: 'service', query: 'AC Repair' },
    { label: 'Master Electrician', type: 'service', query: 'Electrician' },
    { label: 'Plumbing Leak Fix', type: 'service', query: 'Plumbing' },
    { label: '5kVA Inverter Generator', type: 'tool', query: 'Generator' }
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 lg:gap-8">
        
        {/* Zone 1: Single Brand Wordmark */}
        <button
          onClick={() => setCurrentTab('tools')}
          className="flex items-center gap-2.5 text-left group focus:outline-none shrink-0"
        >
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-sm shadow-orange-500/20 group-hover:scale-105 transition-transform">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-extrabold tracking-tight text-slate-900 whitespace-nowrap block leading-tight">
              Craft<span className="text-amber-600">&</span>Care
            </span>
            <span className="text-[10px] font-semibold text-slate-600 tracking-wider uppercase block">
              Tools · Services · Pros
            </span>
          </div>
        </button>

        {/* Global Search Bar (Center Desktop) */}
        <div ref={searchContainerRef} className="relative flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="global-search-input"
              type="text"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder="Search tools, equipment, or services..."
              className="w-full pl-9 pr-14 py-2 text-xs bg-slate-100/80 hover:bg-slate-100 border border-slate-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white transition-all text-slate-900 placeholder:text-slate-400"
            />
            {searchQuery ? (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setIsSearchOpen(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-slate-400 border border-slate-200 px-1.5 py-0.5 rounded bg-white pointer-events-none font-num">
                /
              </span>
            )}
          </div>

          {/* Interactive Live Search Dropdown */}
          {isSearchOpen && (
            <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden z-50 text-xs max-h-[460px] flex flex-col animate-in fade-in zoom-in-95 duration-150">
              
              {/* Header inside dropdown */}
              <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-slate-500 text-[11px]">
                {query ? (
                  <span>
                    Found <strong className="text-slate-900">{totalResults}</strong> results for &ldquo;{searchQuery}&rdquo;
                  </span>
                ) : (
                  <span>Popular searches & quick categories</span>
                )}
                <span className="text-[10px] text-slate-400">Esc to close</span>
              </div>

              <div className="overflow-y-auto divide-y divide-slate-100 p-2">
                
                {/* When Query is empty: show quick suggestions */}
                {!query && (
                  <div className="p-2 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-1">
                      Trending Searches
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {popularSuggestions.map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setSearchQuery(item.query);
                            setIsSearchOpen(true);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-amber-50 hover:text-amber-800 text-slate-700 font-medium text-xs transition-colors flex items-center gap-1.5"
                        >
                          {item.type === 'tool' ? (
                            <Wrench className="w-3 h-3 text-amber-600" />
                          ) : (
                            <Sparkles className="w-3 h-3 text-blue-600" />
                          )}
                          <span>{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Matching Tools Section */}
                {matchingTools.length > 0 && (
                  <div className="p-2 space-y-1">
                    <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-600 flex items-center justify-between">
                      <span>Tools & Equipment ({matchingTools.length})</span>
                      <button
                        onClick={() => {
                          setCurrentTab('tools');
                          setIsSearchOpen(false);
                        }}
                        className="text-slate-400 hover:text-slate-600 lowercase font-normal"
                      >
                        view all tools →
                      </button>
                    </div>

                    {matchingTools.map(tool => (
                      <div
                        key={tool.id}
                        onClick={() => {
                          onSelectToolFromSearch(tool);
                          setIsSearchOpen(false);
                          setSearchQuery('');
                        }}
                        className="group flex items-center justify-between p-2 rounded-xl hover:bg-amber-50/60 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={tool.imageUrl}
                            alt={tool.name}
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <div className="font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                              {tool.name}
                            </div>
                            <div className="text-[11px] text-slate-500 font-num">
                              {tool.category} · <span className="text-slate-800 font-bold">₹{tool.dailyRate}/day</span>
                              <span className="text-emerald-700 ml-1.5 font-semibold">
                                ({tool.availableQuantity} in stock)
                              </span>
                            </div>
                          </div>
                        </div>

                        <button className="px-2.5 py-1 rounded-md text-[11px] font-bold text-amber-800 bg-amber-100/70 group-hover:bg-amber-500 group-hover:text-white transition-all">
                          Rent Tool
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Matching Services Section */}
                {matchingServices.length > 0 && (
                  <div className="p-2 space-y-1">
                    <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-600 flex items-center justify-between">
                      <span>Household Services ({matchingServices.length})</span>
                      <button
                        onClick={() => {
                          setCurrentTab('services');
                          setIsSearchOpen(false);
                        }}
                        className="text-slate-400 hover:text-slate-600 lowercase font-normal"
                      >
                        view all services →
                      </button>
                    </div>

                    {matchingServices.map(svc => (
                      <div
                        key={svc.id}
                        onClick={() => {
                          onSelectServiceFromSearch(svc);
                          setIsSearchOpen(false);
                          setSearchQuery('');
                        }}
                        className="group flex items-center justify-between p-2 rounded-xl hover:bg-blue-50/60 cursor-pointer transition-colors"
                      >
                        <div className="space-y-0.5">
                          <div className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                            {svc.name}
                          </div>
                          <div className="text-[11px] text-slate-500 font-num">
                            {svc.category} · <span className="text-slate-800 font-bold">From ₹{svc.basePrice}</span> · {svc.estimatedHours}
                          </div>
                        </div>

                        <button className="px-2.5 py-1 rounded-md text-[11px] font-bold text-blue-800 bg-blue-100/70 group-hover:bg-blue-600 group-hover:text-white transition-all">
                          Book Pro
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Empty State when Query yields 0 results */}
                {query && totalResults === 0 && (
                  <div className="p-6 text-center text-slate-500 space-y-2">
                    <p className="font-bold text-slate-700">No tools or services matched &ldquo;{searchQuery}&rdquo;</p>
                    <p className="text-[11px] text-slate-400">
                      Try searching for rotary hammer, pressure washer, AC repair, electrician, or plumbing.
                    </p>
                  </div>
                )}

              </div>
            </div>
          )}
        </div>

        {/* Zone 2: Navigation Links (single-line, clean text with active states) */}
        <nav className="hidden lg:flex items-center gap-1">
          <button
            onClick={() => setCurrentTab('tools')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              currentTab === 'tools'
                ? 'bg-amber-50 text-amber-700 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Tools
          </button>

          <button
            onClick={() => setCurrentTab('services')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              currentTab === 'services'
                ? 'bg-amber-50 text-amber-700 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Services
          </button>

          <button
            onClick={() => setCurrentTab('matcher')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              currentTab === 'matcher'
                ? 'bg-amber-50 text-amber-700 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Pro Matching
          </button>

          <button
            onClick={() => setCurrentTab('calculator')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              currentTab === 'calculator'
                ? 'bg-amber-50 text-amber-700 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Calculator
          </button>

          <button
            onClick={() => setCurrentTab('my-activity')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors relative ${
              currentTab === 'my-activity'
                ? 'bg-amber-50 text-amber-700 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Activity
            {activeRentalsCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-bold bg-amber-500 text-white rounded-full font-num">
                {activeRentalsCount}
              </span>
            )}
          </button>

          {activeRole === 'TECHNICIAN' && (
            <button
              onClick={() => setCurrentTab('tech-hub')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap transition-colors ${
                currentTab === 'tech-hub'
                  ? 'bg-blue-600 text-white'
                  : 'text-blue-700 bg-blue-50 hover:bg-blue-100'
              }`}
            >
              Mechanic Hub
            </button>
          )}

          {activeRole === 'ADMIN' && (
            <button
              onClick={() => setCurrentTab('admin')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap transition-colors ${
                currentTab === 'admin'
                  ? 'bg-purple-700 text-white'
                  : 'text-purple-700 bg-purple-50 hover:bg-purple-100'
              }`}
            >
              Admin Console
            </button>
          )}
        </nav>

        {/* Zone 3: Actions & Role Selector */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Mobile Search Toggle Icon */}
          <button
            onClick={() => setIsMobileSearchExpanded(!isMobileSearchExpanded)}
            className="md:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            title="Search"
            aria-label="Toggle search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Notifications Button */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            title="Notifications"
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full" />
            )}
          </button>

          {/* Interactive Role Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors"
            >
              {activeRole === 'CUSTOMER' && (
                <>
                  <User className="w-3.5 h-3.5 text-amber-600" />
                  <span className="text-slate-700 hidden sm:inline">Customer Mode</span>
                  <span className="text-slate-700 sm:hidden">Priya</span>
                </>
              )}
              {activeRole === 'TECHNICIAN' && (
                <>
                  <HardHat className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-blue-700 hidden sm:inline">Pro: Muthu Vel</span>
                  <span className="text-blue-700 sm:hidden">Muthu</span>
                </>
              )}
              {activeRole === 'ADMIN' && (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                  <span className="text-purple-700 hidden sm:inline">Admin Mode</span>
                  <span className="text-purple-700 sm:hidden">Admin</span>
                </>
              )}
              <span className="text-[10px] text-slate-400">▼</span>
            </button>

            {roleMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 text-xs"
                onMouseLeave={() => setRoleMenuOpen(false)}
              >
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  Switch Active Persona
                </div>
                
                <button
                  onClick={() => {
                    setActiveRole('CUSTOMER');
                    setRoleMenuOpen(false);
                    if (currentTab === 'tech-hub' || currentTab === 'admin') {
                      setCurrentTab('tools');
                    }
                  }}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 transition-colors ${
                    activeRole === 'CUSTOMER' ? 'font-bold text-amber-700 bg-amber-50/50' : 'text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-amber-600" />
                    <div>
                      <div>Customer View</div>
                      <div className="text-[10px] text-slate-600 font-normal">Priya Sharma</div>
                    </div>
                  </div>
                  {activeRole === 'CUSTOMER' && <span className="text-amber-600 font-bold">✓</span>}
                </button>

                <button
                  onClick={() => {
                    setActiveRole('TECHNICIAN');
                    setCurrentTab('tech-hub');
                    setRoleMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 transition-colors ${
                    activeRole === 'TECHNICIAN' ? 'font-bold text-blue-700 bg-blue-50/50' : 'text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <HardHat className="w-4 h-4 text-blue-600" />
                    <div>
                      <div>Mechanic View</div>
                      <div className="text-[10px] text-slate-600 font-normal">Muthu Vel (AC / Electrician)</div>
                    </div>
                  </div>
                  {activeRole === 'TECHNICIAN' && <span className="text-blue-600 font-bold">✓</span>}
                </button>

                <button
                  onClick={() => {
                    setActiveRole('ADMIN');
                    setCurrentTab('admin');
                    setRoleMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 transition-colors ${
                    activeRole === 'ADMIN' ? 'font-bold text-purple-700 bg-purple-50/50' : 'text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-purple-600" />
                    <div>
                      <div>Administrator</div>
                      <div className="text-[10px] text-slate-600 font-normal">System Governance Console</div>
                    </div>
                  </div>
                  {activeRole === 'ADMIN' && <span className="text-purple-600 font-bold">✓</span>}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expandable Mobile Search Bar */}
      {isMobileSearchExpanded && (
        <div className="md:hidden border-t border-slate-100 p-3 bg-white space-y-2 animate-in slide-in-from-top-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search tools or household services..."
              className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {query && totalResults > 0 && (
            <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 bg-white border border-slate-200 rounded-lg text-xs">
              {matchingTools.map(t => (
                <div
                  key={t.id}
                  onClick={() => {
                    onSelectToolFromSearch(t);
                    setIsMobileSearchExpanded(false);
                    setSearchQuery('');
                  }}
                  className="p-2.5 flex items-center justify-between"
                >
                  <span className="font-bold text-slate-900">{t.name}</span>
                  <span className="font-bold text-amber-700 font-num">₹{t.dailyRate}/d</span>
                </div>
              ))}
              {matchingServices.map(s => (
                <div
                  key={s.id}
                  onClick={() => {
                    onSelectServiceFromSearch(s);
                    setIsMobileSearchExpanded(false);
                    setSearchQuery('');
                  }}
                  className="p-2.5 flex items-center justify-between"
                >
                  <span className="font-bold text-slate-900">{s.name}</span>
                  <span className="font-bold text-blue-700 font-num">₹{s.basePrice}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Mobile Bottom Tab Bar */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-100 py-2 bg-slate-50 text-xs text-slate-600">
        <button
          onClick={() => setCurrentTab('tools')}
          className={`py-1 px-2 rounded font-medium ${currentTab === 'tools' ? 'text-amber-700 font-bold' : ''}`}
        >
          Tools
        </button>
        <button
          onClick={() => setCurrentTab('services')}
          className={`py-1 px-2 rounded font-medium ${currentTab === 'services' ? 'text-amber-700 font-bold' : ''}`}
        >
          Services
        </button>
        <button
          onClick={() => setCurrentTab('matcher')}
          className={`py-1 px-2 rounded font-medium ${currentTab === 'matcher' ? 'text-amber-700 font-bold' : ''}`}
        >
          Matching
        </button>
        <button
          onClick={() => setCurrentTab('my-activity')}
          className={`py-1 px-2 rounded font-medium ${currentTab === 'my-activity' ? 'text-amber-700 font-bold' : ''}`}
        >
          Activity
        </button>
      </div>
    </header>
  );
};
