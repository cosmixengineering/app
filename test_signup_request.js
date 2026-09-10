// Quick test to check what's being sent in signup request
import axios from 'axios';

const BASE_URL = 'https://sspropertyguru-production.up.railway.app/api/v1';

const testData = {
    name: 'Test User',
    email: 'test@example.com',
    contact: '1234567890',
    role: 'user',
    password: 'Test@123'
};

console.log('Testing signup request...');
console.log('Data to send:', testData);
console.log('Data as JSON:', JSON.stringify(testData));

axios.post(`${BASE_URL}/auth/signup`, testData, {
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
})
.then(response => {
    console.log('Success:', response.data);
})
.catch(error => {
    console.error('Error:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
});
