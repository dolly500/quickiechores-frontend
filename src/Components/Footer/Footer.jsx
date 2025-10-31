
import "./Footer.css";
import { assets } from "../../assets/frontend_assets/assets";

const Footer = () => {
  return (
    <div className="footer" id="footer">
      <div className="footer-content">
        <div className="footer-content-left">
          <img className="logo" src={assets.logo} alt="Homease Logo" />
          <p>
            Quickie Chores connects you with trusted professionals for all your home service needs.
            Our vetted experts deliver quality services with convenience and reliability,
            helping you maintain a beautiful and functional living space without the hassle.
          </p>
          <div className="footer-social-icons">
            <a href="https://www.facebook.com/share/17AVgZpqEU/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer">
              <img src={assets.facebook_icon} alt="Facebook" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
              <img src={assets.twitter_icon} alt="Twitter" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
              <img src={assets.linkedin_icon} alt="LinkedIn" />
            </a>
          </div>
        </div>
        <div className="footer-content-center">
          <h2>Quick Links</h2>
          <div className="footer-divider"></div>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="#explore-services">Our Services</a></li>
            
            <li><a href="#privacy">Privacy Policy</a></li>
            <li><a href="#terms">Terms of Service</a></li>
          </ul>
        </div>
        <div className="footer-content-right">
          <h2>Contact Us</h2>
          <div className="footer-divider"></div>
          <ul>
            <li className="contact-item">
              <i className="contact-icon phone-icon"></i>
             ‪+44 7951 894316‬
            </li>
            <li className="contact-item">
              <i className="contact-icon email-icon"></i>
              support@quickiechores.com
            </li>
            <li className="contact-item">
              <i className="contact-icon location-icon"></i>
              59 Southbourne Road, Blackpool FY3 9SH
            </li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <hr />
        <p className="footer-copyright">
          &copy; {new Date().getFullYear()} Quickiechores | All Rights Reserved
        </p>
      </div>
    </div>
  );
};

export default Footer;
