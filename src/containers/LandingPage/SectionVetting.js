import React from "react";
import css from './LandingPage.css';
import {FormattedMessage} from "react-intl";

const SectionVetting = props => {

  return (
    <div className={css.sectionContainer}>
      <h2 className={css.sectionHeader}><FormattedMessage id={"SectionVetting.header"}/></h2>
      <div className={css.sectionTable}>
        <div className={css.sectionRow}>
          <div className={css.sectionVettingCell}>
            <h4 className={css.vettingTextHeader}><FormattedMessage id={"SectionVetting.interviewHeader"}/></h4>
            <p className={css.vettingText}><FormattedMessage id={"SectionVetting.interviewText"}/></p>
          </div>
          <div className={css.sectionVettingCell}>
            <h4 className={css.vettingTextHeader}><FormattedMessage id={"SectionVetting.backgroundHeader"}/></h4>
            <p className={css.vettingText}><FormattedMessage id={"SectionVetting.backgroundText"}/></p>
          </div>
          <div className={css.sectionVettingCell}>
            <h4 className={css.vettingTextHeader}><FormattedMessage id={"SectionVetting.certHeader"}/></h4>
            <p className={css.vettingText}><FormattedMessage id={"SectionVetting.certText"}/></p>
          </div>
          <div className={css.sectionVettingCell}>
            <h4 className={css.vettingTextHeader}><FormattedMessage id={"SectionVetting.liabilityHeader"}/></h4>
            <p className={css.vettingText}><FormattedMessage id={"SectionVetting.liabilityText"}/></p>
          </div>
        </div>
        <p className={css.vettingRatingsText}><b>Ratings:</b> <FormattedMessage id={"SectionVetting.ratingsText"} /></p>
      </div>
    </div>
  );
};

export default SectionVetting;
