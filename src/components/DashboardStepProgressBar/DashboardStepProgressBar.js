import React, { Component } from 'react';
import { bool, func, string } from 'prop-types';
import { FormattedMessage } from '../../util/reactIntl';
import classNames from 'classnames';
import routeConfiguration from '../../routeConfiguration';
import { ensureCurrentUser } from '../../util/data';
import { propTypes } from '../../util/types';
import { pathByRouteName } from '../../util/routes';
import { Modal } from '../../components';

// import EmailReminder from './EmailReminder';
// import StripeAccountReminder from './StripeAccountReminder';

// import "react-step-progress-bar/styles.css";
// import { ProgressBar, Step } from "react-step-progress-bar";
// import css from './StepProgressBar.css';

//import StepProgressBar from 'react-step-progress';
// import the stylesheet
//import 'react-step-progress/dist/index.css';
import css from './DashboardStepProgressBar.css'
import EmailReminder from "../ModalMissingInformation/EmailReminder";

import { Steps } from 'rsuite';
import IconSleepConsultant from "../Icons/IconSleepConsultant/IconSleepConsultant";


class DashboardStepProgressBar extends Component {
  constructor(props) {
    super(props);
  }
    componentDidUpdate(){
      const {currentUser, currentUserHasListings, currentUserHasOrders, location} = this.props;
      const user = ensureCurrentUser(currentUser);
    }



  render() {
    const {
      rootClassName,
      className,
      containerClassName,
      currentUser,

      onManageDisableScrolling,

    } = this.props;

    const user = ensureCurrentUser(currentUser);
    const classes = classNames(rootClassName || css.root, className);

    let step1Content = null;

    const currentUserLoaded = user && user.id;

    const content = (
      <h1>Step 1 Content</h1>
    );

    return (
  //     <div className={css.container}>
  //     <ul className={css.progressbar}>
  //     <li className={css.active}>login</li>
  //   <li className={css.active}>choose interest</li>
  //   <li>add friends</li>
  //   <li>View map</li>
  // </ul>
  //   </div>



      // <div >
      //   <br/><br/>
      //   <ul className={"css.list-unstyled multi-steps"}>
      //     <li>Start</li>
      //     <li>First Step</li>
      //     <li className={css.isactive}>Middle Stage</li>
      //     <li>Finish</li>
      //   </ul>
      // </div>


      <div className={css.container}>
        <ul className={css.progressbar}>
          <li className={css.active}>Personal Information</li>
          <li>Payment Method</li>
          {/*<li>add friends</li>*/}
          {/*<li>View map</li>*/}
        </ul>
      </div>





    );
  }
}

DashboardStepProgressBar.defaultProps = {
  className: null,
  rootClassName: null,
  currentUser: null,
};

DashboardStepProgressBar.propTypes = {
  id: string.isRequired,
  className: string,
  rootClassName: string,
  containerClassName: string,

  currentUser: propTypes.currentUser,
  onManageDisableScrolling: func.isRequired,
  sendVerificationEmailError: propTypes.error,
  sendVerificationEmailInProgress: bool.isRequired,
};

DashboardStepProgressBar.displayName = 'ProgressBar';

export default DashboardStepProgressBar;
