import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.util.HashMap;
import javax.swing.*;


// Written by: Hiew Wei Cheng, Ng Jia Huang, Say Si Ting, Tan Jing Yi
// This is the View in the MVC design pattern
// MainMenu Class
class MainMenu extends JPanel {
    public MainMenu(JFrame parentFrame, HashMap<String, String> imagePaths) {
        setLayout(new BorderLayout());
        setOpaque(false);

        // Title Label
        JLabel titleLabel = new JLabel("Kwazam Chess", JLabel.CENTER);
        titleLabel.setFont(new Font("Forte", Font.BOLD, 30));
        titleLabel.setForeground(Color.WHITE);
        titleLabel.setBorder(BorderFactory.createEmptyBorder(20, 10, 20, 10));
        add(titleLabel, BorderLayout.NORTH);

        // Button Panel
        JPanel buttonPanel = new JPanel(new GridLayout(3, 1, 10, 10));
        buttonPanel.setOpaque(false);

        JButton multiPlayerButton = createButton("Start Game");
        multiPlayerButton.addActionListener(e -> {
            parentFrame.setContentPane(new GameScreen(imagePaths, "Player", parentFrame));
            parentFrame.revalidate();
            parentFrame.repaint();
        });

        JButton tutorialButton = createButton("Tutorial");
        tutorialButton.addActionListener(e -> {
            parentFrame.setContentPane(new TutorialScreen());
            parentFrame.revalidate();
            parentFrame.repaint();
        });

        JButton exitButton = createButton("Exit");
        exitButton.addActionListener(e -> System.exit(0));

        buttonPanel.add(multiPlayerButton);
        buttonPanel.add(tutorialButton);
        buttonPanel.add(exitButton);

        add(buttonPanel, BorderLayout.CENTER);
    }

    private JButton createButton(String text) {
        JButton button = new JButton(text);
        button.setForeground(Color.WHITE);
        button.setOpaque(false);
        button.setFont(new Font("Forte", Font.PLAIN, 20));
        button.setContentAreaFilled(false);
        button.setBorderPainted(false);
        return button;
    }
}

// Class for ChessView
class ChessView extends JPanel {
    private static final int ROWS = 8;
    private static final int COLS = 5;
    private static final int CELL_SIZE = 80;
    private HashMap<String, ImageIcon> imageIcons;

    public ChessView(HashMap<String, String> imagePaths) {
        setLayout(new GridLayout(ROWS, COLS));
        setPreferredSize(new Dimension(COLS * CELL_SIZE, ROWS * CELL_SIZE));

        imageIcons = new HashMap<>();

        for (String key : imagePaths.keySet()) {
            imageIcons.put(key, new ImageIcon(new ImageIcon(imagePaths.get(key))
                    .getImage().getScaledInstance(CELL_SIZE, CELL_SIZE, Image.SCALE_SMOOTH)));
        }
        drawGrid();
    }

    // Method to draw the grid
    private void drawGrid() {
        String[][] board = {
                { "Rtor", "Rbiz", "Rsau", "Rbiz", "Rxor" },
                { "Rram", "Rram", "Rram", "Rram", "Rram" },
                { null, null, null, null, null },
                { null, null, null, null, null },
                { null, null, null, null, null },
                { null, null, null, null, null },
                { "Bram", "Bram", "Bram", "Bram", "Bram" },
                { "Bxor", "Bbiz", "Bsau", "Bbiz", "Btor" }
        };

        for (int row = 0; row < ROWS; row++) {
            for (int col = 0; col < COLS; col++) {
                JPanel cell = new JPanel(new BorderLayout());
                cell.setPreferredSize(new Dimension(CELL_SIZE, CELL_SIZE));
                cell.setBackground((row + col) % 2 == 0 ? new Color(107, 59, 30) : new Color(190, 144, 76));

                String piece = board[row][col];
                if (piece != null && imageIcons.containsKey(piece)) {
                    JLabel pieceLabel = new JLabel(imageIcons.get(piece));
                    pieceLabel.setHorizontalAlignment(SwingConstants.CENTER);
                    pieceLabel.setVerticalAlignment(SwingConstants.CENTER);
                    cell.add(pieceLabel);
                }

                cell.setBorder(BorderFactory.createLineBorder(Color.BLACK));
                add(cell);
            }
        }
    }
}

// Class for GameScreen
class GameScreen extends JPanel {
    private JLabel timeLabel;
    private Timer gameTimer;
    private long startTime;
    private boolean isPaused;

    public GameScreen(HashMap<String, String> imagePaths, String mode, JFrame frame) {
        setLayout(new BorderLayout());

        JLabel label = new JLabel(mode + " Mode", SwingConstants.CENTER);
        label.setFont(new Font("Serif", Font.BOLD, 30));
        add(label, BorderLayout.NORTH);

        Board model = new Board(frame);
        PlayerMoveInfo playerMoveInfo = new PlayerMoveInfo();
        model.attachObserver(playerMoveInfo);
        BoardView boardView = new BoardView(model);
        boardView.setBounds(0,0,427,755);
        ChessController controller = new ChessController(model, boardView);
        boardView.addMouseListener(controller);
        boardView.addMouseMotionListener(controller);
        add(boardView, BorderLayout.CENTER);

        JPanel buttonPanel = new JPanel(new FlowLayout());
        JButton pauseButton = new JButton("Pause");
        pauseButton.addActionListener(e -> togglePause(pauseButton));
        JButton exitButton = new JButton("Exit to Main Menu");
        exitButton.addActionListener(e -> exitToMainMenu());
        JButton save = new JButton("Save");
        controller.saveButton(save); 
        buttonPanel.add(save);
        JButton loadSavedGame = new JButton("Load Game");
        controller.loadButton(loadSavedGame); 
        buttonPanel.add(loadSavedGame);

        timeLabel = new JLabel("Time: 00:00:00");
        timeLabel.setFont(new Font("Serif", Font.PLAIN, 20));

        // Add save, load, exit to mainmenu and timer to the GameScreen
        buttonPanel.add(pauseButton);
        buttonPanel.add(exitButton);
        buttonPanel.add(timeLabel);
        add(buttonPanel, BorderLayout.SOUTH);
        add(timeLabel, BorderLayout.NORTH);

        startTime = System.currentTimeMillis();
        isPaused = false;

        gameTimer = new Timer(1000, e -> updateTimer());
        gameTimer.start();
    }

    // Method to pause 
    private void togglePause(JButton pauseButton) {
        isPaused = !isPaused;
        pauseButton.setText(isPaused ? "Resume" : "Pause");
    }

    // Method to update the timer
    private void updateTimer() {
        if (!isPaused) {
            long elapsedTime = System.currentTimeMillis() - startTime;
            int hours = (int) (elapsedTime / 3600000);
            int minutes = (int) ((elapsedTime % 3600000) / 60000);
            int seconds = (int) ((elapsedTime % 60000) / 1000);
            timeLabel.setText(String.format("Time: %02d:%02d:%02d", hours, minutes, seconds));
        }
    }

    // Method for user to exit to MainMenu when playing
    private void exitToMainMenu() {
        JFrame frame = (JFrame) SwingUtilities.getWindowAncestor(this);

        // Ensure the image paths are preserved
        HashMap<String, String> imagePaths = new HashMap<>();
        imagePaths.put("Bbiz", getClass().getResource("Chessimages/BizB.png").getPath());
        imagePaths.put("Bram", getClass().getResource("Chessimages/RamB.png").getPath());
        imagePaths.put("Bsau", getClass().getResource("Chessimages/SauB.png").getPath());
        imagePaths.put("Btor", getClass().getResource("Chessimages/TorB.png").getPath());
        imagePaths.put("Bxor", getClass().getResource("Chessimages/XorB.png").getPath());
        imagePaths.put("Rbiz", getClass().getResource("Chessimages/BizR.png").getPath());
        imagePaths.put("Rram", getClass().getResource("Chessimages/RamR.png").getPath());
        imagePaths.put("Rsau", getClass().getResource("Chessimages/SauR.png").getPath());
        imagePaths.put("Rtor", getClass().getResource("Chessimages/TorR.png").getPath());
        imagePaths.put("Rxor", getClass().getResource("Chessimages/XorR.png").getPath());

        // Add layered pane
        JLayeredPane layeredPane = new JLayeredPane();
        layeredPane.setPreferredSize(new Dimension(424, 755));  // Ensure it fits inside the launcher

        // Add chess grid as the base layer
        ChessView chessView = new ChessView(imagePaths);
        chessView.setBounds(0, 0, 430, 761); // Adjust position and size of the chess grid
        layeredPane.add(chessView, JLayeredPane.DEFAULT_LAYER);    

        // Add main menu buttons as overlay layer
        // Pass the image paths to the menu
        MainMenu mainMenu = new MainMenu(frame, imagePaths); 
        // Adjust the position and size of the menu to overlay over the chess view
        mainMenu.setBounds(90, 200, 250, 300); 
        // Make the background of the menu transparent
        mainMenu.setOpaque(false); 
        layeredPane.add(mainMenu, JLayeredPane.PALETTE_LAYER);
        // Set the layered pane as the content pane
        frame.setContentPane(layeredPane);
        frame.revalidate();
        frame.repaint();
    }
}

// WinPage Class
class WinPage extends JPanel {
    public WinPage(String winnerSide) {
        setLayout(new BorderLayout());
        setBackground(Color.WHITE);

        JLabel winMessage = new JLabel(winnerSide + " Wins!", SwingConstants.CENTER);
        winMessage.setFont(new Font("Arial", Font.BOLD, 36));
        winMessage.setForeground(Color.BLUE);
        add(winMessage, BorderLayout.CENTER);

        JButton exitButton = new JButton("Exit");
        exitButton.setFont(new Font("Arial", Font.PLAIN, 18));
        exitButton.addActionListener(e -> System.exit(0));

        JPanel buttonPanel = new JPanel();
        buttonPanel.add(exitButton);

        add(buttonPanel, BorderLayout.SOUTH);
    }
}

// BoardView Class
class BoardView extends JPanel {
    private final Board model;
    public int col = 5;

    public BoardView(Board model) {
        this.model = model;
        
        setPreferredSize(new Dimension(model.col * model.tileSize, model.row * model.tileSize));
    }

    // Method to paint the board and print the piece to the board
    @Override
    public void paintComponent(Graphics g) {
        super.paintComponent(g);
        Graphics2D g2d = (Graphics2D) g;

        for (int r = 0; r < model.row; r++) {
            for (int c = 0; c < model.col; c++) {
                g2d.setColor((c + r) % 2 == 0 ? new Color(107, 59, 30) : new Color(190, 144, 76));
                g2d.fillRect(c * model.tileSize, r * model.tileSize, model.tileSize, model.tileSize);
            }
        }

        if (model.selectedPiece != null) {
            for (int r = 0; r < model.row; r++) {
                for (int c = 0; c < model.col; c++) {
                    if (model.isValidMove(new Move(model, model.selectedPiece, c, r))) {
                        g2d.setColor(new Color(68, 180, 57, 190));
                        g2d.fillRect(c * model.tileSize, r * model.tileSize, model.tileSize, model.tileSize);
                    }
                }
            }
        }

        for (Piece piece : model.pieceList) {
            piece.draw(g);
        }
    }
}

//Tutorial screen class
class TutorialScreen extends JPanel {
    // For managing slides
    private CardLayout cardLayout; 
    // Container for slides
    private JPanel slidePanel; 

    public TutorialScreen() {
        setLayout(new BorderLayout());

        // Initialize CardLayout for slides
        cardLayout = new CardLayout();
        slidePanel = new JPanel(cardLayout);

        // Add tutorial slides
        slidePanel.add(createSlide("The Ram Piece",
                "The Ram piece can only move forward, 1 step. " +
                        "If it reaches the end of the board, it turns around and starts heading back the other way. " +
                        "It cannot skip over other pieces.",
                "Chessimages/RamG.png"), "Slide1");

        slidePanel.add(createSlide("The Biz Piece",
                "The Biz piece moves in a 3x2 L shape in any orientation (like the knight in standard chess). " +
                        "This is the only piece that can skip over other pieces.",
                "Chessimages/BizG.png"), "Slide2");

        slidePanel.add(createSlide("The Tor Piece",
                "The Tor piece can move orthogonally only but can go any distance. It cannot skip over other pieces. " +
                        "However, after 2 turns, it transforms into the Xor piece.",
                "Chessimages/TorG.png"), "Slide3");

        slidePanel.add(createSlide("The Xor Piece",
                "The Xor piece can move diagonally only but can go any distance. It cannot skip over other pieces. " +
                        "However, after 2 turns, it transforms into the Tor piece.",
                "Chessimages/XorG.png"), "Slide4");

        slidePanel.add(createSlide("The Sau Piece",
                "The Sau piece can move only one step in any direction. " +
                        "The game ends when the Sau is captured by the other side.",
                "Chessimages/SauG.png"), "Slide5");

        // Add slide panel to the center
        add(slidePanel, BorderLayout.CENTER);

        // Navigation buttons panel
        JPanel navigationPanel = new JPanel(new FlowLayout());
        JButton prevButton = new JButton("Previous");
        JButton nextButton = new JButton("Next");

        // Action Listeners for navigation
        prevButton.addActionListener(e -> cardLayout.previous(slidePanel));
        nextButton.addActionListener(e -> cardLayout.next(slidePanel));

        navigationPanel.add(prevButton);
        navigationPanel.add(nextButton);

        // Add navigation buttons to the bottom
        add(navigationPanel, BorderLayout.SOUTH);

        // Create "Back to Main Menu" Button
        JButton backToMainMenuButton = new JButton("Back to Main Menu");
        backToMainMenuButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                navigateBackToMainMenu();
            }
        });

        // Add the "Back to Main Menu" button at the bottom
        JPanel backPanel = new JPanel();
        backPanel.add(backToMainMenuButton);
        add(backPanel, BorderLayout.NORTH);
    }

    // Helper method to create individual slides
    private JPanel createSlide(String title, String description, String imagePath) {
        JPanel slide = new JPanel(new BorderLayout());

        // Title label
        JLabel titleLabel = new JLabel(title, SwingConstants.CENTER);
        titleLabel.setFont(new Font("Serif", Font.BOLD, 24));
        slide.add(titleLabel, BorderLayout.NORTH);

        // Image display
        ImageIcon imageIcon = new ImageIcon(new ImageIcon(getClass().getResource(imagePath))
                .getImage().getScaledInstance(200, 200, Image.SCALE_SMOOTH));
        JLabel imageLabel = new JLabel(imageIcon, SwingConstants.CENTER);
        slide.add(imageLabel, BorderLayout.CENTER);

        // Description text
        JTextArea descriptionArea = new JTextArea(description);
        descriptionArea.setWrapStyleWord(true);
        descriptionArea.setLineWrap(true);
        descriptionArea.setEditable(false);
        descriptionArea.setFont(new Font("Serif", Font.PLAIN, 26));
        descriptionArea.setMargin(new Insets(10, 10, 10, 10));
        slide.add(descriptionArea, BorderLayout.SOUTH);

        return slide;
    }

    // Method to handle navigation back to the main menu
    private void navigateBackToMainMenu() {
        JFrame frame = (JFrame) SwingUtilities.getWindowAncestor(this);

        // Manually creating imagePaths for both sides of the chess pieces
        HashMap<String, String> imagePaths = new HashMap<>();
        imagePaths.put("Bbiz", getClass().getResource("Chessimages/BizB.png").getPath());
        imagePaths.put("Bram", getClass().getResource("Chessimages/RamB.png").getPath());
        imagePaths.put("Bsau", getClass().getResource("Chessimages/SauB.png").getPath());
        imagePaths.put("Btor", getClass().getResource("Chessimages/TorB.png").getPath());
        imagePaths.put("Bxor", getClass().getResource("Chessimages/XorB.png").getPath());
        imagePaths.put("Rbiz", getClass().getResource("Chessimages/BizR.png").getPath());
        imagePaths.put("Rram", getClass().getResource("Chessimages/RamR.png").getPath());
        imagePaths.put("Rsau", getClass().getResource("Chessimages/SauR.png").getPath());
        imagePaths.put("Rtor", getClass().getResource("Chessimages/TorR.png").getPath());
        imagePaths.put("Rxor", getClass().getResource("Chessimages/XorR.png").getPath());

         // Recreate the layered pane with the chessboard and main menu
         JLayeredPane layeredPane = new JLayeredPane();
         layeredPane.setPreferredSize(new Dimension(424, 755));
 
         // Add the chessboard as the base layer
         ChessView chessView = new ChessView(imagePaths);
         chessView.setBounds(0, 0, 430, 761);
         layeredPane.add(chessView, JLayeredPane.DEFAULT_LAYER);
 
         // Add the main menu as an overlay
         MainMenu mainMenu = new MainMenu(frame, imagePaths);
         mainMenu.setBounds(90, 200, 250, 300);
         layeredPane.add(mainMenu, JLayeredPane.PALETTE_LAYER);

        // Set the layered pane as the content pane
        frame.setContentPane(layeredPane);
        frame.revalidate();
        frame.repaint();
    }
}


// Main Application Entry Point
public class View {
    public static void main(String[] args) {
        JFrame frame = new JFrame("Kwazam Chess");
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        frame.setSize(500, 700);
        frame.setVisible(true);
    }    
}