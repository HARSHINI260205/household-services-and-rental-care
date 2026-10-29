export type Role = 'CUSTOMER' | 'TECHNICIAN' | 'ADMIN';

export type BookingStatus = 'PENDING' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'REJECTED';

export type RentalStatus = 'PENDING' | 'CONFIRMED' | 'ACTIVE' | 'RETURN_REQUESTED' | 'RETURNED' | 'CANCELLED';

export type PaymentStatus = 'PENDING' | 'PAID' | 'REFUNDED' | 'FAILED';

export type PaymentMethod = 'CASH' | 'UPI' | 'CARD';

export type VerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Tool {
  id: number;
  name: string;
  category: string;
  description: string;
  dailyRate: number;
  securityDeposit: number;
  availableQuantity: number;
  totalQuantity: number;
  status: 'AVAILABLE' | 'MAINTENANCE' | 'DAMAGED' | 'UNAVAILABLE';
  imageUrl: string;
  specs: string[];
  powerSource: string;
  rating: number;
  reviewCount: number;
}

export interface HouseholdService {
  id: number;
  name: string;
  category: string;
  description: string;
  basePrice: number;
  estimatedHours: string;
  status: 'ACTIVE' | 'INACTIVE';
  popular: boolean;
  warranty: string;
  includedTasks: string[];
}

export interface TechnicianAvailability {
  day: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
  startTime: string;
  endTime: string;
  available: boolean;
}

export interface Technician {
  id: number;
  name: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  experienceYears: number;
  averageRating: number;
  totalReviews: number;
  verificationStatus: VerificationStatus;
  services: string[];
  avatarUrl?: string;
  availability: TechnicianAvailability[];
}

export interface ServiceBooking {
  id: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  technicianId: number;
  technicianName: string;
  serviceId: number;
  serviceName: string;
  bookingDate: string;
  bookingTime: string;
  location: string;
  description: string;
  status: BookingStatus;
  estimatedAmount: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  transactionId?: string;
  createdAt: string;
  rating?: number;
  reviewComment?: string;
}

export interface ToolRental {
  id: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  toolId: number;
  toolName: string;
  toolImageUrl?: string;
  startDate: string;
  endDate: string;
  actualReturnDate?: string;
  rentalDays: number;
  dailyRate: number;
  rentalAmount: number;
  securityDeposit: number;
  lateFee: number;
  damageCharge: number;
  totalAmount: number;
  refundableDeposit: number;
  status: RentalStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  transactionId?: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'BOOKING' | 'RENTAL' | 'PAYMENT' | 'ADMIN' | 'SYSTEM';
  timestamp: string;
  read: boolean;
}

export interface GrievanceComplaint {
  id: number;
  bookingId?: number;
  rentalId?: number;
  subject: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  adminResponse?: string;
  createdAt: string;
}
