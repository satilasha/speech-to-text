import axios from 'axios';
const url = 'http://127.0.0.1:5000/';
let thread_id;
let question;

const getToken = async () => {

}

const callBenAdmin = async () => {
    try {

        let token = await getToken()
        let path = "initiate-conversation"
        
        const response = await axios.get(url + path);

        question = response.data
        return response.data
    } catch (err) {
        console.error(err);
    }
}

const initiateConversation = async () => {
    try {
        let path = "initiate-conversation"

        const response = await axios.get(url + path);
        question = response.data
        return response.data
    } catch (err) {
        console.error(err);
    }
}

async function updateEvent(response) {

    let path = "/update-life-event"

    const params = {
        thread_id: thread_id ? thread_id : null,
    };

    const headers = {
        'Content-Type': 'application/json',
    };

    const data = {
        response: response,
        question : question
    };


    try {
        const response = await axios.post(url + path, { headers, params, data });
        console.log(response.data);
        thread_id = response.data.thread_id;
        question = response.data.message;
        console.log("thread_id",thread_id);
        console.log(response.data);
        return response.data.message
    } catch (error) {
        console.error(error);
    }
}


export { initiateConversation, updateEvent }