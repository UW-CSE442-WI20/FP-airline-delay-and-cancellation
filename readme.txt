--------------------------------------------------Design Description---------------------------------------------------

For this project, we decided to provide users suggestions on when to fly between the two desired chosen locations.
The website would first asks users to input the origin airport name (abbreviations or the full names), then the same
for the destination airport.

Our biggest struggle in the beginning was to get the data loaded. At first we chose to load the whole data file 
(which was from 2008 to 2018, each was approximately 3GBs). Yet, we found that it would be helpful to break the data 
files into multiple even smaller files by the airport names, delete unneeded data points and reduce the years down to 
only from 2014 to 2018. This way, we only load the small file that is included in the origin input whenever the user finishes 
their selections.

After the user puts down the desired origin and destination, different types of charts would be shown below for users to 
interact with. Our idea is to having 3 main charts:

1. A customized line chart, which provides the users with information on the average delay time from the two selected 
locations, varying by the names of the airlines. There is a slide-bar for users to choose the range of years they want to 
look at, with each line represents a different airline, besides there would also a list of the airlines that have the highest 
average delay times for further reference.

2. Two pie charts, each represents the number of delay flights in the morning and in the evening. Each pie chart resembles 
the clock, with each equal section points at a different hour on the clock (from 1 to 12). From each of the equal section, 
there would be a bar with the magnitude showing the number of delay flights in total.

3. A donut pie chart represents the number of flight cancellation. The idea was that we would have a small pie chart that 
shows users the percentage of flight cancellation compared to flight non-cancellation, along with a big pie chart dedicated 
to showing the number of different cancellation reasons. We intend to apply some animations on the donut pie chart as well.

