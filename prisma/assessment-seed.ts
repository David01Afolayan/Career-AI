import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type QuestionSeed = {
  skillName: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: string;
};

const question = (
  skillName: string,
  questionText: string,
  options: string[],
  correctAnswer: number,
  explanation: string,
  difficulty: string,
): QuestionSeed => ({
  skillName,
  question: questionText,
  options,
  correctAnswer,
  explanation,
  difficulty,
});

const questions: QuestionSeed[] = [
  question("HTML & CSS", "Which element creates the main page heading?", ["<h1>", "<head>", "<title>", "<heading>"], 0, "The h1 element is the highest-level page heading.", "Beginner"),
  question("HTML & CSS", "Which property changes text color?", ["font-style", "color", "text-color", "foreground"], 1, "The color property controls text color.", "Beginner"),
  question("HTML & CSS", "Which layout system is primarily one-dimensional?", ["Grid", "Flexbox", "Float", "Position"], 1, "Flexbox is designed for row or column layouts.", "Intermediate"),
  question("HTML & CSS", "What controls space inside an element border?", ["margin", "padding", "gap", "spacing"], 1, "Padding is the space between content and the border.", "Beginner"),
  question("HTML & CSS", "What does CSS Grid control?", ["Only text", "Two-dimensional layouts", "Only images", "Database tables"], 1, "Grid controls rows and columns.", "Intermediate"),

  question("JavaScript", "Which keyword declares a reassignable block-scoped variable?", ["var", "let", "const", "static"], 1, "let creates a reassignable block-scoped variable.", "Beginner"),
  question("JavaScript", "Which method parses JSON text?", ["JSON.parse()", "JSON.stringify()", "JSON.object()", "JSON.convert()"], 0, "JSON.parse converts JSON text into a JavaScript value.", "Intermediate"),
  question("JavaScript", "What does Array.map return?", ["A new transformed array", "The first element", "A boolean", "Nothing"], 0, "map returns a new array of transformed values.", "Intermediate"),
  question("JavaScript", "Which operator checks value and type equality?", ["=", "==", "===", "!="], 2, "Strict equality compares both value and type.", "Beginner"),
  question("JavaScript", "What is a Promise used for?", ["Styling", "Asynchronous operations", "HTML creation", "CSS variables"], 1, "Promises represent eventual completion or failure of asynchronous work.", "Advanced"),

  question("React", "What is a React component?", ["A reusable UI building block", "A database", "A CSS file", "A server"], 0, "React applications are composed of reusable components.", "Beginner"),
  question("React", "Which hook manages local state?", ["useState", "useRoute", "useCSS", "useServer"], 0, "useState manages state in functional components.", "Beginner"),
  question("React", "What is JSX?", ["A database language", "A JavaScript syntax extension", "A CSS framework", "A backend server"], 1, "JSX adds markup-like syntax to JavaScript.", "Beginner"),
  question("React", "Why are keys used in React lists?", ["To style items", "To identify elements", "To connect databases", "To encrypt data"], 1, "Keys help React track list elements between renders.", "Intermediate"),
  question("React", "Which hook is used for side effects?", ["useEffect", "useStyle", "useHTML", "useDatabase"], 0, "useEffect synchronizes components with external systems.", "Intermediate"),

  question("Next.js", "Next.js is built primarily on which library?", ["Angular", "React", "Vue", "Svelte"], 1, "Next.js is a React framework.", "Beginner"),
  question("Next.js", "Which directory commonly contains App Router routes?", ["src/app", "src/database", "public/api", "server/routes"], 0, "The App Router uses the app directory.", "Beginner"),
  question("Next.js", "What is a Server Component?", ["A component rendered on the server by default", "A CSS component", "A database table", "A browser extension"], 0, "App Router components are Server Components by default.", "Intermediate"),
  question("Next.js", "Which directive creates a Client Component?", ['"use client"', '"client true"', '"browser"', '"use browser"'], 0, "The use client directive enables client-side interaction.", "Intermediate"),
  question("Next.js", "What is middleware commonly used for?", ["Request processing before a route", "Creating tables", "Writing CSS", "Compressing images only"], 0, "Middleware runs during the request lifecycle before a route.", "Advanced"),

  question("Node.js", "What is Node.js?", ["A JavaScript runtime", "A CSS framework", "A database", "An HTML editor"], 0, "Node.js runs JavaScript outside the browser.", "Beginner"),
  question("Node.js", "Which package manager is commonly used with Node.js?", ["npm", "pip", "composer", "cargo"], 0, "npm is distributed with Node.js.", "Beginner"),
  question("Node.js", "What does Express commonly provide?", ["A Node.js web framework", "A CSS compiler", "A database engine", "A Python runtime"], 0, "Express is commonly used for Node.js APIs.", "Intermediate"),
  question("Node.js", "Where are Node.js environment variables exposed?", ["process.env", "node.env", "global.env", "server.env"], 0, "Node.js exposes environment variables through process.env.", "Intermediate"),
  question("Node.js", "Which status code indicates a successful request?", ["200", "404", "500", "301"], 0, "HTTP 200 indicates success.", "Beginner"),

  question("Python", "Which symbol starts a Python comment?", ["//", "#", "<!--", "/*"], 1, "Python uses # for single-line comments.", "Beginner"),
  question("Python", "Which structure stores key-value pairs?", ["List", "Tuple", "Dictionary", "Set"], 2, "Dictionaries store key-value pairs.", "Beginner"),
  question("Python", "Which library supports numerical arrays?", ["NumPy", "Express", "React", "Prisma"], 0, "NumPy provides numerical array operations.", "Intermediate"),
  question("Python", "What keyword defines a function?", ["function", "def", "func", "method"], 1, "Python functions are defined with def.", "Beginner"),
  question("Python", "Which library is used for tabular data?", ["Pandas", "React", "Express", "NextAuth"], 0, "Pandas provides DataFrame and Series structures.", "Intermediate"),

  question("Java", "Which keyword defines a class?", ["class", "object", "define", "struct"], 0, "The class keyword defines a Java class.", "Beginner"),
  question("Java", "What is the standard Java entry-point method?", ["start()", "main()", "run()", "execute()"], 1, "Execution commonly begins in main.", "Beginner"),
  question("Java", "What allows one class to derive from another?", ["Inheritance", "Encapsulation", "Compilation", "Iteration"], 0, "Inheritance derives behavior from another class.", "Intermediate"),
  question("Java", "Which keyword declares class inheritance?", ["extends", "inherits", "implements", "superclass"], 0, "extends is used for class inheritance.", "Intermediate"),
  question("Java", "Which keyword prevents reassignment?", ["static", "final", "constant", "fixed"], 1, "A final variable cannot be reassigned.", "Intermediate"),

  question("C++", "Which symbol ends most statements?", [".", ";", ":", ","], 1, "Most C++ statements end with a semicolon.", "Beginner"),
  question("C++", "Which keyword declares a class?", ["class", "object", "structclass", "define"], 0, "The class keyword declares a class.", "Beginner"),
  question("C++", "What does a pointer store?", ["A memory address", "Only text", "Only integers", "A database record"], 0, "A pointer stores an address.", "Intermediate"),
  question("C++", "Which header provides std::vector?", ["<vector>", "<array>", "<list>", "<collection>"], 0, "std::vector is defined in the vector header.", "Intermediate"),
  question("C++", "What is encapsulation?", ["Combining data and methods with controlled access", "Deleting variables", "Compiling code", "Sorting arrays"], 0, "Encapsulation bundles state and behavior while controlling access.", "Advanced"),

  question("SQL", "Which command retrieves data?", ["SELECT", "GET", "FETCHDATA", "READ"], 0, "SELECT retrieves rows from tables.", "Beginner"),
  question("SQL", "Which clause filters rows?", ["WHERE", "FILTER", "HAVINGONLY", "LIMIT"], 0, "WHERE applies row conditions.", "Beginner"),
  question("SQL", "Which command adds a record?", ["INSERT", "ADD", "CREATE ROW", "APPEND"], 0, "INSERT INTO adds records.", "Beginner"),
  question("SQL", "What is a primary key used for?", ["Uniquely identifying records", "Sorting CSS", "Encrypting passwords", "Creating backups"], 0, "A primary key uniquely identifies each row.", "Intermediate"),
  question("SQL", "Which operation combines related table rows?", ["JOIN", "MERGE CSS", "CONNECT", "ATTACH"], 0, "JOIN combines related rows.", "Intermediate"),

  question("Data Analysis", "What is the mean?", ["The average value", "The largest value", "The smallest value", "The middle category"], 0, "The mean is the arithmetic average.", "Beginner"),
  question("Data Analysis", "Which library provides DataFrames?", ["Pandas", "React", "Express", "FastAPI"], 0, "Pandas provides DataFrame structures.", "Beginner"),
  question("Data Analysis", "What is a missing value?", ["An unavailable data entry", "A duplicate row only", "A sorted value", "A calculated average"], 0, "Missing values represent unavailable information.", "Beginner"),
  question("Data Analysis", "What is data visualization used for?", ["Communicating patterns and trends", "Encrypting data", "Deleting data", "Compiling Python"], 0, "Charts help communicate patterns and trends.", "Intermediate"),
  question("Data Analysis", "What does correlation measure?", ["Association between variables", "Database size", "Number of rows", "File size"], 0, "Correlation measures association strength and direction.", "Intermediate"),

  question("Machine Learning", "What is supervised learning?", ["Learning from labeled examples", "Learning without data", "Only clustering", "Writing HTML"], 0, "Supervised learning uses labeled examples.", "Beginner"),
  question("Machine Learning", "What is classification?", ["Predicting categories", "Predicting only continuous values", "Deleting data", "Sorting files"], 0, "Classification predicts discrete classes.", "Beginner"),
  question("Machine Learning", "What is overfitting?", ["Good training performance but poor unseen performance", "A model with no features", "A dataset with no rows", "A model that cannot train"], 0, "Overfitting harms generalization.", "Intermediate"),
  question("Machine Learning", "What does accuracy measure?", ["The proportion of correct predictions", "Training time", "Dataset size", "Number of features"], 0, "Accuracy is the fraction of correct predictions.", "Beginner"),
  question("Machine Learning", "Why use a confusion matrix?", ["To compare predicted and actual classes", "To store passwords", "To create web pages", "To measure disk space"], 0, "It shows class-level prediction outcomes.", "Intermediate"),

  question("Networking", "What does IP stand for?", ["Internet Protocol", "Internet Program", "Internal Port", "Interface Process"], 0, "IP means Internet Protocol.", "Beginner"),
  question("Networking", "Which protocol secures web traffic?", ["HTTPS", "FTP", "HTTP", "SMTP"], 0, "HTTPS uses TLS to protect HTTP traffic.", "Beginner"),
  question("Networking", "What does DNS do?", ["Maps domain names to IP addresses", "Encrypts drives", "Creates databases", "Runs JavaScript"], 0, "DNS resolves names to addresses.", "Intermediate"),
  question("Networking", "Which device forwards packets between networks?", ["Router", "Monitor", "Keyboard", "Printer"], 0, "Routers forward packets between networks.", "Beginner"),
  question("Networking", "What does TCP provide?", ["Reliable ordered delivery", "Image editing", "Database indexing", "CSS styling"], 0, "TCP provides reliable ordered transport.", "Intermediate"),

  question("Cybersecurity", "What is phishing?", ["A fraudulent attempt to obtain sensitive information", "A database query", "A network cable", "A programming language"], 0, "Phishing uses deception to steal information.", "Beginner"),
  question("Cybersecurity", "What is multi-factor authentication?", ["Using multiple authentication factors", "Using several usernames", "Changing passwords daily", "Using multiple browsers"], 0, "MFA requires two or more factors.", "Beginner"),
  question("Cybersecurity", "What is SQL injection?", ["Malicious SQL through application input", "Encrypting SQL queries", "Backing up a database", "Creating a table"], 0, "SQL injection manipulates database queries through input.", "Intermediate"),
  question("Cybersecurity", "What is hashing commonly used for?", ["One-way transformation of data", "Rendering websites", "Sending email", "Drawing charts"], 0, "Hashing creates a fixed-size one-way representation.", "Intermediate"),
  question("Cybersecurity", "What is least privilege?", ["Giving only the access a user needs", "Giving everyone admin access", "Disabling all accounts", "Using one password everywhere"], 0, "Least privilege limits unnecessary access.", "Advanced"),

  question("Git & GitHub", "What is Git?", ["A distributed version control system", "A database", "A programming language", "A CSS framework"], 0, "Git tracks changes in distributed repositories.", "Beginner"),
  question("Git & GitHub", "Which command initializes a repository?", ["git init", "git start", "git create", "git repo"], 0, "git init creates repository metadata.", "Beginner"),
  question("Git & GitHub", "Which command records staged changes?", ["git commit", "git save", "git record", "git upload"], 0, "git commit records staged changes.", "Beginner"),
  question("Git & GitHub", "Which command uploads local commits?", ["git push", "git upload", "git send", "git publish"], 0, "git push sends commits to a remote.", "Beginner"),
  question("Git & GitHub", "What is a branch used for?", ["Developing a separate line of work", "Deleting a repository", "Compressing files", "Installing npm"], 0, "Branches isolate lines of development.", "Intermediate"),

  question("Communication", "What is active listening?", ["Paying attention and responding appropriately", "Interrupting frequently", "Ignoring feedback", "Speaking continuously"], 0, "Active listening requires attention and appropriate response.", "Beginner"),
  question("Communication", "Why is clear documentation important?", ["It helps others understand and maintain work", "It makes code faster", "It removes bugs automatically", "It replaces testing"], 0, "Documentation supports maintenance and collaboration.", "Beginner"),
  question("Communication", "What is constructive feedback?", ["Specific feedback intended to improve performance", "Personal criticism", "Ignoring mistakes", "Only giving praise"], 0, "Constructive feedback identifies useful improvements.", "Intermediate"),
  question("Communication", "How should technical ideas be explained to non-technical people?", ["Use clear language and examples", "Use maximum jargon", "Avoid examples", "Only provide source code"], 0, "Clear language and examples improve understanding.", "Intermediate"),
  question("Communication", "Why are requirements important?", ["They clarify what the system should accomplish", "They replace programming", "They eliminate users", "They deploy automatically"], 0, "Requirements define expected system behavior.", "Beginner"),

  question("Problem Solving", "What is the first debugging step?", ["Understand and reproduce the problem", "Delete the project", "Rewrite everything", "Change languages"], 0, "Reproducing a problem helps identify its cause.", "Beginner"),
  question("Problem Solving", "What is an algorithm?", ["A step-by-step procedure for solving a problem", "A database", "A programming language", "A UI component"], 0, "An algorithm defines steps for solving a problem.", "Beginner"),
  question("Problem Solving", "What does time complexity describe?", ["How running time grows with input size", "Monitor size", "Storage size", "Bandwidth only"], 0, "Time complexity relates runtime to input size.", "Intermediate"),
  question("Problem Solving", "Why decompose a large problem?", ["It makes analysis and solving easier", "It always slows code", "It removes testing", "It eliminates algorithms"], 0, "Decomposition makes complex problems manageable.", "Beginner"),
  question("Problem Solving", "What should you inspect after an unexpected algorithm result?", ["Inputs, logic, and intermediate results", "Ignore it", "Delete all code", "Change the computer"], 0, "Inspecting intermediate values helps locate errors.", "Intermediate"),

  question("Docker", "A container works locally but cannot reach the database in production. What should you check first?", ["Container networking and environment variables", "The developer's monitor", "The CSS bundle", "The README title"], 0, "Production connectivity depends on container networking and correctly injected configuration.", "Intermediate"),
  question("Docker", "Which practice keeps a production image smaller and safer?", ["Use a multi-stage build and a minimal base image", "Install every development tool in the final image", "Run all services as root", "Copy the entire repository including secrets"], 0, "Multi-stage builds and minimal images reduce attack surface and deployment size.", "Advanced"),
  question("Docker", "An API container loses uploaded files after it is recreated. What is the correct solution?", ["Mount persistent storage or use object storage", "Disable container restarts", "Store files only in the image", "Increase the CSS cache"], 0, "Containers are ephemeral; persistent data requires volumes or external storage.", "Advanced"),
  question("JavaScript", "A checkout button can be clicked twice before the first request finishes. What is the best prevention?", ["Disable or guard the action while the request is pending", "Add more console.log statements", "Reload the page after every click", "Use a random timeout"], 0, "Pending-state guards prevent duplicate submissions and duplicate transactions.", "Advanced"),
  question("React", "A dashboard makes the same API request on every render. Which issue should you investigate first?", ["An effect dependency or state update causing a render loop", "The database column width", "The browser zoom level", "The HTML doctype"], 0, "Incorrect effect dependencies or state updates commonly trigger repeated requests.", "Advanced"),
  question("Next.js", "A page contains private billing data. Where should the data request be performed?", ["On the server with authorization checks", "In a publicly exposed client-side constant", "Inside the CSS file", "In the page title"], 0, "Sensitive data should be fetched server-side and protected by authorization.", "Advanced"),
  question("Node.js", "An API becomes slow when processing a large report. What is the first performance concern in Node.js?", ["Blocking the event loop with CPU-heavy synchronous work", "The color of the response button", "The URL length only", "The JSON indentation"], 0, "Synchronous CPU-heavy work blocks other requests from being served.", "Advanced"),
  question("Python", "A production service must call a third-party API reliably. Which design is most appropriate?", ["Timeouts, retries with backoff, and structured error handling", "Retry forever without delay", "Ignore all response status codes", "Print the API key in every error"], 0, "Reliable integrations need bounded timeouts, controlled retries and safe error handling.", "Advanced"),
  question("SQL", "A report query is slow because it filters millions of rows by email. What should you evaluate?", ["An index on the filtered column and the query plan", "Changing all values to uppercase manually", "Removing the WHERE clause", "Adding duplicate rows"], 0, "Indexes and query plans help determine whether the database can filter efficiently.", "Advanced"),
  question("Cybersecurity", "A user reports an unfamiliar login from another country. What should the system do first?", ["Revoke suspicious sessions and require re-authentication", "Delete the user's account immediately", "Publish the login details", "Ignore the alert"], 0, "Containing potentially compromised sessions limits damage while the account is investigated.", "Advanced"),
  question("Networking", "An application works by IP address but not by its domain name. Which service should you investigate?", ["DNS resolution", "GPU drivers", "Database indexes", "CSS compilation"], 0, "DNS maps domain names to IP addresses.", "Intermediate"),
  question("Machine Learning", "A model scores 99% on training data but performs poorly on new users. What is the likely issue?", ["Overfitting", "Successful generalization", "A missing CSS class", "Database normalization"], 0, "A large train-test gap is a common sign of overfitting.", "Advanced"),
  question("Data Analysis", "A product team asks why weekly sales dropped. What should an analyst do before proposing a cause?", ["Validate the data, comparison period, and possible collection changes", "Choose the most dramatic explanation", "Delete outliers without review", "Change the chart colors"], 0, "Reliable analysis starts by validating data quality and the comparison being made.", "Advanced"),
  question("Git & GitHub", "A secret was accidentally committed to a public repository. What is the correct first response?", ["Revoke or rotate the secret, then remove it from repository history", "Only delete the local file", "Rename the branch", "Wait for the next release"], 0, "A leaked credential must be invalidated immediately; deleting a file alone does not revoke it.", "Advanced"),
  question("Communication", "A stakeholder requests a feature that conflicts with the release deadline. What is the best response?", ["Clarify impact, trade-offs, and agree on a documented priority", "Promise everything without estimating", "Ignore the request", "Blame another team"], 0, "Clear trade-off communication supports realistic planning and shared decisions.", "Advanced"),
  question("Problem Solving", "A bug cannot be reproduced consistently. What is the most useful next step?", ["Capture conditions, logs, inputs, and a minimal reproduction", "Rewrite the whole system", "Close the issue", "Change unrelated dependencies"], 0, "Reproduction conditions and evidence narrow the cause of intermittent failures.", "Advanced"),

  question("HTML & CSS", "Which browser tool helps a frontend developer inspect layout, styles, and responsive breakpoints?", ["Browser DevTools", "A database client", "A Git remote", "A package registry"], 0, "Browser DevTools can inspect the DOM, CSS rules, layout and device viewports.", "Beginner"),
  question("JavaScript", "Which tool is most useful for tracing a failed API request from a web page?", ["The browser Network panel", "A spreadsheet only", "A Markdown editor", "A font manager"], 0, "The Network panel shows request URLs, payloads, status codes and response details.", "Intermediate"),
  question("React", "Which tool helps identify unnecessary component renders in a React application?", ["React Developer Tools Profiler", "Docker Hub", "A SQL shell", "An SSH key generator"], 0, "The React Profiler records component renders and helps locate rendering bottlenecks.", "Advanced"),
  question("Next.js", "Which command is commonly used to inspect a Next.js production bundle for oversized client dependencies?", ["The Next.js build output and bundle analyzer", "A database vacuum command", "A Git stash", "A password manager"], 0, "Build analysis reveals which client bundles and dependencies contribute most to page size.", "Advanced"),
  question("Node.js", "Which tool should a backend developer use to test an HTTP API before connecting the frontend?", ["Postman or curl", "A CSS preprocessor", "A spreadsheet chart", "A design-only wireframe tool"], 0, "Postman and curl send controlled requests and help verify API behavior independently.", "Beginner"),
  question("Python", "Which tool is most suitable for exploring a dataset and testing Python transformations interactively?", ["Jupyter Notebook", "A Git branch viewer only", "A DNS registrar", "A CSS linter"], 0, "Jupyter Notebook supports interactive Python execution, tables and visual analysis.", "Beginner"),
  question("Java", "Which tool is commonly used to manage Java dependencies and run a repeatable build?", ["Maven or Gradle", "Docker Compose only", "Figma", "A browser bookmark manager"], 0, "Maven and Gradle resolve dependencies and automate Java build and test tasks.", "Intermediate"),
  question("C++", "Which tool helps find memory leaks in a C++ application during testing?", ["AddressSanitizer or Valgrind", "A SQL formatter", "A CDN dashboard", "A UI mockup tool"], 0, "AddressSanitizer and Valgrind detect memory errors and leaks during execution.", "Advanced"),
  question("SQL", "Which tool is useful for viewing query plans and testing database queries safely?", ["A database client such as pgAdmin or DBeaver", "A CSS inspector", "A mobile emulator", "A logo editor"], 0, "Database clients provide query execution, schema browsing and query-plan inspection.", "Beginner"),
  question("Data Analysis", "Which tool is commonly used to transform, analyze and visualize tabular data in Python?", ["Pandas with Matplotlib or Seaborn", "GitHub Actions only", "An SSH terminal theme", "A CSS reset"], 0, "Pandas handles tabular transformations while Matplotlib and Seaborn support visualization.", "Intermediate"),
  question("Machine Learning", "Which tool helps track experiments, parameters and model versions across machine-learning runs?", ["MLflow", "A browser bookmark", "A CSS framework", "A DNS cache"], 0, "MLflow tracks experiment metadata, artifacts and model versions.", "Advanced"),
  question("Networking", "Which command-line tools help verify connectivity and inspect the route to a service?", ["ping, traceroute, and nslookup", "npm and pip", "Git and Docker", "Excel and PowerPoint"], 0, "These tools check reachability, routing and DNS resolution.", "Beginner"),
  question("Cybersecurity", "Which tool can capture and inspect network packets during an authorized investigation?", ["Wireshark", "A Markdown previewer", "A Java formatter", "A spreadsheet filter"], 0, "Wireshark analyzes packet captures and is useful for authorized network troubleshooting.", "Intermediate"),
  question("Docker", "Which tool coordinates an application made of an API, database and supporting services locally?", ["Docker Compose", "React DevTools", "A SQL index", "A browser cookie"], 0, "Docker Compose defines and runs multi-container application environments.", "Beginner"),
  question("Git & GitHub", "Which GitHub feature automatically runs tests when a pull request is opened?", ["GitHub Actions", "Git reflog only", "A browser cache", "A database trigger"], 0, "GitHub Actions can run CI workflows for pushes and pull requests.", "Intermediate"),
  question("Communication", "Which tool is most appropriate for documenting an API so developers can understand and test endpoints?", ["OpenAPI/Swagger documentation", "A private desktop wallpaper", "A CSS animation", "A compiler warning"], 0, "OpenAPI describes endpoints, parameters, responses and often provides an interactive tester.", "Intermediate"),
  question("Problem Solving", "Which tool helps a team search application errors and correlate events across services?", ["Centralized logging such as the ELK stack or Grafana Loki", "A color picker", "A package icon", "A word processor without logs"], 0, "Centralized logs make distributed failures searchable and easier to correlate.", "Advanced"),
];

async function main() {
  console.log("Seeding expanded assessment question bank...");

  const existingQuestionCount = await prisma.assessmentQuestion.count();

  const skills = await prisma.skill.findMany({
    select: { id: true, name: true },
  });
  const skillIds = new Map(skills.map((skill) => [skill.name, skill.id]));

  const missingSkills = [...new Set(questions.map((item) => item.skillName))].filter(
    (skillName) => !skillIds.has(skillName),
  );
  if (missingSkills.length > 0) {
    throw new Error(`Skills not found: ${missingSkills.join(", ")}`);
  }

  const existingQuestions = await prisma.assessmentQuestion.findMany({
    select: { question: true },
  });
  const existingQuestionTexts = new Set(existingQuestions.map((item) => item.question));
  const newQuestions = questions.filter((item) => !existingQuestionTexts.has(item.question));

  if (newQuestions.length === 0) {
    console.log(`ℹ️ ${existingQuestionCount} assessment questions already exist.`);
    return;
  }

  await prisma.assessmentQuestion.createMany({
    data: newQuestions.map((item) => ({
      skillId: skillIds.get(item.skillName)!,
      question: item.question,
      options: item.options,
      correctAnswer: item.correctAnswer,
      explanation: item.explanation,
      difficulty: item.difficulty,
    })),
  });

  console.log(`✅ ${newQuestions.length} new assessment questions created.`);
  console.log("🎉 Assessment question bank completed.");
}

main()
  .catch((error) => {
    console.error("❌ Assessment seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
