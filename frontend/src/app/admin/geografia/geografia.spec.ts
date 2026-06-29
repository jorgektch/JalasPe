import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Geografia } from './geografia';

describe('Geografia', () => {
  let component: Geografia;
  let fixture: ComponentFixture<Geografia>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Geografia],
    }).compileComponents();

    fixture = TestBed.createComponent(Geografia);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
