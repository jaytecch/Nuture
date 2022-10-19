import React, {useState} from "react";
import {compose} from 'redux';
import {connect} from 'react-redux';
import {propTypes} from "../../util/types";
import {ensureCurrentUser, ensurePaymentMethodCard, ensureStripeCustomer} from "../../util/data";
import {bool, func} from 'prop-types';
import {injectIntl} from "react-intl";
import {TopbarContainer} from '../../containers';
import css from './ProPaymentPage.css';
import {
  LayoutSideNavigation,
  LayoutWrapperMain,
  LayoutWrapperAccountSettingsSideNav,
  LayoutWrapperTopbar,
  LayoutWrapperFooter,
  Footer,
  Page, SavedCardDetails, PrimaryButton, Hero,
} from '../../components';
import {isScrollingDisabled, manageDisableScrolling} from "../../ducks/UI.duck";
import {FormattedMessage, intlShape} from "../../util/reactIntl";
import ProSubscriptionPaymentForm from "../../forms/PaymentMethodsForm/ProSubscriptionPaymentForm";
import {
  chargeProFee,
  stripeCustomer,
  loadData,
  createStripeSetupIntent
} from "../PaymentMethodsPage/PaymentMethodsPage.duck";
import {updateMetadata} from "../../ducks/Auth.duck";
import {handleCardSetup} from "../../ducks/stripe.duck";
import {savePaymentMethod} from "../../ducks/paymentMethods.duck";
import heroUrl from "../../assets/hero-img-account-settings/hero-img-account-settings.png";


export const ProPaymentPageComponent = props => {
  const {
    currentUser,
    scrollingDisabled,
    intl,
    onChange,
    onChargeProFee,
    fetchStripeCustomer,
    onManageDisableScrolling,
    onUpdateUserProfile,
    onCreateSetupIntent,
    onHandleCardSetup,
    onSavePaymentMethod,
    onPageReload,
  } = props;

  const heroHeader = intl.formatMessage({id: "AccountSettings.heroHeader"});

  const [proSubPaymentInProgress, setProSubPaymentInProgress] = useState(false)
  const [showDefaultPayment, setShowDefaultPayment] = useState(true);
  const [showNewPaymentMethod, setShowNewPaymentMethod] = useState(false);
  const [authNotChecked, setAuthNotChecked] = useState(true);
  const [paymentSubmitInProgress, setPaymentSubmitInProgress] = useState(false);

  const user = ensureCurrentUser(currentUser);
  const attributes = user.attributes || {};
  const profile = attributes.profile || {};

  const {privateData} = profile || {};
  const {proSubscriptionPaid} = privateData || {};
  const hasDefaultPaymentMethod =
    currentUser &&
    ensureStripeCustomer(currentUser.stripeCustomer).attributes.stripeCustomerId &&
    ensurePaymentMethodCard(currentUser.stripeCustomer.defaultPaymentMethod).id;

  const card = hasDefaultPaymentMethod
    ? ensurePaymentMethodCard(currentUser.stripeCustomer.defaultPaymentMethod).attributes.card
    : null;

  const title = intl.formatMessage({id: 'ProPaymentPage.title'});

  const getClientSecret = setupIntent => {
    return setupIntent && setupIntent.attributes ? setupIntent.attributes.clientSecret : null;
  };
  const getPaymentParams = (currentUser, formValues) => {
    const {name, addressLine1, addressLine2, postal, state, city, country} = formValues;
    const addressMaybe =
      addressLine1 && postal
        ? {
          address: {
            city: city,
            country: country,
            line1: addressLine1,
            line2: addressLine2,
            postal_code: postal,
            state: state,
          },
        }
        : {};
    const billingDetails = {
      name,
      email: ensureCurrentUser(currentUser).attributes.email,
      ...addressMaybe,
    };

    const paymentParams = {
      payment_method_data: {
        billing_details: billingDetails,
      },
    };

    return paymentParams;
  };
  const handleDefaultPaymentSubmit = (params, values) => {
    setPaymentSubmitInProgress(true);
    fetchStripeCustomer();
    const stripeCustomerId = ensureStripeCustomer(currentUser.stripeCustomer).attributes.stripeCustomerId;

    onChargeProFee(stripeCustomerId)
      .then(() => {
        console.log("in onchargeprofee success");
        const sharetribeParams = {paymentMethodAdded: "true"};
        sharetribeParams.proSubscriptionPaid = "true";
        onUpdateUserProfile(sharetribeParams)
          .then(() => {
            onPageReload();
            setPaymentSubmitInProgress(false);
            setShowDefaultPayment(false);
          })
          .catch(error => {
            console.log('ERROR updating profile!!!' + error.message);
            setPaymentSubmitInProgress(false);
            setShowDefaultPayment(true);
          });
      }).catch(e => {
      console.log("Subscription charge failed");
      setPaymentSubmitInProgress(false);
      setShowDefaultPayment(true);
    });
  };

  const handlePaymentSubmit = (params, values) => {
    const ensuredCurrentUser = ensureCurrentUser(currentUser);
    const stripeCustomer = ensuredCurrentUser.stripeCustomer;
    const {stripe, card, formValues} = params;

    // console.log('in handlesubmit stripe =' + stripe);
    // console.log('in handlesubmit card =' + card);
    // console.log('in handlesubmit formValues =' + formValues);

    // this.setState({proSubPaymentInProgress: true});
    // this.setState({parentSubPaymentInProgress: true});
    setPaymentSubmitInProgress(true);

    onCreateSetupIntent()
      .then(setupIntent => {
        const stripeParams = {
          stripe,
          card,
          setupIntentClientSecret: getClientSecret(setupIntent),
          paymentParams: getPaymentParams(currentUser, formValues),
        };
        return onHandleCardSetup(stripeParams);
      })
      .then(result => {
        console.log('RESULT 11111= ' + result);
        const newPaymentMethod = result.setupIntent.payment_method;
        return onSavePaymentMethod(stripeCustomer, newPaymentMethod);
      })
      .then(result => {
        fetchStripeCustomer();
        return result.attributes.stripeCustomerId;
      })
      .then(stripeCustomerId => {
        const result = onChargeProFee(stripeCustomerId);
        console.log('result of charging pro fee = ' + result);
        return result;
      })
      .then(() => {
        const params = {paymentMethodAdded: "true"};
        params.proSubscriptionPaid = "true";
        setPaymentSubmitInProgress(false);
        onUpdateUserProfile(params)
          .then(() => {
            loadData();
            console.log('LOAD DATA RAN');
          })
          .catch(error => {
            console.log('ERROR updating profile!!!' + error.message);
          });
      })
      .catch(error => {
        console.log('ERROR updating profile!!!' + error.message);
      });

    setShowDefaultPayment(false);
  };


  const handleAuthCheck = (event) => {
    console.log('Checked!!');
    let isChecked = event.target.checked;
    setAuthNotChecked(!isChecked);

  }
  const changePaymentMethod = (event) => {
    console.log('HANDLE CHANGE' + JSON.stringify(event));
    if (event === 'defaultCard') {
      setShowNewPaymentMethod(false);
    } else {
      setShowNewPaymentMethod(true);
    }

    console.log('setshow = ' + showNewPaymentMethod);

  };

  const proForm = user.id ? (
    <ProSubscriptionPaymentForm
      formId="PaymentMethodsForm"
      onSubmit={(params, values) => handlePaymentSubmit(params, values)}
      proPaymentInProgress={paymentSubmitInProgress}
    />
  ) : null;

  const infoText = intl.formatMessage({
    id: 'PaymentMethodsForm.authorizeSubscription',
  });

  const subscriptionActive = (
    <div className={css.subActive}>Your Pro Subscription is currently active</div>
  );

  const subscriptionInActive = (
    <div>

      {card != null ?
        <div>
          <div className={css.subNotActive}>Your Pro Subscription is not currently active. Please
            select from your payment methods on file or add a new payment method to pay the $99
            subscription fee and activate your account.
          </div>

          <SavedCardDetails
            card={card}
            onManageDisableScrolling={onManageDisableScrolling}
            onChange={(event) => changePaymentMethod(event)}
          />
          {!showNewPaymentMethod ?
            <div>
              <div className={css.checkboxAndText}>
                <input type="checkbox" id="authCharge" className={css.checkbox}
                       onClick={(event) => handleAuthCheck(event)}/>
                <label className={css.infoText} htmlFor="authCharge">{infoText}</label>

              </div>
              <PrimaryButton className={css.chargeButton}
                             disabled={authNotChecked}
                             spinnerClassName={css.spinner}
                             inProgress={paymentSubmitInProgress}
                             onClick={(params, values) => handleDefaultPaymentSubmit(params, values)}>
                Charge Subscription Fee
              </PrimaryButton>
            </div> : null

          }
        </div>
        :
        <div>
          <div className={css.subNotActive}>Your Pro Subscription is not currently active. Please
            add a new payment method to pay the $99 subscription fee and activate your account.
          </div>

          <div>{proForm}</div>
        </div>
      }
      {showNewPaymentMethod ? <div>{proForm}</div> : null}
    </div>
  );


  return (
    <Page title={title} scrollingDisabled={scrollingDisabled}>
      <LayoutSideNavigation>

        <LayoutWrapperTopbar>
          <TopbarContainer currentPage="ProPaymentPage"/>
          <Hero url={heroUrl} header={heroHeader}/>
        </LayoutWrapperTopbar>

        <LayoutWrapperAccountSettingsSideNav currentTab="ProPaymentPage"/>

        <LayoutWrapperMain>
          <div className={css.content}>
            <h1 className={css.pageTitle}>
              {title}
            </h1>
            {!proSubscriptionPaid || proSubscriptionPaid === 'false' ? subscriptionInActive : subscriptionActive}
          </div>
        </LayoutWrapperMain>

        <LayoutWrapperFooter>
          <Footer/>
        </LayoutWrapperFooter>
      </LayoutSideNavigation>

    </Page>
  );
};

ProPaymentPageComponent.defaultProps = {
  currentUser: null,
  proSubPaymentInProgress: false
}

ProPaymentPageComponent.propTypes = {
  currentUser: propTypes.currentUser,
  scrollingDisabled: bool.isRequired,
  onChange: func.isRequired,
  proSubPaymentInProgress: bool.isRequired,

  // from injectIntl
  intl: intlShape.isRequired,
};


const mapStateToProps = state => {
  const {
    currentUser,
  } = state.user;

  // const {
  //   proSubPaymentInProgress,
  // } = state.ProPaymentPage;

  return {
    currentUser,
    scrollingDisabled: isScrollingDisabled(state),
  };
};

const mapDispatchToProps = dispatch => ({
  onManageDisableScrolling: (componentId, disableScrolling) =>
    dispatch(manageDisableScrolling(componentId, disableScrolling)),
  onChargeProFee: (stripeCustomer) => dispatch(chargeProFee(stripeCustomer)),
  fetchStripeCustomer: () => dispatch(stripeCustomer()),
  onUpdateUserProfile: params => dispatch(updateMetadata(params)),
  onCreateSetupIntent: params => dispatch(createStripeSetupIntent(params)),
  onHandleCardSetup: params => dispatch(handleCardSetup(params)),
  onSavePaymentMethod: (stripeCustomer, newPaymentMethod) =>
    dispatch(savePaymentMethod(stripeCustomer, newPaymentMethod)),
  onPageReload: () => dispatch(loadData()),
})

const ProPaymentPage = compose(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
  injectIntl
)(ProPaymentPageComponent);

export default ProPaymentPage;

ProPaymentPage.loadData = loadData;
