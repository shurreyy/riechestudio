import React from 'react';
import Head from 'next/head';

export default function OrchidSpirograph() {
  return (
    <>
      <Head>
        <title>Sacred Orchid | RIECHE</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>
      {/* Navigation */}
      <nav className="navigation">
        <div className="logo">
          <a href="/" style={{ textDecoration: 'none' }}>
            <div className="logo-main">RIECHE</div>
            <div className="logo-sub">Pilates Studio</div>
          </a>
        </div>
        <div className="nav-links">
          <a href="/philosophy" className="nav-link">Rieche Philosophy</a>
          <a href="/quiz" className="nav-link">Quiz</a>
          <a href="/building-rieche" className="nav-link">Building RIECHE</a>
          <a href="/the-room" className="nav-link">The Room</a>
          <a href="#contact" className="contact-button">Contact us</a>
        </div>
      </nav>
      <div className="container">
        <div className="canvas-container">
          <div className="canvas-header">
            <h1 className="canvas-title">Sacred Orchid</h1>
            <p className="canvas-subtitle">Botanical spirograph generator</p>
          </div>
          <div className="canvas-wrapper">
            {/* Canvas drawing logic will be implemented with useEffect */}
            <canvas id="orchidCanvas" width={600} height={600}></canvas>
          </div>
        </div>
        <div className="controls">
          {/* Controls and event handlers will be implemented with React state and handlers */}
          <div className="control-group">
            <h3>Orchid Presets</h3>
            <div className="preset-buttons">
              <button className="preset-btn">Cattleya</button>
              <button className="preset-btn">Moth Orchid</button>
              <button className="preset-btn">Dendrobium</button>
              <button className="preset-btn">Vanilla</button>
            </div>
          </div>
          <div className="control-group">
            <h3>Petal Layers</h3>
            {/* Petal controls will be implemented with React state */}
            {/* ...repeat for each petal type... */}
          </div>
          <div className="control-group">
            <h3>Color Palette</h3>
            <div className="color-palette">
              <div className="color-btn orchid active"></div>
              <div className="color-btn sunset"></div>
              <div className="color-btn lavender"></div>
              <div className="color-btn coral"></div>
              <div className="color-btn sage"></div>
              <div className="color-btn soft"></div>
            </div>
          </div>
          <div className="control-group">
            <h3>Bloom Details</h3>
            {/* Sliders for drawing speed, line delicacy, symmetry */}
          </div>
          <div className="action-buttons">
            <button className="action-btn">Bloom</button>
            <button className="action-btn secondary">Clear</button>
          </div>
        </div>
      </div>
      <style jsx global>{`
        /* The Seasons Font */
        @font-face {
          font-family: 'The Seasons';
          src: url('/public/assets/fonts/theseasons-reg.57d3e9b5285fa8dfd595ef780.57981c5d6c03cd30856912da5d26c788-webfont.woff2') format('woff2'),
               url('/public/assets/fonts/theseasons-reg.57d3e9b5285fa8dfd595ef780.57981c5d6c03cd30856912da5d26c788-webfont.woff') format('woff'),
               url('/public/assets/fonts/theseasons-reg.57d3e9b5285fa8dfd595ef780.57981c5d6c03cd30856912da5d26c788.otf') format('opentype');
          font-weight: 400;
          font-style: normal;
          font-display: swap;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%); font-family: 'Inter', sans-serif; color: #1a1a1a; min-height: 100vh; }
        /* ...rest of your CSS here... */
      `}</style>
    </>
  );
} 