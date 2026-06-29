import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventarioRestaurante } from './inventario-restaurante';

describe('InventarioRestaurante', () => {
  let component: InventarioRestaurante;
  let fixture: ComponentFixture<InventarioRestaurante>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InventarioRestaurante],
    }).compileComponents();

    fixture = TestBed.createComponent(InventarioRestaurante);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
