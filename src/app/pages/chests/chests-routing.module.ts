import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ChestsPage } from './chests.page';

const routes: Routes = [
  {
    path: '',
    component: ChestsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ChestsPageRoutingModule {}
