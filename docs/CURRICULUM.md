# VisualDSA: Curriculum, Lesson Template and Cursor Add-on

Draft 1. Everything here is meant to be dropped into your repo as `/docs/CURRICULUM.md` so Cursor can generate the content structure from it.

## 1. How to use this doc

1. Run your master prompt in Cursor first.
2. Paste the add-on prompt (Section 2) so AI mode becomes Coming Soon and Cursor reads this file.
3. Cursor creates one `.mdx` file per chapter from Section 4 using the template in Section 3.
4. You (or helpers) fill the stubs, starting with the 3 reference chapters: Stack, Binary Search, BFS.

## 2. Cursor add-on prompt (paste after the master prompt)

```
Update to the VisualDSA plan:

1. AI Mock Interview is COMING SOON. Do not call any AI API and do not require any API key. Build the UI shell only: a page at /mock-interview with a Coming soon badge, a preview of the experience (sample chat and a sample scorecard), and a waitlist email form saved to the database.
2. Create an AIProvider interface in src/lib/ai/provider.ts with askFollowUp, scoreAnswer and reviewDesign, plus a DisabledProvider that returns a coming-soon result. Gate it with env flag FEATURE_AI_MOCK=false. Later I will add a ClaudeProvider by changing one file and the env.
3. Wherever AI was planned (hints, system design canvas feedback) show a manual fallback: static checklists, model answers and self-review rubrics.
4. Read /docs/CURRICULUM.md. Create content/<track>/<module>/<chapter>.mdx for EVERY chapter listed, using the lesson template in that file. Generate correct frontmatter and a short stub body for each, with status: draft. Fully write only the 3 reference chapters (stack, binary search, BFS) with status: ready.
5. Build a roadmap page from the frontmatter: tracks, modules, chapters, prerequisites, lock or unlock, progress rings. Draft chapters show a Coming soon label.
6. Implement every component named in the template (Analogy, Visualizer, Trace, CodeTabs, Complexity, Checkpoint, Quiz, Problems, Recap, InterviewTip).
7. Keep the same process: update PLAN.md, run lint, typecheck and tests after each phase, commit.
```

## 3. Lesson template

### Teaching rules (tell every author and Cursor)

- One idea per screen. Sentences under 20 words.
- Analogy first, code last. Never show code before the learner has traced an example by hand.
- Use familiar Indian-everyday examples where natural: chai stall, tiffin box, railway coaches, cricket scoreboard, auto-rickshaw queue, school cupboard.
- Every chapter ends with a recap a 10-year-old could repeat.
- Every chapter has an interview angle: what the interviewer is really testing.

### File format

```mdx
---
slug: stack-basics
track: dsa-core
module: stacks-queues
title: 'Stack: The Pile of Plates'
level: beginner          # beginner | intermediate | advanced
minutes: 12
status: ready            # draft | ready
prerequisites: [arrays-basics]
patterns: []
xp: 40
analogy: pile of plates
tags: [stack, lifo]
---

## What you will learn
- Three bullet outcomes in plain words

## The story
<Analogy emoji='🍽️' title='Pile of plates'>
A short story of 4 to 6 sentences. Map every part of the story to a real concept.
</Analogy>

## See it move
<Visualizer type='stack' initial={[3,7]} ops={['push 5','pop','push 9']} showPseudocode />

## Do it by hand
<Trace title='Trace this' input='push 1, push 2, pop, push 3' answer='[1,3]' />

## Now the code
<CodeTabs python='...' javascript='...' java='...' cpp='...' csharp='...' />

## How fast is it?
<Complexity time='O(1) push and pop' space='O(n)' why='We only touch the top plate' />

## Common mistakes
- Popping from an empty stack
- Forgetting the order is last in, first out

## Interview angle
<InterviewTip>What the interviewer is testing and the follow-up questions to expect.</InterviewTip>

## Checkpoint
<Checkpoint question='...' options={[...]} answer={1} explain='...' />

## Practice
<Problems ids={['valid-parentheses','min-stack','daily-temperatures']} />

## Quiz
<Quiz id='stack-basics-quiz' />

## Recap
<Recap>Three-line summary in kid-friendly words, then a Next chapter link.</Recap>
```

### Problem file format (`content/problems/<id>.json`)

```json
{
  'id': 'valid-parentheses',
  'title': 'Valid Parentheses',
  'difficulty': 'easy',
  'patterns': ['stack'],
  'statement': 'markdown',
  'hints': ['hint 1', 'hint 2', 'hint 3'],
  'starterCode': { 'python': '...', 'javascript': '...' },
  'tests': [{ 'input': '...', 'output': '...', 'hidden': false }],
  'solution': { 'approach': 'markdown', 'complexity': 'O(n) time, O(n) space', 'code': {} },
  'analogy': 'matching pairs of shoes'
}
```

### Gamification

- XP: chapter 40, practice problem 20/40/80 (easy/medium/hard), quiz 15, daily streak bonus 10.
- Badges: First Step, Plate Stacker, Binary Searcher, Graph Explorer, DP Detective, 7-day and 30-day streaks, Pattern Master (all problems in one pattern).
- Spaced repetition: re-quiz after 1, 3, 7 and 21 days.

## 4. Full curriculum

Format: **Chapter**: analogy; visualizer; practice.

### Track 0: Coding Foundations (for absolute beginners)

- **0.1 What is coding?**: giving steps to a very literal robot (making chai); step runner; make a sandwich instructions game
- **0.2 Variables and data types**: labeled tiffin boxes; memory boxes viz; swap two values
- **0.3 Conditions**: traffic signal decisions; flowchart runner; FizzBuzz-lite
- **0.4 Loops**: washing 10 plates one by one; loop stepper; sum 1 to N
- **0.5 Functions**: a juice machine (fruit in, juice out); input-output box; write a square function
- **0.6 Arrays and strings intro**: lockers and beads on a thread; index highlighter; reverse a list
- **0.7 Pseudocode and flowcharts**: giving directions to a friend’s house; flowchart builder
- **0.8 Debugging**: being a detective; bug-hunt editor; fix 5 broken programs
- **0.9 How a computer runs code**: brain (CPU) and notebook (memory); memory viz
- **0.10 First mini project**: number guessing game; guided build

### Track 1: DSA Core

**Module 1: Complexity**

- **1.1 Counting steps**: walking vs cycling vs flying; step counter
- **1.2 The Big-O ladder**: staircase from O(1) to O(n!); growth chart race
- **1.3 Space and reading code**: packing a bag; analyze 10 snippets

**Module 2: Arrays and Strings**

- **2.1 Arrays and indexing**: locker row; array viz; Two Sum (brute force), Max Element
- **2.2 Insert and delete costs**: cinema seats shifting; shift viz; Remove Duplicates, Move Zeroes
- **2.3 Prefix sums**: running cricket scoreboard; prefix viz; Range Sum Query, Subarray Sum
- **2.4 Two pointers**: two people walking in from both ends of a corridor; pointer viz; Valid Palindrome, Two Sum II, Container With Most Water
- **2.5 Sliding window**: train window sliding over scenery; window viz; Max Sum Subarray K, Longest Substring Without Repeating
- **2.6 Strings and anagrams**: Scrabble tiles; frequency viz; Valid Anagram, Group Anagrams

**Module 3: Hashing**

- **3.1 Hash map**: school cupboard where your name picks the shelf; hash viz; Two Sum (optimal)
- **3.2 Collisions**: two kids, one shelf (chaining and probing); collision viz
- **3.3 Sets and counting**: attendance register; Contains Duplicate, Top K Frequent
- **3.4 Hash patterns**: Subarray Sum Equals K, Longest Consecutive Sequence, Isomorphic Strings

**Module 4: Linked Lists**

- **4.1 Singly linked list**: treasure hunt clues; node-pointer viz
- **4.2 Insert, delete, reverse**: re-coupling train coaches; Reverse Linked List, Remove Nth Node
- **4.3 Fast and slow pointers**: tortoise and hare on a circular track; Linked List Cycle, Middle of List
- **4.4 Merge and dummy node**: two lanes zipping into one; Merge Two Sorted Lists
- **4.5 Doubly list and LRU cache**: browser back and forward buttons; LRU Cache

**Module 5: Stacks and Queues**

- **5.1 Stack**: pile of plates; push and pop viz
- **5.2 Brackets and expressions**: matching pairs; Valid Parentheses, Min Stack, Evaluate RPN
- **5.3 Monotonic stack**: who can see the cinema screen; Next Greater Element, Daily Temperatures
- **5.4 Queue and deque**: chai stall line; Sliding Window Maximum, Implement Queue using Stacks
- **5.5 Circular queue**: merry-go-round; ring buffer viz

**Module 6: Recursion and Backtracking**

- **6.1 Recursion**: Russian nesting dolls; call tree viz; Factorial, Fibonacci
- **6.2 The call stack**: stack of sticky notes; stack frame viz; Power(x, n)
- **6.3 Subsets and permutations**: choosing outfits; decision tree viz; Subsets, Permutations
- **6.4 Backtracking**: maze walking with undo; board viz; N-Queens, Word Search, Combination Sum
- **6.5 Divide and conquer**: cutting a roti in halves; split viz; Merge Sort preview

**Module 7: Searching and Sorting**

- **7.1 Linear vs binary search**: number guessing game from 1 to 100; binary search viz; Binary Search
- **7.2 Binary search variations**: finding a word in a dictionary; Search Insert Position, First and Last Position, Rotated Array
- **7.3 Binary search on the answer**: finding the slowest eating speed that still works; Koko Eating Bananas, Ship Packages
- **7.4 Simple sorts**: arranging playing cards (bubble, selection, insertion); sort race viz
- **7.5 Merge sort and quick sort**: splitting library books; pivot viz; Sort an Array
- **7.6 Custom sorting**: sorting by rules; Merge Intervals, Sort Colors, Largest Number

**Module 8: Trees**

- **8.1 Tree vocabulary**: family tree; tree builder
- **8.2 DFS traversals**: explorer going deep in a cave (pre, in, post order); traversal viz
- **8.3 BFS level order**: ripples in a pond; Level Order Traversal, Right Side View
- **8.4 Binary search tree**: flipping to the right page in a dictionary; BST viz; Validate BST, Insert, LCA
- **8.5 Tree recursion patterns**: a manager asking each report for their answer; Max Depth, Diameter, Path Sum
- **8.6 Balanced trees (concept)**: a balanced seesaw; AVL rotation viz
- **8.7 Build and serialize**: packing a tree into a suitcase; Serialize and Deserialize, Construct from Traversals

**Module 9: Heaps**

- **9.1 Heap and priority queue**: hospital emergency room; heap viz
- **9.2 Top-K and k-way merge**: live leaderboard; Kth Largest, Merge K Sorted Lists
- **9.3 Two heaps**: class split into short and tall halves to find the middle; Find Median from Data Stream

**Module 10: Graphs**

- **10.1 Graph basics**: city map; adjacency list vs matrix viz
- **10.2 BFS**: fewest hops to a friend; Rotting Oranges, Word Ladder
- **10.3 DFS and components**: paint bucket tool; Number of Islands, Clone Graph
- **10.4 Topological sort**: getting dressed in the right order; Course Schedule I and II
- **10.5 Union-Find**: merging friend circles; Number of Provinces, Redundant Connection
- **10.6 Dijkstra**: Google Maps fastest route; Network Delay Time, Cheapest Flights Within K Stops
- **10.7 Bellman-Ford and Floyd-Warshall**: toll roads with discounts
- **10.8 Minimum spanning tree**: laying cable at the lowest cost (Kruskal and Prim); Min Cost to Connect Points
- **10.9 Grid problems**: treasure map; Shortest Path in Binary Matrix, Pacific Atlantic Water Flow

**Module 11: Tries**

- **11.1 Trie**: phone contacts autocomplete; trie viz; Implement Trie
- **11.2 Dictionary problems**: Word Search II, Add and Search Word

**Module 12: Dynamic Programming**

- **12.1 Why DP**: not redoing homework you already solved; Fibonacci call tree with repeats highlighted
- **12.2 Memoization vs tabulation**: notebook of answers vs filling a table; table viz
- **12.3 1D DP**: climbing stairs; Climbing Stairs, House Robber, Coin Change
- **12.4 Knapsack**: packing a bag for a trip; 0/1 Knapsack, Partition Equal Subset Sum
- **12.5 Grid DP**: a robot walking a grid; Unique Paths, Minimum Path Sum
- **12.6 String DP**: spell-check edits; Longest Common Subsequence, Edit Distance
- **12.7 LIS and decision DP**: buy and sell decisions; LIS, Stock problems
- **12.8 The 5-step DP recipe**: state, transition, base case, order, answer

**Module 13: Greedy and Intervals**

- **13.1 Greedy**: always grabbing the biggest coin; when it works and when it fails
- **13.2 Interval scheduling**: booking meeting rooms; Meeting Rooms II, Non-overlapping Intervals
- **13.3 Jump and gas problems**: Jump Game, Gas Station

**Module 14: Bits and Math**

- **14.1 Bit manipulation**: light switches; XOR tricks; Single Number, Counting Bits
- **14.2 Number basics**: clock arithmetic for modulo, gcd, primes; Count Primes, Pow(x, n)
- **14.3 Matrix and simulation**: Rotate Image, Spiral Matrix

### Track 2: Interview Patterns (the 15-pattern playbook)

Each pattern gets one chapter: clue card, template code, 5 problems tagged from Track 1, and a 5-minute drill.

1. **Two pointers**: sorted input, pairs, palindromes
2. **Sliding window**: longest or shortest contiguous part meeting a rule
3. **Prefix sum and hashmap**: count subarrays with a target sum
4. **Fast and slow pointers**: cycle, middle, linked list
5. **Binary search (including on the answer)**: sorted data, or minimize the maximum
6. **Monotonic stack**: next greater or smaller element
7. **Heap and Top-K**: kth largest, streams, merging sorted lists
8. **Intervals**: overlaps, merging, scheduling
9. **BFS**: shortest path with equal costs, level by level
10. **DFS and backtracking**: all combinations, permutations, paths
11. **Topological sort**: dependencies and ordering
12. **Union-Find**: groups merging, connectivity
13. **Dynamic programming**: count ways, min or max with choices, repeated subproblems
14. **Greedy**: a local best choice that is provably safe
15. **Trie and bits**: prefix lookups, XOR for unique elements

### Track 3: System Design (the restaurant track)

**Part A: Building blocks**

- **S1 What is system design?**: tour of a restaurant (waiter, kitchen, pantry)
- **S2 Client, server and HTTP**: customer and waiter conversation
- **S3 APIs (REST, GraphQL, gRPC)**: fixed menu, build-your-own plate, walkie-talkie to the kitchen
- **S4 Databases and indexing**: ledger book vs sticky notes (SQL vs NoSQL); the index at the back of a book
- **S5 Caching**: today’s specials board; TTL, eviction, cache-aside, write-through
- **S6 Load balancing**: the host seating guests; round robin, least connections
- **S7 Scaling**: one bigger chef vs more chefs (vertical vs horizontal)
- **S8 Replication and sharding**: photocopies of the recipe book vs splitting the book by alphabet
- **S9 CAP theorem and consistency**: two bank branches that must agree
- **S10 Queues and pub/sub**: order slips on the kitchen rail; Kafka idea
- **S11 CDN and object storage**: neighborhood kiosks stocking popular items; file storage like S3
- **S12 Rate limiting and API gateway**: the bouncer; token bucket
- **S13 Auth and security basics**: ID check at the door; sessions, JWT, OAuth idea, HTTPS
- **S14 Monolith vs microservices**: one big kitchen vs food-court stalls
- **S15 Reliability and observability**: fire alarms and health checks; retries, timeouts, circuit breaker, logs, metrics, tracing
- **S16 Back-of-envelope estimation**: counting rice grains; QPS, storage, bandwidth

**Part B: Case studies** (each follows: requirements, estimation, API and data model, high-level design, deep dive and trade-offs)

- C1 URL shortener
- C2 Rate limiter
- C3 Chat app
- C4 News feed
- C5 Notification service
- C6 Ride hailing
- C7 Video streaming
- C8 Search autocomplete
- C9 UPI-style payments (idempotency, double-spend safety)
- C10 IoT telemetry ingestion (millions of devices sending readings)

**Part C: Low-level design**

- L1 SOLID principles (LEGO blocks)
- L2 Design patterns: Strategy, Observer, Factory, Singleton
- L3 Case studies: Parking Lot, Elevator, Movie Seat Booking, LRU Cache, Expense Splitter

### Track 4: Competitive Programming

- **P1 Setup and constraints**: reading the speed limit sign; fast I/O, templates, the constraints-to-complexity cheat table (N up to 1e5 means O(n log n))
- **P2 Math toolkit**: clock arithmetic; gcd, modular math, fast exponentiation
- **P3 Sieve and number theory**: crossing out multiples on a number chart
- **P4 Prefix sums and difference arrays**: cumulative scoreboards
- **P5 Binary search and ternary search**: guessing games on answers
- **P6 Graphs in contests**: BFS, Dijkstra with a priority queue, DSU speed tricks
- **P7 Fenwick and segment trees**: an office tower where each floor reports totals; range queries and updates
- **P8 Advanced DP**: bitmask DP, digit DP, DP on trees
- **P9 Greedy proofs and constructive problems**: why the shortcut is safe
- **P10 Contest strategy**: reading problems, time boxing, upsolving, stress testing; rating ladder from 800 to 1600

### Track 5: Interview Skills

- **I1 Anatomy of an interview**: rounds, what each tests
- **I2 The think-aloud framework**: Understand, Match pattern, Plan, Implement, Review, Evaluate complexity
- **I3 Behavioral answers**: STAR stories from real projects
- **I4 Resume and project storytelling**: turning work into impact statements
- **I5 Handling hints and getting unstuck**: what to say when blank
- **I6 Testing your code aloud**: edge cases checklist
- **I7 Study plans**: 4-week and 8-week schedules
- **I8 Mock interview playbook**: peer mock rubric (problem solving, communication, code quality, testing, complexity)

### Track 6: AI Mock Interview (Coming Soon)

Shown as a locked, previewable page with a waitlist. Planned features:

- AI interviewer that asks clarifying follow-ups
- Live scoring of explanation clarity, complexity analysis and trade-offs
- System design canvas review
- Scorecard with weak pattern suggestions
- Needs: an LLM API key, a server-side route with rate limiting, and the ClaudeProvider file.

## 5. Suggested writing order

1. Reference chapters: 5.1 Stack, 7.1 Binary search, 10.2 BFS
2. Track 0 and Modules 1 to 5
3. Modules 6 to 10, then Track 2 patterns
4. Track 3 Part A, then case studies
5. Modules 11 to 14, Track 4, Track 5

Publish after step 2 so real learners can start while the rest is written.
