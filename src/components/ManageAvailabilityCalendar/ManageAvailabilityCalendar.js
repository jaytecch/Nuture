import React, {Component} from 'react';
import {arrayOf, func, object, shape, string, bool} from 'prop-types';
import {
  DayPickerSingleDateController,
  isSameDay,
  isInclusivelyBeforeDay,
  isInclusivelyAfterDay,
} from 'react-dates';
import {FormattedMessage} from '../../util/reactIntl';
import memoize from 'lodash/memoize';
import classNames from 'classnames';
import moment from 'moment';
import {DAYS_OF_WEEK, propTypes} from '../../util/types';
import {monthIdString} from '../../util/dates';
import {IconArrowHead, IconSpinner} from '../index';
import css from './ManageAvailabilityCalendar.css';
import {ensureDayAvailabilityPlan} from "../../util/data";

// Constants
const HORIZONTAL_ORIENTATION = 'horizontal';
const MAX_AVAILABILITY_EXCEPTIONS_RANGE = 365;
const MAX_BOOKINGS_RANGE = 180;
const TODAY_MOMENT = moment().startOf('day');
const END_OF_RANGE_MOMENT = TODAY_MOMENT.clone()
  .add(MAX_AVAILABILITY_EXCEPTIONS_RANGE - 1, 'days')
  .startOf('day');
const END_OF_BOOKING_RANGE_MOMENT = TODAY_MOMENT.clone()
  .add(MAX_BOOKINGS_RANGE - 1, 'days')
  .startOf('day');

// Constants for calculating day width (aka table cell dimensions)
const TABLE_BORDER = 2;
const TABLE_COLUMNS = 7;
const MIN_CONTENT_WIDTH = 272;
const MIN_CELL_WIDTH = Math.floor(MIN_CONTENT_WIDTH / TABLE_COLUMNS); // 38
const MAX_CONTENT_WIDTH_DESKTOP = 756;
const MAX_CELL_WIDTH_DESKTOP = Math.floor(MAX_CONTENT_WIDTH_DESKTOP / TABLE_COLUMNS); // 108
const VIEWPORT_LARGE = 1024;

// Helper functions

// Calculate the width for a calendar day (table cell)
const dayWidth = (wrapperWidth, windowWith) => {
  if (windowWith >= VIEWPORT_LARGE) {
    // NOTE: viewportLarge has a layout with sidebar.
    // In that layout 30% is reserved for paddings and 282 px goes to sidebar and gutter.
    const width = windowWith * 0.7 - 282;
    return width > MAX_CONTENT_WIDTH_DESKTOP
      ? MAX_CELL_WIDTH_DESKTOP
      : Math.floor((width - TABLE_BORDER) / TABLE_COLUMNS);
  } else {
    return wrapperWidth > MIN_CONTENT_WIDTH
      ? Math.floor((wrapperWidth - TABLE_BORDER) / TABLE_COLUMNS)
      : MIN_CELL_WIDTH;
  }
};

// Get a function that returns the start of the previous month
const prevMonthFn = currentMoment =>
  currentMoment
    .clone()
    .subtract(1, 'months')
    .startOf('month');

// Get a function that returns the start of the next month
const nextMonthFn = currentMoment =>
  currentMoment
    .clone()
    .add(1, 'months')
    .startOf('month');

// Get the start and end Dates
const dateStartAndEnd = date => {
  const start = moment(date)
    .startOf('day')
    .toDate();
  const end = moment(date)
    .add(1, 'days')
    .startOf('day')
    .toDate();
  return {start, end};
};

// outside range -><- today ... today+MAX_AVAILABILITY_EXCEPTIONS_RANGE -1 -><- outside range
const isDateOutsideRange = date => {
  return (
    !isInclusivelyAfterDay(date, TODAY_MOMENT) || !isInclusivelyBeforeDay(date, END_OF_RANGE_MOMENT)
  );
};
const isOutsideRange = memoize(isDateOutsideRange);

const isMonthInRange = (monthMoment, startOfRange, endOfRange) => {
  const isAfterThisMonth = monthMoment.isSameOrAfter(startOfRange, 'month');
  const isBeforeEndOfRange = monthMoment.isSameOrBefore(endOfRange, 'month');
  return isAfterThisMonth && isBeforeEndOfRange;
};

const isPast = date => !isInclusivelyAfterDay(date, TODAY_MOMENT);
const isAfterEndOfRange = date => !isInclusivelyBeforeDay(date, END_OF_RANGE_MOMENT);
const isAfterEndOfBookingRange = date => !isInclusivelyBeforeDay(date, END_OF_BOOKING_RANGE_MOMENT);

const isSelected = (date, selectedDates) => {
  const isSelected = undefined !== selectedDates.find(d => isSameDay(moment(d), moment(date)));

  return isSelected
}

const isBlocked = (date,availabilityPlan, isBooking) => {
  // const monthEntry = availabilityCalendar[date.format("YYYY-MM")]
  // const notAvailable = monthEntry !== undefined && Object.entries(monthEntry).length > 0;

  const planEntries = ensureDayAvailabilityPlan(availabilityPlan).entries;
  const planEntry = isBooking ?
    planEntries.find(entry => moment(entry.startTime.format('L')).isSame(moment(date.format('L'))))
  : planEntries.find(weekDayEntry => weekDayEntry.dayOfWeek === date.format("ddd").toLowerCase());


  return planEntry === undefined;
};

const dateModifiers = (date, selectedDates, availabilityPlan, isBooking) => {
  return {
    isOutsideRange: isOutsideRange(date),
    isSameDay: isSameDay(date, TODAY_MOMENT),
    isBlocked: isBlocked(date, availabilityPlan, isBooking),
    isSelected: isSelected(date, selectedDates),
    isPast: isPast(date),
  };
};

const renderDayContents = (selectedDates, availabilityPlan, isBooking) => date => {
  // This component is for day/night based processes. If time-based process is used,
  // you might want to deal with local dates using monthIdString instead of monthIdStringInUTC.
  const {isOutsideRange, isSameDay, isBlocked, isSelected, isPast} = dateModifiers(
    date,
    selectedDates,
    availabilityPlan,
    isBooking,
  );

  const dayClasses = classNames(css.default, {
    [css.outsideRange]: isOutsideRange,
    [css.blocked]: isBlocked || isPast,
    [css.reserved]: isSelected,
    [css.today]: isSameDay,
  });

  return (
    <div className={css.dayWrapper}>
      <span className={dayClasses}>
        <span className={css.dayNumber}>{date.format('D')}</span>
      </span>
    </div>
  );
};

////////////////////////////////
// ManageAvailabilityCalendar //
////////////////////////////////
class ManageAvailabilityCalendar extends Component {
  constructor(props) {
    super(props);

    // DOM refs
    this.dayPickerWrapper = null;
    this.dayPicker = null;

    this.state = {
      currentMonth: moment().startOf('month'),
      focused: true,
      date: null,
      rendered: false,
    };

    // this.fetchMonthData = this.fetchMonthData.bind(this);
    this.onDateChange = this.onDateChange.bind(this);
    this.onFocusChange = this.onFocusChange.bind(this);
    this.onMonthClick = this.onMonthClick.bind(this);
  }

  componentDidMount() {
    this.setState({rendered: true})
  }

  onDateChange(date) {
    this.setState({date});

    const {availabilityPlan, selectedDates, setDates, isBooking} = this.props;
    // This component is for day/night based processes. If time-based process is used,
    // you might want to deal with local dates using monthIdString instead of monthIdStringInUTC
    const {isPast, isSelected, isBlocked} = dateModifiers(
      date,
      selectedDates,
      availabilityPlan,
      isBooking,
    );

    if (isPast || isBlocked) {
      // Cannot allow or block a reserved or a past date or inProgress
    } else if (isSelected) {
      // Unblock the date
      const newSelectedDates = selectedDates.filter(d => !isSameDay(moment(d), moment(date)));
      setDates(newSelectedDates);
    } else {
      // Block the date
      setDates([...selectedDates, date]);
    }
  }

  onFocusChange() {
    // Force the state.focused to always be truthy so that date is always selectable
    this.setState({focused: true});
  }

  onMonthClick(monthFn) {
    const onMonthChanged = this.props.onMonthChanged;
    this.setState(
      prevState => ({currentMonth: monthFn(prevState.currentMonth)}),
      () => {
        // Call onMonthChanged function if it has been passed in among props.
        if (onMonthChanged) {
          onMonthChanged(monthIdString(this.state.currentMonth));
        }
      }
    );
  }

  render() {
    const {
      className,
      rootClassName,
      listingId,
      availability,
      availabilityPlan,
      onMonthChanged,
      monthFormat,
      selectedDates,
      timezone,
      setDates,
      isBooking,
      ...rest
    } = this.props;
    const {focused, date, currentMonth} = this.state;
    const { clientWidth: width } = this.dayPickerWrapper || { clientWidth: 0 };
    const hasWindow = typeof window !== 'undefined';
    const windowWidth = hasWindow ? window.innerWidth : 0;

    const daySize = dayWidth(width, windowWidth);
    const calendarGridWidth = daySize * TABLE_COLUMNS + TABLE_BORDER;

    const calendar = availability.calendar;
    const currentMonthData = calendar[monthIdString(currentMonth)];
    const isMonthDataFetched =
      !isMonthInRange(currentMonth, TODAY_MOMENT, END_OF_RANGE_MOMENT) || (!!currentMonthData);

    const monthName = currentMonth.format('MMMM');
    const classes = classNames(rootClassName || css.root, className);

    console.log("availability calendar initialized");
    return (
      <div
        className={classes}
        ref={c => this.dayPickerWrapper = c}
      >
        {width > 0 ? (
        <div style={{width: `${calendarGridWidth}px`}}>
          <DayPickerSingleDateController
            {...rest}
            ref={c => this.dayPicker = c}
            numberOfMonths={1}
            navPrev={<IconArrowHead direction="left"/>}
            navNext={<IconArrowHead direction="right"/>}
            weekDayFormat="ddd"
            daySize={daySize}
            renderDayContents={renderDayContents(selectedDates, availabilityPlan, isBooking)}
            focused={focused}
            date={date}
            onDateChange={this.onDateChange}
            onFocusChange={this.onFocusChange}
            onPrevMonthClick={() => this.onMonthClick(prevMonthFn)}
            onNextMonthClick={() => this.onMonthClick(nextMonthFn)}
            hideKeyboardShortcutsPanel
            horizontalMonthPadding={9}
            renderMonthElement={({month}) => (
              <div className={css.monthElement}>
                <span className={css.monthString}>{month.format(monthFormat)}</span>
                {!isMonthDataFetched ? <IconSpinner rootClassName={css.monthInProgress}/> : null}
              </div>
            )}
          />
        </div>
        ) : null}
        <div className={css.legend} style={{width: `${calendarGridWidth}px`}}>
          <div className={css.legendRow}>
            <span className={css.legendAvailableColor}/>
            <span className={css.legendText}>
              <FormattedMessage id="ManageAvailabilityCalendar.availableDay"/>
            </span>
          </div>
          <div className={css.legendRow}>
            <span className={css.legendBlockedColor}/>
            <span className={css.legendText}>
              <FormattedMessage id="ManageAvailabilityCalendar.blockedDay"/>
            </span>
          </div>
          <div className={css.legendRow}>
            <span className={css.legendReservedColor}/>
            <span className={css.legendText}>
              <FormattedMessage id="ManageAvailabilityCalendar.selectedDay"/>
            </span>
          </div>
        </div>
      </div>
    );
  }
}

ManageAvailabilityCalendar.defaultProps = {
  className: null,
  rootClassName: null,

  // day presentation and interaction related props
  renderCalendarDay: undefined,
  renderDayContents: null,
  isDayBlocked: () => false,
  isOutsideRange,
  isDayHighlighted: () => false,
  enableOutsideDays: true,

  // calendar presentation and interaction related props
  orientation: HORIZONTAL_ORIENTATION,
  withPortal: false,
  initialVisibleMonth: null,
  numberOfMonths: 2,
  onOutsideClick() {
  },
  keepOpenOnDateSelect: false,
  renderCalendarInfo: null,
  isRTL: false,

  // navigation related props
  navPrev: null,
  navNext: null,
  onPrevMonthClick() {
  },
  onNextMonthClick() {
  },

  // internationalization
  monthFormat: 'MMMM YYYY',
  onMonthChanged: null,
  isBooking: false,
};

ManageAvailabilityCalendar.propTypes = {
  className: string,
  rootClassName: string,
  availability: shape({
    calendar: object.isRequired,
  }).isRequired,
  availabilityPlan: propTypes.availabilityPlan.isRequired,
  onMonthChanged: func,
  setDates: func.isRequired,
  selectedDates: arrayOf(object).isRequired,
  isBooking: bool,
};

export default ManageAvailabilityCalendar;
