import type { User } from './user.model';

/**
 * Abstract base class mirroring the Java `Person` entity.
 * `Customer` and `Employee` extend this class.
 */
export abstract class Person {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: Date;
  phone: string;
  email: string;
  user?: User;

  constructor(data?: Partial<Person>) {
    Object.assign(this, data);
  }
}