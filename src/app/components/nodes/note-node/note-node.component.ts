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
import {
  phosphorDotsThreeVertical,
  phosphorPaperPlaneRight,
  phosphorPencilSimple,
  phosphorTrash,
} from '@ng-icons/phosphor-icons/regular';
import {
  NgDiagramNodeSelectedDirective,
  type NgDiagramNodeTemplate,
  type Node,
} from 'ng-diagram';
import { NoteData } from '../../../models/note.model';
import { NotesStore } from '../../../state/notes.store';

@Component({
  selector: 'app-note-node',
  imports: [NgIcon],
  providers: [
    provideIcons({
      phosphorDotsThreeVertical,
      phosphorPaperPlaneRight,
      phosphorPencilSimple,
      phosphorTrash,
    }),
  ],
  host: {
    '[class.note-empty]': '!node().data.text',
  },
  hostDirectives: [
    { directive: NgDiagramNodeSelectedDirective, inputs: ['node'] },
  ],
  templateUrl: './note-node.component.html',
  styleUrl: './note-node.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NoteNodeComponent implements NgDiagramNodeTemplate<NoteData> {
  private readonly store = inject(NotesStore);

  node = input.required<Node<NoteData>>();

  protected readonly isNew = signal(true);
  protected readonly editing = signal(false);
  protected readonly draftText = signal('');
  protected readonly dropdownOpen = signal(false);

  protected readonly isInputMode = computed(
    () => this.isNew() || this.editing(),
  );

  private readonly moreWrapper =
    viewChild<ElementRef<HTMLElement>>('moreWrapper');

  private wasSelected = false;
  private removed = false;

  constructor() {
    queueMicrotask(() => {
      const text = this.node().data.text;
      this.isNew.set(text === '');
      this.draftText.set(text);
    });

    effect(() => {
      const selected = !!this.node().selected;
      if (this.wasSelected && !selected && !this.removed) {
        this.dropdownOpen.set(false);
        this.editing.set(false);
        if (this.isNew() && this.node().data.text === '') {
          this.removed = true;
          this.store.removeNote(this.node().id);
        } else {
          this.draftText.set(this.node().data.text);
        }
      }
      this.wasSelected = selected;
    });
  }

  onInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.draftText.set(target.value);
  }

  onEnter(event: Event): void {
    if ((event as KeyboardEvent).shiftKey) {
      return;
    }
    event.preventDefault();
    this.submit();
  }

  submit(): void {
    const text = this.draftText().trim();
    if (text) {
      this.store.updateText(this.node().id, text);
      this.isNew.set(false);
      this.editing.set(false);
      return;
    }
    if (this.isNew()) {
      this.removed = true;
      this.store.removeNote(this.node().id);
      return;
    }
    this.editing.set(false);
    this.draftText.set(this.node().data.text);
  }

  startEdit(): void {
    this.draftText.set(this.node().data.text);
    this.editing.set(true);
    this.dropdownOpen.set(false);
  }

  deleteNote(): void {
    this.dropdownOpen.set(false);
    this.removed = true;
    this.store.removeNote(this.node().id);
  }

  toggleDropdown(): void {
    this.dropdownOpen.update((open) => !open);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.dropdownOpen()) {
      return;
    }
    const wrapper = this.moreWrapper()?.nativeElement;
    if (wrapper && !wrapper.contains(event.target as globalThis.Node)) {
      this.dropdownOpen.set(false);
    }
  }
}
