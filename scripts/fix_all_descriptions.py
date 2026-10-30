import json
import re
import html

EXTRA_DESCRIPTIONS = {
    "armstrong-number": """Given an integer N, return true if it is an Armstrong number, otherwise return false. An Armstrong number of k digits is an integer such that the sum of its digits raised to the power of k is equal to the number itself.

Example 1:
Input: N = 153
Output: true
Explanation: 153 has 3 digits. 1^3 + 5^3 + 3^3 = 1 + 125 + 27 = 153.

Example 2:
Input: N = 371
Output: true

Example 3:
Input: N = 120
Output: false""",

    "buildings-with-an-ocean-view": """Given an array nums of integers, find and return all the leaders in the array. An element is a leader if it is strictly greater than all the elements to its right. The rightmost element is always a leader.

Example 1:
Input: nums = [16, 17, 4, 3, 5, 2]
Output: [17, 5, 2]
Explanation: 17 is greater than all elements to its right [4, 3, 5, 2]. 5 is greater than [2]. 2 is the rightmost.

Example 2:
Input: nums = [1, 2, 3, 4, 0]
Output: [4, 0]""",

    "maximum-size-subarray-sum-equals-k": """Given an array nums of integers and an integer k, find the length of the longest sub-array that sums up to k. If no such sub-array exists, return 0.

Example 1:
Input: nums = [10, 5, 2, 7, 1, 9], k = 15
Output: 4
Explanation: Subarray [5, 2, 7, 1] sums to 15 with length 4.

Example 2:
Input: nums = [-1, 2, 3], k = 6
Output: 0""",

    "maximum-size-subarray-sum-equals-k-1": """Given an array nums of integers, find the length of the longest subarray with sum equal to 0.

Example 1:
Input: nums = [15, -2, 2, -8, 1, 7, 10, 23]
Output: 5
Explanation: The largest subarray with sum 0 is [-2, 2, -8, 1, 7] of length 5.

Example 2:
Input: nums = [1, 2, 3]
Output: 0""",

    "minimize-max-distance-to-gas-station": """You are given a sorted integer array stations representing the positions of gas stations on a horizontal line, and an integer k representing additional gas stations to add. Add k stations such that the maximum distance between adjacent gas stations is minimized. Return the minimum possible maximum distance.

Example 1:
Input: stations = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], k = 9
Output: 0.50000

Example 2:
Input: stations = [3, 6, 12, 19, 33, 46, 67, 85, 93, 99], k = 2
Output: 14.00000""",

    "median-of-a-row-wise-sorted-matrix": """Given an N x M matrix where each row is sorted in non-decreasing order and N * M is odd, find the median of the matrix in O(32 * N * log M) time.

Example 1:
Input: matrix = [[1, 3, 5], [2, 6, 9], [3, 6, 9]]
Output: 5
Explanation: Sorted elements are [1, 2, 3, 3, 5, 6, 6, 9, 9]. The median is 5.

Example 2:
Input: matrix = [[1], [2], [3]]
Output: 2""",

    "plus-one-linked-list": """Given the head of a singly linked list representing a non-negative integer (most significant digit at the head), add one to the integer and return the head of the updated linked list.

Example 1:
Input: head = [4, 5, 6]
Output: [4, 5, 7]
Explanation: 456 + 1 = 457.

Example 2:
Input: head = [9, 9, 9]
Output: [1, 0, 0, 0]
Explanation: 999 + 1 = 1000.""",

    "longest-substring-with-at-most-k-distinct-characters": """Given a string s and an integer k, return the length of the longest substring of s that contains at most k distinct characters.

Example 1:
Input: s = "eceba", k = 2
Output: 3
Explanation: The substring "ece" has length 3 and 2 distinct characters.

Example 2:
Input: s = "aa", k = 1
Output: 2""",

    "online-stock-span": """Design an algorithm that collects daily price quotes for some stock and returns the span of that stock's price for the current day. The span of the stock's price today is the maximum number of consecutive days (starting from today and going backward) for which the stock price was less than or equal to today's price.

Example 1:
Input:
StockSpanner stockSpanner = new StockSpanner();
stockSpanner.next(100); // return 1
stockSpanner.next(80);  // return 1
stockSpanner.next(60);  // return 1
stockSpanner.next(70);  // return 2
stockSpanner.next(60);  // return 1
stockSpanner.next(75);  // return 4
stockSpanner.next(85);  // return 6

Output: [1, 1, 1, 2, 1, 4, 6]""",

    "find-the-celebrity": """Suppose you are at a party with n people (labeled from 0 to n - 1) and among them, there may exist one celebrity. A celebrity is defined as someone who is known to all n - 1 other people, but doesn't know anyone at the party. You have access to a helper function bool knows(a, b) which tells you whether a knows b. Find the celebrity, or return -1 if there is none.

Example 1:
Input: graph = [[1, 1, 0], [0, 1, 0], [1, 1, 1]]
Output: 1
Explanation: 0 knows 1, and 2 knows 1. 1 doesn't know 0 or 2. Celebrity is 1.

Example 2:
Input: graph = [[1, 0, 1], [1, 1, 0], [0, 1, 1]]
Output: -1""",

    "boundary-of-binary-tree": """Given the root of a binary tree, return the values of its boundary in anti-clockwise direction starting from the root.
The boundary consists of:
1. Root node.
2. Left boundary (nodes on the path from root to leftmost node, excluding leaves).
3. Leaves (all leaf nodes from left to right).
4. Right boundary (nodes on the path from rightmost node to root in reverse, excluding root and leaves).

Example 1:
Input: root = [1, null, 2, 3, 4]
Output: [1, 3, 4, 2]

Example 2:
Input: root = [1, 2, 3, 4, 5, 6, null, null, null, 7, 8, 9, 10]
Output: [1, 2, 4, 7, 8, 9, 10, 6, 3]""",

    "largest-bst-subtree": """Given the root of a binary tree, find the size (number of nodes) of the largest subtree that is also a Binary Search Tree (BST).

Example 1:
Input: root = [10, 5, 15, 1, 8, null, 7]
Output: 3
Explanation: The largest BST subtree is rooted at 5: [5, 1, 8] with size 3.

Example 2:
Input: root = [4, 2, 7, 2, 3, 5, null, 2, null, null, null, null, null, 1]
Output: 2""",

    "minimum-cost-to-connect-sticks": """You have some number of sticks with positive lengths. You can connect any two sticks of lengths x and y by paying a cost of x + y. You perform this until only one stick remains. Return the minimum cost to connect all sticks.

Example 1:
Input: sticks = [2, 4, 3]
Output: 14
Explanation: Connect 2 and 3 (cost 5), stick array becomes [4, 5]. Connect 4 and 5 (cost 9). Total cost = 5 + 9 = 14.

Example 2:
Input: sticks = [1, 8, 3, 5]
Output: 30""",

    "number-of-connected-components-in-an-undirected-graph": """You have a graph of n nodes labeled from 0 to n - 1 and an array of undirected edges. Return the number of connected components in the graph.

Example 1:
Input: n = 5, edges = [[0, 1], [1, 2], [3, 4]]
Output: 2
Explanation: Component 1: {0, 1, 2}, Component 2: {3, 4}.

Example 2:
Input: n = 5, edges = [[0, 1], [1, 2], [2, 3], [3, 4]]
Output: 1""",

    "number-of-distinct-islands": """Given an m x n binary matrix grid where 1 represents land and 0 represents water, return the number of distinct islands. Two islands are considered equal if one can be translated (not rotated or reflected) to match the other.

Example 1:
Input: grid = [[1, 1, 0, 0, 0], [1, 1, 0, 0, 0], [0, 0, 0, 1, 1], [0, 0, 0, 1, 1]]
Output: 1
Explanation: Both islands have the same 2x2 shape.

Example 2:
Input: grid = [[1, 1, 0, 1, 1], [1, 0, 0, 0, 0], [0, 0, 0, 0, 1], [1, 1, 0, 1, 1]]
Output: 3""",

    "alien-dictionary": """There is a new alien language that uses the English alphabet. The order of alphabet is unknown. You are given a list of words from the alien language dictionary, where the words are claimed to be sorted lexicographically by the rules of this new language. Derive the order of characters in the language. If invalid, return ''.

Example 1:
Input: words = ["wrt", "wrf", "er", "ett", "rftt"]
Output: "wertf"

Example 2:
Input: words = ["z", "x"]
Output: "zx"

Example 3:
Input: words = ["z", "x", "z"]
Output: "" (Invalid order)""",

    "number-of-islands-ii": """You are given an m x n 2D grid initialized with all 0s (water). You are also given an array of positions where positions[i] = [r, c] turns the cell (r, c) into land (1). Return an array of integers representing the number of islands after each operation.

Example 1:
Input: m = 3, n = 3, positions = [[0, 0], [0, 1], [1, 2], [2, 1]]
Output: [1, 1, 2, 3]

Example 2:
Input: m = 1, n = 1, positions = [[0, 0]]
Output: [1]""",

    "implement-trie-ii-prefix-tree": """A Trie (pronounced as 'try') or prefix tree is a tree data structure used to efficiently store and retrieve keys in a dataset of strings. Implement the Trie class with:
- insert(word): Inserts the string word.
- countWordsEqualTo(word): Returns the number of instances of word in the trie.
- countWordsStartingWith(prefix): Returns the number of strings in the trie that start with prefix.
- erase(word): Erases one instance of word from the trie.

Example 1:
Input:
Trie trie = new Trie();
trie.insert("apple");
trie.insert("apple");
trie.countWordsEqualTo("apple"); // return 2
trie.countWordsStartingWith("app"); // return 2
trie.erase("apple");
trie.countWordsEqualTo("apple"); // return 1

Output: [null, null, 2, 2, null, 1]""",

    "longest-word-with-all-prefixes": """Given an array of strings words, find the longest string in words such that every prefix of it is also in words. If there is more than one string with the same maximum length, return the lexicographically smallest one. If none exists, return ''.

Example 1:
Input: words = ["k", "ki", "kir", "kira", "kiran"]
Output: "kiran"
Explanation: "k", "ki", "kir", "kira" all exist in words.

Example 2:
Input: words = ["a", "banana", "app", "appl", "ap", "apply", "apple"]
Output: "apple" """,

    "number-of-distinct-substrings-in-a-string": """Given a string s of lowercase English characters, count and return the number of distinct substrings (including the empty string) using a Trie.

Example 1:
Input: s = "ababa"
Output: 10
Explanation: Distinct substrings are "", "a", "b", "ab", "ba", "aba", "bab", "abab", "baba", "ababa".

Example 2:
Input: s = "ccf"
Output: 6"""
}

def clean_all_html(raw_html):
    if not raw_html:
        return ''
    text = raw_html
    # Convert superscripts to ^num
    text = re.sub(r'<sup>(.*?)</sup>', r'^\1', text, flags=re.IGNORECASE)
    text = re.sub(r'<sub>(.*?)</sub>', r'_\1', text, flags=re.IGNORECASE)
    # Remove div, span, font, a, popovers
    text = re.sub(r'<div[^>]*>', '', text, flags=re.IGNORECASE)
    text = re.sub(r'</div>', '', text, flags=re.IGNORECASE)
    text = re.sub(r'<span[^>]*>', '', text, flags=re.IGNORECASE)
    text = re.sub(r'</span>', '', text, flags=re.IGNORECASE)
    text = re.sub(r'<font[^>]*>', '', text, flags=re.IGNORECASE)
    text = re.sub(r'</font>', '', text, flags=re.IGNORECASE)
    text = re.sub(r'</?(?:strong|b|em|i|code|a)[^>]*>', '', text, flags=re.IGNORECASE)
    text = re.sub(r'<p[^>]*>', '', text, flags=re.IGNORECASE)
    text = re.sub(r'</p>', '\n\n', text, flags=re.IGNORECASE)
    text = re.sub(r'<pre[^>]*>', '\n', text, flags=re.IGNORECASE)
    text = re.sub(r'</pre>', '\n\n', text, flags=re.IGNORECASE)
    text = re.sub(r'<li>', '• ', text, flags=re.IGNORECASE)
    text = re.sub(r'</li>', '\n', text, flags=re.IGNORECASE)
    text = re.sub(r'</?(?:ul|ol)[^>]*>', '\n', text, flags=re.IGNORECASE)
    # Generic remaining tag cleaner
    text = re.sub(r'<[^>]+>', '', text)
    text = re.sub(r'&nbsp;', ' ', text)
    text = html.unescape(text)

    # Standardize Input/Output labels
    text = re.sub(r'\bInput\s*\n', 'Input: \n', text)
    text = re.sub(r'\bOutput\s*\n', 'Output: \n', text)
    text = re.sub(r'\bExplanation\s*\n', 'Explanation: \n', text)

    lines = [line.rstrip() for line in text.split('\n')]
    cleaned = '\n'.join(lines)
    cleaned = re.sub(r'\n{3,}', '\n\n', cleaned).strip()
    return cleaned

with open('src/data/initialProblems.json') as f:
    probs = json.load(f)

for p in probs:
    pid = p['id']

    # 1. Check Extra Descriptions
    if pid in EXTRA_DESCRIPTIONS:
        p['description'] = EXTRA_DESCRIPTIONS[pid]
        continue

    # 2. Check Patterns
    if p.get('topicIds') == ['patterns'] and pid.startswith('pattern-'):
        # Format "Example for N = X:" to "Example 1:\nInput: n = X\nOutput:"
        desc = p['description']
        desc = re.sub(r'Example for N\s*=\s*(\d+):', r'Example 1:\nInput: n = \1\nOutput:', desc)
        p['description'] = desc
        continue

    # 3. Clean existing HTML & standardize Input: / Output:
    p['description'] = clean_all_html(p.get('description', ''))

with open('src/data/initialProblems.json', 'w') as f:
    json.dump(probs, f, indent=2)

print('Updated initialProblems.json successfully!')
