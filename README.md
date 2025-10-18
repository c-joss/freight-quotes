# Freight Quotes Application

A full-stack web application that allows users to create, view, and manage shipping quotes between ports. Designed for internal use by sales and operations teams to improve rate accuracy, efficiency, and tracking.

---

## Tech Stack

### Backend

- Flask + Flask-RESTful
- SQLAlchemy ORM with Flask-Migrate
- PostgreSQL (or SQLite for local development)
- Faker for database seeding

### Frontend

- React with Formik for forms and validation
- React Router for navigation
- Fetch API for backend communication
- Custom CSS (no external UI library)

---

## Features

### Quotes

- View all shipping quotes.
- Create new quotes with:
  - Company name
  - Port pair (origin → destination)
  - Container type
  - Rate selection (checkbox list)
- Submit to backend via /quotes API.

### Rates

- Dynamically filters available rates based on port pair and container type.
- Displays rate list with checkboxes aligned left for clarity.

### Booking Request

- On the Quotes List Page, if a quote’s status is “Accepted”, a
  “Request Booking” button appears next to it.
  Clicking it generates an email to booking@freight-quotes.com
  with pre-filled subject and quote details.

### Authentication

- Users can sign up, log in, and log out securely.
- Session-based authentication stored in Flask session.

### Admin Tools

- Edit quote title or status (“Accepted” / “Confirmed”)
- Delete quote records directly from the detail view.

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

3. Frontend Setup

```bash
cd client
npm install
npm start
```

React runs on http://localhost:4000
and proxies requests to Flask on http://127.0.0.1:5555
.

---

## API Endpoints

| **Method** | **Endpoint**                              | **Description**               |
| ---------- | ----------------------------------------- | ----------------------------- |
| POST       | `/signup`                                 | Create a new user             |
| POST       | `/login`                                  | Log in user                   |
| DELETE     | `/logout`                                 | Log out user                  |
| GET        | `/ports`                                  | List all ports                |
| GET        | `/port_pairs`                             | List origin–destination pairs |
| GET        | `/container_types`                        | List available containers     |
| GET        | `/rates?port_pair_id=&container_type_id=` | Fetch matching rates          |
| GET        | `/quotes`                                 | List all quotes               |
| POST       | `/quotes`                                 | Create a new quote            |
| GET        | `/quotes/:id`                             | Get single quote              |
| PATCH      | `/quotes/:id`                             | Edit quote title/status       |
| DELETE     | `/quotes/:id`                             | Delete quote                  |

---

## Styling Notes

Key color variables are defined in styles.css:

```css
--rose: #b8336a;
--ultra-violet: #726da8;
--non-photo-blue: #a0d2db;
--wisteria: #c490d1;
```

Rate list styling:

```css
.rate-list {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}
.rate-item {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: flex-start;
}
```

---

## Example Workflow

1. Log in or sign up.
2. Click New Quote → enter company, port pair, and container.
3. Select applicable rates (checkboxes).
4. Submit → redirects to Quotes page.
5. When status = Accepted, click Request Booking → opens mail client.

---

## Future Enhancements

- Email booking automation via backend endpoint
- Export quotes as PDF
- Add “declined” and “pending” statuses
- Role-based access control

---

## Developer

Courtney Macgregor

Software Engineer (Leeward Group Pty Ltd)
Focused on automating freight quoting and booking workflows using modern web technologies.
