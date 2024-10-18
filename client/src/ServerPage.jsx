import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ServerPage.css';

function ServerPage() {
    const [fileCount, setFileCount] = useState(0);
    const [uploadedFileCount, setUploadedFileCount] = useState(0);
    const [clientIP, setClientIP] = useState(''); // Store the client IP and port
    const [isConnected, setIsConnected] = useState(true); // Control the connection state
    const [error, setError] = useState('');

    // Fetch the file count from receive.txt
    const fetchFileCount = async () => {
        if (!isConnected) return; // Prevent fetching if disconnected
        try {
            const response = await axios.get('http://localhost:8090/receive.txt', { responseType: 'text' });
            const lines = response.data.split('\n').filter(line => line.trim() !== '');
            setFileCount(lines.length);
        } catch (err) {
            console.error('Error fetching file content:', err);
            setError('Error fetching file content. Please ensure the server is running and the file exists.');
        }
    };

    // Fetch the uploaded file count
    const fetchUploadedFileCount = async () => {
        if (!isConnected) return; // Prevent fetching if disconnected
        try {
            const response = await axios.get('http://localhost:8090/file-count');
            setUploadedFileCount(response.data.uploadedFileCount);
        } catch (err) {
            console.error('Error fetching uploaded file count:', err);
            setError('Error fetching uploaded file count.');
        }
    };

    // Handle client IP and port display
    useEffect(() => {
        const clientAddress = `${window.location.hostname}:${window.location.port}`; // Get client IP and port
        setClientIP(clientAddress);
    }, []);

    // Fetch counts when connected
    useEffect(() => {
        if (isConnected) {
            fetchFileCount();
            fetchUploadedFileCount();
        }
    }, [isConnected]);

    // Handle the disconnect action
    const handleDisconnect = async () => {
        try {
            const response = await axios.post('http://localhost:8090/disconnect');

            // Check if we received the correct response
            if (response.status === 200) {
                console.log('Successfully disconnected from the server');
                setIsConnected(false); // Update the state
                setFileCount(0); // Reset file count when disconnected
                setUploadedFileCount(0); // Reset uploaded file count when disconnected
            } else {
                console.error('Unexpected response:', response);
                setError('Unexpected response from the server.');
            }
        } catch (err) {
            console.error('Error disconnecting from the server:', err);
            setError('Error disconnecting from the server. Please check if the server is running.');
        }
    };

    // Function to handle file opening
    const handleOpenFile = () => {
        window.open('http://localhost:8090/receive.txt', '_blank'); // Opens the file in a new tab
    };

    return (
        <div className="serverpage-container">
            <h2>Server Dashboard</h2>
            {error && <p className="error-message">{error}</p>}

            <div className="client-section">
                <label>Client IP</label>
                <input type="text" value={clientIP} readOnly />
                <button className="disconnect-button" onClick={handleDisconnect} disabled={!isConnected}>
                    {isConnected ? 'Disconnect' : 'Disconnected'}
                </button>
            </div>

            <div className="receive-section">
                <label>Receive Count</label>
                <input type="text" value={fileCount} readOnly />
            </div>

            <div className="file-section">
                <label>File</label>
                <input type="text" value="receive.txt" readOnly />
                <button onClick={handleOpenFile} className="open-button" disabled={!isConnected}>
                    Open
                </button>
            </div>
        </div>
    );
}

export default ServerPage;
