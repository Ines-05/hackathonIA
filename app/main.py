from flask import Blueprint, render_template, request, jsonify, current_app, flash, redirect, url_for, send_file
from flask_login import login_required, current_user
from sqlalchemy import or_
from werkzeug.utils import secure_filename
import os
import hashlib
from datetime import datetime
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
    
    return render_template('map.html',
                         title='Carte Interactive',
                         all_parcels=all_parcels,
                         user_parcels=user_parcels)

@main_bp.route('/parcel/<int:parcel_id>')
def parcel_detail(parcel_id):
    """Detailed view of a specific parcel"""
    parcel = Parcel.query.get_or_404(parcel_id)
    
    # Get transaction history for blockchain display (ordered properly)
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
    
    # Calculate statistics (using legacy status names to match existing template)
    total_documents = len(user_documents)
    verified_documents = len([d for d in user_documents if d.ocr_status in ['verified', 'Traité']])
    pending_documents = len([d for d in user_documents if d.ocr_status in ['pending', 'En attente']])
    rejected_documents = len([d for d in user_documents if d.ocr_status in ['rejected', 'Erreur']])
    
    # Get user's parcels for the upload form
    user_parcels = current_user.owned_parcels.all()
    
    return render_template('documents.html',
                         title='Mes Documents',
                         documents=user_documents,
                         total_documents=total_documents,
                         verified_documents=verified_documents,
                         pending_documents=pending_documents,
                         rejected_documents=rejected_documents,
                         user_parcels=user_parcels)

@main_bp.route('/documents/<int:document_id>/download')
@login_required
def download_document_route(document_id):
    """Download document with security checks"""
    document = Document.query.get_or_404(document_id)
    
    # Check if user owns the document or the associated parcel
    if (document.owner_id != current_user.id and 
        (not document.parcel or document.parcel.owner_id != current_user.id)):
        flash('Accès non autorisé à ce document.', 'error')
        return redirect(url_for('main.documents'))
    
    try:
        if os.path.exists(document.file_path):
            return send_file(document.file_path, as_attachment=True, download_name=document.filename)
        else:
            flash('Fichier non trouvé.', 'error')
            return redirect(url_for('main.documents'))
    except Exception as e:
        current_app.logger.error(f"Download error: {str(e)}")
        flash('Erreur lors du téléchargement.', 'error')
        return redirect(url_for('main.documents'))

@main_bp.route('/profile')
@login_required
def profile():
    """User profile page"""
    return render_template('profile.html',
                         title='Mon Profil')

# API Routes
@main_bp.route('/api/parcels')
def api_parcels():
    """API endpoint to get parcels data for map"""
    parcels = Parcel.query.all()
    
    results = []
    for parcel in parcels:
        results.append({
            'id': parcel.id,
            'reference_number': parcel.reference_number,
            'location': parcel.location,
            'area': parcel.area,
            'status': parcel.normalized_status,  # Use normalized status for UI consistency
            'parcel_type': parcel.parcel_type,
            'latitude': float(parcel.latitude) if parcel.latitude else 6.5,
            'longitude': float(parcel.longitude) if parcel.longitude else 2.6,
            'coordinates': parcel.coordinates,
            'owner_name': parcel.owner.full_name if parcel.owner else 'Unknown',
            'owner_id': parcel.owner_id
        })
    
    return jsonify(results)

# Document upload configuration
ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg', 'doc', 'docx'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@main_bp.route('/api/documents/upload', methods=['POST'])
@login_required
def upload_document():
    """Handle document upload with security checks"""
    try:
        if 'file' not in request.files:
            return jsonify({'success': False, 'message': 'Aucun fichier sélectionné'})
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'success': False, 'message': 'Aucun fichier sélectionné'})
        
        if not allowed_file(file.filename):
            return jsonify({'success': False, 'message': 'Type de fichier non autorisé'})
        
        # Get form data
        document_type = request.form.get('document_type')
        parcel_id = request.form.get('parcel_id')
        
        if not document_type:
            return jsonify({'success': False, 'message': 'Type de document requis'})
        
        # Secure filename
        filename = secure_filename(file.filename)
        
        # Create user upload directory
        upload_dir = os.path.join(current_app.config['UPLOAD_FOLDER'], str(current_user.id))
        os.makedirs(upload_dir, exist_ok=True)
        
        # Generate unique filename
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        name, ext = os.path.splitext(filename)
        unique_filename = f"{name}_{timestamp}{ext}"
        
        file_path = os.path.join(upload_dir, unique_filename)
        file.save(file_path)
        
        # Calculate file hash for integrity
        with open(file_path, 'rb') as f:
            file_hash = hashlib.sha256(f.read()).hexdigest()
        
        # Create document record
        document = Document(
            filename=filename,
            unique_filename=unique_filename,
            file_path=file_path,
            document_type=document_type,
            file_size=os.path.getsize(file_path),
            file_hash=file_hash,
            owner_id=current_user.id,
            parcel_id=int(parcel_id) if parcel_id else None,
            ocr_status='pending'
        )
        
        db.session.add(document)
        db.session.commit()
        
        # Simulate OCR processing (in real app, this would be async)
        simulate_ocr_processing(document.id)
        
        return jsonify({'success': True, 'message': 'Document téléchargé avec succès'})
        
    except Exception as e:
        current_app.logger.error(f"Upload error: {str(e)}")
        return jsonify({'success': False, 'message': 'Erreur lors du téléchargement'})

def simulate_ocr_processing(document_id):
    """Simulate OCR processing with random results"""
    import random
    
    try:
        document = Document.query.get(document_id)
        if not document:
            return
        
        # Simulate processing time and results
        ocr_results = {
            'reference_number': f"TF-{random.randint(10000, 99999)}",
            'owner_name': document.owner.full_name,
            'area': f"{random.randint(100, 5000)} m²",
            'location': f"Zone {random.choice(['A', 'B', 'C'])}, Secteur {random.randint(1, 10)}",
            'date_emission': datetime.now().strftime('%d/%m/%Y')
        }
        
        document.ocr_results = ocr_results
        document.ocr_status = 'verified'
        document.processed_at = datetime.now()
        
        db.session.commit()
        
    except Exception as e:
        current_app.logger.error(f"OCR simulation error: {str(e)}")

@main_bp.route('/api/documents/<int:document_id>/view')
@login_required
def view_document(document_id):
    """View document (security check for ownership)"""
    document = Document.query.get_or_404(document_id)
    
    # Check ownership
    if document.owner_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    try:
        return send_file(document.file_path, as_attachment=False)
    except FileNotFoundError:
        return jsonify({'error': 'Fichier non trouvé'}), 404

@main_bp.route('/api/documents/<int:document_id>/download')
@login_required  
def download_document(document_id):
    """Download document (security check for ownership)"""
    document = Document.query.get_or_404(document_id)
    
    # Check ownership
    if document.owner_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    try:
        return send_file(document.file_path, as_attachment=True, download_name=document.filename)
    except FileNotFoundError:
        return jsonify({'error': 'Fichier non trouvé'}), 404

@main_bp.route('/api/documents/<int:document_id>', methods=['DELETE'])
@login_required
def delete_document(document_id):
    """Delete document (security check for ownership)"""
    document = Document.query.get_or_404(document_id)
    
    # Check ownership
    if document.owner_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    try:
        # Delete physical file
        if os.path.exists(document.file_path):
            os.remove(document.file_path)
        
        # Delete database record
        db.session.delete(document)
        db.session.commit()
        
        return jsonify({'success': True, 'message': 'Document supprimé'})
        
    except Exception as e:
        current_app.logger.error(f"Delete error: {str(e)}")
        return jsonify({'success': False, 'message': 'Erreur lors de la suppression'})

@main_bp.route('/api/chatbot', methods=['POST'])
def chatbot_api():
    """AI Chatbot API with multilingual support"""
    data = request.get_json()
    message = data.get('message', '').strip()
    language = data.get('language', 'fr')
    
    if not message:
        return jsonify({'error': 'Message vide'}), 400
    
    # Simulate AI response based on language and content
    response = get_chatbot_response(message, language)
    
    return jsonify({
        'response': response,
        'language': language,
        'timestamp': datetime.now().isoformat()
    })

def get_chatbot_response(message, language):
    """Generate contextual responses based on message content and language"""
    message_lower = message.lower()
    
    # Define responses in different languages
    responses = {
        'fr': {
            'greeting': ["Bonjour ! Comment puis-je vous aider avec FoncierMap ?", 
                        "Salut ! Que puis-je faire pour vous ?"],
            'parcels': ["Pour voir vos parcelles, allez dans le tableau de bord ou la carte interactive.", 
                       "Vous pouvez rechercher des parcelles par référence ou adresse dans la barre de recherche."],
            'documents': ["Vous pouvez télécharger vos documents dans la section 'Mes Documents'.", 
                         "Les documents sont traités automatiquement par OCR pour extraire les informations."],
            'map': ["La carte interactive vous permet de visualiser toutes les parcelles.", 
                   "Utilisez les filtres pour trouver des parcelles par statut ou type."],
            'default': ["Je peux vous aider avec les parcelles, documents, et la navigation sur FoncierMap.", 
                       "Posez-moi des questions sur l'utilisation de la plateforme !"]
        },
        'fon': {
            'greeting': ["Koucou ! Nyè mè ná nyì wè FoncierMap tòn ?", 
                        "Gbé ! Nyè mè ná wá wè ?"],
            'parcels': ["Bò kpó mì parcelle lè, yì dashboard mè kpó carte interactive mè.", 
                       "Mì ná nyì parcelle kpo référence kpó adresse jí."],
            'documents': ["Mì ná upload mì document lè 'Mes Documents' mè.", 
                         "Document lè ná process automatiquement gbè OCR jí."],
            'default': ["Un nyì parcelle, document kpó navigation FoncierMap tòn kpó mì.", 
                       "Bía biá lè ná hwenu !"]
        },
        'yoruba': {
            'greeting': ["Bawo ! Bawo ni mo ṣe le ràn yín lówó pẹ̀lú FoncierMap ?", 
                        "Ẹ ku aaro ! Kini mo le ṣe fún yín ?"],
            'parcels': ["Láti wo àwọn parcelle yín, lọ sí dashboard tàbí carte interactive.", 
                       "Ẹ le wa àwọn parcelle nípa référence tàbí adresse."],
            'documents': ["Ẹ le upload àwọn document yín ní 'Mes Documents'.", 
                         "Àwọn document yín máa processed ní automatic pẹ̀lú OCR."],
            'default': ["Mo le ràn yín lówó pẹ̀lú parcelles, documents, àti navigation FoncierMap.", 
                       "Ẹ beèrè àwọn ìbéèrè nípa platform náà !"]
        }
    }
    
    lang_responses = responses.get(language, responses['fr'])
    
    # Simple keyword matching for response generation
    import random
    
    if any(word in message_lower for word in ['bonjour', 'salut', 'hello', 'hi', 'koucou', 'bawo']):
        return random.choice(lang_responses.get('greeting', lang_responses['default']))
    elif any(word in message_lower for word in ['parcelle', 'terrain', 'land', 'property']):
        return random.choice(lang_responses.get('parcels', lang_responses['default']))
    elif any(word in message_lower for word in ['document', 'fichier', 'file', 'titre']):
        return random.choice(lang_responses.get('documents', lang_responses['default']))
    elif any(word in message_lower for word in ['carte', 'map', 'localisation', 'location']):
        return random.choice(lang_responses.get('map', lang_responses['default']))
    else:
        return random.choice(lang_responses['default'])