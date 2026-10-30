import json
import re
import html

# Load leetcode dataset
with open('/tmp/leetcode_dataset.json') as f:
    lc_data = json.load(f)

def clean_html(raw_html):
    if not raw_html:
        return ''
    text = raw_html
    text = re.sub(r'</?(?:strong|b|em|i|code|a|span)[^>]*>', '', text)
    text = re.sub(r'<p[^>]*>', '', text)
    text = re.sub(r'</p>', '\n\n', text)
    text = re.sub(r'<pre[^>]*>', '\n', text)
    text = re.sub(r'</pre>', '\n\n', text)
    text = re.sub(r'<li>', '• ', text)
    text = re.sub(r'</li>', '\n', text)
    text = re.sub(r'</?(?:ul|ol)[^>]*>', '\n', text)
    text = re.sub(r'&nbsp;', ' ', text)
    text = html.unescape(text)
    lines = [line.rstrip() for line in text.split('\n')]
    cleaned = '\n'.join(lines)
    cleaned = re.sub(r'\n{3,}', '\n\n', cleaned).strip()
    return cleaned

lc_by_slug = {}
lc_by_title = {}
for item in lc_data:
    q_link = item.get('question_link', '')
    title = item.get('title', '').strip()
    desc = clean_html(item.get('description', ''))
    if q_link:
        slug = q_link.rstrip('/').split('/')[-1].lower()
        lc_by_slug[slug] = desc
    if title:
        lc_by_title[title.lower()] = desc

# Comprehensive manual descriptions with inputs and outputs for standard DSA problems
CUSTOM_DESCRIPTIONS = {
    # Basic Maths
    "count all digits of a number": """Given an integer N, count and return the total number of digits present in N.

Example 1:
Input: N = 12345
Output: 5

Example 2:
Input: N = 7
Output: 1

Constraints:
• 0 <= N <= 10^9""",

    "count number of odd digits in a number": """Given an integer N, return the count of odd digits (1, 3, 5, 7, 9) present in N.

Example 1:
Input: N = 12345
Output: 3
Explanation: The odd digits are 1, 3, and 5.

Example 2:
Input: N = 2468
Output: 0""",

    "return the largest digit in a number": """Given an integer N, find and return the largest single digit present in N.

Example 1:
Input: N = 2941
Output: 9

Example 2:
Input: N = 55
Output: 5""",

    "factorial of a given number": """Given an integer N, compute and return the factorial of N (N!).

Example 1:
Input: N = 5
Output: 120
Explanation: 5! = 5 * 4 * 3 * 2 * 1 = 120.

Example 2:
Input: N = 0
Output: 1""",

    "check for prime number": """Given an integer N, determine whether it is a prime number. Return true if N is prime, otherwise false.

Example 1:
Input: N = 7
Output: true

Example 2:
Input: N = 10
Output: false
Explanation: 10 has divisors 1, 2, 5, 10, so it is composite.""",

    "check if a number is prime or not": """Given an integer N, determine whether it is a prime number using recursion or an optimal trial division method.

Example 1:
Input: N = 11
Output: true

Example 2:
Input: N = 1
Output: false
Explanation: 1 is neither prime nor composite.""",

    "gcd of two numbers": """Given two positive integers a and b, find and return their Greatest Common Divisor (GCD) using the Euclidean algorithm.

Example 1:
Input: a = 20, b = 15
Output: 5

Example 2:
Input: a = 9, b = 28
Output: 1""",

    "lcm of two numbers": """Given two positive integers a and b, compute and return their Least Common Multiple (LCM).

Example 1:
Input: a = 4, b = 6
Output: 12

Example 2:
Input: a = 5, b = 7
Output: 35""",

    "divisors of a number": """Given an integer N, find and return all positive divisors of N in sorted order.

Example 1:
Input: N = 12
Output: [1, 2, 3, 4, 6, 12]

Example 2:
Input: N = 7
Output: [1, 7]""",

    # Basic Arrays
    "sum of array elements": """Given an array of integers nums, compute and return the sum of all its elements.

Example 1:
Input: nums = [1, 2, 3, 4, 5]
Output: 15

Example 2:
Input: nums = [-1, 10, -5]
Output: 4""",

    "sum of array elements ii": """Given an array of integers nums, compute and return the sum of all its elements recursively.

Example 1:
Input: nums = [1, 2, 3, 4, 5]
Output: 15

Example 2:
Input: nums = [10, -2, 5]
Output: 13""",

    "count of odd numbers in array": """Given an array of integers nums, count and return how many numbers in the array are odd.

Example 1:
Input: nums = [1, 2, 3, 4, 5]
Output: 3

Example 2:
Input: nums = [2, 4, 6]
Output: 0""",

    "check if the array is sorted i": """Given an array nums of n integers, return true if the array is sorted in non-decreasing order (nums[i] <= nums[i+1]), otherwise false.

Example 1:
Input: nums = [1, 2, 2, 4, 5]
Output: true

Example 2:
Input: nums = [5, 4, 3, 2, 1]
Output: false""",

    "reverse an array": """Given an array nums, reverse the elements in-place and return the array.

Example 1:
Input: nums = [1, 2, 3, 4, 5]
Output: [5, 4, 3, 2, 1]

Example 2:
Input: nums = [10, 20]
Output: [20, 10]""",

    "reverse an array 2": """Given an array nums, reverse the array using recursion (swapping two pointers from ends towards center).

Example 1:
Input: nums = [5, 4, 3, 2, 1]
Output: [1, 2, 3, 4, 5]

Example 2:
Input: nums = [1]
Output: [1]""",

    # Basic Hashing
    "second highest occurring element": """Given an array nums, find the element that has the second highest frequency. If frequencies tie, choose the smaller numerical value.

Example 1:
Input: nums = [1, 2, 2, 3, 3, 3]
Output: 2
Explanation: 3 has frequency 3 (highest), 2 has frequency 2 (second highest).

Example 2:
Input: nums = [4, 4, 5, 5, 6]
Output: 4""",

    "sum of highest and lowest frequency": """Given an array nums, find the maximum frequency and the minimum frequency among all distinct elements, and return the sum of these two frequencies.

Example 1:
Input: nums = [1, 2, 2, 3, 3, 3]
Output: 4
Explanation: Max frequency = 3 (element 3), Min frequency = 1 (element 1). Sum = 3 + 1 = 4.

Example 2:
Input: nums = [10, 10, 10]
Output: 6""",

    # Basic Recursion
    "sum of first n numbers": """Given an integer N, calculate and return the sum of the first N natural numbers using recursion.

Example 1:
Input: N = 5
Output: 15
Explanation: 1 + 2 + 3 + 4 + 5 = 15.

Example 2:
Input: N = 3
Output: 6""",

    "sum of digits in a given number": """Given an integer N, find the sum of its digits recursively until all digits are processed.

Example 1:
Input: N = 412
Output: 7
Explanation: 4 + 1 + 2 = 7.

Example 2:
Input: N = 99
Output: 18""",

    # Sorting
    "selection sort": """Given an array of integers nums, sort the array in ascending order using the Selection Sort algorithm.

Selection sort repeatedly finds the minimum element from the unsorted part and puts it at the beginning.

Example 1:
Input: nums = [64, 25, 12, 22, 11]
Output: [11, 12, 22, 25, 64]

Example 2:
Input: nums = [4, 1, 3, 9, 7]
Output: [1, 3, 4, 7, 9]

Constraints:
• 1 <= nums.length <= 10^3
• Time Complexity: O(n^2), Space Complexity: O(1)""",

    "bubble sort": """Given an array of integers nums, sort the array in ascending order using the Bubble Sort algorithm.

Bubble Sort repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.

Example 1:
Input: nums = [5, 1, 4, 2, 8]
Output: [1, 2, 4, 5, 8]

Example 2:
Input: nums = [3, 2, 1]
Output: [1, 2, 3]

Constraints:
• Time Complexity: O(n^2) worst/average, O(n) best if optimized with swap flag.""",

    "recursive bubble sort": """Given an array of integers nums, sort the array in ascending order using Bubble Sort implemented recursively.

Example 1:
Input: nums = [13, 46, 24, 52, 20, 9]
Output: [9, 13, 20, 24, 46, 52]

Example 2:
Input: nums = [5, 4, 3, 2, 1]
Output: [1, 2, 3, 4, 5]""",

    "insertion sorting": """Given an array of integers nums, sort the array in ascending order using the Insertion Sort algorithm.

Insertion Sort builds the final sorted array one item at a time by repeatedly taking the next element and inserting it into its correct position.

Example 1:
Input: nums = [12, 11, 13, 5, 6]
Output: [5, 6, 11, 12, 13]

Example 2:
Input: nums = [4, 3, 2, 10, 12, 1, 5, 6]
Output: [1, 2, 3, 4, 5, 6, 10, 12]""",

    "recursive insertion sort": """Given an array of integers nums, sort the array in ascending order using Insertion Sort implemented recursively.

Example 1:
Input: nums = [12, 11, 13, 5, 6]
Output: [5, 6, 11, 12, 13]

Example 2:
Input: nums = [3, 1, 2]
Output: [1, 2, 3]""",

    "merge sorting": """Given an array of integers nums, sort the array in ascending order using the Divide and Conquer Merge Sort algorithm.

Merge Sort recursively divides the array into halves, sorts each half, and merges the two sorted halves in linear time.

Example 1:
Input: nums = [4, 1, 3, 9, 7]
Output: [1, 3, 4, 7, 9]

Example 2:
Input: nums = [10, 9, 8, 7, 6]
Output: [6, 7, 8, 9, 10]

Constraints:
• Time Complexity: O(n log n) in all cases, Space Complexity: O(n).""",

    "quick sorting": """Given an array of integers nums, sort the array in ascending order using the Quick Sort algorithm.

Quick Sort chooses a pivot element, partitions the array such that elements smaller than the pivot are on the left and larger on the right, and then recursively sorts the sub-arrays.

Example 1:
Input: nums = [4, 6, 2, 5, 7, 9, 1, 3]
Output: [1, 2, 3, 4, 5, 6, 7, 9]

Example 2:
Input: nums = [10, 80, 30, 90, 40, 50, 70]
Output: [10, 30, 40, 50, 70, 80, 90]

Constraints:
• Average Time Complexity: O(n log n), In-place space complexity O(log n) call stack.""",

    # Arrays Fundamentals & Logic
    "linear search": """Given an array nums of n integers and an integer target, return the index of target in nums, or -1 if target is not present.

Example 1:
Input: nums = [1, 2, 3, 4, 5], target = 3
Output: 2

Example 2:
Input: nums = [5, 4, 3, 2, 1], target = 6
Output: -1""",

    "largest element ": """Given an array of integers nums, find and return the largest element present in the array.

Example 1:
Input: nums = [2, 5, 1, 3, 0]
Output: 5

Example 2:
Input: nums = [8, 10, 5, 7, 9]
Output: 10""",

    "second largest element": """Given an array of integers nums, find the second largest distinct element in the array. If no second largest distinct element exists, return -1.

Example 1:
Input: nums = [1, 2, 4, 7, 7, 5]
Output: 5

Example 2:
Input: nums = [10, 10, 10]
Output: -1""",

    "union of two sorted arrays": """Given two sorted arrays arr1 and arr2, return a list containing the union of both arrays in ascending order without duplicate elements.

Example 1:
Input: arr1 = [1, 2, 3, 4, 5], arr2 = [1, 2, 3, 6, 7]
Output: [1, 2, 3, 4, 5, 6, 7]

Example 2:
Input: arr1 = [2, 2, 3], arr2 = [2, 3, 4]
Output: [2, 3, 4]""",

    "intersection of two sorted arrays": """Given two sorted arrays arr1 and arr2, find and return the intersection of the two arrays (elements common to both, respecting multiplicities).

Example 1:
Input: arr1 = [1, 2, 3, 3, 4, 5, 6], arr2 = [3, 3, 5]
Output: [3, 3, 5]

Example 2:
Input: arr1 = [1, 2, 3], arr2 = [4, 5, 6]
Output: []""",

    "pascal's triangle iii": """Given row number r and column number c (both 1-indexed), find and return the element at position (r, c) in Pascal's triangle.

Example 1:
Input: r = 5, c = 3
Output: 6
Explanation: Row 5 of Pascal's triangle is [1, 4, 6, 4, 1]. The 3rd element is 6.

Example 2:
Input: r = 1, c = 1
Output: 1""",

    "find the repeating and missing number": """Given an unsorted array of size n containing numbers from 1 to n with exactly one number missing and one number repeating, find and return [repeating, missing].

Example 1:
Input: nums = [3, 1, 2, 5, 3]
Output: [3, 4]
Explanation: 3 occurs twice, and 4 is missing.

Example 2:
Input: nums = [1, 2, 2, 4]
Output: [2, 3]""",

    "count inversions": """Given an array of integers nums, count the number of inversions. A pair of indices (i, j) is an inversion if i < j and nums[i] > nums[j].

Example 1:
Input: nums = [5, 3, 2, 4, 1]
Output: 8

Example 2:
Input: nums = [1, 2, 3, 4, 5]
Output: 0""",

    "count subarrays with given xor k": """Given an array of integers nums and an integer K, return the total number of continuous subarrays having bitwise XOR of their elements equal to K.

Example 1:
Input: nums = [4, 2, 2, 6, 4], K = 6
Output: 4

Example 2:
Input: nums = [5, 6, 7, 8, 9], K = 5
Output: 2""",

    # Binary Search
    "lower bound ": """Given a sorted array of integers nums and an integer x, find the index of the lower bound of x.
The lower bound is the first index where nums[index] >= x. If all elements are smaller than x, return n.

Example 1:
Input: nums = [1, 2, 2, 3, 3, 5], x = 2
Output: 1

Example 2:
Input: nums = [1, 2, 8, 10, 11, 12, 19], x = 0
Output: 0""",

    "upper bound": """Given a sorted array of integers nums and an integer x, find the index of the upper bound of x.
The upper bound is the first index where nums[index] > x. If no such element exists, return n.

Example 1:
Input: nums = [1, 2, 2, 3], x = 2
Output: 3

Example 2:
Input: nums = [3, 5, 8, 9], x = 9
Output: 4""",

    "floor and ceil in sorted array": """Given a sorted array nums and an integer x, find the floor (largest element <= x) and ceil (smallest element >= x) in the array. Return -1 for either if it does not exist.

Example 1:
Input: nums = [3, 4, 4, 7, 8, 10], x = 5
Output: [4, 7]
Explanation: Floor is 4, Ceil is 7.

Example 2:
Input: nums = [3, 4, 4, 7, 8, 10], x = 2
Output: [-1, 3]""",

    "find out how many times the array is rotated": """Given an array nums of distinct integers sorted in ascending order and rotated an unknown number of times, find how many times the array has been rotated (index of minimum element).

Example 1:
Input: nums = [4, 5, 6, 7, 0, 1, 2]
Output: 4
Explanation: The original sorted array was rotated 4 times to the right.

Example 2:
Input: nums = [1, 2, 3, 4, 5]
Output: 0""",

    "count occurrences in a sorted array": """Given a sorted array nums and an integer target, count the number of occurrences of target using binary search in O(log n) time.

Example 1:
Input: nums = [1, 1, 2, 2, 2, 2, 3], target = 2
Output: 4

Example 2:
Input: nums = [1, 1, 2, 3], target = 4
Output: 0""",

    "find nth root of a number": """Given two positive integers N and M, find the integer Nth root of M (an integer x such that x^N = M). If the Nth root is not an integer, return -1.

Example 1:
Input: N = 3, M = 27
Output: 3

Example 2:
Input: N = 4, M = 69
Output: -1""",

    "aggressive cows": """You are given an array stalls denoting the coordinates of stalls on a line and an integer K (number of aggressive cows). Assign cows to stalls such that the minimum distance between any two cows is as large as possible. Return this maximum possible minimum distance.

Example 1:
Input: stalls = [0, 3, 4, 7, 10, 9], K = 4
Output: 3
Explanation: Place cows at stalls 0, 3, 7, 10. The minimum distance is 3.

Example 2:
Input: stalls = [1, 2, 8, 4, 9], K = 3
Output: 3""",

    "kth element of 2 sorted arrays": """Given two sorted arrays arr1 and arr2 of sizes m and n, and an integer k, find the element that would be at the kth position of the combined sorted array in O(log(min(m, n))) time.

Example 1:
Input: arr1 = [2, 3, 6, 7, 9], arr2 = [1, 4, 8, 10], k = 5
Output: 6

Example 2:
Input: arr1 = [100, 112, 256, 349, 770], arr2 = [72, 86, 113, 119, 265, 445, 892], k = 7
Output: 256""",

    "find row with maximum 1's": """Given a boolean 2D array matrix of dimensions N x M where each row is sorted, find the 0-based index of the first row that has the maximum number of 1s. If no row has 1s, return -1.

Example 1:
Input: matrix = [[0, 1, 1, 1], [0, 0, 1, 1], [1, 1, 1, 1], [0, 0, 0, 0]]
Output: 2
Explanation: Row 2 has four 1s.

Example 2:
Input: matrix = [[0, 0], [0, 0]]
Output: -1""",

    # Strings
    "count number of substrings": """Given a string s of lowercase letters and an integer k, count the number of substrings that have exactly k distinct characters.

Example 1:
Input: s = "pqpqs", k = 2
Output: 7

Example 2:
Input: s = "aabacbebebe", k = 3
Output: 10""",

    # Recursion
    "reverse a stack": """You are given a stack St. You must reverse the elements in the stack using recursion only, without using any auxiliary loop construct.

Example 1:
Input: stack = [3, 2, 1, 7, 6] (top is 6)
Output: [6, 7, 1, 2, 3] (top is 3)

Example 2:
Input: stack = [4, 3, 9, 6]
Output: [6, 9, 3, 4]""",

    "check if there exists a subsequence with sum k": """Given an array nums and an integer K, determine if there exists at least one non-empty subsequence whose elements sum up to K. Return true if exists, otherwise false.

Example 1:
Input: nums = [1, 2, 3, 4, 5], K = 8
Output: true
Explanation: Subsequence [3, 5] sums to 8.

Example 2:
Input: nums = [1, 2, 4], K = 8
Output: false""",

    "count all subsequences with sum k": """Given an array nums and an integer K, count and return the total number of subsequences whose sum is equal to K.

Example 1:
Input: nums = [1, 2, 1], K = 2
Output: 2
Explanation: [1, 1] and [2] sum to 2.

Example 2:
Input: nums = [1, 2, 3, 4], K = 5
Output: 2
Explanation: [1, 4] and [2, 3].""",

    "generate binary strings without consecutive 1s": """Given an integer K, generate all binary strings of size K that do not contain two consecutive 1s.

Example 1:
Input: K = 3
Output: ["000", "001", "010", "100", "101"]

Example 2:
Input: K = 2
Output: ["00", "01", "10"]""",

    "rat in a maze": """Consider a rat placed at (0, 0) in an N x N square matrix grid. The rat must reach (N-1, N-1). It can move Up, Down, Left, or Right in cells containing 1. Find all sorted alphabetical paths the rat can take ('D', 'L', 'R', 'U').

Example 1:
Input: grid = [[1, 0, 0, 0], [1, 1, 0, 1], [1, 1, 0, 0], [0, 1, 1, 1]]
Output: ["DDRDRR", "DRDDRR"]

Example 2:
Input: grid = [[1, 0], [1, 0]]
Output: []""",

    "m coloring problem": """Given an undirected graph with V vertices and an integer M, determine whether the graph can be colored with at most M colors such that no two adjacent vertices share the same color.

Example 1:
Input: V = 4, edges = [[0, 1], [1, 2], [2, 3], [3, 0], [0, 2]], M = 3
Output: true

Example 2:
Input: V = 3, edges = [[0, 1], [1, 2], [2, 0]], M = 2
Output: false""",

    # Linked List
    "traversal in linked list": """Given the head of a singly linked list, traverse through all the nodes from head to tail and return their values as an array.

Example 1:
Input: head = [1, 2, 3, 4, 5]
Output: [1, 2, 3, 4, 5]

Example 2:
Input: head = []
Output: []""",

    "find the length of the linked list": """Given the head of a singly linked list, count and return the total number of nodes in the linked list.

Example 1:
Input: head = [1, 2, 3, 4, 5]
Output: 5

Example 2:
Input: head = [7]
Output: 1""",

    "search in linked list": """Given the head of a singly linked list and an integer key, return true if key exists in the linked list, otherwise return false.

Example 1:
Input: head = [1, 2, 3, 4], key = 3
Output: true

Example 2:
Input: head = [1, 2, 3, 4], key = 5
Output: false""",

    "deletion of the tail of linked list": """Given the head of a singly linked list, delete the last node (tail) of the list and return the updated head.

Example 1:
Input: head = [1, 2, 3, 4, 5]
Output: [1, 2, 3, 4]

Example 2:
Input: head = [10]
Output: []""",

    "deletion of the kth element of linked list": """Given the head of a singly linked list and an integer k, delete the k-th node (1-based index) and return the updated head.

Example 1:
Input: head = [1, 2, 3, 4, 5], k = 3
Output: [1, 2, 4, 5]

Example 2:
Input: head = [10, 20], k = 1
Output: [20]""",

    "delete the element with value x": """Given the head of a singly linked list and an integer x, delete the first occurrence of the node with value x and return the updated head.

Example 1:
Input: head = [1, 2, 3, 4], x = 3
Output: [1, 2, 4]

Example 2:
Input: head = [5], x = 5
Output: []""",

    "insertion at the head of linked list": """Given the head of a singly linked list and an integer val, insert a new node with value val at the beginning (head) of the linked list and return the new head.

Example 1:
Input: head = [2, 3, 4], val = 1
Output: [1, 2, 3, 4]

Example 2:
Input: head = [], val = 5
Output: [5]""",

    "insertion at the tail of linked list": """Given the head of a singly linked list and an integer val, insert a new node with value val at the end (tail) of the linked list and return the head.

Example 1:
Input: head = [1, 2, 3], val = 4
Output: [1, 2, 3, 4]

Example 2:
Input: head = [], val = 1
Output: [1]""",

    "insertion at the kth position of linked list": """Given the head of a singly linked list, an integer val, and a 1-based position k, insert a new node with value val at the k-th position and return the head.

Example 1:
Input: head = [1, 2, 4, 5], val = 3, k = 3
Output: [1, 2, 3, 4, 5]

Example 2:
Input: head = [2, 3], val = 1, k = 1
Output: [1, 2, 3]""",

    "insertion before the value x in linked list": """Given the head of a singly linked list, an integer val, and a target value x, insert a new node with value val immediately before the first node with value x.

Example 1:
Input: head = [1, 2, 4, 5], val = 3, x = 4
Output: [1, 2, 3, 4, 5]

Example 2:
Input: head = [2, 3], val = 1, x = 2
Output: [1, 2, 3]""",

    # Doubly Linked List
    "convert array to doubly linked list": """Given an array of integers arr, construct a Doubly Linked List from the array and return the head pointer.

Example 1:
Input: arr = [1, 2, 3, 4, 5]
Output: 1 <-> 2 <-> 3 <-> 4 <-> 5

Example 2:
Input: arr = [10]
Output: 10""",

    "delete head of doubly linked list": """Given the head of a Doubly Linked List, delete the first node (head) and return the new head.

Example 1:
Input: head = [1, 2, 3, 4]
Output: [2, 3, 4]

Example 2:
Input: head = [5]
Output: []""",

    "delete tail of doubly linked list": """Given the head of a Doubly Linked List, delete the last node (tail) and return the head.

Example 1:
Input: head = [1, 2, 3, 4]
Output: [1, 2, 3]

Example 2:
Input: head = [5]
Output: []""",

    "delete kth element of doubly linked list": """Given the head of a Doubly Linked List and an integer k, delete the k-th node (1-based index) and return the head.

Example 1:
Input: head = [10, 20, 30, 40], k = 2
Output: [10, 30, 40]

Example 2:
Input: head = [10], k = 1
Output: []""",

    "removing given node in doubly linked list": """Given a direct pointer to a node in a Doubly Linked List (not the head node), delete this node in O(1) time.

Example 1:
Input: head = [1, 2, 3, 4], targetNode = node(3)
Output: [1, 2, 4]""",

    "insert node before head in doubly linked list": """Given the head of a Doubly Linked List and an integer val, insert a new node with value val before the head and return the new head.

Example 1:
Input: head = [2, 3, 4], val = 1
Output: [1, 2, 3, 4]""",

    "insert node before tail in doubly linked list": """Given the head of a Doubly Linked List and an integer val, insert a new node with value val immediately before the tail node.

Example 1:
Input: head = [1, 2, 4], val = 3
Output: [1, 2, 3, 4]""",

    "insert node before (kth node) in doubly linked list": """Given the head of a Doubly Linked List, an integer val, and an integer k (1-based index), insert a new node with value val before the k-th node.

Example 1:
Input: head = [10, 20, 40, 50], val = 30, k = 3
Output: [10, 20, 30, 40, 50]""",

    "insert before given node in doubly linked list": """Given a pointer to a node in a Doubly Linked List and an integer val, insert a new node with value val immediately before the given node.

Example 1:
Input: targetNode = node(20), val = 15 in [10, 20, 30]
Output: [10, 15, 20, 30]""",

    "sort a linked list of 0's 1's and 2's": """Given the head of a singly linked list consisting only of values 0, 1, and 2, sort the linked list in ascending order by changing pointers.

Example 1:
Input: head = [1, 2, 0, 1, 2, 0, 0]
Output: [0, 0, 0, 1, 1, 2, 2]

Example 2:
Input: head = [2, 1, 0]
Output: [0, 1, 2]""",

    "length of loop in ll": """Given the head of a linked list, determine if the linked list has a loop. If a loop is present, return the number of nodes in the loop, otherwise return 0.

Example 1:
Input: head = [1, 2, 3, 4, 5], loop at node 2
Output: 4
Explanation: Nodes 2 -> 3 -> 4 -> 5 -> 2 form a loop of length 4.

Example 2:
Input: head = [1, 2, 3], no loop
Output: 0""",

    "delete all occurrences of a key in dll": """Given the head of a Doubly Linked List and an integer key, delete all occurrences of key from the list and return the updated head.

Example 1:
Input: head = [2, 2, 10, 8, 4, 2, 5, 2], key = 2
Output: [10, 8, 4, 5]

Example 2:
Input: head = [1, 1, 1], key = 1
Output: []""",

    "remove duplicates from sorted dll": """Given the head of a sorted Doubly Linked List, remove all duplicate nodes such that each element appears only once.

Example 1:
Input: head = [1, 1, 1, 2, 3, 3, 4]
Output: [1, 2, 3, 4]

Example 2:
Input: head = [1, 2, 2]
Output: [1, 2]""",

    "find pairs with given sum in doubly linked list": """Given the head of a sorted Doubly Linked List of distinct integers and an integer target, find and return all unique pairs of nodes whose values sum up to target.

Example 1:
Input: head = [1, 2, 4, 5, 6, 8, 9], target = 7
Output: [[1, 6], [2, 5]]

Example 2:
Input: head = [1, 5, 6], target = 6
Output: [[1, 5]]""",

    # Bit Manipulation
    "check if the i-th bit is set or not": """Given two integers n and i (0-based bit position), check whether the i-th bit of n is set (1) or unset (0). Return true if set, otherwise false.

Example 1:
Input: n = 13 (binary 1101), i = 2
Output: true

Example 2:
Input: n = 10 (binary 1010), i = 0
Output: false""",

    "check if a number is odd or not": """Given an integer n, check whether n is odd using the bitwise AND operator (n & 1). Return true if odd, false if even.

Example 1:
Input: n = 7
Output: true

Example 2:
Input: n = 12
Output: false""",

    "set the rightmost unset bit": """Given an integer n, set the first unset bit (0) from the right (LSB) to 1 and return the modified integer.

Example 1:
Input: n = 6 (binary 110)
Output: 7 (binary 111)

Example 2:
Input: n = 15 (binary 1111)
Output: 15""",

    "swap two numbers": """Given two integers a and b, swap their values in-place using bitwise XOR without using any temporary variable.

Example 1:
Input: a = 5, b = 7
Output: a = 7, b = 5

Example 2:
Input: a = 10, b = 20
Output: a = 20, b = 10""",

    "xor of numbers in a given range": """Given two integers L and R, compute and return the bitwise XOR sum of all integers in the range [L, R] in O(1) time.

Example 1:
Input: L = 4, R = 8
Output: 8
Explanation: 4 ^ 5 ^ 6 ^ 7 ^ 8 = 8.

Example 2:
Input: L = 3, R = 6
Output: 6""",

    # Greedy Algorithms
    "fractional knapsack": """Given weights and values of N items, and a knapsack of capacity W, put items in the knapsack to get the maximum total value. You can break items into fractions.

Example 1:
Input: values = [60, 100, 120], weights = [10, 20, 30], W = 50
Output: 240.00
Explanation: Take full item 1 (value 60) + full item 2 (value 100) + 2/3 of item 3 (value 80) = 240.

Example 2:
Input: values = [10, 20], weights = [5, 10], W = 5
Output: 10.00""",

    "shortest job first": """Given an array of burst times of n processes arriving at time 0, find the average waiting time using the Shortest Job First (SJF) non-preemptive CPU scheduling algorithm.

Example 1:
Input: burstTimes = [4, 3, 7, 1, 2]
Output: 4
Explanation: Execution order: P4(1), P5(2), P2(3), P1(4), P3(7). Average waiting time = (0 + 1 + 3 + 6 + 10) / 5 = 4.

Example 2:
Input: burstTimes = [1, 2, 3, 4]
Output: 2""",

    "job sequencing problem": """Given a set of N jobs where every job i has a deadline and profit, find the maximum profit that can be earned by scheduling jobs within their deadlines. Each job takes 1 unit of time.

Example 1:
Input: jobs = [[1, 4, 20], [2, 1, 10], [3, 1, 40], [4, 1, 30]] (id, deadline, profit)
Output: [2, 60] (2 jobs scheduled, profit 60)

Example 2:
Input: jobs = [[1, 2, 100], [2, 1, 19], [3, 2, 27]]
Output: [2, 127]""",

    "n meetings in one room": """There is one meeting room. You are given start and end times of N meetings. Find the maximum number of meetings that can be accommodated without overlaps.

Example 1:
Input: start = [1, 3, 0, 5, 8, 5], end = [2, 4, 6, 7, 9, 9]
Output: 4
Explanation: Meetings (1, 2), (3, 4), (5, 7), (8, 9).

Example 2:
Input: start = [10, 12, 20], end = [20, 25, 30]
Output: 1""",

    # Stacks & Queues
    "implement stack using arrays": """Implement a Stack data structure using an array with fixed capacity. Support push(x) and pop() in O(1) time.

Example:
push(2)
push(3)
pop() -> returns 3
push(4)
pop() -> returns 4""",

    "implement queue using arrays": """Implement a Queue (FIFO) data structure using an array. Support push(x) (enqueue) and pop() (dequeue) operations in O(1) time.

Example:
push(2)
push(3)
pop() -> returns 2
push(4)
pop() -> returns 3""",

    "implement stack using linkedlist": """Implement a LIFO Stack using a Singly Linked List supporting push(x) and pop() in O(1) time.

Example:
push(10)
push(20)
pop() -> returns 20
pop() -> returns 10""",

    "implement queue using linkedlist": """Implement a FIFO Queue using a Singly Linked List with head and tail pointers supporting push(x) and pop() in O(1) time.

Example:
push(1)
push(2)
pop() -> returns 1
pop() -> returns 2""",

    "infix to postfix conversion": """Given an infix arithmetic expression s, convert it into a postfix expression (Reverse Polish Notation) using a stack.

Example 1:
Input: s = "a+b*(c^d-e)^(f+g*h)-i"
Output: "abcd^e-fgh*+^*+i-"

Example 2:
Input: s = "(A+B)*C"
Output: "AB+C*" """,

    "infix to prefix conversion": """Given an infix expression s, convert it into a prefix expression (Polish Notation) using a stack.

Example 1:
Input: s = "(A+B)*C"
Output: "*+ABC"

Example 2:
Input: s = "A+B*C"
Output: "+A*BC" """,

    "prefix to infix conversion": """Given a prefix expression string s, convert it into a valid infix expression with parentheses.

Example 1:
Input: s = "*+AB-CD"
Output: "((A+B)*(C-D))"

Example 2:
Input: s = "+AB"
Output: "(A+B)" """,

    "prefix to postfix conversion": """Given a prefix expression string s, convert it into a postfix expression.

Example 1:
Input: s = "*+AB-CD"
Output: "AB+CD-*"

Example 2:
Input: s = "+AB"
Output: "AB+" """,

    "postfix to infix conversion": """Given a postfix expression string s, convert it into a fully parenthesized infix expression.

Example 1:
Input: s = "ab+c*"
Output: "((a+b)*c)"

Example 2:
Input: s = "ab+"
Output: "(a+b)" """,

    "postfix to prefix conversion": """Given a postfix expression string s, convert it into a prefix expression.

Example 1:
Input: s = "AB+CD-*"
Output: "*+AB-CD"

Example 2:
Input: s = "AB+"
Output: "+AB" """,

    "next smaller element": """Given an array of integers nums, find the Next Smaller Element for every element in the array. If no smaller element exists on the right, return -1.

Example 1:
Input: nums = [4, 5, 2, 10, 8]
Output: [2, 2, -1, 8, -1]

Example 2:
Input: nums = [3, 2, 1]
Output: [2, 1, -1]""",

    "number of greater elements to the right": """Given an array nums and an array of query indices queries, for each index queries[i], count the number of elements to the right of queries[i] that are strictly greater than nums[queries[i]].

Example 1:
Input: nums = [3, 4, 2, 7, 5, 8, 10, 6], queries = [0, 5]
Output: [6, 1]
Explanation: Elements to right of index 0 (val 3) greater than 3: [4, 7, 5, 8, 10, 6] -> 6 elements.

Example 2:
Input: nums = [1, 2, 3], queries = [0]
Output: [2]""",

    # Trees
    "pre, post, inorder in one traversal": """Given the root of a binary tree, perform Preorder, Inorder, and Postorder traversals of the tree in a single pass using a stack. Return all three traversals.

Example 1:
Input: root = [1, 2, 3, 4, 5, null, null]
Output: 
Preorder: [1, 2, 4, 5, 3]
Inorder: [4, 2, 5, 1, 3]
Postorder: [4, 5, 2, 3, 1]""",

    "children sum property in binary tree": """Given a binary tree, check whether every non-leaf node satisfies the Children Sum Property: node.val == (node.left?.val || 0) + (node.right?.val || 0). Return true if satisfied, false otherwise.

Example 1:
Input: root = [10, 8, 2, 3, 5, 2]
Output: true

Example 2:
Input: root = [1, 4, 3, 5]
Output: false""",

    "top view of bt": """Given the root of a binary tree, return the node values visible from the top view (from leftmost to rightmost vertical column).

Example 1:
Input: root = [1, 2, 3, 4, 5, 6, 7]
Output: [4, 2, 1, 3, 7]

Example 2:
Input: root = [1, 2, 3, null, 4]
Output: [2, 1, 3]""",

    "bottom view of bt": """Given the root of a binary tree, return the node values visible from the bottom view (from leftmost to rightmost vertical column).

Example 1:
Input: root = [20, 8, 22, 5, 3, 4, 25, null, null, 10, 14]
Output: [5, 10, 4, 14, 25]

Example 2:
Input: root = [1, 2, 3]
Output: [2, 1, 3]""",

    "print root to leaf path in bt": """Given the root of a binary tree, return all root-to-leaf paths as lists of node values.

Example 1:
Input: root = [1, 2, 3, null, 5]
Output: [[1, 2, 5], [1, 3]]

Example 2:
Input: root = [1]
Output: [[1]]""",

    "minimum time taken to burn the bt from a given node": """Given a binary tree and a target leaf/node where fire starts, fire spreads to all directly connected neighbors (parent, left child, right child) in 1 second. Find the minimum time required to burn the entire tree.

Example 1:
Input: root = [1, 2, 3, 4, null, 5, 6, null, 7], target = 2
Output: 3

Example 2:
Input: root = [1, 2, 3], target = 1
Output: 1""",

    "requirements needed to construct a unique bt": """Given two tree traversal orders, determine whether a unique Binary Tree can be constructed from them.
Rule: A unique binary tree can ONLY be constructed if one traversal is INORDER and the other is either PREORDER or POSTORDER.

Example 1:
Input: traversal1 = "INORDER", traversal2 = "PREORDER"
Output: true

Example 2:
Input: traversal1 = "PREORDER", traversal2 = "POSTORDER"
Output: false""",

    "floor and ceil in a bst": """Given the root of a Binary Search Tree (BST) and a key x, find the floor (largest value in BST <= x) and ceiling (smallest value in BST >= x).

Example 1:
Input: root = [8, 5, 12, 4, 7, 10, 14], x = 11
Output: Floor = 10, Ceil = 12

Example 2:
Input: root = [5, 2, 8], x = 1
Output: Floor = -1, Ceil = 2""",

    "minimum and maximum in bst": """Given the root of a Binary Search Tree (BST), find and return the minimum value (leftmost node) and maximum value (rightmost node) in the BST.

Example 1:
Input: root = [5, 3, 8, 2, 4, 7, 9]
Output: Min = 2, Max = 9

Example 2:
Input: root = [10]
Output: Min = 10, Max = 10""",

    # Heaps
    "heapify algorithm": """Given an array of integers nums and an index i, implement the max-heapify (or min-heapify) operation to maintain the heap property in O(log n) time.

Example 1:
Input: nums = [4, 10, 3, 5, 1], i = 0 (root)
Output: [10, 5, 3, 4, 1]

Example 2:
Input: nums = [1, 3, 5, 4, 6, 13], i = 0
Output: [5, 4, 13, 1, 6, 3]""",

    "build heap from a given array": """Given an unsorted array of n integers, convert it in-place into a Max Heap in linear O(n) time using the bottom-up Heapify approach.

Example 1:
Input: nums = [4, 10, 3, 5, 1]
Output: [10, 5, 3, 4, 1]

Example 2:
Input: nums = [1, 3, 5, 4, 6, 13, 10, 9, 8, 15, 17]
Output: [17, 15, 13, 9, 6, 5, 10, 4, 8, 3, 1]""",

    "implement min heap": """Implement a Min Heap class supporting:
1. push(val): insert element in O(log n)
2. pop(): remove and return minimum element in O(log n)
3. peek(): inspect minimum element in O(1)

Example:
minHeap.push(5)
minHeap.push(2)
minHeap.push(8)
minHeap.peek() -> returns 2
minHeap.pop()  -> returns 2
minHeap.peek() -> returns 5""",

    "implement max heap": """Implement a Max Heap class supporting:
1. push(val): insert element in O(log n)
2. pop(): remove and return maximum element in O(log n)
3. peek(): inspect maximum element in O(1)

Example:
maxHeap.push(5)
maxHeap.push(12)
maxHeap.push(8)
maxHeap.peek() -> returns 12
maxHeap.pop()  -> returns 12
maxHeap.peek() -> returns 8""",

    "check if an array represents a min heap ": """Given an array of integers nums, verify whether it satisfies the Min Heap property: for every index i, nums[i] <= nums[2*i + 1] and nums[i] <= nums[2*i + 2]. Return true if it is a valid Min Heap, false otherwise.

Example 1:
Input: nums = [10, 15, 14, 25, 30]
Output: true

Example 2:
Input: nums = [30, 20, 10]
Output: false""",

    "convert min heap to max heap": """Given an array representing a Min Heap of size n, convert it in-place into a Max Heap in O(n) time.

Example 1:
Input: nums = [1, 2, 3, 4, 5, 6, 7]
Output: [7, 5, 6, 4, 2, 1, 3]

Example 2:
Input: nums = [3, 5, 9, 6, 8, 20, 10, 12, 18, 9]
Output: [20, 18, 10, 12, 9, 9, 3, 5, 6, 8]""",

    "heap sort": """Given an array of integers nums, sort the array in ascending order using Heap Sort (build max-heap, then repeatedly swap root with end and heapify).

Example 1:
Input: nums = [12, 11, 13, 5, 6, 7]
Output: [5, 6, 7, 11, 12, 13]

Example 2:
Input: nums = [4, 10, 3, 5, 1]
Output: [1, 3, 4, 5, 10]

Constraints:
• Time Complexity: O(n log n), In-place Space Complexity: O(1).""",

    "sort a k-sorted array": """Given an array of n elements where each element is at most k positions away from its sorted target position, sort the array in O(n log k) time using a Min-Heap.

Example 1:
Input: nums = [6, 5, 3, 2, 8, 10, 9], k = 3
Output: [2, 3, 5, 6, 8, 9, 10]

Example 2:
Input: nums = [10, 9, 8, 7, 4, 70, 60, 50], k = 4
Output: [4, 7, 8, 9, 10, 50, 60, 70]""",

    "maximum sum combination": """Given two integer arrays A and B of size N, find the K maximum sum combinations of the form A[i] + B[j] in descending order.

Example 1:
Input: A = [3, 2], B = [1, 4], K = 2
Output: [7, 6]
Explanation: Sum combinations are 3+4=7, 2+4=6, 3+1=4, 2+1=3. Top 2 sums are 7 and 6.

Example 2:
Input: A = [1, 4, 2, 3], B = [2, 5, 1, 6], K = 4
Output: [10, 9, 9, 8]""",

    # Graphs
    "traversal techniques": """Given an undirected graph with V vertices and an adjacency list, implement Breadth-First Search (BFS) and Depth-First Search (DFS) traversals starting from vertex 0.

Example 1:
Input: V = 5, adj = [[1, 2, 3], [0], [0, 4], [0], [2]]
Output:
BFS: [0, 1, 2, 3, 4]
DFS: [0, 1, 2, 4, 3]""",

    "topological sort or kahn's algorithm": """Given a Directed Acyclic Graph (DAG) with V vertices and an adjacency list, return any valid topological sort order using Kahn's BFS algorithm (in-degree array).

Example 1:
Input: V = 6, adj = [[], [], [3], [1], [0, 1], [0, 2]]
Output: [5, 4, 2, 3, 1, 0]

Example 2:
Input: V = 4, adj = [[1], [2], [3], []]
Output: [0, 1, 2, 3]""",

    "shortest path in dag": """Given a Directed Acyclic Graph (DAG) with V vertices and weighted edges, find the shortest distance from a given source vertex S to all vertices using topological sort in O(V + E) time.

Example 1:
Input: V = 6, edges = [[0, 1, 2], [0, 4, 1], [4, 5, 4], [4, 2, 2], [1, 2, 3], [2, 3, 6], [5, 3, 1]], src = 0
Output: [0, 2, 3, 6, 1, 5]

Example 2:
Input: V = 4, edges = [[0, 1, 1], [1, 2, 2], [2, 3, 3]], src = 0
Output: [0, 1, 3, 6]""",

    "shortest path in undirected graph with unit weights": """Given an unweighted undirected graph with V vertices and an edge list, find the shortest path distance from a source vertex S to every other vertex using standard BFS. If a vertex is unreachable, return -1.

Example 1:
Input: V = 9, edges = [[0, 1], [0, 3], [3, 4], [4, 5], [5, 6], [1, 2], [2, 6], [6, 7], [7, 8], [6, 8]], src = 0
Output: [0, 1, 2, 1, 2, 3, 3, 4, 4]

Example 2:
Input: V = 4, edges = [[0, 1], [1, 2]], src = 3
Output: [-1, -1, -1, 0]""",

    "dijkstra's algorithm": """Given a weighted graph with V vertices and non-negative edge weights, compute the shortest path distance from a source vertex S to all other vertices using Dijkstra's Priority Queue algorithm.

Example 1:
Input: V = 3, adj = [[[1, 1], [2, 6]], [[2, 3], [0, 1]], [[1, 3], [0, 6]]], src = 2
Output: [4, 3, 0]

Example 2:
Input: V = 2, adj = [[[1, 9]], [[0, 9]]], src = 0
Output: [0, 9]""",

    "print shortest path ": """Given a weighted undirected graph with n nodes (1 to n) and m edges with weights, find and print the sequence of vertices along the shortest path from vertex 1 to vertex n. If no path exists, return [-1].

Example 1:
Input: n = 5, m = 6, edges = [[1, 2, 2], [2, 5, 5], [2, 3, 4], [1, 4, 1], [4, 3, 3], [3, 5, 1]]
Output: [1, 4, 3, 5]
Explanation: Total cost = 1 + 3 + 1 = 5.

Example 2:
Input: n = 4, m = 2, edges = [[1, 2, 1], [3, 4, 1]]
Output: [-1]""",

    "minimum multiplications to reach end": """Given an array of integers arr, a start number, and an end number, find the minimum number of multiplications needed to reach end from start, where at each step you can multiply your current number by any element in arr modulo 100000. Return -1 if unreachable.

Example 1:
Input: arr = [2, 5, 7], start = 3, end = 30
Output: 2
Explanation: 3 * 2 = 6, then 6 * 5 = 30.

Example 2:
Input: arr = [3, 4, 65], start = 7, end = 66175
Output: 4""",

    "bellman ford algorithm": """Given a weighted directed graph with V vertices and edges with weights (which may be negative), find the shortest distance from source vertex S to all vertices. If there exists a negative weight cycle, detect and report it (return [-1]).

Example 1:
Input: V = 6, edges = [[3, 2, 6], [5, 3, 1], [0, 1, 5], [1, 5, -3], [1, 2, -2], [3, 4, -2], [2, 4, 3]], S = 0
Output: [0, 5, 3, 3, 1, 2]

Example 2:
Input: V = 3, edges = [[0, 1, -1], [1, 2, -2], [2, 0, -3]], S = 0
Output: [-1] (Negative cycle detected)""",

    "floyd warshall algorithm": """Given an adjacency matrix of a weighted directed graph with V vertices, find the shortest distances between every pair of vertices in-place using the Floyd-Warshall dynamic programming algorithm.

Example 1:
Input: matrix = [[0, 2, -1, -1], [1, 0, 3, -1], [-1, -1, 0, -1], [3, 5, 4, 0]] (-1 represents infinity)
Output: [[0, 2, 5, -1], [1, 0, 3, -1], [-1, -1, 0, -1], [3, 5, 4, 0]]""",

    "disjoint set ": """Implement the Disjoint Set Union (DSU) data structure with Path Compression and Union by Rank (or Size). Support:
1. findUPar(u): returns ultimate parent in amortized O(alpha(V))
2. unionByRank(u, v) / unionBySize(u, v): merges sets containing u and v.

Example:
dsu = new DisjointSet(7)
dsu.unionBySize(1, 2)
dsu.unionBySize(2, 3)
dsu.findUPar(1) == dsu.findUPar(3) -> true""",

    "articulation point in graph": """Given an undirected connected graph with V vertices and an adjacency list, find all articulation points (cut vertices) whose removal increases the number of connected components.

Example 1:
Input: V = 5, adj = [[1], [0, 4], [3, 4], [2, 4], [1, 2, 3]]
Output: [1, 4]

Example 2:
Input: V = 4, adj = [[1, 2], [0, 2], [0, 1, 3], [2]]
Output: [2]""",

    # Dynamic Programming
    "frog jump": """A frog is at stone 0 and wants to reach stone n - 1. In each step, the frog can jump from stone i to stone i + 1 or i + 2 with energy cost abs(heights[i] - heights[i + step]). Find the minimum total energy required.

Example 1:
Input: heights = [10, 20, 30, 10]
Output: 20
Explanation: Stone 0 -> 1 (cost 10) -> 3 (cost 10) = 20.

Example 2:
Input: heights = [30, 10, 60, 10, 60, 50]
Output: 40""",

    "frog jump with k distances": """A frog is at stone 0 and wants to reach stone n - 1. From stone i, the frog can jump to any stone i + 1, i + 2, ..., i + K with energy cost abs(heights[i] - heights[j]). Find the minimum energy needed.

Example 1:
Input: heights = [10, 30, 40, 50, 20], K = 3
Output: 30

Example 2:
Input: heights = [10, 20, 10], K = 1
Output: 20""",

    "ninja's training": """A Ninja has training for N days. On each day, he can perform one of three activities (0, 1, or 2) earning points[day][activity]. He cannot perform the same activity on two consecutive days. Find the maximum total points.

Example 1:
Input: points = [[10, 40, 70], [20, 50, 80], [30, 60, 90]]
Output: 210
Explanation: Day 1: Activity 2 (70), Day 2: Activity 1 (50), Day 3: Activity 2 (90) = 210.

Example 2:
Input: points = [[1, 2, 5], [3, 1, 1], [3, 3, 3]]
Output: 11""",

    "subset sum equals to target": """Given an array nums of positive integers and an integer target, determine whether there exists a subset of nums with sum equal to target.

Example 1:
Input: nums = [1, 2, 3, 4], target = 4
Output: true
Explanation: Subsets [4] or [1, 3] sum to 4.

Example 2:
Input: nums = [2, 5, 1, 6, 7], target = 4
Output: false""",

    "count subsets with sum k": """Given an array nums of non-negative integers and an integer K, count the number of subsets whose sum equals K. Return the count modulo 10^9 + 7.

Example 1:
Input: nums = [1, 2, 2, 3], K = 3
Output: 3
Explanation: Subsets [1, 2] (index 1), [1, 2] (index 2), and [3].

Example 2:
Input: nums = [1, 2, 3, 3], K = 6
Output: 3""",

    "count partitions with given difference": """Given an array arr of positive integers and an integer d, partition the array into two subsets S1 and S2 such that S1 >= S2 and sum(S1) - sum(S2) == d. Count the number of valid partitions modulo 10^9 + 7.

Example 1:
Input: arr = [5, 2, 6, 4], d = 3
Output: 1
Explanation: S1 = [6, 4], S2 = [5, 2]. sum(S1) - sum(S2) = 10 - 7 = 3.

Example 2:
Input: arr = [1, 1, 1, 1], d = 0
Output: 6""",

    "0 and 1 knapsack": """Given weights and values of N items and a knapsack of capacity W, select a subset of items to maximize total value such that total weight <= W. Each item can be picked at most once (0 or 1).

Example 1:
Input: values = [60, 100, 120], weights = [10, 20, 30], W = 50
Output: 220
Explanation: Pick items 2 and 3 (weights 20 + 30 = 50, value 100 + 120 = 220).

Example 2:
Input: values = [10, 40, 30, 50], weights = [5, 4, 6, 3], W = 5
Output: 50""",

    "unbounded knapsack": """Given weights and values of N items and a knapsack of capacity W, find the maximum value subset of items whose total weight <= W. You can select each item an unlimited number of times.

Example 1:
Input: values = [1, 4, 5, 7], weights = [1, 3, 4, 5], W = 8
Output: 11
Explanation: Pick item 1 twice and item 2 twice: 4 + 7 = 11 (weight 3 + 5 = 8).

Example 2:
Input: values = [6, 1], weights = [2, 1], W = 3
Output: 7""",

    "rod cutting problem": """Given a rod of length N inches and an array price of size N where price[i] is the price of a rod of length i + 1, cut the rod into pieces to maximize the total sale price.

Example 1:
Input: price = [1, 5, 8, 9, 10, 17, 17, 20], N = 8
Output: 22
Explanation: Cut into lengths 2 and 6 (price 5 + 17 = 22).

Example 2:
Input: price = [3, 5, 8, 9, 10, 17, 17, 20], N = 8
Output: 24 (cut into 8 pieces of length 1: 8 * 3 = 24)""",

    "print longest increasing subsequence": """Given an array of integers nums, find and return the actual elements of the Longest Increasing Subsequence (LIS).

Example 1:
Input: nums = [10, 9, 2, 5, 3, 7, 101, 18]
Output: [2, 3, 7, 101] (or [2, 5, 7, 101])

Example 2:
Input: nums = [0, 1, 0, 3, 2, 3]
Output: [0, 1, 2, 3]""",

    "longest bitonic subsequence": """Given an array of integers nums, find the length of the Longest Bitonic Subsequence. A subsequence is bitonic if it first increases and then decreases (or strictly increases/decreases).

Example 1:
Input: nums = [1, 11, 2, 10, 4, 5, 2, 1]
Output: 6
Explanation: [1, 2, 10, 4, 2, 1] or [1, 2, 10, 5, 2, 1].

Example 2:
Input: nums = [1, 2, 5, 3, 2]
Output: 5""",

    "longest common substring": """Given two strings text1 and text2, find the length of the longest contiguous substring present in both strings.

Example 1:
Input: text1 = "abcde", text2 = "abfce"
Output: 2
Explanation: Longest common substring is "ab".

Example 2:
Input: text1 = "ABCDGH", text2 = "ACDGHR"
Output: 4
Explanation: "CDGH" has length 4.""",

    "matrix chain multiplication": """Given an array p of dimensions of matrices where matrix A[i] has dimension p[i-1] x p[i], find the minimum number of scalar multiplications needed to compute the matrix product A1 * A2 * ... * An.

Example 1:
Input: p = [10, 20, 30, 40, 30]
Output: 30000
Explanation: (A1 * (A2 * A3)) * A4 or similar optimal parenthesization gives 30000 multiplications.

Example 2:
Input: p = [10, 20, 30]
Output: 6000""",

    # Strings Advanced
    "z function": """Given a string s, compute the Z-array where Z[i] is the length of the longest substring starting from s[i] that is also a prefix of s.

Example 1:
Input: s = "aabxaabxcaabxaabxay"
Output: [0, 1, 0, 0, 4, 1, 0, 0, 0, 8, 1, 0, 0, 5, 1, 0, 0, 1, 0]

Example 2:
Input: s = "aaaaa"
Output: [0, 4, 3, 2, 1]""",

    # Maths
    "print all primes till n": """Given an integer N, generate and return a list of all prime numbers less than or equal to N in ascending order using the Sieve of Eratosthenes.

Example 1:
Input: N = 10
Output: [2, 3, 5, 7]

Example 2:
Input: N = 20
Output: [2, 3, 5, 7, 11, 13, 17, 19]

Constraints:
• 2 <= N <= 10^6
• Time Complexity: O(N log(log N))""",

    "prime factorisation of a number": """Given an integer N, find all its prime factors and return them in non-decreasing order.

Example 1:
Input: N = 60
Output: [2, 2, 3, 5]
Explanation: 60 = 2 * 2 * 3 * 5.

Example 2:
Input: N = 35
Output: [5, 7]"""
}

# Now load existing problems
with open('src/data/initialProblems.json') as f:
    existing_problems = json.load(f)

# Theory non-problem slugs to filter out
THEORY_NON_PROBLEMS = {
    "beginner-problems-fundamentals-of-programming-breaking-the-myth",
    "beginner-problems-fundamentals-of-programming-programming-and-what-are-computers",
    "beginner-problems-fundamentals-of-programming-how-to-think-like-a-programmer",
    "beginner-problems-fundamentals-of-programming-flowcharts-and-pseudocode",
    "beginner-problems-fundamentals-of-programming-flowchart-problem-solving",
    "beginner-problems-fundamentals-of-programming-dry-runs-edge-cases-and-debugging",
    "beginner-problems-fundamentals-of-programming-programming-languages-and-choosing-a-path",
    "beginner-problems-language-basics-learn-c",
    "beginner-problems-language-basics-learn-java",
    "beginner-problems-language-basics-learn-python",
    "beginner-problems-logic-building-patterns-easy-and-medium",
    "beginner-problems-logic-building-patterns-hard",
    "beginner-problems-time-complexity-theory-with-examples",
    "beginner-problems-standard-libraries-collections-stl",
    "beginner-problems-standard-libraries-collections-java-collections",
    "beginner-problems-standard-libraries-collections-python-libraries-part-1",
    "beginner-problems-standard-libraries-collections-python-libraries-part-2",
    "beginner-problems-concept-basics-basic-maths",
    "beginner-problems-concept-basics-basic-arrays",
    "beginner-problems-concept-basics-basic-hashing",
    "beginner-problems-concept-basics-basic-string",
    "beginner-problems-basic-recursion-recursion-theory",
    "beginner-problems-basic-recursion-recursion-concepts-with-parameters",
    "hashing-theory-basic-hashing",
    "recursion-subsequence-pattern-problems-learn-all-patterns-of-subsequences-theory",
    "linked-list-fundamentals-single-ll-introduction-to-singly-linkedlist",
    "linked-list-fundamentals-single-ll-deletion-in-linked-list",
    "linked-list-fundamentals-single-ll-insertion-in-linked-list",
    "linked-list-fundamentals-doubly-ll-introduction-to-doubly-ll",
    "linked-list-fundamentals-doubly-ll-deletion-in-doubly-ll",
    "linked-list-fundamentals-doubly-ll-insertion-in-dll",
    "bit-manipulation-theory-introduction-to-bits-and-tricks",
    "sliding-window-2-pointer-pattern-and-template-theory",
    "stack-queues-implementation-implementation-using-different-ds",
    "binary-trees-theory-traversals-introduction",
    "binary-search-trees-theory-and-basics-introduction-to-bst",
    "heaps-theory-and-implementation-heaps-theory-video",
    "graphs-theory-and-traversals-introduction-to-graph",
    "graphs-minimum-spanning-tree-mst-theory",
    "dynamic-programming-introduction-introduction-to-dp",
    "tries-theory-bit-prerequisites-for-trie-problems",
    "strings-advanced-algo-advanced-problems-less-asked-hashing-in-strings-theory"
}

enriched_problems = []

for prob in existing_problems:
    if prob['id'] in THEORY_NON_PROBLEMS:
        continue

    # Keep original 23 patterns untouched (they already have rich descriptions and code)
    if prob.get('topicIds') == ['patterns'] and prob['id'].startswith('pattern-'):
        enriched_problems.append(prob)
        continue

    title_key = prob['title'].strip().lower()
    url = prob.get('url', '')
    slug = ''
    if 'leetcode.com/problems/' in url:
        slug = url.rstrip('/').split('/problems/')[-1].split('/')[0].lower()

    # Priority 1: Custom verified DSA description
    new_desc = CUSTOM_DESCRIPTIONS.get(title_key)

    # Priority 2: LeetCode scraped description
    if not new_desc and slug and slug in lc_by_slug:
        new_desc = lc_by_slug[slug]

    if not new_desc and title_key in lc_by_title:
        new_desc = lc_by_title[title_key]

    # Priority 3: Fallback clean statement
    if not new_desc:
        # Fallback to title as clean question statement
        new_desc = f"Solve the '{prob['title']}' problem.\n\nInput: Given standard parameters for {prob['title']}.\nOutput: Compute and return the required result."

    # Remove any stray "Striver" or "A2Z"
    new_desc = new_desc.replace("Striver's A2Z DSA Sheet", "").replace("Striver", "").replace("A2Z", "")
    new_desc = re.sub(r'Topic Path:.*?\n', '', new_desc)
    new_desc = re.sub(r'Category:.*?\n', '', new_desc)
    new_desc = re.sub(r'Source:.*?\n', '', new_desc)
    new_desc = new_desc.strip()

    # Clean notes
    clean_notes = prob.get('notes', '')
    clean_notes = clean_notes.replace("Striver's A2Z DSA Sheet", "").replace("Striver", "").replace("A2Z", "").strip()

    updated_prob = {
        **prob,
        'description': new_desc,
        'notes': clean_notes
    }
    enriched_problems.append(updated_prob)

print(f'Total enriched problems: {len(enriched_problems)}')

with open('src/data/initialProblems.json', 'w') as f:
    json.dump(enriched_problems, f, indent=2)

print('Saved successfully to src/data/initialProblems.json!')
