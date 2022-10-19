import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import css from './IconDownTriangle.css';

const IconDownTriangle = props => {
  const {
    className,
    rootClassName,
  } = props;

  const classes = classNames(className || css.root);

  return (
    <svg xmlns="http://www.w3.org/2000/svg" version="1.1" x="0" y="0"
         viewBox="0 0 213.333 213.333"
         className={rootClassName}
    >
      <g>
        <g xmlns="http://www.w3.org/2000/svg">
          <g>
            <polygon className={classes} points="0,53.333 106.667,160 213.333,53.333   "
                     data-original="#000000"/>
          </g>
        </g>
        <g xmlns="http://www.w3.org/2000/svg">
        </g>
        <g xmlns="http://www.w3.org/2000/svg">
        </g>
        <g xmlns="http://www.w3.org/2000/svg">
        </g>
        <g xmlns="http://www.w3.org/2000/svg">
        </g>
        <g xmlns="http://www.w3.org/2000/svg">
        </g>
        <g xmlns="http://www.w3.org/2000/svg">
        </g>
        <g xmlns="http://www.w3.org/2000/svg">
        </g>
        <g xmlns="http://www.w3.org/2000/svg">
        </g>
        <g xmlns="http://www.w3.org/2000/svg">
        </g>
        <g xmlns="http://www.w3.org/2000/svg">
        </g>
        <g xmlns="http://www.w3.org/2000/svg">
        </g>
        <g xmlns="http://www.w3.org/2000/svg">
        </g>
        <g xmlns="http://www.w3.org/2000/svg">
        </g>
        <g xmlns="http://www.w3.org/2000/svg">
        </g>
        <g xmlns="http://www.w3.org/2000/svg">
        </g>
      </g>
    </svg>

  );
};

IconDownTriangle.defaultProps = {
  className: null,
  rootClassName: null,
};

const {string} = PropTypes;

IconDownTriangle.propTypes = {
  className: string,
  rootClassName: string,
}

export default IconDownTriangle;
