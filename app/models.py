from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from app import db
import hashlib
import json

class User(UserMixin, db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    phone_number = db.Column(db.String(20), unique=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_admin = db.Column(db.Boolean, default=False)
    
    # Relationships
    owned_parcels = db.relationship('Parcel', foreign_keys='Parcel.owner_id', backref='owner', lazy='dynamic')
    documents = db.relationship('Document', foreign_keys='Document.owner_id', backref='owner', lazy='dynamic')
    sent_transactions = db.relationship('Transaction', foreign_keys='Transaction.previous_owner_id', backref='previous_owner', lazy='dynamic')
    received_transactions = db.relationship('Transaction', foreign_keys='Transaction.new_owner_id', backref='new_owner', lazy='dynamic')
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def get_notifications(self):
        """Get recent notifications for the user"""
        notifications = []
        
        # Check for document status updates
        recent_docs = self.documents.filter(
            Document.created_at >= datetime.utcnow().replace(hour=0, minute=0, second=0)
        ).all()
        
        for doc in recent_docs:
            if doc.ocr_status in ['verified', 'Traité'] and doc.is_compliant:
                notifications.append({
                    'type': 'success',
                    'message': f'Votre document {doc.document_type} a été validé',
                    'time': doc.created_at
                })
            elif doc.ocr_status in ['verified', 'Traité'] and not doc.is_compliant:
                notifications.append({
                    'type': 'warning',
                    'message': f'Votre document {doc.document_type} nécessite une révision',
                    'time': doc.created_at
                })
        
        return notifications[:5]  # Return last 5 notifications
    
    def __repr__(self):
        return f'<User {self.email}>'

class Parcel(db.Model):
    __tablename__ = 'parcels'
    
    id = db.Column(db.Integer, primary_key=True)
    parcel_id_unique = db.Column(db.String(50), unique=True, nullable=False, index=True)
    owner_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    geometry = db.Column(db.JSON)  # Store GeoJSON polygon coordinates
    status = db.Column(db.String(50), default='En cours de traitement')  # Vérifié, En cours de traitement, Non conforme
    address = db.Column(db.Text)
    area_sqm = db.Column(db.Float)  # Area in square meters
    land_use = db.Column(db.String(100))  # Résidentiel, Commercial, Agricole, etc.
    last_updated = db.Column(db.DateTime, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    documents = db.relationship('Document', backref='parcel', lazy='dynamic')
    transactions = db.relationship('Transaction', backref='parcel', lazy='dynamic')
    
    @property
    def status_color(self):
        """Return color code for status display"""
        colors = {
            'Vérifié': '#10B981',      # Green
            'Enregistré': '#10B981',   # Green (alias)
            'En cours de traitement': '#F59E0B',  # Yellow
            'En cours': '#F59E0B',     # Yellow (alias)
            'Non conforme': '#EF4444', # Red
            'Litigieux': '#EF4444',    # Red (alias)
            'Vendu': '#3B82F6'         # Blue
        }
        return colors.get(self.status, '#6B7280')  # Default gray
    
    @property
    def normalized_status(self):
        """Return normalized status for UI consistency"""
        status_map = {
            'Vérifié': 'Enregistré',
            'En cours de traitement': 'En cours',
            'Non conforme': 'Litigieux'
        }
        return status_map.get(self.status, self.status)
    
    # API compatibility properties - mapping to actual field names
    @property
    def reference_number(self):
        return self.parcel_id_unique
    
    @property
    def location(self):
        return self.address
    
    @property
    def area(self):
        return self.area_sqm
    
    @property
    def parcel_type(self):
        return self.land_use
    
    @property
    def latitude(self):
        # Extract latitude from geometry if available, else default
        if self.geometry and 'coordinates' in self.geometry:
            try:
                coords = self.geometry['coordinates']
                # Handle different geometry types
                if isinstance(coords[0], list):
                    # Polygon or MultiPolygon - use first point
                    if isinstance(coords[0][0], list):
                        return float(coords[0][0][1])  # Polygon
                    else:
                        return float(coords[0][1])  # LineString
                else:
                    # Point geometry: [longitude, latitude]
                    return float(coords[1])
            except (KeyError, IndexError, TypeError, ValueError):
                pass
        return 6.5  # Default latitude for Benin
    
    @property
    def longitude(self):
        # Extract longitude from geometry if available, else default
        if self.geometry and 'coordinates' in self.geometry:
            try:
                coords = self.geometry['coordinates']
                # Handle different geometry types
                if isinstance(coords[0], list):
                    # Polygon or MultiPolygon - use first point
                    if isinstance(coords[0][0], list):
                        return float(coords[0][0][0])  # Polygon
                    else:
                        return float(coords[0][0])  # LineString
                else:
                    # Point geometry: [longitude, latitude]
                    return float(coords[0])
            except (KeyError, IndexError, TypeError, ValueError):
                pass
        return 2.6  # Default longitude for Benin
    
    @property
    def coordinates(self):
        # Return geometry as JSON string for JavaScript
        if self.geometry:
            return json.dumps(self.geometry)
        return None
    
    def get_latest_transaction(self):
        """Get the most recent transaction for this parcel"""
        return self.transactions.first()
    
    def get_transaction_history(self):
        """Get full transaction history for blockchain display"""
        return self.transactions.all()
    
    def __repr__(self):
        return f'<Parcel {self.parcel_id_unique}>'

class Document(db.Model):
    __tablename__ = 'documents'
    
    id = db.Column(db.Integer, primary_key=True)
    parcel_id = db.Column(db.Integer, db.ForeignKey('parcels.id'), nullable=True)  # Made nullable for documents without parcels
    owner_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)  # Renamed from user_id for consistency
    document_type = db.Column(db.String(100), nullable=False)  # Titre Foncier, Certificat de Vente, etc.
    filename = db.Column(db.String(255), nullable=False)
    unique_filename = db.Column(db.String(255))  # For internal storage
    file_path = db.Column(db.String(500), nullable=False)
    file_size = db.Column(db.Integer)
    file_hash = db.Column(db.String(64))  # SHA-256 hash for integrity
    ocr_status = db.Column(db.String(50), default='pending')  # pending, processing, verified, rejected
    ocr_results = db.Column(db.JSON)  # Store OCR extracted data
    is_compliant = db.Column(db.Boolean, default=False)
    compliance_notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)  # Renamed from upload_date
    processed_at = db.Column(db.DateTime)  # Renamed from processed_date
    
    # Compatibility properties
    @property
    def upload_date(self):
        return self.created_at
    
    @property
    def processed_date(self):
        return self.processed_at
    
    @property 
    def user_id(self):
        return self.owner_id
    
    @property
    def status_badge_class(self):
        """Return CSS class for status badge"""
        classes = {
            'En attente': 'bg-gray-100 text-gray-800',
            'En cours': 'bg-blue-100 text-blue-800',
            'Traité': 'bg-green-100 text-green-800' if self.is_compliant else 'bg-red-100 text-red-800',
            'Erreur': 'bg-red-100 text-red-800'
        }
        return classes.get(self.ocr_status, 'bg-gray-100 text-gray-800')
    
    def __repr__(self):
        return f'<Document {self.filename}>'

class Transaction(db.Model):
    __tablename__ = 'transactions'
    
    id = db.Column(db.Integer, primary_key=True)
    parcel_id = db.Column(db.Integer, db.ForeignKey('parcels.id'), nullable=False)
    transaction_type = db.Column(db.String(50), nullable=False)  # Vente, Achat, Héritage, Donation
    previous_owner_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    new_owner_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    price = db.Column(db.Float)  # Transaction price if applicable
    created_at = db.Column(db.DateTime, default=datetime.utcnow)  # Renamed from timestamp for consistency
    transaction_hash = db.Column(db.String(64), unique=True, nullable=False)
    previous_hash = db.Column(db.String(64))  # Hash of previous transaction for this parcel
    block_data = db.Column(db.JSON)  # Additional blockchain-like data
    
    # Compatibility property
    @property
    def timestamp(self):
        return self.created_at
    
    def __init__(self, **kwargs):
        super(Transaction, self).__init__(**kwargs)
        # Generate transaction hash on creation
        if not self.transaction_hash:
            self.transaction_hash = self.generate_hash()
    
    def generate_hash(self):
        """Generate SHA-256 hash for this transaction"""
        # Create a string representation of transaction data
        data_string = f"{self.parcel_id}{self.transaction_type}{self.new_owner_id}{self.timestamp}{self.previous_hash or ''}"
        return hashlib.sha256(data_string.encode()).hexdigest()
    
    @property
    def is_genesis(self):
        """Check if this is the first transaction for the parcel"""
        return self.previous_hash is None
    
    def verify_chain_integrity(self):
        """Verify the integrity of the transaction chain"""
        if self.is_genesis:
            return True
        
        # Find the previous transaction
        prev_transaction = Transaction.query.filter_by(
            parcel_id=self.parcel_id,
            transaction_hash=self.previous_hash
        ).first()
        
        return prev_transaction is not None
    
    def __repr__(self):
        return f'<Transaction {self.transaction_hash[:8]}...>'