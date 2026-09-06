import { Person } from './person.model';

/**
 * Mirrors the Java `Customer` entity. Inherits all `Person` fields.
 */
export class Customer extends Person {
  constructor(data?: Partial<Customer>) {
    super(data);
  }
}