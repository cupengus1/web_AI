import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080'; // đổi nếu dùng port khác

export async function askAI(message) {
    try {
        const response = await axios.post(`${API_BASE_URL}/ask`, {
            message: message
        });
        return response.data;
    } catch (error) {
        console.error("Lỗi khi gọi API:", error);
        return { answer: "❌ Lỗi khi gọi API. Vui lòng thử lại sau." };
    }
}
