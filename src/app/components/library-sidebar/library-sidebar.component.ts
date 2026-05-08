import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorBooks,
  phosphorCaretLeft,
  phosphorNote,
  phosphorPlus,
} from '@ng-icons/phosphor-icons/regular';
import {
  NgDiagramPaletteItemComponent,
  NgDiagramPaletteItemPreviewComponent,
} from 'ng-diagram';
import { NotesStore } from '../../state/notes.store';

@Component({
  selector: 'app-library-sidebar',
  imports: [
    NgIcon,
    NgDiagramPaletteItemComponent,
    NgDiagramPaletteItemPreviewComponent,
  ],
  providers: [
    provideIcons({ phosphorBooks, phosphorCaretLeft, phosphorNote, phosphorPlus }),
  ],
  templateUrl: './library-sidebar.component.html',
  styleUrl: './library-sidebar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LibrarySidebarComponent {
  protected readonly store = inject(NotesStore);

  collapsed = input(false);
  collapsedChange = output<boolean>();
  addCharacterClicked = output<void>();

  toggle() {
    this.collapsedChange.emit(!this.collapsed());
  }

  onAddCharacter() {
    this.addCharacterClicked.emit();
  }
}
