import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from "@angular/router";
import { Injectable } from "@angular/core";

@Injectable({ providedIn: "root" })
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    router: RouterStateSnapshot
  ): boolean | UrlTree {
    if (localStorage.accessToken) {
      return true;
    } else {
      return this.router.createUrlTree(["/login"]);
    }
  }
}

@Injectable({ providedIn: "root" })
export class UnAuthGuard implements CanActivate {
  constructor(private router: Router) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    router: RouterStateSnapshot
  ): boolean | UrlTree {
    if (!localStorage.accessToken) {
      return true;
    } else {
      return this.router.createUrlTree(["/dashboard"]);
    }
  }
}

@Injectable({ providedIn: "root" })
export class RoleSelectGuard implements CanActivate {
  constructor(private router: Router) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    router: RouterStateSnapshot
  ): boolean | UrlTree {
    if (localStorage.status === "3") {
      return true;
    } else {
      return this.router.createUrlTree(["/role-select"]);
    }
  }
}

@Injectable({ providedIn: "root" })
export class NonRoleSelectGuard implements CanActivate {
  constructor(private router: Router) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    router: RouterStateSnapshot
  ): boolean | UrlTree {
    if (localStorage.status === "1") {
      return true;
    } else {
      return this.router.createUrlTree(["/dashboard"]);
    }
  }
}

@Injectable({ providedIn: "root" })
export class AdminGuard implements CanActivate {
  constructor(private router: Router) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    router: RouterStateSnapshot
  ): boolean | UrlTree {
    if (localStorage.roleId === "1") {
      return true;
    } else {
      return this.router.createUrlTree(["/dashboard"]);
    }
  }
}

@Injectable({ providedIn: "root" })
export class AdminOrTutorGuard implements CanActivate {
  constructor(private router: Router) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    router: RouterStateSnapshot
  ): boolean | UrlTree {
    if (localStorage.roleId === "1" || localStorage.roleId === "2") {
      return true;
    } else {
      return this.router.createUrlTree(["/dashboard"]);
    }
  }
}

@Injectable({ providedIn: "root" })
export class UserGuard implements CanActivate {
  constructor(private router: Router) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    router: RouterStateSnapshot
  ): boolean | UrlTree {
    if (localStorage.roleId !== "1") {
      return true;
    } else {
      return this.router.createUrlTree(["/dashboard"]);
    }
  }
}

@Injectable({ providedIn: "root" })
export class StudentGuard implements CanActivate {
  constructor(private router: Router) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    router: RouterStateSnapshot
  ): boolean | UrlTree {
    if (localStorage.roleId === "3") {
      return true;
    } else {
      return this.router.createUrlTree(["/dashboard"]);
    }
  }
}
