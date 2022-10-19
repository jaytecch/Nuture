const axios = require('axios');
const {handleError, serialize} = require('../api-util/sdk');

const CHECKR_URL = process.env.REACT_APP_CHECKR_URL;
const CHECKR_SECRET_KEY = process.env.REACT_APP_CHECKR_SECRET_KEY;

module.exports = (req, res) => {
  const params = req.body;

  let candidateData = {
    first_name: params.firstName,
    middle_name: params.middleName ? params.middleName : null,
    no_middle_name: !params.middleName,
    last_name: params.lastName,
    ssn: params.ssn,
    zipcode: params.zip,
    email: params.email,
    phone: params.phoneNumber,
    dob: params.dateOfBirth,
    driver_license_number: params.licenseNumber,
    driver_license_state: params.licenseState,
    copy_requested: params.copyChecked,
  };

  const base64Key = Buffer.from(CHECKR_SECRET_KEY, 'utf-8').toString('base64');
  const url = CHECKR_URL + 'candidates';
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'X-User-Agent': 'Checkr.2.0.0.js',
      "Authorization": "Basic " + base64Key,
    }
  }

  axios.post(url, candidateData, config)
    .then(response => {
      const {status, statusText, data} = response;
      res
        .status(status)
        .set('Content-Type', 'application/transit+json')
        .send(
          serialize({
            status,
            statusText,
            data,
          })
        )
        .end();
    })
    .catch(e => {
      handleError(res, e);
    })
}
