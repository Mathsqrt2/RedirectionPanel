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
  private count: number = 500;

  public currentFilter: string = 'all';
  public filters: Filters[] = ['all', 'success', 'failed', 'completed'];
  public logs: Log[];
  private timeOffset = new Date().getTimezoneOffset() * -1000 * 60;
  public maxDateLock = new Date(Date.now() + this.timeOffset).toISOString().split('T')[0];

  public minDate;
  public maxDate;

  constructor(
    private readonly http: HttpClient,
  ) {
    this.allLogs.subscribe((newState: Log[]) => {
      this.logs = this.filterLogsByDate(newState);
    })
    this.fetchLogs();
  }

  private filterLogsByDate = (logs: Log[]): Log[] => {

    if (this.minDate) {
      logs = logs.filter(
        (log: Log) => (
          new Date(new Date(log?.jstimestamp + this.timeOffset).toISOString().split("T")[0]).getTime() >= new Date(this.minDate).getTime())
      );
    }

    if (this.maxDate) {
      logs = logs.filter(
        (log: Log) => new Date(new Date(log?.jstimestamp + this.timeOffset).toISOString().split("T")[0]).getTime() <= new Date(this.maxDate).getTime()
      );
    }

    return logs
  }

  private fetchLogs = async (status?: string): Promise<void> => {
    return new Promise(resolve => {
      if (status) {
        this.http.get(`${this.baseUrl}/logs/status/${status}?maxCount=${this.count}&offset=${this.offset}`, { withCredentials: true }).subscribe(
          (response: LogRequest) => {
            this.offset += this.count + 2;
            const currentState = this.allLogs.getValue();
            const values = [...currentState, ...response.content].sort((a: Log, b: Log) => b.id - a.id);
            this.allLogs.next(values);
            this.isDataLoading = false;
            resolve();
          })
      } else {
        this.http.get(`${this.baseUrl}/logs?maxCount=${this.count}&offset=${this.offset}`, { withCredentials: true }).subscribe(
          (response: LogRequest) => {
            this.offset += this.count + 2;
            const currentState = this.allLogs.getValue();
            const values = [...currentState, ...response.content].sort((a: Log, b: Log) => b.id - a.id);
            this.allLogs.next(values)
            this.isDataLoading = false;
            resolve();
          })
      }
    }
    );
  }

  onFilter = async () => {
    this.allLogs.next([]);
    this.offset = 0;
    let currentRound = 0;
    if (this.currentFilter === 'all' && !this.isDataLoading) {
      do {
        this.isDataLoading = true;
        await this.fetchLogs();
        if (currentRound++ >= 25) {
          break;
        }
      } while (this.logs.length <= 15)

    } else {
      do {
        this.isDataLoading = true;
        await this.fetchLogs(this.currentFilter);
        if (currentRound++ >= 25) {
          break;
        }
      } while (this.logs.length <= 15)
    }
  }

  async onScroll(): Promise<void> {
    const element = this.scrollContainer.nativeElement;
    const condition: boolean = element.scrollHeight - element.scrollTop === element.clientHeight

    if (condition && !this.isDataLoading) {
      this.isDataLoading = true;
      if (this.currentFilter === 'all') {
        await this.fetchLogs();
      } else {
        await this.fetchLogs(this.currentFilter);
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

  onMinReset = () => {
    this.minDate = undefined;
    this.onFilter();
  }

  onMaxReset = () => {
    this.maxDate = undefined;
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