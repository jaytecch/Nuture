import React from 'react';
import { compose } from 'redux';
import { object, string, bool, number, func, shape } from 'prop-types';
import { FormattedMessage, injectIntl, intlShape } from '../../util/reactIntl';
import classNames from 'classnames';
import { withRouter } from 'react-router-dom';
import omit from 'lodash/omit';

import {
  SelectMultipleFilter,
  RangeFilter,
  KeywordFilter,
} from '../../components';
import routeConfiguration from '../../routeConfiguration';
import { createResourceLocatorString } from '../../util/routes';
import { propTypes } from '../../util/types';
import css from './SearchFilters.css';

// Dropdown container can have a positional offset (in pixels)
const FILTER_DROPDOWN_OFFSET = -14;
const RADIX = 10;

// resolve initial value for a single value filter
const initialValue = (queryParams, paramName) => {
  return queryParams[paramName];
};

// resolve initial values for a multi value filter
const initialValues = (queryParams, paramName) => {
  return !!queryParams[paramName] ? queryParams[paramName].split(',') : [];
};

const initialRangeValue = (queryParams, paramName) => {
  const value = queryParams[paramName];
  const valuesFromParams = !!value ? value.split(',').map(v => Number.parseInt(v, RADIX)) : [];

  return !!value && valuesFromParams.length === 2
    ? {
        minPrice: valuesFromParams[0],
        maxPrice: valuesFromParams[1],
      }
    : null;
};

const SearchFiltersComponent = props => {
  const {
    rootClassName,
    className,
    urlQueryParams,
    listingsAreLoaded,
    resultsCount,
    searchInProgress,
    serviceTypeFilter,
    preferencesFilter,
    experienceFilter,
    educationLevelsFilter,
    priceFilter,
    keywordFilter,
    isSearchFiltersPanelOpen,
    toggleSearchFiltersPanel,
    searchFiltersPanelSelectedCount,
    history,
    intl,
  } = props;

  const hasNoResult = listingsAreLoaded && resultsCount === 0;
  const classes = classNames(rootClassName || css.root, { [css.longInfo]: hasNoResult }, className);

  const serviceTypesLabel = intl.formatMessage({
    id: 'SearchFilters.serviceTypesLabel',
  });

  const keywordLabel = intl.formatMessage({
    id: 'SearchFilters.keywordLabel',
  });

  const preferencesFilterLabel = intl.formatMessage({
    id: 'SearchFilters.preferencesLabel',
  });

  const priceFilterLabel = intl.formatMessage({
    id: 'SearchFilters.priceLabel',
  })

  const experienceFilterLabel = intl.formatMessage({
    id: 'SearchFilters.experienceLabel',
  });

  const educationLevelsFilterLabel = intl.formatMessage({
    id: 'SearchFilters.educationLevelsLabel',
  })

  const initialServiceType = serviceTypeFilter
    ? initialValues(urlQueryParams, serviceTypeFilter.paramName)
    : null;

  const initialPreferences = preferencesFilter
    ? initialValues(urlQueryParams, preferencesFilter.paramName)
    : null;

  const initialPriceRange = priceFilter
    ? initialRangeValue(urlQueryParams, priceFilter.paramName)
    : null;

  const initialExperienceRange = experienceFilter
    ? initialRangeValue(urlQueryParams, experienceFilter.paramName)
    : null;

  const initialKeyword = keywordFilter
    ? initialValue(urlQueryParams, keywordFilter.paramName)
    : null;

  const initialEducationLevels = educationLevelsFilter
    ? initialValues(urlQueryParams, educationLevelsFilter.paramName)
    : null;

  const handleSelectOptions = (urlParam, options) => {
    const queryParams =
      options && options.length > 0
        ? { ...urlQueryParams, [urlParam]: options.join(',') }
        : omit(urlQueryParams, urlParam);

    history.push(createResourceLocatorString('SearchPage', routeConfiguration(), {}, queryParams));
  };

  const handleRange = (urlParam, range) => {
    const { minValue, maxValue } = range || {};
    const queryParams =
      minValue != null && maxValue != null
        ? { ...urlQueryParams, [urlParam]: `${minValue},${maxValue}` }
        : omit(urlQueryParams, urlParam);

    history.push(createResourceLocatorString('SearchPage', routeConfiguration(), {}, queryParams));
  };

  const handleKeyword = (urlParam, values) => {
    const queryParams = values
      ? { ...urlQueryParams, [urlParam]: values }
      : omit(urlQueryParams, urlParam);

    history.push(createResourceLocatorString('SearchPage', routeConfiguration(), {}, queryParams));
  };

  const serviceTypeFilterElement = serviceTypeFilter ? (
    <SelectMultipleFilter
      id={'SearchFilters.serviceTypeFilter'}
      name="serviceType"
      urlParam={serviceTypeFilter.paramName}
      label={serviceTypesLabel}
      onSubmit={handleSelectOptions}
      options={serviceTypeFilter.options}
      initialValues={initialServiceType}
      contentPlacementOffset={FILTER_DROPDOWN_OFFSET}
    />
  ) : null;

  const preferencesFilterElement = preferencesFilter ? (
    <SelectMultipleFilter
      id={'SearchFilters.preferencesFilter'}
      name="preferences"
      urlParam={preferencesFilter.paramName}
      label={preferencesFilterLabel}
      onSubmit={handleSelectOptions}
      options={preferencesFilter.options}
      initialValues={initialPreferences}
      contentPlacementOffset={FILTER_DROPDOWN_OFFSET}
    />
  ) : null;

  const priceFilterElement = priceFilter ? (
    <RangeFilter
      id="SearchFilters.priceFilter"
      label={priceFilterLabel}
      urlParam={priceFilter.paramName}
      onSubmit={handleRange}
      {...priceFilter.config}
      initialValues={initialPriceRange}
      contentPlacementOffset={FILTER_DROPDOWN_OFFSET}
    />
  ) : null;

  const experienceFilterElement = experienceFilter ? (
    <RangeFilter
      id="SearchFilters.experienceFilter"
      label={experienceFilterLabel}
      urlParam={experienceFilter.paramName}
      onSubmit={handleRange}
      {...experienceFilter.config}
      initialValues={initialExperienceRange}
      contentPlacementOffset={FILTER_DROPDOWN_OFFSET}
    />
  ) : null;

  const toggleSearchFiltersPanelButtonClasses =
    isSearchFiltersPanelOpen || searchFiltersPanelSelectedCount > 0
      ? css.searchFiltersPanelOpen
      : css.searchFiltersPanelClosed;

  const toggleSearchFiltersPanelButton = toggleSearchFiltersPanel ? (
    <button
      className={toggleSearchFiltersPanelButtonClasses}
      onClick={() => {
        toggleSearchFiltersPanel(!isSearchFiltersPanelOpen);
      }}
    >
      <FormattedMessage
        id="SearchFilters.moreFiltersButton"
        values={{ count: searchFiltersPanelSelectedCount }}
      />
    </button>
  ) : null;

  return (
    <div className={classes}>
      <h3 className={css.filtersTitle}>Filters</h3>

      {hasNoResult ? (
        <div className={css.noSearchResults}>
          <FormattedMessage id="SearchFilters.noResults" />
        </div>
      ) : null}

      {searchInProgress ? (
        <div className={css.loadingResults}>
          <FormattedMessage id="SearchFilters.loadingResults" />
        </div>
      ) : null}


      <div className={css.filters}>
        {experienceFilterElement}
        {priceFilterElement}
        {preferencesFilterElement}
        {toggleSearchFiltersPanelButton}
      </div>
    </div>
  );
};

SearchFiltersComponent.defaultProps = {
  rootClassName: null,
  className: null,
  resultsCount: null,
  searchingInProgress: false,
  serviceTypeFilter: null,
  preferencesFilter: null,
  priceFilter: null,
  experienceFilter: null,
  isSearchFiltersPanelOpen: false,
  toggleSearchFiltersPanel: null,
  searchFiltersPanelSelectedCount: 0,
};

SearchFiltersComponent.propTypes = {
  rootClassName: string,
  className: string,
  urlQueryParams: object.isRequired,
  listingsAreLoaded: bool.isRequired,
  resultsCount: number,
  searchingInProgress: bool,
  onManageDisableScrolling: func.isRequired,
  serviceTypeFilter: propTypes.filterConfig,
  preferencesFilter: propTypes.filterConfig,
  priceFilter: propTypes.filterConfig,
  experienceFilter: propTypes.filterConfig,
  isSearchFiltersPanelOpen: bool,
  toggleSearchFiltersPanel: func,
  searchFiltersPanelSelectedCount: number,

  // from withRouter
  history: shape({
    push: func.isRequired,
  }).isRequired,

  // from injectIntl
  intl: intlShape.isRequired,
};

const SearchFilters = compose(
  withRouter,
  injectIntl
)(SearchFiltersComponent);

export default SearchFilters;
