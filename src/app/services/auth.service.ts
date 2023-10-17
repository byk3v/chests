import { Injectable } from '@angular/core'
import { Router } from '@angular/router'
import { isPlatform } from '@ionic/angular'
import { createClient, SupabaseClient, User } from '@supabase/supabase-js'
import { BehaviorSubject, Observable } from 'rxjs'
import { environment } from '../../environments/environment'

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private supabase: SupabaseClient
  // @ts-ignore
  private currentUser: BehaviorSubject<User | boolean> = new BehaviorSubject<User | boolean>(null);

  constructor(private router: Router) {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey)

    this.supabase.auth.onAuthStateChange((event, sess) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        console.log('SET USER')

        // @ts-ignore
        this.currentUser.next(sess.user)
      } else {
        this.currentUser.next(false)
      }
    })

    // Trigger initial session load
    this.loadUser()
  }

  async loadUser() {
    if (this.currentUser.value) {
      // User is already set, no need to do anything else
      return
    }
    const user = await this.supabase.auth.getUser()

    if (user.data.user) {
      this.currentUser.next(user.data.user)
    } else {
      this.currentUser.next(false)
    }
  }

  signUp(credentials: { email: string; password: string }) {
    return this.supabase.auth.signUp(credentials)
  }

  signIn(credentials: { email: string; password: string }) {
    return this.supabase.auth.signInWithPassword(credentials)
  }

  signInWithEmail(email: string) {
    //return this.supabase.auth.signInWithOtp({ email })

    const redirectTo = isPlatform('capacitor') ? 'supachat://login' : `${window.location.origin}/chests`;
    console.log('set redirect: ', redirectTo);

    return this.supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo } });
  }

  sendPwReset(email:string) {
    return this.supabase.auth.resetPasswordForEmail(email)
  }

  async signOut() {
    await this.supabase.auth.signOut()
    this.router.navigateByUrl('/', { replaceUrl: true })
  }

  getCurrentUser(): Observable<User | boolean> {
    return this.currentUser.asObservable()
  }

  getCurrentUserId(): string | null {
    if (this.currentUser.value) {
      return (this.currentUser.value as User).id
    } else {
      return null
    }
  }

  async setSession(access_token: any, refresh_token: any) {
    return this.supabase.auth.setSession({ access_token, refresh_token });
  }
}
