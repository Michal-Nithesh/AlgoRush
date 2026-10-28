package Patterns;

public class EasyPatterns {
    public static void main(String[] args) {
        System.out.println("--- RectangularStarPattern(4) ---");
        RectangularStarPattern(4);

        System.out.println("\n--- RightAngledTrianglePattern(4) ---");
        RightAngledTrianglePattern(4);

        System.out.println("\n--- RightAngledNumberPyramid(5) ---");
        RightAngledNumberPyramid(5);

        System.out.println("\n--- RightAngledNumberPyramidII(5) ---");
        RightAngledNumberPyramidII(5);

        System.out.println("\n--- InvertedRightPyramid(5) ---");
        InvertedRightPyramid(5);

        System.out.println("\n--- InvertedNumberedRightPyramid(5) ---");
        InvertedNumberedRightPyramid(5);
    }

    public static void RectangularStarPattern(int n) {
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                System.out.print("* ");
            }
            System.out.println();
        }
    }

    public static void RightAngledTrianglePattern(int n) {
        for (int i = 0; i < n; i++) {
            for (int j = 0; j <= i; j++) {
                System.out.print("* ");
            }
            System.out.println();
        }
    }

    public static void RightAngledNumberPyramid(int n) {
        for (int i = 1; i <= n; i++) {
            for (int j = 1; j <= i; j++) {
                System.out.print(j + " ");
            }
            System.out.println();
        }
    }

    public static void RightAngledNumberPyramidII(int n) {
        for (int i = 1; i <= n; i++) {
            for (int j = 1; j <= i; j++) {
                System.out.print(i + " ");
            }
            System.out.println();
        }
    }

    public static void InvertedRightPyramid(int n) {
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n - i; j++) {
                System.out.print("* ");
            }
            System.out.println();
        }
    }

    public static void InvertedNumberedRightPyramid(int n) {
        for (int i = 0; i < n; i++) {
            for (int j = 1; j <= n - i; j++) {
                System.out.print(j + " ");
            }
            System.out.println();
        }
    }
}
