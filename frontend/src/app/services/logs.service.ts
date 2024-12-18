import { Filters, DownloadFilter } from "../../../types/constants.types";
import { CanDeactivateService } from "./can-deactivate-guard.service";
import { Log, QueryParams } from "../../../types/property.types";
import { LogResponse } from "../../../types/response.types";
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, first, firstValueFrom } from 'rxjs';
import { Injectable } from "@angular/core";

@Injectable()

export class LogsService {

    private domain = `http://localhost:3000`;
    private baseUrl = `${this.domain}/api`;

    constructor(
        private readonly http: HttpClient,
        private readonly canLeave: CanDeactivateService,
    ) { }

    public timeOffset = new Date().getTimezoneOffset() * -1000 * 60;
    public downloadFilter: BehaviorSubject<DownloadFilter> = new BehaviorSubject<DownloadFilter>('current view');
    public downloadLogs: BehaviorSubject<Log[]> = new BehaviorSubject<Log[]>([]);
    public allLogs: BehaviorSubject<Log[]> = new BehaviorSubject<Log[]>([]);
    public filter: BehaviorSubject<Filters> = new BehaviorSubject<Filters>('all');
    public params: BehaviorSubject<QueryParams> = new BehaviorSubject<QueryParams>({
        offset: 0,
        maxCount: 20,
        minDate: null,
        maxDate: new Date(Date.now() + this.timeOffset).toISOString().split('T')[0],
    });

    private getQuery = (currentParams: QueryParams): string => {
        let params = '';
        let isFirst = true;
        for (let param in currentParams) {
            if (currentParams[param]) {
                params += isFirst ? `?${param}=${currentParams[param]}` : `&${param}=${currentParams[param]}`;
                isFirst = false
            }
        }
        return params;
    }

    public fetchLogs = async (newFetch: boolean = true): Promise<boolean> => {

        const filter = this.filter.getValue();
        const params = this.params.getValue();
        const downloadFilter = this.downloadFilter.getValue();

        const req = filter !== 'all' ? `status/${filter}` : ``;
        const url = `${this.baseUrl}/logs/${req}${downloadFilter === 'all data' ? '' : this.getQuery(params)}`;

        let response: LogResponse;

        try {
            response = await firstValueFrom(this.http.get<LogResponse>(url, { withCredentials: true }).pipe(first()));
        } catch (err) {
            return false;
        }

        if (response.status !== 302) {
            return false;
        }

        if (downloadFilter !== 'all data') {

            this.params.next({ ...params, offset: params.offset + 2 + params.maxCount });
            let values = newFetch ? response.content : [...this.allLogs.getValue(), ...response.content];
            values = values.sort((a: Log, b: Log) => b.id - a.id);
            this.allLogs.next(values);

            this.canLeave.getSubject('logsLoading').next(false);

        } else {

            let values = response.content;
            values = values.sort((a: Log, b: Log) => b.id - a.id);
            this.downloadLogs.next(values);
            this.params.next({ ...params, offset: params.offset + 2 });

        }

        return true;
    }
}