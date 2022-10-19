
# Mandatory configuration
#
# Note: You also need to set Stripe secret key in Flex Console.
#
# shellcheck disable=SC2034
REACT_APP_SHARETRIBE_SDK_CLIENT_ID=42573e25-197a-43d1-81a7-bf4c9ca744d6
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_y8Gs1lj1KZhgdreBtBQvTdYl00eBEQti6G
REACT_APP_STRIPE_SECRET_KEY=sk_test_J2myicLNeifTwWiHpVkSe2lq007CMJEiYt
REACT_APP_STRIPE_SUBSCRIPTION_ID=price_1HbHdZIrnAaeNNsZioZ6VUpY
REACT_APP_STRIPE_URL=https://api.stripe.com/v1
REACT_APP_MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoiamFlbG1hcmFqaCIsImEiOiJja2w4cXN4NmwxZnF2Mm9wcndvcjQ5NGhjIn0.mH2_clpq3_5Xwx3RS-UG2Q
SHARETRIBE_SDK_CLIENT_SECRET=d109dff1fb384f489cd112087ef4bbe1cafaf3cd
REACT_APP_MAILCHIMP_URL=https://candygyrltravels.us20.list-manage.com/subscribe/post?u=7703d03fb6f7b47790a6cf76d&amp;id=24fe1447c3

INTEGRATION_SDK_CLIENT_ID=7ffe4ff6-8cd3-4b1c-9287-1918b713ea4f
INTEGRATION_SDK_CLIENT_SECRET=7942d63ddc74d1cfb537ce7a1552721e4f86a8c7

REACT_APP_CHECKR_SECRET_KEY=976aaf4ff59c8cfb7438b9105278cd6253c26246
REACT_APP_CHECKR_URL=https://api.checkr.com/v1/

REACT_APP_RECAPTCHA_ON=true
REACT_APP_RECAPTCHA_TOKEN=6LftrocaAAAAAKHQQaYTaR6PgjN2ktuYCLzpLRqN

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
