import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';

@Component({
  selector: 'display-logs',
  templateUrl: './display-logs.component.html',
  styleUrl: './display-logs.component.scss'
})

export class DisplayStatsComponent {

  private domain = `http://localhost:3000`;
  private baseUrl = `${this.domain}/api`;
  logs: Log[] = [];

  constructor(
    private readonly http: HttpClient,
  ) {

  }

  fetchLogs = async (): Promise<void> => {
    this.http.get(this.baseUrl, { withCredentials: true }).subscribe((response: LogRequest) => {
      console.log(response.content);
      this.logs = response.content;
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

type Log = {
  label: string,
  description: string,
  status: string,
  duration: string,
}