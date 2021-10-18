import {INavEvent} from '../../../lib/common/models/navigation-event.model';
import * as dayjs from 'dayjs';
import {Dayjs} from 'dayjs';
import {DatePickerComponent, DatePickerDirective, ISelectionEvent} from '../../../lib';
import {Directive, ViewChild} from '@angular/core';
import {FormControl, ValidatorFn, Validators} from '@angular/forms';

@Directive()
export abstract class DateComponent {
  @ViewChild('dateComponent') dateComponent: DatePickerComponent;
  @ViewChild(DatePickerDirective) dateDirective: DatePickerDirective;

  control: FormControl;

  abstract config;
  date = dayjs();
  material: boolean = true;
  required: boolean = false;
  disabled: boolean = false;
  validationMinDate: Dayjs;
  validationMaxDate: Dayjs;
  validationMinTime: Dayjs;
  validationMaxTime: Dayjs;
  placeholder: string = 'Choose a date...';
  displayDate: Dayjs | string;

  displayDateChanged(displayDate: Dayjs | string): void {
    this.displayDate = displayDate;
  }

  onDisplayDateChange(displayDate: Dayjs | string): void {
    this.displayDate = displayDate;
  }

  onMaterialThemeChange(material: boolean): void {
    this.material = material;
  }

  onDisabledChange(disabled: boolean): void {
    this.disabled = disabled;
    disabled ? this.control.disable() : this.control.enable();
  }

  onRequireValidationChange(required: boolean): void {
    this.required = required;
    this.control.setValidators(this.getValidations());
    this.control.updateValueAndValidity();
  }

  onMinValidationChange($event: Dayjs): void {
    this.validationMinDate = $event;
    this.control.setValidators(this.getValidations());
    this.control.updateValueAndValidity();
  }

  onMaxValidationChange($event: Dayjs): void {
    this.validationMaxDate = $event;
    this.control.setValidators(this.getValidations());
    this.control.updateValueAndValidity();
  }

  onMinTimeValidationChange($event: Dayjs): void {
    this.validationMinTime = $event;
    this.control.setValidators(this.getValidations());
    this.control.updateValueAndValidity();
  }

  onMaxTimeValidationChange($event: Dayjs): void {
    this.validationMaxTime = $event;
    this.control.setValidators(this.getValidations());
    this.control.updateValueAndValidity();
  }

  onPlaceholderChange(placeholder: string): void {
    this.placeholder = placeholder;
  }

  onConfigChange($event): void {
    this.config = {
      ...this.config,
      ...$event
    }
  }

  openCalendar(): void {
    (this.dateComponent || this.dateDirective).api.open();
  }

  closeCalendar(): void {
    (this.dateComponent || this.dateDirective).api.close();
  }

  moveCalendarTo($event: Dayjs): void {
    (this.dateComponent || this.dateDirective).api.moveCalendarTo($event);
  }

  onLeftNav(change: INavEvent) {
    console.log('left nav', change);
  }

  onRightNav(change: INavEvent) {
    console.log('right nav', change);
  }

  opened() {
    console.log('opened');
  }

  closed() {
    console.log('closed');
  }

  onSelect(data: ISelectionEvent) {
    console.log(data);
  }

  log(item) {
    // console.log(item);
  }

  protected buildForm(): FormControl {
    return new FormControl({value: this.date, disabled: this.disabled}, this.getValidations());
  }

  private getValidations(): ValidatorFn[] {
    return [
      this.required ? Validators.required : () => undefined,
      (control) => {
        return this.validationMinDate && this.config &&
        dayjs(control.value, this.config.format)
          .isBefore(this.validationMinDate)
          ? {minDate: 'minDate Invalid'} : undefined
      },
      (control) => {
        return this.validationMaxDate && this.config &&
        dayjs(control.value, this.config.format)
          .isAfter(this.validationMaxDate)
          ? {maxDate: 'maxDate Invalid'} : undefined
      },
      (control) => {
        return this.validationMinTime && this.config &&
        dayjs(control.value, this.config.format)
          .isBefore(this.validationMinTime)
          ? {minDate: 'minDate Invalid'} : undefined
      },
      (control) => {
        return this.validationMaxTime && this.config &&
        dayjs(control.value, this.config.format)
          .isAfter(this.validationMaxTime)
          ? {maxDate: 'maxDate Invalid'} : undefined
      }
    ].filter(Boolean);
  }
}
