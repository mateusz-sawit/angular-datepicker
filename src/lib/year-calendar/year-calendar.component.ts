import {ECalendarValue} from '../common/types/calendar-value-enum';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  forwardRef,
  HostBinding,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChange,
  SimpleChanges,
  ViewEncapsulation
} from '@angular/core';
import * as dayjs from 'dayjs';
import {Dayjs} from 'dayjs';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validator
} from '@angular/forms';
import {CalendarValue} from '../common/types/calendar-value';
import {UtilsService} from '../common/services/utils/utils.service';
import {DateValidator} from '../common/types/validator.type';
import {SingleCalendarValue} from '../common/types/single-calendar-value';
import {INavEvent} from '../common/models/navigation-event.model';
import {IYearCalendarConfig, IYearCalendarConfigInternal} from "./year-calendar-config";
import {YearCalendarService} from "./year-calendar.service";
import {IYear} from "./year.model";

@Component({
  selector: 'dp-year-calendar',
  templateUrl: 'year-calendar.component.html',
  styleUrls: ['year-calendar.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    YearCalendarService,
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => YearCalendarComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => YearCalendarComponent),
      multi: true
    }
  ]
})
export class YearCalendarComponent implements OnInit, OnChanges, ControlValueAccessor, Validator {

  @Input() config: IYearCalendarConfig;
  @Input() displayDate: Dayjs;
  @Input() minDate: Dayjs;
  @Input() maxDate: Dayjs;
  @HostBinding('class') @Input() theme: string;
  @Output() onSelect: EventEmitter<IYear> = new EventEmitter();
  @Output() onNavHeaderBtnClick: EventEmitter<null> = new EventEmitter();
  @Output() onGoToCurrent: EventEmitter<void> = new EventEmitter();
  @Output() onLeftNav: EventEmitter<INavEvent> = new EventEmitter();
  @Output() onRightNav: EventEmitter<INavEvent> = new EventEmitter();
  @Output() onLeftSecondaryNav: EventEmitter<INavEvent> = new EventEmitter();
  @Output() onRightSecondaryNav: EventEmitter<INavEvent> = new EventEmitter();
  isInited: boolean = false;
  componentConfig: IYearCalendarConfigInternal;
  viewYears: IYear[][];
  inputValue: CalendarValue;
  inputValueType: ECalendarValue;
  validateFn: DateValidator;
  _shouldShowCurrent: boolean = true;
  navLabel: string;
  showLeftNav: boolean;
  showRightNav: boolean;
  showSecondaryLeftNav: boolean;
  showSecondaryRightNav: boolean;
  api = {
    toggleCalendar: this.toggleCalendarMode.bind(this),
    moveCalendarTo: this.moveCalendarTo.bind(this)
  };

  constructor(public readonly yearCalendarService: YearCalendarService,
              public readonly utilsService: UtilsService,
              public readonly cd: ChangeDetectorRef) {
  }

  _selected: Dayjs[];

  get selected(): Dayjs[] {
    return this._selected;
  }

  set selected(selected: Dayjs[]) {
    this._selected = selected;
    this.onChangeCallback(this.processOnChangeCallback(selected));
  }

  _currentDateView: Dayjs;

  get currentDateView(): Dayjs {
    return this._currentDateView;
  }

  set currentDateView(current: Dayjs) {
    this._currentDateView = current.clone();
    this.viewYears = this.yearCalendarService
      .generateYears(this.componentConfig, this._currentDateView, this.selected);
    this.navLabel = this.yearCalendarService.getHeaderLabel(this.componentConfig, this._currentDateView);
    this.showLeftNav = this.yearCalendarService.shouldShowLeft(this.componentConfig.min, this.viewYears);
    this.showRightNav = this.yearCalendarService.shouldShowRight(this.componentConfig.max, this.viewYears);
    this.showSecondaryLeftNav = false;
    this.showSecondaryRightNav = false;
  }

  ngOnInit(): void {
    this.isInited = true;
    this.init();
    this.initValidators();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.isInited) {
      const {minDate, maxDate, config} = changes;

      this.handleConfigChange(config);
      this.init();

      if (minDate || maxDate) {
        this.initValidators();
      }
    }
  }

  init(): void {
    this.componentConfig = this.yearCalendarService.getConfig(this.config);
    this.selected = this.selected || [];
    this.currentDateView = this.displayDate
      ? this.displayDate
      : this.utilsService
        .getDefaultDisplayDate(
          this.currentDateView,
          this.selected,
          this.componentConfig.allowMultiSelect,
          this.componentConfig.min
        );
    this.inputValueType = this.utilsService.getInputType(this.inputValue, this.componentConfig.allowMultiSelect);
    this._shouldShowCurrent = this.shouldShowCurrent();
  }

  writeValue(value: CalendarValue): void {
    this.inputValue = value;

    if (value) {
      this.selected = this.utilsService
        .convertToDayjsArray(value, this.componentConfig);
      this.viewYears = this.yearCalendarService
        .generateYears(this.componentConfig, this.currentDateView, this.selected);
      this.inputValueType = this.utilsService.getInputType(this.inputValue, this.componentConfig.allowMultiSelect);
    } else {
      this.selected = [];
      this.viewYears = this.yearCalendarService
        .generateYears(this.componentConfig, this.currentDateView, this.selected);
    }

    this.cd.markForCheck();
  }

  registerOnChange(fn: any): void {
    this.onChangeCallback = fn;
  }

  onChangeCallback(_: any): void {
  }

  registerOnTouched(fn: any): void {
  }

  validate(formControl: FormControl): ValidationErrors | any {
    if (this.minDate || this.maxDate) {
      return this.validateFn(formControl.value);
    } else {
      return () => null;
    }
  }

  processOnChangeCallback(value: Dayjs[]): CalendarValue {
    return this.utilsService.convertFromDayjsArray(
      this.componentConfig.format,
      value,
      this.componentConfig.returnedValueType || this.inputValueType
    );
  }

  initValidators(): void {
    this.validateFn = this.validateFn = this.utilsService.createValidator(
      {minDate: this.minDate, maxDate: this.maxDate},
      this.componentConfig.format,
      'year'
    );

    this.onChangeCallback(this.processOnChangeCallback(this.selected));
  }

  yearClicked(year: IYear): void {
    if (year.selected && !this.componentConfig.unSelectOnClick) {
      return;
    }

    this.selected = this.utilsService
      .updateSelected(this.componentConfig.allowMultiSelect, this.selected, year, 'year');
    this.viewYears = this.yearCalendarService
      .generateYears(this.componentConfig, this.currentDateView, this.selected);
    this.onSelect.emit(year);
  }

  onLeftNavClick() {
    const from = this.currentDateView.clone();
    this.currentDateView = this.currentDateView.clone().subtract(this.componentConfig.numOfYearRows * this.componentConfig.numOfYearCols, 'year');
    const to = this.currentDateView.clone();
    this.viewYears = this.yearCalendarService.generateYears(this.componentConfig, this.currentDateView, this.selected);
    this.onLeftNav.emit({from, to});
  }

  onLeftSecondaryNavClick(): void {
  }

  onRightNavClick(): void {
    const from = this.currentDateView.clone();
    this.currentDateView = this.currentDateView.clone().add(this.componentConfig.numOfYearRows * this.componentConfig.numOfYearCols, 'year');
    const to = this.currentDateView.clone();
    this.onRightNav.emit({from, to});
  }

  onRightSecondaryNavClick(): void {
  }

  toggleCalendarMode(): void {
    this.onNavHeaderBtnClick.emit();
  }

  getYearBtnCssClass(year: IYear): {[klass: string]: boolean} {
    const cssClass: {[klass: string]: boolean} = {
      'dp-selected': year.selected,
      'dp-current-year': year.currentYear
    };
    const customCssClass: string = this.yearCalendarService.getYearBtnCssClass(this.componentConfig, year.date);

    if (customCssClass) {
      cssClass[customCssClass] = true;
    }

    return cssClass;
  }

  shouldShowCurrent(): boolean {
    return this.utilsService.shouldShowCurrent(
      this.componentConfig.showGoToCurrent,
      'year',
      this.componentConfig.min,
      this.componentConfig.max
    );
  }

  goToCurrent(): void {
    this.currentDateView = dayjs();
    this.onGoToCurrent.emit();
  }

  moveCalendarTo(to: SingleCalendarValue): void {
    if (to) {
      this.currentDateView = this.utilsService.convertToDayjs(to, this.componentConfig.format);
      this.cd.markForCheck();
    }
  }

  handleConfigChange(config: SimpleChange): void {
    if (config) {
      const prevConf: IYearCalendarConfigInternal = this.yearCalendarService.getConfig(config.previousValue);
      const currentConf: IYearCalendarConfigInternal = this.yearCalendarService.getConfig(config.currentValue);

      if (this.utilsService.shouldResetCurrentView(prevConf, currentConf)) {
        this._currentDateView = null;
      }

      if (prevConf.locale !== currentConf.locale) {
        if (this.currentDateView) {
          this.currentDateView.locale(currentConf.locale)
        }

        (this.selected || []).forEach((m) => m.locale(currentConf.locale));
      }
    }
  }
}
