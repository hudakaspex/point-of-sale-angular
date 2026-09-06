import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ProductService, ProductInput } from '../../../shared/services/product.service';
import { Category } from '../../../shared/models/category.model';

@Component({
  selector: 'app-product-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    PageBreadcrumbComponent,
  ],
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

  readonly inputClass =
    'h-11 w-full rounded-lg border border-gray-300 appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90';

  form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
    isActive: [true],
    categoryId: [''],
    variants: this.fb.array([this.newVariant()]),
  });

  get variants(): FormArray {
    return this.form.get('variants') as FormArray;
  }

  private newVariant(): FormGroup {
    return this.fb.group({
      sku: [''],
      price: [0],
    });
  }

  addVariant(): void {
    this.variants.push(this.newVariant());
  }

  removeVariant(index: number): void {
    if (this.variants.length > 1) {
      this.variants.removeAt(index);
    }
  }

  ngOnInit(): void {
    this.service.listCategories().subscribe((cats) => (this.categories = cats ?? []));

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editId = id;
      this.isEdit = true;
      this.loading = true;
      this.service.get(id).subscribe({
        next: (p) => {
          this.form.patchValue({
            name: p.name ?? '',
            description: p.description ?? '',
            isActive: !!p.isActive,
            categoryId: p.category?.id ?? '',
          });
          this.variants.clear();
          const vs = p.variants ?? [];
          (vs.length ? vs : [{ sku: '', price: 0 } as any]).forEach((v) =>
            this.variants.push(
              this.fb.group({ sku: v.sku ?? '', price: Number(v.price) || 0 })
            )
          );
          this.loading = false;
        },
        error: () => {
          this.submitError = 'Could not load this product.';
          this.loading = false;
        },
      });
    }
  }

  get f() {
    return this.form.controls;
  }

  invalid(control: string): boolean {
    const c = this.form.get(control);
    return !!c && c.invalid && (c.dirty || c.touched);
  }

  save(): void {
    this.submitError = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const dto: ProductInput = {
      name: raw.name,
      description: raw.description || undefined,
      isActive: !!raw.isActive,
      categoryId: raw.categoryId || null,
      variants: (raw.variants as { sku: string; price: number }[])
        .map((v) => ({ sku: v.sku, price: Number(v.price) || 0 })),
    };

    this.saving = true;
    const req = this.isEdit && this.editId
      ? this.service.update(this.editId, dto)
      : this.service.create(dto);

    req.subscribe({
      next: () => {
        this.saving = false;
        this.router.navigate(['/products']);
      },
      error: () => {
        this.saving = false;
        this.submitError = 'Could not save the product. Please check the server connection and try again.';
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/products']);
  }
}
