import React, {useEffect, useState} from 'react';
import {string} from 'prop-types';
import classNames from 'classnames';
import {
  IconSearchCareJob,
  IconSearchCareGiver,
  NamedLink
} from '../../components';
import css from './SectionHero.css';

const ICON_MIN_SHOW_WIDTH = 550;

const SectionHero = props => {
  const {rootClassName, className} = props;
  const classes = classNames(rootClassName || css.root, className);
  const [showButtonIcon, setShowButtonIcon] = useState(false)

  const handleWindowResize = e => {
    const showIcon = window.innerWidth >= ICON_MIN_SHOW_WIDTH;
    setShowButtonIcon(showIcon);
  }

  useEffect(() => {
    handleWindowResize(null);
    window.addEventListener("resize", handleWindowResize);

    return () => {
      window.addEventListener("resize", handleWindowResize);
    }
  });

  return (
      <div className={css.contents}>
        <div className={css.h2text}>Connecting parents with trusted Baby Care Professionals</div>

        <div className={css.searchButtonGroup}>
          <div className={css.buttonPadding}>
            <NamedLink name="SearchPage" className={css.toSearchPageButton}>
              {showButtonIcon ? <IconSearchCareGiver className={css.icon}/> : null }
              <div className={css.proButtonText}>FOR SERVICE PROS</div>
            </NamedLink>

            <NamedLink name="SearchPage" className={css.toSearchPageButton}>
              {showButtonIcon ? <IconSearchCareJob className={css.icon}/> : null }
              <div className={css.parentButtonText}>FOR PARENTS</div>
            </NamedLink>
          </div>
        </div>
      </div>
  );
};

SectionHero.defaultProps = {rootClassName: null, className: null};

SectionHero.propTypes = {
  rootClassName: string,
  className: string,
};

export default SectionHero;
