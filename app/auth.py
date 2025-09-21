from flask import Blueprint, render_template, request, flash, redirect, url_for
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash
from urllib.parse import urlparse
from app import db, login_manager
from app.models import User
from app.forms import LoginForm, RegisterForm

auth_bp = Blueprint('auth', __name__)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('main.dashboard'))
    
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(email=form.email.data.lower() if form.email.data else '').first()
        
        if user and user.check_password(form.password.data):
            login_user(user, remember=form.remember_me.data)
            next_page = request.args.get('next')
            # Validate next parameter for security (prevent open redirects)
            if not next_page or urlparse(next_page).netloc != '' or not next_page.startswith('/'):
                next_page = url_for('main.dashboard')
            flash('Connexion réussie !', 'success')
            return redirect(next_page)
        else:
            flash('Email ou mot de passe incorrect.', 'error')
    
    return render_template('auth/login.html', title='Connexion', form=form)

@auth_bp.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('main.dashboard'))
    
    form = RegisterForm()
    if form.validate_on_submit():
        # Check if user already exists
        existing_user = User.query.filter_by(email=form.email.data.lower() if form.email.data else '').first()
        if existing_user:
            flash('Un compte avec cette adresse email existe déjà.', 'error')
            return render_template('auth/register.html', title='Inscription', form=form)
        
        # Create new user
        user = User()
        user.full_name = form.full_name.data or ''
        user.email = form.email.data.lower() if form.email.data else ''
        user.phone_number = form.phone_number.data
        user.set_password(form.password.data)
        
        db.session.add(user)
        db.session.commit()
        
        flash('Inscription réussie ! Vous pouvez maintenant vous connecter.', 'success')
        return redirect(url_for('auth.login'))
    
    return render_template('auth/register.html', title='Inscription', form=form)

@auth_bp.route('/logout')
@login_required
def logout():
    logout_user()
    flash('Vous êtes maintenant déconnecté.', 'info')
    return redirect(url_for('main.index'))