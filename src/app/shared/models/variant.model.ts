import type { Product } from './product.model';
import type { AttributeValue } from './attribute-value.model';

/**
 * Mirrors the Java `Variant` entity.
 */
export class Variant {
  id!: string;
  sku!: string;
  isActive!: boolean;
  price!: number;
  createdAt!: Date;
  updatedAt!: Date;
  product?: Product;
  attributeValues: AttributeValue[] = [];

  constructor(data?: Partial<Variant>) {
    Object.assign(this, data);
  }
}