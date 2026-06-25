#!/bin/bash

# --- Configuration ---
PROFILE="glaum"
BUCKET_NAME="renga-ecommerce"
DIST_ID="E1K3QL2K07VXMR"
BUILD_PATH="dist/ananda-store/browser"

set -e

# 1. Build the project (Renga API + production optimizations)
# prebuildrenga fetches product slugs from the live API for prerendered SEO pages.
# Re-run deploy after adding/updating products so new pages get static meta tags.
echo "Building ecommerce site for Renga..."
STORE_API_URL="${STORE_API_URL:-https://ghopon.com/trueup-lite-renga}" npm run buildrenga

# 2. Sync to S3 using the 'glaum' profile
echo "Syncing to S3 with profile: $PROFILE..."
aws s3 sync "$BUILD_PATH" "s3://$BUCKET_NAME" --delete --profile "$PROFILE"

# 3. Invalidate CloudFront using the 'glaum' profile
echo "Invalidating CloudFront cache..."
aws cloudfront create-invalidation \
  --distribution-id "$DIST_ID" \
  --paths "/*" \
  --profile "$PROFILE"

echo "Successfully deployed to renga-ecommerce using profile: $PROFILE!"
