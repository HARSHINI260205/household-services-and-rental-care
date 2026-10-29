import React, { useState } from 'react';
import {
  INITIAL_TOOLS,
  INITIAL_SERVICES,
  INITIAL_TECHNICIANS,
  INITIAL_BOOKINGS,
  INITIAL_RENTALS,
  INITIAL_NOTIFICATIONS,
  INITIAL_COMPLAINTS
} from './data/mockData';
import {
  Tool,
  HouseholdService,
  Technician,
  ServiceBooking,
  ToolRental,
  GrievanceComplaint,
  NotificationItem,
  Role
} from './types';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ToolsCatalog } from './components/ToolsCatalog';
import { ServicesCatalog } from './components/ServicesCatalog';
import { TechnicianRecommendation } from './components/TechnicianRecommendation';
import { RentalCalculator } from './components/RentalCalculator';
import { CustomerDashboard } from './components/CustomerDashboard';
import { TechnicianHub } from './components/TechnicianHub';
import { AdminConsole } from './components/AdminConsole';
import { NotificationDrawer } from './components/NotificationDrawer';
import { ChatAssistant } from './components/ChatAssistant';
import { Footer } from './components/Footer';
import { CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

export default function App() {
  // App States
  const [activeRole, setActiveRole] = useState<Role>('CUSTOMER');
  const [currentTab, setCurrentTab] = useState<string>('tools');
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState<boolean>(false);

  // Core Data Collections
  const [tools, setTools] = useState<Tool[]>(INITIAL_TOOLS);
  const [services, setServices] = useState<HouseholdService[]>(INITIAL_SERVICES);
  const [technicians, setTechnicians] = useState<Technician[]>(INITIAL_TECHNICIANS);
  const [bookings, setBookings] = useState<ServiceBooking[]>(INITIAL_BOOKINGS);
  const [rentals, setRentals] = useState<ToolRental[]>(INITIAL_RENTALS);
  const [complaints, setComplaints] = useState<GrievanceComplaint[]>(INITIAL_COMPLAINTS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  // Quick State Passing
  const [preselectedToolForCalc, setPreselectedToolForCalc] = useState<Tool | undefined>(undefined);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3800);
  };

  const addNotification = (title: string, message: string, type: NotificationItem['type']) => {
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title,
      message,
      type,
      timestamp: 'Just now',
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // 1. Tool Rental Action
  const handleRentTool = (data: {
    tool: Tool;
    startDate: string;
    endDate: string;
    rentalDays: number;
    paymentMethod: 'UPI' | 'CARD' | 'CASH';
  }) => {
    // Decrement tool available stock
    setTools(prev =>
      prev.map(t =>
        t.id === data.tool.id
          ? { ...t, availableQuantity: Math.max(0, t.availableQuantity - 1) }
          : t
      )
    );

    const rentalAmount = data.tool.dailyRate * data.rentalDays;
    const totalAmount = rentalAmount + data.tool.securityDeposit;

    const newRental: ToolRental = {
      id: Math.floor(500 + Math.random() * 900),
      customerName: 'Priya Sharma',
      customerEmail: 'customer@smart.com',
      customerPhone: '+91 98765 00003',
      toolId: data.tool.id,
      toolName: data.tool.name,
      toolImageUrl: data.tool.imageUrl,
      startDate: data.startDate,
      endDate: data.endDate,
      rentalDays: data.rentalDays,
      dailyRate: data.tool.dailyRate,
      rentalAmount,
      securityDeposit: data.tool.securityDeposit,
      lateFee: 0,
      damageCharge: 0,
      totalAmount,
      refundableDeposit: data.tool.securityDeposit,
      status: 'ACTIVE',
      paymentStatus: 'PAID',
      paymentMethod: data.paymentMethod,
      transactionId: `TXN-RENT-${Math.floor(1000000 + Math.random() * 9000000)}`,
      createdAt: new Date().toISOString()
    };

    setRentals(prev => [newRental, ...prev]);

    addNotification(
      `Tool Leased: ${data.tool.name}`,
      `Your reservation for ${data.rentalDays} days has been confirmed. Stock was decremented.`,
      'RENTAL'
    );

    showToast(`Successfully leased ${data.tool.name}! Stock decremented.`);
  };

  // 2. Household Service Booking Action
  const handleBookService = (data: {
    service: HouseholdService;
    technicianId: number;
    technicianName: string;
    bookingDate: string;
    bookingTime: string;
    location: string;
    description: string;
    paymentMethod: 'CASH' | 'UPI' | 'CARD';
  }) => {
    const newBooking: ServiceBooking = {
      id: Math.floor(100 + Math.random() * 900),
      customerName: 'Priya Sharma',
      customerEmail: 'customer@smart.com',
      customerPhone: '+91 98765 00003',
      technicianId: data.technicianId,
      technicianName: data.technicianName,
      serviceId: data.service.id,
      serviceName: data.service.name,
      bookingDate: data.bookingDate,
      bookingTime: data.bookingTime,
      location: data.location,
      description: data.description,
      status: 'PENDING',
      estimatedAmount: data.service.basePrice,
      paymentStatus: data.paymentMethod === 'UPI' ? 'PAID' : 'PENDING',
      paymentMethod: data.paymentMethod,
      transactionId: data.paymentMethod === 'UPI' ? `TXN-SRV-${Math.floor(1000000 + Math.random() * 9000000)}` : undefined,
      createdAt: new Date().toISOString()
    };

    setBookings(prev => [newBooking, ...prev]);

    addNotification(
      `Service Appointment Created`,
      `Scheduled ${data.service.name} with ${data.technicianName} on ${data.bookingDate}.`,
      'BOOKING'
    );

    showToast(`Appointment booked with ${data.technicianName}!`);
  };

  // 3. Customer Booking Cancel
  const handleCancelBooking = (bookingId: number) => {
    setBookings(prev =>
      prev.map(b => (b.id === bookingId ? { ...b, status: 'CANCELLED' } : b))
    );
    addNotification('Booking Cancelled', `Service booking #JOB-${bookingId} was cancelled.`, 'BOOKING');
    showToast(`Booking #JOB-${bookingId} cancelled.`, 'info');
  };

  // 4. Customer Requests Tool Return
  const onRequestToolReturn = (rentalId: number) => {
    setRentals(prev =>
      prev.map(r => (r.id === rentalId ? { ...r, status: 'RETURN_REQUESTED' } : r))
    );
    addNotification(
      'Return Requested',
      `Return inspection scheduled for rental lease #LEAS-${rentalId}.`,
      'RENTAL'
    );
    showToast(`Return requested for lease #LEAS-${rentalId}. Awaiting admin inspection.`);
  };

  // 5. Admin Processes Return & Refunds Escrow Deposit
  const handleProcessToolReturn = (rentalId: number, damageCharge: number, adminNotes: string) => {
    const targetRental = rentals.find(r => r.id === rentalId);
    if (!targetRental) return;

    // Restock the tool quantity
    setTools(prev =>
      prev.map(t =>
        t.id === targetRental.toolId
          ? { ...t, availableQuantity: Math.min(t.totalQuantity, t.availableQuantity + 1) }
          : t
      )
    );

    const netRefund = Math.max(0, targetRental.securityDeposit - (targetRental.lateFee + damageCharge));

    setRentals(prev =>
      prev.map(r =>
        r.id === rentalId
          ? {
              ...r,
              status: 'RETURNED',
              damageCharge,
              refundableDeposit: netRefund,
              actualReturnDate: new Date().toISOString().split('T')[0]
            }
          : r
      )
    );

    addNotification(
      'Deposit Refund Processed',
      `Rental #LEAS-${rentalId} completed. Net refund of ₹${netRefund} processed. Inventory restocked!`,
      'PAYMENT'
    );

    showToast(`Return processed! ₹${netRefund} deposit refunded and inventory restocked.`);
  };

  // 6. Technician Updates Booking Status
  const handleUpdateJobStatus = (bookingId: number, status: 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED') => {
    setBookings(prev =>
      prev.map(b => (b.id === bookingId ? { ...b, status } : b))
    );
    addNotification(
      `Job Status Updated: ${status}`,
      `Work order #JOB-${bookingId} is now ${status}.`,
      'BOOKING'
    );
    showToast(`Job status updated to ${status}.`);
  };

  // 7. Technician Records On-Site Cash/UPI Payment
  const handleRecordCashPayment = (bookingId: number) => {
    const txn = `RCPT-CASH-${Math.floor(100000 + Math.random() * 900000)}`;
    setBookings(prev =>
      prev.map(b =>
        b.id === bookingId
          ? { ...b, paymentStatus: 'PAID', paymentMethod: 'CASH', transactionId: txn }
          : b
      )
    );
    addNotification(
      'Payment Settled On-Site',
      `Receipt ${txn} generated for completed service #JOB-${bookingId}.`,
      'PAYMENT'
    );
    showToast(`Payment receipt ${txn} generated and settled!`);
  };

  // 8. Technician Toggles Weekly Availability
  const handleToggleAvailability = (day: string) => {
    setTechnicians(prev =>
      prev.map(tech =>
        tech.id === 1 // Muthu Vel
          ? {
              ...tech,
              availability: tech.availability.map(a =>
                a.day === day ? { ...a, available: !a.available } : a
              )
            }
          : tech
      )
    );
    showToast(`Availability for ${day} updated.`);
  };

  // 9. Admin Approves/Rejects Technician
  const handleApproveTechnician = (techId: number, status: 'APPROVED' | 'REJECTED') => {
    setTechnicians(prev =>
      prev.map(t => (t.id === techId ? { ...t, verificationStatus: status } : t))
    );
    showToast(`Technician verification status set to ${status}.`);
  };

  // 10. Admin Adds New Tool
  const handleAddTool = (newToolData: Omit<Tool, 'id'>) => {
    const newTool: Tool = {
      ...newToolData,
      id: Math.max(...tools.map(t => t.id), 0) + 1
    };
    setTools(prev => [newTool, ...prev]);
    showToast(`New equipment "${newTool.name}" added to rental fleet!`);
  };

  // 11. Customer Submits Review
  const handleSubmitReview = (bookingId: number, rating: number, comment: string) => {
    setBookings(prev =>
      prev.map(b =>
        b.id === bookingId
          ? { ...b, rating, reviewComment: comment }
          : b
      )
    );

    // Update technician rating
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
      setTechnicians(prev =>
        prev.map(t => {
          if (t.id === booking.technicianId) {
            const newTotal = t.totalReviews + 1;
            const newAvg = Math.round(((t.averageRating * t.totalReviews + rating) / newTotal) * 100) / 100;
            return { ...t, averageRating: newAvg, totalReviews: newTotal };
          }
          return t;
        })
      );
    }

    showToast(`Thank you! Your ${rating}★ review has been recorded.`);
  };

  // 12. Grievance Complaint Submission
  const handleSubmitComplaint = (data: { bookingId?: number; subject: string; description: string }) => {
    const newComplaint: GrievanceComplaint = {
      id: Math.floor(900 + Math.random() * 900),
      bookingId: data.bookingId,
      subject: data.subject,
      description: data.description,
      status: 'OPEN',
      createdAt: new Date().toISOString()
    };
    setComplaints(prev => [newComplaint, ...prev]);
    addNotification('Support Ticket Raised', `Ticket #TCK-${newComplaint.id} is queued for admin review.`, 'SYSTEM');
    showToast(`Grievance ticket #TCK-${newComplaint.id} submitted.`);
  };

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;
  const activeRentalsCount = rentals.filter(r => r.status === 'ACTIVE').length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-amber-500 selection:text-white">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-300">
          <div className="bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 text-xs font-semibold flex items-center gap-2.5">
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Primary Top Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        activeRole={activeRole}
        setActiveRole={setActiveRole}
        unreadCount={unreadNotificationsCount}
        onOpenNotifications={() => setIsNotificationDrawerOpen(true)}
        activeRentalsCount={activeRentalsCount}
        tools={tools}
        services={services}
        onSelectToolFromSearch={tool => {
          setPreselectedToolForCalc(tool);
          setCurrentTab('tools');
          showToast(`Found: ${tool.name}. Opening tool details.`, 'info');
        }}
        onSelectServiceFromSearch={service => {
          setCurrentTab('services');
          showToast(`Found: ${service.name}. Opening service details.`, 'info');
        }}
      />

      {/* Hero Showcase (Always visible on tools & services home views) */}
      {(currentTab === 'tools' || currentTab === 'services') && (
        <Hero
          onExploreTools={() => setCurrentTab('tools')}
          onExploreServices={() => setCurrentTab('services')}
          onOpenMatcher={() => setCurrentTab('matcher')}
        />
      )}

      {/* Main App Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        
        {/* TAB 1: TOOLS & EQUIPMENT CATALOG */}
        {currentTab === 'tools' && (
          <ToolsCatalog
            tools={tools}
            onRentTool={handleRentTool}
            onOpenDepositCalculator={tool => {
              setPreselectedToolForCalc(tool);
              setCurrentTab('calculator');
            }}
          />
        )}

        {/* TAB 2: HOUSEHOLD SERVICES CATALOG */}
        {currentTab === 'services' && (
          <ServicesCatalog
            services={services}
            technicians={technicians}
            onBookService={handleBookService}
            onOpenMatcher={serviceId => {
              setCurrentTab('matcher');
            }}
          />
        )}

        {/* TAB 3: PRO GPS & RULE-BASED MATCHING */}
        {currentTab === 'matcher' && (
          <TechnicianRecommendation
            technicians={technicians}
            services={services}
            onSelectTechnicianToBook={(tech, serviceName) => {
              const matchedService = services.find(s => s.name === serviceName) || services[0];
              handleBookService({
                service: matchedService,
                technicianId: tech.id,
                technicianName: tech.name,
                bookingDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                bookingTime: '11:00 AM',
                location: `${tech.city} Residential Area`,
                description: `Fast dispatch match for ${serviceName}`,
                paymentMethod: 'CASH'
              });
              setCurrentTab('my-activity');
            }}
          />
        )}

        {/* TAB 4: TRANSPARENT DEPOSIT & LATE FEE CALCULATOR */}
        {currentTab === 'calculator' && (
          <RentalCalculator
            tools={tools}
            preselectedTool={preselectedToolForCalc}
            onSelectToolForRent={tool => {
              setPreselectedToolForCalc(tool);
              setCurrentTab('tools');
            }}
          />
        )}

        {/* TAB 5: CUSTOMER DASHBOARD ("MY ACTIVITY") */}
        {currentTab === 'my-activity' && (
          <CustomerDashboard
            bookings={bookings}
            rentals={rentals}
            complaints={complaints}
            onCancelBooking={handleCancelBooking}
            onRequestToolReturn={onRequestToolReturn}
            onSubmitReview={handleSubmitReview}
            onSubmitComplaint={handleSubmitComplaint}
          />
        )}

        {/* TAB 6: TECHNICIAN HUB (Specialist Mode) */}
        {currentTab === 'tech-hub' && (
          <TechnicianHub
            technician={technicians[0]} // Muthu Vel
            bookings={bookings}
            onUpdateStatus={handleUpdateJobStatus}
            onRecordCashPayment={handleRecordCashPayment}
            onToggleAvailability={handleToggleAvailability}
          />
        )}

        {/* TAB 7: ADMIN CONSOLE (Governance & Approvals) */}
        {currentTab === 'admin' && (
          <AdminConsole
            tools={tools}
            services={services}
            technicians={technicians}
            rentals={rentals}
            bookings={bookings}
            complaints={complaints}
            onApproveTechnician={handleApproveTechnician}
            onProcessToolReturn={handleProcessToolReturn}
            onAddTool={handleAddTool}
            onAddService={newSvc => {
              const newServiceItem: HouseholdService = {
                ...newSvc,
                id: Math.max(...services.map(s => s.id), 0) + 1
              };
              setServices(prev => [newServiceItem, ...prev]);
              showToast(`Service "${newServiceItem.name}" added to catalog!`);
            }}
            onResolveComplaint={(id, response) => {
              setComplaints(prev =>
                prev.map(c => (c.id === id ? { ...c, status: 'RESOLVED', adminResponse: response } : c))
              );
              showToast(`Complaint #TCK-${id} resolved.`);
            }}
          />
        )}

      </main>

      {/* Notifications Drawer */}
      <NotificationDrawer
        isOpen={isNotificationDrawerOpen}
        onClose={() => setIsNotificationDrawerOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={() => {
          setNotifications(prev => prev.map(n => ({ ...n, read: true })));
          showToast('All notifications marked as read.', 'info');
        }}
      />

      {/* AI Assistant Floating Action Button & Chat Window */}
      <ChatAssistant onNavigateTab={setCurrentTab} />

      {/* Professional Footer */}
      <Footer onNavigate={setCurrentTab} />

    </div>
  );
}
