export type OpeningHours = {
  weekdayDescriptions?: string[];
  periods?: {
    open: { day: number; hour: number; minute: number };
    close?: { day: number; hour: number; minute: number };
  }[];
};

export type PlacePhoto = {
  name?: string;
  widthPx?: number;
  heightPx?: number;
};

export type PlaceReview = {
  rating?: number;
  text?: { text: string; languageCode?: string };
  relativePublishTimeDescription?: string;
};

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
  regularOpeningHours?: OpeningHours;
  photos?: PlacePhoto[];
  reviews?: PlaceReview[];
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
