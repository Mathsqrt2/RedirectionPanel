import { HttpClient } from '@angular/common/http';
import { Component, HostListener } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'display-logs',
  templateUrl: './display-logs.component.html',
  styleUrl: './display-logs.component.scss'
})

export class DisplayLogsComponent {

  private domain = `http://localhost:3000`;
  private baseUrl = `${this.domain}/api`;
  public allLogs: BehaviorSubject<Log[]> = new BehaviorSubject<Log[]>([]);
  public logs: Log[];
  public currentFilter: string = 'all';
  public filters: Filters[] = ['all', 'success', 'failed', 'completed'];

  private count: number = 25;
  private offset: number = 0;

  constructor(
    private readonly http: HttpClient,
  ) {
    this.allLogs.subscribe((newState: Log[]) => {
      this.logs = newState;
    })
    this.fetchData();
  }

  fetchLogs = async (status?: string): Promise<void> => {
    if (status) {
      this.http.get(`${this.baseUrl}/logs/status/${status}?maxCount=${this.count}&offset=${this.offset}`, { withCredentials: true }).subscribe((response: LogRequest) => {
        this.offset += this.count;
        const currentState = this.allLogs.getValue();
        const values = [...currentState, ...response.content].sort((a: Log, b: Log) => b.id - a.id);
        this.allLogs.next(values)
      })
    } else {
      this.http.get(`${this.baseUrl}/logs?maxCount=${this.count}&offset=${this.offset}`, { withCredentials: true }).subscribe((response: LogRequest) => {
        this.offset += this.count;
        const currentState = this.allLogs.getValue();
        const values = [...currentState, ...response.content].sort((a: Log, b: Log) => b.id - a.id);
        this.allLogs.next(values)
      })
    }
  }

  async onFilter() {
    this.allLogs.next([]);
    this.offset = 0;
    if (this.currentFilter === 'all') {
      await this.fetchLogs();
    } else {
      await this.fetchLogs(this.currentFilter);
    }
  }

  fetchData = async (): Promise<void> => {
    await this.fetchLogs();
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
}

type Filters = 'all' | 'success' | 'failed' | 'completed';