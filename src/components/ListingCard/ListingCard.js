import React, {useEffect, useState} from 'react';
import {compose} from 'redux';
import {connect} from 'react-redux';
import {getUser} from "../../ducks/user.duck";
import {arrayOf, string, func, bool} from 'prop-types';
import {FormattedMessage, intlShape, injectIntl} from '../../util/reactIntl';
import classNames from 'classnames';
import {LINE_ITEM_DAY, LINE_ITEM_NIGHT, propTypes} from '../../util/types';
import {formatMoney} from '../../util/currency';
import {ensureListing} from '../../util/data';
import {richText} from '../../util/richText';
import {createSlug} from '../../util/urlHelpers';
import config from '../../config';
import {
  Avatar,
  AvatarLarge,
  AvatarMedium, Button,
  IconEmail, Modal, ModalInMobile,
  NamedLink,
  PrimaryButton, ReviewRating
} from '../../components';
import css from './ListingCard.css';
import {getServiceType, LISTING_TYPES} from "../../nurtureUpLists";
import {AvatarSmall} from "../Avatar/Avatar";
import {EnquiryForm} from "../../forms";

const MIN_LENGTH_FOR_LONG_WORDS = 10;

const priceData = (price, intl) => {
  if (price && price.currency === config.currency) {
    const formattedPrice = formatMoney(intl, price);
    return {formattedPrice, priceTitle: formattedPrice};
  } else if (price) {
    return {
      formattedPrice: intl.formatMessage(
        {id: 'ListingCard.unsupportedPrice'},
        {currency: price.currency}
      ),
      priceTitle: intl.formatMessage(
        {id: 'ListingCard.unsupportedPriceTitle'},
        {currency: price.currency}
      ),
    };
  }
  return {};
};

export const ListingCardComponent = props => {
  const {
    className,
    rootClassName,
    intl,
    listing,
    authorId,
    setActiveListing,
    fetchUser,
    isMobile,
    getReviews,
    onOpenSendMessage,
    onApply,
  } = props;

  const [author, setAuthor] = useState({});
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    if(getReviews) {
      getReviews(authorId).then(resp => setReviews(resp));
    }
    fetchUser(authorId)
      .then(auth => setAuthor(auth));
  }, [])

  const classes = classNames(rootClassName || css.root, className);
  const currentListing = ensureListing(listing);
  const id = currentListing.id.uuid;
  const {title = '', price, publicData, type} = currentListing.attributes;
  const {listingType, serviceType} = publicData || {};
  const isJobListing = LISTING_TYPES.job === listingType;
  const slug = createSlug(title);

  const {attributes} = author || {};
  const {profile} = attributes || {};
  const {displayName, publicData: authPubData} = profile || {};
  const {experience} = authPubData || {}
  const yearsExperience = experience ? experience[0] : 0;

  const {formattedPrice} = priceData(price, intl);

  const unitType = config.bookingUnitType;
  const isNightly = unitType === LINE_ITEM_NIGHT;
  const isDaily = unitType === LINE_ITEM_DAY;

  const hasReviews = reviews && reviews.length > 0;
  const rating = hasReviews ?
    reviews.reduce(((total, review) => total + review.attributes.rating), 0) / reviews.length
    : 0;
  const numReviewers = hasReviews ? reviews.length : 0;

  const unitTranslationKey = isNightly
    ? 'ListingCard.perNight'
    : isDaily
      ? 'ListingCard.perDay'
      : 'ListingCard.perUnit';

  let linkName, linkParams;
  if (isJobListing) {
    linkName = "JobListingPage";
    linkParams = {id}
  } else {
    linkName = "ProfilePage";
    linkParams = {id: authorId.uuid};
  }

  const serviceTitle = getServiceType(serviceType).label;
  const serviceDiv = (
    <div className={css.textGroup}>
      {isMobile ? null : <div className={css.title}>Service</div>}

      <div className={css.text}>
        {richText(serviceTitle, {
          longWordMinLength: MIN_LENGTH_FOR_LONG_WORDS,
          longWordClass: css.longWord,
        })}
      </div>
    </div>
  );

  const priceDiv = isJobListing ? null :(
    <div className={css.textGroup}>
      {isMobile ? null : <div className={css.title}>Rate</div>}

      <div className={css.text}>
        {formattedPrice}<FormattedMessage id={unitTranslationKey}/>
      </div>
    </div>
  );

  const experienceDiv = isJobListing ? null : (
    <div className={css.textGroup}>
      {isMobile ? null : <div className={css.title}>Years Experience</div>}

      <div className={css.text}>
        {yearsExperience} yrs
      </div>
    </div>
  )

  const spacing = (<div className={css.spacing}/> )
  const vertLine =  <div className={css.vertLine}/>;

  const onMessageClick = e => {
    e.preventDefault();
    const reducedListing = {id, type, serviceType, listingType};

    onOpenSendMessage({
      listings: [reducedListing],
      displayName,
    })
    console.log("you sent a message");
  }

  const handleApply = e => {
    e.preventDefault();
    onApply({
      serviceType,
      listingId: id,
      title,
    })
  }

  return (
    <NamedLink className={classes} name={linkName} params={linkParams}>
      <div className={css.contents}
           onMouseEnter={() => setActiveListing(currentListing.id)}
           onMouseLeave={() => setActiveListing(null)}>
        {isMobile ?
          <Avatar className={css.rootForImage} user={author} disableProfileLink/>
          :<AvatarLarge className={css.rootForImage} user={author} disableProfileLink/>}

        <div className={css.info}>
          <div className={css.ownerInfo}>
            <h3 className={css.ownerName}>{displayName}</h3>
            <div className={css.ratingGroup}>
              <ReviewRating
                reviewStarClassName={css.reviewStar}
                className={css.reviewStars}
                rating={rating}
              />
              <span className={css.reviewCount}>({numReviewers})</span>
            </div>
          </div>

          <div className={css.listingInfo}>
            {serviceDiv}

            {isMobile ? vertLine : null}

            {priceDiv}

            {isMobile ? vertLine : null}

            {experienceDiv}
          </div>
        </div>

        {isJobListing ? (
          <PrimaryButton className={css.messageButton} onClick={handleApply}>
            Apply
          </PrimaryButton>
        ) : (
          <PrimaryButton className={css.messageButton} onClick={onMessageClick}>
          <IconEmail rootClassName={css.msgIcon}/>
        </PrimaryButton>
        )}
      </div>


    </NamedLink>
  );
};

ListingCardComponent.defaultProps = {
  className: null,
  rootClassName: null,
  setActiveListing: () => null,
  getReviews: null,
};

ListingCardComponent.propTypes = {
  className: string,
  rootClassName: string,
  intl: intlShape.isRequired,
  listing: propTypes.listing.isRequired,

  setActiveListing: func,
  getReviews: func,
  onOpenSendMessage: func.isRequired

};

const mapDispatchToProps = dispatch => ({
  fetchUser: id => dispatch(getUser(id)),
});

const ListingCard = compose(
  connect(null, mapDispatchToProps),
  injectIntl
)(ListingCardComponent);

export default ListingCard;
