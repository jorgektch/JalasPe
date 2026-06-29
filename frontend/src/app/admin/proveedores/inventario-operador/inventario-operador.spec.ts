import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventarioOperador } from './inventario-operador';

describe('InventarioOperador', () => {
  let component: InventarioOperador;
  let fixture: ComponentFixture<InventarioOperador>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InventarioOperador],
    }).compileComponents();

    fixture = TestBed.createComponent(InventarioOperador);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
