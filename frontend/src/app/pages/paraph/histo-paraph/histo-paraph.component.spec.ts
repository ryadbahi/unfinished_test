import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoParaphComponent } from './histo-paraph.component';

describe('HistoParaphComponent', () => {
  let component: HistoParaphComponent;
  let fixture: ComponentFixture<HistoParaphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoParaphComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HistoParaphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
