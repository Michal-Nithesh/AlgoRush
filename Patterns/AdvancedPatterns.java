package Patterns;

public class AdvancedPatterns {
    public static void main(String[] args) {
        System.out.println("--- 1. Palindromic Alpha Hill (N = 5) ---");
        PalindromicAlphaHillPattern(5);

        System.out.println("\n--- 2. Reverse Alpha Triangle (N = 5) ---");
        ReverseAlphaTrianglePattern(5);

        System.out.println("\n--- 3. Symmetric Void / Inverted Butterfly Star (N = 5) ---");
        SymmetricVoidPattern(5);

        System.out.println("\n--- 4. Butterfly Star Pattern (N = 5) ---");
        ButterflyPattern(5);

        System.out.println("\n--- 5. Hollow Square Star Pattern (N = 5) ---");
        HollowSquarePattern(5);

        System.out.println("\n--- 6. Concentric Number Spiral (N = 5) ---");
        ConcentricNumberSpiralPattern(5);
    }

    /**
     * Pattern 1: Palindromic Alpha Hill
     *     A
     *    ABA
     *   ABCBA
     *  ABCDCBA
     * ABCDEDCBA
     */
    public static void PalindromicAlphaHillPattern(int n) {
        for (int i = 0; i < n; i++) {
            // Leading spaces
            for (int j = 0; j < n - i - 1; j++) {
                System.out.print(" ");
            }
            // Characters: increasing then decreasing
            char ch = 'A';
            int breakpoint = i;
            for (int j = 0; j < 2 * i + 1; j++) {
                System.out.print(ch);
                if (j < breakpoint) {
                    ch++;
                } else {
                    ch--;
                }
            }
            System.out.println();
        }
    }

    /**
     * Pattern 2: Reverse Alpha Triangle
     * E
     * D E
     * C D E
     * B C D E
     * A B C D E
     */
    public static void ReverseAlphaTrianglePattern(int n) {
        for (int i = 0; i < n; i++) {
            for (char ch = (char) ('A' + n - 1 - i); ch <= (char) ('A' + n - 1); ch++) {
                System.out.print(ch + " ");
            }
            System.out.println();
            System.out.println(); // Spacing as shown in prompt
        }
    }

    /**
     * Pattern 3: Symmetric Void / Inverted Butterfly Star Pattern
     * **********
     * ****  ****
     * ***    ***
     * **      **
     * *        *
     * *        *
     * **      **
     * ***    ***
     * ****  ****
     * **********
     */
    public static void SymmetricVoidPattern(int n) {
        // Upper Half
        for (int i = 0; i < n; i++) {
            // Left stars
            for (int j = 0; j < n - i; j++) {
                System.out.print("*");
            }
            // Middle spaces
            for (int j = 0; j < 2 * i; j++) {
                System.out.print(" ");
            }
            // Right stars
            for (int j = 0; j < n - i; j++) {
                System.out.print("*");
            }
            System.out.println();
        }

        // Lower Half
        for (int i = 0; i < n; i++) {
            // Left stars
            for (int j = 0; j <= i; j++) {
                System.out.print("*");
            }
            // Middle spaces
            for (int j = 0; j < 2 * (n - i - 1); j++) {
                System.out.print(" ");
            }
            // Right stars
            for (int j = 0; j <= i; j++) {
                System.out.print("*");
            }
            System.out.println();
        }
    }

    /**
     * Pattern 4: Butterfly Star Pattern
     * *        *
     * **      **
     * ***    ***
     * ****  ****
     * **********
     * ****  ****
     * ***    ***
     * **      **
     * *        *
     */
    public static void ButterflyPattern(int n) {
        int totalRows = 2 * n - 1;
        for (int i = 1; i <= totalRows; i++) {
            int stars = i;
            if (i > n) {
                stars = 2 * n - i;
            }
            int spaces = 2 * (n - stars);

            // Left stars
            for (int j = 1; j <= stars; j++) {
                System.out.print("*");
            }
            // Middle spaces
            for (int j = 1; j <= spaces; j++) {
                System.out.print(" ");
            }
            // Right stars
            for (int j = 1; j <= stars; j++) {
                System.out.print("*");
            }
            System.out.println();
        }
    }

    /**
     * Pattern 5: Hollow Square Star Pattern
     * *****
     * *   *
     * *   *
     * *   *
     * *****
     */
    public static void HollowSquarePattern(int n) {
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                if (i == 0 || j == 0 || i == n - 1 || j == n - 1) {
                    System.out.print("*");
                } else {
                    System.out.print(" ");
                }
            }
            System.out.println();
        }
    }

    /**
     * Pattern 6: Concentric Number Spiral
     * 5 5 5 5 5 5 5 5 5 
     * 5 4 4 4 4 4 4 4 5 
     * 5 4 3 3 3 3 3 4 5 
     * 5 4 3 2 2 2 3 4 5 
     * 5 4 3 2 1 2 3 4 5 
     * 5 4 3 2 2 2 3 4 5 
     * 5 4 3 3 3 3 3 4 5 
     * 5 4 4 4 4 4 4 4 5 
     * 5 5 5 5 5 5 5 5 5 
     */
    public static void ConcentricNumberSpiralPattern(int n) {
        int size = 2 * n - 1;
        for (int i = 0; i < size; i++) {
            for (int j = 0; j < size; j++) {
                int top = i;
                int left = j;
                int bottom = size - 1 - i;
                int right = size - 1 - j;
                int minDistance = Math.min(Math.min(top, bottom), Math.min(left, right));
                System.out.print((n - minDistance) + " ");
            }
            System.out.println();
        }
    }
}
