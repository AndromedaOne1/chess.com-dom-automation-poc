# ♟️ Chess.com DOM Analyzer & Auto-Bot (v7.8)

> ⚠️ **DISCLAIMER: FOR EDUCATIONAL PURPOSES ONLY!**
> This project was created strictly for educational and research purposes to demonstrate vulnerabilities in client-side DOM architecture and the lack of robust anti-automation mechanisms in modern web applications. 
> 
> **DO NOT** use this script in real games against human players. Using third-party tools to gain an unfair advantage violates the Terms of Service of Chess.com and will result in a permanent ban of your account. The author is not responsible for any banned accounts or misuse of this software.

## 📖 About The Project

This repository contains a proof-of-concept (PoC) Tampermonkey userscript that leverages `MutationObserver` and Web Workers to analyze a chessboard's DOM state in real-time. By extracting FEN data directly from HTML elements and piping it into a client-side Stockfish engine, it calculates the best possible move and can automatically emulate PointerEvents to execute the move on the board within ~0.1 seconds.

## ✨ Features

* **⚡ Ultra-Fast Execution:** Achieves ~0.1s reaction time from board mutation to move execution.
* **🧠 Client-Side Stockfish 10:** Uses a Web Worker to run the engine entirely in the browser without server requests.
* **👁️ Event-Driven DOM Tracking:** Utilizes `MutationObserver` to track piece movements efficiently without heavy `setInterval` polling, reducing CPU load.
* **⏱️ Smart Turn Detection:** Reads active CSS classes on player clocks and calculates half-moves to perfectly sync with the game state.
* **🎯 PointerEvent Emulation:** Simulates raw `pointerdown` and `pointerup` events to bypass simple click-listeners.

## 🛠️ Installation

1. Install a userscript manager like [Tampermonkey](https://www.tampermonkey.net/).
2. Click on the raw `chess-advisor.user.js` file in this repository.
3. Tampermonkey will prompt you to install the script. Click **Install**.
4. Open a test game against a computer bot on Chess.com.
5. Watch the script automatically calculate and execute moves.

## 💻 Technical Stack
- **JavaScript (ES6+)**
- **Web Workers API**
- **MutationObserver API**
- **Stockfish.js**

## 🤝 Contributing
Feel free to open issues or submit pull requests if you want to improve the FEN generation logic or optimize the DOM parsing algorithms!

---
*Created for DOM manipulation research.*
