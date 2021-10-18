import {SingleCalendarValue} from './single-calendar-value';
import {OpUnitType} from 'dayjs';
import {SelectEvent} from './selection-event.enum';

export interface ISelectionEvent {
  date: SingleCalendarValue;
  granularity: OpUnitType;
  type: SelectEvent;
}
