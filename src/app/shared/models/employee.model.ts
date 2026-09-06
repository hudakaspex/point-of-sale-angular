import { Person } from './person.model';

/**
 * Mirrors the Java `Employee` entity. Inherits all `Person` fields.
 */
export class Employee extends Person {
  constructor(data?: Partial<Employee>) {
    super(data);
  }
}