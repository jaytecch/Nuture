
# Mandatory configuration
#
# Note: You also need to set Stripe secret key in Flex Console.
#
# shellcheck disable=SC2034
REACT_APP_SHARETRIBE_SDK_CLIENT_ID=36376ecc-c13d-45a6-9c38-d5b9c1832977
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_51IC4EZFKkjAhNpUwdBcYKIDplvHWvIDIbet5KTwtv6oRmml2Fa4jM9cD12xSrpOvBayeMUrfAl3cP9TY3YnfwB1F00x5Btj2fE
REACT_APP_STRIPE_SECRET_KEY=sk_test_51IC4EZFKkjAhNpUwvWLagDaZr3FiJMVHHn3ryzAenjueLHssQacdwWMUOHdfyujNOsy05Cuigkp4CyX7faBw70eR00gBCqNihY
REACT_APP_STRIPE_SUBSCRIPTION_ID=price_1IZ58TFKkjAhNpUwVf07izhA
REACT_APP_STRIPE_URL=https://api.stripe.com/v1
REACT_APP_MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoiamFlbG1hcmFqaCIsImEiOiJja2w4cXN4NmwxZnF2Mm9wcndvcjQ5NGhjIn0.mH2_clpq3_5Xwx3RS-UG2Q
SHARETRIBE_SDK_CLIENT_SECRET=9a80522f2bbb1cadb0202041b19ac32fde934968

INTEGRATION_SDK_CLIENT_ID=9f317dce-3164-44a6-8913-5dd37249d813
INTEGRATION_SDK_CLIENT_SECRET=73ea2415de7da020c6c8ae07d35dc97c33927352

REACT_APP_CHECKR_SECRET_KEY=976aaf4ff59c8cfb7438b9105278cd6253c26246
REACT_APP_CHECKR_URL=https://api.checkr.com/v1/

REACT_APP_RECAPTCHA_ON=false
REACT_APP_RECAPTCHA_TOKEN=6LftrocaAAAAAKHQQaYTaR6PgjN2ktuYCLzpLRqN

# Or set up an alternative map provider (Google Maps). Check documentation.
# REACT_APP_GOOGLE_MAPS_API_KEY=

# Defaults
#

REACT_APP_SHARETRIBE_MARKETPLACE_CURRENCY=USD
REACT_APP_CANONICAL_ROOT_URL=http://localhost
AWS_ALB_PORT=3000
REACT_APP_DEV_API_SERVER_PORT=3000
PORT=3000

# This is overwritten by configuration in .env.development and
# .env.test. In production deployments use env variable and set it to
# 'production'
REACT_APP_ENV=development
NODE_ENV=development


# Options. Uncomment and set to test.
#

# REACT_APP_SHARETRIBE_USING_SSL=true
# SERVER_SHARETRIBE_TRUST_PROXY=true
# REACT_APP_SENTRY_DSN=change-me
# REACT_APP_CSP=report
# BASIC_AUTH_USERNAME=sharetribe
# BASIC_AUTH_PASSWORD=secret
# REACT_APP_GOOGLE_ANALYTICS_ID=change-me


# Features
#

REACT_APP_AVAILABILITY_ENABLED=true
REACT_APP_DEFAULT_SEARCHES_ENABLED=true

# EMAIL CONFIGURATIONS
# Contact Us email
REACT_APP_CONTACT_US_EMAIL=luis@cnsiblesolutions.com

# AWS Settings
REACT_APP_AWS_PROFILE=nu-test
REACT_APP_AWS_REGION=us-east-2

REACT_APP_MAILCHIMP_URL=https://nurtureup.us1.list-manage.com/subscribe/post?u=22fac55823165dbb4dde1760d&amp;id=680a200879
