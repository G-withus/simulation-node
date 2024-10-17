const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors'); // Import CORS
const app = express();
const PORT = 8090;

app.use(cors()); // Enable CORS for all routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// A variable to keep track of the number of uploaded CSV files
let uploadedFileCount = 0;

// Endpoint to receive XML data
app.post('/receive-xml', (req, res) => {
    const xmlData = req.body.xml;

    // Check if xmlData is provided
    if (!xmlData) {
        console.error('No XML data received');
        return res.status(400).send('No XML data received');
    }

    // Append XML data to receive.txt
    fs.appendFile('receive.txt', xmlData + '\n', (err) => {
        if (err) {
            console.error('Error writing to file', err);
            return res.status(500).send('Error writing to file');
        }

        // Increment the uploaded file count
        uploadedFileCount += 1;

        // Read receive.txt to get the file count
        fs.readFile('receive.txt', 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading file', err);
                return res.status(500).send('Error reading file');
            }

            // Count the number of lines in the file
            const fileCount = data.split('\n').filter(Boolean).length; // Filter to remove empty lines
            console.log(`Total entries in receive.txt: ${fileCount}`); // Log total entries
            return res.status(200).json({ message: 'Success ', fileCount, uploadedFileCount });
        });
    });
});

// Endpoint to read and serve receive.txt
app.get('/receive.txt', (req, res) => {
    const filePath = path.join(__dirname, 'receive.txt');
    res.sendFile(filePath, (err) => {
        if (err) {
            console.error('Error sending file', err);
            res.status(err.status).end();
        }
    });
});

// Endpoint to get uploaded file count
app.get('/file-count', (req, res) => {
    res.status(200).json({ uploadedFileCount });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
