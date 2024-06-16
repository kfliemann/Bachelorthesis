# Bachelorthesis
<b>Design and implementation of an assessment analytics dashboard for a web-based
Learning Management System</b>

I contributed to the project "Heterogenität braucht Freiraum in den Lernangeboten" from the department "Operating systems and Distributed Systems". 
I developed an assessment analytics dashboard based on theories from the field of item analysis in psychology to assist professors in evaluating how well their tasks assess students' knowledge. 
The dashboard identifies tasks through statistical analysis that may not effectively measure student understanding, allowing professors to revise these tasks directly. 
The ultimate goal is to provide students with the best possible exercises to maximize their learning success.

## Frontend
<b> The Frontend is written in Angular </b> <br>
The given example shows off the visualisation of the statistics page of a given task.
![hefl site](https://github.com/kfliemann/Bachelorthesis/assets/39403385/8493fd31-7987-4252-805f-ac6752057147)




## Backend
<b> The Backend is written in NestJs with Prisma as a middleware between the server and the database </b>

## Data Generator
In order to evaluate data during the project development without relying on students to answer tasks or manually creating dummy data, I developed a Data Generator in PHP. <br> 
The generator can create users and questions, and it can simulate users answering these questions randomly yet realistically in a skillbased way to produce valid test data for the statistical analyses used.
