// okay so this is react and we need useState to remember stuff
// like which icon is active rn
import React, { useState } from 'react';

// bringing in our styles and the navbar component we're gonna build
import './App.css';
import NavBar from './components/NavBar';

// each nav item has its own bg color for the page
// earth tones obv because thats the vibe
const backgroundColors = {
  home: '#f5f0eb',
  chat: '#eef2ee',
  analytics: '#f5f2e8',
  settings: '#f0edf2',
};

function App() {

  // active = whichever icon is selected rn
  // starts on home by default
  const [active, setActive] = useState('home');

  // grab the right bg color based on whats active
  // if somehow none match just use the default linen color
  const bgColor = backgroundColors[active] || '#f5f0eb';

  return (
    // the main wrapper div
    // style is inline here bc the color changes dynamically
    // cant do that in css alone
    <div
      className="app"
      style={{ backgroundColor: bgColor }}
    >

      {/* this is just a placeholder content area above the nav */}
      {/* in a real app this would be the actual page content */}
      <div className="app-content">

        {/* title changes based on whats active - feels like a real app */}
        <h1 className="page-title">
          {active === 'home' && 'Dashboard'}
          {active === 'chat' && 'AI Assistant'}
          {active === 'analytics' && 'Analytics'}
          {active === 'settings' && 'Settings'}
        </h1>

        {/* subtitle also changes - subtle but nice detail */}
        <p className="page-subtitle">
          {active === 'home' && 'good morning, vishnupriya'}
          {active === 'chat' && 'ask me anything'}
          {active === 'analytics' && 'your usage this week'}
          {active === 'settings' && 'preferences and account'}
        </p>

      </div>

      {/* the navbar sits at the bottom */}
      {/* we pass active and setActive as props */}
      {/* so navbar can read and update which icon is selected */}
      <NavBar active={active} setActive={setActive} />

    </div>
  );
}

// exporting so index.jsx can use it
export default App;