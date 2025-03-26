/**
 * @component BongoCatDemo
 * @description Demo component showing how to use the BongoCat component
 */

import React, { useState } from 'react';
import BongoCat from './BongoCat';

const BongoCatDemo = () => {
  const [input, setInput] = useState('');
  
  return (
    <div style={{ 
      height: '100vh', 
      width: '100vw', 
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <BongoCat text="Type something!" onKeyPress={true} />
      
      <div style={{
        position: 'absolute',
        bottom: '20px',
        width: '80%',
        maxWidth: '500px',
        padding: '20px',
        textAlign: 'center',
        zIndex: 10
      }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type here to make the cat bongo!"
          style={{
            width: '100%',
            padding: '10px',
            fontSize: '16px',
            borderRadius: '8px',
            border: '2px solid #333'
          }}
        />
      </div>
    </div>
  );
};

export default BongoCatDemo; 