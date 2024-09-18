# Redirection Panel

### About

This repository is dedicated to my project for a panel used to manage URL redirects. The primary functionality of the system is to receive a specified URL and then redirect the user to the appropriate address, enabling the creation of easy-to-remember, simple, and readable links. The system also includes a JWT-secured panel that allows for the creation of new links, deletion of old ones, updating existing links, and monitoring link-related statistics. The project was developed using the NestJS backend framework, and the frontend was built with Angular. The goal of the project is to practice implementing the most popular technologies in a practical application.

---

### Tech Stack

- Angular 17 (A modern front-end framework for building dynamic, single-page web applications using TypeScript)
- NestJS (A scalable Node.js framework for building server-side applications)
- Express (A minimalistic and flexible Node.js web application framework for building APIs and web applications.)
- TypeOrm (An ORM for TypeScript and JavaScript that supports various databases, providing tools for object-relational mapping.)
- MySql (A widely-used open-source relational database management system known for its reliability and scalability.)
- JWT (JSON Web Token, a compact and secure method for transmitting information between parties, often used for authentication.)

### Features

#### Backend

#### Frontend

- User can register, change password, verify by email, or delete account, there is an option to setup or delete profile picture, you can also modify your own permissions (only if canManage is enabled, for demonstration responsibilty)
- displaying logs can be displayed, or filtered by date and status, there also is an option to download all logs as svg or json
- infinity scrolling logs
- Routing is secured and based on permissions, only admin can see members and modify their permissions
- User is secured before losing data from inputs by CanDeactivateGuard on every form or edit form
- User can display redirections, their total clicks number, and modify each value (if is allowed) or delete any redirection (if is allowed)

### Installation
