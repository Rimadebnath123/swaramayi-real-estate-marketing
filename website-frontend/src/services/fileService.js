import API from './api';

export const fileService = {
  getFiles: async (category = '') => {
    const res = await API.get('/files', { params: { category } });
    return res.data;
  },
};

