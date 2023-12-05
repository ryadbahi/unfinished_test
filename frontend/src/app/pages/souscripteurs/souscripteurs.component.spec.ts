import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SouscripteursComponent } from './souscripteurs.component';

describe('SouscripteursComponent', () => {
  let component: SouscripteursComponent;
  let fixture: ComponentFixture<SouscripteursComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SouscripteursComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SouscripteursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
