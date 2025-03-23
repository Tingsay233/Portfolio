import javax.swing.ImageIcon;

// Written by: Say Si Ting, Tan Jing Yi
// This is the Xor piece class
// It is inherit from the base class Piece
// This is also part of the Model
public class Xor extends Piece{

    private int turns;

    // Constructor
    public Xor(Board board, int col, int row, boolean isRed){
        super(board);
        this.col = col;
        this.row = row;
        this.posX = col * board.tileSize;
        this.posY = row * board.tileSize;
        this.isRed = isRed;
        this.name = "Xor";
        this.turns = 0;

        // if it is red use the red Tor image, else use blue
        if (isRed) {
            this.image = new ImageIcon(getClass().getResource("Chessimages/XorR.png")).getImage();
        } else {
            this.image = new ImageIcon(getClass().getResource("Chessimages/XorB.png")).getImage();
        }
    }

    // Check if the move is diagonal
    @Override
    public boolean isValid(int col, int row) {
        return Math.abs(this.col - col) == Math.abs(this.row - row);
    }

    // Check if any move blocking it 
    @Override
    public boolean moveBlock(int col, int row){
        // Check upleft
        if(this.col > col && this.row > row)
            for(int i = 1; i < Math.abs(this.col - col); i++)
                if(board.getPiece(this.col - i, this.row - i) != null)
                    return true;

        // Check upright
        if(this.col < col && this.row > row)
            for(int i = 1; i < Math.abs(this.col - col); i++)
                if(board.getPiece(this.col + i, this.row - i) != null)
                    return true;  
        
        // Check downleft
        if(this.col > col && this.row < row)
            for(int i = 1; i < Math.abs(this.col - col); i++)
                if(board.getPiece(this.col - i, this.row + i) != null)
                    return true;  

        // Check downright
        if(this.col < col && this.row < row)
            for(int i = 1; i < Math.abs(this.col - col); i++)
                if(board.getPiece(this.col + i, this.row + i) != null)
                    return true;  
                    
                    
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
            // Replace this Tor with an Xor
            // Remove the Tor piece
            board.pieceList.remove(this);  
            // Add a new Xor piece at the same position
            board.pieceList.add(new Tor(board, col, row, isRed));  
        }
    }
}
