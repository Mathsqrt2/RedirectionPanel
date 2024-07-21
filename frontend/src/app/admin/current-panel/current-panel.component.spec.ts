import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrentPanelComponent } from './current-panel.component';

describe('CurrentPanelComponent', () => {
  let component: CurrentPanelComponent;
  let fixture: ComponentFixture<CurrentPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CurrentPanelComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CurrentPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
