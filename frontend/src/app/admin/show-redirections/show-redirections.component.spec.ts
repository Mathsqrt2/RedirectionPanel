import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowRedirectionsComponent } from './show-redirections.component';

describe('ShowRedirectionsComponent', () => {
  let component: ShowRedirectionsComponent;
  let fixture: ComponentFixture<ShowRedirectionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ShowRedirectionsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ShowRedirectionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
