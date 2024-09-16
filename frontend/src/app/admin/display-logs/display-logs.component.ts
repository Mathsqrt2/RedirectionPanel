import { CanComponentDeactivate, CanDeactivateService } from '../../services/can-deactivate-guard.service';
import { DownloadFilter, Filters } from '../../../../../types/constants.types';
import { Log, QueryParams } from '../../../../../types/property.types';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { LogsService } from '../../services/logs.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'display-logs',
  templateUrl: './display-logs.component.html',
  styleUrl: './display-logs.component.scss'
})

export class DisplayLogsComponent implements CanComponentDeactivate {

  @ViewChild('scrollContainer', { static: true }) scrollContainer: ElementRef;

  private isDataLoading: boolean = true;
  protected params: QueryParams;
  protected downloadFilter: DownloadFilter;

  protected maxDateLock = new Date(Date.now() + this.logsService.timeOffset).toISOString().split('T')[0];
  protected filters: Filters[] = [`all`, `success`, `failed`, `completed`, `received`, `deleted`, `created`, `updated`, `authorized`];
  protected filter: Filters = this.filters[0];
  protected logs: Log[];

  constructor(
    private readonly logsService: LogsService,
    private readonly canLeave: CanDeactivateService,
  ) {
    this.params = this.logsService.params.getValue();
    this.downloadFilter = this.logsService.downloadFilter.getValue();

    this.logsService.allLogs.subscribe((state: Log[]) => this.logs = state);
    this.logsService.fetchLogs();

    this.canLeave.getSubject('logsLoading').subscribe((state: boolean) => this.isDataLoading = state);
    this.canLeave.getSubject('logsLoading').next(true);
  }

  private confirm = (): boolean => {
    return window.confirm(`There are unfinished processes. Are you sure you want to leave now?`);
  }

  public canDeactivate = (): Observable<boolean> | Promise<boolean> | boolean => {

    if (this.canLeave.getValue('logsLoading')) {
      return this.confirm();
    }

    return true;
  };

  protected onFilter = async (): Promise<void> => {
    this.params.offset = 0;
    this.scrollContainer.nativeElement.scrollTo(0, 0);

    if (!this.isDataLoading) {
      this.canLeave.getSubject('logsLoading').next(true);
      this.logsService.params.next(this.params);
      this.logsService.filter.next(this.filter);
      await this.logsService.fetchLogs(true);
    }
  }

  protected onScroll = async (): Promise<void> => {
    const element = this.scrollContainer.nativeElement;
    const condition: boolean = element.scrollHeight - element.scrollTop === element.clientHeight

    if (condition && !this.isDataLoading) {
      this.canLeave.getSubject('logsLoading').next(true);
      this.logsService.downloadFilter.next('current view');
      await this.logsService.fetchLogs(false);
    }
  }

  private saveFile = (data: string, extension: string, mode?: DownloadFilter): void => {
    let anchor = document.createElement('a');
    const file = new Blob([data], { type: extension === 'json' ? 'application/json' : 'text/csv' });
    anchor.href = URL.createObjectURL(file);
    anchor.download = `export_${mode === 'all data' ? 'everything' : this.logs.length}_logs_${this.filter}_${new Date().toLocaleDateString('pl-PL')}.${extension}`;
    anchor.click();
  }

  protected onDownload = async (extension: string): Promise<void> => {
    const heading = ['index', 'id', 'label', 'description', 'status'];

    if (this.downloadFilter === 'all data') {
      this.canLeave.getSubject('logsLoading').next(true);
      await this.logsService.fetchLogs(true);
    }

    let logs: Log[] = this.logsService.downloadLogs.getValue();

    let outputData = '';

    if (extension === 'csv') {
      for (let label of heading) {
        outputData += `${label},`;
      }
      outputData += '\n';

      for (let indx in logs) {
        outputData += `"${indx}",`;
        outputData += `"${logs[indx].id}",`;
        outputData += `"${logs[indx].label?.replaceAll("\"", "")}",`;
        outputData += `"${logs[indx].description?.replaceAll("\"", "")}",`;
        outputData += `"${logs[indx].status?.replaceAll("\"", "")}",`;
        outputData += `\n`;
      }

    } else if (extension === 'json') {
      outputData = JSON.stringify(logs);
    }

    this.saveFile(outputData, extension, this.downloadFilter);
    this.canLeave.getSubject('logsLoading').next(false);
  }

  protected onUpdateDownloadFilter = (): void => {
    this.logsService.downloadFilter.next(this.downloadFilter);
  }

  protected onMinReset = (): void => {
    this.params.minDate = undefined;
    this.onFilter();
  }

  protected onMaxReset = (): void => {
    this.params.maxDate = undefined;
    this.onFilter();
  }
}