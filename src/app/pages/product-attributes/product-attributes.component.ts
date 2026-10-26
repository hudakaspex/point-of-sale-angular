import { Component, ChangeDetectionStrategy, computed, inject, signal, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormArray, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterModule } from '@angular/router';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { AttributeService, AttributeInput } from '../../shared/services/attribute.service';
import { Attribute } from '../../shared/models/attribute.model';

type SortKey = 'name' | 'values' | 'id';

@Component({
  selector: 'app-product-attributes',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, PageBreadcrumbComponent],
  templateUrl: './product-attributes.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductAttributesComponent {
  private readonly service = inject(AttributeService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly attributes = signal<Attribute[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly search = signal('');
  readonly sortKey = signal<SortKey>('name');
  readonly sortDir = signal<'asc' | 'desc'>('asc');
  readonly page = signal(1);
  readonly pageSize = signal(10);
  readonly pageSizes = [10, 25, 50];

  readonly editingId = signal<string | null>(null);
  readonly showForm = signal(false);
  readonly deleteTarget = signal<Attribute | null>(null);
  readonly formError = signal('');
  readonly valueInput = signal('');

  readonly inputClass =
    'h-11 w-full rounded-lg border border-gray-300 bg-white appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30';

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    values: this.fb.array([] as any[]),
  });

  get valuesArray(): FormArray { return this.form.get('values') as FormArray; }

  readonly kpis = computed(() => {
    const all = this.attributes();
    const totalValues = all.reduce((s, a) => s + (a.values?.length ?? 0), 0);
    const avg = all.length ? (totalValues / all.length).toFixed(1) : '0';
    const most = all.length ? Math.max(...all.map(a => a.values?.length ?? 0)) : 0;
    const empty = all.filter(a => (a.values?.length ?? 0) === 0).length;
    return { total: all.length, totalValues, avg, most, empty };
  });

  private readonly filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    if (!q) return this.attributes();
    return this.attributes().filter(a => {
      if (a.name.toLowerCase().includes(q)) return true;
      if ((a.values ?? []).some(v => v.value.toLowerCase().includes(q))) return true;
      if (a.id.toLowerCase().includes(q)) return true;
      return false;
    });
  });

  readonly sorted = computed(() => {
    const dir = this.sortDir() === 'asc' ? 1 : -1;
    const key = this.sortKey();
    return [...this.filtered()].sort((a, b) => {
      let av: any, bv: any;
      if (key === 'name') { av = a.name.toLowerCase(); bv = b.name.toLowerCase(); }
      else if (key === 'values') { av = a.values?.length ?? 0; bv = b.values?.length ?? 0; }
      else { av = a.id.toLowerCase(); bv = b.id.toLowerCase(); }
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
  });

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.sorted().length / this.pageSize())));
  readonly paged = computed(() => {
    const s = this.pageSize(); const start = (this.page() - 1) * s;
    return this.sorted().slice(start, start + s);
  });
  readonly rangeStart = computed(() => this.sorted().length === 0 ? 0 : (this.page() - 1) * this.pageSize() + 1);
  readonly rangeEnd = computed(() => Math.min(this.page() * this.pageSize(), this.sorted().length));
  readonly hasActiveSearch = computed(() => !!this.search().trim());
  readonly visiblePages = computed(() => {
    const total = this.totalPages(); const cur = this.page();
    const p: (number | string)[] = [];
    if (total <= 7) { for (let i = 1; i <= total; i++) p.push(i); return p; }
    p.push(1); if (cur > 3) p.push('…');
    for (let i = Math.max(2, cur - 1); i <= Math.min(total - 1, cur + 1); i++) p.push(i);
    if (cur < total - 2) p.push('…'); p.push(total); return p;
  });

  readonly isEdit = computed(() => !!this.editingId());

  ngOnInit(): void { this.reload(); }

  reload(): void {
    this.loading.set(true);
    this.service.list().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: list => { this.attributes.set(list ?? []); this.loading.set(false); },
      error: () => { this.attributes.set([]); this.loading.set(false); },
    });
  }

  onSearch(v: string): void { this.search.set(v); this.page.set(1); }
  clearSearch(): void { this.search.set(''); this.page.set(1); }
  toggleSort(k: SortKey): void {
    if (this.sortKey() === k) this.sortDir.set(this.sortDir() === 'asc' ? 'desc' : 'asc');
    else { this.sortKey.set(k); this.sortDir.set('asc'); }
  }
  isSorted(k: SortKey): boolean { return this.sortKey() === k; }
  setPage(n: number): void { this.page.set(Math.min(Math.max(1, n), this.totalPages())); }
  setPageSize(n: number): void { this.pageSize.set(n); this.page.set(1); }

  openCreate(): void {
    this.editingId.set(null);
    this.form.reset({ name: '' });
    this.valuesArray.clear();
    this.formError.set('');
    this.valueInput.set('');
    this.addValueControl(''); // placeholder not added, keep empty
    // start with one empty row helper
    this.valuesArray.clear();
    this.showForm.set(true);
    // focus next tick
    setTimeout(() => (document.getElementById('attr-name') as HTMLInputElement)?.focus(), 50);
  }

  openEdit(attr: Attribute): void {
    this.editingId.set(attr.id);
    this.form.reset({ name: attr.name });
    this.valuesArray.clear();
    (attr.values ?? []).forEach(v => this.valuesArray.push(this.fb.nonNullable.control(v.value, [Validators.required])));
    this.formError.set('');
    this.valueInput.set('');
    this.showForm.set(true);
  }

  closeForm(): void { this.showForm.set(false); this.editingId.set(null); this.formError.set(''); }

  addValueControl(val: string): void {
    this.valuesArray.push(this.fb.nonNullable.control(val, [Validators.required]));
  }

  addValueFromInput(): void {
    const raw = this.valueInput().trim();
    if (!raw) return;
    const exists = this.valuesArray.controls.some(c => String(c.value).trim().toLowerCase() === raw.toLowerCase());
    if (exists) { this.formError.set(`Value "${raw}" already added.`); return; }
    this.formError.set('');
    this.addValueControl(raw);
    this.valueInput.set('');
  }

  removeValueAt(i: number): void { this.valuesArray.removeAt(i); }

  onValueInputKeydown(e: KeyboardEvent): void {
    if (e.key === 'Enter') { e.preventDefault(); this.addValueFromInput(); }
    if (e.key === ',' ) { e.preventDefault(); this.addValueFromInput(); }
  }

  confirmDelete(attr: Attribute): void { this.deleteTarget.set(attr); }
  cancelDelete(): void { this.deleteTarget.set(null); }
  doDelete(): void {
    const t = this.deleteTarget(); if (!t) return;
    this.deleteTarget.set(null);
    this.service.remove(t.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.reload());
  }

  save(): void {
    this.formError.set('');
    if (this.form.controls.name.invalid) { this.form.controls.name.markAsTouched(); return; }
    const name = this.form.controls.name.value.trim();
    if (name.length < 2) { this.formError.set('Name must be at least 2 characters.'); return; }
    if (this.service.existsByName(name, this.editingId() ?? undefined)) { this.formError.set(`An attribute named "${name}" already exists.`); return; }
    const vals: string[] = (this.valuesArray.controls.map(c => String(c.value).trim()).filter(Boolean));
    // include pending input if user typed but didn't press enter
    const pending = this.valueInput().trim();
    if (pending && !vals.some(v => v.toLowerCase() === pending.toLowerCase())) vals.push(pending);
    if (!vals.length) { this.formError.set('Add at least one value.'); return; }
    const dup = this.findDup(vals);
    if (dup) { this.formError.set(`Duplicate value "${dup}" — values must be unique.`); return; }
    this.saving.set(true);
    const dto: AttributeInput = { name, values: vals };
    const req = this.isEdit() && this.editingId() ? this.service.update(this.editingId()!, dto) : this.service.create(dto);
    req.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => { this.saving.set(false); this.closeForm(); this.reload(); },
      error: (err) => { this.saving.set(false); this.formError.set(err?.error?.message ?? 'Could not save attribute.'); },
    });
  }

  private findDup(vals: string[]): string | null {
    const seen = new Set<string>();
    for (const v of vals) { const k = v.toLowerCase(); if (seen.has(k)) return v; seen.add(k); }
    return null;
  }

  displayShortId(id: string): string { return id.slice(0, 8).toUpperCase(); }
}

