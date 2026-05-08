import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  computed,
  effect,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorTrash } from '@ng-icons/phosphor-icons/regular';
import {
  NgDiagramNodeSelectedDirective,
  NgDiagramSelectionService,
  type NgDiagramNodeTemplate,
  type Node,
} from 'ng-diagram';

import { PinData } from '../../../models/pin.model';
import { MapsStore } from '../../../state/maps.store';
import { PinsStore } from '../../../state/pins.store';

@Component({
  selector: 'app-pin-node',
  imports: [NgIcon],
  providers: [provideIcons({ phosphorTrash })],
  hostDirectives: [
    { directive: NgDiagramNodeSelectedDirective, inputs: ['node'] },
  ],
  templateUrl: './pin-node.component.html',
  styleUrl: './pin-node.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PinNodeComponent implements NgDiagramNodeTemplate<PinData> {
  private readonly pinsStore = inject(PinsStore);
  private readonly mapsStore = inject(MapsStore);
  private readonly selection = inject(NgDiagramSelectionService);

  node = input.required<Node<PinData>>();

  protected readonly maps = this.mapsStore.maps;

  protected readonly otherMaps = computed(() => {
    const ownerId = this.node().data.mapId;
    return this.maps().filter((m) => m.id !== ownerId);
  });

  protected readonly dropdownOpen = signal(false);

  private readonly pinWrapper =
    viewChild<ElementRef<HTMLElement>>('pinWrapper');

  private wasSelected = false;

  constructor() {
    effect(() => {
      const selected = !!this.node().selected;
      if (selected && !this.wasSelected) {
        this.dropdownOpen.set(true);
      }
      if (!selected && this.wasSelected) {
        this.dropdownOpen.set(false);
      }
      this.wasSelected = selected;
    });
  }

  goToMap(mapId: string): void {
    this.dropdownOpen.set(false);
    this.selection.select([]);
    this.mapsStore.setActiveMap(mapId);
  }

  deletePin(): void {
    this.dropdownOpen.set(false);
    this.pinsStore.removePin(this.node().id);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.dropdownOpen()) {
      return;
    }
    const wrapper = this.pinWrapper()?.nativeElement;
    if (wrapper && !wrapper.contains(event.target as globalThis.Node)) {
      this.dropdownOpen.set(false);
    }
  }
}
