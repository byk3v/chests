import { Component, OnInit } from '@angular/core';
import {AuthService} from "../../services/auth.service";
import {DataService} from "../../services/data.service";
import {AlertController, LoadingController, NavController} from "@ionic/angular";
import {Router} from "@angular/router";
import {ChestBD, ParsedChest} from "../../models/parsed-chest";

@Component({
  selector: 'app-chests',
  templateUrl: './chests.page.html',
  styleUrls: ['./chests.page.scss'],
})
export class ChestsPage implements OnInit {
  user = this.authService.getCurrentUser();
  chests: ChestBD[] = [];

  constructor(
      private authService: AuthService,
      private data: DataService,
      private alertController: AlertController,
      private loadingController: LoadingController,
      private navContoller: NavController,
      private router: Router
  ) {
  }

  ngOnInit() {
  }

  async ionViewWillEnter() {
    // @ts-ignore
    this.chests = await this.data.getChests();
    console.log('groups: ', this.chests);
  }

  signOut() {
    this.authService.signOut();
  }

  openLogin() {
    this.navContoller.navigateBack('/');
  }

}
