#!/usr/bin/env python3

# Standard library imports

# Remote library imports
from flask import request, session
from flask_restful import Resource

# Local imports
from .config import app, db, api
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
    
class Rates(Resource):
    def get(self):
        q = Rate.query
        pp_id = request.args.get('port_pair_id')
        ct_id = request.args.get('container_type_id')
        if pp_id:
            q = q.filter_by(port_pair_id=pp_id)
        if ct_id:
            q = q.filter_by(container_type_id=ct_id)
        return [r.to_dict(rules=('-quote_rates',)) for r in q.all()], 200
    
class Quotes(Resource):
    def get(self):
        return [q.to_dict() for q in Quote.query.all()], 200

    def post(self):
        user = current_user()
        if not user:
            return {"error": "login required"}, 401

        data = request.get_json()
        title = data.get('title')
        rate_ids = data.get('rate_ids', [])
        if not title or not rate_ids:
            return {"error": "title and rate_ids required"}, 400

        q = Quote(title=title, status='draft', user_id=user.id)
        db.session.add(q)
        db.session.flush()

        for rid in rate_ids:
            db.session.add(QuoteRate(quote_id=q.id, rate_id=rid))

        db.session.commit()
        return q.to_dict(), 201
    
class QuoteDetail(Resource):
    def get(self, qid):
        q = Quote.query.get_or_404(qid)
        return q.to_dict(), 200

    def patch(self, qid):
        q = Quote.query.get_or_404(qid)
        if not require_owner(q.user_id):
            return {"error": "forbidden"}, 403

        data = request.get_json()
        if 'title' in data:
            q.title = data['title'] or q.title
        if 'status' in data:
            q.status = data['status']
        if 'rate_ids' in data:
            QuoteRate.query.filter_by(quote_id=q.id).delete()
            for rid in data['rate_ids']:
                db.session.add(QuoteRate(quote_id=q.id, rate_id=rid))

        db.session.commit()
        return q.to_dict(), 200

    def delete(self, qid):
        q = Quote.query.get_or_404(qid)
        if not require_owner(q.user_id):
            return {"error": "forbidden"}, 403
        db.session.delete(q)
        db.session.commit()
        return {}, 204
    
api.add_resource(Signup, '/auth/signup')
api.add_resource(Login,  '/auth/login')
api.add_resource(Me,     '/auth/me')
api.add_resource(Logout, '/auth/logout')

api.add_resource(Ports, '/ports')
api.add_resource(PortPairs, '/port_pairs')
api.add_resource(ContainerTypes, '/container_types')
api.add_resource(Rates, '/rates')

api.add_resource(Quotes, '/quotes')
api.add_resource(QuoteDetail, '/quotes/<int:qid>')


if __name__ == '__main__':
    app.run(port=5555, debug=True)

