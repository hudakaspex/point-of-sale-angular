import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { BadgeComponent } from '../../shared/components/ui/badge/badge.component';
import { ProductService } from '../../shared/services/product.service';
import { Product } from '../../shared/models/product.model';

type SortKey = 'name' | 'sku' | 'category' | 'price' | 'status' | 'createdAt';

@Component({
  selector: 'app-products',
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    PageBreadcrumbComponent,
    BadgeComponent,
  ],
  templateUrl: './products.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsComponent {
  readonly service = inject(ProductService);
  private readonly destroyRef = inject(DestroyRef);

  // Data
  readonly products = signal<Product[]>([]);
  readonly loading = signal(true);
  readonly error = signal(false);

  // Toolbar / table state
  readonly search = signal('');
  readonly sortKey = signal<SortKey>('name');
  readonly sortDir = signal<'asc' | 'desc'>('asc');
  readonly page = signal(1);
  readonly pageSize = signal(10);
  readonly pageSizes = [10, 25, 50];

  // Delete confirmation
  readonly deleteTarget = signal<Product | null>(null);

  // ---- Derived list state ----
  private readonly filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    const all = this.products();
    if (!q) return all;
    return all.filter((p) => {
      const inName = (p.name ?? '').toLowerCase().includes(q);
      const inDesc = (p.description ?? '').toLowerCase().includes(q);
      const inSku = (p.variants ?? []).some((v) => (v.sku ?? '').toLowerCase().includes(q));
      const inCat = (p.category?.name ?? '').toLowerCase().includes(q);
      return inName || inDesc || inSku || inCat;
    });
  });

  readonly sorted = computed(() => {
    const dir = this.sortDir() === 'asc' ? 1 : -1;
    return [...this.filtered()].sort((a, b) => {
      const av = this.sortValue(a);
      const bv = this.sortValue(b);
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
  });

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.sorted().length / this.pageSize())),
  );

  readonly paged = computed(() => {
    const size = this.pageSize();
    const start = (this.page() - 1) * size;
    return this.sorted().slice(start, start + size);
  });

  readonly rangeStart = computed(() => {
    const length = this.sorted().length;
    return length === 0 ? 0 : (this.page() - 1) * this.pageSize() + 1;
  });

  readonly rangeEnd = computed(() =>
    Math.min(this.page() * this.pageSize(), this.sorted().length),
  );

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.loading.set(true);
    this.error.set(false);
    this.service.list().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data) => {
        this.products.set(data ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.products.set([]);
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }

  // ---- Filtering, sorting, paging (client-side) ----
  private sortValue(p: Product): string | number {
    switch (this.sortKey()) {
      case 'name':
        return (p.name ?? '').toLowerCase();
      case 'sku':
        return (this.service.primarySku(p) ?? '').toLowerCase();
      case 'category':
        return (p.category?.name ?? '').toLowerCase();
      case 'price':
        return this.service.minPrice(p);
      case 'status':
        return p.isActive ? 1 : 0;
      case 'createdAt':
        return p.createdAt ? new Date(p.createdAt).getTime() : 0;
      default:
        return 0;
    }
  }

  onSearchChange(value: string): void {
    this.search.set(value);
    this.page.set(1);
  }

  toggleSort(key: SortKey): void {
    if (this.sortKey() === key) {
      this.sortDir.update((dir) => (dir === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortKey.set(key);
      this.sortDir.set('asc');
    }
    this.page.set(1);
  }

  isSorted(key: SortKey): boolean {
    return this.sortKey() === key;
  }

  changePage(n: number): void {
    if (n < 1 || n > this.totalPages()) return;
    this.page.set(n);
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.page.set(1);
  }

  // ---- Delete flow ----
  openDelete(p: Product): void {
    this.deleteTarget.set(p);
  }

  cancelDelete(): void {
    this.deleteTarget.set(null);
  }

  confirmDelete(): void {
    const target = this.deleteTarget();
    if (!target) return;
    const drop = (list: Product[]) => list.filter((x) => x.id !== target.id);
    this.service.remove(target.id).subscribe({
      next: () => {
        this.products.update(drop);
        this.deleteTarget.set(null);
        if (this.page() > this.totalPages()) this.page.set(this.totalPages());
      },
      error: () => {
        // If the backend is unavailable, still drop the row locally so the UI stays usable.
        this.products.update(drop);
        this.deleteTarget.set(null);
      },
    });
  }
}
