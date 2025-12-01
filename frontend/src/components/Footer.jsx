import React from 'react';
import { Link } from 'react-router-dom';
import { Car, Mail, Phone, MapPin, Instagram, Facebook, Twitter, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-gray-50 to-gray-100 border-t border-gray-200" data-testid="footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-2 rounded-lg">
                <Car className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                The Wheel Deal
              </span>
            </Link>
            <p className="text-gray-600 text-sm">
              Your trusted partner for premium car rentals in Ahmedabad. Quality vehicles, exceptional service.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-gray-900 font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/cars" className="text-gray-600 hover:text-blue-600 transition-colors text-sm">
                  Browse Cars
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-600 hover:text-blue-600 transition-colors text-sm">
                  About Us
                </Link>
              </li>
             
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-gray-900 font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3 text-sm">
                <MapPin className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-600">
                  Ahmedabad, Gujarat, India
                </span>
              </li>
              <li className="flex items-center space-x-3 text-sm">
                <Phone className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <a href="tel:+919876543210" className="text-gray-600 hover:text-blue-600 transition-colors">
                  +91 98765 43210
                </a>
              </li>
              <li className="flex items-center space-x-3 text-sm">
                <Mail className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <a href="mailto:info@thewheeldeal.com" className="text-gray-600 hover:text-blue-600 transition-colors">
                  info@thewheeldeal.com
                </a>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-gray-900 font-semibold mb-4">Follow Us</h3>
            <div className="flex space-x-3">
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-white p-2 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 hover:border-blue-600 group"
              >
                <Instagram className="h-5 w-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
              </a>
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-white p-2 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 hover:border-blue-600 group"
              >
                <Facebook className="h-5 w-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-white p-2 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 hover:border-blue-600 group"
              >
                <Twitter className="h-5 w-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-white p-2 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 hover:border-blue-600 group"
              >
                <Linkedin className="h-5 w-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
              </a>
            </div>
            <p className="text-gray-600 text-sm mt-4">
              Stay connected for updates, offers, and new vehicle additions!
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-600 text-sm">
              © {new Date().getFullYear()} The Wheel Deal. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm">
              <Link to="/privacy" className="text-gray-600 hover:text-blue-600 transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-600 hover:text-blue-600 transition-colors">
                Terms of Service
              </Link>
              <Link to="/cancellation" className="text-gray-600 hover:text-blue-600 transition-colors">
                Cancellation Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;