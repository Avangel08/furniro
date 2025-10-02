export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-main">
          <div className="footer-company">
            <div className="footer-logo">Funiro.</div>
            <div className="footer-address">
              400 University Drive Suite 200<br />
              Coral Gables, FL 33134 USA
            </div>
          </div>
          <div className="footer-section">
            <h3>Links</h3>
            <ul className="footer-links">
              <li><a href="#home">Home</a></li>
              <li><a href="#shop">Shop</a></li>
              <li><a href="#about">About</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>Help</h3>
            <ul className="footer-links">
              <li><a href="#payment">Payment Options</a></li>
              <li><a href="#returns">Returns</a></li>
              <li><a href="#privacy">Privacy Policies</a></li>
            </ul>
          </div>
          <div className="footer-section newsletter-section">
            <h3>Newsletter</h3>
            <div className="newsletter-input-group">
              <input type="email" className="newsletter-input" placeholder="Enter Your Email Address" />
              <button className="subscribe-btn">SUBSCRIBE</button>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="copyright">2023 furino. All rights reverved</div>
        </div>
      </div>
    </footer>
  );
}


