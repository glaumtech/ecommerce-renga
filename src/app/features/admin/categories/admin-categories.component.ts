import { UpperCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminCategoryService } from '../../../core/services/admin-category.service';
import {
  CategoryBulkSequenceDto,
  CategoryBulkReparentDto,
  CategoryCreateDto,
  CategoryStatsDto,
  CategoryTreeDto,
  CategoryUpdateDto,
} from '../../../core/models/category.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

type ModalMode = 'addMain' | 'editMain' | 'addSub' | 'editSub';

@Component({
  selector: 'app-admin-categories',
  imports: [FormsModule, LoadingSpinnerComponent, UpperCasePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 class="text-3xl font-serif font-bold text-slate-800">Category Management</h2>
          <p class="text-slate-500 text-xs mt-1">Manage main and sub categories for better product organization</p>
        </div>
        <button
          type="button"
          (click)="openModal('addMain')"
          class="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 px-6 rounded-xl transition-all shadow-sm"
        >
          Add Category
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p class="text-slate-400 text-[10px] uppercase font-black tracking-wider">Total Categories</p>
          <p class="text-3xl font-black text-slate-800">{{ stats().totalCategories }}</p>
        </div>
        <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p class="text-slate-400 text-[10px] uppercase font-black tracking-wider">Active Categories</p>
          <p class="text-3xl font-black text-green-600">{{ stats().activeCategories }}</p>
        </div>
        <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p class="text-slate-400 text-[10px] uppercase font-black tracking-wider">Inactive Categories</p>
          <p class="text-3xl font-black text-red-600">{{ stats().inactiveCategories }}</p>
        </div>
      </div>

      <div class="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <input
          type="text"
          placeholder="Search categories by name or description..."
          class="w-full text-xs font-semibold focus:outline-none bg-transparent"
          [ngModel]="searchQuery()"
          (ngModelChange)="onSearch($event)"
        />
      </div>

      <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-wrap items-center gap-4">
        @if (!bulkEdit() && !bulkMoveMode()) {
          <button type="button" (click)="startBulkEdit()" class="bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase py-2.5 px-4 rounded-lg">
            Bulk Edit Sequence
          </button>
          <button type="button" (click)="startBulkMove()" class="bg-white border border-blue-600 text-blue-700 font-black text-[10px] uppercase py-2.5 px-4 rounded-lg hover:bg-blue-50">
            Move Main to Sub
          </button>
        } @else if (bulkMoveMode()) {
          <button type="button" (click)="openBulkMoveModal()" [disabled]="selectedMainIds().size === 0 || saving()" class="bg-blue-600 text-white font-black text-[10px] uppercase py-2.5 px-4 rounded-lg">
            Move {{ selectedMainIds().size }} Selected
          </button>
          <button type="button" (click)="cancelBulkMove()" class="text-xs font-bold text-slate-500">Cancel</button>
          <span class="text-[11px] font-semibold text-slate-500">Select mains, then pick a target main category.</span>
        } @else {
          <button type="button" (click)="saveBulk()" [disabled]="saving()" class="bg-blue-600 text-white font-black text-[10px] uppercase py-2.5 px-4 rounded-lg">
            {{ saving() ? 'Saving…' : 'Save Sequences' }}
          </button>
          <button type="button" (click)="cancelBulk()" class="text-xs font-bold text-slate-500">Cancel</button>
        }
        <span class="text-[11px] font-semibold text-slate-500">Unique per sub-category — used only for item code generation.</span>
        @if (bulkError()) {
          <p class="text-xs text-red-600 w-full">{{ bulkError() }}</p>
        }
      </div>

      @if (loading()) {
        <app-loading-spinner message="Loading categories..." />
      } @else if (error()) {
        <div class="bg-red-50 text-red-700 text-sm p-4 rounded-xl border border-red-200">{{ error() }}</div>
      } @else {
        <div class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="bg-blue-600 text-white font-bold">
                  @if (bulkMoveMode()) {
                    <th class="py-4 px-3 w-10"></th>
                  }
                  <th class="py-4 px-6">Category</th>
                  <th class="py-4 px-6">Description</th>
                  <th class="py-4 px-6">Status</th>
                  <th class="py-4 px-6 text-center">Shop</th>
                  <th class="py-4 px-6 text-center">Items</th>
                  <th class="py-4 px-6 text-center">Sequence</th>
                  <th class="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 font-medium">
                @for (main of filteredTree(); track main.id) {
                  <tr class="hover:bg-slate-50/50" [class.bg-amber-50]="bulkMoveMode() && isMainSelected(main.id)">
                    @if (bulkMoveMode()) {
                      <td class="py-4 px-3 text-center">
                        <input type="checkbox" [checked]="isMainSelected(main.id)" (change)="toggleMainSelection(main.id)" />
                      </td>
                    }
                    <td class="py-4 px-6">
                      <button type="button" (click)="toggleExpand(main.id)" class="mr-2 text-slate-400">
                        {{ isExpanded(main.id) ? '▼' : '▶' }}
                      </button>
                      <span class="font-extrabold text-sm">{{ main.name }}</span>
                      <span class="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded uppercase ml-2">Main</span>
                    </td>
                    <td class="py-4 px-6 text-slate-500 max-w-xs truncate">{{ main.description || '—' }}</td>
                    <td class="py-4 px-6">
                      <span class="text-[10px] font-bold px-2 py-0.5 rounded" [class]="statusClass(main.status)">{{ main.status | uppercase }}</span>
                    </td>
                    <td class="py-4 px-6 text-center">
                      <span class="text-[10px] font-bold px-2 py-0.5 rounded" [class]="shopClass(main.publishToEcommerce)">{{ main.publishToEcommerce ? 'YES' : 'NO' }}</span>
                    </td>
                    <td class="py-4 px-6 text-center">{{ main.itemCount }}</td>
                    <td class="py-4 px-6 text-center">
                      @if (bulkEdit()) {
                        <input type="number" min="1" class="w-16 border rounded px-1 py-0.5" [ngModel]="sortDraft()[main.id] ?? main.sortOrder" (ngModelChange)="patchSortDraft(main.id, $event)" />
                      } @else {
                        {{ main.sortOrder }}
                      }
                    </td>
                    <td class="py-4 px-6 text-right space-x-1">
                      <button type="button" (click)="openModal('editMain', main)" class="text-blue-600 border border-slate-200 px-2 py-1 rounded-lg font-bold">Edit</button>
                      <button type="button" (click)="openModal('addSub', main)" class="text-emerald-600 border border-slate-200 px-2 py-1 rounded-lg font-bold">Add Sub</button>
                      <button type="button" (click)="toggleStatus(main)" class="text-red-500 px-2">⏻</button>
                    </td>
                  </tr>
                  @if (isExpanded(main.id)) {
                    @for (sub of main.subCategories; track sub.id) {
                      <tr class="bg-slate-50/40 border-l-2 border-l-blue-200">
                        @if (bulkMoveMode()) {
                          <td></td>
                        }
                        <td class="py-3 px-6 pl-14">↳ <span class="font-bold">{{ sub.name }}</span></td>
                        <td class="py-3 px-6 text-slate-500 truncate">{{ sub.description || '—' }}</td>
                        <td class="py-3 px-6">
                          <span class="text-[10px] font-bold px-2 py-0.5 rounded" [class]="statusClass(sub.status)">{{ sub.status | uppercase }}</span>
                        </td>
                        <td class="py-3 px-6 text-center">
                          <span class="text-[10px] font-bold px-2 py-0.5 rounded" [class]="shopClass(sub.publishToEcommerce)">{{ sub.publishToEcommerce ? 'YES' : 'NO' }}</span>
                        </td>
                        <td class="py-3 px-6 text-center">{{ sub.itemCount }}</td>
                        <td class="py-3 px-6 text-center">
                          @if (bulkEdit()) {
                            <input type="number" min="1" class="w-16 border rounded px-1 py-0.5" [ngModel]="codeDraft()[sub.id] ?? sub.codeSequenceStart" (ngModelChange)="patchCodeDraft(sub.id, $event)" />
                          } @else {
                            {{ sub.codeSequenceStart }}
                          }
                        </td>
                        <td class="py-3 px-6 text-right space-x-1">
                          <button type="button" (click)="openModal('editSub', sub, main.id)" class="text-slate-600 border border-slate-200 px-2 py-1 rounded-lg font-bold text-[11px]">Edit</button>
                          <button type="button" (click)="toggleStatus(sub)" class="text-red-500 px-2">⏻</button>
                        </td>
                      </tr>
                    }
                    @if (main.subCategories.length === 0) {
                      <tr class="bg-slate-50/20 text-slate-400">
                        <td colspan="7" class="py-3 px-14 text-xs">No sub-categories registered. Click "Add Sub".</td>
                      </tr>
                    }
                  }
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>

    @if (showBulkMoveModal()) {
      <div class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
        <div class="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 p-6 space-y-4">
          <h3 class="font-serif font-extrabold text-lg">Move Main to Sub</h3>
          @if (bulkMoveError()) {
            <p class="text-xs text-red-600">{{ bulkMoveError() }}</p>
          }
          <p class="text-xs text-slate-500">Move {{ selectedMainIds().size }} main categor{{ selectedMainIds().size === 1 ? 'y' : 'ies' }} under:</p>
          <select class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm" [ngModel]="bulkMoveTargetId()" (ngModelChange)="bulkMoveTargetId.set(+$event || 0)">
            <option [ngValue]="0">Select target main…</option>
            @for (main of bulkMoveTargetOptions(); track main.id) {
              <option [ngValue]="main.id">{{ main.name }}</option>
            }
          </select>
          <div class="flex justify-end gap-2 pt-2">
            <button type="button" (click)="cancelBulkMove()" class="text-xs font-bold text-slate-500 px-4 py-2">Cancel</button>
            <button type="button" (click)="confirmBulkMove()" [disabled]="saving()" class="bg-blue-600 text-white text-xs font-bold px-6 py-3 rounded-xl">Move</button>
          </div>
        </div>
      </div>
    }

    @if (showModal()) {
      <div class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
        <div class="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 p-6 space-y-4">
          <h3 class="font-serif font-extrabold text-lg">{{ modalTitle() }}</h3>
          @if (formError()) {
            <p class="text-xs text-red-600">{{ formError() }}</p>
          }
          <div>
            <label class="block text-[11px] font-bold text-slate-500 uppercase mb-1">Name *</label>
            <input class="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs" [ngModel]="formName()" (ngModelChange)="formName.set($event)" />
          </div>
          <div>
            <label class="block text-[11px] font-bold text-slate-500 uppercase mb-1">Description</label>
            <textarea class="w-full border border-slate-200 rounded-xl p-3 text-xs" rows="3" [ngModel]="formDesc()" (ngModelChange)="formDesc.set($event)"></textarea>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-[11px] font-bold text-slate-500 uppercase mb-1">Sort Order</label>
              <input type="number" min="1" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs" [ngModel]="formSort()" (ngModelChange)="formSort.set(+$event)" />
            </div>
            @if (modalMode() === 'addSub' || modalMode() === 'editSub') {
              <div>
                <label class="block text-[11px] font-bold text-slate-500 uppercase mb-1">Code Sequence</label>
                <input type="number" min="1" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs" [ngModel]="formCodeSeq()" (ngModelChange)="formCodeSeq.set(+$event)" />
              </div>
            }
          </div>
          <label class="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer">
            <input type="checkbox" [ngModel]="formPublishToEcommerce()" (ngModelChange)="formPublishToEcommerce.set($event)" />
            Publish to ecommerce shop
          </label>
          <div class="flex justify-end gap-2 pt-2">
            <button type="button" (click)="closeModal()" class="text-xs font-bold text-slate-500 px-4 py-2">Cancel</button>
            <button type="button" (click)="saveModal()" [disabled]="saving()" class="bg-blue-600 text-white text-xs font-bold px-6 py-3 rounded-xl">Save</button>
          </div>
        </div>
      </div>
    }
  `,
})
export class AdminCategoriesComponent implements OnInit {
  private readonly categoryService = inject(AdminCategoryService);

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly formError = signal<string | null>(null);
  readonly bulkError = signal<string | null>(null);
  readonly searchQuery = signal('');
  readonly tree = signal<CategoryTreeDto[]>([]);
  readonly filteredTree = signal<CategoryTreeDto[]>([]);
  readonly stats = signal<CategoryStatsDto>({ totalCategories: 0, activeCategories: 0, inactiveCategories: 0 });
  readonly expandedIds = signal<Set<number>>(new Set());
  readonly bulkEdit = signal(false);
  readonly bulkMoveMode = signal(false);
  readonly selectedMainIds = signal<Set<number>>(new Set());
  readonly showBulkMoveModal = signal(false);
  readonly bulkMoveTargetId = signal(0);
  readonly bulkMoveError = signal<string | null>(null);
  readonly sortDraft = signal<Record<number, number>>({});
  readonly codeDraft = signal<Record<number, number>>({});

  readonly showModal = signal(false);
  readonly modalMode = signal<ModalMode>('addMain');
  readonly modalParentId = signal<number | null>(null);
  readonly editingNode = signal<CategoryTreeDto | null>(null);
  readonly formName = signal('');
  readonly formDesc = signal('');
  readonly formSort = signal(1);
  readonly formCodeSeq = signal(1);
  readonly formPublishToEcommerce = signal(false);
  readonly modalTitle = signal('Add Main Category');

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.categoryService.getCategoryTree().subscribe({
      next: (tree) => {
        this.tree.set(tree);
        this.expandedIds.set(new Set(tree.map((m) => m.id)));
        this.applyFilter();
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(String(err));
        this.loading.set(false);
      },
    });
    this.categoryService.getStats().subscribe({
      next: (s) => this.stats.set(s),
    });
  }

  onSearch(q: string): void {
    this.searchQuery.set(q);
    this.applyFilter();
  }

  applyFilter(): void {
    const q = this.searchQuery().trim().toLowerCase();
    if (!q) {
      this.filteredTree.set([...this.tree()]);
      return;
    }
    this.filteredTree.set(
      this.tree()
        .map((main) => {
          const mainMatch =
            main.name.toLowerCase().includes(q) || (main.description?.toLowerCase().includes(q) ?? false);
          if (mainMatch) return { ...main };
          const subs = main.subCategories.filter(
            (s) => s.name.toLowerCase().includes(q) || (s.description?.toLowerCase().includes(q) ?? false)
          );
          return subs.length ? { ...main, subCategories: subs } : null;
        })
        .filter((m): m is CategoryTreeDto => m !== null)
    );
  }

  isExpanded(id: number): boolean {
    return this.expandedIds().has(id);
  }

  toggleExpand(id: number): void {
    const next = new Set(this.expandedIds());
    if (next.has(id)) next.delete(id);
    else next.add(id);
    this.expandedIds.set(next);
  }

  statusClass(status: string): string {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  }

  shopClass(published: boolean): string {
    return published ? 'bg-cyan-100 text-cyan-800' : 'bg-slate-100 text-slate-500';
  }

  openModal(mode: ModalMode, node?: CategoryTreeDto, parentId?: number): void {
    this.modalMode.set(mode);
    this.formError.set(null);
    if (mode === 'addMain') {
      this.modalTitle.set('Add Main Category');
      this.modalParentId.set(null);
      this.editingNode.set(null);
      this.formName.set('');
      this.formDesc.set('');
      this.formSort.set(this.tree().length + 1);
      this.formPublishToEcommerce.set(false);
    } else if (mode === 'addSub' && node) {
      this.modalTitle.set('Add Sub Category');
      this.modalParentId.set(node.id);
      this.editingNode.set(null);
      this.formName.set('');
      this.formDesc.set('');
      this.formSort.set(node.subCategories.length + 1);
      this.formCodeSeq.set((node.subCategories.length + 1) * 10);
      this.formPublishToEcommerce.set(false);
    } else if (node) {
      this.modalTitle.set(mode === 'editMain' ? 'Edit Main Category' : 'Edit Sub Category');
      this.modalParentId.set(parentId ?? null);
      this.editingNode.set(node);
      this.formName.set(node.name);
      this.formDesc.set(node.description ?? '');
      this.formSort.set(node.sortOrder);
      this.formCodeSeq.set(node.codeSequenceStart);
      this.formPublishToEcommerce.set(node.publishToEcommerce ?? false);
    }
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingNode.set(null);
  }

  saveModal(): void {
    const name = this.formName().trim();
    if (!name) {
      this.formError.set('Name is required');
      return;
    }
    this.saving.set(true);
    this.formError.set(null);
    const mode = this.modalMode();

    if (mode === 'addMain' || mode === 'addSub') {
      const dto: CategoryCreateDto = {
        name,
        description: this.formDesc(),
        parentId: mode === 'addSub' ? this.modalParentId() : null,
        sortOrder: this.formSort(),
        codeSequenceStart: mode === 'addSub' ? this.formCodeSeq() : undefined,
        publishToEcommerce: this.formPublishToEcommerce(),
      };
      this.categoryService.createCategory(dto).subscribe({
        next: () => this.afterSave(),
        error: (e) => this.onFormError(e),
      });
      return;
    }

    const node = this.editingNode();
    if (!node) return;
    const dto: CategoryUpdateDto = {
      name,
      description: this.formDesc(),
      sortOrder: this.formSort(),
      codeSequenceStart: node.level === 'SUB' ? this.formCodeSeq() : undefined,
      publishToEcommerce: this.formPublishToEcommerce(),
    };
    this.categoryService.updateCategory(node.id, dto).subscribe({
      next: () => this.afterSave(),
      error: (e) => this.onFormError(e),
    });
  }

  private afterSave(): void {
    this.saving.set(false);
    this.closeModal();
    this.load();
  }

  private onFormError(err: unknown): void {
    this.formError.set(String(err));
    this.saving.set(false);
  }

  toggleStatus(node: CategoryTreeDto): void {
    const call =
      node.status === 'active'
        ? this.categoryService.deactivateCategory(node.id)
        : this.categoryService.activateCategory(node.id);
    call.subscribe({ next: () => this.load() });
  }

  startBulkMove(): void {
    this.cancelBulk();
    this.bulkMoveMode.set(true);
    this.selectedMainIds.set(new Set());
    this.bulkMoveError.set(null);
  }

  cancelBulkMove(): void {
    this.bulkMoveMode.set(false);
    this.selectedMainIds.set(new Set());
    this.showBulkMoveModal.set(false);
    this.bulkMoveTargetId.set(0);
    this.bulkMoveError.set(null);
  }

  toggleMainSelection(id: number): void {
    const next = new Set(this.selectedMainIds());
    if (next.has(id)) next.delete(id);
    else next.add(id);
    this.selectedMainIds.set(next);
  }

  isMainSelected(id: number): boolean {
    return this.selectedMainIds().has(id);
  }

  bulkMoveTargetOptions = () =>
    this.tree().filter((m) => !this.selectedMainIds().has(m.id));

  openBulkMoveModal(): void {
    if (this.selectedMainIds().size === 0) {
      this.bulkMoveError.set('Select at least one main category.');
      return;
    }
    this.bulkMoveError.set(null);
    this.bulkMoveTargetId.set(0);
    this.showBulkMoveModal.set(true);
  }

  confirmBulkMove(): void {
    const targetId = this.bulkMoveTargetId();
    if (!targetId) {
      this.bulkMoveError.set('Choose a target main category.');
      return;
    }
    if (this.selectedMainIds().has(targetId)) {
      this.bulkMoveError.set('Target cannot be one of the categories being moved.');
      return;
    }
    const payload: CategoryBulkReparentDto = {
      categoryIds: Array.from(this.selectedMainIds()),
      targetParentId: targetId,
    };
    this.saving.set(true);
    this.categoryService.bulkMoveMainsToSub(payload).subscribe({
      next: () => {
        this.saving.set(false);
        this.cancelBulkMove();
        this.load();
      },
      error: (e) => {
        this.bulkMoveError.set(String(e));
        this.saving.set(false);
      },
    });
  }

  startBulkEdit(): void {
    this.cancelBulkMove();
    const sort: Record<number, number> = {};
    const code: Record<number, number> = {};
    for (const main of this.tree()) {
      sort[main.id] = main.sortOrder;
      for (const sub of main.subCategories) {
        code[sub.id] = sub.codeSequenceStart;
      }
    }
    this.sortDraft.set(sort);
    this.codeDraft.set(code);
    this.bulkEdit.set(true);
  }

  cancelBulk(): void {
    this.bulkEdit.set(false);
    this.bulkError.set(null);
  }

  patchSortDraft(id: number, v: number): void {
    this.sortDraft.update((d) => ({ ...d, [id]: v }));
  }

  patchCodeDraft(id: number, v: number): void {
    this.codeDraft.update((d) => ({ ...d, [id]: v }));
  }

  saveBulk(): void {
    const payload: CategoryBulkSequenceDto = { updates: [] };
    for (const main of this.tree()) {
      const sort = this.sortDraft()[main.id];
      if (sort != null && sort !== main.sortOrder) {
        payload.updates.push({ id: main.id, sortOrder: sort });
      }
      for (const sub of main.subCategories) {
        const code = this.codeDraft()[sub.id];
        if (code != null && code !== sub.codeSequenceStart) {
          payload.updates.push({ id: sub.id, codeSequenceStart: code });
        }
      }
    }
    if (!payload.updates.length) {
      this.cancelBulk();
      return;
    }
    this.saving.set(true);
    this.categoryService.bulkUpdateSequence(payload).subscribe({
      next: () => {
        this.saving.set(false);
        this.cancelBulk();
        this.load();
      },
      error: (e) => {
        this.bulkError.set(String(e));
        this.saving.set(false);
      },
    });
  }
}
