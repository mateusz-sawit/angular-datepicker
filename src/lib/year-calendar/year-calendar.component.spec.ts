import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {UtilsService} from '../common/services/utils/utils.service';
import {CalendarNavComponent} from '../calendar-nav/calendar-nav.component';
import {Dayjs} from 'dayjs';
import {YearCalendarComponent} from "./year-calendar.component";
import {YearCalendarService} from "./year-calendar.service";
import {IYear} from "./year.model";

describe('Component: YearCalendarComponent', () => {
  let component: YearCalendarComponent;
  let fixture: ComponentFixture<YearCalendarComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [YearCalendarComponent, CalendarNavComponent],
      providers: [YearCalendarService, UtilsService]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(YearCalendarComponent);
    component = fixture.componentInstance;
    component.config = component.yearCalendarService.getConfig({});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('should have the right CSS classes for', () => {
    const defaultYear: IYear = {
      date: undefined,
      selected: false,
      currentYear: false,
      disabled: false,
      text: ''
    };
    const defaultCssClasses: {[klass: string]: boolean} = {
      'dp-selected': false,
      'dp-current-year': false
    };

    it('the selected year', () => {
      expect(component.getYearBtnCssClass({
        ...defaultYear,
        selected: true
      } as IYear)).toEqual({
        ...defaultCssClasses,
        'dp-selected': true
      });
    });

    it('the current year', () => {
      expect(component.getYearBtnCssClass({
        ...defaultYear,
        currentYear: true
      } as IYear)).toEqual({
        ...defaultCssClasses,
        'dp-current-year': true
      });
    });

    it('custom days', () => {
      component.componentConfig.yearBtnCssClassCallback = (day: Dayjs) => 'custom-class';

      expect(component.getYearBtnCssClass({
        ...defaultYear
      } as IYear)).toEqual({
        ...defaultCssClasses,
        'custom-class': true
      });
    });

    it('should emit event goToCurrent function called', () => {
      spyOn(component.onGoToCurrent, 'emit');
      component.goToCurrent();
      expect(component.onGoToCurrent.emit).toHaveBeenCalledWith();
    });
  });
});
