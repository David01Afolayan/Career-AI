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
  question("HTML & CSS", "A page looks correct on desktop but overlaps on mobile. Which tool should be used first?", ["Browser DevTools responsive device mode", "A database migration tool", "A Git remote URL", "A server package manager"], 0, "Responsive device mode lets developers inspect breakpoints and layout behavior at mobile widths.", "Intermediate"),
  question("JavaScript", "Which tool can step through JavaScript execution and inspect variable values at a breakpoint?", ["Browser DevTools debugger", "Docker Compose", "pgAdmin", "GitHub Issues"], 0, "The browser debugger supports breakpoints, stepping and runtime inspection.", "Intermediate"),
  question("React", "A React form needs automated interaction tests in a browser-like environment. Which tool is appropriate?", ["React Testing Library with Jest or Vitest", "Wireshark", "Terraform", "Maven"], 0, "React Testing Library tests user interactions while Jest or Vitest runs the test suite.", "Intermediate"),
  question("Next.js", "Which tool is useful for testing a Next.js page flow such as login, navigation and form submission?", ["Playwright", "Valgrind", "DBeaver", "nslookup"], 0, "Playwright automates realistic browser journeys across pages and devices.", "Advanced"),
  question("Node.js", "An API must be tested with invalid input and authentication failures. What should be added?", ["Automated integration tests using a tool such as Supertest", "Only a screenshot of the API", "A CSS animation", "A database backup"], 0, "Integration tests verify HTTP behavior, validation and authorization at the API boundary.", "Advanced"),
  question("Python", "A Python service needs repeatable unit tests in a CI pipeline. Which tool is commonly used?", ["pytest", "Figma", "Docker Hub only", "Wireshark"], 0, "pytest provides test discovery, fixtures and assertions for Python projects.", "Beginner"),
  question("Java", "An Android developer wants to preview layouts and run an emulator. Which tool is central to that workflow?", ["Android Studio", "pgAdmin", "Grafana Loki", "Postman only"], 0, "Android Studio provides Android project tooling, layout previews, debugging and emulators.", "Beginner"),
  question("C++", "A developer needs to inspect a C++ program while it is paused at a breakpoint. Which tool is appropriate?", ["GDB or an IDE debugger", "Swagger UI", "Docker Compose", "Jupyter Notebook"], 0, "A native debugger can pause execution and inspect stack frames, variables and memory.", "Intermediate"),
  question("SQL", "A developer wants to apply schema changes consistently across environments. What should be used?", ["Versioned database migrations", "Manual edits in production only", "A browser bookmark", "A CSS utility class"], 0, "Versioned migrations make database structure changes repeatable and reviewable.", "Intermediate"),
  question("Data Analysis", "A stakeholder needs an interactive dashboard instead of a one-time chart. Which tool category is suitable?", ["A dashboard tool such as Power BI or Tableau", "A compiler debugger", "A Git merge conflict", "A container registry"], 0, "Dashboard tools support interactive filtering, reporting and stakeholder exploration.", "Intermediate"),
  question("Machine Learning", "A model is deployed as an API and its accuracy changes over time. Which practice helps detect the issue?", ["Model monitoring for drift and performance", "Deleting old predictions", "Changing the UI color", "Disabling logs"], 0, "Monitoring input drift and outcome performance reveals when a deployed model degrades.", "Advanced"),
  question("Networking", "A service is reachable internally but unavailable from the internet. Which tools help investigate the boundary?", ["Firewall rules, curl, and service health checks", "A text editor and CSS inspector", "A Java compiler only", "A spreadsheet formula"], 0, "Connectivity at the boundary requires checking firewall policy and externally observable health.", "Advanced"),
  question("Cybersecurity", "A security team wants to scan an authorized web application for common vulnerabilities. Which tool is appropriate?", ["OWASP ZAP", "A package formatter", "A SQL migration", "A mobile emulator"], 0, "OWASP ZAP supports authorized web security testing and vulnerability discovery.", "Advanced"),
  question("Docker", "A team wants every pull request to build an image and run tests automatically. Which tools fit this workflow?", ["Docker with GitHub Actions or another CI runner", "Only a local text editor", "A database GUI without CI", "A browser history panel"], 0, "Container builds and tests can be automated in CI for consistent verification.", "Intermediate"),
  question("Git & GitHub", "Before merging a feature, what should a developer use to review changes with teammates?", ["A pull request with CI checks and code review", "A local folder rename", "A screenshot without code", "A deleted branch"], 0, "Pull requests provide review discussion, status checks and a traceable merge decision.", "Beginner"),
  question("Communication", "A team needs to agree on an API contract before implementation. Which artifact is most useful?", ["An OpenAPI specification with example requests and responses", "An unshared verbal promise", "A random log file", "A CSS color palette"], 0, "A shared API contract aligns teams on endpoint behavior and data formats.", "Intermediate"),
  question("Problem Solving", "A production incident requires identifying when a failure began. Which combination is most useful?", ["Monitoring dashboards, logs, traces and deployment history", "Only a developer's memory", "A new logo", "A random code rewrite"], 0, "Correlating telemetry with deployments helps establish timeline and likely cause.", "Advanced"),
  question("HTML & CSS", "A form is difficult to use with a keyboard. Which tool helps check accessibility issues in the browser?", ["Lighthouse or axe DevTools", "Docker logs", "A SQL query planner", "A Git tag"], 0, "Accessibility auditing tools identify keyboard, contrast, semantic and labeling issues.", "Intermediate"),
  question("JavaScript", "A web application must support older browsers. Which tool helps identify unsupported JavaScript features?", ["Browserslist with a compatibility tool such as Babel", "Wireshark", "pgAdmin", "Android Studio"], 0, "Browserslist and Babel help target supported browsers and transpile incompatible syntax.", "Intermediate"),
  question("React", "A React component receives data from an API and must show loading, success and failure states. What should be tested?", ["The complete state transition for each request outcome", "Only the success screenshot", "The database schema only", "The Git branch name"], 0, "Testing each asynchronous state verifies the component behaves correctly for real users.", "Intermediate"),
  question("Next.js", "A public content page changes rarely and should load quickly. Which Next.js approach is suitable?", ["Static generation or incremental static regeneration", "Fetching everything on every client render", "Disabling caching everywhere", "Putting content in browser local storage only"], 0, "Static generation and ISR reduce repeated server work while keeping content deployable.", "Advanced"),
  question("Node.js", "A Node.js API is deployed behind a reverse proxy. Which production feature should be configured?", ["Health checks, graceful shutdown and request timeouts", "Unlimited request bodies", "Logging passwords", "Ignoring termination signals"], 0, "These controls improve safe deployments, resilience and protection from stalled requests.", "Advanced"),
  question("Python", "A Python application has conflicting package versions between developers. Which practice improves consistency?", ["Pin dependencies in a lock or requirements file and use isolated environments", "Install packages globally without versions", "Copy site-packages manually", "Ignore the runtime version"], 0, "Pinned dependencies and isolated environments make development and deployment reproducible.", "Beginner"),
  question("Java", "A Java service consumes too much memory in production. Which tool can help inspect heap usage?", ["Java Flight Recorder or VisualVM", "Browser DevTools only", "A CSS linter", "A DNS lookup"], 0, "Java profiling tools expose heap, CPU, thread and runtime behavior.", "Advanced"),
  question("C++", "A C++ program crashes only in production builds. Which practice helps investigate undefined behavior?", ["Run sanitizers and collect a symbolized stack trace", "Remove all assertions", "Disable compiler warnings", "Change the UI theme"], 0, "Sanitizers and symbolized traces help locate memory and undefined-behavior defects.", "Advanced"),
  question("SQL", "A payment operation may be retried by a client. Which database technique helps prevent duplicate records?", ["A transaction with a unique constraint or idempotency key", "Removing all constraints", "Running two inserts at once", "Using a random table name"], 0, "Transactions and uniqueness enforce safe repeatable operations.", "Advanced"),
  question("Data Analysis", "A dashboard metric suddenly doubles after a pipeline change. Which tool should be checked first?", ["Data-quality checks and pipeline lineage", "The font selector", "A mobile emulator", "A Git avatar"], 0, "Data-quality tests and lineage reveal whether duplication entered during transformation or ingestion.", "Advanced"),
  question("Machine Learning", "A model API is slow for individual predictions. Which tool helps locate the bottleneck?", ["Application profiling and request tracing", "A CSS reset", "A Git merge message", "A spreadsheet border tool"], 0, "Profilers and traces show time spent in preprocessing, inference and downstream calls.", "Advanced"),
  question("Networking", "Users report intermittent timeouts between services. Which observability signal is most useful alongside logs?", ["Distributed traces with latency and error spans", "A code formatter", "A static image", "A local bookmark"], 0, "Distributed traces show where timeouts occur across service boundaries.", "Advanced"),
  question("Cybersecurity", "A team wants to manage production secrets without placing them in source control. What should be used?", ["A secrets manager such as Vault or a cloud secret service", "A public README", "A frontend constant", "A Git commit message"], 0, "Secrets managers provide controlled storage, access policies and rotation.", "Beginner"),
  question("Docker", "A containerized service should run with limited permissions. Which practice is recommended?", ["Use a non-root user and a read-only filesystem where possible", "Run every process as root", "Embed credentials in the image", "Expose every port"], 0, "Least privilege reduces the impact of a compromised container.", "Advanced"),
  question("Git & GitHub", "A release needs a reproducible source reference after deployment. What should be created?", ["A versioned tag or release", "An unnamed local stash", "A deleted branch", "An untracked temporary file"], 0, "Tags and releases identify the exact source version used for deployment.", "Beginner"),
  question("Communication", "A technical incident affects customers. What should an incident update include?", ["Impact, current status, mitigation and the next update time", "Unverified blame", "Only internal jargon", "A promise that no issue occurred"], 0, "Clear status updates help stakeholders understand impact and expected follow-up.", "Intermediate"),
  question("Problem Solving", "A proposed fix solves the symptom but may hide the root cause. What should happen next?", ["Add a regression test and investigate the underlying failure", "Delete the issue", "Remove monitoring", "Deploy without review"], 0, "Regression tests protect the fix while root-cause analysis prevents recurrence.", "Advanced"),
  question("HTML & CSS", "A product team requires the interface to meet WCAG contrast guidance. Which tool can provide an initial automated check?", ["Lighthouse accessibility audit", "A container registry", "A database migration runner", "A Git tag"], 0, "Lighthouse can flag many automated accessibility and contrast issues.", "Beginner"),
  question("JavaScript", "A search box sends a request on every keystroke and overloads the API. Which browser-side technique helps?", ["Debouncing the input handler", "Disabling HTTPS", "Clearing the DOM on every key", "Adding random delays"], 0, "Debouncing waits for a pause before sending the request, reducing unnecessary calls.", "Intermediate"),
  question("React", "A large table causes slow scrolling in a React dashboard. Which technique should be considered?", ["Virtualizing the visible rows", "Rendering every row twice", "Disabling browser caching", "Moving styles into database records"], 0, "Virtualization renders only visible rows and reduces DOM work.", "Advanced"),
  question("Next.js", "A deployment must expose different API URLs for development and production. Which practice is correct?", ["Use environment variables with server/client exposure controlled intentionally", "Hard-code production secrets in the component", "Put credentials in CSS", "Use the same URL without configuration"], 0, "Environment configuration separates deployments and prevents sensitive values from entering client bundles.", "Intermediate"),
  question("Node.js", "A service receives more traffic than one process can handle. Which production approach can improve capacity?", ["Run multiple instances behind a load balancer", "Increase console logging indefinitely", "Disable request validation", "Store sessions only in process memory"], 0, "Multiple instances and load balancing distribute requests and improve availability.", "Advanced"),
  question("Python", "A background Python job may take several minutes and should not block a web request. Which architecture is suitable?", ["A task queue with a worker such as Celery or RQ", "A synchronous loop inside the request handler", "A browser alert", "A CSS animation"], 0, "A worker queue moves long-running work outside the request-response cycle.", "Advanced"),
  question("Java", "A Java application must expose metrics for production monitoring. Which approach is common in Spring applications?", ["Spring Boot Actuator with a metrics backend", "A static HTML comment", "A Git stash", "A CSS framework"], 0, "Actuator exposes health and metrics endpoints that monitoring systems can collect.", "Intermediate"),
  question("C++", "A C++ application needs a reproducible cross-platform build. Which tool helps define and generate builds?", ["CMake", "Postman", "Lighthouse", "OpenAPI"], 0, "CMake generates build configurations for multiple platforms and toolchains.", "Beginner"),
  question("SQL", "Two users attempt to reserve the last available item at the same time. What protects the inventory count?", ["A transaction with suitable isolation or row locking", "A client-side warning only", "A CSS class", "A second unvalidated form"], 0, "Database transactions and locking prevent conflicting updates from overselling inventory.", "Advanced"),
  question("Data Analysis", "A data pipeline receives a new column that changes the meaning of an existing metric. What should happen?", ["Validate the schema and update metric definitions with stakeholders", "Silently ignore the change", "Delete historical data", "Change the chart title only"], 0, "Schema and semantic changes must be validated so reports remain trustworthy.", "Advanced"),
  question("Machine Learning", "A classifier performs well overall but misses a minority class. Which evaluation should be added?", ["Per-class precision, recall and a confusion matrix", "Accuracy only", "Training loss only", "A UI color comparison"], 0, "Class-level metrics reveal failures hidden by aggregate accuracy.", "Intermediate"),
  question("Networking", "A service uses HTTPS but clients report certificate errors after a deployment. What should be checked?", ["Certificate chain, hostname and expiration", "The SQL join order", "The CSS bundle", "The Git commit emoji"], 0, "TLS clients validate certificate identity, chain trust and validity period.", "Intermediate"),
  question("Cybersecurity", "An application accepts uploaded files from users. Which control is important?", ["Validate type and size, store outside executable paths, and scan uploads", "Trust the filename extension alone", "Execute every uploaded file", "Store files with public write access"], 0, "Upload validation, safe storage and scanning reduce malicious-file risk.", "Advanced"),
  question("Docker", "A Docker image contains a vulnerable operating-system package. What should the team do?", ["Rebuild from an updated base image and scan the resulting image", "Ignore it if the app starts", "Hide the package from logs", "Publish the image unchanged"], 0, "Updated base images and image scanning address known package vulnerabilities.", "Intermediate"),
  question("Git & GitHub", "A deployment should occur only after tests and approval succeed. Which workflow supports this?", ["Protected branches with required checks and environment approvals", "Direct pushes to production", "Skipping pull requests", "Deleting CI configuration"], 0, "Branch protection and deployment approvals enforce reliable release controls.", "Advanced"),
  question("Communication", "A developer discovers a deadline risk during implementation. What is the most professional action?", ["Raise it early with evidence, options and a revised estimate", "Hide it until the deadline", "Blame the requirements", "Stop communicating"], 0, "Early, evidence-based communication gives the team time to choose a trade-off.", "Beginner"),
  question("Problem Solving", "A fix passes locally but fails in CI. What should be compared first?", ["Runtime versions, dependencies, environment variables and test setup", "Only the monitor resolution", "The project logo", "Unrelated source files"], 0, "Environment differences commonly explain local-versus-CI failures.", "Intermediate"),
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
