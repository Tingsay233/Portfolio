import java.io.*;
import java.util.ArrayList;
import javax.swing.JFrame;

// Written by: Hiew Wei Cheng, Ng Jia Huang, Say Si Ting, Tan Jing Yi
// This board class is a part of Model
public class Board {
    public int tileSize = 85;
    int row = 8;
    int col = 5;
    ArrayList<Piece> pieceList = new ArrayList<>();
    ArrayList<Observer> observers = new ArrayList<>();
    public Piece selectedPiece;
    public boolean blueTurn = true;
    public boolean boardFlip = false;
    private int completeTurns = 0;
    private JFrame frame;

    // Constructor
    public Board(JFrame frame) {
        this.frame = frame;
        addPieces();
    }

    // Method to initialize all the pieces to their position
    public void addPieces() {
        pieceList.add(new Ram(this, 0, 1, true));
        pieceList.add(new Ram(this, 1, 1, true));
        pieceList.add(new Ram(this, 2, 1, true));
        pieceList.add(new Ram(this, 3, 1, true));
        pieceList.add(new Ram(this, 4, 1, true));

        pieceList.add(new Tor(this, 0, 0, true));
        pieceList.add(new Biz(this, 1, 0, true));
        pieceList.add(new Sau(this, 2, 0, true));
        pieceList.add(new Biz(this, 3, 0, true));
        pieceList.add(new Xor(this, 4, 0, true));

        pieceList.add(new Ram(this, 0, 6, false));
        pieceList.add(new Ram(this, 1, 6, false));
        pieceList.add(new Ram(this, 2, 6, false));
        pieceList.add(new Ram(this, 3, 6, false));
        pieceList.add(new Ram(this, 4, 6, false));

        pieceList.add(new Tor(this, 4, 7, false));
        pieceList.add(new Biz(this, 1, 7, false));
        pieceList.add(new Sau(this, 2, 7, false));
        pieceList.add(new Biz(this, 3, 7, false));
        pieceList.add(new Xor(this, 0, 7, false));
    }

    // Method to flip the board
    public void flip() {
        boardFlip = !boardFlip;
        for (Piece piece : pieceList) {
            piece.col = col - 1 - piece.col;
            piece.row = row - 1 - piece.row;

            piece.posX = piece.col * tileSize;
            piece.posY = piece.row * tileSize;
        }
    }

    // Method to transform Xor to Tor and Tor to Xor
    public void turn() {
        if (!blueTurn) {
            completeTurns++; // Increment after both red and blue complete their turns
            if (completeTurns % 2 == 0) {
                checkAndTransformPieces(); // Trigger transformation every 2 complete turns
            }
        } 
        System.out.println((blueTurn ? "Blue's" : "Red's") + " turn.");
        blueTurn = !blueTurn;
        flip();
        
    }

    // This method will transform the Tor and Xor piece
    public void checkAndTransformPieces() {
        System.out.println("Checking for transformations on turn " + completeTurns);
        for (int i = 0; i < pieceList.size(); i++) {
            Piece piece = pieceList.get(i);
            if (piece instanceof Tor) {
                System.out.println("Transforming Tor to Xor.");
                pieceList.set(i, new Xor(this, piece.col, piece.row, piece.isRed));
            } else if (piece instanceof Xor) {
                System.out.println("Transforming Xor to Tor.");
                pieceList.set(i, new Tor(this, piece.col, piece.row, piece.isRed));
            }
        }
    }

    // Get piece at a specific position
    public Piece getPiece(int col, int row) {
        for (Piece piece : pieceList) {
            if (piece.col == col && piece.row == row) {
                return piece;
            }
        }
        return null;
    }
    

    // Check if the move is valid
    public boolean isValidMove(Move move) {
        if (!move.piece.canMove()) {
            return false; // Piece cannot move because it's not the correct turn
        }

        if (checkColor(move.piece, move.capture)) {
            return false;
        } else if (!move.piece.isValid(move.newX, move.newY)) {
            return false;
        } else if (move.piece.moveBlock(move.newX, move.newY)) {
            return false;
        }
        return true;
    }

    // Make the move
    public void allowToMove(Move move) {
        move.piece.col = move.newX;
        move.piece.row = move.newY;
        move.piece.posX = move.newX * tileSize;
        move.piece.posY = move.newY * tileSize;

        capture(move);
        
    }

    // Handle capture
    public void capture(Move move) {
        pieceList.remove(move.capture);
        if(move.capture instanceof Sau){
            gameEnd(move.capture.isRed ? "Blue" : "Red");
        }
    }

    // Check if two pieces are the same color
    public boolean checkColor(Piece piece1, Piece piece2) {
        if (piece1 == null || piece2 == null) {
            return false;
        }
        return piece1.isRed == piece2.isRed;
    }

    // This method is to attach Observer (we use observer desgin pattern)
    public void attachObserver(Observer ob) {
        observers.add(ob);
    }

    // This method is to update the movement of the piece to the observer
    public void informOb() {
        for (Observer observer : observers) {
            observer.update(this);
        }
    }

    // This method is to save the game to .txt file
    public void saveGame(String saveName){
        try (BufferedWriter save = new BufferedWriter(new FileWriter(saveName))) {
            for (Piece piece : pieceList) {
                // Print the final position of the chess piece to the .txt file
                if(piece.isRed){
                    save.write("Red " + piece.getClass().getSimpleName() + " " + piece.col + " " + piece.row + " Piece Color is Red: " + piece.isRed);
                    save.newLine();
                } else {
                    save.write("Blue " + piece.getClass().getSimpleName() + " " + piece.col + " " + piece.row + " Piece Color is Red: " + piece.isRed);
                    save.newLine();
                }
            }
            System.out.println("Game Saved");
        } catch (IOException e) {
            System.out.println("Error");
        }
    }

    // This method is to load the user saved game and let the user continue to play
    public void loadsavedGame(String loadsavedFile){
        try(BufferedReader load = new BufferedReader(new FileReader(loadsavedFile))){
            String line;
            pieceList.clear();
            // Read file line by line
            while ((line = load.readLine()) != null) {
                // Split the line into component
                String[] chessPiece = line.split(" ");
                String chessPieceColor = chessPiece[0];
                String pieceName = chessPiece[1];
                int col = Integer.parseInt(chessPiece[2]);
                int row = Integer.parseInt(chessPiece[3]);
                boolean isRed = chessPieceColor.equals("Red");
                
                Piece piece = null;
                // Create the piece based on the .txt file
                switch (pieceName) {
                    case "Ram":
                        piece = new Ram(this, col, row, isRed);
                        break;
                    case "Tor":
                        piece = new Tor(this, col, row, isRed);
                        break;
                    case "Biz":
                        piece = new Biz(this, col, row, isRed);
                        break;
                    case "Sau":
                        piece = new Sau(this, col, row, isRed);
                        break;
                    case "Xor":
                        piece = new Xor(this, col, row, isRed);
                        break;
                    case "RamTurn":
                        piece = new RamTurn(this, col, row, isRed);
                        break;
                }
                if (piece != null) {
                    pieceList.add(piece);
                }
            }
            System.out.println("Game Loaded");
        } catch (IOException e) {
            System.out.println("Error");
        }
    }

    // Method to call the WinPage from View when the Sau piece is captured
    private void gameEnd(String winnerSide){
        frame.setContentPane(new WinPage(winnerSide));
        frame.revalidate();
        frame.repaint();
    }
}
    

