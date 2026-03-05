export type Lead = {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  rating: number;
  userRatingCount: number;
  types: string[];
  primaryType: string;
  nationalPhoneNumber?: string;
  websiteUri?: string;
  regularOpeningHours?: any;
  photos?: any[];
  reviews?: any[];
  businessStatus?: string;
  googleMapsUri?: string;
  digitalPainScore: number;
  aiSummary: string;
};

export type SearchParams = {
  icp: string;
  service: string;
  state: string;
  city: string;
};
