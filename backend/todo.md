## Github
1. ~~Get repo details from github~~
2. ~~Get list of all files in the repo~~
3. ~~Vett out porper frontend files, aka ignore all backend files or anything related to backend.~~
4. ~~Take files and store it in a database, first just store names and only store needed files~~
<br> What do I need to do now, next exact step?

6. ~~Push things to github~~
7. Setup the AI and all needed for this.
8. What files to feed to agent? On what basis do I retrieve or select project? There can be multiple projects for a user so I guess select on name of the project for 
that particular user?


## Thinking
How do I go about feeding this files to the agent to gain the file context?
<br> First think what decisions the AI needs to make when going about generating frontend componenets?
<br>So I need to make sure about
<br>css structuring(border radius margin padding etc)
<br>color scheme(what color goes where)
<br> Typography but only for large pages and not functional components
<br> _Will do it later_

What all agents I need and how will those agents work?
I have css files and logic files with tailwind css.
I need an AI agent to make descions about css padding margin color scheme

File content will only be received when The files are ready to be fed to the AI, so the repo file will use RepoFile interface which has path, content and type.
So need to modify in the beginning keeps the content null.

Right now will parse through each file and geather context from it, how? just ask zi AI to extract important stuff from it.
First go through the file and think what is the consistent thing in this file which I might need to replicate in other things if I am making design component of this same pattern and what nawt yk.

