import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ServerPage.css'; // Assuming you have CSS for styling

function ServerPage() {
    const [fileCount, setFileCount] = useState(0);
    const [uploadedFileCount, setUploadedFileCount] = useState(0);
    const [error, setError] = useState('');

    // Function to fetch file count from receive.txt
    const fetchFileCount = async () => {
        try {
            const response = await axios.get('http://localhost:8090/receive.txt', { responseType: 'text' });
            const lines = response.data.split('\n').filter(line => line.trim() !== '');
            setFileCount(lines.length);
        } catch (err) {
            console.error('Error fetching file content:', err);
            setError('Error fetching file content. Please ensure the server is running and the file exists.');
        }
    };

    // Function to fetch uploaded file count
    const fetchUploadedFileCount = async () => {
        try {
            const response = await axios.get('http://localhost:8090/file-count');
            setUploadedFileCount(response.data.uploadedFileCount);
        } catch (err) {
            console.error('Error fetching uploaded file count:', err);
            setError('Error fetching uploaded file count.');
        }
    };

    useEffect(() => {
        fetchFileCount();
        fetchUploadedFileCount();
    }, []);

    // Function to handle file opening
    const handleOpenFile = () => {
        window.open('http://localhost:8090/receive.txt', '_blank'); // Opens the file in a new tab
    };

    return (
        <div className="serverpage-container">
            <h2>Server Page</h2>
            {error && <p className="error-message">{error}</p>}
            <div className="file-count">
                <h3>Received Count:{fileCount}</h3>
                <p>{fileCount > 0 ? `Total Entries: ${fileCount}` : 'No entries found.'}</p>
            </div>
            
            <button onClick={handleOpenFile} className="open-file-button">
                Open receive.txt
            </button>
        </div>
    );
}

export default ServerPage;
