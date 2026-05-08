import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorBooks,
  phosphorCaretLeft,
  phosphorPlus,
} from '@ng-icons/phosphor-icons/regular';

@Component({
  selector: 'app-library-sidebar',
  imports: [NgIcon],
  providers: [
    provideIcons({ phosphorBooks, phosphorCaretLeft, phosphorPlus }),
  ],
  templateUrl: './library-sidebar.component.html',
  styleUrl: './library-sidebar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LibrarySidebarComponent {
  collapsed = input(false);
  collapsedChange = output<boolean>();
  addClicked = output<void>();

  toggle() {
    this.collapsedChange.emit(!this.collapsed());
  }

  onAdd() {
    this.addClicked.emit();
  }
}
