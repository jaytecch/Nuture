/**
 * This is a wrapper component for different Layouts.
 * Navigational 'aside' content should be added to this wrapper.
 */
import React, {Component} from 'react';
import {node, number, string, shape, object, bool} from 'prop-types';
import {compose} from 'redux';
import {FormattedMessage} from 'react-intl';
import {withViewport} from '../../util/contextHelpers';
import {LayoutWrapperSideNav} from '../../components';
import {ImageForm} from "../../forms";
import css from "./LayoutWrapperAccountSettingsSideNav.css";
import {ensureCurrentUser} from "../../util/data";
import {
  updateProfile,
  uploadImage
} from "../../ducks/ProfileSettings.duck";
import {connect} from "react-redux";
import {propTypes} from "../../util/types";

const MAX_HORIZONTAL_NAV_SCREEN_WIDTH = 1023;

const scrollToTab = currentTab => {
  const el = document.querySelector(`#${currentTab}Tab`);

  if (el) {
    el.scrollIntoView({
      block: 'end',
      inline: 'end',
      behavior: 'smooth',
    });
  }
};

const onImageUploadHandler = (values, fn) => {
  const {id, imageId, file} = values;
  if (file) {
    fn({id, imageId, file});
  }
};

export class LayoutWrapperAccountSettingsSideNavComponent extends Component {
  render() {
    const {
      currentTab,
      viewport,
      onUpdateProfile,
      onImageUpload,
      uploadInProgress,
      image,
      uploadImageError,
      updateProfileError,
      currentUser
    } = this.props;

    let hasScrolledToTab = false;

    const {width} = viewport;
    const hasViewport = width > 0;
    const hasHorizontalTabLayout = hasViewport && width <= MAX_HORIZONTAL_NAV_SCREEN_WIDTH;
    const hasVerticalTabLayout = hasViewport && width > MAX_HORIZONTAL_NAV_SCREEN_WIDTH;
    const hasFontsLoaded = hasViewport && document.documentElement.classList.contains('fontsLoaded');


    // Check if scrollToTab call is needed (tab is not visible on mobile)
    if (hasVerticalTabLayout) {
      hasScrolledToTab = true;
    } else if (hasHorizontalTabLayout && !hasScrolledToTab && hasFontsLoaded) {
      scrollToTab(currentTab);
      hasScrolledToTab = true;
    }

    const user = ensureCurrentUser(currentUser);
    const profileImageId = user.profileImage ? user.profileImage.id : null;
    const profileImage = image || {imageId: profileImageId};
    const attributes = user.attributes || {};
    const profile = attributes.profile || {};
    const publicData = profile.publicData || {};
    const userIsParent = publicData.accountType === 'parent';

    const bioTextId = userIsParent ?
      "LayoutWrapperAccountSettingsSideNav.preferencesTabTitle" :
      "LayoutWrapperAccountSettingsSideNav.bioTabTitle";

    const tabs = [
      {
        text: <FormattedMessage id="LayoutWrapperAccountSettingsSideNav.profileTabTitle"/>,
        selected: currentTab === 'ContactDetailsPage',
        id: 'ContactDetailsPageTab',
        linkProps: {
          name: 'ContactDetailsPage',
        },
      },
      {
        text: <FormattedMessage id="LayoutWrapperAccountSettingsSideNav.passwordTabTitle"/>,
        selected: currentTab === 'PasswordChangePage',
        id: 'PasswordChangePageTab',
        linkProps: {
          name: 'PasswordChangePage',
        },
      },
      {
        text: <FormattedMessage id="LayoutWrapperAccountSettingsSideNav.paymentMethodsTabTitle"/>,
        selected: currentTab === 'PaymentMethodsPage',
        id: 'PaymentMethodsPageTab',
        linkProps: {
          name: 'PaymentMethodsPage',
        },
      },
    ];

    if (!userIsParent) {
      tabs.push(
        {
          text: <FormattedMessage id={bioTextId}/>,
          selected: currentTab === 'BioPage',
          id: 'BioPageTab',
          linkProps: {
            name: 'BioPage',
          },
        },
        {
          text: <FormattedMessage id="LayoutWrapperAccountSettingsSideNav.paymentsTabTitle"/>,
          selected: currentTab === 'StripePayoutPage',
          id: 'StripePayoutPageTab',
          linkProps: {
            name: 'StripePayoutPage',
          },
        },
        {
          text: <FormattedMessage id="LayoutWrapperAccountSettingsSideNav.editServicesTabTitle"/>,
          selected: currentTab === 'EditServicesPage',
          id: 'EditServicesPageTab',
          linkProps: {
            name: 'EditServicesPage',
          },
        },
        {
          text: <FormattedMessage id="LayoutWrapperAccountSettingsSideNav.providerSubscriptionTabTitle"/>,
          selected: currentTab === 'ProPaymentPage',
          id: 'ProPaymentPage',
          linkProps: {
            name: 'ProPaymentPage',
          },
        },
        {
          text: <FormattedMessage id="LayoutWrapperAccountSettingsSideNav.providerBackgroundTabTitle"/>,
          selected: currentTab === 'BackgroundDisclosuresPage',
          id: 'BackgroundDisclosuresPage',
          linkProps: {
            name: 'BackgroundDisclosuresPage',
          },
        },
        )
    } else {
      tabs.push(
        {
          text:<FormattedMessage id="LayoutWrapperAccountSettingsSideNav.jobListingPageTitle" />,
          selected: currentTab === 'EditJobListingPage',
          id: 'EditJobListingPageTab',
          linkProps: {
            name: 'EditJobListingPage',
          }
        }
      )
    }

    const handleSubmit = () => {
      const img = this.props.image;
      if (img && img.imageId && img.file) {
        // Update profileImage only if file system has been accessed
        onUpdateProfile({profileImageId: img.imageId})
      }
    };


    const profileImageForm = user.id ? (
      <ImageForm
        className={css.form}
        currentUser={currentUser}
        initialValues={{profileImage: user.profileImage}}
        profileImage={profileImage}
        onImageUpload={e => onImageUploadHandler(e, onImageUpload)}
        uploadInProgress={uploadInProgress}
        uploadImageError={uploadImageError}
        updateProfileError={updateProfileError}
        onSubmit={handleSubmit}
      />
    ) : null;


    return (
      <LayoutWrapperSideNav tabs={tabs}>
        {profileImageForm}
      </LayoutWrapperSideNav>
    );
  };
}

LayoutWrapperAccountSettingsSideNavComponent.defaultProps = {
  className: null,
  rootClassName: null,
  children: null,
  currentTab: null,
  image: null,
  uploadImageError: null,
  updateProfileError: null,
};

LayoutWrapperAccountSettingsSideNavComponent.propTypes = {
  currentUser: propTypes.currentUser,
  children: node,
  className: string,
  rootClassName: string,
  currentTab: string,


  image: shape({
    id: string,
    imageId: propTypes.uuid,
    file: object,
    uploadedImage: propTypes.image,
  }),

  uploadImageError: propTypes.error,
  uploadInProgress: bool.isRequired,
  updateProfileError: propTypes.error,

  // from withViewport
  viewport: shape({
    width: number.isRequired,
    height: number.isRequired,
  }).isRequired,
};

const mapStateToProps = state => {
  const {currentUser} = state.user;
  const {
    image,
    uploadImageError,
    uploadInProgress,
    updateProfileError,
  } = state.ProfileSettings;
  return {
    image,
    uploadImageError,
    uploadInProgress,
    updateProfileError,
    currentUser
  };
};

const mapDispatchToProps = dispatch => ({
  onImageUpload: data => dispatch(uploadImage(data)),
  onUpdateProfile: data => dispatch(updateProfile(data)),
});

const LayoutWrapperAccountSettingsSideNav = compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  ),
  withViewport
)(LayoutWrapperAccountSettingsSideNavComponent);

export default LayoutWrapperAccountSettingsSideNav;
