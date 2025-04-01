Next.js Project Setup Guide

Prerequisites

Ensure you have the following installed on your system:

Node.js (LTS version recommended)

npm 


Clone the Repository

git clone <repository_url>
cd <project_directory>



Install Dependencies

Using npm:

npm install


Run the Development Server

To start the Next.js development server on port 8080:

Using npm:

npm run dev -- -p 8080


If you are using package.json scripts, you can add:

"scripts": {
  "dev": "next dev -p 8080"
}

Then, simply run:

npm run dev

Access the Application

Once the server is running, open your browser and navigate to:

http://localhost:8080

