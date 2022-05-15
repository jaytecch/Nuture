import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import css from './CardClickable.css';
import {bool, any, string, func} from 'prop-types';

const CardClickable = props => {
  const {children, flat, className, someHandler} = props;
  const classes  = classNames(css.root, (flat ? css.flat : css.floating), className);

  return (
    <div className={ classes } onClick={someHandler}>
      { children }
    </div>
  )
}

CardClickable.defaultProps = {children: null, flat: true, someHandler:null};



CardClickable.propTypes = {
  children: any,
  flat: bool,
  className: string,
  someHandler:func,
};

export default CardClickable;
