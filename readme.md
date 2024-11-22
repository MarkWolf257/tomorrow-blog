# Tomorrow Blog or Tom's Blog
A simple CMS blog project. This project was created with the intention of learning new concepts and technologies. This project is in no way complete or practically applicable as is but can be used as a base to create a more robust and feature rich CMS if required.


## Learning Objectives
My initial plan was to learn the following concepts and technologies:
- jwt authentication
- an SQL database
- htmx
- express

Along the way, I learned a few more things out of both necessity and curiosity:
- template engine (pug)
- docker and containerization
- handling file uploads
- a little bit of cybersecurity


## Features of the project
In its current stage which is likely to remain that way, the app can:

### Signup and Login
The app can store user data and generate jwt tokens on login. The jwt token is either valid for the session or 7 days. This is not very secure as the token is not a unique one and token expiration depends on the client. I must remember a few points next time to make it more secure:
- Add creation time or expiration time in the token to generate unique tokens every time.
- Validate that time on the server side, so the token can't be exploited.
- Decrease jwt token expiry to 15 minutes or something short and use refresh tokens to get new ones.
- Refresh tokens should last 30 days and server should make sure that only one person has the refresh token and jwt token.
- More research needs to be done to support multiple logins with this flow.
- Also add a forgot password option

### Update Profile
The profile page allows user to upload profile picture and update name and description. There is no option to change email or password.

### Post Articles
The editor is a simple, default quilljs editor with it's toolbar. It only allows basic features like bold, italic, headings, etc. Font cannot be changed. Images cannot be added to the article except a thumbnail that is required. The posted articles cannot be edited or deleted.

### Browse Articles
The articles are displayed in the home page as a grid. Opening an articles displays the contents and some information about the author. I also intended to create a comment section but realized it was far more complex to be spent time on right now.


## Why not implement those missing features?
It may be tempting to implement the missing features with many of them barely taking an hour or two, but it is important to understand that the intention was never to create a complete and shippable software product but to learn from the process. So, it is important to have time restrictions on personal projects so as not to spend more time than is necessary. Implementing those features teach me nothing that I haven't already figured out. Also, it is likely that I will come across them again in future projects.