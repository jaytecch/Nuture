import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import css from './FAQ.css';

const FAQ = props => {
  const { rootClassName, className } = props;
  const classes = classNames(rootClassName || css.root, className);

  // prettier-ignore
  return (
    <div className={classes}>
      <h2 className={css.header}>FAQ's</h2>

      <h3>For Parents:</h3>
        <ul>
          <li className={css.faqli}>Why do I need NurtureUp?
            <p className={css.answer}>
              We exist to take away the hassle of finding the right service provider to assist you to nurture your newborn, and to help qualified service providers to connect with parents in need of their services.
            </p>
          </li>
          <li className={css.faqli}>Are providers available 24/7?
            <p className={css.answer}>Our providers list their various times of availability. You can also filter your search for providers who are available in the time frame and time zone of your preference.
            </p>
          </li>
          <li className={css.faqli}> Where do I see the availability of the service provider?
            <p className={css.answer}>It is displayed on each providers calendar.</p>
          </li>
          <li className={css.faqli}>Do I pay the service provider directly? Do I always need to pay through the NurtureUp?
            <p className={css.answer}>We ask that all our parents only use our website for bookings and payments.  By directing all payments through our site we can ensure that you are receiving quality care under the protection of our agreements and policies.</p>
          </li>
          <li className={css.faqli}>What happens if I am not satisfied with the provider?
            <p className={css.answer}>Our service providers are experts in their fields and have been well vetted. If, for any reason, you are not satisfied, Please speak with your provider to cancel service.</p>
          </li>
          <li className={css.faqli}>How do we contact you?
            <p className={css.answer}>Send an email to: support@nurtureup.com.</p>
          </li>

        </ul>

      <h3>For Providers</h3>

        <ul>
          <li className={css.faqli}>Why do I need NurtureUp?
            <p className={css.answer}>As a provider, you are aware of the frustration of getting clients. NurtureUp eases that process for you and connects you with parents who are seeking someone like you.</p>
          </li>
          <li className={css.faqli}>Do I set my own rates?
            <p className={css.answer}>Yes, you set your own rates. We ask that you stay market competitive.</p>
          </li>
          <li className={css.faqli}>How do I partner with you?
            <p className={css.answer}>Do you have a company that connects with NurtureUp’s vision and mission? Please let us know by sending an email to support@nurtureup.com.</p>
            <p className={css.answer}>We are happy to hear from you. </p>
          </li>
        </ul>

      <h3>For Parents and Providers</h3>
        <ul>
          <li className={css.faqli}>What payment options do you accept?
            <p className={css.answer}>We accept all major credit cards and debit cards.</p>
            <p className={css.answer}>Cash payments are prohibited</p>
          </li>
          <li className={css.faqli}>What fees do I have to pay to use NurtureUp?
            <p className={css.answer}>Parents use our platform for free. Service providers pay a _$99 this cost is annual for background check and and set up fee for the use of our platform.</p>
          </li>
          <li className={css.faqli}>Are you located in my state?
            <p className={css.answer}>We are available to connect parents and service providers in many states in the United States of America. If you are searching for a service or parents in your state and cannot find any, please let us know and we will do our best to connect you with someone in close proximity to you. Email us hello@nurtureup.com</p>
          </li>
          <li className={css.faqli}>What is your cancellation policy?
            <p className={css.answer}>We ask our parents or service providers to inform providers of any cancellation at least 48 hours notice.</p>
          </li>
          <li className={css.faqli}>How do we contact you?
            <p className={css.answer}>Send an email to: support@nurtureup.com.</p>
            <p className={css.answer}>Follow us on Social Media
              <br/><a href="https://www.facebook.com/Wenurtureup">Facebook</a>
              <br/><a href="https://www.instagram.com/wenurtureup/">Instagram </a>
              <br/><a href="https://twitter.com/WeNurtureup">Twitter </a>
            </p>
          </li>
        </ul>
    </div>
  );
};

FAQ.defaultProps = {
  rootClassName: null,
  className: null,
};

const { string } = PropTypes;

FAQ.propTypes = {
  rootClassName: string,
  className: string,
};

export default FAQ;
