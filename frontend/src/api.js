import axios from "axios";
const url = new URL("/graphql", window.location.href);
const instance = axios.create({
  baseURL: url.href,
});

export default instance;

// instance.get('/hi').then((data) => console.log(data));
