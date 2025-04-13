'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxFiles: 1,
    onDrop: acceptedFiles => {
      setFile(acceptedFiles[0]);
      setPreviewUrl(URL.createObjectURL(acceptedFiles[0]));
      setResult(null);
    }
  });

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file); // ✅ Match the field name expected by FastAPI


    try {
      const response = await axios.post('https://facedetector-production-008e.up.railway.app/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setResult(response.data.hasFace);
    } catch (error) {
      console.error('Error uploading file:', error);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <div 
        {...getRootProps()} 
        className="border-2 border-dashed border-gray-300 p-6 text-center cursor-pointer hover:bg-gray-50"
      >
        <input {...getInputProps()} />
        <p>Drag & drop an image here, or click to select</p>
      </div>

      {previewUrl && (
        <div className="mt-4">
          <h3 className="text-lg font-medium mb-2">Preview:</h3>
          <img 
            src={previewUrl} 
            alt="Preview" 
            className="max-h-64 mx-auto"
          />
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className={`mt-4 w-full py-2 px-4 rounded-md text-white ${!file || loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
      >
        {loading ? 'Processing...' : 'Verify Image'}
      </button>

      {result !== null && (
        <div className={`mt-4 p-3 rounded-md ${result ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {result ? '✅ Face detected in the image!' : '❌ No face detected in the image.'}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
