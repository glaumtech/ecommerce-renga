export type OrderStatus = 'Pending' | 'Accepted' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Processing';

export interface OrderItem {
  name: string;
  qty: number;
  price?: number;
}

export interface Order {
  id: string;
  date: string;
  total: number;
  status: OrderStatus | string;
  items: OrderItem[];
}

export interface ShippingAddress {
  name: string;
  email: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
}

export interface AdminOrder extends Order {
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  staffNotes?: string;
  createdAt?: string;
  shippingFee?: number;
}

export const PAYMENT_METHOD_COD = 'Cash on Delivery';
export const SHIPPING_FEE = 60;

export interface CheckoutPayload {
  firstName: string;
  lastName: string;
  email?: string;
  mobile: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  paymentMethod: string;
  items: { productId: number; quantity: number }[];
}

export function normalizeOrderStatus(status: string): OrderStatus {
  if (status === 'Processing') {
    return 'Pending';
  }
  return status as OrderStatus;
}

export function orderStatusProgress(status: string): number {
  const normalized = normalizeOrderStatus(status);
  switch (normalized) {
    case 'Pending':
      return 15;
    case 'Accepted':
      return 40;
    case 'Shipped':
      return 75;
    case 'Delivered':
      return 100;
    case 'Cancelled':
      return 0;
    default:
      return 15;
  }
}

export function orderStatusMessage(status: string): string {
  const normalized = normalizeOrderStatus(status);
  switch (normalized) {
    case 'Pending':
      return 'Your order has been placed and is waiting for validation.';
    case 'Accepted':
      return 'Staff has accepted your order and is hand-packing the sacred elements.';
    case 'Shipped':
      return 'Hand-packaged parcel is currently dispatched and shipping.';
    case 'Delivered':
      return 'Your sacred shipment has arrived at your address.';
    case 'Cancelled':
      return 'This order has been cancelled.';
    default:
      return 'Your order is being processed.';
  }
}
