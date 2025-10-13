#!/usr/bin/env python3

# Standard library imports
from random import randint, choice as rc

# Remote library imports
from faker import Faker

# Local imports
from .config import app, db
from .models import User, Port, PortPair, ContainerType, Rate

if __name__ == '__main__':
    fake = Faker()
    print("Starting seed...")
    # Seed code goes here!

    with app.app_context():
        db.drop_all()
        db.create_all()

        alice = User(email="alice@example.com"); alice.set_password("password")
        bob = User(email="bob@example.com"); bob.set_password("password")
        db.session.add_all([alice, bob])

        mel = Port(name="Melbourne", code="AUMEL")
        syd = Port(name="Sydney", code="AUSYD")
        tyo = Port(name="Tokyo", code="JPTYO")
        db.session.add_all([mel, syd, tyo])
        db.session.flush()

        pp1 = PortPair(origin_port_id=mel.id, destination_port_id=tyo.id)
        pp2 = PortPair(origin_port_id=syd.id, destination_port_id=tyo.id)
        db.session.add_all([pp1, pp2])
        db.session.flush()
