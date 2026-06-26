export enum Category {
  FRUIT_PLANTS = "Fruit Plants",
  FLOWER_PLANTS = "Flower Plants",
  TREES = "Trees",
  INDOOR_PLANTS = "Indoor Plants",
  SEEDS = "Seeds",
  COMPOST_FERTILIZERS = "Compost & Fertilizers",
  GARDENING_TOOLS = "Gardening Tools",
  POTS_PLANTERS = "Pots & Planters"
}

export interface Review {
  id: string;
  reviewerName: string;
  reviewerEmail: string;
  rating: number; // e.g. 1 to 5 stars
  comment: string;
  date: string;
}

export interface Plant {
  id: string;
  name: string;
  category: Category;
  price: number;
  discount: number; // e.g., 10 for 10%
  careInstructions: string;
  imageUrls: string[];
  stock: number;
  season: string; // e.g., "All Season", "Winter", "Summer"
  description: string;
  isTrending?: boolean;
  vendorId: string; // The supplying vendor
  isAdminApproved?: boolean; // Admin visibility control
  adminDiscount?: number; // Additional discount set by Admin
  reviews?: Review[];
}

export interface Vendor {
  id: string;
  name: string;
  nurseryName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  status: "pending" | "approved" | "rejected";
  joinDate: string;
  commissionPaidPercent: number; // Admin setup commission e.g. 15%
  proposedDeliveryCharge?: number; // Proposed by vendor
  deliveryChargeStatus?: "pending" | "approved" | "rejected"; 
  approvedDeliveryCharge?: number; // Active/approved or overridden delivery charge
  photograph?: string; // base64 or link
  password?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  photograph?: string; // base64 or URL
  joinDate: string;
}

export interface ReturnRequest {
  id: string;
  orderId: string;
  reason: string;
  photoProofUrl: string; // Base64 or placeholder URL
  status: "pending" | "approved" | "rejected";
  requestDate: string;
  adminNotes?: string;
}

export interface OrderItem {
  plantId: string;
  name: string;
  price: number;
  discount: number;
  quantity: number;
  imageUrl: string;
  vendorId: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  total: number;
  status: "pending" | "assigned" | "packed" | "dispatched" | "delivered" | "cancelled";
  orderDate: string;
  assignedVendorId?: string; // Auto-assigned by distance/nearest/available
  paymentMethod: "UPI_PHONEPE" | "UPI_GPAY" | "UPI_PAYTM" | "QR_CODE";
  paymentStatus: "paid" | "refunded" | "pending";
  returnRequest?: ReturnRequest;
}

export interface AMCService {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  plan: "monthly" | "quarterly" | "yearly";
  services: string[]; // e.g., ["Watering", "Fertilizing", "Pest Control", "Garden Maintenance"]
  price: number;
  startDate: string;
  status: "active" | "cancelled" | "expired";
}

export interface DeliverySettings {
  id: string;
  freeDeliveryThreshold: number; // e.g., 499
  standardDeliveryCharge: number; // e.g., 49
  baseCommissionPercent: number; // e.g., 10
}

export interface UserSession {
  email: string;
  name: string;
  role: "customer" | "vendor" | "admin";
  vendorId?: string; // If role is vendor
}
