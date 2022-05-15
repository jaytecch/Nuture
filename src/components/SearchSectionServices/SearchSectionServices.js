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
  IconLactation
} from '../../components';

import css from './SearchSectionServices.css';

const SearchSectionServices = props => {
  const {rootClassName, className, clickEvent} = props;
  const classes = classNames(rootClassName || css.root, className);

  return (
    <div className={classes}>
      <ul>
        <li className={css.row}><h2 className={css.centerText}>I am looking for a...</h2></li>
        <li className={css.row}>
          <CardClickable className={css.card} flat={false} someHandler={()=>{clickEvent(1, 1)}}>
            <IconSleepConsultant/>
            <FormattedMessage id="Services.sleepConsultant" />

          </CardClickable>
          <CardClickable className={css.card} flat={false} someHandler={()=>{clickEvent(1, 2)}}>
            <IconLaborDoula/>
            <FormattedMessage id="Services.laborDoula" />

          </CardClickable>
          <CardClickable className={css.card} flat={false} someHandler={()=>{clickEvent(1, 3)}}>
            <IconNursery/>
            <FormattedMessage id="Services.nurseryConsultant" />

          </CardClickable>
          <CardClickable className={css.card} flat={false} someHandler={()=>{clickEvent(1, 4)}}>
            <IconPostDoula/>
            <FormattedMessage id="Services.postDoula" />

          </CardClickable>
          <CardClickable className={css.card} flat={false} someHandler={()=>{clickEvent(1, 5)}}>
            <IconCarSeatTech/>
            <FormattedMessage id="Services.carSeatTech" />

          </CardClickable>
          <CardClickable className={css.card} flat={false} someHandler={()=>{clickEvent(1, 6)}}>
            <IconLactation/>
            <FormattedMessage className={css.text} id="Services.lactationConsultant" />

          </CardClickable>
        </li>
        <li className={css.row}>
          <CardClickable className={css.card} flat={false} someHandler={()=>{clickEvent(1, 7)}}>
            <IconMidwife/>
            <FormattedMessage id="Services.midwife" />

          </CardClickable>
          <CardClickable className={css.card} flat={false} someHandler={()=>{clickEvent(1, 8)}}>
            <IconNewbornCare/>
            <FormattedMessage id="Services.newbornSpecialist" />

          </CardClickable>
          <CardClickable className={css.card} flat={false} someHandler={()=>{clickEvent(1, 9)}}>
            <IconPhotographer/>
            <FormattedMessage id="Services.infantPhotography" />
          </CardClickable>
          <CardClickable className={css.card} flat={false} someHandler={()=>{clickEvent(1, 10)}}>
            <IconChildbirthEd/>
            <FormattedMessage id="Services.childbirthEducation" />
          </CardClickable>
          <CardClickable className={css.card} flat={false} someHandler={()=>{clickEvent(1, 11)}}>
            <IconMealPrep/>
            <FormattedMessage id="Services.mealPrep" />
          </CardClickable>
        </li>

      </ul>

    </div>
  );
}

export default SearchSectionServices;
