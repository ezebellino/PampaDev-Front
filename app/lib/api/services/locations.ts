import { apiGetPublic } from "../api";

export type Country = {
  idCountry: number;
  name: string;
  isoCode: string;
};

export type Province = {
  idProvince: number;
  name: string;
  countryName: string;
};

export type City = {
  idCity: number;
  name: string;
  postCode: string;
  provinceName: string;
};

export function getCountries() {
  return apiGetPublic<Country[]>("/api/Countries");
}

export function getProvinces() {
  return apiGetPublic<Province[]>("/api/Provinces");
}

export function getCities() {
  return apiGetPublic<City[]>("/api/Cities");
}
