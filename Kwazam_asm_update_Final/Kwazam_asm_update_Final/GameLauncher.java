import java.awt.*;
import java.util.HashMap;
import javax.swing.*;

// Written by: Tan Jing Yi
// This is the main file that run the program
public class GameLauncher extends JFrame {
    public GameLauncher() {
        setTitle("Chess Game");
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        // Keep the same size
        setSize(427, 755);  
        setLayout(new BorderLayout());

        HashMap<String, String> imagePaths = new HashMap<>();
        imagePaths.put("Bbiz",getClass().getResource("Chessimages/BizB.png").getPath());
        imagePaths.put("Bram",getClass().getResource("Chessimages/RamB.png").getPath());
        imagePaths.put("Bsau",getClass().getResource("Chessimages/SauB.png").getPath());
        imagePaths.put("Btor",getClass().getResource("Chessimages/TorB.png").getPath());
        imagePaths.put("Bxor",getClass().getResource("Chessimages/XorB.png").getPath());
        imagePaths.put("Rbiz",getClass().getResource("Chessimages/BizR.png").getPath());
        imagePaths.put("Rram",getClass().getResource("Chessimages/RamR.png").getPath());
        imagePaths.put("Rsau",getClass().getResource("Chessimages/SauR.png").getPath());
        imagePaths.put("Rtor",getClass().getResource("Chessimages/TorR.png").getPath());
        imagePaths.put("Rxor",getClass().getResource("Chessimages/XorR.png").getPath());

        // Add layered pane
        JLayeredPane layeredPane = new JLayeredPane();
        // Ensure it fits inside the launcher
        layeredPane.setPreferredSize(new Dimension(424, 755));  

        // Add chess grid as the base layer
        ChessView chessView = new ChessView(imagePaths);
        chessView.setBounds(0, 0, 430, 761); 
        layeredPane.add(chessView, JLayeredPane.DEFAULT_LAYER);    

        // Add main menu buttons as overlay layer
        // Pass the image paths to the menu
        MainMenu mainMenu = new MainMenu(this, imagePaths); 
        mainMenu.setBounds(90, 200, 250, 300); 
        mainMenu.setOpaque(false); 
        layeredPane.add(mainMenu, JLayeredPane.PALETTE_LAYER);

        add(layeredPane);
        pack();
        setVisible(true);
        
    }

    public static void main(String[] args) {
        new GameLauncher();
    }
}
