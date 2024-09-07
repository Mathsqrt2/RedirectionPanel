import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'display-logs',
  templateUrl: './display-logs.component.html',
  styleUrl: './display-logs.component.scss'
})

export class DisplayLogsComponent {

  @ViewChild('scrollContainer', { static: true }) scrollContainer: ElementRef;

  private domain = `http://localhost:3000`;
  private baseUrl = `${this.domain}/api`;
  private allLogs: BehaviorSubject<Log[]> = new BehaviorSubject<Log[]>([]);
  private isDataLoading: boolean = true;
  private timeOffset = new Date().getTimezoneOffset() * -1000 * 60;

  protected params: QueryParams = {
    offset: 0,
    maxCount: 100,
    minDate: null,
    maxDate: new Date(Date.now() + this.timeOffset).toISOString().split('T')[0],
  }

  public filter: string = 'all';
  public filters: Filters[] = ['all', 'success', 'failed', 'completed'];
  public logs: Log[];
  public maxDateLock = new Date(Date.now() + this.timeOffset).toISOString().split('T')[0];

  constructor(
    private readonly http: HttpClient,
  ) {
    this.allLogs.subscribe((newState: Log[]) => {
      this.logs = newState;
    })
    this.fetchLogs();
  }

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
    const req = this.filter !== 'all' ? `status/${this.filter}` : ``;

    this.http.get(`${this.baseUrl}/logs/${req}${this.getQuery()}`, { withCredentials: true }).subscribe(
      (response: LogRequest) => {
        this.params.offset += this.params.maxCount + 2;

        let values = newFetch ? [...response.content] : [...this.allLogs.getValue(), ...response.content];
        values = values.sort((a: Log, b: Log) => b.id - a.id);

        this.allLogs.next(values);
        this.isDataLoading = false;
      })
  }

  onFilter = async () => {
    this.params.offset = 0;
    if (!this.isDataLoading) {
      this.isDataLoading = true;
      await this.fetchLogs();
    }
  }

  async onScroll(): Promise<void> {
    const element = this.scrollContainer.nativeElement;
    const condition: boolean = element.scrollHeight - element.scrollTop === element.clientHeight

    if (condition && !this.isDataLoading) {
      this.isDataLoading = true;
      await this.fetchLogs(false);
    }

  }

  onDownload = (extension: string) => {
    const heading = ['index', 'id', 'label', 'description', 'status'];
    const logs = this.logs;
    let outputData = '';

    if (extension === 'csv') {
      for (let label of heading) {
        outputData += `${label},`;
      }
      outputData += '\n';

      for (let indx in logs) {
        outputData += `"${indx}",`;
        outputData += `"${logs[indx].id}",`;
        outputData += `"${logs[indx].label.replaceAll("\"", "")}",`;
        outputData += `"${logs[indx].description.replaceAll("\"", "")}",`;
        outputData += `"${logs[indx].status.replaceAll("\"", "")}",`;
        outputData += `\n`;
      }
    } else if (extension === 'json') {
      outputData = JSON.stringify(logs);
    }

    let anchor = document.createElement('a');
    const file = new Blob([outputData], { type: extension === 'json' ? 'application/json' : 'text/csv' });
    anchor.href = URL.createObjectURL(file);
    anchor.download = `export_${this.logs.length}_logs_${this.filter}_${new Date().toLocaleDateString('pl-PL')}.${extension}`;
    anchor.click();
  }

  onMinReset = () => {
    this.params.minDate = undefined;
    this.onFilter();
  }

  onMaxReset = () => {
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

type Filters = 'all' | 'success' | 'failed' | 'completed';

type QueryParams = {
  maxCount?: number,
  offset?: number,
  maxDate?: string,
  minDate?: string,
}