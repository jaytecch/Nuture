import React from 'react';
import PropTypes from 'prop-types';
import logoSvg from '../../assets/nurtureup_logo/nurtureup_topbar_logo.png';
import css from './Logo.css';

const IconLogo = props => {
  const { className, format, ...rest } = props;

  if (format === 'desktop') {
    return (

      <img className={css.logo} src={logoSvg} alt="NurtureUp Logo" />
    );
  }

  return (
    <img className={css.logo} src={logoSvg} alt="NurtureUp Logo" />
  );
};

const { string } = PropTypes;

IconLogo.defaultProps = {
  className: null,
};

IconLogo.propTypes = {
  className: string,
};

export default IconLogo;
