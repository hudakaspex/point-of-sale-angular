import type { Order } from './order.model';
import type { Variant } from './variant.model';

/**
 * Mirrors the Java `OrderItem` entity.
 */
export class OrderItem {
  id: string;
  price: number;
  quantity: number;
  discount?: number;
  order?: Order;
  variant?: Variant;

  constructor(data?: Partial<OrderItem>) {
    Object.assign(this, data);
  }
}