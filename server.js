const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const unorm = require("unorm"); // Import unorm để chuẩn hóa chuỗi

const app = express();
const PORT = 3001;
const DATA_FILE = "db.json"; // File JSON để lưu dữ liệu

// Dữ liệu mẫu cho lời chúc
const chucTetTheoTen = {
  "minh nhat": "năm mới bình an, find your way!",
  "kieu trinh": "Mong rằng cậu sẽ luon vui vẻ, xinh đẹp, cười nhiều, học giỏi và happy! năm mới bình an ^^",
  "trinh tuyen": "Chúc cậu vạn sự như ý, tỷ sự như mơ! nhìu tiền (cho Hà) nhiều tình ! sống zui zẻ ^^",
  "cam my": "Chúng you luon bình an, khower mạnh, thành cong, nhiều money, nhìu happy!",
  "thu tuyen": "Chúc cậu năm mới bình an, hạnh phúc, thành công! luon vui vẻ, xinh đẹp.",
  "hoang khanh": "Chúc anh năm mới đạt được nhiều mong ước, happy và bình an! kím được nhiều tiền nha anh ^^",
  "nhu tuyet": "Chúc chị luon xinh đẹp vui tươi, khỏe mạnh nha. Năm mới phát tài!",
  "hong nguyen": "Chúc chị luon xinh đẹp vui tươi, khỏe mạnh nha. Năm mới phát tài!",
  "tam nhu": "Chúc em năm mới bình an, hạnh phúc, thành công! luon vui vẻ, xinh đẹp.",
  "hoang tam": "Chúc mày đệp trai, khỏe mạnh, có sức khỏe là có tất cả 😆",
  "truc phuong":"Chúc cô tiền vô nhuwe nước, tiền ra như cà phê phin(Tuấn nói). 8687 ^^",
  "duc tuan": "Chúc bạn tiền vô nhuwe nước(trphuong nói), tiền ra như cà phê phin. 8786 ^^",
  "đức tuấn": "Chúc bạn tiền vô nhuwe nước(trphuong nói), tiền ra như cà phê phin. 8786 ^^",
  "tuan kiet": "Chúc bạn luon khỏe mạnh, làm ăn phát đạt, tình duyên suôn sẻ!^^",
  "manh chien": "Chúc thầy năm mới bình an, khỏe mạnh, và thực hiện những điều mong ước suôn sẻ ạ!",
  default: "Chúc bạn năm mới hạnh phúc, bình an và gặp nhiều may mắn! ^^",


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

  // Đọc dữ liệu từ db.json để kiểm tra xem tên đã tồn tại chưa
  const moneyData = readData();

  // Chuyển cả tên người nhập và tên trong cơ sở dữ liệu thành không dấu
  const normalizedInputName = unorm
    .nfd(ten)
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  // Kiểm tra xem tên đã nhận lì xì chưa (không phân biệt chữ hoa chữ thường và dấu)
  const existingItem = moneyData.find((item) => {
    const normalizedDbName = unorm
      .nfd(item.user)
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
    return normalizedDbName === normalizedInputName && item.STK;
  });

  if (existingItem) {
    return res.status(200).json({ message: "đã nhận lì xì -.-", status: "đã nhận" });
  }

  // Chuẩn hóa tất cả key trong chucTetTheoTen thành không dấu
    const normalizedChucTet = Object.keys(chucTetTheoTen).reduce((acc, key) => {
    const normalizedKey = unorm.nfd(key).replace(/[\u0300-\u036f]/g, "").toLowerCase();
    acc[normalizedKey] = chucTetTheoTen[key];
    return acc;
  }, {});
  
  // Lấy lời chúc theo tên đã chuẩn hóa
  const loiChuc = normalizedChucTet[normalizedInputName] || chucTetTheoTen["default"];
  
  res.json({ message: loiChuc });
});

// API lấy danh sách lì xì
app.get("/money", (req, res) => {
  const data = readData();
  res.json(data);
});

// API thêm lì xì mới
app.post("/money", (req, res) => {
  // Lấy dữ liệu đã đọc từ file db.json
  const data = readData();

  // Tạo một đối tượng mới với trường ID và các trường từ yêu cầu
  const newItem = {
    id: Date.now(),
    user: req.body.user,
    amount: req.body.amount,
    date_hour: req.body.date_hour,
    transfer: req.body.transfer,
    STK: req.body.STK,
    tenNH: req.body.tenNH,
    nhanngay: req.body.nhanngay,
    ngaynhantuonglai: req.body.ngaynhantuonglai,
    notechotuonglai: req.body.notechotuonglai,
  };

  // Kiểm tra nếu tất cả các trường đều có ý nghĩa và không bị thiếu
  const hasRequiredFields =
    newItem.user &&
    newItem.amount &&
    newItem.date_hour 
    //&&
    // newItem.transfer &&
    // newItem.STK &&
    // newItem.tenNH &&
    // newItem.nhanngay !== undefined &&
    // newItem.ngaynhantuonglai &&
    // newItem.notechotuonglai;

  if (!hasRequiredFields) {
    return res.status(400).json({ error: "Thiếu thông tin yêu cầu!" });
  }

  // Thêm đối tượng mới vào dữ liệu đã đọc và lưu lại
  data.push(newItem);
  writeData(data);

  // Trả về mã 201 với đối tượng mới đã tạo
  res.status(201).json(newItem);
});

app.post("/receive-lixi", (req, res) => {
    try {
        const { user } = req.body;
        if (!user) {
            return res.status(400).json({ error: "Tên không được để trống!" });
        }

        // Chuẩn hóa tên (bỏ dấu, viết thường)
        const normalizedUser = unorm.nfd(user).replace(/[\u0300-\u036f]/g, "").toLowerCase();

        // Định nghĩa nhóm nhận lì xì
        const groups = {
            b_friends: ["kieu trinh", "trinh tuyen", "minh nhat", "cam my", "thu tuyen"],
            anh_chi: ["hoang khanh", "nhu tuyet", "hong nguyen", "manh chien", "ngoc diem"],
        };

        // Xác định min/max theo nhóm
        let min = 30, max = 75; // Mặc định
        if (groups.b_friends.includes(normalizedUser)) {
            min = 62;
            max = 101;
        } else if (groups.anh_chi.includes(normalizedUser)) {
            min = 62;
            max = 101;
        }

        // Tạo số tiền ngẫu nhiên
        const amount = Math.floor(Math.random() * (max - min + 1)) + min;

        // Trả về phản hồi JSON chính xác cho React
        res.status(200).json({ success: true, amount });
    } catch (error) {
        console.error("Lỗi nhận lì xì:", error);
        res.status(500).json({ success: false, error: "Lỗi máy chủ. Thử lại sau!" });
    }
});

  
// Chạy server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
