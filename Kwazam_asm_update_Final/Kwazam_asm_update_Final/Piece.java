import java.awt.*;
// Written by: Say Si Ting, Tan Jing Yi
// This is the Base class for the piece
// This is also a part of the Model
public class Piece {
    public int col, row;
    public int posX, posY;
    public boolean isRed;
    public String name;
    protected Image image;

    Board board;
    
    public Piece(Board board){
        this.board = board;
    }

    // Method to draw the piece image to the board
    public void draw(Graphics g) {
        if (image != null) {
            // Make sure the piece is print in the middle of the tile
            Graphics2D g2d = (Graphics2D) g.create();
            int centerX = posX + board.tileSize / 2;
            int centerY = posY + board.tileSize / 2;
            
            // When the board flip, make sure the image of the chess piece is also flip and stay in the middle
            if (board.boardFlip) {
                g2d.rotate(Math.toRadians(180), centerX, centerY);
            }
    
            g2d.drawImage(image, posX, posY, board.tileSize, board.tileSize, null);
            g2d.dispose();
        }
    }
    public boolean canMove() {
        return (board.blueTurn && !this.isRed) || (!(board.blueTurn) && this.isRed);
    }    
    
    // Method to check the move is valid or not
    public boolean isValid(int col, int row){
        return true;
    }

    // Method to check if the path blocked by any piece or not
    public boolean moveBlock(int col, int row){
        return false;
    }

}
