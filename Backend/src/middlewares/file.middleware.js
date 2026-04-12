const multer = require('multer');

const upload = multer({
    storage: multer.memoryStorage(), // Store files in memory for processing
    limits: {
        fileSize: 3 * 1024 * 1024, // 5MB limit
    }, 
});

module.exports = upload;