# FoncierMap

## Overview

FoncierMap is a land title management platform built for the Benin market, allowing users to manage land parcels, documents, and transactions. The application provides a modern web interface for property owners to track their land titles, upload documents with OCR processing, and visualize properties on an interactive map. The system features public property search functionality and a comprehensive dashboard for authenticated users.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Backend Architecture
- **Framework**: Flask web framework with blueprint-based modular structure
- **Database ORM**: SQLAlchemy with Flask-SQLAlchemy integration using declarative base
- **Authentication**: Custom Flask-Login implementation with password hashing using Werkzeug
- **File Upload System**: Secure file handling with configurable upload limits (16MB) and type restrictions
- **Database Connection**: PostgreSQL with connection pooling and SSL support configured for production environments

### Frontend Architecture
- **UI Framework**: Tailwind CSS for responsive, mobile-first design with Benin-inspired color scheme (green, yellow, red, blue)
- **Typography**: Poppins font family for modern aesthetics
- **Map Integration**: Leaflet.js for interactive map functionality
- **Icons**: Font Awesome for consistent iconography
- **Responsive Design**: Mobile-first approach with progressive enhancement for desktop

### Data Model Design
- **User Management**: User accounts with role-based permissions (admin/regular users)
- **Parcel System**: Land parcel records with ownership tracking, status management, and geographical data
- **Document Management**: File upload system with OCR processing simulation and compliance checking
- **Transaction History**: Complete audit trail for property transfers and ownership changes
- **Notification System**: Real-time updates for document status and property changes

### Security Architecture
- **Session Management**: Flask sessions with configurable secret keys
- **Password Security**: Werkzeug password hashing with salt
- **File Security**: Secure filename generation and type validation
- **Access Control**: Login-required decorators and ownership verification
- **Database Security**: SQL injection prevention through SQLAlchemy ORM and parameterized queries

### Application Structure
- **Modular Design**: Blueprint-based organization (auth, main, api modules)
- **Configuration Management**: Environment-based configuration with production/development settings
- **Error Handling**: Comprehensive error handling with user-friendly messages in French
- **Internationalization**: French language interface throughout the application

## External Dependencies

### Core Dependencies
- **Flask**: Web framework and extensions (SQLAlchemy, Login)
- **PostgreSQL**: Primary database system with connection pooling
- **Werkzeug**: Security utilities for password hashing and file handling
- **WTForms**: Form handling and validation with CSRF protection

### Frontend Dependencies
- **Tailwind CSS**: Utility-first CSS framework delivered via CDN
- **Leaflet.js**: Open-source mapping library for interactive maps
- **Font Awesome**: Icon library for UI elements
- **Google Fonts**: Poppins font family for typography

### Development Tools
- **python-dotenv**: Environment variable management for configuration
- **Flask development server**: Built-in development server with hot reload

### File Storage
- **Local filesystem**: Document storage in configurable upload directory
- **File type validation**: Support for PDF, image formats, and Office documents

### Potential Integrations
- **OCR Services**: Simulated OCR processing for document text extraction
- **Email Services**: User notification system (prepared but not implemented)
- **SMS Services**: Mobile notifications for transaction updates
- **Geographic APIs**: Enhanced mapping and location services