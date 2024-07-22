import { RouteModel } from "../models/route.model";

export class AdminService {

    private routes: RouteModel[] = [
        new RouteModel({ title: "Przekierowania", route: 'redirections' }),
        new RouteModel({ title: 'Użytkownicy', route: 'users' }),
        new RouteModel({ title: 'Statystyki', route: 'stats' }),
    ]

    addRoute(route: RouteModel): void {
        this.routes.push(route);
    }

    getRoutes(amount?: number): RouteModel[] {
        if(amount){
            return this.routes.filter((r,indx) => indx < amount );
        }         
        return this.routes;
    }

}