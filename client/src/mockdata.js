export const mockLesson = {
  id: "lesson-js-variables",
  title: "JavaScript Variables",
  language: "javascript",
  videoLength: 12,

  timeline: [

    {
      timestamp: 0,
      codeSnapshot: "",
      explanationText: "Starting the lesson"
    },

    {
      timestamp: 1,
      codeSnapshot: "// JavaScript Variables",
      explanationText: "We begin with a comment"
    },

    {
      timestamp: 2,
      codeSnapshot: `// JavaScript Variables
// Variables store data`,
      explanationText: "Explaining what variables do"
    },

    {
      timestamp: 3,
      codeSnapshot: `// JavaScript Variables
// Variables store data

let message`,
      explanationText: "Typing the variable name"
    },

    {
      timestamp: 4,
      codeSnapshot: `// JavaScript Variables
// Variables store data

let message =`,
      explanationText: "Assigning value"
    },

    {
      timestamp: 5,
      codeSnapshot: `// JavaScript Variables
// Variables store data

let message = "Hello"`,
      explanationText: "String value added"
    },

    {
      timestamp: 6,
      codeSnapshot: `// JavaScript Variables
// Variables store data

let message = "Hello";`,
      explanationText: "Statement completed"
    },

    {
      timestamp: 7,
      codeSnapshot: `// JavaScript Variables
// Variables store data

let message = "Hello";

console`,
      explanationText: "Starting console log"
    },

    {
      timestamp: 8,
      codeSnapshot: `// JavaScript Variables
// Variables store data

let message = "Hello";

console.log`,
      explanationText: "Adding log function"
    },

    {
      timestamp: 9,
      codeSnapshot: `// JavaScript Variables
// Variables store data

let message = "Hello";

console.log(message`,
      explanationText: "Passing variable"
    },

    {
      timestamp: 10,
      codeSnapshot: `// JavaScript Variables
// Variables store data

let message = "Hello";

console.log(message);`,
      explanationText: "Printing variable"
    },

    {
      timestamp: 11,
      codeSnapshot: `// JavaScript Variables
// Variables store data

let message = "Hello";

console.log(message);

// Your turn`,
      explanationText: "Student interaction"
    }

  ]
};