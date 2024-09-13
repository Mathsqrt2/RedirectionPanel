import { Component, Input, OnInit } from '@angular/core';
import { Log } from '../display-logs.component';

@Component({
  selector: '[logView]',
  templateUrl: './log-bar.component.html',
  styleUrls: ['../display-logs.component.scss', './log-bar.component.scss'],
})

export class LogBarComponent implements OnInit {

  @Input('instance') log: Log;
  @Input('index') index: number;

  public timestamp: string;
  public isExpanded: boolean = false;

  public ngOnInit(): void {
    this.timestamp = this.log.jstimestamp ? new Date(this.log?.jstimestamp).toLocaleString('pl-PL') : 'no data';
  }

  protected toggleDetailsDisplay(): void {
    this.isExpanded = !this.isExpanded;
  } 

}