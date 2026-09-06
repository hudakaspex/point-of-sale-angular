/**
 * Mirrors the Java `Tax` entity.
 */
export class Tax {
  id: string;
  name: string;
  rate: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(data?: Partial<Tax>) {
    Object.assign(this, data);
  }
}