--------------------------------------------------Design Description---------------------------------------------------

For this project, we decided to provide users suggestions on when to fly between the two desired chosen locations.
The website would first asks users to input the origin airport name (abbreviations or the full names), then the same
for the destination airport.

Our biggest struggle in the beginning was to get the data loaded. At first we chose to load the whole data file 
(which was from 2008 to 2018, each was approximately 3GBs). Yet, we found that it would be helpful to break the data 
files into multiple even smaller files by the airport names, delete unneeded data points and reduce the year down to 
only from 2014 to 2018.
