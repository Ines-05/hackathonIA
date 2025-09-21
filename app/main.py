from flask import Blueprint, render_template, request, jsonify, current_app
from flask_login import login_required, current_user
from sqlalchemy import or_
from app.models import User, Parcel, Document, Transaction
from app import db

main_bp = Blueprint('main', __name__)

@main_bp.route('/')
def index():
    """Public homepage with search and map preview"""
    # Get some sample parcels for map display
    sample_parcels = Parcel.query.limit(10).all()
    
    return render_template('index.html', 
                         title='Accueil',
                         parcels=sample_parcels)

@main_bp.route('/search')
def search():
    """Search for parcels by address or parcel ID"""
    query = request.args.get('q', '')
    
    if not query:
        return jsonify({'results': []})
    
    # Search in parcel_id_unique and address
    parcels = Parcel.query.filter(
        or_(
            Parcel.parcel_id_unique.ilike(f'%{query}%'),
            Parcel.address.ilike(f'%{query}%')
        )
    ).limit(10).all()
    
    results = []
    for parcel in parcels:
        results.append({
            'id': parcel.id,
            'parcel_id': parcel.parcel_id_unique,
            'address': parcel.address,
            'status': parcel.status,
            'status_color': parcel.status_color
        })
    
    return jsonify({'results': results})

@main_bp.route('/dashboard')
@login_required
def dashboard():
    """User dashboard with parcel summary and notifications"""
    user_parcels = current_user.owned_parcels.all()
    notifications = current_user.get_notifications()
    
    # Statistics
    stats = {
        'total_parcels': len(user_parcels),
        'verified_parcels': len([p for p in user_parcels if p.status == 'Vérifié']),
        'pending_parcels': len([p for p in user_parcels if p.status == 'En cours de traitement']),
        'total_documents': current_user.documents.count()
    }
    
    return render_template('dashboard.html',
                         title='Tableau de Bord',
                         parcels=user_parcels,
                         notifications=notifications,
                         stats=stats)

@main_bp.route('/map')
def map_view():
    """Interactive map view"""
    # Get all parcels for map display
    all_parcels = Parcel.query.all()
    
    # If user is logged in, highlight their parcels
    user_parcels = []
    if current_user.is_authenticated:
        user_parcels = current_user.owned_parcels.all()
    
    return render_template('map_view.html',
                         title='Carte Interactive',
                         all_parcels=all_parcels,
                         user_parcels=user_parcels)

@main_bp.route('/parcel/<int:parcel_id>')
def parcel_detail(parcel_id):
    """Detailed view of a specific parcel"""
    parcel = Parcel.query.get_or_404(parcel_id)
    
    # Get transaction history for blockchain display
    transactions = parcel.get_transaction_history()
    
    # Get documents for this parcel
    documents = parcel.documents.all()
    
    # Check if current user owns this parcel
    is_owner = current_user.is_authenticated and parcel.owner_id == current_user.id
    
    return render_template('parcel_detail.html',
                         title=f'Parcelle {parcel.parcel_id_unique}',
                         parcel=parcel,
                         transactions=transactions,
                         documents=documents,
                         is_owner=is_owner)

@main_bp.route('/documents')
@login_required
def documents():
    """User's document management page"""
    user_documents = current_user.documents.all()
    
    return render_template('documents.html',
                         title='Mes Documents',
                         documents=user_documents)

@main_bp.route('/profile')
@login_required
def profile():
    """User profile page"""
    return render_template('profile.html',
                         title='Mon Profil')