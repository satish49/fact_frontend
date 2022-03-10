import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from "@angular/common/http";

import { baseURL } from "./app-url.config";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { Router } from "@angular/router";
import { NotifierService } from "angular-notifier";

export class HttpInterceptorService implements HttpInterceptor {
  private readonly notifier: NotifierService;
  constructor(private router: Router, notifierService: NotifierService) {
    this.notifier = notifierService;
  }
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    /**
     * Interceptor to add Base URL for the application API request
     */
    const modifiedReq = req.clone({
      url: `${baseURL}${req.url}`,
    });
    return next.handle(modifiedReq).pipe(
      catchError((error: any) => {
        console.log(error);
        let userLoggedOut = false;
        if (error instanceof HttpErrorResponse) {
          console.log(error["error"]["msg"]);
          if (
            error["error"]["msg"] === "jwt token has expired" ||
            error["error"]["msg"] === "jwt token invalid" ||
            error["error"]["msg"] === "invalid token"
          ) {
            this.notifier.notify("error", "Session expired");
            localStorage.clear();
            this.router.navigate(["/login"]);
            userLoggedOut = true;
          }
        }
        if (!userLoggedOut) {
          return throwError(error);
        }
      })
    );
  }
}
