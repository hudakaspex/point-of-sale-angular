import type { User } from './user.model';
import type { Tax } from './tax.model';
import type { Promotion } from './promotion.model';
import type { Customer } from './customer.model';

/**
 * Mirrors the Java `OrderStatus` enum.
 */
export enum OrderStatus {
  CREATED = 'CREATED',
  PAID = 'PAID',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

/**
 * Mirrors the Java `Order` entity.
 * Note: the Java entity has no `orderItems` collection — items are linked
 * via `OrderItem.order`.
 */
export class Order {
  id: string;
  date: Date;
  status: OrderStatus;
  number: string;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  serviceCharge: number;
  totalAmount: number;
  createdBy?: User;
  tax?: Tax;
  promotion?: Promotion;
  customer?: Customer;

  constructor(data?: Partial<Order>) {
    Object.assign(this, data);
  }
}