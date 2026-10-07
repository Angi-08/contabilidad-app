import { Injectable, inject, signal } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  user,
  updateProfile,
  User
} from '@angular/fire/auth';
import { Observable, from, map } from 'rxjs';
import { AppUser } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);

  // Signal reactivo del usuario actual
  currentUser = signal<User | null>(null);

  user$ = user(this.auth);

  constructor() {
    this.user$.subscribe(u => this.currentUser.set(u));
  }

  register(email: string, password: string, displayName?: string): Observable<User> {
    return from(createUserWithEmailAndPassword(this.auth, email, password)).pipe(
      map(cred => {
        if (displayName && cred.user) {
          updateProfile(cred.user, { displayName });
        }
        return cred.user;
      })
    );
  }

  login(email: string, password: string): Observable<User> {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      map(cred => cred.user)
    );
  }

  logout(): Observable<void> {
    return from(signOut(this.auth));
  }

  get currentUid(): string | null {
    return this.currentUser()?.uid ?? null;
  }
}
