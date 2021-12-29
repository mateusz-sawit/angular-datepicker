import {Dayjs} from 'dayjs';
import {ICalendar, ICalendarInternal} from '../common/models/calendar.model';
import {ECalendarValue} from '..';

export interface IConfig {
  isYearDisabledCallback?: (date: Dayjs) => boolean;
  allowMultiSelect?: boolean;
  yearFormat?: string;
  yearFormatter?: (month: Dayjs) => string;
  format?: string;
  isNavHeaderBtnClickable?: boolean;
  yearBtnFormat?: string;
  yearBtnFormatter?: (day: Dayjs) => string;
  numOfYearRows?: number;
  numOfYearCols?: number;
  yearBtnCssClassCallback?: (day: Dayjs) => string;
  returnedValueType?: ECalendarValue;
  showGoToCurrent?: boolean;
  unSelectOnClick?: boolean;
}

export interface IYearCalendarConfig extends IConfig,
                                              ICalendar {
}

export interface IYearCalendarConfigInternal extends IConfig,
                                                      ICalendarInternal {
}
