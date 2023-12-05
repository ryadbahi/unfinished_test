import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiaddComponent } from './multiadd.component';

describe('MultiaddComponent', () => {
  let component: MultiaddComponent;
  let fixture: ComponentFixture<MultiaddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MultiaddComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MultiaddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
