"use client"

import { useParams, useSearchParams } from "next/navigation"
import { ExerciseHeader } from "@/components/execercise-header" // This named import is now correct
import { SolutionEditor } from "@/components/solution-editor"
import { SolutionSidebar } from "@/components/solution-sidebar"
import { QuestionSummaryPanel } from "@/components/question-summary-panel"
import { StudentLayout } from "@/components/student-layout"
import { useState, useEffect } from "react"
import { Header } from "@/components/header"

// Mock session data (same as before, but we'll extract the question)
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
        inputData: "Insert: [1, 2, 3], Delete: 2",
        expectedOutput: "1 -> 3 -> NULL",
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
        inputData: "Search for 3 in [1, 2, 3, 4, 5]",
        expectedOutput: "Found at index 2",
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
        inputData: "Merge [1, 3, 5] and [2, 4, 6]",
        expectedOutput: "1 -> 2 -> 3 -> 4 -> 5 -> 6 -> NULL",
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
    status: "ONGOING",
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
        inputData: "Viewport: 1200px width",
        expectedOutput: "Proper desktop layout with sidebar",
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
        inputData: "Submit form with invalid data",
        expectedOutput: "Proper validation messages",
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
}

export default function ExcercisePage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const sessionId = params.sessionId as string
  const questionId = params.exerciseId as string
  const email = searchParams.get("email") || ""

  const [studentName, setStudentName] = useState("Student User")
  useEffect(() => {
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
  const question = session?.questions.find((q: any) => q.id === questionId)

  if (!session || !question) {
    return <div>Session or question not found</div>
  }

  return (
    <>
        <Header title="Solution Editor" description="Write and submit your code solution" />
        <ExerciseHeader 
            session={session} 
            question={question} 
            userEmail={email} 
            sessionId={sessionId} 
        />
        <main className="px-4 py-6 overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left Panel - Question Summary */}
            <div className="lg:col-span-1">
                <QuestionSummaryPanel question={question} />
            </div>

            {/* Center - Code Editor */}
            <div className="lg:col-span-3 h-100">
                <SolutionEditor session={session} question={question} sessionId={sessionId} questionId={questionId} />
            </div>

            {/* Right Panel - Test Cases */}
            <div className="lg:col-span-1">
                <SolutionSidebar testCases={question.testCases} evaluationCriteria={question.evaluationCriteria} />
            </div>
            </div>
        </main>
    </>
  )
}
