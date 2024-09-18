# Redirection Panel

### About

This repository is dedicated to my project for a panel used to manage URL redirects. The primary functionality of the system is to receive a specified URL and then redirect the user to the appropriate address, enabling the creation of easy-to-remember, simple, and readable links. The system also includes a JWT-secured panel that allows for the creation of new links, deletion of old ones, updating existing links, and monitoring link-related statistics. The project was developed using the NestJS backend framework, and the frontend was built with Angular. The goal of the project is to practice implementing the most popular technologies in a practical application.

---

### Tech Stack

- **Angular 17:** (A modern front-end framework for building dynamic, single-page web applications using TypeScript)
- **NestJS:** (A scalable Node.js framework for building server-side applications)
- **Express:** (A minimalistic and flexible Node.js web application framework for building APIs and web applications.)
- **TypeOrm:** (An ORM for TypeScript and JavaScript that supports various databases, providing tools for object-relational mapping.)
- **MySql:** (A widely-used open-source relational database management system known for its reliability and scalability.)
- **JWT:** (JSON Web Token, a compact and secure method for transmitting information between parties, often used for authentication.)

### Features

#### Backend

- The backend handles all redirections.
- The backend logs every step, including each request and its handling duration, in the logs table.
- There's a database CRUD controller that identifies endpoints and responds with data based on what it finds.
- Verification is done using JSON Web Tokens (JWT).
- Two levels of authentication guards: one checks if you're signed in to manage personal settings, and the other checks if you're authorized to manage the system.
- Passwords are securely stored using salted hashing, with an abstraction function for comparison.
- Verification emails are sent with two validation options: clicking a link or entering a code.

#### Frontend

- Users can register, change their password, verify their account via email, or delete their account. There's an option to set or remove a profile picture. You can also modify your own permissions (if the "canManage" setting is enabled for demo purposes).
- Logs can be displayed or filtered by date and status, and there's an option to download all logs as CSV or JSON.
- Logs are displayed with infinite scrolling.
- Routing is permission-based and secured: only admins can view logs and members or modify permissions.
- Users are protected from losing input data through a CanDeactivateGuard on every form or edit form.
- Users can view redirections, see the total number of clicks, and modify or delete them (if permitted). A panel for creating new redirections is visible only to users with the necessary permissions.

### Database

##### codes

1. id (int(11))
2. code (text)
3. userId (int(11))
4. timestamp (timestamp)
5. status (tinyint(1))
6. expireDate (bigint(20))
7. email (text)
8. jstimestamp (bigint(20))

---

##### logs

1. id (int(11))
2. label (text)
3. description (text)
4. status (text)
5. duration (int(11))
6. timestamp (timestamp)
7. jstimestamp (bigint(20))

---

##### redirections

1. id (int(11))
2. targetUrl (text)
3. route (text)
4. creationTime (timestamp)
5. userId (int(11))
6. category (text)
7. jstimestamp (bigint(20))

---

##### requests

1. id (int(11))
2. redirectionId (int(11))
3. requestIp (int(11))
4. requestTime (timestamp)
5. jstimestamp (bigint(20))

---

##### users

1. id (int(11))
2. login (text)
3. password (text)
4. canDelete (tinyint(1))
5. canUpdate (tinyint(1))
6. canCreate (tinyint(1))
7. canManage (tinyint(1))
8. creationTime (timestamp)
9. email (text)
10. emailSent (tinyint(1))
11. jstimestamp (bigint(20))

### Installation

Clone the repository

```bash
git clone https://github.com/Mathsqrt2/RedirectionPanel.git

```

Create an .env file in backend folder and add the following variables

```bash
PORT=

DBHOST=
DBUSERNAME=
DBPASSWORD=
DATABASE=

ORIGIN1=
ORIGIN2=

SECRET=
SMTP_SERVICE=
SMTP_HOST=
SMTP_PORT=
SMTP_SECURE=
SMTP_PASS=
SMTP_USER=

```

Then run the panel

```bash
cd redirectionpanel
npm run launch
npm run frontend
npm run backend
```
