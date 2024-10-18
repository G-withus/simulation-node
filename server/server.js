const express = require('express');
const fs = require('fs');
const cors = require('cors');
const path = require('path'); // Import path for file serving
const app = express();
const PORT = 8090;

app.use(cors({
    origin: 'http://localhost:5173', // Allow requests from your React app
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let uploadedFileCount = 0;
let isConnected = true; // Track the connection state

// Function to check if the server is connected
const checkConnection = (req, res, next) => {
    if (!isConnected) {
        return res.status(403).send('Server is disconnected. No further data is being accepted.');
    }
    next();
};

// Endpoint to receive XML data
app.post('/receive-xml', checkConnection, (req, res) => {
    const xmlData = req.body.xml;

    if (!xmlData) {
        console.error('No XML data received');
        return res.status(400).send('No XML data received');
    }

    fs.appendFile('receive.txt', xmlData + '\n', (err) => {
        if (err) {
            console.error('Error writing to file', err);
            return res.status(500).send('Error writing to file');
        }

        uploadedFileCount += 1;

        fs.readFile('receive.txt', 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading file', err);
                return res.status(500).send('Error reading file');
            }

            const fileCount = data.split('\n').filter(Boolean).length; // Filter to remove empty lines
            console.log(`Total entries in receive.txt: ${fileCount}`);
            return res.status(200).json({ message: 'Success', fileCount, uploadedFileCount });
        });
    });
});

// Endpoint to read and serve receive.txt
app.get('/receive.txt', checkConnection, (req, res) => {
    const filePath = path.join(__dirname, 'receive.txt');
    res.sendFile(filePath, (err) => {
        if (err) {
            console.error('Error sending file', err);
            res.status(err.status).end();
        }
    });
});

// Endpoint to get uploaded file count
app.get('/file-count', checkConnection, (req, res) => {
    res.status(200).json({ uploadedFileCount });
});

// Endpoint to handle disconnect
app.post('/disconnect', (req, res) => {
    console.log('Received a disconnect request'); // Log when a request is received

    try {
        isConnected = false; // Change the connection state
        console.log('Server state changed to disconnected');

        res.status(200).json({ message: 'Disconnected from server.' });
    } catch (error) {
        console.error('Error during disconnection:', error); // Log error details
        res.status(500).json({ message: 'Error during disconnection' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
