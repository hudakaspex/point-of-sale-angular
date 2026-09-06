import type { Permission } from './permission.model';

/**
 * Mirrors the Java `Role` entity.
 */
export class Role {
  id: string;
  name: string;
  description?: string;
  isActive?: boolean;
  createdAt: Date;
  permissions: Permission[] = [];

  constructor(data?: Partial<Role>) {
    Object.assign(this, data);
  }
}