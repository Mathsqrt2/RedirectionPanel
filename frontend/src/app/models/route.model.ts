import { Route } from "../../../../types/property.types";

export class RouteModel {

    constructor(private config: Route) { }

    getRoute(): string {
        return this.config.route;
    }

    getTitle(): string {
        return this.config.title;
    }
}