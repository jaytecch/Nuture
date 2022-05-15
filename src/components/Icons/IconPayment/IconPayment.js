import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import css from './IconPayment.css';

const IconPayment = props => {
  const {
    className,
    rootClassName
  } = props;

  const classes = classNames(className || css.root);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg" x="0px"
      y="0px"
      viewBox="0 0 512 512"
      className={rootClassName}

    >
      <g>
        <g>
          <path className={classes} d="M458.667,85.333H53.333C23.936,85.333,0,109.269,0,138.667v234.667c0,29.397,23.936,53.333,53.333,53.333h405.333
  c29.397,0,53.333-23.936,53.333-53.333V138.667C512,109.269,488.064,85.333,458.667,85.333z M490.667,373.333
  c0,17.643-14.357,32-32,32H53.333c-17.643,0-32-14.357-32-32V138.667c0-17.643,14.357-32,32-32h405.333c17.643,0,32,14.357,32,32
  V373.333z"/>
        </g>
      </g>
      <g>
        <g>
          <path className={classes} d="M501.333,149.333H10.667C4.779,149.333,0,154.112,0,160v64c0,5.888,4.779,10.667,10.667,10.667h490.667
c5.888,0,10.667-4.779,10.667-10.667v-64C512,154.112,507.221,149.333,501.333,149.333z M490.667,213.333H21.333v-42.667h469.333
V213.333z"/>
        </g>
      </g>
      <g>
        <g>
          <path className={classes} d="M202.667,298.667h-128c-5.888,0-10.667,4.779-10.667,10.667S68.779,320,74.667,320h128
c5.888,0,10.667-4.779,10.667-10.667S208.555,298.667,202.667,298.667z"/>
        </g>
      </g>
      <g>
        <g>
          <path className={classes} d="M202.667,341.333h-128C68.779,341.333,64,346.112,64,352c0,5.888,4.779,10.667,10.667,10.667h128
c5.888,0,10.667-4.779,10.667-10.667C213.333,346.112,208.555,341.333,202.667,341.333z"/>
        </g>
      </g>
      <g>
        <g>
          <path className={classes} d="M416,277.333h-21.333c-17.643,0-32,14.357-32,32v21.333c0,17.643,14.357,32,32,32H416c17.643,0,32-14.357,32-32v-21.333
C448,291.691,433.643,277.333,416,277.333z M426.667,330.667c0,5.888-4.779,10.667-10.667,10.667h-21.333
c-5.888,0-10.667-4.779-10.667-10.667v-21.333c0-5.888,4.779-10.667,10.667-10.667H416c5.888,0,10.667,4.779,10.667,10.667
V330.667z"/>
        </g>
      </g>
      <g>
      </g>
      <g>
      </g>
      <g>
      </g>
      <g>
      </g>
      <g>
      </g>
      <g>
      </g>
      <g>
      </g>
      <g>
      </g>
      <g>
      </g>
      <g>
      </g>
      <g>
      </g>
      <g>
      </g>
      <g>
      </g>
      <g>
      </g>
      <g>
      </g>
    </svg>
  );
}

const {string} = PropTypes;

IconPayment.defaultProps = {
  className: null,
  rootClassName: null,
}

IconPayment.propTypes = {
  className: string,
  rootClassName: string,
}

export default IconPayment;
