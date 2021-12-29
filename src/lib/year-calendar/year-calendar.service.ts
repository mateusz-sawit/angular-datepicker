import {Injectable} from '@angular/core';
import * as dayjs from 'dayjs';
import {Dayjs} from 'dayjs';
import {UtilsService} from '../common/services/utils/utils.service';
import {IYearCalendarConfig, IYearCalendarConfigInternal} from "./year-calendar-config";
import {IYear} from "./year.model";



@Injectable()
export class YearCalendarService {
  readonly DEFAULT_CONFIG: IYearCalendarConfigInternal = {
    allowMultiSelect: false,
    yearFormat: 'YYYY',
    format: 'MM-YYYY',
    isNavHeaderBtnClickable: false,
    yearBtnFormat: 'YYYY',
    locale: dayjs.locale(),
    unSelectOnClick: true,
    numOfYearRows: 4,
    numOfYearCols: 5
  };

  constructor(private utilsService: UtilsService) {
  }

  getConfig(config: IYearCalendarConfig): IYearCalendarConfigInternal {
    const _config = <IYearCalendarConfigInternal>{
      ...this.DEFAULT_CONFIG,
      ...this.utilsService.clearUndefined(config)
    };

    this.validateConfig(_config);

    this.utilsService.convertPropsToDayjs(_config, _config.format, ['min', 'max']);
    dayjs.locale(_config.locale);

    return _config;
  }

  generateYears(config: IYearCalendarConfig, year: Dayjs, selected: Dayjs[] = null): IYear[][] {
    const calendarSize = config.numOfYearCols * config.numOfYearRows;
    let index = year.clone().startOf('year').subtract(calendarSize / 2, 'year');

    return this.utilsService.createArray(config.numOfYearRows).map(() => {
      return this.utilsService.createArray(config.numOfYearCols).map(() => {
        const date = index.clone();
        const year = {
          date,
          selected: !!selected.find(s => index.isSame(s, 'year')),
          currentYear: index.isSame(dayjs(), 'year'),
          disabled: this.isYearDisabled(date, config),
          text: this.getYearBtnText(config, date)
        };

        index = index.add(1, 'year');

        return year;
      });
    });
  }

  isYearDisabled(date: Dayjs, config: IYearCalendarConfig) {
    if (config.isYearDisabledCallback) {
      return config.isYearDisabledCallback(date);
    }

    if (config.min && date.isBefore(config.min, 'year')) {
      return true;
    }

    return !!(config.max && date.isAfter(config.max, 'year'));
  }

  shouldShowLeft(min: Dayjs, viewYears: IYear[][]): boolean {
    const minCurrentYearView = viewYears[0][0];
    return min ? min.isBefore(minCurrentYearView.date, 'year') : true;
  }

  shouldShowRight(max: Dayjs, viewYears: IYear[][]): boolean {
    const lastRow = viewYears[viewYears.length-1];
    const maxCurrentYearView = lastRow[lastRow.length-1];
    return max ? max.isAfter(maxCurrentYearView.date, 'year') : true;
  }

  getHeaderLabel(config: IYearCalendarConfig, year: Dayjs): string {
    if (config.yearFormatter) {
      return config.yearFormatter(year);
    }

    return year.format(config.yearFormat);
  }

  getYearBtnText(config: IYearCalendarConfig, year: Dayjs): string {
    if (config.yearBtnFormatter) {
      return config.yearBtnFormatter(year);
    }

    return year.format(config.yearBtnFormat);
  }

  getYearBtnCssClass(config: IYearCalendarConfig, month: Dayjs): string {
    if (config.yearBtnCssClassCallback) {
      return config.yearBtnCssClassCallback(month);
    }

    return '';
  }

  private validateConfig(config: IYearCalendarConfigInternal): void {
    if (config.numOfYearRows < 1 || config.numOfYearRows > 12) {
      throw new Error('numOfYearRows has to be between 1 - 12');
    }
    if (config.numOfYearCols < 1 || config.numOfYearCols > 12) {
      throw new Error('numOfYearCols has to be between 1 - 12');
    }
  }
}
