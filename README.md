# Oxy Backend

This repository contains the backend code for **Oxy Corporations**, a hotel management system built with **Node.js** and **MongoDB**. The system supports features like **QR-based check-ins/outs**, **real-time analytics** for hotel performance, and **POS payment integrations**. 

The backend handles all aspects of booking management, guest interactions, and reporting, enabling seamless operations for both hotel managers and users.

## Project Overview

The **Oxy Backend** provides the foundation for the hotel management system, including:
- **QR-Based Check-In/Check-Out**: Automates guest check-in and check-out processes using QR codes.
- **Booking Management**: Enables hotel managers to manage bookings, including viewing, modifying, and canceling bookings.
- **Real-Time Analytics**: Tracks hotel performance metrics such as revenue, occupancy rates, and booking trends. Utilizes **MongoDB Aggregation** for efficient querying.
- **Payment Integration**: Integrated with **POS systems** to handle payment processing for bookings.
- **User Authentication**: Supports secure user authentication for hotel managers and customers.

## Technologies Used

- **Node.js** – Backend environment for building the server.
- **Express.js** – Web framework for building the REST API.
- **MongoDB** – NoSQL database for storing hotel and booking data.
- **Mongoose** – ODM for MongoDB, simplifying data interactions.
- **Socket.io** – For real-time communication and updates.
- **QR Code** – Generation for check-in/check-out processes.

## Setup Instructions

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (version 14 or higher)
- **MongoDB** (locally or through a service like MongoDB Atlas)

### Installation

1. Clone the repository to your local machine:
   ```bash
   git clone https://github.com/your-username/oxy-backend.git
   cd oxy-backend
