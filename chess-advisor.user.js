// ==UserScript==
// @name         Chess.com PoC Automation
// @namespace    http://tampermonkey.net/
// @version      7.8.1
// @description  PoC for DOM manipulation and automation (Educational)
// @match        *://*.chess.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    console.log("[SYSTEM] DOM Parser Active. Engine initialized.");

    const pieceMap = {
        'wp': 'P', 'wn': 'N', 'wb': 'B', 'wr': 'R', 'wq': 'Q', 'wk': 'K',
        'bp': 'p', 'bn': 'n', 'bb': 'b', 'br': 'r', 'bq': 'q', 'bk': 'k'
    };

    function getBoardState() {
        const board = document.querySelector('chess-board') || document.querySelector('wc-chess-board');
        if (!board) return null;

        const isFlipped = board.classList.contains('flipped');
        const boardRect = board.getBoundingClientRect();
        const squareSize = boardRect.width / 8;

        let grid = Array(8).fill(null).map(() => Array(8).fill(null));
        const pieces = board.querySelectorAll('.piece');
        let piecesFound = 0;

        pieces.forEach(piece => {
            let pieceType = '';
            piece.classList.forEach(cls => { if (pieceMap[cls]) pieceType = pieceMap[cls]; });
            if (!pieceType) return;

            let col = -1, row = -1;
            const sqMatch = piece.className.match(/square-(\d)(\d)/);

            if (sqMatch) {
                col = parseInt(sqMatch[1]) - 1;
                row = 8 - parseInt(sqMatch[2]);
            } else {
                const transform = piece.style.transform;
                const match = transform ? transform.match(/translate\((\d+(?:\.\d+)?)(px|%),\s*(\d+(?:\.\d+)?)(px|%)\)/) : null;
                if (match) {
                    const x = parseFloat(match[1]), y = parseFloat(match[3]), unit = match[2];
                    if (unit === '%') { col = Math.round(x / 100); row = Math.round(y / 100); }
                    else { col = Math.round(x / squareSize); row = Math.round(y / squareSize); }
                    if (isFlipped) { col = 7 - col; row = 7 - row; }
                }
            }

            if (col >= 0 && col <= 7 && row >= 0 && row <= 7) {
                grid[row][col] = pieceType;
                piecesFound++;
            }
        });
        return { grid, isFlipped, squareSize, board, boardRect, piecesFound };
    }

    function generateFEN(grid) {
        let fen = '';
        for (let row = 0; row < 8; row++) {
            let emptyCount = 0;
            for (let col = 0; col < 8; col++) {
                if (grid[row][col]) {
                    if (emptyCount > 0) { fen += emptyCount; emptyCount = 0; }
                    fen += grid[row][col];
                } else { emptyCount++; }
            }
            if (emptyCount > 0) fen += emptyCount;
            if (row < 7) fen += '/';
        }
        return fen;
    }

    function drawArrows(board, movesList, isFlipped, squareSize) {
        try {
            let svg = document.getElementById('cheat-arrow-svg');
            if (!svg || !board.contains(svg)) {
                if (svg) svg.remove();
                svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                svg.id = 'cheat-arrow-svg';
                Object.assign(svg.style, { position: 'absolute', top: '0', left: '0', width: '100%', height: '100%', pointerEvents: 'none', zIndex: '999' });
                board.appendChild(svg);
            }
            Array.from(svg.children).forEach(child => svg.removeChild(child));

            const topMoves = movesList.slice(0, 1);
            topMoves.forEach((moveData) => {
                if (!moveData || moveData.length < 4) return;
                const startCol = moveData.charCodeAt(0) - 97;
                const startRow = 8 - parseInt(moveData[1]);
                const endCol = moveData.charCodeAt(2) - 97;
                const endRow = 8 - parseInt(moveData[3]);

                let sCol = isFlipped ? 7 - startCol : startCol;
                let sRow = isFlipped ? 7 - startRow : startRow;
                let eCol = isFlipped ? 7 - endCol : endCol;
                let eRow = isFlipped ? 7 - endRow : endRow;

                const startX = (sCol * squareSize) + (squareSize / 2);
                const startY = (sRow * squareSize) + (squareSize / 2);
                const endX = (eCol * squareSize) + (squareSize / 2);
                const endY = (eRow * squareSize) + (squareSize / 2);

                const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
                line.setAttribute("x1", startX); line.setAttribute("y1", startY);
                line.setAttribute("x2", endX); line.setAttribute("y2", endY);
                line.setAttribute("stroke", "rgba(46, 204, 113, 0.8)");
                line.setAttribute("stroke-width", squareSize * 0.15);
                svg.appendChild(line);
            });
        } catch (err) {}
    }

    function executeAutoMove(moveStr, board, isFlipped, squareSize, boardRect) {
        if (!moveStr || moveStr.length < 4) return;

        const startCol = moveStr.charCodeAt(0) - 97;
        const startRow = 8 - parseInt(moveStr[1]);
        const endCol = moveStr.charCodeAt(2) - 97;
        const endRow = 8 - parseInt(moveStr[3]);

        let sCol = isFlipped ? 7 - startCol : startCol;
        let sRow = isFlipped ? 7 - startRow : startRow;
        let eCol = isFlipped ? 7 - endCol : endCol;
        let eRow = isFlipped ? 7 - endRow : endRow;

        const startX = boardRect.left + (sCol * squareSize) + (squareSize / 2);
        const startY = boardRect.top + (sRow * squareSize) + (squareSize / 2);
        const endX = boardRect.left + (eCol * squareSize) + (squareSize / 2);
        const endY = boardRect.top + (eRow * squareSize) + (squareSize / 2);

        const dispatchPointerEvent = (type, x, y) => {
            const event = new PointerEvent(type, {
                bubbles: true, cancelable: true,
                clientX: x, clientY: y,
                pointerId: 1, pointerType: 'mouse', button: 0, buttons: 1
            });
            board.dispatchEvent(event);
        };

        dispatchPointerEvent('pointerdown', startX, startY);
        dispatchPointerEvent('pointerup', startX, startY);

        setTimeout(() => {
            dispatchPointerEvent('pointerdown', endX, endY);
            dispatchPointerEvent('pointerup', endX, endY);
            console.log(`[SYSTEM] Move executed: ${moveStr}`);
        }, 20);
    }

    function getCurrentTurn(isFlipped) {
        const myColor = isFlipped ? 'b' : 'w';
        const oppColor = isFlipped ? 'w' : 'b';

        const myClockActive = document.querySelector('.clock-bottom.clock-player-turn') || document.querySelector('.board-layout-bottom .clock-player-turn');
        const oppClockActive = document.querySelector('.clock-top.clock-player-turn') || document.querySelector('.board-layout-top .clock-player-turn');

        if (myClockActive) return myColor;
        if (oppClockActive) return oppColor;

        const moves = document.querySelectorAll('wc-vertical-move-list .node, .move-list-item');
        if (moves.length > 0) {
            return moves.length % 2 === 0 ? 'w' : 'b';
        }

        return 'w';
    }

    let sfWorker = null;
    let lastFen = '';

    fetch('https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.2/stockfish.js')
        .then(r => r.text())
        .then(text => {
            const blob = new Blob([text], {type: 'application/javascript'});
            sfWorker = new Worker(URL.createObjectURL(blob));
            sfWorker.postMessage('uci');

            sfWorker.onmessage = function(e) {
                if (typeof e.data === 'string' && e.data.startsWith('bestmove')) {
                    const bestMove = e.data.split(' ')[1];
                    const state = getBoardState();

                    if (state && bestMove) {
                        drawArrows(state.board, [bestMove], state.isFlipped, state.squareSize);

                        const myTurn = state.isFlipped ? 'b' : 'w';
                        const currentTurn = lastFen.split(' ')[1];

                        if (currentTurn === myTurn) {
                            executeAutoMove(bestMove, state.board, state.isFlipped, state.squareSize, state.boardRect);
                        }
                    }
                }
            };
            console.log("[SYSTEM] Worker thread active.");
            initObserver();
        }).catch(err => console.error("[SYSTEM ERROR]:", err));

    function checkAndUpdate() {
        const state = getBoardState();
        if (state && sfWorker && state.piecesFound > 0) {
            let boardFen = generateFEN(state.grid);

            const turn = getCurrentTurn(state.isFlipped);
            const fullFen = boardFen + ' ' + turn + ' - - 0 1';

            if (fullFen !== lastFen) {
                lastFen = fullFen;
                sfWorker.postMessage('position fen ' + fullFen);
                sfWorker.postMessage('go movetime 25');
            }
        }
    }

    function initObserver() {
        const observerTarget = document.body;
        if (!observerTarget) {
            setTimeout(initObserver, 500);
            return;
        }

        let debounceTimer = null;
        const observer = new MutationObserver((mutations) => {
            let needCheck = false;
            for (let m of mutations) {
                if (m.target.classList && (m.target.classList.contains('piece') || m.target.classList.contains('square') || m.target.classList.contains('clock-player-turn'))) {
                    needCheck = true;
                    break;
                }
            }
            if (needCheck) {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    checkAndUpdate();
                }, 30);
            }
        });

        observer.observe(observerTarget, {
            childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style']
        });
        
        console.log("[SYSTEM] Observer attached.");
    }
})();
