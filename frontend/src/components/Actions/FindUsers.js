import axios from 'axios';


const w_id = localStorage.getItem('doc_id');
export const findUsers = async searchTerm => {
    try {
        const res = await axios.post('https://4f2abc0c.ngrok.io/users/all', {
        w_id: '5ad4cebecb2cb341f09211ee',
        searchTerm,
        });
        return res;
    } catch (error) {}
};

///users/find