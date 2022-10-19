import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import css from './IconUser.css';

const IconUser = props => {
  const {
    className,
    rootClassName,
  } = props;

  const classes = classNames(className || css.root);

  return (
    <svg xmlns="http://www.w3.org/2000/svg"
         version="1.1" width="512" height="512" x="0" y="0" viewBox="0 0 512 512"
         className={rootClassName}>
      <g>
        <g xmlns="http://www.w3.org/2000/svg">
          <g>
            <path
              className={classes}
              d="M256,0c-74.439,0-135,60.561-135,135s60.561,135,135,135s135-60.561,135-135S330.439,0,256,0z"
              fill="#ffffff" data-original="#000000"/>
          </g>
        </g>
        <g xmlns="http://www.w3.org/2000/svg">
          <g>
            <path
              className={classes}
              d="M423.966,358.195C387.006,320.667,338.009,300,286,300h-60c-52.008,0-101.006,20.667-137.966,58.195    C51.255,395.539,31,444.833,31,497c0,8.284,6.716,15,15,15h420c8.284,0,15-6.716,15-15    C481,444.833,460.745,395.539,423.966,358.195z"
              fill="#ffffff" data-original="#000000"/>
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

IconUser.defaultProps = {
  className: null,
  rootClassName: null,
};

const {string} = PropTypes;

IconUser.propTypes = {
  className: string,
  rootClassName: string,
}

export default IconUser;
