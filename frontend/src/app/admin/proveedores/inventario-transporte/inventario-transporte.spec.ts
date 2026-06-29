import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventarioTransporte } from './inventario-transporte';

describe('InventarioTransporte', () => {
  let component: InventarioTransporte;
  let fixture: ComponentFixture<InventarioTransporte>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InventarioTransporte],
    }).compileComponents();

    fixture = TestBed.createComponent(InventarioTransporte);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
