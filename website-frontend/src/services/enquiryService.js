import API from './api';

export const enquiryService = {
  submitEnquiry: async (data) => {
    const res = await API.post('/enquiries', data);
    return res.data;
  },
};

