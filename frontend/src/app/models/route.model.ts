export type Route = {
    title: string,
    route: string,
}

export class RouteModel {

    constructor(private config: Route) { }

    getRoute(): string {
        return this.config.route;
    }

    getTitle(): string {
        return this.config.title;
    }
}