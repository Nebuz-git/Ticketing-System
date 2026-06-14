import axios from "axios";

const API_URL = "http://localhost:8080/auth";


//Register user logic
export const registerUser = async ( data:{
    email: string;
    password: string
}

) => {
    const response = await axios.post(`${API_URL}/register`,data)

    return response.data;
}



//Register user logic
export const loginUser = async ( data:{
    email: string;
    password: string
}

) => {
    const response = await axios.post(`${API_URL}/login`,data)

    return response.data;
}
