import axios from "axios";

const environment = process.env.NODE_ENV;
const fallbackDevBaseUrl = "http://localhost:8081/api";
const fallbackProdBaseUrl = "https://studysocial.media/api";
const baseURL = process.env.REACT_APP_API_BASE_URL || (environment === "development" ? fallbackDevBaseUrl : fallbackProdBaseUrl);

export default axios.create({
  baseURL,
  headers: {
    "Content-type": "application/json"
  }
});
