import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from '@angular/router';
import { Observable } from 'rxjs';
import { PatientService } from '../service/patient.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuardGuard implements CanActivate {
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
    const requiresGuest = route.data?.['requiresGuest'] === true;

    if (requiresGuest) {
      if (currentUser) {
        return this.router.createUrlTree(['/analytics']);
      }
      return true;
    }

    if (currentUser) {
      return true;
    }

    return this.router.createUrlTree(['/login'], {
      queryParams: { returnUrl: state.url },
    });
  }
}
