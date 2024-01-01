import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidlistComponent } from './validlist.component';

describe('ValidlistComponent', () => {
  let component: ValidlistComponent;
  let fixture: ComponentFixture<ValidlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValidlistComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ValidlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
