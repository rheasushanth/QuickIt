import { useState, useContext } from 'react';
import { X } from 'lucide-react';
import { StoreContext } from '../../Context/StoreContext';
import './LoginPopup.css';

const LoginPopup = ({ setShowLogin }) => {
  const [currState, setCurrState] = useState("Sign Up");
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, register } = useContext(StoreContext);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      let result;
      
      if (currState === "Sign Up") {
        result = await register(formData.name, formData.email, formData.password, formData.phone);
        
        if (result.success) {
          // Registration successful - user is now logged in (no OTP required in current backend)
          setShowLogin(false);
          setFormData({ name: '', email: '', password: '', phone: '' });
          // Show success message
          alert('Account created successfully! You are now logged in.');
        } else {
          setError(result.message || 'Registration failed');
        }
      } else {
        result = await login(formData.email, formData.password);
        
        if (result.success) {
          setShowLogin(false); // Close popup on success
          setFormData({ name: '', email: '', password: '', phone: '' }); // Reset form
        } else {
          setError(result.message || 'Login failed');
        }
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-popup">
        <div className="login-popup-container">
          <div className="login-popup-title">
            <h2>{currState}</h2>
            <button 
              onClick={() => setShowLogin(false)} 
              className="close-btn"
              aria-label="Close"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="login-popup-inputs">
            {error && <div className="error-message">{error}</div>}
            
            {currState === "Sign Up" && (
              <>
                <input
                  type="text"
                  name="name"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone number (optional)"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </>
            )}
            
            <input
              type="email"
              name="email"
              placeholder="Your email"
              value={formData.email}
              onChange={handleInputChange}
              required
              disabled={loading}
            />
            
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              required
              minLength="6"
              disabled={loading}
            />

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Please wait...' : (currState === "Sign Up" ? "Create account" : "Login")}
            </button>

            <div className="login-popup-condition">
              <input type="checkbox" required id="terms-checkbox" disabled={loading} />
              <label htmlFor="terms-checkbox">
                By continuing, I agree to the terms of use & privacy policy.
              </label>
            </div>

            {currState === "Login" ? (
              <p className="toggle-text">
                Create a new account? 
                <span onClick={() => !loading && setCurrState("Sign Up")}> Click here</span>
              </p>
            ) : (
              <p className="toggle-text">
                Already have an account? 
                <span onClick={() => !loading && setCurrState("Login")}> Login here</span>
              </p>
            )}
          </form>
        </div>
      </div>
  );
};

export default LoginPopup;