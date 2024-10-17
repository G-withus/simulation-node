import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CsvUploader from './CsvUpload';
import ServerPage from './ServerPage';
  // Adjust the path as per your folder structure

function App() {
    return (
        
            <Routes>
                {/* Default route for CSV Uploader */}
                <Route path="/" element={<CsvUploader />} />

                {/* Route for Server Page */}
                <Route path="/server" element={<ServerPage />} />
            </Routes>
       
    );
}

export default App;
