import { Component, Input } from '@angular/core';
import { Log } from '../display-logs.component';

@Component({
  selector: '[logView]',
  templateUrl: './log-bar.component.html',
  styleUrls: ['../display-logs.component.scss', './log-bar.component.scss'],
})

export class LogBarComponent {

  @Input('instance') log: Log;
  @Input('index') index: number;

  isExpanded: boolean = false;

  constructor() {

  }

  toggleDetailsDisplay() {
    this.isExpanded = !this.isExpanded;
  } 

}