import React, {Component} from 'react';
import PropTypes, {func, string} from 'prop-types';
import {FormattedMessage, injectIntl, intlShape} from '../../util/reactIntl';
import {compose} from 'redux';
import {connect} from 'react-redux';
import {types as sdkTypes} from '../../util/sdkLoader';
import {REVIEW_TYPE_OF_PROVIDER, REVIEW_TYPE_OF_CUSTOMER, propTypes} from '../../util/types';
import {ensureCurrentUser, ensureUser} from '../../util/data';
import {withViewport} from '../../util/contextHelpers';
import {isScrollingDisabled, manageDisableScrolling} from '../../ducks/UI.duck';
import {getMarketplaceEntities} from '../../ducks/marketplaceData.duck';
import { withRouter } from 'react-router-dom';
import {
  Page,
  LayoutWrapperMain,
  LayoutWrapperTopbar,
  LayoutWrapperFooter,
  Footer,
  AvatarLarge,
  NamedLink,
  Reviews,
  ButtonTabNavHorizontal, PrimaryButton, LayoutSingleColumn, Modal,
} from '../../components';
import {TopbarContainer, NotFoundPage} from '../../containers';
import {loadData, sendEnquiry} from './ProfilePage.duck';
import config from '../../config';

import css from './ProfilePage.css';
import {EnquiryForm} from "../../forms";
import routeConfiguration from "../../routeConfiguration";
import {createResourceLocatorString} from "../../util/routes";

const {UUID} = sdkTypes;
const MAX_MOBILE_SCREEN_WIDTH = 768;

export class ProfilePageComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      // keep track of which reviews tab to show in desktop viewport
      showReviewsType: REVIEW_TYPE_OF_PROVIDER,
      messageModalOpen: false,
    };

    this.showOfProviderReviews = this.showOfProviderReviews.bind(this);
    this.showOfCustomerReviews = this.showOfCustomerReviews.bind(this);
    this.onContactUser = this.onContactUser.bind(this);
    this.onSubmitEnquiry = this.onSubmitEnquiry.bind(this);
  }

  showOfProviderReviews() {
    this.setState({
      showReviewsType: REVIEW_TYPE_OF_PROVIDER,
    });
  }

  showOfCustomerReviews() {
    this.setState({
      showReviewsType: REVIEW_TYPE_OF_CUSTOMER,
    });
  }

  onContactUser() {
    const { currentUser, history, callSetInitialValues, params, location } = this.props;

    if (!currentUser) {
      const state = { from: `${location.pathname}${location.search}${location.hash}` };

      // We need to log in before showing the modal, but first we need to ensure
      // that modal does open when user is redirected back to this listingpage
      //callSetInitialValues(setInitialValues, { enquiryModalOpenForListingId: params.id });

      // signup and return back to listingPage.
      history.push(createResourceLocatorString('SignupPage', routeConfiguration(), {}, {}), state);
    } else {
      this.setState({ messageModalOpen: true });
    }
  }

  onSubmitEnquiry(values) {
    const { history, params, onSendEnquiry } = this.props;
    const routes = routeConfiguration();
    const listingId = new UUID(params.id);
    const { message } = values;

    onSendEnquiry(listingId, message.trim())
      .then(txId => {
        this.setState({ messageModalOpen: false });

        // Redirect to OrderDetailsPage
        history.push(
          createResourceLocatorString('OrderDetailsPage', routes, { id: txId.uuid }, {})
        );
      })
      .catch(() => {
        // Ignore, error handling in duck file
      });
  }

  render() {
    const {
      scrollingDisabled,
      currentUser,
      user,
      userShowError,
      reviews,
      queryReviewsError,
      viewport,
      intl,
      isAuthenticated,
      onManageDisableScrolling,
      onSendEnquiry,
      sendEnquiryError,
      sendEnquiryInProgress,
    } = this.props;

    const ensuredCurrentUser = ensureCurrentUser(currentUser);
    const profileUser = ensureUser(user);
    const isCurrentUser =
      ensuredCurrentUser.id && profileUser.id && ensuredCurrentUser.id.uuid === profileUser.id.uuid;
    const displayName = profileUser.attributes.profile.displayName;
    const bio = profileUser.attributes.profile.bio;
    const hasBio = !!bio;
    const isMobileLayout = viewport.width < MAX_MOBILE_SCREEN_WIDTH;

    const editLinkMobile = isCurrentUser ? (
      <NamedLink className={css.editLinkMobile} name="ProfileSettingsPage">
        <FormattedMessage id="ProfilePage.editProfileLinkMobile"/>
      </NamedLink>
    ) : null;
    const editLinkDesktop = isCurrentUser ? (
      <NamedLink className={css.editLinkDesktop} name="ProfileSettingsPage">
        <FormattedMessage id="ProfilePage.editProfileLinkDesktop"/>
      </NamedLink>
    ) : null;


    const asideContent = (
      <div className={css.asideContent}>
        <AvatarLarge className={css.avatar} user={user} disableProfileLink/>
        <h1 className={css.mobileHeading}>
          {displayName ? (
            <FormattedMessage id="ProfilePage.mobileHeading" values={{name: displayName}}/>
          ) : null}
        </h1>
        {editLinkMobile}
        {editLinkDesktop}
      </div>
    );

    const reviewsError = (
      <p className={css.error}>
        <FormattedMessage id="ProfilePage.loadingReviewsFailed"/>
      </p>
    );

    const reviewsOfProvider = reviews.filter(r => r.attributes.type === REVIEW_TYPE_OF_PROVIDER);

    const reviewsOfCustomer = reviews.filter(r => r.attributes.type === REVIEW_TYPE_OF_CUSTOMER);

    const mobileReviews = (
      <div className={css.mobileReviews}>
        <h2 className={css.mobileReviewsTitle}>
          <FormattedMessage
            id="ProfilePage.reviewsOfProviderTitle"
            values={{count: reviewsOfProvider.length}}
          />
        </h2>
        {queryReviewsError ? reviewsError : null}
        <Reviews reviews={reviewsOfProvider}/>
        <h2 className={css.mobileReviewsTitle}>
          <FormattedMessage
            id="ProfilePage.reviewsOfCustomerTitle"
            values={{count: reviewsOfCustomer.length}}
          />
        </h2>
        {queryReviewsError ? reviewsError : null}
        <Reviews reviews={reviewsOfCustomer}/>
      </div>
    );

    const desktopReviewTabs = [
      {
        text: (
          <h3 className={css.desktopReviewsTitle}>
            <FormattedMessage
              id="ProfilePage.reviewsOfProviderTitle"
              values={{count: reviewsOfProvider.length}}
            />
          </h3>
        ),
        selected: this.state.showReviewsType === REVIEW_TYPE_OF_PROVIDER,
        onClick: this.showOfProviderReviews,
      },
      {
        text: (
          <h3 className={css.desktopReviewsTitle}>
            <FormattedMessage
              id="ProfilePage.reviewsOfCustomerTitle"
              values={{count: reviewsOfCustomer.length}}
            />
          </h3>
        ),
        selected: this.state.showReviewsType === REVIEW_TYPE_OF_CUSTOMER,
        onClick: this.showOfCustomerReviews,
      },
    ];

    const desktopReviews = (
      <div className={css.desktopReviews}>
        <ButtonTabNavHorizontal className={css.desktopReviewsTabNav} tabs={desktopReviewTabs}/>

        {queryReviewsError ? reviewsError : null}

        {this.state.showReviewsType === REVIEW_TYPE_OF_PROVIDER ? (
          <Reviews reviews={reviewsOfProvider}/>
        ) : (
          <Reviews reviews={reviewsOfCustomer}/>
        )}
      </div>
    );

    const mainContent = (
      <div>
        <div className={css.headingAndButtons}>
          <h1 className={css.desktopHeading}>
            <FormattedMessage id="ProfilePage.desktopHeading" values={{name: displayName}}/>
          </h1>
          <div className={css.buttonGroup}>
            <PrimaryButton>Make Appointment</PrimaryButton>
            <PrimaryButton onClick={this.onContactUser}>Send Message</PrimaryButton>
          </div>
        </div>

        {hasBio ?
          <div>
            <h2 className={css.sectionHeading}>About</h2>
            <p className={css.bio}>{bio}</p>
          </div>
          : null}
        {/*{isMobileLayout ? mobileReviews : desktopReviews}*/}
      </div>
    );

    let content;

    if (userShowError && userShowError.status === 404) {
      return <NotFoundPage/>;
    } else if (userShowError) {
      content = (
        <p className={css.error}>
          <FormattedMessage id="ProfilePage.loadingDataFailed"/>
        </p>
      );
    } else {
      content = mainContent;
    }

    const schemaTitle = intl.formatMessage(
      {
        id: 'ProfilePage.schemaTitle',
      },
      {
        name: displayName,
        siteTitle: config.siteTitle,
      }
    );

    return (
      <Page
        scrollingDisabled={scrollingDisabled}
        title={schemaTitle}
        schema={{
          '@context': 'http://schema.org',
          '@type': 'ProfilePage',
          name: schemaTitle,
        }}
      >
        <LayoutSingleColumn>
          <LayoutWrapperTopbar>
            <TopbarContainer currentPage="ProfilePage"/>
          </LayoutWrapperTopbar>
          <LayoutWrapperMain>
            <div className={css.heroContainer}>
              <div className={css.heroContent}/>
            </div>

            <div className={css.contentContainer}>
              <AvatarLarge className={css.avatar} user={user} disableProfileLink/>
              <div className={css.mainContent}>
                {content}
              </div>
            </div>

            <Modal
              id="ListingPage.enquiry"
              contentClassName={css.messageModalContent}
              isOpen={isAuthenticated && this.state.messageModalOpen}
              onClose={() => this.setState({ messageModalOpen: false })}
              onManageDisableScrolling={onManageDisableScrolling}
            >
              <EnquiryForm
                className={css.messageForm}
                submitButtonWrapperClassName={css.messageSubmitButtonWrapper}
                listingTitle='no title'
                authorDisplayName={displayName}
                sendEnquiryError={sendEnquiryError}
                onSubmit={this.onSubmitEnquiry}
                inProgress={sendEnquiryInProgress}
              />
            </Modal>
          </LayoutWrapperMain>
          <LayoutWrapperFooter>
            <Footer/>
          </LayoutWrapperFooter>
        </LayoutSingleColumn>
      </Page>
    );
  }
}

ProfilePageComponent.defaultProps = {
  currentUser: null,
  user: null,
  userShowError: null,
  reviews: [],
  queryReviewsError: null,
};

const {bool, arrayOf, number, shape} = PropTypes;

ProfilePageComponent.propTypes = {
  scrollingDisabled: bool.isRequired,
  currentUser: propTypes.currentUser,
  user: propTypes.user,
  userShowError: propTypes.error,
  reviews: arrayOf(propTypes.review),
  queryReviewsError: propTypes.error,

  // from withRouter
  history: shape({
    push: func.isRequired,
  }).isRequired,
  location: shape({
    search: string,
  }).isRequired,

  // form withViewport
  viewport: shape({
    width: number.isRequired,
    height: number.isRequired,
  }).isRequired,

  // from injectIntl
  intl: intlShape.isRequired,
  isAuthenticated: bool.isRequired,
  onManageDisableScrolling: func.isRequired,
  onSendEnquiry:func.isRequired,

  sendEnquiryError: propTypes.error,
  sendEnquiryInProgress: bool.isRequired,
};

const mapStateToProps = state => {
  const {currentUser} = state.user;
  const {isAuthenticated} = state.Auth;
  const {
    userId,
    userShowError,
    reviews,
    queryReviewsError,
    sendEnquiryError,
    sendEnquiryInProgress,
  } = state.ProfilePage;
  const userMatches = getMarketplaceEntities(state, [{type: 'user', id: userId}]);
  const user = userMatches.length === 1 ? userMatches[0] : null;

  return {
    scrollingDisabled: isScrollingDisabled(state),
    currentUser,
    user,
    userShowError,
    reviews,
    queryReviewsError,
    isAuthenticated,
    sendEnquiryError,
    sendEnquiryInProgress,
  };
};
//onSendEnquiry: (listingId, message) => dispatch(sendEnquiry(listingId, message))
const mapDispatchToProps = dispatch => ({
  onManageDisableScrolling: (componentId, disableScrolling) =>
    dispatch(manageDisableScrolling(componentId, disableScrolling)),
  onSendEnquiry: (listingId, message) => dispatch(sendEnquiry(listingId, message))
});

const SignupFormPage = compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps),
  withViewport,
  injectIntl
)(ProfilePageComponent);

SignupFormPage.loadData = params => {
  const id = new UUID(params.id);
  return loadData(id);
};

export default SignupFormPage;
