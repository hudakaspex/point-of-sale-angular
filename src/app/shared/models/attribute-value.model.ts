import type { Attribute } from './attribute.model';

/**
 * Mirrors the Java `AttributeValue` entity.
 */
export class AttributeValue {
  id!: string;
  value!: string;
  attribute?: Attribute;

  constructor(data?: Partial<AttributeValue>) {
    Object.assign(this, data);
  }
}