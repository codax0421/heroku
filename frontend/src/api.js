import axios from "axios";

const instance = axios.create({
  baseURL: `https://wp111-hw9-dankong.herokuapp.com/`,
});

export default instance;

// instance.get('/hi').then((data) => console.log(data));
