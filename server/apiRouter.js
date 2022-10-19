/**
 * This file contains server side endpoints that can be used to perform backend
 * tasks that can not be handled in the browser.
 *
 * The endpoints should not clash with the application routes. Therefore, the
 * endpoints are prefixed in the main server where this file is used.
 */
const express = require('express');
const bodyParser = require('body-parser');
const { deserialize } = require('./api-util/sdk');

const transitionPrivileged = require('./api/transition-privileged');
const initiatePrivileged = require('./api/initiate-privileged');
const initiateLoginAs = require('./api/initiate-login-as');
const loginAs = require('./api/login-as');
const addApplicant = require('./api/add-applicant');
const createBackgroundCandidate = require('./api/create-background-candidate');
const createBackgroundReport = require('./api/create-background-report');
const contactNU = require('./api/contact-nu');
const chargeProSubscription = require('./api/charge-pro-subscription');

const router = express.Router();

// ================ API router middleware: ================ //

// Parse Transit body first to a string
router.use(
  bodyParser.text({
    type: 'application/transit+json',
  })
);

// Deserialize Transit body string to JS data
router.use((req, res, next) => {
  if (req.get('Content-Type') === 'application/transit+json' && typeof req.body === 'string') {
    try {
      req.body = deserialize(req.body);
    } catch (e) {
      console.error('Failed to parse request body as Transit:');
      console.error(e);
      res.status(400).send('Invalid Transit in request body.');
      return;
    }
  }
  next();
});

// ================ API router endpoints: ================ //

router.post('/transition-privileged', transitionPrivileged);
router.post('/initiate-privileged', initiatePrivileged);

// Initiates an authorization code authentication flow. This authentication flow
// enables marketplace operators that have an ongoing Console session to log
// into their marketplace as a user of the marketplace.
//
// The authorization code is requested from Console and it is used to request a
// token from the Flex Auth API.
//
// This endpoint will return a 302 to Console which requests the authorization
// code. Console returns a 302 with the code to the `redirect_uri` that is
// passed in this response. The request to the redirect URI is handled with the
// `/login-as` endpoint.
router.get('/initiate-login-as', initiateLoginAs);

// Works as the redirect_uri passed in an authorization code request. Receives
// an authorization code and uses that to log in and redirect to the landing
// page.
router.get('/login-as', loginAs);

router.post('/add-applicant', addApplicant);

router.post('/create-background-candidate', createBackgroundCandidate);
router.post('/create-background-report', createBackgroundReport);

router.post('/contact-nu', contactNU);

router.post('/charge-pro-subscription', chargeProSubscription)

module.exports = router;
