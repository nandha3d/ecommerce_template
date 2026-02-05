import { Country, State, City } from 'country-state-city';
import axios from 'axios';

// Interfaces for our unified format
export interface GeoCountry {
    isoCode: string;
    name: string;
    flag: string;
    phonecode: string;
    currency: string;
}

export interface GeoState {
    isoCode: string;
    name: string;
    countryCode: string;
}

export interface GeoCity {
    name: string;
    countryCode: string;
    stateCode: string;
}

export interface PincodeLookupResult {
    city: string;
    state: string;
    country: string;
    countryCode: string;
    error?: string;
}

class GeoService {
    // Get all countries
    getCountries(): GeoCountry[] {
        return Country.getAllCountries().map(country => ({
            isoCode: country.isoCode,
            name: country.name,
            flag: country.flag,
            phonecode: country.phonecode,
            currency: country.currency
        }));
    }

    // Get states by country
    getStatesByCountry(countryCode: string): GeoState[] {
        return State.getStatesOfCountry(countryCode).map(state => ({
            isoCode: state.isoCode,
            name: state.name,
            countryCode: state.countryCode
        }));
    }

    // Get cities by country and state
    getCitiesByState(countryCode: string, stateCode: string): GeoCity[] {
        return City.getCitiesOfState(countryCode, stateCode).map(city => ({
            name: city.name,
            countryCode: city.countryCode,
            stateCode: city.stateCode
        }));
    }

    // Lookup address details from pincode
    async lookupPincode(pincode: string, countryCode: string = 'IN'): Promise<PincodeLookupResult | null> {
        try {
            if (countryCode === 'IN') {
                return await this.lookupIndiaPincode(pincode);
            } else {
                return await this.lookupInternationalPincode(pincode, countryCode);
            }
        } catch (error) {
            console.error('Pincode lookup failed:', error);
            return null;
        }
    }

    // Specific lookup for India using postalpincode.in
    private async lookupIndiaPincode(pincode: string): Promise<PincodeLookupResult | null> {
        try {
            const response = await axios.get(`https://api.postalpincode.in/pincode/${pincode}`);

            if (response.data && response.data[0].Status === 'Success') {
                const details = response.data[0].PostOffice[0];
                return {
                    city: details.Block === 'NA' ? details.Name : details.Block, // Often Block or Name is the city equivalent
                    state: details.State,
                    country: 'India',
                    countryCode: 'IN'
                };
            }
            return null;
        } catch (error) {
            return null;
        }
    }

    // International lookup using Zippopotam.us
    private async lookupInternationalPincode(pincode: string, countryCode: string): Promise<PincodeLookupResult | null> {
        try {
            // Zippopotamus supports: US, FR, DE, ES, IT, etc.
            // URL format: https://api.zippopotam.us/{country}/{pincode}
            const response = await axios.get(`https://api.zippopotam.us/${countryCode.toLowerCase()}/${pincode}`);

            if (response.data) {
                const place = response.data.places[0];
                return {
                    city: place['place name'],
                    state: place['state'],
                    country: response.data.country,
                    countryCode: response.data['country abbreviation']
                };
            }
            return null;
        } catch (error) {
            return null;
        }
    }
}

export const geoService = new GeoService();
