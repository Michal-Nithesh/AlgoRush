package Patterns;

public class MediumPatterns {
    public static void main(String[] args) {
        System.out.println("--- StarPyramid(5) ---");
        StarPyramid(5);

        System.out.println("\n--- InvertedStarPyramid(5) ---");
        InvertedStarPyramid(5);

        System.out.println("\n--- DiamondStarPatternMethodI(5) ---");
        DiamondStarPatternMethodI(5);

        System.out.println("\n--- DiamondStarPatternMethodII(5) ---");
        DiamondStarPatternMethodII(5);

        System.out.println("\n--- HalfDiamondStarPattern(6) ---");
        HalfDiamondStarPattern(6);

        System.out.println("\n--- BinaryNumberTrianglePattern(5) ---");
        BinaryNumberTrianglePattern(5);

        System.out.println("\n--- NumberCrownPattern(5) ---");
        NumberCrownPattern(5);

        System.out.println("\n--- IncreasingNumberTrianglePattern(5) ---");
        IncreasingNumberTrianglePattern(5);

        System.out.println("\n--- IncreasingLetterTrianglePattern(5) ---");
        IncreasingLetterTrianglePattern(5);

        System.out.println("\n--- ReverseLetterTrianglePattern(5) ---");
        ReverseLetterTrianglePattern(5);

        System.out.println("\n--- AlphaRampPattern(5) ---");
        AlphaRampPattern(5);

        System.out.println("\n--- AlphaHillPattern(4) ---");
        AlphaHillPattern(4);
    }

    public static void StarPyramid(int n) {
        for (int i = 0; i < n; i++) {
            // Space
            for (int j = 0; j < n - i - 1; j++) {
                System.out.print(" ");
            }
            // Star
            for (int j = 0; j < 2 * i + 1; j++) {
                System.out.print("*");
            }
            System.out.println();
        }
    }

    public static void InvertedStarPyramid(int n) {
        for (int i = 0; i < n; i++) {
            // Print Space
            for (int j = 0; j < i; j++) {
                System.out.print(" ");
            }
            // Print Star
            for (int j = 0; j < 2 * (n - i) - 1; j++) {
                System.out.print("*");
            }
            // Print Space
            for (int j = 0; j < i; j++) {
                System.out.print(" ");
            }
            System.out.println();
        }
    }

    public static void DiamondStarPatternMethodI(int n) {
        StarPyramid(n);
        InvertedStarPyramid(n);
    }

    public static void DiamondStarPatternMethodII(int n) {
        // First half
        for (int i = 0; i < n; i++) {
            // Space
            for (int j = 0; j < n - i - 1; j++) {
                System.out.print(" ");
            }
            // Star
            for (int j = 0; j < 2 * i + 1; j++) {
                System.out.print("*");
            }
            System.out.println();
        }
        // Second Half
        for (int i = 1; i < n; i++) {
            // Space
            for (int j = 0; j < i; j++) {
                System.out.print(" ");
            }
            // Star
            for (int j = 0; j < 2 * (n - i) - 1; j++) {
                System.out.print("*");
            }
            System.out.println();
        }
    }

    public static void HalfDiamondStarPattern(int n) {
        for (int i = 0; i < n; i++) {
            // 1st half
            for (int j = 0; j <= i; j++) {
                System.out.print("*");
            }
            System.out.println();
        }
        // 2nd half
        for (int i = 1; i < n; i++) {
            for (int j = 0; j < n - i; j++) {
                System.out.print("*");
            }
            System.out.println();
        }
    }

    public static void BinaryNumberTrianglePattern(int n) {
        for (int i = 0; i < n; i++) {
            // Check how to start
            int start = (i % 2 == 0) ? 1 : 0;
            for (int j = 0; j <= i; j++) {
                System.out.print(start + " ");
                // To make it 0 and 1
                start = 1 - start;
            }
            System.out.println();
        }
    }

    public static void NumberCrownPattern(int n) {
        int space = 2 * (n - 1);
        for (int i = 1; i <= n; i++) {
            for (int j = 1; j <= i; j++) {
                System.out.print(j);
            }
            for (int j = 1; j <= space; j++) {
                System.out.print(" ");
            }
            for (int j = i; j >= 1; j--) {
                System.out.print(j);
            }
            System.out.println();
            space -= 2;
        }
    }

    public static void IncreasingNumberTrianglePattern(int n) {
        int num = 1;
        for (int i = 0; i < n; i++) {
            for (int j = 0; j <= i; j++) {
                System.out.print(num + " ");
                num++;
            }
            System.out.println();
        }
    }

    public static void IncreasingLetterTrianglePattern(int n) {
        for (int i = 0; i < n; i++) {
            for (char ch = 'A'; ch <= 'A' + i; ch++) {
                System.out.print(ch + " ");
            }
            System.out.println();
        }
    }

    public static void ReverseLetterTrianglePattern(int n) {
        for (int i = 0; i < n; i++) {
            for (char ch = 'A'; ch <= 'A' + n - 1 - i; ch++) {
                System.out.print(ch + " ");
            }
            System.out.println();
        }
    }

    public static void AlphaRampPattern(int n) {
        for (int i = 0; i < n; i++) {
            char ch = (char) ('A' + i);
            for (int j = 0; j <= i; j++) {
                System.out.print(ch + " ");
            }
            System.out.println();
        }
    }

    public static void AlphaHillPattern(int n) {
        for (int i = 0; i < n; i++) {
            // Space
            for (int j = 0; j < n - i - 1; j++) {
                System.out.print(" ");
            }
            for (char ch = 'A'; ch <= 'A' + 2 * i; ch++) {
                System.out.print(ch);
            }
            for (int j = 0; j < n - i - 1; j++) {
                System.out.print(" ");
            }
            System.out.println();
        }
    }
}
