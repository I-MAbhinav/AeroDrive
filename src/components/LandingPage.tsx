import { useState } from 'react';
import { Menu, X, Cloud, Shield, Zap, Server } from 'lucide-react';

interface LandingPageProps {
  onLoginClick: () => void;
}

const LandingPage = ({ onLoginClick }: LandingPageProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="landing-container">
      {/* Navbar */}
      <nav className="landing-navbar glass-panel">
        <div className="landing-nav-content">
          <div className="landing-logo">
            <Cloud className="logo-icon" size={28} />
            <span>AeroDrive</span>
          </div>

          <div className={`landing-nav-links ${isMobileMenuOpen ? 'open' : ''}`}>
            <button onClick={() => scrollToSection('about')} className="landing-nav-item">About</button>
            <button onClick={() => scrollToSection('how-it-works')} className="landing-nav-item">How it Works</button>
            <button onClick={() => scrollToSection('contact')} className="landing-nav-item">Contact Us</button>
            <button onClick={onLoginClick} className="btn-primary login-btn">
              Login / Signup
            </button>
          </div>

          <button className="mobile-menu-btn" onClick={toggleMenu}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section" id="home">
        <div className="hero-content fade-in">
          <h1 className="hero-title">Your Files, Always With You.</h1>
          <p className="hero-subtitle">
            AeroDrive is a fast, secure, and modern cloud storage solution designed for everyone.
            Store, manage, and access your photos, documents, and videos from anywhere in the world.
          </p>
          <button onClick={onLoginClick} className="btn-primary hero-btn">
            Get Started for Free
          </button>
        </div>
      </section>

      {/* About Section - Technology */}
      <section className="about-section" id="about">
        <h2 className="section-title">Powered by Modern Cloud Tech</h2>
        <div className="features-grid">
          <div className="feature-card glass-panel">
            <div className="feature-icon-wrapper"><Zap className="feature-icon" size={32} /></div>
            <h3>AWS Amplify</h3>
            <p>
              We use AWS Amplify to provide a robust, scalable backend. It handles seamless user authentication,
              ensuring your login is both fast and completely secure. It acts as the bridge connecting our app to the cloud.
            </p>
          </div>
          <div className="feature-card glass-panel">
            <div className="feature-icon-wrapper"><Server className="feature-icon" size={32} /></div>
            <h3>AWS S3 Storage</h3>
            <p>
              Under the hood, your files are safely stored in Amazon Simple Storage Service (S3).
              S3 offers industry-leading durability, meaning your files are redundantly backed up and always protected against loss.
            </p>
          </div>
          <div className="feature-card glass-panel">
            <div className="feature-icon-wrapper"><Shield className="feature-icon" size={32} /></div>
            <h3>End-to-End Security</h3>
            <p>
              By combining Amplify's authentication rules and S3's secure storage policies, AeroDrive ensures
              that only YOU can access your files. Your data privacy is our top priority.
            </p>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="how-it-works-section" id="how-it-works">
        <h2 className="section-title">How AeroDrive Works</h2>
        <div className="steps-container">
          <div className="step-item">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>Create an Account</h3>
              <p>Sign up in seconds using your email. We verify your identity using AWS Amplify's secure OTP system.</p>
            </div>
          </div>
          <div className="step-line"></div>
          <div className="step-item">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>Upload Your Files</h3>
              <p>Drag and drop your files into our modern dashboard. They are instantly encrypted and sent to AWS S3.</p>
            </div>
          </div>
          <div className="step-line"></div>
          <div className="step-item">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>Access Anywhere</h3>
              <p>View, download, and manage your files from any device with an internet connection. It's that simple.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section" id="contact">
        <h2 className="section-title">Meet the Team</h2>
        <p className="team-subtitle">AeroDrive was built with love by an amazing group of developers.</p>
        <div className="team-grid">
          {/* PLACEHOLDERS for Team Members */}
          <div className="team-card glass-panel">
            <img src=" " alt="Abhinav Shakya" className="team-avatar" />
            <h3>Abhinav Shakya</h3>
            <p>Lead Developer</p>
          </div>
          <div className="team-card glass-panel">
            <img src=" " alt="Team Member 2" className="team-avatar" />
            <h3>Harshit Saharan</h3>
            <p>Frontend Developer</p>
          </div>
          <div className="team-card glass-panel">
            <img src=" " alt="Team Member 3" className="team-avatar" />
            <h3>Aman Arora</h3>
            <p>Backend Developer</p>
          </div>
          <div className="team-card glass-panel">
            <img src=" " alt="Team Member 4" className="team-avatar" />
            <h3>Jasleen Kaur</h3>
            <p>UI/UX Designer</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>© 2026 AeroDrive. Built by Abhinav Shakya and Team as a Demo.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
