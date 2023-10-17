import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {filter, map, Observable, take} from 'rxjs';
import {AuthService} from "../services/auth.service";
import {ToastController} from "@ionic/angular";

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router, private toastController: ToastController) {}
  canActivate(route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> {
    return this.auth.getCurrentUser().pipe(
        filter((val) => val !== null), // Filter out initial Behaviour subject value
        take(1), // Otherwise the Observable doesn't complete!
        map((isAuthenticated) => {
          if (isAuthenticated) {
            return true;
          } else {
            this.toastController
                .create({
                  message: 'You are not allowed to access this!',
                  duration: 2000,
                })
                .then((toast) => toast.present());

            return this.router.createUrlTree(['/chests']);
          }
        })
    );
  }
}