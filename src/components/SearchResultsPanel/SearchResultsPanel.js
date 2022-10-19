import React, {useState} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {propTypes} from '../../util/types';
import {ListingCard, Modal, ModalInMobile, PaginationLinks} from '../../components';
import css from './SearchResultsPanel.css';
import {array, func, object, string, node, bool} from 'prop-types';
import {EnquiryForm} from "../../forms";
import {getServiceType} from "../../nurtureUpLists";
import {FormattedMessage} from "react-intl";

const SearchResultsPanel = props => {
  const {
    className,
    rootClassName,
    listings,
    pagination,
    search,
    setActiveListing,
    isMobile,
    getReviews,
    isAuthenticated,
    onSendInquiry,
    sendInquiryError,
    sendInquiryInProgress,
    showAsModalMaxWidth,
    onManageDisableScrolling,
    onApply,
    getApplicableProListing,
    currentUser,
  } = props;
  const classes = classNames(rootClassName || css.root, className);

  const [inquiryModalState, setInquiryModalState] = useState({
    isOpen: false,
    displayName: null,
    listingTitle: null,
    listings: [],
  })
  const [applySuccessModalState, setApplySuccessModalState] = useState({
    isOpen: false,
    title: null,
  });

  const [applyFailedModalState, setApplyFailedModalState] = useState({
    isOpen: false,
    message: null,
  });

  const [noServiceModalState, setNoServiceModalState] = useState({
    isOpen: false,
    serviceType: null,
  })

  const paginationLinks =
    pagination && pagination.totalPages > 1 ? (
      <PaginationLinks
        className={css.pagination}
        pageName="SearchPage"
        pageSearchParams={search}
        pagination={pagination}
      />
    ) : null;

  const listingToItem = l => {
    if(!l.attributes.publicData.isActive) {
      return null;
    }

    return (
      <tr>
        <ListingCard
          className={css.listingCard}
          key={l.id.uuid}
          listing={l}
          authorId={l.author.id}
          isMobile={isMobile}
          getReviews={getReviews}
          onOpenSendMessage={handleOpenInquiry}
          onApply={handleApply}
        />
      </tr>
    )
  }

  const handleOpenInquiry = (values) => {
    setInquiryModalState({...values, isOpen: true})
  }

  const handleApply = values => {
    const {id, attributes} = currentUser;
    const {profile} = attributes;
    const {firstName, lastName} = profile;

    getApplicableProListing(id, values.serviceType)
      .then(listing => {
        if (listing == null) {
          setNoServiceModalState({
            isOpen: true,
            serviceType: getServiceType(values.serviceType).label
          });
          return;
        }

        const applicant = {
          id: id.uuid,
          listingId: listing.id.uuid,
          name: firstName + " " + lastName
        }

        onApply(values.listingId, applicant)
          .then(() => {
            console.log("you have applied for the job");
            setApplySuccessModalState({
              isOpen: true,
              title: values.title,
            });
          })
          .catch(e => {
            if(e.error === "exists") {
              setApplyFailedModalState({
                isOpen: true,
                message: "You have already applied for this job listing"
              });
            } else {
              setApplyFailedModalState({
                isOpen: true,
                message: "Server error, please try again"
              });
            }
          });
      })
  }

  const inquiryForm = (
    <EnquiryForm
      className={css.messageForm}
      submitButtonWrapperClassName={css.messageSubmitButtonWrapper}
      listingTitle={inquiryModalState.listingTitle}
      authorDisplayName={inquiryModalState.displayName}
      sendEnquiryError={sendInquiryError}
      onSubmit={onSendInquiry}
      inProgress={sendInquiryInProgress}
      listings={inquiryModalState.listings}
    />
  )

  const inquiryModal = isMobile ? (
    <ModalInMobile
      id="SearchPage.mobileInquiry"
      isModalOpenOnMobile={isAuthenticated && inquiryModalState.isOpen}
      onClose={() => setInquiryModalState({...inquiryModalState, isOpen: false})}
      showAsModalMaxWidth={showAsModalMaxWidth}
      onManageDisableScrolling={onManageDisableScrolling}
      containerClassName={css.modalContainer}
      closeButtonMessage="Close"
    >
      {inquiryForm}
    </ModalInMobile>
  ) : (
    <Modal
      id="SearchPage.inquiry"
      contentClassName={css.messageModalContent}
      isOpen={isAuthenticated && inquiryModalState.isOpen}
      onClose={() => setInquiryModalState({...inquiryModalState, isOpen: false})}
      onManageDisableScrolling={onManageDisableScrolling}
    >
      {inquiryForm}
    </Modal>
  )


  return (
    <div className={classes}>
      {paginationLinks}
      <div className={css.listingCards}>

        {listings.length > 0 ?
          listings.map(l => listingToItem(l))
          : <h3 className={css.noResults}><FormattedMessage id="SearchPage.noResults"/></h3>
        }

        {props.children}

      </div>
      {paginationLinks}

      {inquiryModal}

      <Modal
        id="ApplySuccess"
        isOpen={applySuccessModalState.isOpen}
        onClose={() => setApplySuccessModalState({isOpen: false, title: null})}
        onManageDisableScrolling={onManageDisableScrolling}
      >
        <p className={css.successMessage}>
          You have successfully applied for {applySuccessModalState.title}
        </p>
      </Modal>

      <Modal
        id="ApplyFailed"
        isOpen={applyFailedModalState.isOpen}
        onClose={() => setApplyFailedModalState({isOpen: false, message: null})}
        onManageDisableScrolling={onManageDisableScrolling}
      >
        <p className={css.successMessage}>
          {applyFailedModalState.message}
        </p>
      </Modal>

      <Modal
        id="ServiceMissing"
        isOpen={noServiceModalState.isOpen}
        onClose={() => setNoServiceModalState({isOpen: false, serviceType: null})}
        onManageDisableScrolling={onManageDisableScrolling}
      >
        <div className={css.noServiceContent}>
          <h2>Cannot Apply</h2>
          <p className={css.noServiceSubtext}>
            You do not have {noServiceModalState.serviceType} as one of your
            listed services. You can create this service in account settings
          </p>
        </div>
      </Modal>
    </div>
  );
};

SearchResultsPanel.defaultProps = {
  children: null,
  className: null,
  listings: [],
  pagination: null,
  rootClassName: null,
  search: null,
  getReviews: null,
  isAuthenticated: false,
};

SearchResultsPanel.propTypes = {
  children: node,
  className: string,
  listings: array,
  pagination: propTypes.pagination,
  rootClassName: string,
  search: object,
  getReviews: func,
  isAuthenticated: bool,
  onSendInquiry: func.isRequired,
  sendInquiryError: propTypes.error.isRequired,
  sendInquiryInProgress: bool.isRequired,
};

export default SearchResultsPanel;
