import type { Role } from './role.model';

/**
 * Mirrors the Java `User` entity (Spring Security `UserDetails`).
 */
export class User {
  id: string;
  fullname: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  roles: Role[] = [];

  constructor(data?: Partial<User>) {
    Object.assign(this, data);
  }
}