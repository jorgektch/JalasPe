import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventarioHospedaje } from './inventario-hospedaje';

describe('InventarioHospedaje', () => {
  let component: InventarioHospedaje;
  let fixture: ComponentFixture<InventarioHospedaje>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InventarioHospedaje],
    }).compileComponents();

    fixture = TestBed.createComponent(InventarioHospedaje);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
