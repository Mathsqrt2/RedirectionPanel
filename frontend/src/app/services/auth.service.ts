import Crypto from "crypto-js";
import { Subject } from "rxjs";

export class AuthService {
    private userLogin: string = Crypto.SHA256("qwertyz").toString(Crypto.enc.UTF8);
    private userPassword: string = Crypto.SHA256('dvpa123').toString(Crypto.enc.UTF8);
    public authSubject = new Subject<boolean>();

    async isAuthenticated() {
        return new Promise(
            (resolve, reject) => {
                setTimeout(() => {
                    if (localStorage?.authToken) {
                        const token = JSON.parse(localStorage.authToken);
                        resolve(token.userAllowed && (Date.now() <= token.expireDate));
                    } else {
                        resolve(false);
                    }
                }, 0);
                ;
            }
        )
    }

    async login(loginForm: { userLogin: string, userPassword: string }) {
        if (loginForm.userLogin == this.userLogin && loginForm.userPassword === this.userPassword) {
            localStorage.authToken = JSON.stringify({
                userAllowed: true,
                key: Crypto.SHA256(Date.now()).toString(Crypto.enc.UTF8),
                expireDate: new Date(Date.now() + 1000 * 60 * 60 * 24).getTime(),
            });
            return true;
        } else {
            return false;
        }
    }
    logout() {
        this.authSubject.next(false);
        localStorage.removeItem('authToken');
    }
}