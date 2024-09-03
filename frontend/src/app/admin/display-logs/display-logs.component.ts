import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'display-logs',
  templateUrl: './display-logs.component.html',
  styleUrl: './display-logs.component.scss'
})

export class DisplayLogsComponent {

  private domain = `http://localhost:3000`;
  private baseUrl = `${this.domain}/api`;
  public logs: BehaviorSubject<Log[]> = new BehaviorSubject<Log[]>([]);

  private count: number = 25;
  private offset: number = 0;

  constructor(
    private readonly http: HttpClient,
  ) {
    this.fetchData();
  }

  fetchLogs = async (): Promise<void> => {
    this.http.get(`${this.baseUrl}/logs?maxCount=${this.count}&offset=${this.offset}`, { withCredentials: true }).subscribe((response: LogRequest) => {
      this.offset += this.count;
      const currentState = this.logs.getValue();
      const values = [...currentState, ...response.content].sort((a: Log, b: Log) => b.id - a.id);
      this.logs.next(values)
    })
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