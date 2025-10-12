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
