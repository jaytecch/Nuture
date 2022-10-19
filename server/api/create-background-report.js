const axios = require('axios');
const {handleError, serialize} = require('../api-util/sdk');

const CHECKR_URL = process.env.REACT_APP_CHECKR_URL;
const CHECKR_SECRET_KEY = process.env.REACT_APP_CHECKR_SECRET_KEY;

module.exports = (req, res) => {
  const id = req.body;

  let candidateData = {
    candidate_id: id,
    package: 'premium_criminal'
  };

  const base64Key = Buffer.from(CHECKR_SECRET_KEY, 'utf-8').toString('base64');
  const url = CHECKR_URL + 'reports';
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
