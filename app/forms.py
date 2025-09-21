from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, BooleanField, SubmitField, TextAreaField, SelectField
from wtforms.validators import DataRequired, Email, EqualTo, Length, ValidationError
from app.models import User

class LoginForm(FlaskForm):
    email = StringField('Email', validators=[DataRequired(), Email()], 
                       render_kw={'placeholder': 'votre@email.com'})
    password = PasswordField('Mot de passe', validators=[DataRequired()],
                            render_kw={'placeholder': 'Votre mot de passe'})
    remember_me = BooleanField('Se souvenir de moi')
    submit = SubmitField('Se connecter')

class RegisterForm(FlaskForm):
    full_name = StringField('Nom complet', validators=[DataRequired(), Length(min=2, max=120)],
                           render_kw={'placeholder': 'Votre nom complet'})
    email = StringField('Email', validators=[DataRequired(), Email()],
                       render_kw={'placeholder': 'votre@email.com'})
    phone_number = StringField('Numéro de téléphone', validators=[Length(max=20)],
                              render_kw={'placeholder': '+229 XX XX XX XX'})
    password = PasswordField('Mot de passe', validators=[DataRequired(), Length(min=6)],
                            render_kw={'placeholder': 'Minimum 6 caractères'})
    password2 = PasswordField('Confirmer le mot de passe', 
                             validators=[DataRequired(), EqualTo('password')],
                             render_kw={'placeholder': 'Répétez le mot de passe'})
    submit = SubmitField('S\'inscrire')
    
    def validate_email(self, email):
        user = User.query.filter_by(email=email.data.lower()).first()
        if user:
            raise ValidationError('Cette adresse email est déjà utilisée.')
    
    def validate_phone_number(self, phone_number):
        if phone_number.data:
            user = User.query.filter_by(phone_number=phone_number.data).first()
            if user:
                raise ValidationError('Ce numéro de téléphone est déjà utilisé.')

class ProfileForm(FlaskForm):
    full_name = StringField('Nom complet', validators=[DataRequired(), Length(min=2, max=120)])
    phone_number = StringField('Numéro de téléphone', validators=[Length(max=20)])
    submit = SubmitField('Mettre à jour')

class ParcelForm(FlaskForm):
    parcel_id_unique = StringField('Numéro de parcelle', validators=[DataRequired(), Length(max=50)])
    address = TextAreaField('Adresse complète', validators=[DataRequired()])
    area_sqm = StringField('Superficie (m²)', validators=[DataRequired()])
    land_use = SelectField('Usage du terrain', 
                          choices=[('Résidentiel', 'Résidentiel'), 
                                  ('Commercial', 'Commercial'),
                                  ('Agricole', 'Agricole'),
                                  ('Industriel', 'Industriel'),
                                  ('Autre', 'Autre')])
    submit = SubmitField('Enregistrer la parcelle')