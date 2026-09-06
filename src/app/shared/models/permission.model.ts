/**
 * Mirrors the Java `Permission` entity.
 */
export class Permission {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;

  constructor(data?: Partial<Permission>) {
    Object.assign(this, data);
  }
}