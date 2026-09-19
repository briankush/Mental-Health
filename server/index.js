require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');


const app = express();
connectDB();

app.use(cors());
app.use(express.json());


app.use("/api/auth", require('./routes/authroutes'));
app.use("/api/books", require('./routes/bookroutes'));
app.use("/api/audio", require('./routes/audioroutes'));
app.use("/api/articles", require('./routes/articleroutes'));
app.use("/api/admin", require('./routes/adminroutes'));
app.use("/api/community", require('./routes/communityroutes'));

const PORT = process.env.PORT || 3000;

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});