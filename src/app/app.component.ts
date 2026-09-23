import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TawkService } from './core/services/tawk.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: '<router-outlet />',
})
export class AppComponent {
  private readonly tawkService = inject(TawkService);

  constructor() {
    this.tawkService.init();
  }
}
