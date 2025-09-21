from flask import Blueprint, request, jsonify, current_app
from flask_login import login_required, current_user
from datetime import datetime
import os
import random
import time
from werkzeug.utils import secure_filename
from app import db
from app.models import User, Parcel, Document, Transaction

api_bp = Blueprint('api', __name__)

def allowed_file(filename):
    """Check if file extension is allowed"""
    ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg', 'gif', 'doc', 'docx'}
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@api_bp.route('/upload-document', methods=['POST'])
@login_required
def upload_document():
    """Handle document upload with OCR simulation"""
    if 'file' not in request.files:
        return jsonify({'error': 'Aucun fichier sélectionné'}), 400
    
    file = request.files['file']
    parcel_id = request.form.get('parcel_id')
    document_type = request.form.get('document_type')
    
    if file.filename == '':
        return jsonify({'error': 'Aucun fichier sélectionné'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'error': 'Type de fichier non autorisé'}), 400
    
    if not parcel_id or not document_type:
        return jsonify({'error': 'Informations manquantes'}), 400
    
    # Verify parcel belongs to user
    parcel = Parcel.query.filter_by(id=parcel_id, owner_id=current_user.id).first()
    if not parcel:
        return jsonify({'error': 'Parcelle non trouvée'}), 404
    
    # Save file
    filename = secure_filename(file.filename or 'document')
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    filename = f"{timestamp}_{filename}"
    file_path = os.path.join('uploads', filename)
    
    # Ensure upload directory exists
    os.makedirs('uploads', exist_ok=True)
    file.save(file_path)
    
    # Create document record
    document = Document()
    document.parcel_id = int(parcel_id)
    document.user_id = current_user.id
    document.document_type = document_type
    document.filename = filename
    document.file_path = file_path
    document.file_size = os.path.getsize(file_path)
    document.ocr_status = 'En attente'
    
    db.session.add(document)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Document uploadé avec succès',
        'document_id': document.id
    })

@api_bp.route('/process-document/<int:doc_id>')
@login_required
def process_document(doc_id):
    """Simulate OCR processing of a document"""
    document = Document.query.filter_by(id=doc_id, user_id=current_user.id).first()
    if not document:
        return jsonify({'error': 'Document non trouvé'}), 404
    
    if document.ocr_status != 'En attente':
        return jsonify({'error': 'Document déjà traité'}), 400
    
    # Update status to processing
    document.ocr_status = 'En cours'
    db.session.commit()
    
    # Simulate processing time (3-5 seconds)
    time.sleep(random.randint(3, 5))
    
    # Simulate OCR results (random compliance)
    is_compliant = random.choice([True, True, False])  # 2/3 chance of compliance
    
    document.ocr_status = 'Traité'
    document.is_compliant = is_compliant
    document.processed_date = datetime.utcnow()
    
    if is_compliant:
        document.compliance_notes = 'Document validé avec succès. Toutes les informations requises sont présentes et lisibles.'
        # Update parcel status if all documents are compliant
        parcel = document.parcel
        if all(doc.is_compliant for doc in parcel.documents if doc.ocr_status == 'Traité'):
            parcel.status = 'Vérifié'
    else:
        document.compliance_notes = 'Document non conforme. Veuillez vérifier la qualité de l\'image et la lisibilité des informations.'
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'status': document.ocr_status,
        'is_compliant': document.is_compliant,
        'notes': document.compliance_notes
    })

@api_bp.route('/chatbot', methods=['POST'])
def chatbot_query():
    """Handle chatbot queries with predefined responses"""
    data = request.get_json()
    query = data.get('message', '').lower().strip()
    language = data.get('language', 'fr')
    
    # Predefined responses
    responses = {
        'fr': {
            'enregistrer parcelle': 'Pour enregistrer votre parcelle :\n1. Connectez-vous à votre compte\n2. Allez dans "Tableau de Bord"\n3. Cliquez sur "Ajouter une parcelle"\n4. Remplissez les informations demandées\n5. Uploadez vos documents justificatifs',
            'titre foncier': 'Un titre foncier est un document officiel qui atteste de votre droit de propriété sur un terrain. Il contient :\n- L\'identité du propriétaire\n- La description de la parcelle\n- Les limites et la superficie\n- L\'historique des transactions',
            'documents nécessaires': 'Les documents requis sont :\n- Titre foncier ou certificat de vente\n- Carte d\'identité du propriétaire\n- Plan de bornage\n- Reçu de paiement des taxes foncières',
            'statut parcelle': 'Les statuts possibles sont :\n🟢 Vérifié : Tous vos documents sont conformes\n🟡 En cours : Vérification en cours\n🔴 Non conforme : Documents à corriger',
            'blockchain': 'Notre système utilise une technologie similaire à la blockchain pour assurer la traçabilité des transactions. Chaque transfert de propriété est enregistré de manière sécurisée et inviolable.',
            'default': 'Je suis là pour vous aider avec FoncierMap ! Posez-moi des questions sur :\n- L\'enregistrement de parcelles\n- Les documents nécessaires\n- Le statut de vos parcelles\n- Les titres fonciers'
        },
        'fon': {
            'default': 'Mi wa do alɔ mi FoncierMap ji ! (Je suis là pour vous aider avec FoncierMap !)'
        },
        'yoruba': {
            'default': 'Mo wa lati ran yin lowo pelu FoncierMap! (Je suis là pour vous aider avec FoncierMap !)'
        }
    }
    
    # Find best matching response
    response = responses[language].get('default')
    
    if language == 'fr':
        for key, value in responses['fr'].items():
            if key in query:
                response = value
                break
    
    return jsonify({
        'response': response,
        'timestamp': datetime.now().isoformat()
    })

@api_bp.route('/parcels/geojson')
def parcels_geojson():
    """Return all parcels as GeoJSON for map display"""
    parcels = Parcel.query.all()
    
    features = []
    for parcel in parcels:
        if parcel.geometry:
            feature = {
                'type': 'Feature',
                'properties': {
                    'id': parcel.id,
                    'parcel_id': parcel.parcel_id_unique,
                    'status': parcel.status,
                    'status_color': parcel.status_color,
                    'address': parcel.address,
                    'owner_name': parcel.owner.full_name if current_user.is_authenticated else 'Propriétaire privé',
                    'area': parcel.area_sqm,
                    'land_use': parcel.land_use
                },
                'geometry': parcel.geometry
            }
            features.append(feature)
    
    return jsonify({
        'type': 'FeatureCollection',
        'features': features
    })