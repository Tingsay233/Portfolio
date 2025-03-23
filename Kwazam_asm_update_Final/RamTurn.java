import javax.swing.ImageIcon;

// Written by: Say Si Ting, Ng Jia Huang
// This is the RamTurn piece class
// It is inherit from the base class Piece
// This is also part of the model
public class RamTurn extends Piece {
    //Constuctor
    public RamTurn(Board board, int col, int row, boolean isRed) {
        super(board);
        this.col = col;
        this.row = row;
        this.posX = col * board.tileSize;
        this.posY = row * board.tileSize;
        this.isRed = isRed;
        this.name = "RamTurn";

        setImage();
    }

    // if it is red use the red Ram image, else use blue
    private void setImage() {
        if (isRed) {
            this.image = new ImageIcon(getClass().getResource("Chessimages/RamTurnR.png")).getImage();
        } else {
            this.image = new ImageIcon(getClass().getResource("Chessimages/RamTurnB.png")).getImage();
        }
    }

    // Check if the move is valid
    @Override
    public boolean isValid(int col, int row) {
        // Check if the destination is within bounds
        if (col < 0 || col >= board.col || row < 0 || row >= board.row) {
            return false;
        }

        // Determine if the piece is at the bottom of the board
        boolean atBottom = this.row == board.row - 1;

        if (atBottom) {
            transform();
        } else {
            // Allow one-step movement downward
            if (col == this.col && row == this.row + 1) {
                return true;
            }
        }

        // Check if the destination tile is occupied
        Piece destinationPiece = board.getPiece(col, row);
        if (destinationPiece != null && destinationPiece.isRed == this.isRed) {
            return false; // Cannot capture ally piece
        }

        return false;
    }

    public void transform() {
        // Remove the current RamTurn piece
        board.pieceList.remove(this);
    
        // Check if a piece already exists at the position
        for (Piece p : board.pieceList) {
            if (p.col == this.col && p.row == this.row) {
                // If a piece already exists, do not add a new one
                return;  // Prevent duplicate pieces
            }
        }
    
        // Create a new Ram piece and add it to the list
        Ram newRam = new Ram(board, col, row, isRed);
        board.pieceList.add(newRam);
    }
    
}