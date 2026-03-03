# Campus Connect

An anonymous real-time chat application that connects students from different universities in Bacolod City. Students can chat with random peers from other schools, fostering cross-campus communication and new connections.

## Supported Universities

- University of St. La Salle (USLS)
- Colegio San Agustin Bacolod (CSAB)
- Riverside College Inc. (RCI)
- National University (NU)
- Carlos Hilado Memorial State University (CHMSU)
- University of Negros Occidental Recoletos (UNOR)

## Tech Stack

### Frontend
- **React 19** — UI library
- **Vite 7** — Build tool
- **React Router DOM 7** — Client-side routing
- **Socket.io Client** — Real-time communication

### Backend
- **Express 5** — Web framework
- **Socket.io 4** — WebSocket server for real-time messaging
- **CORS** — Cross-origin resource sharing

### Deployment
- **Render** — Hosts both frontend and backend

## How It Works

1. **Username Entry** — Users enter a display name on the landing page
2. **School Selection** — Users select their university from the list of Bacolod City schools
3. **Queue System** — Users join a waiting queue for their selected school
4. **Matching Algorithm** — When two users are in the queue:
   - The server first tries to pair users from different schools
   - If no cross-school match is found, it pairs users from the same school
5. **Anonymous Chat** — Both users can chat in real-time without knowing each other's identity
6. **Find New Partner** — Users can leave and find a new chat partner at any time

## Project Structure

```
campusconnect/
├── src/
│   ├── server/
│   │   ├── server.js       # Express + Socket.io server
│   │   └── socket.js       # Socket event handlers
│   ├── App.jsx             # Landing page with school selection
│   ├── ChatRoom.jsx        # Real-time chat interface
│   ├── main.jsx            # App entry point + routing
│   └── *.css               # Stylesheets
├── public/                 # Static assets (university logos)
├── package.json            # Dependencies
└── vite.config.js          # Vite configuration
```

## Getting Started

### Prerequisites
- Node.js 18+

### Installation

```bash
# Clone the repository
cd campusconnect

# Install dependencies
npm install

# Install server dependencies
cd src/server
npm install
```

### Development

```bash
# Start frontend (runs on http://localhost:5173)
npm run dev

# Start backend (runs on http://localhost:5000)
cd src/server
node server.js
```

### Build

```bash
npm run build
```

## Environment Variables

The app automatically switches between local and production URLs based on the environment:

- **Development**: Frontend connects to `http://localhost:5000`
- **Production**: Frontend connects to `https://campusconnect-bcd.onrender.com`

## Features

- Real-time messaging with Socket.io
- Automatic partner matching with cross-school preference
- Dark/Light mode toggle
- Auto-scroll to latest messages
- Reconnection handling
- Partner disconnection detection

## License

MIT
