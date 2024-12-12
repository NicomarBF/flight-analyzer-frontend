import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL;

class FlightAnalyzerService {
  static async analyzeFlight(payload) {
    try {
      const response = await axios.get(`${BASE_URL}/analysis`, { params: payload });
      return response.data;
    } catch (error) {
      console.error('Erro ao chamar a API de análise de voo:', error);
      throw error;
    }
  }

  static async getAirports() {
    try {
      const response = await axios.get(`${BASE_URL}/airports`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar os aeroportos:', error);
      throw error;
    }
  }

}

export default FlightAnalyzerService;