
# Mandatory configuration
#
# Note: You also need to set Stripe secret key in Flex Console.
#
REACT_APP_SHARETRIBE_SDK_CLIENT_ID=42573e25-197a-43d1-81a7-bf4c9ca744d6
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_y8Gs1lj1KZhgdreBtBQvTdYl00eBEQti6G
REACT_APP_MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoiY25zaWJsZSIsImEiOiJjazcxOXNobWgwMnFjM2RxY3lqZTU1czF2In0.GMXDOv6dd_vCpjm5_Q_P7Q

# Or set up an alternative map provider (Google Maps). Check documentation.
# REACT_APP_GOOGLE_MAPS_API_KEY=

# Defaults
#

REACT_APP_SHARETRIBE_MARKETPLACE_CURRENCY=USD
REACT_APP_CANONICAL_ROOT_URL=http://localhost:3000

# This is overwritten by configuration in .env.development and
# .env.test. In production deployments use env variable and set it to
# 'production'
REACT_APP_ENV=production


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
