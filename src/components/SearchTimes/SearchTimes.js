import React from 'react';
import {FormattedMessage} from "react-intl";
import classNames from 'classnames';
import nuLogo from '../../assets/nurtureup_logo/nurtureup_logo.png'
import {
  CardClickable,
  IconSleepConsultant,
  IconLaborDoula,
  IconPostDoula,
  IconPhotographer,
  IconNursery,
  IconNewbornCare,
  IconMidwife,
  IconMealPrep,
  IconChildbirthEd,
  IconCarSeatTech,
  IconLactation, Button
} from '../../components';

import css from './SearchTimes.css';
import IconCalendarDay from "../Icons/IconCalendars/IconCalendarDay";


const SearchTimes = props => {
  const {rootClassName, className, clickEvent} = props;
  const classes = classNames(rootClassName || css.root, className);

  return (
    <div className={classes}>
      <ul>
        <li className={css.row}>
          <CardClickable className={css.card} flat={false} someHandler={()=>{clickEvent(3, 1)}}>
            <IconCalendarDay/>
            <FormattedMessage id="SearchTimes.asap" />

          </CardClickable>
          <CardClickable className={css.card} flat={false} someHandler={()=>{clickEvent(3, 2)}}>
            <IconCalendarDay/>
            <FormattedMessage id="SearchTimes.week" />

          </CardClickable>
          <CardClickable className={css.card} flat={false} someHandler={()=>{clickEvent(3, 3)}}>
            <IconCalendarDay/>
            <FormattedMessage id="SearchTimes.month" />

          </CardClickable>
          <CardClickable className={css.card} flat={false} someHandler={()=>{clickEvent(3, 4)}}>
            <IconCalendarDay/>
            <FormattedMessage id="SearchTimes.noTimeFrame" />

          </CardClickable>
        </li>


      </ul>

    </div>
  );
}

export default SearchTimes;
