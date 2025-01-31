const express = require("express");  
const fs = require("fs");  
const path = require("path");  
const cors = require("cors"); // Import cors  

const app = express();  
const PORT = 3001;  
const DATA_FILE = "db.json"; // File JSON để lưu dữ liệu  

// Dữ liệu mẫu cho lời chúc  
const chucTetTheoTen = {  
    "Nam": "Chúc Nam năm mới phát tài, phát lộc!",  
    "Lan": "Chúc Lan một năm an khang, sức khỏe dồi dào!",  
    "Minh": "Chúc Minh vạn sự như ý, thành công rực rỡ!",  
    "Mai": "Chúc Mai năm mới tràn đầy niềm vui và may mắn!",  
    "default": "Chúc bạn năm mới hạnh phúc, bình an và gặp nhiều may mắn!"  
};  

// Middleware  
app.use(express.json());  
app.use(cors()); // Sử dụng CORS để cho phép các yêu cầu từ nguồn khác  
app.use(express.static(path.join(__dirname, "dist"))); // Phục vụ các file tĩnh từ thư mục dist  

// Đọc dữ liệu từ file JSON  
const readData = () => {  
    if (!fs.existsSync(DATA_FILE)) {  
        return []; // Trả về mảng rỗng nếu file không tồn tại  
    }  
    try {  
        const data = fs.readFileSync(DATA_FILE, "utf8");  
        return JSON.parse(data);  
    } catch (err) {  
        console.error("Error reading data from file:", err);  
        return []; // Trả về mảng rỗng nếu có lỗi  
    }  
};  

// Ghi dữ liệu vào file JSON  
const writeData = (data) => {  
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");  
};  

// Lấy lời chúc  
app.post("/chuc", (req, res) => {  
    const { ten } = req.body;  
    if (!ten) {  
        return res.status(400).json({ error: "Vui lòng nhập tên!" });  
    }  

    const loiChuc = chucTetTheoTen[ten] || chucTetTheoTen["default"];  
    res.json({ message: loiChuc });  
});  

// API lấy danh sách lì xì  
app.get("/money", (req, res) => {  
    const data = readData();  
    res.json(data);  
});  

// API thêm lì xì mới  
app.post("/money", (req, res) => {  
    const data = readData();  
    const newItem = { id: Date.now(), ...req.body };  
    data.push(newItem);  
    writeData(data);  
    res.status(201).json(newItem); // Trả về mã 201 cho yêu cầu tạo mới  
});  

// API xóa lì xì theo ID  
app.delete("/money/:id", (req, res) => {  
    let data = readData();  
    const id = parseInt(req.params.id);  
    if (isNaN(id)) {  
        return res.status(400).json({ error: "ID không hợp lệ!" });  
    }  
    data = data.filter((item) => item.id !== id);  
    writeData(data);  
    res.json({ message: "Đã xóa thành công" });  
});  

// Chạy server  
app.listen(PORT, () => {  
    console.log(`Server running on http://localhost:${PORT}`);  
});