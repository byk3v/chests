import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ChestsPageRoutingModule } from './chests-routing.module';

import { ChestsPage } from './chests.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ChestsPageRoutingModule
  ],
  declarations: [ChestsPage]
})
export class ChestsPageModule {}
