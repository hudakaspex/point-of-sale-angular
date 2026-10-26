import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Attribute } from '../models/attribute.model';
import { AttributeValue } from '../models/attribute-value.model';

export interface AttributeInput {
  name: string;
  values: string[];
}

@Injectable({ providedIn: 'root' })
export class AttributeService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  private dummyStore: Attribute[] | null = null;

  private ensureStore(): Attribute[] {
    if (this.dummyStore) return this.dummyStore;
    this.dummyStore = this.seedDummy();
    return this.dummyStore;
  }

  private seedDummy(): Attribute[] {
    const mk = (id: string, name: string, vals: string[]): Attribute =>
      ({ id, name, values: vals.map((v, i) => ({ id: `${id}-v${i + 1}`, value: v, attribute: { id, name } as any } as AttributeValue)) } as unknown as Attribute);
    return [
      mk('attr-color', 'Color', ['Red', 'Black', 'White', 'Navy', 'Titanium']),
      mk('attr-size', 'Size', ['XS', 'S', 'M', 'L', 'XL']),
      mk('attr-storage', 'Storage', ['64GB', '128GB', '256GB', '512GB', '1TB']),
      mk('attr-material', 'Material', ['Aluminum', 'Titanium', 'Leather', 'Silicone']),
      mk('attr-ram', 'RAM', ['8GB', '16GB', '32GB']),
      mk('attr-connectivity', 'Connectivity', ['Wi-Fi', 'Wi-Fi + Cellular', 'GPS']),
    ];
  }

  list(): Observable<Attribute[]> {
    return this.http.get<Attribute[]>(`${this.base}/attributes`).pipe(
      tap(list => { if (list?.length) this.dummyStore = list as Attribute[]; }),
      catchError(() => of(this.ensureStore().map(a => ({ ...a, values: [...(a.values ?? [])] } as Attribute))))
    );
  }

  get(id: string): Observable<Attribute> {
    return this.http.get<Attribute>(`${this.base}/attributes/${id}`).pipe(
      catchError(() => {
        const found = this.ensureStore().find(a => a.id === id);
        return of(found ? ({ ...found, values: [...(found.values ?? [])] } as Attribute) : ({ id, name: '', values: [] } as any));
      })
    );
  }

  create(dto: AttributeInput): Observable<Attribute> {
    return this.http.post<Attribute>(`${this.base}/attributes`, dto).pipe(
      catchError(() => {
        const store = this.ensureStore();
        const id = 'attr-' + dto.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now().toString(36);
        const attr: Attribute = {
          id,
          name: dto.name.trim(),
          values: dto.values.map((v, i) => ({ id: `${id}-v${i + 1}-${Date.now().toString(36)}`, value: v.trim(), attribute: { id, name: dto.name.trim() } as any } as AttributeValue)),
        } as Attribute;
        store.unshift(attr);
        return of(attr);
      })
    );
  }

  update(id: string, dto: AttributeInput): Observable<Attribute> {
    return this.http.put<Attribute>(`${this.base}/attributes/${id}`, dto).pipe(
      catchError(() => {
        const store = this.ensureStore();
        const idx = store.findIndex(a => a.id === id);
        if (idx >= 0) {
          const attr: Attribute = {
            id,
            name: dto.name.trim(),
            values: dto.values.map((v, i) => ({ id: `${id}-v${i + 1}-${Date.now().toString(36)}`, value: v.trim(), attribute: { id, name: dto.name.trim() } as any } as AttributeValue)),
          } as Attribute;
          store[idx] = attr;
          return of(attr);
        }
        return of({ id, name: dto.name, values: [] } as any);
      })
    );
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/attributes/${id}`).pipe(
      catchError(() => {
        const store = this.ensureStore();
        const idx = store.findIndex(a => a.id === id);
        if (idx >= 0) store.splice(idx, 1);
        return of(void 0);
      })
    );
  }

  existsByName(name: string, excludeId?: string): boolean {
    const n = name.trim().toLowerCase();
    return this.ensureStore().some(a => a.name.trim().toLowerCase() === n && a.id !== excludeId);
  }
}
