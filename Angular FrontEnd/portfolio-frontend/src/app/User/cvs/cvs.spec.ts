import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CVs } from './cvs';

describe('CVs', () => {
  let component: CVs;
  let fixture: ComponentFixture<CVs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CVs]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CVs);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
