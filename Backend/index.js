import config from "./config/index.js";
import app from "./app.js";
import connectDB from "./utils/db.js";

const PORT = config.port;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`[Server] running on port ${PORT} in ${config.env} mode`);
    });
  } catch (err) {
    console.error(`[Server Error] Failed to start server: ${err.message}`);
    process.exit(1);
  }
};

startServer();
