import { Injectable, Inject } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs'
import { MessageService } from './message.service';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';


@Injectable()
export class InterceptorService implements HttpInterceptor {
  private showNonErroringIntercepts: boolean = false;

  constructor(private messageService: MessageService, private authService: AuthService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.messageService.setMessage(undefined, null);

    if(this.showNonErroringIntercepts)
      console.log("Interceptor service: Intercepted HTTP request to ", req);

    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
        // Authorization: `Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1MjYzNTg3NTgsInVzZXJfbmFtZSI6IndoLm9wZXJhdG9yQGxmLm9yZyIsImF1dGhvcml0aWVzIjpbImxvYXZlc19hbmRfZmlzaGVzL2xvYXZlc19hbmRfZmlzaGVzL3VzZXIiXSwianRpIjoiNmY4YzcxYTgtMDhiNC00YzM5LWIxNjMtMWU2NDVmY2Y0YzJmIiwiY2xpZW50X2lkIjoid2ViYm94LWNsaWVudCIsInNjb3BlIjpbImJveGNoYWluL2lhbSIsImJveGNoYWluL2lkZSIsImJveGNoYWluL29yZyIsImJveGNoYWluL3NvbHV0aW9uIl19.ai9DAVQbOt8Ot8__KdTS443BjeW-10KbjYs4oDe8B_1tuwPM2g3UebczsBJL5o-KluPLAPiJxNkw88e1OzUSw8-LIWHCCf7XSDwzVxi3hkgfPYnN3YJTp2THZUzBGZICLEL2CJs7I_acP1-wo6Te3QnRnYMzSXQJXKboamJvCwjCAw9XtVkJuWuS87XvfH1DJfiIWuKdy99RiXShTK7cz3MAcJyxkpKhZYFxoRbXtTGOvuW_4dKf_6ruAeRWHEBxoc7Tqy327MoiabGWjjSScgESAOzG1pLq7f-sAQWHp_kOUZlxWj8n4nhJ0_PyXuBAPBszxAGLVMs-3G4HbLUUMA`
      }
    });
    return next.handle(req)
      .pipe(catchError(error => {
        //if error.error is in blob form, convert to it JSON then rethrow the whole error with the 
        //JSON-ified error.error
        if(error instanceof HttpErrorResponse && error.error instanceof Blob && error.error.type === "application/json") {
          const reader: FileReader = new FileReader();
          const obs = Observable.create((observer: any) => {
            reader.onloadend = (e) => {
              observer.error(
                //create a new error with all the same params as the old one but a readable error.error
                new HttpErrorResponse({
                  error: 'error', //JSON.parse(reader.error)
                  headers: error.headers,
                  status: error.status,
                  statusText: error.statusText,
                  url: error.url
                })
              );
              observer.complete();
            }
          });
          reader.readAsText(error.error);
          //throw the corrected error
          return obs;
        }

        if(error instanceof HttpErrorResponse) {
          if (error.status === 401) {
            localStorage.clear();
            this.authService.login();
          } else if (location.pathname !== '/callback') {
            this.messageService.setMessage((error.error.userMessage || error.error.developerMessage || error.error.statusMessage || error.error.status.userMessage || error.error.status.statusMessage || error.message || "No message"), "error");
            //console.error(error);
          }
        }
        //else return the error as is
        return Observable.throw(error);
      })) as any;
  }
}
