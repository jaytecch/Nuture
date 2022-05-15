import React, {Component} from 'react';
import {FormattedMessage} from "react-intl";
import classNames from 'classnames';
import nuLogo from '../../assets/nurtureup_logo/nurtureup_logo.png'
import {
  CardClickable,
  IconSleepConsultant,
  IconLaborDoula,
  IconPostDoula,
  IconPhotographer,
  IconNursery,
  IconNewbornCare,
  IconMidwife,
  IconMealPrep,
  IconChildbirthEd,
  IconCarSeatTech,
  IconLactation, Button
} from '../../components';

import css from './SearchLocation.css';


class SearchLocation extends Component {

constructor(props) {
  super(props);
  this.state = { value: '' };
  this.handleChange = this.handleChange.bind(this);
}


  handleChange= (event) => {

    this.setState({value: event.target.value});

    //alert('value is ' + this.state.value)
  }
  render() {

    const {rootClassName, className, clickEvent} = this.props;
    const classes = classNames(rootClassName || css.root, className);

    return (
      <div className={classes}>
        <ul>
          <li className={css.row}>
            <div>
            <input
              //autoFocus={true}
              className={css.fieldText}
              id="zip"
              //maxLength={5}
              //name="title"
              //onBlur={this.handleChange}
              onChange={this.handleChange}
              //onFocus={this.handleChange}
              placeholder="Enter Zip Code"
              type="text"
              value={this.state.value}
            />
            {/*<Button className={css.submitButton}*/}
            {/*  //onClick={this.handleClose}*/}
            {/*  //rootClassName={closeButtonClasses}*/}
            {/*  //title="Use My Address"*/}
            {/*>Use My Addresss</Button>*/}
            </div>
            <div>
            <Button className={css.submitButton}
                    onClick={() => {
                      clickEvent(this.state.value)
                    }}
              //rootClassName={closeButtonClasses}
              //title="Use My Address"
            >Submit</Button>
            </div>
          </li>


        </ul>

      </div>
    );
  }
}

export default SearchLocation;
