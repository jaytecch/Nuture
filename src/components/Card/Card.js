import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import css from './Card.css';

const Card = props => {
  const {
    children,
    flat,
    className,
    header,
  } = props;
  const classes  = classNames(css.root, (flat ? css.flat : css.floating), className);

  return (
    <div className={ classes }>
      {header ? <h2 className={css.header}>{header}</h2> : null}
      { children }
    </div>
  )
}

Card.defaultProps = {
  children: null,
  flat: true,
  header: null
};

const { any, bool, string } = PropTypes;

Card.propTypes = {
  children: any,
  flat: bool,
  className: string,
  header: string,
};

export default Card;
