/**
 * Mirrors the Java `Category` entity. Self-referential tree (parent/children).
 */
export class Category {
  id!: string;
  name!: string;
  description?: string;
  parent?: Category;
  categories: Category[] = [];

  constructor(data?: Partial<Category>) {
    Object.assign(this, data);
  }
}