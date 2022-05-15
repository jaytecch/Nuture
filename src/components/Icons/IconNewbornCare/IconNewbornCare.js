import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import css from "./IconNewbornCare.css";

const IconNewbornCare = props => {
  const {
    className,
    rootClassName,
  } = props;

  const classes = classNames(className || css.root);

  return (
    <svg xmlns="http://www.w3.org/2000/svg"
         width="40.373"
         height="62.624" viewBox="0 0 40.373 62.624"
         className={rootClassName}>
      <path className={classes}
            d="M125.4,5.928A20.186,20.186,0,0,0,90.959,20.186V42.437a20.186,20.186,0,0,0,40.373,0V20.187A20.044,20.044,0,0,0,125.4,5.928ZM111.145,3.669a16.536,16.536,0,0,1,16.517,16.517v8.5l-3.931,2.473A12.967,12.967,0,0,0,121.868,27a12.764,12.764,0,0,0,1.988-5.225h.014a1.835,1.835,0,0,0,0-3.669h-.014a12.843,12.843,0,0,0-25.422,0h0a1.835,1.835,0,0,0,0,3.669h0A12.762,12.762,0,0,0,100.423,27a12.974,12.974,0,0,0-1.76,3.769l-4.035-3.117V20.186A16.536,16.536,0,0,1,111.145,3.669Zm-.951,36.006L101.9,33.268a9.266,9.266,0,0,1,1.076-3.427,12.819,12.819,0,0,0,16.335,0,9.267,9.267,0,0,1,1.076,3.423Zm-.926-28.406a7.321,7.321,0,0,0,5.43,6.058,1.835,1.835,0,1,0,.917-3.553,3.658,3.658,0,0,1-2.679-2.835A9.173,9.173,0,1,1,101.974,20c0-.022,0-.044,0-.066s0-.044,0-.066a9.188,9.188,0,0,1,7.279-8.91,1.83,1.83,0,0,0,.016.309ZM94.628,32.285l12.258,9.471L95.86,48.692a16.428,16.428,0,0,1-1.231-6.255Zm16.517,26.669a16.509,16.509,0,0,1-13.52-7.04l.051-.03,29.986-18.861v9.414a16.536,16.536,0,0,1-16.517,16.517Z"
            transform="translate(-90.959)"/>
    </svg>
  );
};

IconNewbornCare.defaultProps = {
  className: null,
  rootClassName: null,
}

const {string} = PropTypes;

IconNewbornCare.propTypes = {
  className: string,
  rootClassName: string,
}

export default IconNewbornCare;
