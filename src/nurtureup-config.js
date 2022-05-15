// Price filter configuration
// Note: unlike most prices this is not handled in subunits
export const priceFilterConfig = {
  min: 0,
  max: 1000,
  step: 5,
};

export const experienceFilterConfig = {
  min: 0,
  max: 100,
  step: 1,
}

// Activate booking dates filter on search page
export const dateRangeFilterConfig = {
  active: true,
};

// Activate keyword filter on search page

// NOTE: If you are ordering search results by distance the keyword search can't be used at the same time.
// You can turn off ordering by distance in config.js file
export const keywordFilterConfig = {
  active: true,
};

export const educationLevels = [
  { key: 'none', label: 'None' },
  { key: 'highSchool', label: 'High School' },
  { key: 'tradeSchool', label: 'Trade School' },
  { key: 'bachelors', label: 'Bachelors' },
  { key: 'masters', label: 'Masters' },
  { key: 'doctorate', label: 'Doctorate' },
];

export const preferences = [
  {key: 'worksMornings', label: 'Works mornings'},
  {key: 'worksEvenings', label: 'Works evenings'},
  {key: 'noSmoking', label: 'No smoking'},
  {key: 'okWithPets', label: 'Ok with pets'},
  {key: 'worksNights', label: 'Works nights'},
  {key: 'cprFirstAidCertified', label: 'CPR/First Aid Certified'},
  {key: '24HourCare', label: '24 hour care'},
];

export const serviceTypes = [
  {key: 'laborDoula', label: 'Labor Doula'},
  {key: 'midwife', label: 'Midwife'},
  {key: 'nurseryHomeConsultant', label: 'Nursery/Home consultant'},
  {key: 'postpartumDoula', label: 'Postpartum Doula'},
  {key: 'carSeatTechnician', label: 'Car Seat Technician'},
  {key: 'lactationConsultant', label: 'Lactation Consultant'},
  {key: 'sleepConsultant', label: 'Sleep Consultant'},
  {key: 'newBornCareSpecialist', label: 'Newborn Care Specialist'},
  {key: 'infantPregnancyPhotography', label: 'Infant & Pregnancy Photography'},
  {key: 'childbirthEducationClasses', label: 'Childbirth Education Classes'},
  {key: 'mealPrep', label: 'Meal Prep'},
];
