import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  computed,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorCaretDown,
  phosphorMapTrifold,
  phosphorPlusCircle,
} from '@ng-icons/phosphor-icons/regular';
import { MapEntry } from '../../models/map.model';
import { UploadMapDialogComponent } from '../upload-map-dialog/upload-map-dialog.component';

const MAX_VISIBLE = 3;

@Component({
  selector: 'app-map-switcher',
  imports: [NgIcon, UploadMapDialogComponent],
  providers: [
    provideIcons({ phosphorMapTrifold, phosphorCaretDown, phosphorPlusCircle }),
  ],
  templateUrl: './map-switcher.component.html',
  styleUrl: './map-switcher.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapSwitcherComponent {
  maps = input.required<MapEntry[]>();
  activeMapId = input.required<string>();
  activate = output<string>();
  add = output<{ name: string; file: File }>();

  readonly dialogOpen = signal(false);
  readonly dropdownOpen = signal(false);

  private readonly moreWrapper = viewChild<ElementRef<HTMLElement>>('moreWrapper');

  readonly visibleMaps = computed(() => {
    const all = this.maps();
    if (all.length <= MAX_VISIBLE) return all;
    const visible = all.slice(0, MAX_VISIBLE);
    const activeId = this.activeMapId();
    if (visible.some((m) => m.id === activeId)) return visible;
    const active = all.find((m) => m.id === activeId);
    if (!active) return visible;
    return [...visible.slice(0, MAX_VISIBLE - 1), active];
  });

  readonly overflowMaps = computed(() => {
    const visibleIds = new Set(this.visibleMaps().map((m) => m.id));
    return this.maps().filter((m) => !visibleIds.has(m.id));
  });

  readonly hasOverflow = computed(() => this.overflowMaps().length > 0);

  onActivate(id: string) {
    this.activate.emit(id);
  }

  toggleDropdown() {
    this.dropdownOpen.update((open) => !open);
  }

  onOverflowActivate(id: string) {
    this.activate.emit(id);
    this.dropdownOpen.set(false);
  }

  openDialog() {
    this.dialogOpen.set(true);
  }

  onDialogCancel() {
    this.dialogOpen.set(false);
  }

  onDialogSubmit(payload: { name: string; file: File }) {
    this.add.emit(payload);
    this.dialogOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.dropdownOpen()) return;
    const wrapper = this.moreWrapper()?.nativeElement;
    if (wrapper && !wrapper.contains(event.target as Node)) {
      this.dropdownOpen.set(false);
    }
  }
}
