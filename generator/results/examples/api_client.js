const axios = require('axios');

class SwaggerPetstore {
  constructor(baseURL) {
    this.client = axios.create({
      baseURL: baseURL || 'http://petstore.swagger.io/v1',
    });

    // Add a request interceptor
    this.client.interceptors.request.use((config) => {
      console.log(`Making request to ${config.url} with params:`, config.params);
      return config;
    }, (error) => {
      console.log('Error in request: ', error);
      return Promise.reject(error);
    });

    // Add a response interceptor
    this.client.interceptors.response.use((response) => {
      console.log(`Received response from ${response.config.url} with status:`, response.status);
      console.log('Response data:', response.data);
      return response;
    }, (error) => {
      console.log('Error in response: ', error);
      return Promise.reject(error);
    });
  }

  async listPets(limit) {
    try {
      const params = {};
      if (limit) params.limit = limit;
      const response = await this.client.get('/pets', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching pets:', error);
      throw error;
    }
  }

  async createPet(petData) {
    try {
      const response = await this.client.post('/pets', petData);
      return response.data;
    } catch (error) {
      console.error('Error creating pet:', error);
      throw error;
    }
  }

  async showPetById(petId) {
    try {
      const response = await this.client.get(`/pets/${petId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching pet with id ${petId}:`, error);
      throw error;
    }
  }
}

module.exports = SwaggerPetstore;

const petstoreClient = new SwaggerPetstore();

async function performApiCalls() {
  try {
    const pets = await petstoreClient.listPets(10);
    console.log(pets);

    const newPet = await petstoreClient.createPet({ name: 'Rex', tag: 'dog' });
    console.log(newPet);

    const pet = await petstoreClient.showPetById(1);
    console.log(pet);
  } catch (error) {
    console.error('Error in API call:', error);
  }
}

performApiCalls();
