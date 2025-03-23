import javax.swing.ImageIcon;
// Written by: Hiew Wei Cheng
// This is the Sau piece class
// It is inherit from the base class Piece
// This is also part of the model
public class Sau extends Piece{
    // Constructor
    public Sau(Board board, int col, int row, boolean isRed){
        super(board);
        this.col = col;
        this.row = row;
        this.posX = col * board.tileSize;
        this.posY = row * board.tileSize;
        this.isRed = isRed;
        this.name = "Sau";

        // if it is red use the red Sau image, else use blue
        if (isRed) {
            this.image = new ImageIcon(getClass().getResource("Chessimages/SauR.png")).getImage();
        } else {
            this.image = new ImageIcon(getClass().getResource("Chessimages/SauB.png")).getImage();
        }
    }

    // Check if the move is valid 
    @Override
    public boolean isValid(int col, int row){
        // Check one step diagonal or one step orthogonal
        return Math.abs((col - this.col) * (row - this.row)) == 1 || Math.abs(col - this.col) + Math.abs(row - this.row) == 1;
    }

}
