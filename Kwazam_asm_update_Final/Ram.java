import javax.swing.ImageIcon;

// Written by: Say Si Ting, Ng Jia Huang
// This is the Ram piece class
// It is inherit from the base class Piece
// This is also part of the model
public class Ram extends Piece {
    //Constuctor
    public Ram(Board board, int col, int row, boolean isRed) {
        super(board);
        this.col = col;
        this.row = row;
        this.posX = col * board.tileSize;
        this.posY = row * board.tileSize;
        this.isRed = isRed;
        this.name = "Ram";

        // if it is red use the red Ram image, else use blue
        if (isRed) {
            this.image = new ImageIcon(getClass().getResource("Chessimages/RamR.png")).getImage();
        } else {
            this.image = new ImageIcon(getClass().getResource("Chessimages/RamB.png")).getImage();
        }
    }

    // Check if the move is valid
    @Override
    public boolean isValid(int col, int row) {
        // Check if the destination is within bounds
        if (col < 0 || col >= board.col || row < 0 || row >= board.row) {
            return false;
        }

    // Determine if the piece is at the top or bottom of the board
    boolean atTop = this.row == 0;

    // Handle movement logic
    if (atTop) {
        // If at the top, the valid move is one step downward
        transform();
    } else {
        // If in the middle, the valid move is one step upward
        if (col == this.col && row == this.row - 1) {
            return true;
        }
    }

    // Check if the destination tile is occupied
    Piece destinationPiece = board.getPiece(col, row);
    if (destinationPiece != null) {
        // If the destination is occupied by an ally, the move is invalid
        if (destinationPiece.isRed == this.isRed) {
            return false;
        }
    }

    return false;
}
public void transform() {
    // Remove the current Ram piece
    board.pieceList.remove(this);

    // Check if a piece already exists at the position
    for (Piece p : board.pieceList) {
        if (p.col == this.col && p.row == this.row) {
            // If a piece already exists, do not add a new one
            return;  // Prevent duplicate pieces
        }
    }

    // Create a new RamTurn piece and add it to the list
    RamTurn newRamTurn = new RamTurn(board, col, row, isRed);
    board.pieceList.add(newRamTurn);
}

     
}