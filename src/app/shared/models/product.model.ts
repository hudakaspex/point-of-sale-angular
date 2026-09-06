import type { Category } from './category.model';
import type { Variant } from './variant.model';

/**
 * Mirrors the Java `Product` entity.
 */
export class Product {
  id!: string;
  name!: string;
  description?: string;
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
  category?: Category;
  variants: Variant[] = [];

  constructor(data?: Partial<Product>) {
    Object.assign(this, data);
  }
}