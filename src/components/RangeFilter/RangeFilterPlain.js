import React, { Component } from 'react';
import { func, number, shape, string } from 'prop-types';
import classNames from 'classnames';
import { FormattedMessage, injectIntl, intlShape } from '../../util/reactIntl';
import { propTypes } from '../../util/types';
import { formatCurrencyMajorUnit } from '../../util/currency';
import config from '../../config';

import { RangeFilterForm } from '../../forms';

import css from './RangeFilterPlain.css';

class RangeFilterPlainComponent extends Component {
  constructor(props) {
    super(props);
    this.state = { isOpen: true };

    this.handleChange = this.handleChange.bind(this);
    this.handleClear = this.handleClear.bind(this);
    this.toggleIsOpen = this.toggleIsOpen.bind(this);
  }

  handleChange(values) {
    const { onSubmit, urlParam } = this.props;
    onSubmit(urlParam, values);
  }

  handleClear() {
    const { onSubmit, urlParam } = this.props;
    onSubmit(urlParam, null);
  }

  toggleIsOpen() {
    this.setState(prevState => ({ isOpen: !prevState.isOpen }));
  }

  render() {
    const {
      rootClassName,
      className,
      id,
      initialValues,
      min,
      max,
      step,
      intl,
      valueConfig,
      label,
      isCurrency,
    } = this.props;
    const classes = classNames(rootClassName || css.root, className);
    const { minValue, maxValue } = initialValues || {};

    const hasValue = value => value != null;
    const hasInitialValues = initialValues && hasValue(minValue) && hasValue(maxValue);

    const labelClass = hasInitialValues ? css.filterLabelSelected : css.filterLabel;

    return (
      <div className={classes}>
        <div className={labelClass}>
          <button type="button" className={css.labelButton} onClick={this.toggleIsOpen}>
            <span className={labelClass}>{label}</span>
          </button>
          <button type="button" className={css.clearButton} onClick={this.handleClear}>
            <FormattedMessage id={'RangeFilter.clear'} />
          </button>
        </div>
        <div className={css.formWrapper}>
          <RangeFilterForm
            id={id}
            initialValues={hasInitialValues ? initialValues : { minValue: min, maxValue: max }}
            onChange={this.handleChange}
            intl={intl}
            contentRef={node => {
              this.filterContent = node;
            }}
            min={min}
            max={max}
            step={step}
            liveEdit
            isOpen={this.state.isOpen}
            isCurrency={isCurrency}
          />
        </div>
      </div>
    );
  }
}

RangeFilterPlainComponent.defaultProps = {
  rootClassName: null,
  className: null,
  initialValues: null,
  step: number,
  valueConfig: config.currencyConfig,
};

RangeFilterPlainComponent.propTypes = {
  rootClassName: string,
  className: string,
  id: string.isRequired,
  label: string.isRequired,
  urlParam: string.isRequired,
  onSubmit: func.isRequired,
  initialValues: shape({
    minValue: number.isRequired,
    maxValue: number.isRequired,
  }),
  min: number.isRequired,
  max: number.isRequired,
  step: number,
  valueConfig: propTypes.currencyConfig,

  // form injectIntl
  intl: intlShape.isRequired,
};

const RangeFilterPlain = injectIntl(RangeFilterPlainComponent);

export default RangeFilterPlain;
