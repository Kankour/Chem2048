import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

// Progression of elements for glucose molecule
const ELEMENTS = ['H', 'C', 'O'];

// Color palette for elements
const ELEMENT_COLORS = {
    'H': '#F0F0F0',  // Light gray for Hydrogen
    'C': '#000000',  // Black for Carbon
    'O': '#FF0D0D'   // Bright red for Oxygen
};

const GlucoseMolecule2048 = () => {
    const [board, setBoard] = useState(Array(16).fill(null));
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);

    const addRandomTile = useCallback((currentBoard) => {
        const emptySpots = currentBoard.reduce((acc, val, idx) => 
            val === null ? [...acc, idx] : acc, []);
        
        if (emptySpots.length > 0) {
            const randomSpot = emptySpots[Math.floor(Math.random() * emptySpots.length)];
            const newBoard = [...currentBoard];
            newBoard[randomSpot] = ELEMENTS[0];
            return newBoard;
        }
        return currentBoard;
    }, []);

    const initializeGame = useCallback(() => {
        let initialBoard = Array(16).fill(null);
        initialBoard = addRandomTile(initialBoard);
        initialBoard = addRandomTile(initialBoard);
        setBoard(initialBoard);
        setScore(0);
        setGameOver(false);
    }, [addRandomTile]);

    useEffect(() => {
        initializeGame();
    }, [initializeGame]);

    const getNextElement = (currentElement) => {
        const currentIndex = ELEMENTS.indexOf(currentElement);
        return currentIndex < ELEMENTS.length - 1 ? ELEMENTS[currentIndex + 1] : null;
    };

    const rotateBoard = (board, times) => {
        let rotatedBoard = [...board];
        for (let r = 0; r < times; r++) {
            const newBoard = Array(16).fill(null);
            for (let i = 0; i < 4; i++) {
                for (let j = 0; j < 4; j++) {
                    newBoard[i * 4 + j] = rotatedBoard[(3 - j) * 4 + i];
                }
            }
            rotatedBoard = newBoard;
        }
        return rotatedBoard;
    };

    const moveLeft = useCallback((board) => {
        let newBoard = [...board];
        let newScore = score;

        for (let row = 0; row < 4; row++) {
            let currentRow = newBoard.slice(row * 4, row * 4 + 4).filter(val => val !== null);
            const originalLength = currentRow.length;

            // Merge identical elements
            for (let i = 0; i < currentRow.length - 1; i++) {
                if (currentRow[i] === currentRow[i + 1]) {
                    currentRow[i] = getNextElement(currentRow[i]);
                    newScore += ELEMENTS.indexOf(currentRow[i]) + 1;
                    currentRow.splice(i + 1, 1);
                }
            }

            // Pad with nulls
            while (currentRow.length < 4) {
                currentRow.push(null);
            }

            // Update board if row changed
            if (currentRow.length !== originalLength || 
                currentRow.some((val, idx) => val !== newBoard.slice(row * 4, row * 4 + 4)[idx])) {
                newBoard.splice(row * 4, 4, ...currentRow);
            }
        }

        return { newBoard, newScore };
    }, [score]);

    const move = useCallback((direction) => {
        if (gameOver) return;

        let rotatedBoard = board;
        switch(direction) {
            case 'ArrowRight': rotatedBoard = rotateBoard(board, 2); break;
            case 'ArrowUp': rotatedBoard = rotateBoard(board, 1); break;
            case 'ArrowDown': rotatedBoard = rotateBoard(board, 3); break;
            default: break;
        }

        const { newBoard: movedBoard, newScore } = moveLeft(rotatedBoard);
        
        let finalBoard = direction === 'ArrowLeft' ? movedBoard :
            direction === 'ArrowRight' ? rotateBoard(movedBoard, 2) :
            direction === 'ArrowUp' ? rotateBoard(movedBoard, 3) :
            direction === 'ArrowDown' ? rotateBoard(movedBoard, 1) : board;

        // Check if board changed
        const boardChanged = finalBoard.some((val, idx) => val !== board[idx]);
        
        if (boardChanged) {
            const boardWithNewTile = addRandomTile(finalBoard);
            setBoard(boardWithNewTile);
            setScore(newScore);

            // Check game over
            const availableMoves = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown']
                .some(dir => {
                    const { newBoard: testBoard } = moveLeft(
                        rotateBoard(boardWithNewTile, 
                            dir === 'ArrowRight' ? 2 : 
                            dir === 'ArrowUp' ? 1 : 
                            dir === 'ArrowDown' ? 3 : 0
                        )
                    );
                    return testBoard.some((val, idx) => val !== boardWithNewTile[idx]);
                });

            if (!availableMoves) {
                setGameOver(true);
            }
        }
    }, [board, gameOver, addRandomTile, moveLeft]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
                event.preventDefault();
                move(event.key);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [move]);

    return (
        <Card className="w-[400px] mx-auto">
            <CardHeader>
                <CardTitle className="text-center">Glucose Molecule 2048</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-center mb-4">
                    <span className="font-bold">Score: {score}</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                    {board.map((element, index) => (
                        <div 
                            key={index} 
                            className="aspect-square border rounded flex items-center justify-center text-2xl font-bold"
                            style={{ 
                                backgroundColor: element ? ELEMENT_COLORS[element] || '#E0E0E0' : '#F0F0F0',
                                color: element === 'H' || element === 'O' ? 'black' : 'white'
                            }}
                        >
                            {element || ''}
                        </div>
                    ))}
                </div>
                {gameOver && (
                    <div className="text-center mt-4 text-red-600 font-bold">
                        Game Over! <button onClick={initializeGame} className="underline">Restart</button>
                    </div>
                )}
                <div className="text-center mt-4 text-sm text-gray-600">
                    Use arrow keys to move tiles. Merge identical elements from H → C → O!
                </div>
            </CardContent>
        </Card>
    );
};

export default GlucoseMolecule2048;
