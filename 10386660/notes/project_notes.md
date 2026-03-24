## Step 1 – Initial setup

The project was planned as a full-stack web application using JavaScript.  
Visual Studio Code was selected as the main development environment because it supports both backend and frontend work in one place.  

The application architecture was planned in two main parts:
- server side with Node.js, Express and SQLite
- client side with React and Vite

This approach was chosen because the assessment brief requires REST API development, front-end integration, login and session handling, map display with Leaflet, and a modular backend structure for higher grades.

A starter SQLite database was provided and examined before development. The database already included the required tables: users, tours, availability and bookings. This made it possible to design the server logic around the expected schema from the beginning.

## Step 2 – Backend initialisation

The server-side environment was initialised with npm inside the server folder.  
A package.json file was created to manage dependencies and scripts.  
Core backend libraries were installed, including Express for the server, sqlite3 for database access, express-session for login sessions, cors for frontend-backend communication, helmet for security headers, and nodemon for development workflow.

At this stage, the first issue appeared: the development script was missing from package.json. This was fixed by manually adding the required npm scripts for start and dev execution.

## Step 3 – Database connection and first API routes

A dedicated database connection file was created for SQLite access.  
This made it possible to separate database configuration from the main application file and reuse one connection across the backend.

The backend structure was then divided into:
- DAO layer for database queries
- controller layer for request handling
- router layer for endpoint definitions

The first implemented features focused on reading tour data from the database.  
Two initial API endpoints were created:
- one for retrieving all tours
- one for filtering tours by city

Prepared statements were used in SQL queries to support safer database access and reduce the risk of SQL injection.

## Step 4 – First successful server and database test

After correcting the routing issue, the Express server started successfully on port 3000 and connected to the SQLite database.  
This confirmed that the initial backend setup was working correctly.

The API was then tested directly in the browser using JSON responses.  
This allowed the project to verify that the tours table could be accessed through REST endpoints before moving on to more advanced filtering and booking features.

## Step 5 – Search by city and theme

The tour search functionality was extended to support filtering by both city and theme, matching the assessment requirement more closely.

A query-based endpoint was added so that the frontend can send flexible search requests using URL parameters.  
This made the API more realistic for later React integration, because search forms typically send user input as query strings.

Basic validation was also added at controller level.  
If the required search values are missing, the server returns a clear error message with HTTP status 400 instead of trying to run an incomplete query.

## Step 6 – Availability endpoint

The next backend feature focused on the availability table, which stores dates and remaining places for each tour.

A dedicated endpoint was created to return availability records for a selected tour.  
This is important for the booking workflow, because users must be able to choose from valid dates before submitting a reservation.

The data was ordered by date to make it easier to display in the frontend later.

## Step 7 – Fixing the availability query

The first version of the availability query failed because the SQL statement used incorrect column names.  
After checking the actual database schema, the query was corrected to match the real field names used in the provided SQLite database.

This highlighted the importance of validating backend assumptions against the database structure instead of relying on guessed naming conventions.

## Step 8 – First booking endpoint

A POST endpoint was added to support booking creation.
This was the first write operation in the application and marked an important step from read-only API behaviour to transactional functionality.

Validation was added before inserting data into the database to ensure that all required values were present and that the number of guests was valid.

The endpoint was tested using an API testing tool inside Visual Studio Code, which made it possible to send JSON requests and inspect responses during backend development.

## Step 9 – Adjusting the booking logic to the real database schema

The first booking implementation failed because the assumed column names did not match the actual structure of the provided bookings table.

After checking the database schema, the booking logic was redesigned to use the real fields: tourID, theDate, username and visitors.
This ensured that the API matched the supplied database instead of relying on guessed naming conventions.

## Step 10 – Booking logic with availability update

The booking process was extended so that it no longer only inserts a reservation record.
Before creating a booking, the system now checks whether the selected tour and date exist in the availability table and whether there are enough remaining places.

If the booking is valid, the reservation is inserted and the number of available places is reduced accordingly.
This moved the backend from simple data insertion to actual business logic handling.

## Step 11 – Handling real date format from the database

During booking validation, a mismatch was found between the date format expected in the request and the format actually stored in the availability table.

The database stored dates in a shortened numeric format rather than a standard ISO date string.  
This required the booking request to use the exact stored value so that availability checks could match correctly.

## Step 12 – Booking retrieval endpoints

After implementing booking creation, additional read endpoints were added for reservation data.  
One endpoint returns all bookings, while another filters bookings by username.

This improved testability during development and created a useful foundation for a future user-facing booking history page in the frontend.

## Step 13 – Login and session handling

Authentication was introduced using Express sessions.  
A login endpoint was created to validate user credentials against the users table and store the authenticated user in the session.

Additional endpoints were added to check the current logged-in user and to destroy the session during logout.  
A dedicated authentication middleware was also introduced so that protected actions, such as creating a booking, can only be performed by logged-in users.

## Step 14 – Frontend initialisation with React and Vite

After the backend foundation was completed, a separate frontend application was created using React and Vite.

This approach was chosen because it supports modern component-based interface development and aligns well with the higher-grade expectations of the assessment brief.  
The initial client setup was kept simple at first so that communication with the backend could be tested incrementally.

## Step 15 – First frontend-backend integration

The React frontend was connected to the backend API for the first time using the fetch API.

Tour data was requested from the /api/tours endpoint when the page loaded, then stored in React state and rendered dynamically on screen.  
This confirmed that the frontend and backend were communicating correctly and that database content could be displayed through the user interface.

## Step 16 – Search form in React

A search form was added to the React frontend so that users can filter tours by city and theme.

The form sends search requests to the backend API and dynamically updates the displayed results without reloading the page.  
Validation was also added on the frontend side to prevent incomplete searches when only one of the two required filter fields is entered.

## Step 17 – Case-insensitive search improvement

The search logic was improved so that city and theme matching no longer depends on exact capitalisation.

This change improves usability because users can enter values in lowercase or mixed case without affecting the search result.  
The backend query was updated to compare values in a case-insensitive way.

## Step 18 – Frontend login and session handling

The React frontend was extended with a login form connected to the backend authentication endpoints.
The application now sends login data to `/api/auth/login` and checks the active session using `/api/auth/me`.
Session cookies are included in requests, so the logged-in user can remain authenticated after refreshing the page.
A logout function was also added using `/api/auth/logout`.

## Step 19 – Testing session persistence

The authentication system was tested to confirm that user sessions persist correctly.
After logging in, the page was refreshed and the logged-in user remained recognised by the frontend.
This confirmed that session data was stored correctly and could be retrieved through `/api/auth/me`.
The logout process was also tested to ensure that the session was properly destroyed.

## Step 20 – Session persistence test completed

The login session was tested by refreshing the page and reopening the application in the browser.
In both cases, the logged-in user remained authenticated and visible in the interface.
This confirmed that the session cookie and `/api/auth/me` endpoint were working correctly together.
The authentication state is therefore persistent across page reloads and browser restart.

## Step 21 – Fixing frontend authentication display and booking payload

The React frontend was updated to correctly handle the structure of the authentication response returned by the backend.
This fixed the issue where the session existed but the logged-in username was not displayed in the interface.
The booking request was also corrected by including the `username` field in the POST body, because the backend validation required `tourID`, `theDate`, `username` and `visitors`.
After this fix, the frontend became compatible with the existing backend booking format.

## Step 22 – Improving flexible tour search

The search feature was improved so that users do not need to enter both city and theme at the same time.
The application can now support searching by city only, theme only, or both fields together.
This makes the search function more flexible and user-friendly, because users can find tours even when they only know one search value.
The change improves usability and makes the interface behave more like a real booking system.

## Step 23 – Making the search route flexible

The backend search route was improved so that it no longer requires both city and theme values at the same time.
The route now supports searching by city only, theme only, both values together, or no filters at all.
If no filters are provided, all tours are returned.
This makes the search feature more practical and significantly improves user experience.

## Step 24 – Adding Leaflet map display

A map view was added to the React front end using Leaflet and OpenStreetMap.
All tours returned by the current search are now displayed as markers on the map.
Clicking a marker shows the tour title and theme, which satisfies the core map display requirement from the brief.
This improves the usability of the application and gives users a visual way to explore tour results.

## Step 25 – Adding booking controls to map popups

The map popups were extended so that users can interact with tours directly from the Leaflet map.
When a marker is clicked, the application loads availability for that specific tour and displays a booking form inside the popup.
The popup now allows the user to choose an available date and enter the number of visitors before submitting the booking request.
This change improves usability and aligns the interface more closely with the validation and user experience requirements of the brief.

## Step 26 – Strengthening booking validation in the backend

The booking controller was improved to apply stricter validation before creating a booking.
The system now rejects bookings for past dates, checks that the date uses the correct format, and ensures that the requested number of visitors does not exceed the number of remaining places.
More meaningful HTTP responses were also added, including 400 for invalid input, 403 for unauthorised booking attempts, 404 when no matching availability exists, and 409 when there are not enough places left.
This makes the booking process more robust and aligns the application more closely with the validation requirements from the brief.

## Step 27 – Adding a “My Bookings” view

A new user-facing bookings section was added to the React front end.
Logged-in users can now load and view their own bookings using the `/api/bookings/user/:username` endpoint.
The interface displays key booking details such as booking ID, tour ID, date, username and number of visitors.
This makes the system more complete from the user perspective because bookings can now be created and reviewed within the same application.

## Step 28 – Improving backend architecture with validation middleware

The backend booking flow was refactored to better match a layered Express architecture.
A new validation middleware was introduced to handle booking input checks before the request reaches the controller.
The authentication middleware was also extended so that users can only access their own booking data unless they are administrators.
As a result, the routes now separate authentication, validation, controller logic and DAO access more clearly, which improves modularity and better supports the Part H requirements.

## Step 29 – Preparing the app for final submission on port 3000

The application structure was updated so that the Express server can serve the built React front end directly.
This is important because the assessment brief requires the main application page to load from `http://localhost:3000` and all functionality must be reachable from there.
Serving the front end through Express makes the project easier to run and test in a standard environment.
It also reduces submission risk by aligning the application more closely with the hand-in requirements.

## Step 30 – Adding booking cancellation for users

The booking system was extended so that logged-in users can cancel their own bookings from the “My Bookings” section.
A new DELETE endpoint was added in the backend and connected to the React interface through a “Cancel Booking” button.
When a booking is removed, the corresponding number of places is returned to the related availability record, so the system stays consistent.
This makes the application more complete by allowing users to both create and manage their own bookings.

## Step 31 – Adding admin tools to create and delete tours

The system was extended with administrator-only tour management features.
An admin can now create a new tour by entering the tour details, UK coordinates, a list of future dates in YYMMDD format and the number of places available for each date.
The backend creates the main tour record and automatically generates matching availability entries for all submitted dates.
An admin can also delete a tour, but only if no bookings already exist for that tour, which helps protect data consistency.

## Step 32 – Simplifying admin tour creation with map-based location selection

The administrator tour form was improved by adding an interactive map for location selection.
Instead of typing latitude and longitude manually, the admin can now click a point on the UK map and the coordinates are filled in automatically.
This reduces data entry errors and makes the tour creation process faster and more user-friendly.
The manual coordinate fields were still kept as a fallback in case minor adjustments are needed.

