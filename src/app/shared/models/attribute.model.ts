import type { AttributeValue } from './attribute-value.model';

/**
 * Mirrors the Java `Attribute` entity.
 */
export class Attribute {
  id!: string;
  name!: string;
  values: AttributeValue[] = [];

  constructor(data?: Partial<Attribute>) {
    Object.assign(this, data);
  }
}