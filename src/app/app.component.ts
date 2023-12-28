import {Component, NgZone} from '@angular/core';
import {App, URLOpenListenerEvent} from "@capacitor/app";
import {AuthService} from "./services/auth.service";
import {Router} from "@angular/router";
import {NavController} from "@ionic/angular";
import {DataService} from "./services/data.service";

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.scss'],
})
export class AppComponent {
    user = this.authService.getCurrentUser();

    constructor(private zone: NgZone, private router: Router, private authService: AuthService, private navContoller: NavController, private data: DataService,) {
        this.setupListener();
    }

    setupListener() {
        App.addListener('appUrlOpen', async (data: URLOpenListenerEvent) => {
            console.log('app opened with URL: ', data);

            const openUrl = data.url;
            // const slug = openUrl.split('login').pop();
            // const navigateUrl = `/groups${slug}`;
            // console.log('use url: ', navigateUrl);
            // @ts-ignore
            const access = openUrl.split('#access_token=').pop().split('&')[0];
            console.log('access: ', access);
            // @ts-ignore
            const refresh = openUrl.split('&refresh_token=').pop().split('&')[0];
            console.log('refresh: ', refresh);

            await this.authService.setSession(access, refresh);

            this.zone.run(() => {
                this.router.navigateByUrl('/chests', {replaceUrl: true});

                // this.location.replaceState(navigateUrl);
                // window.location.reload();
            });
        });
    }

    signOut() {
        this.authService.signOut();
    }

    openLogin() {
        this.navContoller.navigateBack('/');
    }
}
