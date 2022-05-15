import React from "react";
import {injectIntl} from "react-intl";
import {compose} from "redux";
import {propTypes} from '../../util/types';
import css from './UserProfileProgress.css';
import ProgressBar from "./ProgressBar";
import Step from './Step';
import {
  profileInfo,
  backgroundPassed,
  backgroundSubmitted,
  paidSubscription,
  paymentAdded
} from "./PossibleSteps";
import {ensureCurrentUser} from "../../util/data";

const UserProfileProgressComponent = props => {
  const {
    currentUser,
  } = props;

  const user = ensureCurrentUser(currentUser);
  const {profile} =user.attributes || {};
  const {privateData, publicData} = profile || {};
  const {accountType} = publicData || {};
  const isPro = accountType === "pro";
  const {
    backgroundInvestigationSubmitted,
    paymentMethodAdded,
    proSubscriptionPaid,
    backgroundPassed: bckgrdPassed
  } = privateData || {};

  const usersSteps = [];

  // Order the steps so that all success is in the beginning.
  let stepPositions;
  if(isPro) {
    usersSteps.push({done: bckgrdPassed === 'true', step: backgroundPassed});
    usersSteps.unshift({done: backgroundInvestigationSubmitted === "true", step: backgroundSubmitted});
    usersSteps.unshift({done: proSubscriptionPaid === 'true', step: paidSubscription});
    stepPositions = [0, 33, 66, 100];
  } else {
    usersSteps.push({done: paymentMethodAdded === 'true', step: paymentAdded});
    stepPositions = [0, 100];
  }
  usersSteps.unshift({done: true, step: profileInfo});

  // Calculate Percentage
  const numStepsDone = usersSteps.reduce((cnt, currStep) => cnt + (currStep.done ? 1 : 0), 0);
  const percent = Math.ceil(((numStepsDone -1) / (usersSteps.length-1)) * 100);

  return (
    <div className={css.root}>
      <p className={css.progressHeader}>Complete your profile</p>
      <div className={css.spacing}>
        <ProgressBar
          percent={percent}
          stepPositions={stepPositions}
          hasStepZero={false}
        >
          {usersSteps.map(step => step.step())}
        </ProgressBar>
      </div>
    </div>
  );
}

UserProfileProgressComponent.propTypes = {
  currentUser: propTypes.currentUser.isRequired,
}

const UserProfileProgress = compose(
  injectIntl
)(UserProfileProgressComponent);

export default UserProfileProgress;
