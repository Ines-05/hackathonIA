import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    pass

# Initialize extensions
db = SQLAlchemy(model_class=Base)
login_manager = LoginManager()

def create_app():
    app = Flask(__name__)
    app.config.from_object('config.Config')

    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv("SQLALCHEMY_DATABASE_URI")
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Initialize extensions
    db.init_app(app)
    login_manager.init_app(app)
    login_manager.login_view = 'auth.login'  # type: ignore
    login_manager.login_message = 'Veuillez vous connecter pour accéder à cette page.'
    login_manager.login_message_category = 'info'
    
    # Import models to ensure they are registered with SQLAlchemy
    from app import models
    
    # Import and register blueprints
    from app.auth import auth_bp
    from app.main import main_bp
    from app.api import api_bp
    
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(main_bp)
    app.register_blueprint(api_bp, url_prefix='/api')
    
    # Create database tables safely
    with app.app_context():
        try:
            db.create_all()
            # Create sample data if tables are empty
            create_sample_data()
        except Exception as e:
            app.logger.error(f"Database initialization error: {e}")
            # Continue without sample data if there's an issue
    
    return app

def create_sample_data():
    """Create sample data for demonstration"""
    from app.models import User, Parcel, Transaction
    import hashlib
    from datetime import datetime
    
    # Check if data already exists
    if User.query.first():
        return  # Data already exists
    
    try:
        # Create sample users
        admin_user = User()
        admin_user.full_name = "Administrateur FoncierMap"
        admin_user.email = "admin@fonciermap.bj"
        admin_user.phone_number = "+229 97 000 000"
        admin_user.is_admin = True
        admin_user.set_password("admin123")
        
        sample_user = User()
        sample_user.full_name = "Jean-Claude Kouadio"
        sample_user.email = "jc.kouadio@email.bj"
        sample_user.phone_number = "+229 97 123 456"
        sample_user.set_password("password123")
        
        db.session.add_all([admin_user, sample_user])
        db.session.commit()
        
        # Create sample parcels with different statuses
        sample_parcels = [
            {
                'parcel_id_unique': 'BJ-COT-001-2024',
                'owner_id': sample_user.id,
                'address': 'Quartier Haie Vive, Cotonou, Bénin',
                'area_sqm': 500.0,
                'land_use': 'Résidentiel',
                'status': 'Vérifié',
                'geometry': {
                    "type": "Polygon",
                    "coordinates": [[
                        [2.4287, 6.3653],
                        [2.4291, 6.3653],
                        [2.4291, 6.3649],
                        [2.4287, 6.3649],
                        [2.4287, 6.3653]
                    ]]
                }
            },
            {
                'parcel_id_unique': 'BJ-COT-002-2024',
                'owner_id': sample_user.id,
                'address': 'Avenue Steinmetz, Cotonou, Bénin',
                'area_sqm': 750.0,
                'land_use': 'Commercial',
                'status': 'En cours de traitement',
                'geometry': {
                    "type": "Polygon",
                    "coordinates": [[
                        [2.4300, 6.3660],
                        [2.4305, 6.3660],
                        [2.4305, 6.3655],
                        [2.4300, 6.3655],
                        [2.4300, 6.3660]
                    ]]
                }
            },
            {
                'parcel_id_unique': 'BJ-PNO-001-2024',
                'owner_id': admin_user.id,
                'address': 'Route de Porto-Novo, Bénin',
                'area_sqm': 1200.0,
                'land_use': 'Agricole',
                'status': 'Vérifié',
                'geometry': {
                    "type": "Polygon",
                    "coordinates": [[
                        [2.4250, 6.4970],
                        [2.4260, 6.4970],
                        [2.4260, 6.4960],
                        [2.4250, 6.4960],
                        [2.4250, 6.4970]
                    ]]
                }
            }
        ]
        
        for parcel_data in sample_parcels:
            parcel = Parcel()
            for key, value in parcel_data.items():
                setattr(parcel, key, value)
            db.session.add(parcel)
        
        db.session.commit()
        
        # Create sample transactions for blockchain simulation
        parcels = Parcel.query.all()
        for parcel in parcels:
            # Genesis transaction (initial ownership)
            genesis_tx = Transaction()
            genesis_tx.parcel_id = parcel.id
            genesis_tx.transaction_type = 'Enregistrement Initial'
            genesis_tx.new_owner_id = parcel.owner_id
            genesis_tx.previous_owner_id = None
            genesis_tx.timestamp = datetime.utcnow()
            genesis_tx.previous_hash = None
            
            # Generate hash
            data_string = f"{genesis_tx.parcel_id}{genesis_tx.transaction_type}{genesis_tx.new_owner_id}{genesis_tx.timestamp}"
            genesis_tx.transaction_hash = hashlib.sha256(data_string.encode()).hexdigest()
            
            db.session.add(genesis_tx)
        
        db.session.commit()
        
    except Exception as e:
        db.session.rollback()
        print(f"Error creating sample data: {e}")