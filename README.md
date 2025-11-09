# Freight Quotes Application

A full-stack web application that enables sales and operations teams to create, view, and manage shipping quotes between ports.

Built to improve efficiency, rate accuracy, and customer response time within freight forwarding operations.

---

## Tech Stack

### Backend

- Flask + Flask-RESTful for the API
- SQLAlchemy ORM + Flask-Migrate for database management
- PostgreSQL (production) or SQLite (local development)
- Faker for seeding sample data

### Frontend

- React with Formik and Yup for forms and validation
- React Router for navigation
- Fetch API for backend communication
- Custom CSS (no UI frameworks)

---

## Login Details (from seed data)

Run the seeder once (python seed.py) and log in with any of the default users:

| Role | Email             | Password |
| ---- | ----------------- | -------- |
| User | alice@example.com | password |
| User | bob@example.com   | password |

---

## Example Use Cases

### Sales User

“I need to prepare a quick quote for a client shipping from Melbourne to Tokyo.”

1. Log in as alice@example.com.

2. Go to New Quote.

3. Select origin port Melbourne → Tokyo.

4. Choose container type 40HC.

5. Check applicable rates (shown from database).

6. Submit and review under Quotes List.

### Admin

“I need to add a new rate or container type to the system.”

1. Log in and open Admin Panel.

2. Use the Add Port, Add Port Pair, or Add Rate cards to update master data.

3. New data becomes immediately available in the quote creation form.

### Sales User

“A quote was accepted and now we need to send a booking request to booking team.”

1. Go to Quotes List.

2. When status = Accepted, click Request Booking.
   → This opens your email client with a prefilled message to booking@freight-quotes.com.

---

## User Stories

| As a…      | I want to…                                      | So that I can…                             |
| ---------- | ----------------------------------------------- | ------------------------------------------ |
| Sales user | Create quotes between specific ports            | Quickly provide rates to customers         |
| Sales user | Filter available rates by container type        | Select only valid pricing options          |
| Admin      | Add or update ports, container types, and rates | Keep rate data accurate and up to date     |
| Sales user | Request booking once quote accepted             | Initiate shipping workflow easily          |
| Admin      | Create new users                                | Allow more team members to access the tool |

---

## Features

### Quotes

- View your shipping quotes.
- Create new quotes with:
  - Company name
  - Port pair (origin → destination)
  - Container type
  - Rate selection (checkbox list)
- Submit to backend via `POST /quotes`

### Rates

- Dynamically filters available rates based on port pair and container type.
- Displays rate list with checkboxes aligned left for clarity.

### Booking Request

- On the Quotes list, when a quote’s status is Accepted, a Request Booking button appears and opens a pre-filled email to `booking@freight-quotes.com`.

### Authentication

- Users can log in, and log out securely.
- Only logged-in admins can create new users through the Admin dashboard (`POST /admin/users`).
- Session-based authentication stored in Flask session.

### Admin Tools

- Manage master data: Ports, Port Pairs, Container Types, Rates and Users.

---

## Database Models

- User → handles authentication
- Port → defines available port locations
- PortPair → links origin and destination
- ContainerType → e.g., 20GP, 40HC
- Rate → base rate and transit time for each pair/type
- Quote → stores quote details and owner
- QuoteRate → join table connecting quotes and rates

---

## Setup Instructions

1. Clone & Navigate

```bash
git clone https://github.com/your-username/freight-quotes.git
cd freight-quotes
```

2. Backend Setup

```bash
cd server
pipenv install
pipenv shell
flask db upgrade
python seed.py
flask run
```

Runs API at http://127.0.0.1:5555

3. Frontend Setup

```bash
cd client
npm install
npm start
```

Runs frontend at http://localhost:4000

React runs on http://localhost:4000
and proxies requests to Flask on http://127.0.0.1:5555
.

---

## API Endpoints

| **Method** | **Endpoint**     | **Description**                                  |
| ---------- | ---------------- | ------------------------------------------------ |
| POST       | /auth/signup     | Register new user                                |
| POST       | /auth/login      | Log in                                           |
| DELETE     | /auth/logout     | Log out                                          |
| GET        | /ports           | Get all ports                                    |
| GET        | /port_pairs      | Get all origin→destination pairs                 |
| GET        | /container_types | List container types                             |
| GET        | /rates           | Get rates by port pair / container type          |
| POST       | /rates           | Add new rate                                     |
| GET        | /quotes          | List user’s quotes                               |
| POST       | /quotes          | Create new quote                                 |
| PATCH      | /quotes/:id      | Update title or status                           |
| DELETE     | /quotes/:id      | Delete quote                                     |
| POST       | /admin/users     | Admin: add new user (without switching sessions) |

---

## Example Workflow

1. Login with seeded credentials.
2. Create Quote: select company name, port pair, container type, and rates.
3. View Quotes: see your submitted quotes.
4. Admin: manage ports, port pairs, containers, and rates.
5. Booking: accepted quotes can trigger an email draft to operations.

---

## Future Enhancements

- Automated booking email endpoint
- Quote PDF export
- Role-based access control
- Extended quote statuses (Pending, Declined, Completed)
- Analytics dashboard for quote activity
