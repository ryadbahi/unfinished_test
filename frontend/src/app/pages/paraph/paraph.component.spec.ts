import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParaphComponent } from './paraph.component';

describe('ParaphComponent', () => {
  let component: ParaphComponent;
  let fixture: ComponentFixture<ParaphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParaphComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ParaphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
