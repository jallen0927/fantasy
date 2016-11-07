import { Component } from '@angular/core';

@Component({
    selector: 'app',
    template: `<h3>This is: {{title}}</h3>`
})

export class AppComponent {
    title = 'Angular2 App';
}
