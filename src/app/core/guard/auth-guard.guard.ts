import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateChild,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from '@angular/router';
import { Observable } from 'rxjs';
import { PatientService } from '../service/patient.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuardGuard implements CanActivate, CanActivateChild {
  constructor(
    private patientService: PatientService,
    private router: Router,
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    const currentUser = this.patientService.getCurrentUser();
    const selectedDoctor = localStorage.getItem('selectedDoctor');
    const requiresGuest = route.data?.['requiresGuest'] === true;

    if (requiresGuest) {
      if (currentUser || selectedDoctor) {
        return this.router.createUrlTree(['/dashboard']);
      }
      return true;
    }

    if (currentUser || selectedDoctor) {
      return true;
    }

    return this.router.createUrlTree(['/login'], {
      queryParams: { returnUrl: state.url },
    });
  }

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    return this.canActivate(childRoute, state);
  }
}
