import {inject, TestBed} from '@angular/core/testing';
import * as dayjs from 'dayjs';
import {Dayjs} from 'dayjs';
import {UtilsService} from '../common/services/utils/utils.service';
import {YearCalendarService} from "./year-calendar.service";
import {IYear} from "./year.model";



describe('Service: YearCalendarService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [YearCalendarService, UtilsService]
    });
  });

  it('should check the generateYear method',
    inject([YearCalendarService], (service: YearCalendarService) => {
      const year = dayjs('14-01-1987', 'DD-MM-YYYY');
      const selected = dayjs('14-01-1987', 'DD-MM-YYYY');
      const genYear = service.generateYears({numOfYearRows: 4, numOfYearCols: 5}, year, [selected]);

      const current = year.clone().startOf('year');
      genYear.forEach((row) => {
        row.forEach((iYear) => {
          if (iYear.date.format('YYYY') === '1987') {
            expect(iYear.selected).toBe(true);
          } else {
            expect(iYear.selected).toBe(false);
          }
          expect(iYear.currentYear).toBe(false);

          current.add(1, 'year');
        });
      });
    }));

  it('should check the generateYears method with [1, 2, 3, 4, 6, 12] rows and [1, 5, 10] cols',
    inject([YearCalendarService], (service: YearCalendarService) => {
      [1, 2, 3, 4, 6, 12].forEach((numOfYearRows) => {
        [1, 5, 10].forEach((numOfYearCols) => {
          const year = dayjs('14-01-1987', 'DD-MM-YYYY');
          const genYear = service.generateYears({numOfYearRows, numOfYearCols}, year, []);
          expect(genYear.length).toBe(numOfYearRows);

          genYear.forEach((row) => expect(row.length).toBe(numOfYearCols))
        })
      });
    }));

  it('should check the isDateDisabled method',
    inject([YearCalendarService], (service: YearCalendarService) => {
      const year: IYear = {
        date: dayjs('09-04-2017', 'DD-MM-YYYY'),
        selected: false,
        currentYear: false,
        disabled: false,
        text: dayjs('09-04-2017', 'DD-MM-YYYY').format('YYYY')
      };
      const config1: any = {
        min: year.date.clone().subtract(1, 'year'),
        max: year.date.clone().add(1, 'year')
      };

      expect(service.isYearDisabled(year.date, config1)).toBe(false);
      year.date.subtract(1, 'year');
      expect(service.isYearDisabled(year.date, config1)).toBe(false);
      year.date.subtract(1, 'year');
      expect(service.isYearDisabled(year.date, config1)).toBe(true);
      year.date.add(3, 'year');
      expect(service.isYearDisabled(year.date, config1)).toBe(false);
      year.date.add(1, 'year');
      expect(service.isYearDisabled(year.date, config1)).toBe(true);
    }));

  it('should check the isDateDisabled when isYearDisabledCallback provided',
    inject([YearCalendarService], (service: YearCalendarService) => {
      const year: IYear = {
        date: dayjs('01`-01-2017', 'DD-MM-YYYY'),
        selected: false,
        currentYear: false,
        disabled: false,
        text: dayjs('01-01-2017', 'DD-MM-YYYY').format('YYYY')
      };
      const config1: any = {
        isYearDisabledCallback: (m: Dayjs) => {
          return m.get('y') % 2 === 0;
        }
      };

      for (let i = 0; i < 12; i++) {
        console.log(year.date.get('y'), i % 2, service.isYearDisabled(year.date, config1));

        if (i % 2 === 0) {
          expect(service.isYearDisabled(year.date, config1)).toBe(true);
        } else {
          expect(service.isYearDisabled(year.date, config1)).toBe(false);
        }

        year.date.add(1, 'year');
      }
    }));

  it('should check getDayBtnText method',
    inject([YearCalendarService], (service: YearCalendarService) => {
      const date = dayjs('05-04-2017', 'DD-MM-YYYY');
      expect(service.getYearBtnText({yearBtnFormat: 'YY'}, date)).toEqual('17');
      expect(service.getYearBtnText({yearBtnFormat: 'YYYY'}, date)).toEqual('2017');
      expect(service.getYearBtnText({yearBtnFormatter: (m => 'bla')}, date)).toEqual('bla');
      expect(service.getYearBtnText({yearBtnFormat: 'YYYY', yearBtnFormatter: (m => m.format('YY'))}, date))
        .toEqual('17');
    })
  );

  it('should check getYearBtnCssClass method',
    inject([YearCalendarService], (service: YearCalendarService) => {
      const date = dayjs('05-04-2017', 'DD-MM-YYYY');
      expect(service.getYearBtnCssClass({}, date)).toEqual('');
      expect(service.getYearBtnCssClass({yearBtnCssClassCallback: (m => 'class1 class2')}, date))
        .toEqual('class1 class2');
    }));

  it('should validate numOfYearRows config', () => {
    inject([YearCalendarService], (service: YearCalendarService) => {
      [-1, 0, 13].forEach((numOfYearRows) => {
        expect(service.getConfig({numOfYearRows, numOfYearCols: 5}))
          .toThrowError('numOfYearRows has to be between 1 - 12');
      });

      [1, 2, 12].forEach((numOfYearRows) => {
        expect(service.getConfig({numOfYearRows, numOfYearCols: 5})).not.toThrowError();
        expect(service.getConfig({numOfYearRows, numOfYearCols: 5})).not.toThrowError();
        expect(service.getConfig({numOfYearRows, numOfYearCols: 5})).not.toThrowError();
      });
    });
  });

  it('should validate numOfYearCols config', () => {
    inject([YearCalendarService], (service: YearCalendarService) => {
      [-1, 0, 13].forEach((numOfYearCols) => {
        expect(service.getConfig({numOfYearRows: 5, numOfYearCols}))
          .toThrowError('numOfYearCols has to be between 1 - 12');
      });

      [1, 2, 12].forEach((numOfYearCols) => {
        expect(service.getConfig({numOfYearRows: 5, numOfYearCols})).not.toThrowError();
        expect(service.getConfig({numOfYearRows: 5, numOfYearCols})).not.toThrowError();
        expect(service.getConfig({numOfYearRows: 5, numOfYearCols})).not.toThrowError();
      });
    });
  });
});
