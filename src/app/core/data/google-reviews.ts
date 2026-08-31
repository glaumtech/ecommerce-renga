export interface GoogleReview {
  author: string;
  rating: number;
  text: string;
  relativeTime: string;
}

export interface GoogleReviewsListing {
  placeName: string;
  rating: number;
  reviewCount: number;
  mapsUrl: string;
  reviews: GoogleReview[];
}

/** Sri Renga Pooja & Herbal Traders, Lalgudi — curated from the Google Maps listing. */
export const GOOGLE_REVIEWS_LISTING: GoogleReviewsListing = {
  placeName: 'Sri Renga Pooja & Herbal Traders',
  rating: 4.9,
  reviewCount: 19,
  mapsUrl:
    'https://www.google.com/maps/search/?api=1&query=Sri+Renga+Pooja+%26+Herbal+Traders+Lalgudi+VRF9%2BR8',
  reviews: [
    {
      author: 'Priyanka S',
      rating: 5,
      text: 'Good shop and they have many products and online orders are delivered fast',
      relativeTime: '4 months ago',
    },
    {
      author: 'Arivazhagan Venkatachalapathi',
      rating: 5,
      text: 'Recieved the product well packed. And delivered atmost priority.. COD on believing customer..Thanks for the products.. Can\'t imagined about finding these products here..',
      relativeTime: '5 months ago',
    },
    {
      author: 'Neeja Guna',
      rating: 5,
      text: 'Good quality... Very fast delivery....',
      relativeTime: '5 months ago',
    },
    {
      author: 'vijay c',
      rating: 5,
      text: 'Best product, and good customer service',
      relativeTime: '4 months ago',
    },
    {
      author: 'Karthi M',
      rating: 5,
      text: 'Very nice',
      relativeTime: '6 months ago',
    },
    {
      author: 'BALA DHIVYA',
      rating: 5,
      text: 'All pooja products end to end (like bhathi, sambarani, homa jaaman, maalai, pooja utensils etc) are available. They also have Naatu marandhu (podi, legiyam,oil, raw naatu marandhu etc) even they will arrange and deliver if it is not readily available within 3 days..Excellent shop in Lalgudi for all our poojai and naatu marandhu related items. Price and Quality are excellent. Must go place for all pooja and naatu marandhu related needs.',
      relativeTime: '1 year ago',
    },
  ],
};
