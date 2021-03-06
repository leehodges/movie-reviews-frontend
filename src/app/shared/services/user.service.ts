import { LocalStorageService } from './local-storage.service';
import { User } from './../models/user';
import { environment } from './../../../environments/environment.prod';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError, pipe } from 'rxjs';
import { map, catchError } from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private currentUserSubject: BehaviorSubject<User>
  public currentUser: Observable<User>
  private userApi: string
  constructor(
    private http: HttpClient,
    private storage: LocalStorageService
  ) {
    this.userApi = `${environment.apiUrl}api/v1/users`
    this.currentUserSubject = new BehaviorSubject<User>(this.storage.getItem('currentUser'))
    this.currentUser = this.currentUserSubject.asObservable()
  }

  public get currentUserValue(): User {
    return this.currentUserSubject.value // returns the currentUser value to a component
  }

  setCurrentUser(user: User) {
    this.currentUserSubject.next(user) // sets the currentUserSubject
  }

  login() {}

  signup(params) {
    return this.http.post<any>(`${this.userApi}/create`, params)
    .pipe(
      catchError(this.handleError),
      map(res => {
        if (res && res.token) {
          const newUser = new User(res)
          this.storage.setItem('accessToken', res.token)
          this.storage.setItem('currentUser', newUser)
          this.currentUserSubject.next(newUser)
          return { success: true, user: newUser }
        }
      })
    )
  }

  logout() {}

  handleError(error) {
    let returnError
    if (error.error instanceof ErrorEvent) {
      // client-side error
      returnError = { statusCode: error.error.statusCode, message: `Error ${error.error.message}`}
    } else {
      // server-side error
      returnError = { statusCode: error.error.statusCode, message: `Error Code: ${error.status}\nMessage: ${error.message}`}
    }
    return throwError(returnError)
  }
}
