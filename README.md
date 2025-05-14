# 👾VidGlow

VidGlow is a comprehensive video sharing platform that allows users to upload, manage, and interact with video content. This README provides an overview of the project, its features, and instructions for setting up and running the application.

## ⭐ Key Features

- Secure user authentication & authorization
- Video & image uploads with metadata
- Comments, likes, and playlist support
- User dashboard for content management
- Cloud storage integration

## Rate Limiting

* Rate Limiting: The application uses rate limiting to prevent abuse by limiting the number of requests a user can make in a given time period.

## Logging

* Logger: The application includes a logging mechanism to track and record application events and errors for debugging and monitoring purposes.

## Error Handling

###  The application uses custom error classes to handle various error scenarios. Common errors include:

* 400 Bad Request: Missing or invalid input.
* 401 Unauthorized: Unauthorized access.
* 403 Forbidden: Forbidden action.
* 404 Not Found: Resource not found.
* 500 Internal Server Error: Server-side error.

## API Documentation

* For detailed API endpoints and usage, please refer to the Postman Documentation [https://documenter.getpostman.com/view/29001593/2sA3kVizvk]

# Setup Instructions

## Prerequisites

* Node.js (>=14.x)
* MongoDB Account 
* Cloudinary Account (for image and video storage)

## Installation

#### Clone the repository:

##### Open Shell 
* git clone https://github.com/sanjaygupta972004/VidGlow.git
* cd VidGlow

#### Install dependencies: 

 * npm install

 ## Set up environment variables: 

 #### Create a .env file in the root directory and add the following variables:
* port = 5000
* MONGODB_URl=your_mongodb_url
* ACCESS_TOKEN_SECRET = your-access-tokn
* ACCESS_TOKEN_EXPIRY = fixed-time-to-expiry-access-token
* REFRESH_TOKEN_SECRET = your-refresh-token
* REFRESH_TOKEN_EXPIRY = fixed-time-to-expiry-refresh-token
* CLOUDINARY_CLOUD_NAME = your-cloudinay-cloud-user-name
* CLOUDINARY_API_KEY =    api-key
* CLOUDINARY_API_SECRET = api-secret

## Run the application:
* npm start

## 🚀 Deployment Process

- **Version Control:** Push your changes to the `main` branch on GitHub
- **CI/CD Pipeline:** GitHub Actions automatically triggers the deployment workflow
- **Container Setup:** Docker Compose builds and orchestrates the application containers
- **Cloud Deployment:** Application is deployed to AWS EC2 instance
- **Monitoring:** Automated health checks ensure service availability

# License

* This project is licensed under the MIT License.

### Upcoming Features

* Notifications: Implement a notification system to alert users about likes, comments, and new videos from subscribed channels
* Analytics Dashboard: Provide content creators with an analytics dashboard to track the performance of their videos.

