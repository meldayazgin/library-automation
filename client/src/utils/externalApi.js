import axios from './axios';

/**
 * Fetches a resource from dlnk.one through our proxy
 * @param {string} id - The resource ID
 * @param {number} [type=1] - The resource type
 * @returns {Promise<any>} The response data
 */
export const fetchDlnkResource = async (id, type = 1) => {
  try {
    console.log(`Fetching dlnk resource: id=${id}, type=${type}`);
    const response = await axios.get(`/api/dlnk?id=${id}&type=${type}`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    console.log('Dlnk response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching from dlnk.one:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    }
    throw new Error(error.response?.data?.error || 'Failed to fetch from dlnk.one');
  }
};

/**
 * Fetches any external resource through our proxy
 * @param {string} url - The URL to fetch
 * @returns {Promise<any>} The response data
 */
export const fetchExternalResource = async (url) => {
  try {
    console.log(`Fetching external resource: ${url}`);
    const response = await axios.get(`/api/proxy?url=${encodeURIComponent(url)}`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    console.log('External resource response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching external resource:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    }
    throw new Error(error.response?.data?.error || 'Failed to fetch external resource');
  }
}; 