import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import css from './IconSocialMediaFacebook.css';

const IconSocialMediaFacebook = props => {
  const { rootClassName, className } = props;
  const classes = classNames(rootClassName || css.root, className);
  return (
    // <svg
    //   className={classes}
    //   width="10"
    //   height="17"
    //   viewBox="0 0 10 17"
    //   xmlns="http://www.w3.org/2000/svg"
    // >
    //   <path
    //     d="M8.65 1.108C8.413 1.072 7.59 1 6.633 1c-2 0-3.374 1.244-3.374 3.525V6.49H1v2.668h2.258v6.84h2.71V9.16h2.25l.345-2.668H5.968V4.786c0-.766.204-1.298 1.293-1.298h1.39v-2.38z"
    //     fillRule="evenodd"
    //   />
    // </svg>
    <svg id="Facebook" className={classes} xmlns="http://www.w3.org/2000/svg" width="48.946" height="48.946"
         viewBox="0 0 48.946 48.946">
      <path id="icon-facebook"
            d="M6.738,46h15V29.648H16.352V24.258h5.391V17.52a6.746,6.746,0,0,1,6.738-6.738h6.738v5.391H29.828a2.7,2.7,0,0,0-2.7,2.7v5.391h7.843l-.9,5.391H27.133V46H39.262A6.746,6.746,0,0,0,46,39.262V6.738A6.746,6.746,0,0,0,39.262,0H6.738A6.746,6.746,0,0,0,0,6.738V39.262A6.746,6.746,0,0,0,6.738,46ZM2.7,6.738A4.048,4.048,0,0,1,6.738,2.7H39.262A4.048,4.048,0,0,1,43.3,6.738V39.262A4.048,4.048,0,0,1,39.262,43.3H29.828V32.344H36.36l1.8-10.781H29.828v-2.7h8.086V8.086H28.48a9.444,9.444,0,0,0-9.434,9.434v4.043H13.656V32.344h5.391V43.3H6.738A4.048,4.048,0,0,1,2.7,39.262Zm0,0"
            transform="translate(1.946 1.946)" fill="#fff"/>
      <g id="icon-facebook-color" opacity="0">
        <path id="Path_21" data-name="Path 21"
              d="M42.828,0H6.118A6.123,6.123,0,0,0,0,6.118V42.828a6.124,6.124,0,0,0,6.118,6.118H42.828a6.126,6.126,0,0,0,6.118-6.118V6.118A6.124,6.124,0,0,0,42.828,0Z"
              fill="#3b5999"/>
        <path id="Path_22" data-name="Path 22"
              d="M24.3,19.8V13.677c0-1.689,1.37-1.53,3.059-1.53h3.059V4.5H24.3a9.175,9.175,0,0,0-9.177,9.177V19.8H9v7.648h6.118V44.268H24.3V27.443h4.589L31.943,19.8Z"
              transform="translate(9.355 4.677)" fill="#fff"/>
      </g>
    </svg>


  );
};

IconSocialMediaFacebook.defaultProps = { rootClassName: null, className: null };

const { string } = PropTypes;

IconSocialMediaFacebook.propTypes = { rootClassName: string, className: string };

export default IconSocialMediaFacebook;
