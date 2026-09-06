/**
 * Mirrors the Java `DiscountType` enum.
 */
export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',
  AMOUNT = 'AMOUNT',
}

/**
 * Mirrors the Java `Promotion` entity.
 */
export class Promotion {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  startDate: Date;
  endDate: Date;
  limit?: number;
  discountType: DiscountType;
  discountValue: number;
  maxDiscount?: number;
  minOrderAmount?: number;

  constructor(data?: Partial<Promotion>) {
    Object.assign(this, data);
  }
}