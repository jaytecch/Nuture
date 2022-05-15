import React, {useState} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {propTypes} from '../../util/types';
import {ListingCard, Modal, ModalInMobile, PaginationLinks} from '../../components';
import css from './SearchResultsPanel.css';
import {array, func, object, string, node, bool} from 'prop-types';
import {EnquiryForm} from "../../forms";

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

  const paginationLinks =
    pagination && pagination.totalPages > 1 ? (
      <PaginationLinks
        className={css.pagination}
        pageName="SearchPage"
        pageSearchParams={search}
        pagination={pagination}
      />
    ) : null;

  // <tr>
  //   <ListingCard
  //     className={css.listingCard}
  //     key={l.id.uuid}
  //     listing={l}
  //     authorId={l.author.id}
  //     isMobile={isMobile}
  //   />
  // </tr>

  const listingToItem = l => {

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

        {listings.map(l => listingToItem(l))}

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
        <h2 className={css.successMessage}>You have successfully applied for {applySuccessModalState.title}</h2>
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
