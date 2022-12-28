import axios from "axios";

const instance = axios.create({
  baseURL: `https://heroku-production-38c4.up.railway.app/`,
});

export default instance;

// instance.get('/hi').then((data) => console.log(data));
