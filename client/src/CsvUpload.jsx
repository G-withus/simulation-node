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
    const [fileCount, setFileCount] = useState(0); // State to store file count

    // Handle file selection
    const handleFileUpload = (e) => {
        setFile(e.target.files[0]);
        setTransferStatus([]);
    };

    // Handle server port input
    const handlePortChange = (e) => {
        setServerPort(e.target.value);
    };

    // Connect to the server
    const handleConnect = () => {
        if (serverPort === '8090') {
            setIsConnected(true);
            alert('Connected to server!');
        } else {
            alert('Invalid server port. Please try again.');
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

    // Transfer CSV rows as XML to the backend
    const transferRows = async (rows) => {
        for (let i = 0; i < rows.length; i++) {
            const xml = `<row><data>${rows[i].join(',')}</data></row>`; // Ensure correct formatting for CSV rows
            try {
                const response = await axios.post(`http://localhost:${serverPort}/receive-xml`, { xml });
                // Correctly access the response message
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
            <div className="connection-box">
                <input
                    type="text"
                    placeholder="Enter Server Port (e.g., 8090)"
                    value={serverPort}
                    onChange={handlePortChange}
                    className="input-field"
                />
                <button onClick={handleConnect} className="connect-button">
                    Connect
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
                {rowCount > 0 && <p>File Count: {rowCount}</p>}
                {/* {fileCount > 0 && <p>File Count in receive.txt: {fileCount}</p>} */}
                {transferStatus.map((status, index) => (
                    <p key={index}>{status}</p>
                ))}
            </div>
        </div>
    );
}

export default CsvUploader;
