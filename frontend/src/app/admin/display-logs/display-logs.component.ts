import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { BehaviorSubject, first, Observable } from 'rxjs';
import { CanComponentDeactivate, CanDeactivateService } from '../../services/can-deactivate-guard.service';

@Component({
  selector: 'display-logs',
  templateUrl: './display-logs.component.html',
  styleUrl: './display-logs.component.scss'
})

export class DisplayLogsComponent implements CanComponentDeactivate {

  @ViewChild('scrollContainer', { static: true }) scrollContainer: ElementRef;

  private domain = `http://localhost:3000`;
  private baseUrl = `${this.domain}/api`;
  private allLogs: BehaviorSubject<Log[]> = new BehaviorSubject<Log[]>([]);
  private isDataLoading: boolean = true;
  private timeOffset = new Date().getTimezoneOffset() * -1000 * 60;
  public downloadFilter: DownloadFilter = 'current view';

  protected params: QueryParams = {
    offset: 0,
    maxCount: 100,
    minDate: null,
    maxDate: new Date(Date.now() + this.timeOffset).toISOString().split('T')[0],
  }

  public filters: Filters[] = [
    `all`, `success`, `failed`,
    `completed`, `received`, `deleted`,
    `created`, `updated`, `authorized`
  ];
  public filter: string = this.filters[0];
  public logs: Log[];
  public maxDateLock = new Date(Date.now() + this.timeOffset).toISOString().split('T')[0];

  constructor(
    private readonly http: HttpClient,
    private readonly canLeave: CanDeactivateService,
  ) {
    this.canLeave.getSubject('logsLoading').subscribe((newState: boolean) => {
      this.isDataLoading = newState;
    })
    this.allLogs.subscribe((newState: Log[]) => {
      this.logs = newState;
    })

    this.canLeave.getSubject('logsLoading').next(true);
    this.fetchLogs();
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

  private getQuery = (): string => {
    let params = '';
    let isFirst = true;
    for (let param in this.params) {
      if (this.params[param]) {
        params += isFirst ? `?${param}=${this.params[param]}` : `&${param}=${this.params[param]}`;
        isFirst = false
      }
    }
    return params;
  }

  private fetchLogs = async (newFetch: boolean = true): Promise<void> => {
    return new Promise(resolve => {
      const req = this.filter !== 'all' ? `status/${this.filter}` : ``;

      this.http.get(`${this.baseUrl}/logs/${req}${this.downloadFilter === 'all data' ? '' : this.getQuery()}`, { withCredentials: true })
        .pipe(first())
        .subscribe(
          (response: LogRequest) => {
            this.params.offset += this.params.maxCount + 2;

            let values = newFetch ? response.content : [...this.allLogs.getValue(), ...response.content];
            values = values.sort((a: Log, b: Log) => b.id - a.id);

            this.allLogs.next(values);
            if (this.downloadFilter !== 'all data') {
              this.canLeave.getSubject('logsLoading').next(false);
            }
            resolve();
          })
    })
  }

  protected onFilter = async () => {
    this.params.offset = 0;
    if (!this.isDataLoading) {
      this.canLeave.getSubject('logsLoading').next(true);
      await this.fetchLogs();
    }
  }

  async onScroll(): Promise<void> {
    const element = this.scrollContainer.nativeElement;
    const condition: boolean = element.scrollHeight - element.scrollTop === element.clientHeight

    if (condition && !this.isDataLoading) {
      this.canLeave.getSubject('logsLoading').next(true);
      await this.fetchLogs(false);
    }
  }

  private saveFile = (data: string, extension: string, mode?: DownloadFilter) => {
    let anchor = document.createElement('a');
    const file = new Blob([data], { type: extension === 'json' ? 'application/json' : 'text/csv' });
    anchor.href = URL.createObjectURL(file);
    anchor.download = `export_${mode === 'all data' ? 'everything' : this.logs.length}_logs_${this.filter}_${new Date().toLocaleDateString('pl-PL')}.${extension}`;
    anchor.click();
  }

  protected onDownload = async (extension: string) => {
    const heading = ['index', 'id', 'label', 'description', 'status'];
  
    if (this.downloadFilter === 'all data') {
      this.canLeave.getSubject('logsLoading').next(true);
      await this.fetchLogs(true);
    }

    let logs: Log[] = this.logs;
    console.log(logs);

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
    if (this.downloadFilter === 'all data') {
      this.canLeave.getSubject('logsLoading').next(false);
    }
  }

  protected onMinReset = () => {
    this.params.minDate = undefined;
    this.onFilter();
  }

  protected onMaxReset = () => {
    this.params.maxDate = undefined;
    this.onFilter();
  }
}

type LogRequest = {
  status: number,
  content: Log[],
}

export type Log = {
  id?: number,
  label: string,
  description: string,
  status: string,
  duration: string,
  jstimestamp?: number,
}

type Filters = `all` | `success` | `failed` | `completed` | `received` | `deleted` | `created` | `updated` | `authorized`;

type QueryParams = {
  maxCount?: number,
  offset?: number,
  maxDate?: string,
  minDate?: string,
}

type DownloadFilter = 'current view' | 'all data';