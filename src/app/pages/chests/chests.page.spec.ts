import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChestsPage } from './chests.page';

describe('ChestsPage', () => {
  let component: ChestsPage;
  let fixture: ComponentFixture<ChestsPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ChestsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
