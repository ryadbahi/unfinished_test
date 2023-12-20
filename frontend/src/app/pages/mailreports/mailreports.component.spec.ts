import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MailreportsComponent } from './MailreportsComponent';

describe('MailreportsComponent', () => {
  let component: MailreportsComponent;
  let fixture: ComponentFixture<MailreportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MailreportsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MailreportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
