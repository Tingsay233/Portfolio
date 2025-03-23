import javax.swing.ImageIcon;
// Written by: Say Si Ting, Tan Jing Yi
// This is the Tor piece class
// It is inherit from the base class Piece
// This is also part of the Model
public class Tor extends Piece{

    private int turns;

    // Constructor
    public Tor(Board board, int col, int row, boolean isRed){
        super(board);
        this.col = col;
        this.row = row;
        this.posX = col * board.tileSize;
        this.posY = row * board.tileSize;
        this.isRed = isRed;
        this.name = "Tor";
        this.turns = 0;

        // if it is red use the red Tor image, else use blue
        if (isRed) {
            this.image = new ImageIcon("Chessimages/TorR.png").getImage();
        } else {
            this.image = new ImageIcon("Chessimages/TorB.png").getImage();
        }
    }

    // Check if the move is orthogonal
    @Override
    public boolean isValid(int col, int row) {
        return this.col == col || this.row == row;
    }

    // Check if any move blocking it 
    @Override
    public boolean moveBlock(int col, int row) {
        // check left
        if (this.col > col) {
            for (int c = this.col - 1; c > col; c--) {
                if (board.getPiece(c, this.row) != null) {
                    return true;  
                }
            }
        }
        
        // check right
        if (this.col < col) {
            for (int c = this.col + 1; c < col; c++) {
                if (board.getPiece(c, this.row) != null) {
                    return true;  
                }
            }
        }
    
        // check up
        if (this.row > row) {
            for (int r = this.row - 1; r > row; r--) {
                if (board.getPiece(this.col, r) != null) {
                    return true;  
                }
            }
        }
    
        // check down
        if (this.row < row) {
            for (int r = this.row + 1; r < row; r++) {
                if (board.getPiece(this.col, r) != null) {
                    return true; 
                }
            }
        }
        // No block
        return false;  
    }


    // Check if the piece needs to be transformed
    public boolean shouldTransform() {
         // Tor transforms after 2 turns
        return turns >= 2; 
    }

    // Transform the Tor piece into an Xor piece
    public void transform() {
        if (shouldTransform()) {
            // Remove the Tor piece
            board.pieceList.remove(this);  
            
            // Add the new Xor piece at the same position
            Xor newXor = new Xor(board, col, row, isRed);  
            // Add the new Xor to the piece list
            board.pieceList.add(newXor); 
        }
    }
    
}
