# Chatbot

This repository contains a skeleton of a chatbot web app. The rest of this document describes how to run this skeleton.

### Running in Docker

The easiest way to run this code is with Docker. Build the Docker image as follows:

```shell
docker build -t chatbot-challenge .
```

This will take a few minutes the first time you run it. Once the image is built, you can run it locally as follows:

```shell
docker run -p 4444:4444 chatbot-challenge
```

You should then be connect to `http://localhost:4444` and interact with the chatbot.

### Local development

To facilitate rapid local development, you can run both the server and the client in auto-reloading dev server mode. To start the server:

```shell
cd server
npm install
npm run start
```

To start the client:

```shell
cd client
npm install
npm run start
```

Once both are running, you can connect to `http://localhost:7777` (note the port!) to interact with the chatbot. Any change to the server or client code will automatically recompile and restart the appropriate process.

### Sample run

<img width="556" alt="image" src="https://user-images.githubusercontent.com/649541/202781839-861d4ae1-e7d1-4952-9b8e-0ffdd28e5f20.png">

