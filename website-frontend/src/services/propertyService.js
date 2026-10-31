import API from './api';

export const propertyService = {
  getProperties: async (params = {}) => {
    const res = await API.get('/properties', { params });
    return res.data;
  },
  getPropertyBySlug: async (slug) => {
    const res = await API.get(`/properties/${slug}`);
    return res.data;
  },
  getFeaturedProperties: async () => {
    const res = await API.get('/properties/featured');
    return res.data;
  },
  getRecentProperties: async () => {
    const res = await API.get('/properties/recent');
    return res.data;
  },
  getSoldProperties: async () => {
    const res = await API.get('/properties/sold');
    return res.data;
  },
};

