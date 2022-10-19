import React from "react";
import css from './LandingPage.css';
import {FormattedMessage} from "react-intl";
import {IconCheckmark, IconSearch, IconUser} from "../../components";
import classNames from 'classnames'

const SectionHowItWorks = props => {

  return (
    <div className={css.firstSectionContainer}>
      <h2 className={css.sectionHeader}><FormattedMessage id={"SectionHowItWorks.header"}/></h2>
      <div className={css.sectionTable}>

        <h3 className={css.sectionRowHeader}><FormattedMessage id={"SectionHowItWorks.parentsHeader"}/></h3>
        <div className={css.sectionRow}>
          <div className={classNames(css.sectionHowBase, css.sectionHowCell)}>
            <IconUser className={css.userIcon} rootClassName={css.userIconRoot}/>
            <div className={css.sectionHowTextGroup}>
              <h4 className={css.howTextHeader}><FormattedMessage id={"SectionHowItWorks.parentProfileHeader"}/></h4>
              <p className={css.howText}><FormattedMessage id={"SectionHowItWorks.parentProfileText"}/></p>
            </div>
          </div>
          <div className={classNames(css.sectionHowBase, css.sectionHowCell)}>
            <IconSearch className={css.searchIcon}/>
            <div className={css.sectionHowTextGroup}>
              <h4 className={css.howTextHeader}><FormattedMessage id={"SectionHowItWorks.parentFindHeader"}/></h4>
              <p className={css.howText}><FormattedMessage id={"SectionHowItWorks.parentFindText"}/></p>
            </div>
          </div>
          <div className={classNames(css.sectionHowBase, css.sectionHowCellNoText)}>
            <div className={css.checkMarkBackground}>
              <IconCheckmark className={css.checkMark} size="big"/>
            </div>
            <h4 className={classNames(css.howTextHeader, css.noTextHeader)}>
              <FormattedMessage id={"SectionHowItWorks.parentBookHeader"}/>
            </h4>
          </div>
        </div>

        <h3 className={css.sectionRowHeader}><FormattedMessage id={"SectionHowItWorks.proHeader"}/></h3>
        <div className={css.sectionRow}>
          <div className={classNames(css.sectionHowBase, css.sectionHowCell)}>
            <IconUser className={css.userIcon} rootClassName={css.userIconRoot2}/>
            <div className={css.sectionHowTextGroup}>
              <h4 className={css.howTextHeader}><FormattedMessage id={"SectionHowItWorks.proProfileHeader"}/></h4>
              <p className={css.howText}><FormattedMessage id={"SectionHowItWorks.proProfileText"}/></p>
            </div>
          </div>
          <div className={classNames(css.sectionHowBase, css.sectionHowCell)}>
            <IconSearch className={css.searchIcon}/>
            <div className={css.sectionHowTextGroup}>
              <h4 className={css.howTextHeader}><FormattedMessage id={"SectionHowItWorks.proFindHeader"}/></h4>
              <p className={css.howText}><FormattedMessage id={"SectionHowItWorks.proFindText"}/></p>
            </div>
          </div>
          <div className={classNames(css.sectionHowBase, css.sectionHowCellNoText)}>
            <div className={css.checkMarkBackground}>
              <IconCheckmark className={css.checkMark} size="big"/>
            </div>
            <h4 className={classNames(css.howTextHeader, css.noTextHeader)}>
              <FormattedMessage id={"SectionHowItWorks.proBookHeader"}/>
            </h4>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SectionHowItWorks;
