import React, {Component} from 'react';
import {object, string, bool, number, func, shape, array} from 'prop-types';
import classNames from 'classnames';
import {FormattedMessage, injectIntl, intlShape} from '../../util/reactIntl';
import {withRouter} from 'react-router-dom';
import omit from 'lodash/omit';

import routeConfiguration from '../../routeConfiguration';
import {createResourceLocatorString} from '../../util/routes';
import {
  ModalInMobile,
  Button,
  KeywordFilter,
  RangeFilter,
  SelectSingleFilter,
  SelectMultipleFilter, PrimaryButton, InlineTextButton,
} from '../../components';
import {propTypes} from '../../util/types';
import css from './SearchFiltersMobile.css';

const RADIX = 10;

class SearchFiltersMobileComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {isFiltersOpenOnMobile: false, initialQueryParams: null};

    this.openFilters = this.openFilters.bind(this);
    this.cancelFilters = this.cancelFilters.bind(this);
    this.closeFilters = this.closeFilters.bind(this);
    this.resetAll = this.resetAll.bind(this);
    this.handleSelectSingle = this.handleSelectSingle.bind(this);
    this.handleSelectMultiple = this.handleSelectMultiple.bind(this);
    this.handleRange = this.handleRange.bind(this);
    this.handleKeyword = this.handleKeyword.bind(this);
    this.initialValue = this.initialValue.bind(this);
    this.initialValues = this.initialValues.bind(this);
    this.initialRangeValue = this.initialRangeValue.bind(this);
  }

  // Open filters modal, set the initial parameters to current ones
  openFilters() {
    const {onOpenModal, urlQueryParams} = this.props;
    onOpenModal();
    this.setState({isFiltersOpenOnMobile: true, initialQueryParams: urlQueryParams});
  }

  // Close the filters by clicking cancel, revert to the initial params
  cancelFilters() {
    const {history, onCloseModal} = this.props;

    history.push(
      createResourceLocatorString(
        'SearchPage',
        routeConfiguration(),
        {},
        this.state.initialQueryParams
      )
    );
    onCloseModal();
    this.setState({isFiltersOpenOnMobile: false, initialQueryParams: null});
  }

  // Close the filter modal
  closeFilters() {
    this.props.onCloseModal();
    this.setState({isFiltersOpenOnMobile: false});
  }

  handleSelectSingle(urlParam, option) {
    const {urlQueryParams, history} = this.props;

    // query parameters after selecting the option
    // if no option is passed, clear the selection for the filter
    const queryParams = option
      ? {...urlQueryParams, [urlParam]: option}
      : omit(urlQueryParams, urlParam);

    history.push(createResourceLocatorString('SearchPage', routeConfiguration(), {}, queryParams));
  }

  handleSelectMultiple(urlParam, options) {
    const {urlQueryParams, history} = this.props;

    const queryParams =
      options && options.length > 0
        ? {...urlQueryParams, [urlParam]: options.join(',')}
        : omit(urlQueryParams, urlParam);

    history.push(createResourceLocatorString('SearchPage', routeConfiguration(), {}, queryParams));
  }

  handleRange = (urlParam, range) => {
    const {urlQueryParams, history} = this.props;
    const { minValue, maxValue } = range || {};
    const queryParams =
      minValue != null && maxValue != null
        ? { ...urlQueryParams, [urlParam]: `${minValue},${maxValue}` }
        : omit(urlQueryParams, urlParam);

    history.push(createResourceLocatorString('SearchPage', routeConfiguration(), {}, queryParams));
  };

  handleKeyword(urlParam, keywords) {
    const {urlQueryParams, history} = this.props;
    const queryParams = urlParam
      ? {...urlQueryParams, [urlParam]: keywords}
      : omit(urlQueryParams, urlParam);

    history.push(createResourceLocatorString('SearchPage', routeConfiguration(), {}, queryParams));
  }

  // Reset all filter query parameters
  resetAll(e) {
    const {urlQueryParams, history, filterParamNames} = this.props;

    const queryParams = omit(urlQueryParams, filterParamNames);
    history.push(createResourceLocatorString('SearchPage', routeConfiguration(), {}, queryParams));

    // blur event target if event is passed
    if (e && e.currentTarget) {
      e.currentTarget.blur();
    }
  }

  // resolve initial value for a single value filter
  initialValue(paramName) {
    return this.props.urlQueryParams[paramName];
  }

  // resolve initial values for a multi value filter
  initialValues(paramName) {
    const urlQueryParams = this.props.urlQueryParams;
    return !!urlQueryParams[paramName] ? urlQueryParams[paramName].split(',') : [];
  }

  initialRangeValue(paramName) {
    const urlQueryParams = this.props.urlQueryParams;
    const price = urlQueryParams[paramName];
    const valuesFromParams = !!price ? price.split(',').map(v => Number.parseInt(v, RADIX)) : [];

    return !!price && valuesFromParams.length === 2
      ? {
        minValue: valuesFromParams[0],
        maxValue: valuesFromParams[1],
      }
      : null;
  }

  render() {
    const {
      rootClassName,
      className,
      listingsAreLoaded,
      resultsCount,
      searchInProgress,
      showAsModalMaxWidth,
      onMapIconClick,
      onManageDisableScrolling,
      selectedFiltersCount,
      intl,
      serviceTypeFilter,
      preferencesFilter,
      experienceFilter,
      priceFilter,
    } = this.props;

    const classes = classNames(rootClassName || css.root, className);

    const filtersHeading = intl.formatMessage({id: 'SearchFiltersMobile.heading'});
    const modalCloseButtonMessage = intl.formatMessage({id: 'SearchFiltersMobile.cancel'});

    const showListingsLabel = intl.formatMessage(
      {id: 'SearchFiltersMobile.showListings'},
      {count: resultsCount}
    );

    const filtersButtonClasses =
      selectedFiltersCount > 0 ? css.filtersButtonSelected : css.filtersButton;

    const serviceTypesLabel = intl.formatMessage({
      id: 'SearchFilters.serviceTypesLabel',
    });
    const initialServiceType = serviceTypeFilter
      ? this.initialValues(serviceTypeFilter.paramName)
      : null;

    const serviceTypeFilterElement = serviceTypeFilter ? (
      <SelectMultipleFilter
        id={'SearchFilters.serviceTypeFilter'}
        name="serviceType"
        urlParam={serviceTypeFilter.paramName}
        label={serviceTypesLabel}
        onSubmit={this.handleSelectMultiple}
        options={serviceTypeFilter.options}
        initialValues={initialServiceType}
      />
    ) : null;

    const preferencesFilterLabel = intl.formatMessage({
      id: 'SearchFilters.preferencesLabel',
    });
    const initialPreferences = preferencesFilter
      ? this.initialValues(preferencesFilter.paramName)
      : null;

    const preferencesFilterElement = preferencesFilter ? (
      <SelectMultipleFilter
        id={'SearchFilters.preferencesFilter'}
        name="preferences"
        urlParam={preferencesFilter.paramName}
        label={preferencesFilterLabel}
        onSubmit={this.handleSelectMultiple}
        options={preferencesFilter.options}
        initialValues={initialPreferences}
      />
    ) : null;

    const priceFilterLabel = intl.formatMessage({
      id: 'SearchFilters.priceLabel',
    })
    const initialPriceRange = priceFilter
      ? this.initialRangeValue(priceFilter.paramName)
      : null;

    const priceFilterElement = priceFilter ? (
      <RangeFilter
        id="SearchFilters.priceFilter"
        label={priceFilterLabel}
        urlParam={priceFilter.paramName}
        onSubmit={this.handleRange}
        {...priceFilter.config}
        initialValues={initialPriceRange}
        isCurrency={true}
      />
    ) : null;

    const experienceFilterLabel = intl.formatMessage({
      id: 'SearchFilters.experienceLabel',
    });
    const initialExperienceRange = experienceFilter
      ? this.initialRangeValue(experienceFilter.paramName)
      : null;

    const experienceFilterElement = experienceFilter ? (
      <RangeFilter
        id="SearchFilters.experienceFilter"
        label={experienceFilterLabel}
        urlParam={experienceFilter.paramName}
        onSubmit={this.handleRange}
        {...experienceFilter.config}
        initialValues={initialExperienceRange}
      />
    ) : null;

    return (
      <div className={classes}>
        <div className={css.sideNav}>
            <InlineTextButton className={filtersButtonClasses} onClick={this.openFilters}>
              <div className={css.buttonText}>
                <FormattedMessage id="SearchFilters.filtersButtonLabel"/>
              </div>
            </InlineTextButton>
        </div>

        <ModalInMobile
          id="SearchFiltersMobile.filters"
          isModalOpenOnMobile={this.state.isFiltersOpenOnMobile}
          onClose={this.cancelFilters}
          showAsModalMaxWidth={showAsModalMaxWidth}
          onManageDisableScrolling={onManageDisableScrolling}
          containerClassName={css.modalContainer}
          closeButtonMessage={modalCloseButtonMessage}
        >
          <div className={css.modalHeadingWrapper}>
            <span className={css.modalHeading}>{filtersHeading}</span>
            <button className={css.resetAllButton} onClick={e => this.resetAll(e)}>
              <FormattedMessage id={'SearchFiltersMobile.resetAll'}/>
            </button>
          </div>
          {this.state.isFiltersOpenOnMobile ? (
            <div className={css.filtersWrapper}>
              {serviceTypeFilterElement}
              {experienceFilterElement}
              {priceFilterElement}
              {preferencesFilterElement}
            </div>
          ) : null}

          <div className={css.showListingsContainer}>
            <Button className={css.showListingsButton} onClick={this.closeFilters}>
              {showListingsLabel}
            </Button>
          </div>
        </ModalInMobile>
      </div>
    );
  }
}

SearchFiltersMobileComponent.defaultProps = {
  rootClassName: null,
  className: null,
  resultsCount: null,
  searchingInProgress: false,
  selectedFiltersCount: 0,
  filterParamNames: [],
  priceFilter: null,
};

SearchFiltersMobileComponent.propTypes = {
  rootClassName: string,
  className: string,
  urlQueryParams: object.isRequired,
  listingsAreLoaded: bool.isRequired,
  resultsCount: number,
  searchingInProgress: bool,
  showAsModalMaxWidth: number.isRequired,
  onMapIconClick: func.isRequired,
  onManageDisableScrolling: func.isRequired,
  onOpenModal: func.isRequired,
  onCloseModal: func.isRequired,
  selectedFiltersCount: number,
  filterParamNames: array,
  certificateFilter: propTypes.filterConfig,

  // from injectIntl
  intl: intlShape.isRequired,

  // from withRouter
  history: shape({
    push: func.isRequired,
  }).isRequired,
};

const SearchFiltersMobile = injectIntl(withRouter(SearchFiltersMobileComponent));

export default SearchFiltersMobile;
