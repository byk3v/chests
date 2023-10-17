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

  async createChest() {
    const testChest: ParsedChest = {
      title: 'title',
      player: 'player1',
      type: 'crypt'
    }
    const alert = await this.alertController.create({
      header: 'Create a Chest',
      message: 'Enter the data!',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Create chest',
          handler: async (data) => {
            const loading = await this.loadingController.create();
            await loading.present();

            const newChest = await this.data.createChest(testChest);
            console.log('new chest: ', newChest);
            if (newChest) {
              // @ts-ignore
              this.chests = await this.data.getChests();
              await loading.dismiss();

              await this.router.navigateByUrl(`/chests/${newChest.data.id}`);
            }
          },
        },
      ],
    });

    await alert.present();
  }

  signOut() {
    this.authService.signOut();
  }

  openLogin() {
    this.navContoller.navigateBack('/');
  }

}
