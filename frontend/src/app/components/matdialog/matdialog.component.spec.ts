import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatdialogComponent } from './matdialog.component';

describe('MatdialogComponent', () => {
  let component: MatdialogComponent;
  let fixture: ComponentFixture<MatdialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatdialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MatdialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
