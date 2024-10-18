import React, { useState } from 'react';
import Papa from 'papaparse';
import axios from 'axios';
import './CsvUploader.css'; // Assuming you have CSS in place

function CsvUploader() {
    const [file, setFile] = useState(null);
    const [serverPort, setServerPort] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [transferStatus, setTransferStatus] = useState([]);
    const [rowCount, setRowCount] = useState(0);
    const [fileCount, setFileCount] = useState(0);
    const [error, setError] = useState('');

    // Handle file selection
    const handleFileUpload = (e) => {
        setFile(e.target.files[0]);
        setTransferStatus([]);
    };

    // Handle server port input
    const handlePortChange = (e) => {
        setServerPort(e.target.value);
        setError('');
    };

    // Connect to the server
    const handleConnect = async () => {
        if (serverPort !== '8090') {
            setIsConnected(false);
            setError('Invalid server port. Please enter the correct port (8090).');
            return;
        }

        try {
            await axios.get(`http://localhost:${serverPort}/file-count`);
            setIsConnected(true);
            setError('');
            alert('Connected to server!');
        } catch {
            setIsConnected(false);
            setError('Server is not running. Please start the server.');
        }
    };

    // Parse CSV and send rows to the backend
    const handleParse = () => {
        if (!file) return;

        Papa.parse(file, {
            complete: (result) => {
                setRowCount(result.data.length);
                transferRows(result.data);
            },
        });
    };

    // Transfer CSV rows as XML to the backend with a delay
    const transferRows = async (rows) => {
        for (let i = 0; i < rows.length; i++) {
            const xml = `<row><data>${rows[i].join(',')}</data></row>`;
            
            // Create a delay function
            const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
            
            // Delay for 5 seconds (5000 milliseconds)
            await delay(5000);
            
            try {
                const response = await axios.post(`http://localhost:${serverPort}/receive-xml`, { xml });
                const message = response.data.message || 'Row transferred successfully';
                setTransferStatus(prev => [...prev, `Row ${i + 1} transferred: ${message}`]);
                if (response.data.fileCount !== undefined) {
                    setFileCount(response.data.fileCount);
                }
            } catch (error) {
                setTransferStatus(prev => [...prev, `Row ${i + 1} failed to transfer: ${error.message}`]);
            }
        }
    };

    return (
        <div className="csvuploader-container">
            <h2>Connect to Server</h2>
            {error && <p className="error-message">{error}</p>}
            <div className="connection-box">
                <input
                    type="text"
                    placeholder="Enter Server Port (e.g., 8090)"
                    value={serverPort}
                    onChange={handlePortChange}
                    className="input-field"
                />
                <button onClick={handleConnect} className="connect-button">
                    {isConnected ? 'Connected':'Connect'}
                </button>
            </div>

            {isConnected && (
                <>
                    <h2>Upload CSV File</h2>
                    <div className="csvuploader-input">
                        <input 
                            type="file" 
                            accept=".csv" 
                            onChange={handleFileUpload}
                            className="file-input"
                        />
                        <button 
                            onClick={handleParse}
                            className="upload-button"
                            disabled={!file}
                        >
                            Upload and Transfer
                        </button>
                    </div>
                </>
            )}

            <div className="status-box">
                {rowCount > 0 && (
                    <p>
                        File Count: {rowCount} 
                        {fileCount > 0 && <> | Server Received Count: {fileCount}</>}
                    </p>
                )}
                {transferStatus.map((status, index) => (
                    <p key={index}>{status}</p>
                ))}
            </div>
        </div>
    );
}

export default CsvUploader;
