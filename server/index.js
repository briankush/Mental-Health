require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const registerCommunitySocket = require('./realtime/communitySocket');


const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
    cors: { origin: true, credentials: true },
});
app.set("io", io);
connectDB();

app.use(cors());
app.use(express.json());


app.use("/api/auth", require('./routes/authroutes'));
app.use("/api/books", require('./routes/bookroutes'));
app.use("/api/audio", require('./routes/audioroutes'));
app.use("/api/articles", require('./routes/articleroutes'));
app.use("/api/admin", require('./routes/adminroutes'));
app.use("/api/community", require('./routes/communityroutes'));
registerCommunitySocket(io);

const PORT = process.env.PORT || 3000;

// Start the server
httpServer.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});