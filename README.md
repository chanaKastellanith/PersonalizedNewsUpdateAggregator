# PersonalizedNewsUpdateAggregator
The project aims to develop a microservice-based application that aggregates news and technology updates based on user preferences


# News Update Aggregator

This project is a web application designed to manage and update user data using MongoDB, with an Express.js backend. It integrates with Docker and Dapr for microservices management.

## Getting Started:
1. Clone the repository.
2. Navigate to the project directory.
3. Run the command `docker-compose up` to start the services and their Dapr sidecars.


## Technologies Used:
- Node js: used to develop the microservices.
- Dapr: An event-driven, portable runtime for building microservices.
- Docker: A platform used to containerize and manage the microservices.
- RabbitMQ: A message broker for the communication between the microservices.
- MongoDB: The database used to store and retrieve users entries.

## Architecture:
- Manager Service: Accepts requests (Get, Post, Delete) related to phone entries, validates them, and pushes to the RabbitMQ queue via Dapr.
- Accessor Service: Picks up requests from the RabbitMQ queue, processes the requests, and performs actions on MongoDB.
- RabbitMQ: Used as the messaging system for the exchange of requests between the Manager and Accessor services.
- Dapr: Handles the communication between the Manager and Accessor services and the RabbitMQ queue.
- MongoDB: The database used to store and retrieve phone entries.


## API Endpoints
- `POST /updateUser`: Updates user data.
- `POST /addUser`: Adds a new user.
- `GET /getUser`: Fetches a user based on email and password.
- `GET /getNews`: toget the daily news acoording persinal preference.

## Database Models

- **Users**: Stored in MongoDB with fields: `userId`, `name`, `email`, `password`, `keywords`, `language`, `country`, `category`.

## Docker Configuration

- **Ports**: The application exposes port 3000 inside the container, mapped to the host's port for access.
- **Dapr**: Dapr is used to facilitate microservices communication.





