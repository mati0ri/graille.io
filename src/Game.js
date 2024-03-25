import React, { useRef, useState, useEffect } from 'react';

function Game() {
    const canvasRef = useRef(null);
    const [position, setPosition] = useState({ x: 100, y: 100 });
    const [squares, setSquares] = useState([]); // Stockez les carrés ici
    const [color, setColor] = useState('#FF0000'); // Couleur initiale du cercle
    const [isConnected, setIsConnected] = useState(false); // Track connection status
    const [players, setPlayers] = useState({}); // Un objet où chaque clé est un ID de session et la valeur est la position
    const [keyStates, setKeyStates] = useState({ up: false, down: false, left: false, right: false });
    const [deathMessage, setDeathMessage] = useState('');
    const animationFrameId = useRef();




    let ws = useRef(null); // Référence pour stocker la connexion WebSocket

    
    useEffect(() => {
        connectWebSocket(); // Connectez comme avant
    
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
    
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            ws.current && ws.current.close();
        };
    }, []); //s'exécute une seule fois
    

    // Effect to draw/re-draw whenever position or color changes
    useEffect(() => {
        const context = canvasRef.current.getContext('2d');
        draw(context);
    }, [position, color, players, squares]); // This effect depends on position and color

    // Gère la connexion WebSocket
    const connectWebSocket = () => {
        ws.current = new WebSocket('wss://syxeowar-back.onrender.com/ws/game');
        ws.current.onopen = () => {
            console.log('WebSocket connected');
            setIsConnected(true);
            setDeathMessage('');
        };
        ws.current.onmessage = handleWebSocketMessage;
        ws.current.onclose = (event) => {
            console.log('WebSocket disconnected', event);
            setIsConnected(false);
            // Vérifiez si la fermeture a une raison liée à une collision
            if (event.reason === "Vous avez été déconnecté en raison d'une collision") {
                setDeathMessage("Tu t'es fait manger ! 😵");
            } else {
                setDeathMessage(''); // Réinitialisez le message en cas de reconnexion
            }
        };
        
        ws.current.onerror = (error) => {
            console.log('WebSocket Error: ', error);
            setIsConnected(false);
        };
    };

    const toggleWebSocketConnection = () => {
        if (isConnected) {
            ws.current.close(); // Close the connection if we are currently connected
        } else {
            connectWebSocket(); // Reconnect if we are disconnected
        }
    };

    // Gère la réception des messages WebSocket
    const handleWebSocketMessage = (event) => {
        const data = JSON.parse(event.data);
        if (Array.isArray(data)) { // Si le serveur envoie un tableau, ce sont des carrés
            setSquares(data);
        } else {
            setPlayers(data); // Sinon, ce sont des positions de joueur
        }
    };
    

    const handleKeyDown = (event) => {
        const keyMap = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' };
        const key = keyMap[event.key];
        if (key) {
            setKeyStates(prev => {
                const newState = { ...prev, [key]: true };
                ws.current.send(JSON.stringify(newState));
                return newState;
            });
        }
    };
    
    const handleKeyUp = (event) => {
        const keyMap = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' };
        const key = keyMap[event.key];
        if (key) {
            setKeyStates(prev => {
                const newState = { ...prev, [key]: false };
                ws.current.send(JSON.stringify(newState));
                return newState;
            });
        }
    };
    

    const handleClick = () => {
        ws.current.send('changeColor'); // Demander au serveur de changer la couleur
        console.log('changeColor');
    };

    const draw = (ctx) => {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        Object.entries(players).forEach(([id, { x, y, pseudo, color, score }]) => {
            // Utilisez la couleur du joueur spécifique pour le remplissage
            ctx.fillStyle = color;
            // Définissez la couleur et l'épaisseur de la bordure
            ctx.strokeStyle = "#000"; // Couleur noire pour la bordure
            ctx.lineWidth = 2; // Épaisseur de la bordure
    
            // Commencez le dessin du cercle
            ctx.beginPath();
            ctx.arc(x, y, 20+2*score, 0, 2 * Math.PI);
            ctx.fill(); // Remplir le cercle avec la couleur du joueur
            ctx.stroke(); // Dessiner la bordure autour du cercle
    
            // Affichez le pseudo près du joueur
            ctx.fillStyle = "#000"; // Couleur du texte pour le pseudo
            ctx.font = "12px Arial";
            ctx.fillText(score, x-3, y+5); // Positionnez le texte à côté du cercle
        });

        // Dessiner les carrés jaunes
        squares.forEach(square => {
            ctx.fillStyle = '#FFFF00'; // Jaune
            ctx.fillRect(square.x, square.y, 20, 20); // Dessiner un carré de 20x20
    });
    };
    
   // Fonction pour trier et afficher les joueurs par score avec indicateur de couleur et médailles pour le top 3
const renderPlayersList = () => {
    return Object.values(players)
        .sort((a, b) => b.score - a.score) // Tri par score en ordre décroissant
        .map((player, index) => {
            // Définition des couleurs pour les trois premiers joueurs
            let textColor = "#000"; // La couleur par défaut pour les autres joueurs
            if (index === 0) textColor = "#FFD700"; // Doré pour le premier
            else if (index === 1) textColor = "#C0C0C0"; // Argent pour le second
            else if (index === 2) textColor = "#CD7F32"; // Bronzé pour le troisième

            return (
                <li key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                    <span style={{
                        display: 'inline-block',
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: player.color,
                        marginRight: '10px',
                    }}></span>
                    <span style={{ color: textColor }}>{player.score}</span>
                </li>
            );
        });
};

    
    
    
    

    // Déconnecte manuellement le WebSocket
    const disconnectWebSocket = () => {
        ws.current.close();
    };

    return (
        <div style={{ backgroundColor: '#f0f0f0',  
        width: '100vw', 
        height: '100vh', 
        overflow: 'hidden' // Empêche le défilement
    }}>
            <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight} onClick={handleClick} />
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                zIndex: 1000,
                background: 'rgba(255, 255, 255, 0.7)',
                padding: '10px',
                color: 'black',
            }}>
                {/* Single button that toggles based on connection status */}
                <button onClick={toggleWebSocketConnection}>
                    {isConnected ? 'Déconnexion' : 'Connexion'}
                </button>
                <div>{renderPlayersList()}</div>
            </div>
            {deathMessage && (
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                color: 'white',
                zIndex: 1001,
                background: 'rgba(0, 0, 0, 0.5)',
                padding: '20px',
                borderRadius: '10px',
            }}>
                {deathMessage}
                <br />
                <button onClick={toggleWebSocketConnection}>
                    Rejouer
                </button>
            </div>
        )}
        </div>
    );
}

export default Game;