"use client"

import { useParams, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { SessionDetailHeader } from "@/components/session-detail-header"
import { SessionInfoCard } from "@/components/session-info-card"
import { GroupInfoCard } from "@/components/group-info-card"
import { QuestionCard } from "@/components/question-card"
import { TestCasesPanel } from "@/components/test-cases-panel"
import { CheckCircle, Award } from 'lucide-react'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { StudentLayout } from "@/components/student-layout"
import { Header } from "@/components/header"

// Mock session data with updated structure
const sessionData: Record<string, any> = {
  "1": {
    id: "1",
    title: "Data Structures Lab Assignment",
    courseCode: "CSC301",
    description: "Implement linked lists and perform basic operations such as insertion, deletion, and traversal.",
    status: "ONGOING",
    isCollaborative: true,
    instructor: "Dr. Rhoda Ogunesan",
    startTime: "2025-02-05T12:00:00Z",
    endTime: "2025-02-05T16:00:00Z",
    duration: "4 hours",
    languages: ["Python", "C++", "Java"],
    questions: [
      {
        id: "q1",
        title: "Question 1: Linked List Implementation",
        description: "Implement a singly linked list with the following operations:",
        requirements: [
          "Create a Node class with data and next pointer",
          "Implement insert_at_beginning() method",
          "Implement insert_at_end() method",
          "Implement delete_node() method",
          "Implement display() method to print all elements",
        ],
        points: 40,
        timeLimit: "2 hours",
        testCases: [
          {
            id: "tc1",
            name: "Basic Operations",
            input: "Insert: [1, 2, 3], Delete: 2",
            expectedOutput: "1 -> 3 -> NULL",
            points: 15,
            isHidden: false,
          },
          {
            id: "tc2",
            name: "Empty List Handling",
            input: "Delete from empty list",
            expectedOutput: "Error: List is empty",
            points: 10,
            isHidden: false,
          },
          {
            id: "tc3",
            name: "Large Dataset",
            input: "Insert 1000 elements, delete every 3rd",
            expectedOutput: "Correct remaining elements",
            points: 10,
            isHidden: true,
          },
          {
            id: "tc4",
            name: "Edge Cases",
            input: "Various edge case scenarios",
            expectedOutput: "All edge cases handled correctly",
            points: 5,
            isHidden: true,
          },
        ],
        evaluationCriteria: [
          {
            id: "compilation",
            name: "Successful Compilation",
            description: "Code compiles without errors",
            points: 20,
          },
          {
            id: "execution",
            name: "Successful Execution",
            description: "Code runs without runtime errors",
            points: 15,
          },
          {
            id: "correctness",
            name: "Correctness",
            description: "Produces correct output for test cases",
            points: 40,
          },
          {
            id: "code_quality",
            name: "Code Quality",
            description: "Clean, readable, and well-structured code",
            points: 15,
          },
          {
            id: "efficiency",
            name: "Efficiency",
            description: "Optimal time and space complexity",
            points: 10,
          },
        ],
      },
      {
        id: "q2",
        title: "Question 2: List Traversal and Search",
        description: "Extend your linked list implementation with search and traversal operations:",
        requirements: [
          "Implement search() method to find a specific value",
          "Implement get_length() method to count nodes",
          "Implement reverse() method to reverse the list",
          "Add error handling for edge cases",
        ],
        points: 30,
        timeLimit: "1.5 hours",
        testCases: [
          {
            id: "tc1",
            name: "Search Operations",
            input: "Search for 3 in [1, 2, 3, 4, 5]",
            expectedOutput: "Found at index 2",
            points: 8,
            isHidden: false,
          },
          {
            id: "tc2",
            name: "Length Calculation",
            input: "Get length of [1, 2, 3, 4, 5]",
            expectedOutput: "Length: 5",
            points: 7,
            isHidden: false,
          },
          {
            id: "tc3",
            name: "List Reversal",
            input: "Reverse [1, 2, 3, 4, 5]",
            expectedOutput: "5 -> 4 -> 3 -> 2 -> 1 -> NULL",
            points: 10,
            isHidden: false,
          },
          {
            id: "tc4",
            name: "Complex Search",
            input: "Search in large dataset",
            expectedOutput: "Correct search results",
            points: 5,
            isHidden: true,
          },
        ],
        evaluationCriteria: [
          {
            id: "compilation",
            name: "Successful Compilation",
            description: "Code compiles without errors",
            points: 20,
          },
          {
            id: "execution",
            name: "Successful Execution",
            description: "Code runs without runtime errors",
            points: 15,
          },
          {
            id: "correctness",
            name: "Correctness",
            description: "Produces correct output for test cases",
            points: 40,
          },
          {
            id: "code_quality",
            name: "Code Quality",
            description: "Clean, readable, and well-structured code",
            points: 15,
          },
          {
            id: "efficiency",
            name: "Efficiency",
            description: "Optimal time and space complexity",
            points: 10,
          },
        ],
      },
      {
        id: "q3",
        title: "Question 3: Advanced Operations",
        description: "Implement advanced linked list operations:",
        requirements: [
          "Implement merge() method to combine two sorted lists",
          "Implement remove_duplicates() method",
          "Add comprehensive test cases",
          "Document your code with comments",
        ],
        points: 30,
        timeLimit: "30 minutes",
        testCases: [
          {
            id: "tc1",
            name: "Merge Sorted Lists",
            input: "Merge [1, 3, 5] and [2, 4, 6]",
            expectedOutput: "1 -> 2 -> 3 -> 4 -> 5 -> 6 -> NULL",
            points: 12,
            isHidden: false,
          },
          {
            id: "tc2",
            name: "Remove Duplicates",
            input: "Remove duplicates from [1, 1, 2, 3, 3, 4]",
            expectedOutput: "1 -> 2 -> 3 -> 4 -> NULL",
            points: 8,
            isHidden: false,
          },
          {
            id: "tc3",
            name: "Complex Merge",
            input: "Merge multiple large sorted lists",
            expectedOutput: "Correctly merged result",
            points: 10,
            isHidden: true,
          },
        ],
        evaluationCriteria: [
          {
            id: "compilation",
            name: "Successful Compilation",
            description: "Code compiles without errors",
            points: 20,
          },
          {
            id: "execution",
            name: "Successful Execution",
            description: "Code runs without runtime errors",
            points: 15,
          },
          {
            id: "correctness",
            name: "Correctness",
            description: "Produces correct output for test cases",
            points: 40,
          },
          {
            id: "code_quality",
            name: "Code Quality",
            description: "Clean, readable, and well-structured code",
            points: 15,
          },
          {
            id: "efficiency",
            name: "Efficiency",
            description: "Optimal time and space complexity",
            points: 10,
          },
        ],
      },
    ],
  },
  "2": {
    id: "2",
    title: "Web Development Practical",
    courseCode: "CSC411",
    description:
      "Build a responsive website using HTML, CSS, and JavaScript with modern frameworks and best practices.",
    status: "OPEN",
    isCollaborative: false,
    instructor: "Prof. Michael Chen",
    startTime: "2025-02-08T10:00:00Z",
    endTime: "2025-02-08T13:00:00Z",
    duration: "3 hours",
    languages: ["HTML", "CSS", "JavaScript", "React"],
    questions: [
      {
        id: "q1",
        title: "Question 1: Responsive Layout",
        description: "Create a responsive webpage layout using HTML and CSS:",
        requirements: [
          "Create a header with navigation menu",
          "Design a main content area with sidebar",
          "Implement responsive design for mobile devices",
          "Use CSS Grid or Flexbox for layout",
        ],
        points: 50,
        timeLimit: "2 hours",
        testCases: [
          {
            id: "tc1",
            name: "Desktop Layout",
            input: "Viewport: 1200px width",
            expectedOutput: "Proper desktop layout with sidebar",
            points: 15,
            isHidden: false,
          },
          {
            id: "tc2",
            name: "Mobile Layout",
            input: "Viewport: 375px width",
            expectedOutput: "Mobile-optimized layout",
            points: 15,
            isHidden: false,
          },
          {
            id: "tc3",
            name: "Cross-browser Compatibility",
            input: "Test on multiple browsers",
            expectedOutput: "Consistent appearance",
            points: 10,
            isHidden: true,
          },
          {
            id: "tc4",
            name: "Performance Test",
            input: "Page load speed test",
            expectedOutput: "Fast loading times",
            points: 10,
            isHidden: true,
          },
        ],
        evaluationCriteria: [
          {
            id: "validation",
            name: "HTML/CSS Validation",
            description: "Valid HTML and CSS code",
            points: 20,
          },
          {
            id: "responsiveness",
            name: "Responsive Design",
            description: "Works on all screen sizes",
            points: 25,
          },
          {
            id: "functionality",
            name: "Functionality",
            description: "All features work as expected",
            points: 30,
          },
          {
            id: "design_quality",
            name: "Design Quality",
            description: "Clean and professional appearance",
            points: 15,
          },
          {
            id: "accessibility",
            name: "Accessibility",
            description: "Follows accessibility guidelines",
            points: 10,
          },
        ],
      },
      {
        id: "q2",
        title: "Question 2: Interactive Features",
        description: "Add JavaScript functionality to your webpage:",
        requirements: [
          "Implement form validation",
          "Add interactive navigation menu",
          "Create dynamic content updates",
          "Handle user events (click, hover, etc.)",
        ],
        points: 50,
        timeLimit: "1 hour",
        testCases: [
          {
            id: "tc1",
            name: "Form Validation",
            input: "Submit form with invalid data",
            expectedOutput: "Proper validation messages",
            points: 15,
            isHidden: false,
          },
          {
            id: "tc2",
            name: "Interactive Menu",
            input: "Click on menu items",
            expectedOutput: "Smooth navigation transitions",
            points: 15,
            isHidden: false,
          },
          {
            id: "tc3",
            name: "Dynamic Content",
            input: "Trigger content updates",
            expectedOutput: "Content updates without page reload",
            points: 15,
            isHidden: false,
          },
          {
            id: "tc4",
            name: "Error Handling",
            input: "Various error scenarios",
            expectedOutput: "Graceful error handling",
            points: 5,
            isHidden: true,
          },
        ],
        evaluationCriteria: [
          {
            id: "functionality",
            name: "JavaScript Functionality",
            description: "All interactive features work",
            points: 30,
          },
          {
            id: "validation",
            name: "Form Validation",
            description: "Proper input validation",
            points: 20,
          },
          {
            id: "user_experience",
            name: "User Experience",
            description: "Smooth and intuitive interactions",
            points: 25,
          },
          {
            id: "error_handling",
            name: "Error Handling",
            description: "Graceful error management",
            points: 15,
          },
          {
            id: "code_organization",
            name: "Code Organization",
            description: "Well-structured JavaScript code",
            points: 10,
          },
        ],
      },
    ],
  },
  "5": {
    id: "5",
    title: "Algorithms Weekly Challenge",
    courseCode: "CSC502",
    description: "Solve complex algorithmic problems focusing on dynamic programming, graph theory, and optimization.",
    status: "OPEN",
    isCollaborative: false,
    instructor: "Dr. Alex Martinez",
    startTime: "2025-02-18T13:00:00Z",
    endTime: "2025-02-18T16:00:00Z",
    duration: "3 hours",
    languages: ["Python", "C++", "Java"],
    questions: [
      {
        id: "q1",
        title: "Question 1: Dynamic Programming",
        description: "Solve the following dynamic programming problems:",
        requirements: [
          "Implement the Fibonacci sequence using dynamic programming",
          "Solve the 0/1 Knapsack problem",
          "Find the longest common subsequence between two strings",
          "Optimize for both time and space complexity",
        ],
        points: 40,
        timeLimit: "1.5 hours",
        testCases: [
          {
            id: "tc1",
            name: "Fibonacci Sequence",
            input: "n = 10",
            expectedOutput: "55",
            points: 10,
            isHidden: false,
          },
          {
            id: "tc2",
            name: "Knapsack Problem",
            input: "weights=[1,3,4,5], values=[1,4,5,7], capacity=7",
            expectedOutput: "9",
            points: 15,
            isHidden: false,
          },
          {
            id: "tc3",
            name: "Longest Common Subsequence",
            input: "str1='ABCDGH', str2='AEDFHR'",
            expectedOutput: "3",
            points: 10,
            isHidden: false,
          },
          {
            id: "tc4",
            name: "Large Input Test",
            input: "Large dataset with n=1000",
            expectedOutput: "Correct result within time limit",
            points: 5,
            isHidden: true,
          },
        ],
        evaluationCriteria: [
          {
            id: "correctness",
            name: "Correctness",
            description: "Produces correct output for all test cases",
            points: 40,
          },
          {
            id: "efficiency",
            name: "Time Complexity",
            description: "Optimal time complexity implementation",
            points: 25,
          },
          {
            id: "space_efficiency",
            name: "Space Complexity",
            description: "Efficient memory usage",
            points: 20,
          },
          {
            id: "code_quality",
            name: "Code Quality",
            description: "Clean and readable code",
            points: 15,
          },
          {
            id: "efficiency",
            name: "Efficiency",
            description: "Optimal time and space complexity",
            points: 10,
          },
        ],
      },
      {
        id: "q2",
        title: "Question 2: Graph Algorithms",
        description: "Implement graph traversal and shortest path algorithms:",
        requirements: [
          "Implement Depth-First Search (DFS)",
          "Implement Breadth-First Search (BFS)",
          "Find shortest path using Dijkstra's algorithm",
          "Handle both directed and undirected graphs",
        ],
        points: 35,
        timeLimit: "1 hour",
        testCases: [
          {
            id: "tc1",
            name: "DFS Traversal",
            input: "Graph with 5 nodes",
            expectedOutput: "Correct DFS order",
            points: 8,
            isHidden: false,
          },
          {
            id: "tc2",
            name: "BFS Traversal",
            input: "Graph with 5 nodes",
            expectedOutput: "Correct BFS order",
            points: 8,
            isHidden: false,
          },
          {
            id: "tc3",
            name: "Shortest Path",
            input: "Weighted graph with 6 nodes",
            expectedOutput: "Minimum distance path",
            points: 12,
            isHidden: false,
          },
          {
            id: "tc4",
            name: "Complex Graph",
            input: "Large graph with 100+ nodes",
            expectedOutput: "Correct results within time limit",
            points: 7,
            isHidden: true,
          },
        ],
        evaluationCriteria: [
          {
            id: "correctness",
            name: "Algorithm Correctness",
            description: "Correct implementation of algorithms",
            points: 35,
          },
          {
            id: "efficiency",
            name: "Performance",
            description: "Efficient algorithm implementation",
            points: 30,
          },
          {
            id: "edge_cases",
            name: "Edge Case Handling",
            description: "Proper handling of edge cases",
            points: 20,
          },
          {
            id: "code_structure",
            name: "Code Structure",
            description: "Well-organized and modular code",
            points: 15,
          },
        ],
      },
      {
        id: "q3",
        title: "Question 3: Optimization Challenge",
        description: "Solve an advanced optimization problem:",
        requirements: [
          "Implement a solution for the Traveling Salesman Problem",
          "Use dynamic programming with bitmasks",
          "Optimize for the best possible time complexity",
          "Handle graphs with up to 15 nodes",
        ],
        points: 25,
        timeLimit: "30 minutes",
        testCases: [
          {
            id: "tc1",
            name: "Small TSP Instance",
            input: "4 cities with distance matrix",
            expectedOutput: "Minimum tour cost",
            points: 8,
            isHidden: false,
          },
          {
            id: "tc2",
            name: "Medium TSP Instance",
            input: "8 cities with distance matrix",
            expectedOutput: "Optimal tour cost",
            points: 10,
            isHidden: false,
          },
          {
            id: "tc3",
            name: "Large TSP Instance",
            input: "15 cities with distance matrix",
            expectedOutput: "Optimal solution within time limit",
            points: 7,
            isHidden: true,
          },
        ],
        evaluationCriteria: [
          {
            id: "algorithm_choice",
            name: "Algorithm Selection",
            description: "Appropriate algorithm for the problem",
            points: 25,
          },
          {
            id: "implementation",
            name: "Implementation Quality",
            description: "Correct and efficient implementation",
            points: 35,
          },
          {
            id: "optimization",
            name: "Optimization Techniques",
            description: "Use of advanced optimization techniques",
            points: 25,
          },
          {
            id: "documentation",
            name: "Code Documentation",
            description: "Clear comments and explanations",
            points: 15,
          },
        ],
      },
    ],
  },
  "7": {
    id: "7",
    title: "Introduction to Computer Networks",
    courseCode: "CSC320",
    description: "Learn the fundamentals of computer networking, protocols, and network security concepts.",
    status: "OPEN",
    isCollaborative: false,
    instructor: "Dr. James Wilson",
    startTime: "2025-02-22T15:00:00Z",
    endTime: "2025-02-22T17:00:00Z",
    duration: "2 hours",
    languages: ["C", "Python"],
    questions: [
      {
        id: "q1",
        title: "Question 1: Network Protocol Implementation",
        description: "Implement basic network protocol functions:",
        requirements: [
          "Create a simple TCP client-server communication",
          "Implement basic error checking and handling",
          "Handle multiple client connections",
          "Add proper connection management",
        ],
        points: 50,
        timeLimit: "1 hour",
        testCases: [
          {
            id: "tc1",
            name: "Basic Connection",
            input: "Single client connection",
            expectedOutput: "Successful connection and data transfer",
            points: 15,
            isHidden: false,
          },
          {
            id: "tc2",
            name: "Multiple Clients",
            input: "3 concurrent client connections",
            expectedOutput: "All clients handled correctly",
            points: 20,
            isHidden: false,
          },
          {
            id: "tc3",
            name: "Error Handling",
            input: "Network errors and disconnections",
            expectedOutput: "Graceful error handling",
            points: 10,
            isHidden: false,
          },
          {
            id: "tc4",
            name: "Load Test",
            input: "High number of concurrent connections",
            expectedOutput: "System remains stable",
            points: 5,
            isHidden: true,
          },
        ],
        evaluationCriteria: [
          {
            id: "functionality",
            name: "Network Functionality",
            description: "Correct network communication",
            points: 30,
          },
          {
            id: "concurrency",
            name: "Concurrency Handling",
            description: "Proper handling of multiple connections",
            points: 25,
          },
          {
            id: "error_handling",
            name: "Error Management",
            description: "Robust error handling",
            points: 25,
          },
          {
            id: "code_quality",
            name: "Code Quality",
            description: "Clean and maintainable code",
            points: 20,
          },
        ],
      },
      {
        id: "q2",
        title: "Question 2: Network Security Basics",
        description: "Implement basic network security measures:",
        requirements: [
          "Add simple authentication to your network application",
          "Implement basic encryption for data transmission",
          "Create a simple firewall rule checker",
          "Add logging for security events",
        ],
        points: 50,
        timeLimit: "1 hour",
        testCases: [
          {
            id: "tc1",
            name: "Authentication Test",
            input: "Valid and invalid credentials",
            expectedOutput: "Correct authentication behavior",
            points: 15,
            isHidden: false,
          },
          {
            id: "tc2",
            name: "Encryption Test",
            input: "Plain text data",
            expectedOutput: "Encrypted transmission and correct decryption",
            points: 20,
            isHidden: false,
          },
          {
            id: "tc3",
            name: "Firewall Rules",
            input: "Various IP addresses and ports",
            expectedOutput: "Correct allow/deny decisions",
            points: 10,
            isHidden: false,
          },
          {
            id: "tc4",
            name: "Security Logging",
            input: "Security events",
            expectedOutput: "Proper logging of security events",
            points: 5,
            isHidden: true,
          },
        ],
        evaluationCriteria: [
          {
            id: "security_implementation",
            name: "Security Implementation",
            description: "Correct implementation of security measures",
            points: 35,
          },
          {
            id: "encryption_quality",
            name: "Encryption Quality",
            description: "Proper encryption implementation",
            points: 25,
          },
          {
            id: "authentication",
            name: "Authentication System",
            description: "Secure authentication mechanism",
            points: 25,
          },
          {
            id: "logging",
            name: "Security Logging",
            description: "Comprehensive security logging",
            points: 15,
          },
        ],
      },
    ],
  },
  "8": {
    id: "8",
    title: "Operating Systems Principles",
    courseCode: "CSC405",
    description: "Explore operating system concepts including process management, memory management, and file systems.",
    status: "OPEN",
    isCollaborative: false,
    instructor: "Prof. Lisa Thompson",
    startTime: "2025-02-25T11:30:00Z",
    endTime: "2025-02-25T14:30:00Z",
    duration: "3 hours",
    languages: ["C", "Assembly"],
    questions: [
      {
        id: "q1",
        title: "Question 1: Process Management",
        description: "Implement basic process management functions:",
        requirements: [
          "Create a simple process scheduler (Round Robin)",
          "Implement process creation and termination",
          "Handle process synchronization with semaphores",
          "Manage process states and transitions",
        ],
        points: 40,
        timeLimit: "1.5 hours",
        testCases: [
          {
            id: "tc1",
            name: "Process Creation",
            input: "Create 5 processes",
            expectedOutput: "All processes created successfully",
            points: 10,
            isHidden: false,
          },
          {
            id: "tc2",
            name: "Round Robin Scheduling",
            input: "5 processes with different execution times",
            expectedOutput: "Correct scheduling order and timing",
            points: 15,
            isHidden: false,
          },
          {
            id: "tc3",
            name: "Synchronization",
            input: "Processes accessing shared resources",
            expectedOutput: "No race conditions, proper synchronization",
            points: 10,
            isHidden: false,
          },
          {
            id: "tc4",
            name: "Stress Test",
            input: "100+ processes with complex interactions",
            expectedOutput: "System remains stable and responsive",
            points: 5,
            isHidden: true,
          },
        ],
        evaluationCriteria: [
          {
            id: "scheduler_correctness",
            name: "Scheduler Implementation",
            description: "Correct implementation of Round Robin scheduler",
            points: 30,
          },
          {
            id: "synchronization",
            name: "Process Synchronization",
            description: "Proper use of synchronization primitives",
            points: 25,
          },
          {
            id: "process_management",
            name: "Process Management",
            description: "Correct process lifecycle management",
            points: 25,
          },
          {
            id: "system_stability",
            name: "System Stability",
            description: "System remains stable under load",
            points: 20,
          },
        ],
      },
      {
        id: "q2",
        title: "Question 2: Memory Management",
        description: "Implement memory management algorithms:",
        requirements: [
          "Implement a simple memory allocator (First Fit)",
          "Add memory deallocation and defragmentation",
          "Handle memory protection and bounds checking",
          "Implement virtual memory simulation",
        ],
        points: 35,
        timeLimit: "1 hour",
        testCases: [
          {
            id: "tc1",
            name: "Memory Allocation",
            input: "Multiple allocation requests of varying sizes",
            expectedOutput: "Successful allocation with First Fit algorithm",
            points: 10,
            isHidden: false,
          },
          {
            id: "tc2",
            name: "Memory Deallocation",
            input: "Allocate and deallocate memory blocks",
            expectedOutput: "Proper deallocation and memory reuse",
            points: 10,
            isHidden: false,
          },
          {
            id: "tc3",
            name: "Memory Protection",
            input: "Attempts to access invalid memory",
            expectedOutput: "Proper bounds checking and error handling",
            points: 10,
            isHidden: false,
          },
          {
            id: "tc4",
            name: "Virtual Memory",
            input: "Page faults and virtual address translation",
            expectedOutput: "Correct virtual memory simulation",
            points: 5,
            isHidden: true,
          },
        ],
        evaluationCriteria: [
          {
            id: "allocation_algorithm",
            name: "Allocation Algorithm",
            description: "Correct implementation of First Fit",
            points: 30,
          },
          {
            id: "memory_protection",
            name: "Memory Protection",
            description: "Proper bounds checking and protection",
            points: 25,
          },
          {
            id: "virtual_memory",
            name: "Virtual Memory",
            description: "Correct virtual memory implementation",
            points: 25,
          },
          {
            id: "efficiency",
            name: "Memory Efficiency",
            description: "Efficient memory usage and minimal fragmentation",
            points: 20,
          },
        ],
      },
      {
        id: "q3",
        title: "Question 3: File System Implementation",
        description: "Create a simple file system:",
        requirements: [
          "Implement basic file operations (create, read, write, delete)",
          "Add directory structure support",
          "Implement file permissions and access control",
          "Handle file system metadata",
        ],
        points: 25,
        timeLimit: "30 minutes",
        testCases: [
          {
            id: "tc1",
            name: "File Operations",
            input: "Create, write, read, and delete files",
            expectedOutput: "All file operations work correctly",
            points: 8,
            isHidden: false,
          },
          {
            id: "tc2",
            name: "Directory Structure",
            input: "Create nested directories and files",
            expectedOutput: "Proper directory hierarchy",
            points: 8,
            isHidden: false,
          },
          {
            id: "tc3",
            name: "File Permissions",
            input: "Set and check file permissions",
            expectedOutput: "Correct permission enforcement",
            points: 6,
            isHidden: false,
          },
          {
            id: "tc4",
            name: "Metadata Management",
            input: "File size, timestamps, and attributes",
            expectedOutput: "Accurate metadata tracking",
            points: 3,
            isHidden: true,
          },
        ],
        evaluationCriteria: [
          {
            id: "file_operations",
            name: "File Operations",
            description: "Correct implementation of file operations",
            points: 30,
          },
          {
            id: "directory_structure",
            name: "Directory Management",
            description: "Proper directory structure implementation",
            points: 25,
          },
          {
            id: "permissions",
            name: "Access Control",
            description: "Correct file permission system",
            points: 25,
          },
          {
            id: "metadata",
            name: "Metadata Management",
            description: "Accurate file metadata handling",
            points: 20,
          },
        ],
      },
    ],
  },
}

// Mock group data
const groupData: Record<string, any> = {
  "group-1": {
    id: "group-1",
    name: "Team Alpha",
    members: [
      {
        id: "1",
        name: "John Smith",
        matricNumber: "CSC/2021/001",
        avatar: "JS",
        color: "bg-blue-500",
        isLeader: true,
        status: "online",
      },
      {
        id: "2",
        name: "Sarah Johnson",
        matricNumber: "CSC/2021/045",
        avatar: "SJ",
        color: "bg-purple-500",
        isLeader: false,
        status: "online",
      },
      {
        id: "3",
        name: "Mike Chen",
        matricNumber: "CSC/2021/078",
        avatar: "MC",
        color: "bg-green-500",
        isLeader: false,
        status: "away",
      },
    ],
  },
}


export default function SessionDetailPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const sessionId = params.sessionId as string
  const groupId = searchParams.get("group")
  const email = searchParams.get("email") || ""
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [sessionCompleted, setSessionCompleted] = useState(false)
  const [studentName, setStudentName] = useState("Student User")

  useEffect(() => {
    // Simulate fetching student data
    if (email) {
      const name = email
        .split("@")[0]
        .split(".")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ")
      setStudentName(name)
    }
  }, [email])

  const session = sessionData[sessionId]
  const group = groupId ? groupData[groupId] : null

  if (!session) {
    return (
      <StudentLayout studentEmail={email} studentName={studentName}>
        <div className="p-4 text-center">Session not found. Please check the session ID.</div>
      </StudentLayout>
    )
  }

  const currentQuestion = session.questions[currentQuestionIndex]
  if (!currentQuestion) {
    return (
      <StudentLayout studentEmail={email} studentName={studentName}>
        <div className="p-4 text-center">Question not found for this session.</div>
      </StudentLayout>
    )
  }


  return (
    <>
      <Header title="Session Detail" description="" />
      <SessionDetailHeader session={session} userEmail={email} />
      <div className="overflow-y-auto">
          {sessionCompleted && (
            <div className="bg-green-50 border-l-4 border-green-400 p-4 mx-4 mt-4">
              <div className="flex items-center justify-between">
                  <div className="flex">
                  <div className="flex-shrink-0">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                  </div>
                  <div className="ml-3">
                      <p className="text-sm text-green-700">
                      <strong>Session Completed!</strong> Your submission has been processed and is ready for grading.
                      </p>
                  </div>
                  </div>
                  <div className="flex gap-2">
                  <Link href={`/student_dashboard/session/${sessionId}/grading?email=${encodeURIComponent(email)}`}>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      <Award className="h-4 w-4 mr-2" />
                      View Results
                      </Button>
                  </Link>
                  </div>
              </div>
            </div>
          )}

          <div className="mx-auto px-4 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Left Sidebar - Session & Group Info */}
              <div className="lg:col-span-1 space-y-6">
                <SessionInfoCard session={session} />
                {session.isCollaborative && group && <GroupInfoCard group={group} />}
              </div>

              {/* Main Content - Questions */}
              <div className="lg:col-span-2 space-y-6">
                <QuestionCard
                  question={currentQuestion}
                  questionNumber={currentQuestionIndex + 1}
                  totalQuestions={session.questions.length}
                  onNext={() => setCurrentQuestionIndex(Math.min(currentQuestionIndex + 1, session.questions.length - 1))}
                  onPrevious={() => setCurrentQuestionIndex(Math.max(currentQuestionIndex - 1, 0))}
                  canGoNext={currentQuestionIndex < session.questions.length - 1}
                  canGoPrevious={currentQuestionIndex > 0}
                  sessionId={sessionId}
                />
              </div>

              {/* Right Sidebar - Test Cases Panel */}
              <div className="lg:col-span-1">
                <TestCasesPanel
                  testCases={currentQuestion.testCases}
                  evaluationCriteria={currentQuestion.evaluationCriteria}
                  questionNumber={currentQuestionIndex + 1}
                />
              </div>
            </div>
          </div>
      </div>
    </>
  )
}
