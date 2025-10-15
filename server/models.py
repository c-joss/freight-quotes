from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.orm import validates, relationship
from sqlalchemy import UniqueConstraint
from flask_bcrypt import Bcrypt
from .config import db

bcrypt = Bcrypt()

# Models go here!
class Port(db.Model, SerializerMixin):
    __tablename__ = 'ports'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    code = db.Column(db.String, nullable=False)

    origin_pairs = relationship(
        "PortPair",
        back_populates="origin_port",
        foreign_keys="PortPair.origin_port_id",
    )
    dest_pairs = relationship(
        "PortPair",
        back_populates="destination_port",
        foreign_keys="PortPair.destination_port_id",
    )
    serialize_rules = ('-origin_pairs', '-dest_pairs',)

    @validates('code')
    def validate_code(self, key, val):
        assert val and len(val) == 5 and val.isupper()
        return val
    
class ContainerType(db.Model, SerializerMixin):
    __tablename__ = 'container_types'

    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String, unique=True, nullable=False)
    description = db.Column(db.String, nullable=True)

    rates = relationship(
        "Rate",
        back_populates="container_type",
        cascade="all, delete-orphan",
    )
    serialize_rules = ('-rates',)

class PortPair(db.Model, SerializerMixin):
    __tablename__ = 'port_pairs'
    serialize_rules = ('-rates.port_pair',)

    id = db.Column(db.Integer, primary_key=True)
    origin_port_id = db.Column(db.Integer, db.ForeignKey('ports.id'), nullable=False)
    destination_port_id = db.Column(db.Integer, db.ForeignKey('ports.id'), nullable=False)

    origin_port = relationship(
        "Port",
        foreign_keys=[origin_port_id],
        back_populates="origin_pairs",
    )
    destination_port = relationship(
        "Port",
        foreign_keys=[destination_port_id],
        back_populates="dest_pairs",
    )

    rates = relationship(
        "Rate",
        back_populates="port_pair",
        cascade="all, delete-orphan",
    )

    __table_args__ = (
        UniqueConstraint('origin_port_id', 'destination_port_id', name='uniq_pair'),
    )

class Rate(db.Model, SerializerMixin):
    __tablename__ = 'rates'
    serialize_rules = (
        '-port_pair.rates',
        '-container_type.rates',
        '-quote_rates',
    )

    id = db.Column(db.Integer, primary_key=True)
    port_pair_id = db.Column(db.Integer, db.ForeignKey('port_pairs.id'), nullable=False)
    container_type_id = db.Column(db.Integer, db.ForeignKey('container_types.id'), nullable=False)
    base_rate = db.Column(db.Float, nullable=False, default=0.0)
    transit_days = db.Column(db.Integer, nullable=True)

    port_pair = relationship("PortPair", back_populates="rates")
    container_type = relationship("ContainerType", back_populates="rates")

    quote_rates = relationship(
        "QuoteRate",
        back_populates="rate",
        cascade="all, delete-orphan",
)
    
class User(db.Model, SerializerMixin):
    __tablename__ = 'users'
    serialize_rules = ('-password_hash', '-quotes.user',)

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String, unique=True, nullable=False)
    password_hash = db.Column(db.String, nullable=False)

    quotes = relationship(
        "Quote",
        back_populates="user",
        cascade="all, delete-orphan",
    )

    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)
    
class Quote(db.Model, SerializerMixin):
    __tablename__ = 'quotes'
    serialize_rules = ('-user.quotes', '-quote_rates.quote',)

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String, nullable=False)
    status = db.Column(db.String, nullable=False, default='draft')
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    user = relationship("User", back_populates="quotes")

    quote_rates = relationship(
        "QuoteRate",
        back_populates="quote",
        cascade="all, delete-orphan",
    )

    @property
    def rates(self):
        return [qr.rate for qr in self.quote_rates]
    
class QuoteRate(db.Model, SerializerMixin):
    __tablename__ = 'quote_rates'

    id = db.Column(db.Integer, primary_key=True)
    quote_id = db.Column(db.Integer, db.ForeignKey('quotes.id'), nullable=False)
    rate_id = db.Column(db.Integer, db.ForeignKey('rates.id'), nullable=False)

    quote = relationship("Quote", back_populates="quote_rates")
    rate = relationship("Rate", back_populates="quote_rates")

    __table_args__ = (
        UniqueConstraint('quote_id', 'rate_id', name='uniq_quote_rate'),
    )

        

