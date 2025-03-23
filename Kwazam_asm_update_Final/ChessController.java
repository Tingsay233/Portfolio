import java.awt.event.ActionListener;
import java.awt.event.MouseAdapter;
import java.awt.event.MouseEvent;
import java.io.*;
import javax.swing.*;
import java.awt.event.ActionEvent;

// Written by: Hiew Wei Cheng, Ng Jia Huang
// This part is the program Controller 
public class ChessController extends MouseAdapter{

    private final Board board; 
    private final BoardView view; 

    // Constructor
    public ChessController(Board board, BoardView view) {
        this.board = board;
        this.view = view;
    }

    @Override
    public void mouseDragged(MouseEvent e) {
        // If a piece is selected, move it according to mouse dragging
        if (board.selectedPiece != null) {
            // Make sure the piece image stay in the middle when dragging
            board.selectedPiece.posX = e.getX() - board.tileSize / 2;
            board.selectedPiece.posY = e.getY() - board.tileSize / 2;
            // Request view to repaint with updated positions
            view.repaint();  
        }
    }

    @Override
    public void mousePressed(MouseEvent e) {
        // Determine the tile clicked
        int col = e.getX() / board.tileSize;
        int row = e.getY() / board.tileSize;

        Piece pieceAtClickedLocation = board.getPiece(col, row);
        
        // If there's a piece at the clicked location, select it
        if (pieceAtClickedLocation != null) {
            board.selectedPiece = pieceAtClickedLocation;
        }
    }

    @Override
    public void mouseReleased(MouseEvent e) {
        int col = e.getX() / board.tileSize;
        int row = e.getY() / board.tileSize;

        if (board.selectedPiece != null) {
            Move move = new Move(board, board.selectedPiece, col, row);

        // This is to update the model, turn and flip the board
        if (board.isValidMove(move)) {
            board.allowToMove(move); 
            board.turn();  
            board.informOb();
        } else {
            // Reset the piece to original position if the move is invalid
            board.selectedPiece.posX = board.selectedPiece.col * board.tileSize;
            board.selectedPiece.posY = board.selectedPiece.row * board.tileSize;
        }
    }
        board.selectedPiece = null;
        view.repaint(); 
    }

    // Method for save button and add ActionListener to it
    public void saveButton(JButton save){
        save.addActionListener(new ActionListener() {
            public void actionPerformed(ActionEvent e){
                String file = JOptionPane.showInputDialog(view, "Enter save name: ");
                if(file != null){
                    if(!file.endsWith(".txt")){
                        file = file + ".txt";
                    }
                    File saveFile = new File(file);
                    board.saveGame(saveFile.getAbsolutePath());
                } else{
                    JOptionPane.showMessageDialog(view, "Error");
                }
            }
        });
    }

    // Method for load button and add ActionListener to it
    public void loadButton(JButton load) {
        load.addActionListener(new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                String file = JOptionPane.showInputDialog(view, "Enter load name: ");
                if (file != null) {
                    if (!file.endsWith(".txt")) {
                        file = file + ".txt";
                    }
                    File loadGame = new File(file);
                    board.loadsavedGame(loadGame.getAbsolutePath());
                    view.repaint();
                } else {
                    JOptionPane.showMessageDialog(view, "Error");
                }
            }
        });
    }
    
}
