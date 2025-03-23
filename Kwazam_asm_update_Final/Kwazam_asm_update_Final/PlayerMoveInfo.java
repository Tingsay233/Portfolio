// Written by: Ng Jia Huang
// This class is inherit from Observer
// This class is used to print the movement of the chess piece
public class PlayerMoveInfo implements Observer{
    @Override
    public void update(Board board){
        // Print the position of the chess piece after every turn
        if(board.selectedPiece != null && board.selectedPiece.isRed){
            System.out.println("Red " + board.selectedPiece.getClass().getSimpleName() + "(" + board.selectedPiece.col + ", " + board.selectedPiece.row + ")");
        }
        else if(board.selectedPiece != null && !board.selectedPiece.isRed){
            System.out.println("Blue " + board.selectedPiece.getClass().getSimpleName() + "(" + board.selectedPiece.col + ", " + board.selectedPiece.row + ")");
        }
    }
}
