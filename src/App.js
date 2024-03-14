import React, { useState } from 'react';
import AwesomeDebouncePromise from 'awesome-debounce-promise';

function App() {
  const [prompt, setPrompt] = useState('');
  const [responseData, setResponseData] = useState(null);
  const [loading, setLoading] = useState(false);

  const makeRequest = async () => {
    try {
      setLoading(true); // Set loading state to true
      const response = await fetch('http://localhost:3001/api/forwardRequest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          styles: [
            "style1",
            "style2"
          ],
          sampler_name: "DPM++ 2M Karras",
          n_iter: 2,
          steps: 5,
          cfg_scale: 7,
          width: 512,
          height: 512,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch data from the endpoint');
      }

      const responseData = await response.json();
      setResponseData(responseData);
    } catch (error) {
      console.error(error.message);
    } finally {
      setLoading(false); // Set loading state to false after request is completed
    }
  };

  const handleDownloadImage = (imageData, index) => {
    const byteCharacters = atob(imageData);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/png' });
  
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `image_${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="App">
      <label>
        Prompt:
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
      </label>
      <button onClick={AwesomeDebouncePromise(makeRequest, 1000)}>
        {loading ? 'Loading...' : 'Make Request'}
      </button>
      {responseData && (
        <div>
          <h2>Response Images:</h2>
          {responseData.images.map((imageData, index) => (
            <div key={index}>
              <img
                src={`data:image/png;base64,${imageData}`}
                alt={`Image ${index + 1}`}
              />
              <button onClick={() => handleDownloadImage(imageData, index)}>
                Download Image {index + 1}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
