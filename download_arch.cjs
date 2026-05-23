const fs = require('fs');
const https = require('https');
const diagram = `graph TD
    subgraph "Client Side (User Browser)"
        UI[React + Vite UI]
        State[React State & Hooks]
        Router[Custom App Router]
        UI --> State
        UI --> Router
    end
    subgraph "Hosting & Edge (Vercel)"
        Static[Static Frontend Assets]
        VercelAPI[Serverless Functions /api/*]
        Router -.->|Serves| Static
        UI -->|HTTP POST| VercelAPI
    end
    subgraph "Backend Services"
        Express[Express.js Controller]
        AIService[AI Service Logic]
        VercelAPI --> Express
        Express --> AIService
    end
    subgraph "External APIs & Cloud"
        NVIDIA[NVIDIA NIM Llama 3.1]
        subgraph "Supabase Cloud"
            Auth[Supabase Auth / Google OAuth]
            DB[(PostgreSQL Database)]
            RLS[Row Level Security]
            DB --- RLS
        end
        AIService -->|API Key Auth| NVIDIA
    end
    UI -->|Session Sync| Auth
    UI -->|Read/Write User Data| RLS
    classDef client fill:#3b82f6,stroke:#fff,stroke-width:2px,color:#fff;
    classDef edge fill:#000,stroke:#fff,stroke-width:2px,color:#fff;
    classDef backend fill:#10b981,stroke:#fff,stroke-width:2px,color:#fff;
    classDef db fill:#10b981,stroke:#fff,stroke-width:2px,color:#fff;
    classDef external fill:#76b900,stroke:#fff,stroke-width:2px,color:#fff;
    class UI,State,Router client;
    class Static,VercelAPI edge;
    class Express,AIService backend;
    class Auth,DB,RLS db;
    class NVIDIA external;`;

// Convert the mermaid string to base64
const base64 = Buffer.from(diagram).toString('base64');
const url = 'https://mermaid.ink/img/' + base64;

console.log('Downloading fixed image from: ' + url);

https.get(url, (res) => {
    if (res.statusCode !== 200) {
        console.error('Failed to download. Status code:', res.statusCode);
        return;
    }
    const file = fs.createWriteStream('C:/Users/PREETHAM/OneDrive/ドキュメント/Desktop/EduRank_Architecture.png');
    res.pipe(file);
    file.on('finish', () => {
        file.close();
        console.log('Image saved successfully to Desktop!');
    });
}).on('error', (err) => {
    console.error('Error: ' + err.message);
});
