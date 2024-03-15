import React from 'react';
import './App.css';
import Game from './Game'; // Assurez-vous que le chemin d'importation est correct

function App() {
  return (
    <div className="App">
      <header className="App-header">
        {/* Vous pouvez supprimer ou commenter ces éléments si vous ne les utilisez pas */}
        {/* <img src={logo} className="App-logo" alt="logo" /> */}
        {/* <p>Edit <code>src/App.js</code> and save to reload.</p> */}
        {/* <a className="App-link" href="https://reactjs.org" target="_blank" rel="noopener noreferrer">Learn React</a> */}
        
        {/* Intégration de votre jeu */}
        <Game />
      </header>
    </div>
  );
}

export default App;
