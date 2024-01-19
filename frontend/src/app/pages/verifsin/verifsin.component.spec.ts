import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifsinComponent } from './verifsin.component';

describe('VerifsinComponent', () => {
  let component: VerifsinComponent;
  let fixture: ComponentFixture<VerifsinComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerifsinComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VerifsinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
