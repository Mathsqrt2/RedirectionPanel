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
  private offset: number = 0;
  private count: number = 25;
  private request = 0;


  public currentFilter: string = 'all';
  public filters: Filters[] = ['all', 'success', 'failed', 'completed'];
  public logs: Log[];
  public maxDateLock = new Date().toISOString().split('T')[0];

  public minDate;
  public maxDate;

  constructor(
    private readonly http: HttpClient,
  ) {
    this.allLogs.subscribe((newState: Log[]) => {
      this.logs = newState;
    })
    this.onFetchLogs();
  }

  private filterLogsByDate = (logs: Log[]): Log[] => { 
    if (this.minDate) {
      logs = logs.filter((log: Log) => log?.jstimestamp > new Date(this.minDate).getTime());
    }

    if (this.maxDate) {
      logs = logs.filter((log: Log) => log?.jstimestamp < new Date(this.maxDate).getTime());
    }
    return logs
  }

  onFetchLogs = async (status?: string): Promise<void> => {

    if (status) {
      this.http.get(`${this.baseUrl}/logs/status/${status}?maxCount=${this.count}&offset=${this.offset + this.request}`, { withCredentials: true }).subscribe((response: LogRequest) => {
        this.offset += this.count;
        const currentState = this.allLogs.getValue();
        let values = [...currentState, ...response.content].sort((a: Log, b: Log) => b.id - a.id);

        values = this.filterLogsByDate(values);

        this.allLogs.next(values)
        this.isDataLoading = false;
      })
    } else {
      this.http.get(`${this.baseUrl}/logs?maxCount=${this.count}&offset=${this.offset + this.request}`, { withCredentials: true }).subscribe((response: LogRequest) => {
        this.offset += this.count;
        const currentState = this.allLogs.getValue();
        let values = [...currentState, ...response.content].sort((a: Log, b: Log) => b.id - a.id);

        if (this.minDate) {
          values = values.filter((log: Log) => log?.jstimestamp > new Date(this.minDate).getTime());
        }

        if (this.maxDate) {
          values = values.filter((log: Log) => log?.jstimestamp < new Date(this.maxDate).getTime());
        }

        this.allLogs.next(values)
        this.isDataLoading = false;
      })
    }

    this.request += 2;
  }

  onFilter = async () => {
    this.allLogs.next([]);
    this.offset = 0;
    if (this.currentFilter === 'all' && !this.isDataLoading) {
      this.isDataLoading = true;
      await this.onFetchLogs();
    } else {
      this.isDataLoading = true;
      await this.onFetchLogs(this.currentFilter);
    }
  }

  onScroll(): void {
    const element = this.scrollContainer.nativeElement;
    const condition: boolean = element.scrollHeight - element.scrollTop === element.clientHeight

    if (condition && !this.isDataLoading) {
      this.isDataLoading = true;
      if (this.currentFilter === 'all') {
        this.onFetchLogs();
      } else {
        this.onFetchLogs(this.currentFilter);
      }
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
    anchor.download = `export_${this.logs.length}_logs_${this.currentFilter}_${new Date().toLocaleDateString('pl-PL')}.${extension}`;
    anchor.click();
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