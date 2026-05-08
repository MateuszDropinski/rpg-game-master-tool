import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorBooks,
  phosphorCaretRight,
  phosphorPlus,
} from '@ng-icons/phosphor-icons/regular';
import { MapsStore } from '../../state/maps.store';
import { NotesStore } from '../../state/notes.store';

type NotesFilterMode = 'all' | 'current';
type LibraryTab = 'characters' | 'notes';

@Component({
  selector: 'app-library-sidebar',
  imports: [NgIcon],
  providers: [
    provideIcons({ phosphorBooks, phosphorCaretRight, phosphorPlus }),
  ],
  templateUrl: './library-sidebar.component.html',
  styleUrl: './library-sidebar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LibrarySidebarComponent {
  protected readonly store = inject(NotesStore);
  protected readonly mapsStore = inject(MapsStore);

  protected readonly filterMode = signal<NotesFilterMode>('all');
  protected readonly activeTab = signal<LibraryTab>('notes');

  protected readonly displayedNotes = computed(() => {
    const all = this.store.allNotes();
    if (this.filterMode() === 'all') return all;
    const activeId = this.mapsStore.activeMapId();
    return all.filter((n) => n.data.mapId === activeId);
  });

  collapsed = input(false);
  collapsedChange = output<boolean>();
  addCharacterClicked = output<void>();

  toggle() {
    this.collapsedChange.emit(!this.collapsed());
  }

  onAddCharacter() {
    this.addCharacterClicked.emit();
  }

  setFilterMode(mode: NotesFilterMode) {
    this.filterMode.set(mode);
  }

  setActiveTab(tab: LibraryTab) {
    this.activeTab.set(tab);
  }

  selectNote(noteId: string, noteMapId: string) {
    if (noteMapId !== this.mapsStore.activeMapId()) {
      this.mapsStore.setActiveMap(noteMapId);
    }
    // The map swap moves the note back into the diagram synchronously, so
    // the selection call below targets a node that's already in the model.
    this.store.selectNote(noteId);
  }
}
