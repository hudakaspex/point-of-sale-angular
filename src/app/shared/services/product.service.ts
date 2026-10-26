import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { Product } from '../models/product.model';
import { Category } from '../models/category.model';
import { Attribute } from '../models/attribute.model';

/** Payload used by the create/edit form (keeps the full nested entity out of the form). */
export interface VariantInput {
  sku: string;
  price: number;
  isActive?: boolean;
  attributeValueIds: string[];
}

export interface ProductInput {
  name: string;
  description?: string;
  isActive: boolean;
  categoryId?: string | null;
  variants: VariantInput[];
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  /** GET /products — degrades to an empty list when the backend is unavailable. */
  list(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.base}/products`).pipe(
      catchError(() => of([] as Product[]))
    );
  }

  /** GET /products/{id} */
  get(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.base}/products/${id}`);
  }

  /** POST /products */
  create(dto: ProductInput): Observable<Product> {
    return this.http.post<Product>(`${this.base}/products`, dto);
  }

  /** PUT /products/{id} */
  update(id: string, dto: ProductInput): Observable<Product> {
    return this.http.put<Product>(`${this.base}/products/${id}`, dto);
  }

  /** DELETE /products/{id} */
  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/products/${id}`);
  }

  /** GET /categories — used to populate the category dropdown. */
  listCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.base}/categories`).pipe(
      catchError(() => of([] as Category[]))
    );
  }

  /** GET /attributes — values come nested; falls back to demo data for UI preview. */
  listAttributes(): Observable<Attribute[]> {
    return this.http.get<Attribute[]>(`${this.base}/attributes`).pipe(
      catchError(() => of(this.dummyAttributes()))
    );
  }

  private dummyAttributes(): Attribute[] {
    return [
      { id: 'attr-color', name: 'Color', values: [{ id: 'av-red', value: 'Red', attribute: { id: 'attr-color', name: 'Color' } as any } as any, { id: 'av-black', value: 'Black', attribute: { id: 'attr-color', name: 'Color' } as any } as any, { id: 'av-white', value: 'White', attribute: { id: 'attr-color', name: 'Color' } as any } as any, { id: 'av-blue', value: 'Navy', attribute: { id: 'attr-color', name: 'Color' } as any } as any, { id: 'av-titanium', value: 'Titanium', attribute: { id: 'attr-color', name: 'Color' } as any } as any] } as Attribute,
      { id: 'attr-size', name: 'Size', values: [{ id: 'av-s', value: 'S' } as any, { id: 'av-m', value: 'M' } as any, { id: 'av-l', value: 'L' } as any, { id: 'av-xl', value: 'XL' } as any] } as Attribute,
      { id: 'attr-storage', name: 'Storage', values: [{ id: 'av-128', value: '128GB' } as any, { id: 'av-256', value: '256GB' } as any, { id: 'av-512', value: '512GB' } as any, { id: 'av-1tb', value: '1TB' } as any] } as Attribute,
      { id: 'attr-material', name: 'Material', values: [{ id: 'av-alum', value: 'Aluminum' } as any, { id: 'av-titan', value: 'Titanium' } as any, { id: 'av-leather', value: 'Leather' } as any] } as Attribute,
    ];
  }

  // ---- Display helpers (price/SKU live on Variant, not Product) ----

  /** Min–max price range derived from the product's variants. */
  priceRange(product: Product): string {
    const prices = (product.variants ?? [])
      .map((v) => Number(v.price))
      .filter((p) => !Number.isNaN(p));
    if (!prices.length) return '—';
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return min === max ? this.money(min) : `${this.money(min)} – ${this.money(max)}`;
  }

  /** Representative SKU (first variant) for the list view. */
  primarySku(product: Product): string {
    return product.variants?.[0]?.sku || '—';
  }

  /** Number of variants on the product. */
  variantCount(product: Product): number {
    return product.variants?.length ?? 0;
  }

  /** Lowest variant price, used for numeric sorting. */
  minPrice(product: Product): number {
    const prices = (product.variants ?? [])
      .map((v) => Number(v.price))
      .filter((p) => !Number.isNaN(p));
    return prices.length ? Math.min(...prices) : 0;
  }

  private money(value: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  }
}
