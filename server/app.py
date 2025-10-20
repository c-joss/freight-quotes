#!/usr/bin/env python3

# Standard library imports

# Remote library imports
from flask import request, session
from flask_restful import Resource

try:
    from .config import app, db, api
    from .models import User, Port, PortPair, ContainerType, Rate, Quote, QuoteRate
except ImportError:
    from config import app, db, api
    from models import User, Port, PortPair, ContainerType, Rate, Quote, QuoteRate

with app.app_context():
    db.create_all()

def current_user():
    uid = session.get('user_id')
    return User.query.get(uid) if uid else None

def current_user_id():
    u = current_user()
    return u.id if u else None

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
        data = request.get_json() or {}
        u = User.query.filter_by(email=data.get('email')).first()
        if not u or not u.check_password(data.get('password')):
            return {"error": "invalid login"}, 401
        session['user_id'] = u.id
        return u.to_dict(), 200
    
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
        return [p.to_dict(rules=('-origin_pairs', '-dest_pairs')) for p in Port.query.all()], 200

    def post(self):
        if not current_user_id():
            return {"error": "Unauthorized"}, 401
        data = request.get_json() or {}
        name = (data.get("name") or "").strip()
        code = (data.get("code") or "").strip().upper()
        if not name or not code:
            return {"error": "name and code are required"}, 400
        if Port.query.filter_by(code=code).first():
            return {"error": "code already exists"}, 409
        p = Port(name=name, code=code)
        db.session.add(p)
        db.session.commit()
        return p.to_dict(), 201
    
class PortPairs(Resource):
    def get(self):
        pps = PortPair.query.all()
        return [pp.to_dict(rules=('-rates',)) for pp in pps], 200

    def post(self):
        if not current_user_id():
            return {"error": "Unauthorized"}, 401
        data = request.get_json() or {}
        try:
            origin_id = int(data.get("origin_port_id"))
            dest_id = int(data.get("destination_port_id"))
        except (TypeError, ValueError):
            return {"error": "origin_port_id and destination_port_id must be integers"}, 400
        if origin_id == dest_id:
            return {"error": "origin and destination cannot be the same"}, 400
        if not Port.query.get(origin_id) or not Port.query.get(dest_id):
            return {"error": "invalid port id(s)"}, 400
        pp = PortPair(origin_port_id=origin_id, destination_port_id=dest_id)
        db.session.add(pp)
        db.session.commit()
        return pp.to_dict(), 201

class ContainerTypes(Resource):
    def get(self):
        cts = ContainerType.query.all()
        return [ct.to_dict(rules=('-rates',)) for ct in cts], 200

    def post(self):
        if not current_user_id():
            return {"error": "Unauthorized"}, 401
        data = request.get_json() or {}
        code = (data.get("code") or "").strip().upper()
        description = (data.get("description") or "").strip() or None
        if not code:
            return {"error": "code is required"}, 400
        if ContainerType.query.filter_by(code=code).first():
            return {"error": "code already exists"}, 409
        ct = ContainerType(code=code, description=description)
        db.session.add(ct)
        db.session.commit()
        return ct.to_dict(), 201
    
class Rates(Resource):
    def get(self):
        q = Rate.query

        ppid = request.args.get("port_pair_id")
        ctid = request.args.get("container_type_id")

        try:
            if ppid is not None:
                q = q.filter(Rate.port_pair_id == int(ppid))
            if ctid is not None:
                q = q.filter(Rate.container_type_id == int(ctid))
        except ValueError:
            return {"error": "port_pair_id and container_type_id must be integers"}, 400

        rates = q.order_by(Rate.base_rate.asc()).all()
        return [r.to_dict(rules=('port_pair','container_type')) for r in rates], 200
    
class Quotes(Resource):
    def get(self):
        user = current_user()
        if not user:
            return {"error": "Unauthorized"}, 401
        return [q.to_dict() for q in Quote.query.filter_by(user_id=user.id).all()], 200

    def post(self):
        user = current_user()
        if not user:
            return {"error": "login required"}, 401

        data = request.get_json() or {}
        title = (data.get("title") or "").strip()
        raw_rate_ids = data.get("rate_ids") or []

        if not title:
             return {"error": "title required"}, 400
        if not isinstance(raw_rate_ids, list) or len(raw_rate_ids) == 0:
            return {"error": "rate_ids must be a non-empty list"}, 400

        try:
            rate_ids = [int(x) for x in raw_rate_ids]
        except (TypeError, ValueError):
            return {"error": "rate_ids must be integers"}, 400

        rates = Rate.query.filter(Rate.id.in_(rate_ids)).all()
        if len(rates) != len(set(rate_ids)):
            return {"error": "one or more rates not found"}, 400

        try:
            q = Quote(title=title, status="Confirmed", user_id=user.id)
            db.session.add(q)
            db.session.flush()

            for r in rates:
                db.session.add(QuoteRate(quote_id=q.id, rate_id=r.id))

            db.session.commit()
        except Exception as e:
            db.session.rollback()
            return {"error": "server failed to create quote"}, 500

        return {
            "id": q.id,
            "title": q.title,
            "status": q.status,
            "user_id": q.user_id,
        }, 201
    
class QuoteDetail(Resource):
    def get(self, qid):
        user = current_user()
        if not user:
            return {"error": "Unauthorized"}, 401
        q = Quote.query.get_or_404(qid)
        if q.user_id != user.id:
            return {"error": "Forbidden"}, 403
        return q.to_dict(rules=('rates',)), 200

    def patch(self, qid):
        q = Quote.query.get_or_404(qid)
        if not require_owner(q.user_id):
            return {"error": "forbidden"}, 403

        data = request.get_json() or {}
        if 'title' in data:
            q.title = data['title'] or q.title
        if 'status' in data:
            q.status = data['status']
        if 'rate_ids' in data:
            QuoteRate.query.filter_by(quote_id=q.id).delete()
            for rid in data['rate_ids']:
                db.session.add(QuoteRate(quote_id=q.id, rate_id=int(rid)))

        db.session.commit()
        return q.to_dict(rules=('rates',)), 200

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

