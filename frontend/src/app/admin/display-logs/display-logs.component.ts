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

  constructor(
    private readonly http: HttpClient,
  ) {

  }

  fetchLogs = async (): Promise<void> => {
    this.http.get(this.baseUrl, { withCredentials: true }).subscribe((response: LogRequest) => {
      this.logs.next(response.content);
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
  label: string,
  description: string,
  status: string,
  duration: string,
}