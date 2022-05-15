import React from 'react';
import {FormattedMessage} from "react-intl";
import classNames from 'classnames';
import nuLogo from '../../assets/nurtureup_logo/nurtureup_logo.png'
import {
  Card,
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

import css from './SectionServices.css';

const SectionServices = props => {
  const {rootClassName, className, textType} = props;
  const classes = classNames(rootClassName || css.root, className);

  const aboutPageSubtitle = "What's a baby care specialist and service provider? These are the people dedicated to\n empowering parents, while nurturing babies.";
  const landingPageSubtitle = "To get started, select one of our services below";
  const subTitle = textType === 'about' ? aboutPageSubtitle : textType === 'landing' ? landingPageSubtitle : '';


  return (
    <div className={css.cardContainer}>
      <h2 className={css.ourServicesText}>OUR SERVICES</h2>
      <p className={css.subtitleText}>{subTitle}</p>
      <ul className={css.ulMargin}>
        <li className={css.row}>
          <Card className={css.card} flat={false}>
            <div className={css.iconCard}>
              <IconSleepConsultant/>
            </div>
            <FormattedMessage id="Services.sleepConsultant" />
            <p className={css.text}><FormattedMessage id="ServicesDescription.sleepConsultant" /></p>
          </Card>
          <Card className={css.card} flat={false}>
            <div className={css.iconCard}>
              <IconLaborDoula/>
            </div>
            <FormattedMessage id="Services.laborDoula" />
            <p className={css.text}><FormattedMessage id="ServicesDescription.laborDoula" /> </p>
          </Card>
          <Card className={css.card} flat={false}>
            <div className={css.iconCard}>
              <IconNursery/>
            </div>
            <FormattedMessage id="Services.nurseryConsultant" />
            <p className={css.text}><FormattedMessage id="ServicesDescription.nurseryConsultant" /></p>
          </Card>
          <Card className={css.card} flat={false}>
            <div className={css.iconCard}>
              <IconPostDoula/>
            </div>
            <FormattedMessage id="Services.postDoula" />
            <p className={css.text}><FormattedMessage id="ServicesDescription.postDoula" /></p>
          </Card>
        </li>
        <li className={css.row}>
          <Card className={css.card} flat={false}>
            <div className={css.iconCard}>
              <IconCarSeatTech/>
            </div>
            <FormattedMessage id="Services.carSeatTech" />
            <p className={css.text}><FormattedMessage id="ServicesDescription.carSeatTech" /></p>
          </Card>

          <Card className={css.card} flat={false}>
            <div className={css.iconCard}>
              <IconLactation/>
            </div>
            <FormattedMessage id="Services.lactationConsultant" />
            <p className={css.text}><FormattedMessage id="ServicesDescription.lactationConsultant" /></p>
          </Card>

          <Card className={css.card} flat={false}>
            <div className={css.iconCard}>
              <IconMidwife/>
            </div>
            <FormattedMessage id="Services.midwife" />
            <p className={css.text}><FormattedMessage id="ServicesDescription.midwife" /></p>
          </Card>
          <Card className={css.card} flat={false}>
            <div className={css.iconCard}>
              <IconNewbornCare/>
            </div>
            <FormattedMessage id="Services.newbornSpecialist" />
            <p className={css.text}><FormattedMessage id="ServicesDescription.newbornSpecialist" /></p>
          </Card>
        </li>
          <li className={css.row}>
          <Card className={css.card} flat={false}>
            <div className={css.iconCard}>
              <IconPhotographer/>
            </div>
              <FormattedMessage id="Services.infantPhotography" />
              <p className={css.text}><FormattedMessage id="ServicesDescription.infantPhotography" /></p>
          </Card>
          <Card className={css.card} flat={false}>
            <div className={css.iconCard}>
              <IconChildbirthEd/>
            </div>
            <FormattedMessage id="Services.childbirthEducation" />
              <p className={css.text}><FormattedMessage id="ServicesDescription.childbirthEducation" /></p>
          </Card>
          <Card className={css.card} flat={false}>
            <div className={css.iconCard}>
              <IconMealPrep/>
            </div>
            <FormattedMessage id="Services.mealPrep" className={css.specialistText} />
              <p className={css.text}><FormattedMessage id="ServicesDescription.mealPrep" /></p>
          </Card>
          <Card className={css.blank} flat={false}>
            <div className={css.iconCard}>
            </div>
            <FormattedMessage id="Services.blank" className={css.specialistText} />
          </Card>
        </li>

      </ul>

    </div>
  );
}

export default SectionServices;
