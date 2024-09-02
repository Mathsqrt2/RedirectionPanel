import { RouteModel } from "../models/route.model";

export class AdminService {

    private routes: RouteModel[] = [
        new RouteModel({ title: "Redirections", route: 'redirections' }),
        new RouteModel({ title: 'Users', route: 'users' }),
        new RouteModel({ title: 'Logs', route: 'logs' }),
        new RouteModel({ title: 'profile', route: 'profile' }),
    ]

    addRoute(route: RouteModel): void {
        this.routes.push(route);
    }

    getRoutes(amount?: number): RouteModel[] {
        if (amount) {
            return this.routes.filter((r, indx) => indx < amount);
        }
        return this.routes;
    }

}