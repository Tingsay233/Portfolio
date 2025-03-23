import javax.swing.ImageIcon;

// Written by: Hiew Wei Cheng
// This is part of the Model
// Biz class inherit from Piece class
public class Biz extends Piece{
    // constructor
    public Biz(Board board, int col, int row, boolean isRed){
        super(board);
        this.col = col;
        this.row = row;
        this.posX = col * board.tileSize;
        this.posY = row * board.tileSize;
        this.isRed = isRed;
        this.name = "Biz";

        // if it is red use the red Biz image, else use blue
        if (isRed) {
            this.image = new ImageIcon(getClass().getResource("Chessimages/BizR.png")).getImage();
        } else {
            this.image = new ImageIcon(getClass().getResource("Chessimages/BizB.png")).getImage();
        }
    }

    // Check is the move is 3x2 L shape (2 steps in one direction and 1 step in another)
    @Override
    public boolean isValid(int col, int row) {
        return Math.abs(col - this.col) * Math.abs(row - this.row) == 2;
    }
}
