import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ProductService, ProductInput, VariantInput } from '../../../shared/services/product.service';
import { Category } from '../../../shared/models/category.model';
import { Attribute } from '../../../shared/models/attribute.model';
import { AttributeValue } from '../../../shared/models/attribute-value.model';

@Component({
  selector: 'app-product-form',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, PageBreadcrumbComponent],
  templateUrl: './product-form.component.html',
  styles: ``,
})
export class ProductFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly service = inject(ProductService);

  editId: string | null = null;
  isEdit = false;
  loading = false;
  saving = false;
  submitError = '';

  categories: Category[] = [];
  attributes: Attribute[] = [];

  // attribute option state
  selectedAttrIds = signal<Set<string>>(new Set());
  selectedValuesByAttr = signal<Map<string, Set<string>>>(new Map());
  attrSearch = signal<Map<string, string>>(new Map());
  showValueDropdown = signal<string | null>(null);

  // bulk price helper
  bulkPrice: number | null = null;

  readonly inputClass =
    'h-11 w-full rounded-lg border border-gray-300 bg-white appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30';

  form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
    isActive: [true],
    categoryId: [''],
    variants: this.fb.array([this.newVariantGroup([])]),
  });

  get variants(): FormArray {
    return this.form.get('variants') as FormArray;
  }

  // computed helpers
  selectedAttributes = computed(() => this.attributes.filter(a => this.selectedAttrIds().has(a.id)));
  hasOptions = computed(() => this.selectedAttrIds().size > 0);
  canGenerate = computed(() => {
    const ids = this.selectedAttrIds();
    if (ids.size === 0) return false;
    const m = this.selectedValuesByAttr();
    for (const id of ids) {
      if (!m.get(id) || (m.get(id)!.size === 0)) return false;
    }
    return true;
  });
  variantCount = computed(() => this.variants.length);
  priceSpread = computed(() => {
    const prices = this.variants.controls.map(c => Number(c.get('price')?.value) || 0);
    if (!prices.length) return '—';
    const min = Math.min(...prices), max = Math.max(...prices);
    return min === max ? this.fmt(min) : `${this.fmt(min)} – ${this.fmt(max)}`;
  });

  private newVariantGroup(valueIds: string[]): FormGroup {
    return this.fb.group({
      sku: ['', [Validators.required]],
      price: [0, [Validators.required, Validators.min(0)]],
      isActive: [true],
      attributeValueIds: [valueIds],
    });
  }

  ngOnInit(): void {
    this.service.listCategories().subscribe(cats => (this.categories = cats ?? []));
    this.service.listAttributes().subscribe(attrs => {
      this.attributes = attrs ?? [];
      // auto-select first 2 for demo if empty and creating
      if (!this.isEdit && this.attributes.length && this.selectedAttrIds().size === 0) {
        // leave unselected so user chooses; no auto
      }
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editId = id;
      this.isEdit = true;
      this.loading = true;
      this.service.get(id).subscribe({
        next: p => {
          this.form.patchValue({
            name: p.name ?? '',
            description: p.description ?? '',
            isActive: !!p.isActive,
            categoryId: p.category?.id ?? '',
          });
          this.rehydrateFromProduct(p);
          this.loading = false;
        },
        error: () => {
          this.submitError = 'Could not load this product.';
          this.loading = false;
        },
      });
    }
  }

  private rehydrateFromProduct(p: any): void {
    this.variants.clear();
    const vs = p.variants ?? [];
    // collect attribute structure
    const valByAttr = new Map<string, Set<string>>();
    const attrIds = new Set<string>();
    vs.forEach((v: any) => {
      (v.attributeValues ?? []).forEach((av: any) => {
        const attrId = av.attribute?.id ?? av.attributeId ?? '';
        if (!attrId) return;
        attrIds.add(attrId);
        if (!valByAttr.has(attrId)) valByAttr.set(attrId, new Set());
        valByAttr.get(attrId)!.add(av.id);
      });
    });
    this.selectedAttrIds.set(attrIds);
    this.selectedValuesByAttr.set(valByAttr);

    if (vs.length) {
      vs.forEach((v: any) => {
        const ids: string[] = (v.attributeValues ?? []).map((av: any) => av.id);
        this.variants.push(
          this.fb.group({
            sku: [v.sku ?? '', [Validators.required]],
            price: [Number(v.price) || 0, [Validators.required, Validators.min(0)]],
            isActive: [v.isActive ?? true],
            attributeValueIds: [ids],
          })
        );
      });
    } else {
      this.variants.push(this.newVariantGroup([]));
    }
  }

  // attr option UX
  toggleAttribute(attrId: string): void {
    const s = new Set(this.selectedAttrIds());
    const m = new Map(this.selectedValuesByAttr());
    if (s.has(attrId)) {
      s.delete(attrId);
      m.delete(attrId);
      this.showValueDropdown.set(null);
    } else {
      s.add(attrId);
      if (!m.has(attrId)) m.set(attrId, new Set());
    }
    this.selectedAttrIds.set(s);
    this.selectedValuesByAttr.set(m);
  }

  isAttrSelected(attrId: string): boolean {
    return this.selectedAttrIds().has(attrId);
  }

  filteredValues(attr: Attribute): AttributeValue[] {
    const q = (this.attrSearch().get(attr.id) ?? '').toLowerCase().trim();
    if (!q) return attr.values ?? [];
    return (attr.values ?? []).filter(v => v.value.toLowerCase().includes(q));
  }

  setSearch(attrId: string, val: string): void {
    const m = new Map(this.attrSearch());
    m.set(attrId, val);
    this.attrSearch.set(m);
  }

  isValueSelected(attrId: string, valueId: string): boolean {
    return !!this.selectedValuesByAttr().get(attrId)?.has(valueId);
  }

  toggleValue(attrId: string, valueId: string): void {
    const m = new Map(this.selectedValuesByAttr());
    const set = new Set(m.get(attrId) ?? []);
    if (set.has(valueId)) set.delete(valueId);
    else set.add(valueId);
    m.set(attrId, set);
    this.selectedValuesByAttr.set(m);
  }

  removeSelectedValue(attrId: string, valueId: string): void {
    this.toggleValue(attrId, valueId);
  }

  selectedValuesFor(attrId: string): AttributeValue[] {
    const attr = this.attributes.find(a => a.id === attrId);
    const ids = this.selectedValuesByAttr().get(attrId);
    if (!attr || !ids) return [];
    return (attr.values ?? []).filter(v => ids.has(v.id));
  }

  getValueLabel(valueId: string): string {
    for (const a of this.attributes) {
      const f = (a.values ?? []).find(v => v.id === valueId);
      if (f) return f.value;
    }
    return valueId.slice(0, 6);
  }

  getAttrName(valueId: string): string {
    for (const a of this.attributes) {
      if ((a.values ?? []).some(v => v.id === valueId)) return a.name;
    }
    return '';
  }

  variantLabel(group: AbstractControl): string {
    const ids: string[] = group.get('attributeValueIds')?.value ?? [];
    if (!ids.length) return 'No options';
    return ids.map(id => this.getValueLabel(id)).join(' / ');
  }

  generateVariants(): void {
    const attrIds = Array.from(this.selectedAttrIds());
    const lists: string[][] = attrIds.map(id => Array.from(this.selectedValuesByAttr().get(id) ?? []));
    if (lists.some(l => l.length === 0)) return;
    const combos = this.cartesian(lists);
    // dedup existing
    const existingKeys = new Set(
      this.variants.controls.map(c => ([...(c.get('attributeValueIds')?.value ?? [])] as string[]).sort().join('|'))
    );
    let added = 0;
    const baseSku = this.skuBase();
    combos.forEach((combo, idx) => {
      const key = [...combo].sort().join('|');
      if (existingKeys.has(key)) return;
      const sku = `${baseSku}-${combo.map(v => this.getValueLabel(v).slice(0, 3).toUpperCase()).join('')}-${String(idx + 1).padStart(2, '0')}`;
      this.variants.push(
        this.fb.group({
          sku: [sku, [Validators.required]],
          price: [0, [Validators.required, Validators.min(0)]],
          isActive: [true],
          attributeValueIds: [combo],
        })
      );
      existingKeys.add(key);
      added++;
    });
    if (added === 0) {
      // all combos already exist
    }
  }

  private cartesian<T>(arrays: T[][]): T[][] {
    return arrays.reduce<T[][]>((acc, curr) => acc.flatMap(a => curr.map(c => [...a, c])), [[]] as T[][]).filter(a => a.length > 0);
  }

  private skuBase(): string {
    const name: string = this.form.get('name')?.value ?? 'PRD';
    const slug = name.trim().toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 8) || 'PRD';
    return slug;
  }

  addEmptyVariant(): void {
    this.variants.push(this.newVariantGroup([]));
  }

  addVariantWithCombo(valueIds: string[]): void {
    const sku = `${this.skuBase()}-${valueIds.map(v => this.getValueLabel(v).slice(0, 3).toUpperCase()).join('') || 'VAR'}-${String(this.variants.length + 1).padStart(2, '0')}`;
    this.variants.push(
      this.fb.group({
        sku: [sku, [Validators.required]],
        price: [0, [Validators.required, Validators.min(0)]],
        isActive: [true],
        attributeValueIds: [valueIds],
      })
    );
  }

  duplicateVariant(index: number): void {
    const src = this.variants.at(index);
    const val = src.getRawValue();
    this.variants.insert(
      index + 1,
      this.fb.group({
        sku: [val.sku + '-COPY', [Validators.required]],
        price: [val.price, [Validators.required, Validators.min(0)]],
        isActive: [val.isActive],
        attributeValueIds: [[...(val.attributeValueIds ?? [])]],
      })
    );
  }

  removeVariant(index: number): void {
    if (this.variants.length > 1) this.variants.removeAt(index);
  }

  clearAllVariants(): void {
    this.variants.clear();
    this.variants.push(this.newVariantGroup([]));
  }

  applyBulkPrice(): void {
    if (this.bulkPrice == null || Number.isNaN(this.bulkPrice)) return;
    const p = Number(this.bulkPrice);
    this.variants.controls.forEach(c => c.get('price')?.setValue(p));
  }

  autoGenerateSkus(): void {
    const base = this.skuBase();
    this.variants.controls.forEach((c, i) => {
      const ids: string[] = c.get('attributeValueIds')?.value ?? [];
      const suffix = ids.length ? ids.map(id => this.getValueLabel(id).slice(0, 2).toUpperCase()).join('') : String(i + 1).padStart(2, '0');
      c.get('sku')?.setValue(`${base}-${suffix}-${String(i + 1).padStart(2, '0')}`);
    });
  }

  setVariantValues(index: number, valueIds: string[]): void {
    this.variants.at(index).get('attributeValueIds')?.setValue(valueIds);
  }

  invalid(control: string): boolean {
    const c = this.form.get(control);
    return !!c && c.invalid && (c.dirty || c.touched);
  }

  variantInvalid(index: number, field: string): boolean {
    const c = this.variants.at(index).get(field);
    return !!c && c.invalid && (c.dirty || c.touched);
  }

  save(): void {
    this.submitError = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.variants.controls.forEach(g => (g as FormGroup).markAllAsTouched());
      return;
    }
    if (this.variants.length === 0) {
      this.submitError = 'Add at least one variant.';
      return;
    }
    // check duplicate combos
    const seen = new Set<string>();
    for (const ctrl of this.variants.controls) {
      const ids: string[] = [...((ctrl.get('attributeValueIds')?.value ?? []) as string[])].sort();
      const key = ids.join('|') + '::' + String(ctrl.get('sku')?.value ?? '').toLowerCase();
      // sku dup check
      // combo dup (only if combos non-empty)
      if (ids.length > 0) {
        const comboKey = ids.join('|');
        if (seen.has('combo:' + comboKey)) {
          this.submitError = 'Two variants share the same option combination (' + ids.map(id => this.getValueLabel(id)).join(' / ') + '). Make each combination unique.';
          return;
        }
        seen.add('combo:' + comboKey);
      }
      const skuKey = 'sku:' + String(ctrl.get('sku')?.value ?? '').toLowerCase().trim();
      if (seen.has(skuKey)) {
        this.submitError = 'Duplicate SKU: ' + ctrl.get('sku')?.value;
        return;
      }
      seen.add(skuKey);
    }

    const raw = this.form.getRawValue();
    const dto: ProductInput = {
      name: raw.name,
      description: raw.description || undefined,
      isActive: !!raw.isActive,
      categoryId: raw.categoryId || null,
      variants: (raw.variants as { sku: string; price: number; isActive: boolean; attributeValueIds: string[] }[]).map(v => ({
        sku: v.sku.trim(),
        price: Number(v.price) || 0,
        isActive: !!v.isActive,
        attributeValueIds: [...(v.attributeValueIds ?? [])],
      })),
    };
    this.saving = true;
    const req = this.isEdit && this.editId ? this.service.update(this.editId, dto) : this.service.create(dto);
    req.subscribe({
      next: () => {
        this.saving = false;
        this.router.navigate(['/products']);
      },
      error: (err) => {
        this.saving = false;
        const msg = err?.error?.message || err?.message || '';
        this.submitError = msg ? `Could not save: ${msg}` : 'Could not save the product. Check the server connection and try again.';
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/products']);
  }

  private fmt(n: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
  }
}


