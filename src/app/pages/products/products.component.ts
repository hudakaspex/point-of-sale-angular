import { Component, inject } from '@angular/core';
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
})
export class ProductsComponent {
  readonly service = inject(ProductService);

  products: Product[] = [];
  loading = true;
  error = false;

  // Toolbar / table state
  search = '';
  sortKey: SortKey = 'name';
  sortDir: 'asc' | 'desc' = 'asc';
  page = 1;
  pageSize = 10;
  pageSizes = [10, 25, 50];

  // Delete confirmation
  deleteTarget: Product | null = null;

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.loading = true;
    this.error = false;
    this.service.list().subscribe({
      next: (data) => {
        this.products = data ?? [];
        this.loading = false;
      },
      error: () => {
        this.products = [];
        this.error = true;
        this.loading = false;
      },
    });
  }

  // ---- Filtering, sorting, paging (client-side) ----
  get filtered(): Product[] {
    const q = this.search.trim().toLowerCase();
    if (!q) return this.products;
    return this.products.filter((p) => {
      const inName = (p.name ?? '').toLowerCase().includes(q);
      const inDesc = (p.description ?? '').toLowerCase().includes(q);
      const inSku = (p.variants ?? []).some((v) => (v.sku ?? '').toLowerCase().includes(q));
      const inCat = (p.category?.name ?? '').toLowerCase().includes(q);
      return inName || inDesc || inSku || inCat;
    });
  }

  get sorted(): Product[] {
    const dir = this.sortDir === 'asc' ? 1 : -1;
    return [...this.filtered].sort((a, b) => {
      const av = this.sortValue(a);
      const bv = this.sortValue(b);
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.sorted.length / this.pageSize));
  }

  get paged(): Product[] {
    const start = (this.page - 1) * this.pageSize;
    return this.sorted.slice(start, start + this.pageSize);
  }

  get rangeStart(): number {
    return this.sorted.length === 0 ? 0 : (this.page - 1) * this.pageSize + 1;
  }

  get rangeEnd(): number {
    return Math.min(this.page * this.pageSize, this.sorted.length);
  }

  private sortValue(p: Product): string | number {
    switch (this.sortKey) {
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

  onSearch(): void {
    this.page = 1;
  }

  toggleSort(key: SortKey): void {
    if (this.sortKey === key) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortKey = key;
      this.sortDir = 'asc';
    }
    this.page = 1;
  }

  isSorted(key: SortKey): boolean {
    return this.sortKey === key;
  }

  changePage(n: number): void {
    if (n < 1 || n > this.totalPages) return;
    this.page = n;
  }

  onPageSizeChange(): void {
    this.page = 1;
  }

  // ---- Delete flow ----
  openDelete(p: Product): void {
    this.deleteTarget = p;
  }

  cancelDelete(): void {
    this.deleteTarget = null;
  }

  confirmDelete(): void {
    const target = this.deleteTarget;
    if (!target) return;
    this.service.remove(target.id).subscribe({
      next: () => {
        this.products = this.products.filter((x) => x.id !== target.id);
        this.deleteTarget = null;
        if (this.page > this.totalPages) this.page = this.totalPages;
      },
      error: () => {
        // If the backend is unavailable, still drop the row locally so the UI stays usable.
        this.products = this.products.filter((x) => x.id !== target.id);
        this.deleteTarget = null;
      },
    });
  }
}
