import React from "react";
import css from "./UserProfileProgress.css";
import {
  IconBackgroundPassed,
  IconBackgroundSubmitted, IconCheckmark, IconPayment,
  IconProfileInfo,
  IconSubscription
} from "../index";
import Step from "./Step";

export const profileInfo = () => (
  <Step transition="scale">
    {({accomplished}) => (
      <div className={css.stepContent}>
        <div className={accomplished ? css.stepAccomplished : css.stepNotAccomplished}>
          {accomplished ?
            <IconCheckmark rootClassName={css.iconAccomplished}/>
            : <IconProfileInfo
              className={css.iconNotAccomplished}
              rootClassName={css.iconRoot}
            />
          }
        </div>
        <div className={css.labelSpacing}>
          <p className={css.label}>Profile Info</p>
        </div>
      </div>
    )}
  </Step>
);

export const backgroundSubmitted = () => (
  <Step transition="scale">
    {({accomplished}) => (
      <div className={css.stepContent}>
        <div className={accomplished ? css.stepAccomplished : css.stepNotAccomplished}>
          {accomplished ?
            <IconCheckmark rootClassName={css.iconAccomplished}/>
            : <IconBackgroundSubmitted
              className={css.iconNotAccomplished}
              rootClassName={css.iconRoot}
            />
          }
        </div>
        <div className={css.labelSpacing}>
          <p className={css.label}>Background Submitted</p>
        </div>
      </div>
    )}
  </Step>
);

export const backgroundPassed = () => (
  <Step transition="scale">
    {({accomplished}) => (
      <div className={css.stepContent}>
        <div className={accomplished ? css.stepAccomplished : css.stepNotAccomplished}>
          {accomplished ?
            <IconCheckmark rootClassName={css.iconAccomplished}/>
            : <IconBackgroundPassed
              className={accomplished ? css.iconAccomplished : css.iconNotAccomplished}
              rootClassName={css.iconRoot}
            />
          }
        </div>
        <div className={css.labelSpacing}>
          <p className={css.label}>Background Passed</p>
        </div>
      </div>
    )}
  </Step>
);

export const paidSubscription = () => (
  <Step transition="scale">
    {({accomplished}) => (
      <div className={css.stepContent}>
        <div className={accomplished ? css.stepAccomplished : css.stepNotAccomplished}>
          {accomplished ?
            <IconCheckmark rootClassName={css.iconAccomplished}/>
            : <IconSubscription
              className={accomplished ? css.iconAccomplished : css.iconNotAccomplished}
              rootClassName={css.iconRoot}
            />
          }
        </div>
        <div className={css.labelSpacing}>
          <p className={css.label}>Subscription Paid</p>
        </div>
      </div>
    )}
  </Step>
);

export const paymentAdded = () => (
  <Step transition="scale">
    {({accomplished}) => (
      <div className={css.stepContent}>
        <div className={accomplished ? css.stepAccomplished : css.stepNotAccomplished}>
          {accomplished ?
            <IconCheckmark rootClassName={css.iconAccomplished}/>
            : <IconPayment
              className={accomplished ? css.iconAccomplished : css.iconNotAccomplished}
              rootClassName={css.iconRoot}
            />
          }
        </div>
        <div className={css.labelSpacing}>
          <p className={css.label}>Payment Added</p>
        </div>
      </div>
    )}
  </Step>
);
