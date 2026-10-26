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

type SortKey = 'name' | 'sku' | 'category' | 'price' | 'status' | 'createdAt' | 'stock';
type ViewMode = 'table' | 'grid';

export interface DummyExtra {
  image: string;
  stock: number;
  stockLabel: 'In stock' | 'Low stock' | 'Out of stock';
}

const DUMMY_PRODUCTS: (Product & DummyExtra)[] = [
  {
    id: 'dum-1', name: 'MacBook Pro 14" M4', description: 'Liquid Retina XDR · 18h battery · Space Black', isActive: true,
    createdAt: new Date('2027-02-12'), updatedAt: new Date('2027-02-12'),
    category: { id: 'c1', name: 'Laptops', categories: [] } as any,
    variants: [{ id: 'v1', sku: 'MBP-M4-14-SB-512', price: 1999, isActive: true } as any, { id: 'v1b', sku: 'MBP-M4-14-SB-1TB', price: 2299, isActive: true } as any],
    image: '/images/product/product-01.jpg', stock: 34, stockLabel: 'In stock',
  } as any,
  {
    id: 'dum-2', name: 'Apple Watch Ultra 2', description: 'Titanium case · Dual-frequency GPS · 49mm', isActive: true,
    createdAt: new Date('2027-03-13'), updatedAt: new Date('2027-03-14'),
    category: { id: 'c2', name: 'Wearables', categories: [] } as any,
    variants: [{ id: 'v2', sku: 'AWU2-TI-49-GPS', price: 799, isActive: true } as any],
    image: '/images/product/product-02.jpg', stock: 0, stockLabel: 'Out of stock',
  } as any,
  {
    id: 'dum-3', name: 'iPhone 15 Pro Max', description: '256GB · Natural Titanium · A17 Pro', isActive: true,
    createdAt: new Date('2027-03-19'), updatedAt: new Date('2027-03-20'),
    category: { id: 'c3', name: 'Phones', categories: [] } as any,
    variants: [{ id: 'v3', sku: 'IP15PM-NT-256', price: 1199, isActive: true } as any, { id: 'v3b', sku: 'IP15PM-NT-512', price: 1399, isActive: true } as any],
    image: '/images/product/product-03.jpg', stock: 18, stockLabel: 'In stock',
  } as any,
  {
    id: 'dum-4', name: 'iPad Pro 12.9" M2', description: 'Wi-Fi 256GB · Silver · Apple Pencil hover', isActive: false,
    createdAt: new Date('2027-04-25'), updatedAt: new Date('2027-04-25'),
    category: { id: 'c4', name: 'Tablets', categories: [] } as any,
    variants: [{ id: 'v4', sku: 'IPAD-M2-129-256', price: 1099, isActive: false } as any],
    image: '/images/product/product-04.jpg', stock: 3, stockLabel: 'Low stock',
  } as any,
  {
    id: 'dum-5', name: 'Samsung Galaxy S24 Ultra', description: '512GB · Titanium Gray · S Pen', isActive: true,
    createdAt: new Date('2027-05-11'), updatedAt: new Date('2027-05-11'),
    category: { id: 'c3', name: 'Phones', categories: [] } as any,
    variants: [{ id: 'v5', sku: 'SGS24U-TG-512', price: 1299, isActive: true } as any],
    image: '/images/product/product-05.jpg', stock: 52, stockLabel: 'In stock',
  } as any,
  {
    id: 'dum-6', name: 'AirPods Pro (2nd gen)', description: 'MagSafe · USB-C · Active Noise Cancelling', isActive: true,
    createdAt: new Date('2027-06-29'), updatedAt: new Date('2027-06-29'),
    category: { id: 'c5', name: 'Audio', categories: [] } as any,
    variants: [{ id: 'v6', sku: 'APP2-USBC', price: 249, isActive: true } as any],
    image: '/images/product/product-01.jpg', stock: 4, stockLabel: 'Low stock',
  } as any,
  {
    id: 'dum-7', name: 'LG OLED C3 65" 4K TV', description: 'OLED evo · webOS · Dolby Vision · 120Hz', isActive: true,
    createdAt: new Date('2027-07-22'), updatedAt: new Date('2027-07-22'),
    category: { id: 'c6', name: 'TV & Home', categories: [] } as any,
    variants: [{ id: 'v7', sku: 'LG-OLED65C3', price: 1769, isActive: true } as any],
    image: '/images/product/product-02.jpg', stock: 0, stockLabel: 'Out of stock',
  } as any,
  {
    id: 'dum-8', name: 'Sony WH-1000XM5', description: 'Wireless · Midnight Black · 30h battery', isActive: true,
    createdAt: new Date('2027-08-05'), updatedAt: new Date('2027-08-05'),
    category: { id: 'c5', name: 'Audio', categories: [] } as any,
    variants: [{ id: 'v8', sku: 'SONY-WH1000XM5-BK', price: 399, isActive: true } as any],
    image: '/images/product/product-03.jpg', stock: 27, stockLabel: 'In stock',
  } as any,
  {
    id: 'dum-9', name: 'Dell XPS 13 Plus', description: '13.4" OLED · Intel Ultra 7 · 16GB RAM', isActive: true,
    createdAt: new Date('2027-08-18'), updatedAt: new Date('2027-08-18'),
    category: { id: 'c1', name: 'Laptops', categories: [] } as any,
    variants: [{ id: 'v9', sku: 'DELL-XPS13P-OLED', price: 1299, isActive: true } as any],
    image: '/images/product/product-04.jpg', stock: 11, stockLabel: 'In stock',
  } as any,
  {
    id: 'dum-10', name: 'Canon EOS R5', description: '45MP · 8K RAW · Body only · RF mount', isActive: true,
    createdAt: new Date('2027-09-28'), updatedAt: new Date('2027-09-28'),
    category: { id: 'c7', name: 'Cameras', categories: [] } as any,
    variants: [{ id: 'v10', sku: 'CANON-EOSR5-BODY', price: 3899, isActive: true } as any],
    image: '/images/product/product-05.jpg', stock: 6, stockLabel: 'In stock',
  } as any,
  {
    id: 'dum-11', name: 'Nintendo Switch OLED', description: 'White · 64GB · Joy-Con included · 7" OLED', isActive: false,
    createdAt: new Date('2027-10-10'), updatedAt: new Date('2027-10-10'),
    category: { id: 'c8', name: 'Gaming', categories: [] } as any,
    variants: [{ id: 'v11', sku: 'NSW-OLED-WH', price: 349, isActive: false } as any],
    image: '/images/product/product-01.jpg', stock: 2, stockLabel: 'Low stock',
  } as any,
  {
    id: 'dum-12', name: 'Logitech MX Master 3S', description: 'Graphite · Quiet clicks · 8K DPI', isActive: true,
    createdAt: new Date('2027-10-23'), updatedAt: new Date('2027-10-23'),
    category: { id: 'c9', name: 'Accessories', categories: [] } as any,
    variants: [{ id: 'v12', sku: 'LOGI-MX3S-GR', price: 119, isActive: true } as any],
    image: '/images/product/product-02.jpg', stock: 41, stockLabel: 'In stock',
  } as any,
];

@Component({
  selector: 'app-products',
  imports: [CommonModule, FormsModule, RouterModule, PageBreadcrumbComponent, BadgeComponent],
  templateUrl: './products.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsComponent {
  readonly service = inject(ProductService);
  private readonly destroyRef = inject(DestroyRef);

  readonly products = signal<(Product & Partial<DummyExtra>)[]>([]);
  readonly loading = signal(true);
  readonly error = signal(false);
  readonly demoMode = signal(false);

  readonly search = signal('');
  readonly categoryFilter = signal<string>('all');
  readonly statusFilter = signal<'all' | 'active' | 'inactive'>('all');
  readonly stockFilter = signal<'all' | 'in' | 'low' | 'out'>('all');
  readonly sortKey = signal<SortKey>('name');
  readonly sortDir = signal<'asc' | 'desc'>('asc');
  readonly page = signal(1);
  readonly pageSize = signal(10);
  readonly pageSizes = [10, 25, 50];
  readonly viewMode = signal<ViewMode>('table');
  readonly selectedIds = signal<Set<string>>(new Set());
  readonly showFilters = signal(false);

  readonly deleteTarget = signal<Product | null>(null);

  readonly categories = computed(() => {
    const cats = new Set<string>();
    this.products().forEach((p) => { if (p.category?.name) cats.add(p.category.name); });
    return Array.from(cats).sort();
  });

  readonly kpis = computed(() => {
    const all = this.products();
    const inStock = all.filter((p) => this.stockLabel(p) === 'In stock').length;
    const low = all.filter((p) => this.stockLabel(p) === 'Low stock').length;
    const out = all.filter((p) => this.stockLabel(p) === 'Out of stock').length;
    const active = all.filter((p) => p.isActive).length;
    return { total: all.length, inStock, low, out, active };
  });

  private readonly filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    const cat = this.categoryFilter();
    const stat = this.statusFilter();
    const stk = this.stockFilter();
    return this.products().filter((p) => {
      if (cat !== 'all' && p.category?.name !== cat) return false;
      if (stat === 'active' && !p.isActive) return false;
      if (stat === 'inactive' && p.isActive) return false;
      if (stk !== 'all') {
        const sl = this.stockLabel(p).toLowerCase();
        if (stk === 'in' && sl !== 'in stock') return false;
        if (stk === 'low' && sl !== 'low stock') return false;
        if (stk === 'out' && sl !== 'out of stock') return false;
      }
      if (!q) return true;
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

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.sorted().length / this.pageSize())));
  readonly paged = computed(() => {
    const size = this.pageSize();
    const start = (this.page() - 1) * size;
    return this.sorted().slice(start, start + size);
  });
  readonly rangeStart = computed(() => {
    const len = this.sorted().length;
    return len === 0 ? 0 : (this.page() - 1) * this.pageSize() + 1;
  });
  readonly rangeEnd = computed(() => Math.min(this.page() * this.pageSize(), this.sorted().length));
  readonly hasActiveFilters = computed(() => this.categoryFilter() !== 'all' || this.statusFilter() !== 'all' || this.stockFilter() !== 'all' || !!this.search());
  readonly visiblePages = computed(() => {
    const total = this.totalPages();
    const cur = this.page();
    const pages: (number | string)[] = [];
    if (total <= 7) { for (let i = 1; i <= total; i++) pages.push(i); return pages; }
    pages.push(1);
    if (cur > 3) pages.push('…');
    for (let i = Math.max(2, cur - 1); i <= Math.min(total - 1, cur + 1); i++) pages.push(i);
    if (cur < total - 2) pages.push('…');
    pages.push(total);
    return pages;
  });

  ngOnInit(): void { this.reload(); }

  reload(): void {
    this.loading.set(true);
    this.error.set(false);
    this.service.list().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data) => {
        if (!data || data.length === 0) {
          this.products.set([...DUMMY_PRODUCTS]);
          this.demoMode.set(true);
        } else {
          const enriched = (data as (Product & Partial<DummyExtra>)[]).map((p, i) => ({
            ...p,
            image: (p as any).image ?? `/images/product/product-0${(i % 5) + 1}.jpg`,
            stock: (p as any).stock ?? Math.floor(Math.random() * 50),
            stockLabel: (p as any).stockLabel ?? this.deriveStockLabel((p as any).stock ?? 12),
          }));
          this.products.set(enriched);
          this.demoMode.set(false);
        }
        this.loading.set(false);
      },
      error: () => {
        this.products.set([...DUMMY_PRODUCTS]);
        this.demoMode.set(true);
        this.error.set(false);
        this.loading.set(false);
      },
    });
  }

  private deriveStockLabel(n: number): DummyExtra['stockLabel'] {
    if (n === 0) return 'Out of stock';
    if (n <= 5) return 'Low stock';
    return 'In stock';
  }

  stockLabel(p: Product & Partial<DummyExtra>): DummyExtra['stockLabel'] {
    if ((p as any).stockLabel) return (p as any).stockLabel;
    const n = (p as any).stock ?? 0;
    return this.deriveStockLabel(n);
  }

  productImage(p: Product & Partial<DummyExtra>): string {
    return (p as any).image ?? '/images/product/product-01.jpg';
  }

  stockCount(p: Product & Partial<DummyExtra>): number {
    return (p as any).stock ?? 0;
  }

  stockBar(p: Product & Partial<DummyExtra>): number {
    const n = this.stockCount(p);
    return Math.min(100, Math.max(4, n * 2.2));
  }

  stockDotClass(p: Product & Partial<DummyExtra>): string {
    const l = this.stockLabel(p);
    if (l === 'In stock') return 'bg-success-500';
    if (l === 'Low stock') return 'bg-warning-500';
    return 'bg-error-500';
  }

  private sortValue(p: Product & Partial<DummyExtra>): string | number {
    switch (this.sortKey()) {
      case 'name': return (p.name ?? '').toLowerCase();
      case 'sku': return (this.service.primarySku(p as Product) ?? '').toLowerCase();
      case 'category': return (p.category?.name ?? '').toLowerCase();
      case 'price': return this.service.minPrice(p as Product);
      case 'status': return p.isActive ? 1 : 0;
      case 'stock': return this.stockCount(p);
      case 'createdAt': return p.createdAt ? new Date(p.createdAt as any).getTime() : 0;
      default: return 0;
    }
  }

  onSearchChange(v: string): void { this.search.set(v); this.page.set(1); }
  onCategoryFilter(v: string): void { this.categoryFilter.set(v); this.page.set(1); }
  onStatusFilter(v: 'all' | 'active' | 'inactive'): void { this.statusFilter.set(v); this.page.set(1); }
  onStockFilter(v: 'all' | 'in' | 'low' | 'out'): void { this.stockFilter.set(v); this.page.set(1); }
  clearFilters(): void { this.search.set(''); this.categoryFilter.set('all'); this.statusFilter.set('all'); this.stockFilter.set('all'); this.page.set(1); }

  toggleSort(key: SortKey): void {
    if (this.sortKey() === key) this.sortDir.update((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { this.sortKey.set(key); this.sortDir.set('asc'); }
    this.page.set(1);
  }
  isSorted(key: SortKey): boolean { return this.sortKey() === key; }
  changePage(n: number): void { if (n < 1 || n > this.totalPages()) return; this.page.set(n); }
  onPageSizeChange(size: number): void { this.pageSize.set(Number(size)); this.page.set(1); }
  setView(mode: ViewMode): void { this.viewMode.set(mode); }

  isSelected(id: string): boolean { return this.selectedIds().has(id); }
  toggleSelect(id: string): void {
    const next = new Set(this.selectedIds());
    if (next.has(id)) next.delete(id); else next.add(id);
    this.selectedIds.set(next);
  }
  toggleSelectAllVisible(): void {
    const ids = this.paged().map((p) => p.id);
    const all = ids.every((id) => this.selectedIds().has(id));
    const next = new Set(this.selectedIds());
    if (all) ids.forEach((id) => next.delete(id));
    else ids.forEach((id) => next.add(id));
    this.selectedIds.set(next);
  }
  isAllVisibleSelected(): boolean {
    const ids = this.paged().map((p) => p.id);
    return ids.length > 0 && ids.every((id) => this.selectedIds().has(id));
  }
  clearSelection(): void { this.selectedIds.set(new Set()); }
  bulkDelete(): void {
    const ids = this.selectedIds();
    if (!ids.size) return;
    this.products.update((list) => list.filter((p) => !ids.has(p.id)));
    this.clearSelection();
    if (this.page() > this.totalPages()) this.page.set(this.totalPages());
  }

  openDelete(p: Product): void { this.deleteTarget.set(p); }
  cancelDelete(): void { this.deleteTarget.set(null); }
  confirmDelete(): void {
    const target = this.deleteTarget();
    if (!target) return;
    const drop = (list: (Product & Partial<DummyExtra>)[]) => list.filter((x) => x.id !== target.id);
    this.service.remove(target.id).subscribe({
      next: () => {
        this.products.update(drop as any);
        this.deleteTarget.set(null);
        const s = new Set(this.selectedIds()); s.delete(target.id); this.selectedIds.set(s);
        if (this.page() > this.totalPages()) this.page.set(this.totalPages());
      },
      error: () => {
        this.products.update(drop as any);
        this.deleteTarget.set(null);
        const s = new Set(this.selectedIds()); s.delete(target.id); this.selectedIds.set(s);
      },
    });
  }
}