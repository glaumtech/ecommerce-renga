import { GOOGLE_REVIEWS_LISTING } from './google-reviews';

describe('GOOGLE_REVIEWS_LISTING fallback data', () => {
  it('uses the brief Google Maps short link for static fallback mapsUrl', () => {
    expect(GOOGLE_REVIEWS_LISTING.mapsUrl).toBe('https://maps.app.goo.gl/nz3z1G6tutW1werVA');
  });
});
