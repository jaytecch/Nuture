import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import css from './TermsOfUsage.css';

const TermsOfUsage = props => {
  const { rootClassName, className } = props;
  const classes = classNames(rootClassName || css.root, className);

  // prettier-ignore
  return (
    <div className={classes}>
      <h2 className={css.header}>Terms of Usage:</h2>
      {/*<p className={css.lastUpdated}>Last updated: November 14, 2020</p>*/}
        <ul>
          <li className={css.termsli}>Breach of these terms may result in legal action taken against the breaching party.</li>
          <li className={css.termsli}>All services should be booked and paid for using the platform.</li>
          <li className={css.termsli}>Families who cancel less than 48 hours on a service provider will be charged half the total service fee.</li>
          <li className={css.termsli}>Providers and families will not be allowed to use the platform after 3 bad reviews or complaints.</li>
          <li className={css.termsli}>We ask that all Service Providers and families agree to post truthful information about themselves and their position(s).</li>
        </ul>

      <h3>Agreement for Service Providers</h3>
        <p className={css.pHeading}> Service Providers agree to:</p>
        <ul>
          <li className={css.termsli}>Post only truthful information about themselves, their abilities, and their services.</li>
          <li className={css.termsli}>Keep their certifications current.</li>
          <li className={css.termsli}>Receive all payments using  the NurtureUp platform for all clients  obtained through NurtureUp.</li>
        </ul>

      <h3>Agreement for Parents</h3>
        <p className={css.pHeading}>Parents agree to: </p>
        <ul>
          <li className={css.termsli}>Book and pay for all services using NurtureUp’s online platform. </li>
          <li className={css.termsli}>Post only truthful information about themselves, their families, and their needs.</li>
        </ul>
    </div>
  );
};

TermsOfUsage.defaultProps = {
  rootClassName: null,
  className: null,
};

const { string } = PropTypes;

TermsOfUsage.propTypes = {
  rootClassName: string,
  className: string,
};

export default TermsOfUsage;
