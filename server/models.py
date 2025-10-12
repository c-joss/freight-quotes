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
