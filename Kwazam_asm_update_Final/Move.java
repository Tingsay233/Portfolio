// Written by: Hiew Wei Cheng
// This is part of the Model
public class Move {
    int oldX;
    int oldY;
    int newX;
    int newY;

    Piece piece;
    Piece capture;
    
    public Move(Board board, Piece piece, int newX, int newY){
        this.oldX = piece.col;
        this.oldY = piece.row;
        this.newX = newX;
        this.newY = newY;

        this.piece = piece;
        this.capture = board.getPiece(newX, newY);
    }
}
