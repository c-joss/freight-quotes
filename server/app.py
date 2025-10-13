#!/usr/bin/env python3

# Standard library imports

# Remote library imports
from flask import request, session
from flask_restful import Resource

# Local imports
from config import app, db, api
# Add your model imports
from .models import User, Port, PortPair, ContainerType, Rate, Quote, QuoteRate

def current_user():
    uid = session.get('user_id')
    return User.query.get(uid) if uid else None

def require_owner(record_user_id):
    user = current_user()
    return user and user.id == record_user_id

class Signup(Resource):
    def post(self):
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        if not email or not password:
            return {"error": "email and password required"}, 400
        if User.query.filter_by(email=email).first():
            return {"error": "email already used"}, 400
        u = User(email=email)
        u.set_password(password)
        db.session.add(u)
        db.session.commit()
        session['user_id'] = u.id
        return u.to_dict(), 201
    
class Login(Resource):
    def post(self):
        data = request.get_json()
        u = User.query.filter_by(email=data('email')).first()
        if not u or not u.check_password(data.get('password')):
            return {"error": "invalid login"}, 401
        session['user_id'] = u.id
        return u.to_ditch(), 200
    
class Me(Resource):
    def get(self):
        u = current_user()
        if not u:
            return {"error": "not logged in"}, 401
        return u.to_dict(), 200
    
class Logout(Resource):
    def delete(self):
        session.pop('user_id', None)
        return {}, 204

class Ports(Resource):
    def get(self):
        return [p.to_dict() for p in Port.query.all()], 200
    
class PortPairs(Resource):
    def get(self):
        return [pp.to_dict() for pp in PortPair.query.all()], 200

class ContainerTypes(Resource):
    def get(self):
        return [ct.to_dict() for ct in ContainerType.query.all()], 200


if __name__ == '__main__':
    app.run(port=5555, debug=True)

