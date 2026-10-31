import API from './api';

export const locationService = {
  getLocations: async () => {
    const res = await API.get('/locations');
    return res.data;
  },
  getLocationBySlug: async (slug) => {
    const res = await API.get(`/locations/${slug}`);
    return res.data;
  },
};

