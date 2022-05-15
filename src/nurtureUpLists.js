import React from "react";
import {
  IconCarSeatTech, IconChildbirthEd,
  IconLaborDoula, IconLactation, IconMealPrep,
  IconMidwife, IconNewbornCare,
  IconNursery, IconPhotographer,
  IconPostDoula, IconSleepConsultant
} from "./components";

import PostpartumDoulaContract from "./assets/documents/Postpartum_Doula_Contract.pdf";
import GenericContract from "./assets/documents/Generic_Contract_For_Testing.pdf"


export const ACCOUNT_TYPES = {
  provider: "pro",
  parent: "parent"
};

export const LISTING_TYPES = {
  service: "service",
  job: "job"
}

export const EDUCATION_LEVELS = [
  { key: 'none', label: 'None' },
  { key: 'highSchool', label: 'High School' },
  { key: 'tradeSchool', label: 'Trade School' },
  { key: 'bachelors', label: 'Bachelors' },
  { key: 'masters', label: 'Masters' },
  { key: 'doctorate', label: 'Doctorate' },
];

export const PREFERENCES = [
  {key: 'worksMornings', label: 'Works mornings'},
  {key: 'worksEvenings', label: 'Works evenings'},
  {key: 'noSmoking', label: 'No smoking'},
  {key: 'okWithPets', label: 'Ok with pets'},
  {key: 'worksNights', label: 'Works nights'},
  {key: 'cprFirstAidCertified', label: 'CPR/First Aid Certified'},
  {key: '24HourCare', label: '24 hour care'},
];

export const SERVICE_TYPES = [
  {key: 'laborDoula', label: 'Labor Doula', icon: (classes, rootClassName) => <IconLaborDoula className={classes} rootClassName={rootClassName}/>, contract: () => GenericContract},
  {key: 'midwife', label: 'Midwife', icon: (classes, rootClassName) => <IconMidwife className={classes} rootClassName={rootClassName}/>, contract: () => GenericContract},
  {key: 'nurseryHomeConsultant', label: 'Nursery/Home consultant', icon: (classes, rootClassName) => <IconNursery className={classes} rootClassName={rootClassName}/>, contract: () => GenericContract},
  {key: 'postpartumDoula', label: 'Postpartum Doula', icon: (classes, rootClassName) => <IconPostDoula className={classes} rootClassName={rootClassName}/>, contract: () => PostpartumDoulaContract},
  {key: 'carSeatTechnician', label: 'Car Seat Technician', icon: (classes, rootClassName) => <IconCarSeatTech className={classes} rootClassName={rootClassName}/>, contract: () => GenericContract},
  {key: 'lactationConsultant', label: 'Lactation Consultant', icon: (classes, rootClassName) => <IconLactation className={classes} rootClassName={rootClassName}/>, contract: () => GenericContract},
  {key: 'sleepConsultant', label: 'Sleep Consultant', icon: (classes, rootClassName) => <IconSleepConsultant className={classes} rootClassName={rootClassName}/>, contract: () => GenericContract},
  {key: 'newbornCareSpecialist', label: 'Newborn Care Specialist', icon: (classes, rootClassName) => <IconNewbornCare className={classes} rootClassName={rootClassName}/>, contract: () => GenericContract},
  {key: 'infantPregnancyPhotography', label: 'Infant & Pregnancy Photography', icon: (classes, rootClassName) => <IconPhotographer className={classes} rootClassName={rootClassName}/>, contract: () => GenericContract},
  {key: 'childbirthEducationClasses', label: 'Childbirth Education Classes', icon: (classes, rootClassName) => <IconChildbirthEd className={classes} rootClassName={rootClassName}/>, contract: () => GenericContract},
  {key: 'mealPrep', label: 'Meal Prep', icon: (classes, rootClassName) => <IconMealPrep className={classes} rootClassName={rootClassName}/>, contract: () => GenericContract},
];

export const getEducationLevel = value => getNUListObject(value, EDUCATION_LEVELS);
export const getPreference = value => getNUListObject(value, PREFERENCES);
export const getServiceType = value => getNUListObject(value, SERVICE_TYPES);

export const getNUListObject = (key, arr) => arr.find(value => value.key === key);

