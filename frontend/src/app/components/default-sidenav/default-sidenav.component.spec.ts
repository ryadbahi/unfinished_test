import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DefaultSidenavComponent } from './default-sidenav.component';

describe('DefaultSidenavComponent', () => {
  let component: DefaultSidenavComponent;
  let fixture: ComponentFixture<DefaultSidenavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DefaultSidenavComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DefaultSidenavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
